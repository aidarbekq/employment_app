from django.contrib import admin
from .models import Vacancy

@admin.register(Vacancy)
class VacancyAdmin(admin.ModelAdmin):
    list_display = ("title", "employer", "location", "salary", "is_active", "created_at")
    list_filter = ("is_active", "created_at")
    search_fields = ("title", "employer__company_name")
