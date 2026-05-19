from django.contrib import admin

from .models import Employer, Partner


@admin.register(Employer)
class EmployerAdmin(admin.ModelAdmin):
    list_display = ("company_name", "user", "phone")
    search_fields = ("company_name", "user__username")


@admin.register(Partner)
class PartnerAdmin(admin.ModelAdmin):
    list_display = ("name", "website", "order", "is_active", "employer")
    list_filter = ("is_active",)
    search_fields = ("name", "description", "website")
    prepopulated_fields = {"slug": ("name",)}
