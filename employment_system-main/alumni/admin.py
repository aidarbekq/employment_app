from django.contrib import admin
from .models import AlumniProfile

@admin.register(AlumniProfile)
class AlumniProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "graduation_year", "specialty", "is_employed", "employer")
    list_filter = ("graduation_year", "is_employed")
    search_fields = ("user__username", "user__first_name", "user__last_name")
