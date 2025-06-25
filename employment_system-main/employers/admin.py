from django.contrib import admin
from .models import Employer

@admin.register(Employer)
class EmployerAdmin(admin.ModelAdmin):
    list_display = ("company_name", "user", "phone")
    search_fields = ("company_name", "user__username")
