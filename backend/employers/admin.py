from django.contrib import admin

from .models import Employer, Partner


@admin.register(Employer)
class EmployerAdmin(admin.ModelAdmin):
    list_display = ("company_name", "user", "phone", "is_verified")
    list_filter = ("is_verified",)
    search_fields = ("company_name", "user__username", "user__email")


@admin.register(Partner)
class PartnerAdmin(admin.ModelAdmin):
    list_display = ("name", "website", "order", "is_active", "employer")
    list_filter = ("is_active",)
    search_fields = ("name", "description", "website")
    prepopulated_fields = {"slug": ("name",)}
