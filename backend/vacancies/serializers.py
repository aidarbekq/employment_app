from rest_framework import serializers

from employers.models import Employer
from .models import Vacancy


class VacancySerializer(serializers.ModelSerializer):
    employer = serializers.StringRelatedField(read_only=True)
    employer_id = serializers.PrimaryKeyRelatedField(
        source="employer",
        queryset=Employer.objects.all().select_related("user"),
        required=False,
    )
    employer_is_verified = serializers.BooleanField(source="employer.is_verified", read_only=True)

    class Meta:
        model = Vacancy
        fields = (
            "id",
            "employer",
            "employer_id",
            "employer_is_verified",
            "title",
            "description",
            "requirements",
            "location",
            "salary",
            "is_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("employer", "employer_is_verified", "created_at", "updated_at")

    def validate(self, attrs):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        is_admin = bool(user and user.is_authenticated and user.role == user.Roles.ADMIN)

        if not is_admin and "employer" in attrs:
            raise serializers.ValidationError({"employer_id": "Only an administrator can change the vacancy employer."})

        selected_employer = attrs.get("employer") or getattr(self.instance, "employer", None)
        if is_admin and self.instance is None and selected_employer is None:
            raise serializers.ValidationError({"employer_id": "Employer is required when an administrator creates a vacancy."})

        is_active = attrs.get("is_active")
        if is_active is None:
            is_active = getattr(self.instance, "is_active", True)

        if selected_employer is not None and is_active and not selected_employer.is_verified:
            raise serializers.ValidationError(
                {"employer_id": "Active vacancies can only be assigned to verified employers."}
            )

        return attrs