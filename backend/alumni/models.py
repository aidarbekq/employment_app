from pathlib import Path
from uuid import uuid4

from django.conf import settings
from django.db import models
from django.utils.text import slugify


def resume_upload_path(instance, filename):
    extension = Path(filename).suffix.lower()
    username = slugify(instance.user.username) or f"user-{instance.user_id}"
    return f"resumes/{username}/{uuid4().hex}{extension}"


class AcademicGroup(models.Model):
    class StudyForm(models.TextChoices):
        FULL_TIME = "FULL_TIME", "Очное"
        PART_TIME = "PART_TIME", "Заочное (ДОТ)"

    class DegreeLevel(models.TextChoices):
        BACHELOR = "BACHELOR", "Бакалавриат"
        MASTER = "MASTER", "Магистратура"

    name = models.CharField(max_length=50, unique=True, help_text="Например: ИСТТ-1-21")
    graduation_year = models.PositiveIntegerField(null=True, blank=True)
    direction_code = models.CharField(max_length=20, default="710200")
    direction_name = models.CharField(
        max_length=255,
        default="Информационные системы и технологии",
    )
    profile = models.CharField(max_length=255, blank=True, default="")
    study_form = models.CharField(
        max_length=20,
        choices=StudyForm.choices,
        default=StudyForm.FULL_TIME,
    )
    degree_level = models.CharField(
        max_length=20,
        choices=DegreeLevel.choices,
        default=DegreeLevel.BACHELOR,
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-graduation_year", "name"]
        verbose_name = "Академическая группа"
        verbose_name_plural = "Академические группы"

    def __str__(self):
        return self.name


class AlumniProfile(models.Model):
    class EmploymentStatus(models.TextChoices):
        EMPLOYED_SPECIALTY = "EMPLOYED_SPECIALTY", "Работает по специальности"
        EMPLOYED_NOT_SPECIALTY = "EMPLOYED_NOT_SPECIALTY", "Работает не по специальности"
        SELF_EMPLOYED = "SELF_EMPLOYED", "Самозанятый / предприниматель"
        CONTINUING_EDUCATION = "CONTINUING_EDUCATION", "Продолжает обучение"
        UNEMPLOYED = "UNEMPLOYED", "Не работает"
        LOST_CONTACT = "LOST_CONTACT", "Неизвестно"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="alumni_profile",
    )
    academic_group = models.ForeignKey(
        AcademicGroup,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="graduates",
    )
    graduation_year = models.PositiveIntegerField(null=True, blank=True)
    specialty = models.CharField(max_length=255, null=True, blank=True)
    direction = models.CharField(max_length=255, null=True, blank=True)
    profile = models.CharField(max_length=255, null=True, blank=True)
    study_form = models.CharField(
        max_length=20,
        choices=AcademicGroup.StudyForm.choices,
        null=True,
        blank=True,
    )
    degree_level = models.CharField(
        max_length=20,
        choices=AcademicGroup.DegreeLevel.choices,
        default=AcademicGroup.DegreeLevel.BACHELOR,
    )
    is_surveyed = models.BooleanField(
        default=True,
        help_text="Выпускник опрошен и его данные можно учитывать в отчетности.",
    )
    employment_status = models.CharField(
        max_length=32,
        choices=EmploymentStatus.choices,
        default=EmploymentStatus.UNEMPLOYED,
    )
    is_employed = models.BooleanField(
        default=False,
        help_text="Backward-compatible flag. Calculated from employment_status in reports.",
    )
    employer = models.ForeignKey(
        "employers.Employer",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="employees",
    )
    workplace = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        help_text="Свободное название места работы, если нет карточки работодателя.",
    )
    position = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        help_text="Должность выпускника.",
    )
    continuing_education_place = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        help_text="Где продолжил обучение: магистратура, аспирантура и т.д.",
    )
    useful_subjects = models.TextField(
        null=True,
        blank=True,
        help_text="Что из изученного на кафедре полезно в работе.",
    )
    self_study_topics = models.TextField(
        null=True,
        blank=True,
        help_text="Что пришлось изучать самостоятельно.",
    )
    resume = models.FileField(upload_to=resume_upload_path, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["academic_group__name", "user__last_name", "user__first_name"]
        verbose_name = "Профиль выпускника"
        verbose_name_plural = "Профили выпускников"

    def __str__(self):
        return f"{self.user.get_full_name()} ({self.graduation_year or 'без года'})"

    def save(self, *args, **kwargs):
        if self.academic_group:
            self.graduation_year = self.graduation_year or self.academic_group.graduation_year
            self.direction = self.direction or self.academic_group.direction_name
            self.profile = self.profile or self.academic_group.profile
            self.study_form = self.study_form or self.academic_group.study_form
            self.degree_level = self.degree_level or self.academic_group.degree_level
        self.is_employed = self.employment_status in {
            self.EmploymentStatus.EMPLOYED_SPECIALTY,
            self.EmploymentStatus.EMPLOYED_NOT_SPECIALTY,
            self.EmploymentStatus.SELF_EMPLOYED,
        }
        super().save(*args, **kwargs)
