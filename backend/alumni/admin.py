from django.contrib import admin

from .models import AcademicGroup, AlumniProfile


@admin.register(AcademicGroup)
class AcademicGroupAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "graduation_year",
        "direction_code",
        "profile",
        "study_form",
        "degree_level",
        "is_active",
    )
    list_filter = ("graduation_year", "study_form", "degree_level", "is_active")
    search_fields = ("name", "direction_name", "profile")


@admin.register(AlumniProfile)
class AlumniProfileAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "academic_group",
        "graduation_year",
        "study_form",
        "employment_status",
        "is_surveyed",
        "employer",
    )
    list_filter = (
        "graduation_year",
        "academic_group",
        "study_form",
        "degree_level",
        "employment_status",
        "is_surveyed",
    )
    search_fields = (
        "user__username",
        "user__first_name",
        "user__last_name",
        "specialty",
        "direction",
        "profile",
        "academic_group__name",
    )
