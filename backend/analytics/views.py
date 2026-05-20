from __future__ import annotations

from collections import defaultdict
from io import BytesIO
from pathlib import Path
import os
from typing import Iterable

from django.db.models import Count, Q, QuerySet
from django.http import HttpResponse
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status

from alumni.models import AcademicGroup, AlumniProfile
from employers.models import Employer


REPORT_TITLE = (
    "Отчет по трудоустройству выпускников кафедры "
    "«Информационные системы и технологии имени академика А. Жайнакова»"
)


class IsAdminUserRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == request.user.Roles.ADMIN)


def _percent(numerator: int, denominator: int) -> float:
    return round((numerator / denominator) * 100, 1) if denominator else 0.0


def _count_with_percent(count: int, denominator: int) -> str:
    if not denominator:
        return f"{count} / 0%"
    value = _percent(count, denominator)
    return f"{count} / {value}%"


def _apply_profile_filters(qs: QuerySet[AlumniProfile], request) -> QuerySet[AlumniProfile]:
    """Apply the same report filters to analytics, PDF export and dashboard preview."""
    exact_filters = {
        "graduation_year": "graduation_year",
        "academic_group": "academic_group_id",
        "study_form": "study_form",
        "degree_level": "degree_level",
        "employment_status": "employment_status",
        "direction_code": "academic_group__direction_code",
    }
    for query_name, orm_name in exact_filters.items():
        value = request.query_params.get(query_name)
        if value:
            qs = qs.filter(**{orm_name: value})

    search = request.query_params.get("search")
    if search:
        qs = qs.filter(
            Q(user__first_name__icontains=search)
            | Q(user__last_name__icontains=search)
            | Q(user__email__icontains=search)
            | Q(user__username__icontains=search)
            | Q(academic_group__name__icontains=search)
            | Q(direction__icontains=search)
            | Q(profile__icontains=search)
            | Q(specialty__icontains=search)
            | Q(workplace__icontains=search)
            | Q(position__icontains=search)
        )
    return qs


class EmploymentStatsView(APIView):
    """
    Возвращает статистику трудоустройства по годам и сводку для диаграмм.
    Старые поля employed/unemployed сохранены для обратной совместимости.
    """
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        base_qs = _apply_profile_filters(AlumniProfile.objects.all(), request)
        qs = base_qs.values("graduation_year").annotate(
            total=Count("id"),
            surveyed=Count("id", filter=Q(is_surveyed=True)),
            employed_specialty=Count("id", filter=Q(employment_status=AlumniProfile.EmploymentStatus.EMPLOYED_SPECIALTY)),
            employed_not_specialty=Count("id", filter=Q(employment_status=AlumniProfile.EmploymentStatus.EMPLOYED_NOT_SPECIALTY)),
            self_employed=Count("id", filter=Q(employment_status=AlumniProfile.EmploymentStatus.SELF_EMPLOYED)),
            continuing_education=Count(
                "id",
                filter=(
                    Q(employment_status=AlumniProfile.EmploymentStatus.CONTINUING_EDUCATION)
                    | (Q(continuing_education_place__isnull=False) & ~Q(continuing_education_place=""))
                ),
            ),
            unemployed=Count("id", filter=Q(employment_status=AlumniProfile.EmploymentStatus.UNEMPLOYED)),
            lost_contact=Count("id", filter=Q(employment_status=AlumniProfile.EmploymentStatus.LOST_CONTACT)),
        ).order_by("graduation_year")

        result = {}
        status_distribution = defaultdict(int)
        for entry in qs:
            year = entry["graduation_year"] or "Без года"
            total = entry["total"]
            surveyed = entry["surveyed"] or total
            employed = entry["employed_specialty"] + entry["employed_not_specialty"] + entry["self_employed"]
            status_distribution["employed_specialty"] += entry["employed_specialty"]
            status_distribution["employed_not_specialty"] += entry["employed_not_specialty"]
            status_distribution["self_employed"] += entry["self_employed"]
            status_distribution["continuing_education"] += entry["continuing_education"]
            status_distribution["unemployed"] += entry["unemployed"]
            status_distribution["lost_contact"] += entry["lost_contact"]

            result[year] = {
                "total": total,
                "surveyed": surveyed,
                "employed": employed,
                "unemployed": entry["unemployed"],
                "employed_specialty": entry["employed_specialty"],
                "employed_not_specialty": entry["employed_not_specialty"],
                "self_employed": entry["self_employed"],
                "continuing_education": entry["continuing_education"],
                "lost_contact": entry["lost_contact"],
                "percent_employed": _percent(employed, surveyed),
                "percent_employed_specialty": _percent(entry["employed_specialty"], surveyed),
                "percent_employed_not_specialty": _percent(entry["employed_not_specialty"], surveyed),
                "percent_self_employed": _percent(entry["self_employed"], surveyed),
                "percent_continuing_education": _percent(entry["continuing_education"], surveyed),
                "percent_unemployed": _percent(entry["unemployed"], surveyed),
            }

        result["meta"] = {
            "total_employers": Employer.objects.count(),
            "status_distribution": dict(status_distribution),
        }
        return Response(result)


class EmploymentReportExportView(APIView):
    permission_classes = (IsAdminUserRole,)

    def get(self, request, export_format: str = "pdf"):
        export_format = export_format.lower().strip()
        if export_format == "doc":
            export_format = "docx"
        if export_format == "excel":
            export_format = "xlsx"

        profiles = self._filtered_profiles(request)
        filter_description = self._filter_description(request)

        if export_format == "pdf":
            return self._pdf_response(profiles, filter_description)
        if export_format == "docx":
            return self._docx_response(profiles, filter_description)
        if export_format == "xlsx":
            return self._xlsx_response(profiles, filter_description)

        return Response(
            {"detail": "Unsupported export format. Use pdf, docx or xlsx."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    def _pdf_response(self, profiles: list[AlumniProfile], filter_description: str) -> HttpResponse:
        buffer = BytesIO()
        font_name = self._register_font()
        styles = self._styles(font_name)

        doc = SimpleDocTemplate(
            buffer,
            pagesize=landscape(A4),
            leftMargin=8 * mm,
            rightMargin=8 * mm,
            topMargin=8 * mm,
            bottomMargin=8 * mm,
            title="employment_report",
        )
        story = []
        story.append(Paragraph(REPORT_TITLE, styles["ReportTitle"]))
        story.append(Paragraph(filter_description, styles["ReportSubTitle"]))
        story.append(Spacer(1, 6 * mm))
        story.append(Paragraph("Структура отчета", styles["ReportSection"]))
        story.append(Paragraph("Раздел 1. Реестр выпускников и сведения о занятости", styles["Normal"]))
        story.append(Paragraph("Раздел 2. Сводные показатели трудоустройства", styles["Normal"]))
        story.append(PageBreak())

        story.append(Paragraph(REPORT_TITLE, styles["ReportTitle"]))
        story.append(Paragraph(filter_description, styles["ReportSubTitle"]))
        story.append(Spacer(1, 4 * mm))
        story.append(Paragraph("Раздел 1. Реестр выпускников и сведения о занятости", styles["ReportSection"]))
        story.append(self._graduates_table(profiles, styles))
        story.append(PageBreak())

        story.append(Paragraph(REPORT_TITLE, styles["ReportTitle"]))
        story.append(Paragraph(filter_description, styles["ReportSubTitle"]))
        story.append(Spacer(1, 4 * mm))
        story.append(Paragraph("Раздел 2. Сводные показатели трудоустройства", styles["ReportSection"]))
        story.append(self._summary_table(profiles, styles))
        story.append(Spacer(1, 12 * mm))
        story.append(Paragraph("Зав. кафедрой «ИСТ им. акад. А. Жайнакова» ____________________", styles["Normal"]))

        doc.build(story)
        buffer.seek(0)
        response = HttpResponse(buffer.getvalue(), content_type="application/pdf")
        response["Content-Disposition"] = 'attachment; filename="employment_report.pdf"'
        return response

    def _filtered_profiles(self, request):
        qs = AlumniProfile.objects.select_related("user", "employer", "academic_group").order_by(
            "academic_group__graduation_year",
            "academic_group__name",
            "user__last_name",
            "user__first_name",
        )
        return list(_apply_profile_filters(qs, request))

    def _filter_description(self, request) -> str:
        parts = []
        year = request.query_params.get("graduation_year")
        group_id = request.query_params.get("academic_group")
        study_form = request.query_params.get("study_form")
        degree_level = request.query_params.get("degree_level")
        status = request.query_params.get("employment_status")
        direction_code = request.query_params.get("direction_code")
        search = request.query_params.get("search")
        if year:
            parts.append(f"год выпуска: {year}")
        if group_id:
            group = AcademicGroup.objects.filter(pk=group_id).first()
            parts.append(f"группа: {group.name if group else group_id}")
        if direction_code:
            parts.append(f"направление: {direction_code}")
        if study_form:
            parts.append(f"форма обучения: {dict(AcademicGroup.StudyForm.choices).get(study_form, study_form)}")
        if degree_level:
            parts.append(f"уровень: {dict(AcademicGroup.DegreeLevel.choices).get(degree_level, degree_level)}")
        if status:
            parts.append(f"статус: {dict(AlumniProfile.EmploymentStatus.choices).get(status, status)}")
        if search:
            parts.append(f"поиск: {search}")
        return "Фильтр: " + ", ".join(parts) if parts else "Фильтр: все группы и годы выпуска"

    def _register_font(self) -> str:
        paths = [
            os.getenv("PDF_FONT_PATH"),
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed.ttf",
        ]
        for path in paths:
            if path and Path(path).exists():
                pdfmetrics.registerFont(TTFont("ReportFont", path))
                return "ReportFont"
        return "Helvetica"

    def _styles(self, font_name: str):
        base = getSampleStyleSheet()
        base.add(ParagraphStyle(name="ReportTitle", fontName=font_name, fontSize=11, leading=14, alignment=TA_CENTER, spaceAfter=3 * mm))
        base.add(ParagraphStyle(name="ReportSubTitle", fontName=font_name, fontSize=8, leading=10, alignment=TA_CENTER, spaceAfter=2 * mm))
        base.add(ParagraphStyle(name="ReportSection", fontName=font_name, fontSize=10, leading=12, alignment=TA_LEFT, spaceBefore=2 * mm, spaceAfter=2 * mm))
        base.add(ParagraphStyle(name="Cell", fontName=font_name, fontSize=6.3, leading=7.3, alignment=TA_LEFT))
        base.add(ParagraphStyle(name="CellCenter", fontName=font_name, fontSize=6.3, leading=7.3, alignment=TA_CENTER))
        base["Normal"].fontName = font_name
        base["Normal"].fontSize = 8
        base["Normal"].leading = 10
        return base

    def _p(self, value, styles, center: bool = False) -> Paragraph:
        text = "—" if value in (None, "") else str(value)
        text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\n", "<br/>")
        return Paragraph(text, styles["CellCenter" if center else "Cell"])

    def _work_text(self, profile: AlumniProfile) -> str:
        company = profile.employer.company_name if profile.employer else profile.workplace
        parts = [part for part in (company, profile.position) if part]
        return "\n".join(parts) or "—"

    def _graduates_table(self, profiles: Iterable[AlumniProfile], styles) -> Table:
        header = [
            "№",
            "ФИО",
            "Группа",
            "Год",
            "Направление / профиль",
            "Форма",
            "По спец. (должность, место работы)",
            "Не по спец. / самозанятый",
            "Не работает / связь",
            "Продолжил обучение",
            "Полезно в работе",
            "Изучал самостоятельно",
        ]
        data = [[self._p(value, styles, center=True) for value in header]]
        for index, profile in enumerate(profiles, start=1):
            status = profile.employment_status
            full_name = profile.user.get_full_name() or profile.user.username
            group = profile.academic_group.name if profile.academic_group else "—"
            direction_profile = "\n".join(
                part for part in (profile.direction or profile.specialty, profile.profile) if part
            )
            work = self._work_text(profile)
            not_working = "—"
            if status == AlumniProfile.EmploymentStatus.UNEMPLOYED:
                not_working = "Не работает"
            elif status == AlumniProfile.EmploymentStatus.LOST_CONTACT:
                not_working = "Потеряна связь"
            data.append([
                self._p(index, styles, center=True),
                self._p(full_name, styles),
                self._p(group, styles, center=True),
                self._p(profile.graduation_year, styles, center=True),
                self._p(direction_profile, styles),
                self._p(profile.get_study_form_display() if profile.study_form else "—", styles, center=True),
                self._p(work if status == AlumniProfile.EmploymentStatus.EMPLOYED_SPECIALTY else "—", styles),
                self._p(work if status in (AlumniProfile.EmploymentStatus.EMPLOYED_NOT_SPECIALTY, AlumniProfile.EmploymentStatus.SELF_EMPLOYED) else "—", styles),
                self._p(not_working, styles),
                self._p(profile.continuing_education_place if status == AlumniProfile.EmploymentStatus.CONTINUING_EDUCATION or profile.continuing_education_place else "—", styles),
                self._p(profile.useful_subjects, styles),
                self._p(profile.self_study_topics, styles),
            ])

        table = Table(
            data,
            repeatRows=1,
            colWidths=[8 * mm, 29 * mm, 17 * mm, 12 * mm, 31 * mm, 16 * mm, 31 * mm, 29 * mm, 20 * mm, 26 * mm, 34 * mm, 29 * mm],
        )
        table.setStyle(self._table_style())
        return table

    def _summary_table(self, profiles: Iterable[AlumniProfile], styles) -> Table:
        buckets: dict[tuple[str, str, str, int | None], list[AlumniProfile]] = defaultdict(list)
        for profile in profiles:
            group_name = profile.academic_group.name if profile.academic_group else "Без группы"
            direction_code = profile.academic_group.direction_code if profile.academic_group else "—"
            profile_name = profile.profile or (profile.academic_group.profile if profile.academic_group else "—")
            buckets[(direction_code, profile_name, group_name, profile.graduation_year)].append(profile)

        header = [
            "Направление / профиль / группа",
            "Кол-во выпускников",
            "Кол-во опрошенных",
            "Работают по спец.",
            "Работают не по спец.",
            "Самозанятые",
            "Продолжили учебу",
            "Не работают",
            "Потеряна связь",
            "% выпуска к поступившим",
        ]
        data = [[self._p(value, styles, center=True) for value in header]]
        for (direction_code, profile_name, group_name, year), items in sorted(buckets.items(), key=lambda item: (item[0][0], item[0][1], item[0][2], item[0][3] or 0)):
            group = items[0].academic_group
            total_graduates = group.total_graduates if group and group.total_graduates else len(items)
            admission_count = group.admission_count if group else None
            surveyed = sum(1 for item in items if item.is_surveyed)
            denominator = surveyed or len(items)
            counts = defaultdict(int)
            continuing_count = 0
            for item in items:
                counts[item.employment_status] += 1
                if item.employment_status == AlumniProfile.EmploymentStatus.CONTINUING_EDUCATION or item.continuing_education_place:
                    continuing_count += 1
            graduation_percent = f"{_percent(total_graduates, admission_count)}%" if admission_count else "—"
            group_label = f"{direction_code}\n{profile_name}\n{group_name}, {year or 'без года'}"
            data.append([
                self._p(group_label, styles),
                self._p(total_graduates, styles, center=True),
                self._p(surveyed, styles, center=True),
                self._p(_count_with_percent(counts[AlumniProfile.EmploymentStatus.EMPLOYED_SPECIALTY], denominator), styles, center=True),
                self._p(_count_with_percent(counts[AlumniProfile.EmploymentStatus.EMPLOYED_NOT_SPECIALTY], denominator), styles, center=True),
                self._p(_count_with_percent(counts[AlumniProfile.EmploymentStatus.SELF_EMPLOYED], denominator), styles, center=True),
                self._p(_count_with_percent(continuing_count, denominator), styles, center=True),
                self._p(_count_with_percent(counts[AlumniProfile.EmploymentStatus.UNEMPLOYED], denominator), styles, center=True),
                self._p(_count_with_percent(counts[AlumniProfile.EmploymentStatus.LOST_CONTACT], len(items)), styles, center=True),
                self._p(graduation_percent, styles, center=True),
            ])

        table = Table(
            data,
            repeatRows=1,
            colWidths=[48 * mm, 22 * mm, 23 * mm, 27 * mm, 27 * mm, 23 * mm, 27 * mm, 23 * mm, 23 * mm, 29 * mm],
        )
        table.setStyle(self._table_style())
        return table

    def _text_value(self, value) -> str:
        return "—" if value in (None, "") else str(value)

    def _full_name(self, profile: AlumniProfile) -> str:
        return profile.user.get_full_name() or profile.user.username

    def _direction_profile_text(self, profile: AlumniProfile) -> str:
        return "\n".join(
            part for part in (profile.direction or profile.specialty, profile.profile) if part
        ) or "—"

    def _profile_row_values(self, profile: AlumniProfile, index: int) -> list[str | int | None]:
        status = profile.employment_status
        work = self._work_text(profile)
        not_working = "—"
        if status == AlumniProfile.EmploymentStatus.UNEMPLOYED:
            not_working = "Не работает"
        elif status == AlumniProfile.EmploymentStatus.LOST_CONTACT:
            not_working = "Потеряна связь"

        return [
            index,
            self._full_name(profile),
            profile.academic_group.name if profile.academic_group else "—",
            profile.graduation_year or "—",
            self._direction_profile_text(profile),
            profile.get_study_form_display() if profile.study_form else "—",
            work if status == AlumniProfile.EmploymentStatus.EMPLOYED_SPECIALTY else "—",
            work if status in (
                AlumniProfile.EmploymentStatus.EMPLOYED_NOT_SPECIALTY,
                AlumniProfile.EmploymentStatus.SELF_EMPLOYED,
            ) else "—",
            not_working,
            profile.continuing_education_place
            if status == AlumniProfile.EmploymentStatus.CONTINUING_EDUCATION or profile.continuing_education_place
            else "—",
            profile.useful_subjects or "—",
            profile.self_study_topics or "—",
        ]

    def _graduate_headers(self) -> list[str]:
        return [
            "№",
            "ФИО",
            "Группа",
            "Год",
            "Направление / профиль",
            "Форма",
            "По спец. (должность, место работы)",
            "Не по спец. / самозанятый",
            "Не работает / связь",
            "Продолжил обучение",
            "Полезно в работе",
            "Изучал самостоятельно",
        ]

    def _summary_headers(self) -> list[str]:
        return [
            "Направление / профиль / группа",
            "Кол-во выпускников",
            "Кол-во опрошенных",
            "Работают по спец.",
            "Работают не по спец.",
            "Самозанятые",
            "Продолжили учебу",
            "Не работают",
            "Потеряна связь",
            "% выпуска к поступившим",
        ]

    def _summary_row_values(self, profiles: Iterable[AlumniProfile]) -> list[list[str | int]]:
        buckets: dict[tuple[str, str, str, int | None], list[AlumniProfile]] = defaultdict(list)
        for profile in profiles:
            group_name = profile.academic_group.name if profile.academic_group else "Без группы"
            direction_code = profile.academic_group.direction_code if profile.academic_group else "—"
            profile_name = profile.profile or (profile.academic_group.profile if profile.academic_group else "—")
            buckets[(direction_code, profile_name, group_name, profile.graduation_year)].append(profile)

        rows: list[list[str | int]] = []
        for (direction_code, profile_name, group_name, year), items in sorted(
            buckets.items(),
            key=lambda item: (item[0][0], item[0][1], item[0][2], item[0][3] or 0),
        ):
            group = items[0].academic_group
            total_graduates = group.total_graduates if group and group.total_graduates else len(items)
            admission_count = group.admission_count if group else None
            surveyed = sum(1 for item in items if item.is_surveyed)
            denominator = surveyed or len(items)
            counts = defaultdict(int)
            continuing_count = 0
            for item in items:
                counts[item.employment_status] += 1
                if item.employment_status == AlumniProfile.EmploymentStatus.CONTINUING_EDUCATION or item.continuing_education_place:
                    continuing_count += 1
            graduation_percent = f"{_percent(total_graduates, admission_count)}%" if admission_count else "—"
            group_label = f"{direction_code}\n{profile_name}\n{group_name}, {year or 'без года'}"
            rows.append([
                group_label,
                total_graduates,
                surveyed,
                _count_with_percent(counts[AlumniProfile.EmploymentStatus.EMPLOYED_SPECIALTY], denominator),
                _count_with_percent(counts[AlumniProfile.EmploymentStatus.EMPLOYED_NOT_SPECIALTY], denominator),
                _count_with_percent(counts[AlumniProfile.EmploymentStatus.SELF_EMPLOYED], denominator),
                _count_with_percent(continuing_count, denominator),
                _count_with_percent(counts[AlumniProfile.EmploymentStatus.UNEMPLOYED], denominator),
                _count_with_percent(counts[AlumniProfile.EmploymentStatus.LOST_CONTACT], len(items)),
                graduation_percent,
            ])
        return rows

    def _docx_response(self, profiles: list[AlumniProfile], filter_description: str) -> HttpResponse:
        try:
            from docx import Document
            from docx.enum.section import WD_ORIENT
            from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT
            from docx.enum.text import WD_ALIGN_PARAGRAPH
            from docx.oxml import OxmlElement
            from docx.oxml.ns import qn
            from docx.shared import Cm, Pt
        except ImportError as exc:
            return Response(
                {"detail": f"DOCX export dependency is not installed: {exc}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        def set_landscape(section):
            section.orientation = WD_ORIENT.LANDSCAPE
            section.page_width, section.page_height = section.page_height, section.page_width
            section.left_margin = Cm(0.7)
            section.right_margin = Cm(0.7)
            section.top_margin = Cm(0.8)
            section.bottom_margin = Cm(0.8)

        def set_cell_text(cell, value, bold: bool = False, align_center: bool = False):
            cell.text = ""
            paragraph = cell.paragraphs[0]
            paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER if align_center else WD_ALIGN_PARAGRAPH.LEFT
            run = paragraph.add_run(self._text_value(value))
            run.bold = bold
            run.font.name = "Times New Roman"
            run.font.size = Pt(7.5 if not bold else 8)
            run._element.rPr.rFonts.set(qn("w:eastAsia"), "Times New Roman")
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.TOP
            tc_pr = cell._tc.get_or_add_tcPr()
            tc_mar = tc_pr.first_child_found_in("w:tcMar")
            if tc_mar is None:
                tc_mar = OxmlElement("w:tcMar")
                tc_pr.append(tc_mar)
            for margin_name in ("top", "left", "bottom", "right"):
                margin = tc_mar.find(qn(f"w:{margin_name}"))
                if margin is None:
                    margin = OxmlElement(f"w:{margin_name}")
                    tc_mar.append(margin)
                margin.set(qn("w:w"), "60")
                margin.set(qn("w:type"), "dxa")

        document = Document()
        set_landscape(document.sections[0])
        normal_style = document.styles["Normal"]
        normal_style.font.name = "Times New Roman"
        normal_style.font.size = Pt(9)
        normal_style.element.rPr.rFonts.set(qn("w:eastAsia"), "Times New Roman")

        title = document.add_paragraph()
        title.alignment = WD_ALIGN_PARAGRAPH.CENTER
        title_run = title.add_run(REPORT_TITLE)
        title_run.bold = True
        title_run.font.name = "Times New Roman"
        title_run.font.size = Pt(12)
        title_run._element.rPr.rFonts.set(qn("w:eastAsia"), "Times New Roman")

        subtitle = document.add_paragraph(filter_description)
        subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER

        document.add_paragraph("Структура отчета")
        document.add_paragraph("Раздел 1. Реестр выпускников и сведения о занятости")
        document.add_paragraph("Раздел 2. Сводные показатели трудоустройства")
        document.add_page_break()

        document.add_paragraph("Раздел 1. Реестр выпускников и сведения о занятости").runs[0].bold = True
        graduate_headers = self._graduate_headers()
        graduate_rows = [self._profile_row_values(profile, index) for index, profile in enumerate(profiles, start=1)]
        graduate_table = document.add_table(rows=1, cols=len(graduate_headers))
        graduate_table.style = "Table Grid"
        graduate_table.autofit = True
        for cell, header in zip(graduate_table.rows[0].cells, graduate_headers):
            set_cell_text(cell, header, bold=True, align_center=True)
        for row in graduate_rows:
            cells = graduate_table.add_row().cells
            for cell, value in zip(cells, row):
                set_cell_text(cell, value, align_center=False)

        document.add_page_break()
        document.add_paragraph("Раздел 2. Сводные показатели трудоустройства").runs[0].bold = True
        summary_headers = self._summary_headers()
        summary_rows = self._summary_row_values(profiles)
        summary_table = document.add_table(rows=1, cols=len(summary_headers))
        summary_table.style = "Table Grid"
        summary_table.autofit = True
        for cell, header in zip(summary_table.rows[0].cells, summary_headers):
            set_cell_text(cell, header, bold=True, align_center=True)
        for row in summary_rows:
            cells = summary_table.add_row().cells
            for cell, value in zip(cells, row):
                set_cell_text(cell, value, align_center=False)

        document.add_paragraph("")
        document.add_paragraph("Зав. кафедрой «ИСТ им. акад. А. Жайнакова» ____________________")

        buffer = BytesIO()
        document.save(buffer)
        buffer.seek(0)
        response = HttpResponse(
            buffer.getvalue(),
            content_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        )
        response["Content-Disposition"] = 'attachment; filename="employment_report.docx"'
        return response

    def _xlsx_response(self, profiles: list[AlumniProfile], filter_description: str) -> HttpResponse:
        try:
            from openpyxl import Workbook
            from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
            from openpyxl.utils import get_column_letter
        except ImportError as exc:
            return Response(
                {"detail": f"XLSX export dependency is not installed: {exc}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        workbook = Workbook()
        border_side = Side(style="thin", color="111827")
        border = Border(left=border_side, right=border_side, top=border_side, bottom=border_side)
        header_font = Font(name="Arial", size=10, bold=True, color="111827")
        title_font = Font(name="Arial", size=12, bold=True, color="111827")
        body_font = Font(name="Arial", size=10, color="111827")
        header_fill = PatternFill(fill_type="solid", fgColor="F8FAFC")

        def prepare_sheet(sheet, title: str, headers: list[str], rows: list[list[str | int | None]], widths: list[int]):
            sheet.title = title
            sheet.append([REPORT_TITLE])
            sheet.merge_cells(start_row=1, start_column=1, end_row=1, end_column=len(headers))
            sheet.cell(1, 1).font = title_font
            sheet.cell(1, 1).alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
            sheet.append([filter_description])
            sheet.merge_cells(start_row=2, start_column=1, end_row=2, end_column=len(headers))
            sheet.cell(2, 1).alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
            sheet.append([])
            sheet.append(headers)
            for cell in sheet[4]:
                cell.font = header_font
                cell.fill = header_fill
                cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
                cell.border = border
            for row in rows:
                sheet.append([self._text_value(value) for value in row])
            for row in sheet.iter_rows(min_row=5, max_row=sheet.max_row, min_col=1, max_col=len(headers)):
                for cell in row:
                    cell.font = body_font
                    cell.alignment = Alignment(horizontal="left", vertical="top", wrap_text=True)
                    cell.border = border
            sheet.freeze_panes = "A5"
            sheet.auto_filter.ref = f"A4:{get_column_letter(len(headers))}{sheet.max_row}"
            for index, width in enumerate(widths, start=1):
                sheet.column_dimensions[get_column_letter(index)].width = width
            sheet.row_dimensions[1].height = 34
            sheet.row_dimensions[2].height = 28

        graduate_headers = self._graduate_headers()
        graduate_rows = [self._profile_row_values(profile, index) for index, profile in enumerate(profiles, start=1)]
        prepare_sheet(
            workbook.active,
            "Выпускники",
            graduate_headers,
            graduate_rows,
            [7, 28, 16, 10, 32, 14, 34, 32, 22, 28, 38, 34],
        )

        summary_headers = self._summary_headers()
        summary_rows = self._summary_row_values(profiles)
        summary_sheet = workbook.create_sheet("Сводка")
        prepare_sheet(
            summary_sheet,
            "Сводка",
            summary_headers,
            summary_rows,
            [42, 18, 18, 20, 22, 18, 20, 18, 18, 22],
        )

        buffer = BytesIO()
        workbook.save(buffer)
        buffer.seek(0)
        response = HttpResponse(
            buffer.getvalue(),
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
        response["Content-Disposition"] = 'attachment; filename="employment_report.xlsx"'
        return response

    def _table_style(self) -> TableStyle:
        return TableStyle([
            ("GRID", (0, 0), (-1, -1), 0.35, colors.black),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("ALIGN", (0, 0), (-1, 0), "CENTER"),
            ("LEFTPADDING", (0, 0), (-1, -1), 2),
            ("RIGHTPADDING", (0, 0), (-1, -1), 2),
            ("TOPPADDING", (0, 0), (-1, -1), 2),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
        ])
