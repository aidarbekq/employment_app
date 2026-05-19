from __future__ import annotations

from collections import defaultdict
from io import BytesIO
from pathlib import Path
import os
from typing import Iterable

from django.db.models import Count, Q
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
from rest_framework import permissions

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


class EmploymentStatsView(APIView):
    """
    Возвращает статистику трудоустройства по годам и сводку для диаграмм.
    Старые поля employed/unemployed сохранены для обратной совместимости.
    """
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        qs = AlumniProfile.objects.values("graduation_year").annotate(
            total=Count("id"),
            surveyed=Count("id", filter=Q(is_surveyed=True)),
            employed_specialty=Count("id", filter=Q(employment_status=AlumniProfile.EmploymentStatus.EMPLOYED_SPECIALTY)),
            employed_not_specialty=Count("id", filter=Q(employment_status=AlumniProfile.EmploymentStatus.EMPLOYED_NOT_SPECIALTY)),
            self_employed=Count("id", filter=Q(employment_status=AlumniProfile.EmploymentStatus.SELF_EMPLOYED)),
            continuing_education=Count("id", filter=Q(employment_status=AlumniProfile.EmploymentStatus.CONTINUING_EDUCATION)),
            unemployed=Count("id", filter=Q(employment_status=AlumniProfile.EmploymentStatus.UNEMPLOYED)),
            lost_contact=Count("id", filter=Q(employment_status=AlumniProfile.EmploymentStatus.LOST_CONTACT)),
        ).order_by("graduation_year")

        result = {}
        status_distribution = defaultdict(int)
        for entry in qs:
            year = entry["graduation_year"]
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


class EmploymentReportPdfView(APIView):
    permission_classes = (IsAdminUserRole,)

    def get(self, request):
        profiles = self._filtered_profiles(request)
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
        story.append(Paragraph(self._filter_description(request), styles["ReportSubTitle"]))
        story.append(Spacer(1, 4 * mm))
        story.append(Paragraph("Раздел 1. Пофамильный список выпускников", styles["ReportSection"]))
        story.append(self._graduates_table(profiles, styles))
        story.append(PageBreak())
        story.append(Paragraph(REPORT_TITLE, styles["ReportTitle"]))
        story.append(Paragraph("Раздел 2. Процентное соотношение трудоустройства", styles["ReportSection"]))
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
            "academic_group__name",
            "user__last_name",
            "user__first_name",
        )
        filters = {
            "graduation_year": "graduation_year",
            "academic_group": "academic_group_id",
            "study_form": "study_form",
            "degree_level": "degree_level",
            "employment_status": "employment_status",
        }
        for query_name, orm_name in filters.items():
            value = request.query_params.get(query_name)
            if value:
                qs = qs.filter(**{orm_name: value})
        return list(qs)

    def _filter_description(self, request) -> str:
        parts = []
        year = request.query_params.get("graduation_year")
        group_id = request.query_params.get("academic_group")
        study_form = request.query_params.get("study_form")
        if year:
            parts.append(f"год выпуска: {year}")
        if group_id:
            group = AcademicGroup.objects.filter(pk=group_id).first()
            parts.append(f"группа: {group.name if group else group_id}")
        if study_form:
            parts.append(f"форма обучения: {dict(AcademicGroup.StudyForm.choices).get(study_form, study_form)}")
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
        buckets: dict[tuple[str, int | None], list[AlumniProfile]] = defaultdict(list)
        for profile in profiles:
            group_name = profile.academic_group.name if profile.academic_group else "Без группы"
            buckets[(group_name, profile.graduation_year)].append(profile)

        header = [
            "Группа / год",
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
        for (group_name, year), items in sorted(buckets.items(), key=lambda item: (item[0][0], item[0][1] or 0)):
            group = items[0].academic_group
            total_graduates = group.total_graduates if group and group.total_graduates else len(items)
            admission_count = group.admission_count if group else None
            surveyed = sum(1 for item in items if item.is_surveyed)
            denominator = surveyed or len(items)
            counts = defaultdict(int)
            for item in items:
                counts[item.employment_status] += 1
            graduation_percent = f"{_percent(total_graduates, admission_count)}%" if admission_count else "—"
            data.append([
                self._p(f"{group_name}\n{year or 'без года'}", styles),
                self._p(total_graduates, styles, center=True),
                self._p(surveyed, styles, center=True),
                self._p(_count_with_percent(counts[AlumniProfile.EmploymentStatus.EMPLOYED_SPECIALTY], denominator), styles, center=True),
                self._p(_count_with_percent(counts[AlumniProfile.EmploymentStatus.EMPLOYED_NOT_SPECIALTY], denominator), styles, center=True),
                self._p(_count_with_percent(counts[AlumniProfile.EmploymentStatus.SELF_EMPLOYED], denominator), styles, center=True),
                self._p(_count_with_percent(counts[AlumniProfile.EmploymentStatus.CONTINUING_EDUCATION], denominator), styles, center=True),
                self._p(_count_with_percent(counts[AlumniProfile.EmploymentStatus.UNEMPLOYED], denominator), styles, center=True),
                self._p(_count_with_percent(counts[AlumniProfile.EmploymentStatus.LOST_CONTACT], len(items)), styles, center=True),
                self._p(graduation_percent, styles, center=True),
            ])

        table = Table(
            data,
            repeatRows=1,
            colWidths=[38 * mm, 25 * mm, 24 * mm, 28 * mm, 28 * mm, 24 * mm, 28 * mm, 24 * mm, 24 * mm, 29 * mm],
        )
        table.setStyle(self._table_style())
        return table

    def _table_style(self) -> TableStyle:
        return TableStyle([
            ("GRID", (0, 0), (-1, -1), 0.4, colors.black),
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f3f4f6")),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("ALIGN", (0, 0), (-1, 0), "CENTER"),
            ("LEFTPADDING", (0, 0), (-1, -1), 2),
            ("RIGHTPADDING", (0, 0), (-1, -1), 2),
            ("TOPPADDING", (0, 0), (-1, -1), 2),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
        ])
