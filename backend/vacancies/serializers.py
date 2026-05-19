from rest_framework import serializers
from .models import Vacancy

class VacancySerializer(serializers.ModelSerializer):
    employer = serializers.StringRelatedField(read_only=True)  # показываем company_name

    class Meta:
        model = Vacancy
        fields = ("id", "employer", "title", "description", "requirements", "location", "salary", "is_active", "created_at", "updated_at")
        read_only_fields = ("employer", "created_at", "updated_at")
