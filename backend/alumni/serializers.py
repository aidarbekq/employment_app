from rest_framework import serializers
from .models import AlumniProfile
from employers.models import Employer
from users.serializers import UserSerializer

class GetAlumniProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    employer = serializers.PrimaryKeyRelatedField(
        queryset=Employer.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = AlumniProfile
        fields = [
            "id",
            "user",
            "graduation_year",
            "specialty",
            "is_employed",
            "employer",
            "position",
            "resume",
        ]
        read_only_fields = ("user",)
        extra_kwargs = {
            "resume": {"required": False},
            "position": {"required": False},
            "employer": {"required": False},
        }

class AlumniProfileSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    employer = serializers.PrimaryKeyRelatedField(queryset=Employer.objects.all(), required=False, allow_null=True)

    class Meta:
        model = AlumniProfile
        fields = [
            "id",
            "user",
            "graduation_year",
            "specialty",
            "is_employed",
            "employer",
            "position",
            "resume",
        ]
        read_only_fields = ("user",)
        extra_kwargs = {
            "resume": {"required": False, "allow_null": True},
            "position": {"required": False, "allow_null": True},
            "employer": {"required": False, "allow_null": True},
            "graduation_year": {"required": False, "allow_null": True},
            "specialty": {"required": False, "allow_null": True},
        }
