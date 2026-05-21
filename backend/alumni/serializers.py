from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from pathlib import Path

from django.conf import settings
from django.urls import reverse
from rest_framework import serializers

from employers.models import Employer
from users.serializers import UserSerializer
from .models import AcademicGroup, AlumniProfile

User = get_user_model()


class AcademicGroupSerializer(serializers.ModelSerializer):
    study_form_display = serializers.CharField(source="get_study_form_display", read_only=True)
    degree_level_display = serializers.CharField(source="get_degree_level_display", read_only=True)

    class Meta:
        model = AcademicGroup
        fields = [
            "id",
            "name",
            "graduation_year",
            "direction_code",
            "direction_name",
            "profile",
            "study_form",
            "study_form_display",
            "degree_level",
            "degree_level_display",
            "is_active",
        ]


class GetAlumniProfileSerializer(serializers.ModelSerializer):
    resume = serializers.SerializerMethodField()
    user = UserSerializer(read_only=True)
    academic_group = AcademicGroupSerializer(read_only=True)
    academic_group_id = serializers.PrimaryKeyRelatedField(
        source="academic_group",
        queryset=AcademicGroup.objects.all(),
        required=False,
        allow_null=True,
        write_only=True,
    )
    employer = serializers.PrimaryKeyRelatedField(
        queryset=Employer.objects.all(), required=False, allow_null=True
    )
    employment_status_display = serializers.CharField(source="get_employment_status_display", read_only=True)
    study_form_display = serializers.CharField(source="get_study_form_display", read_only=True)
    degree_level_display = serializers.CharField(source="get_degree_level_display", read_only=True)

    def get_resume(self, obj) -> str | None:
        if not obj.resume:
            return None
        request = self.context.get("request")
        url = reverse("alumni-profile-resume", kwargs={"pk": obj.pk})
        return request.build_absolute_uri(url) if request else url

    class Meta:
        model = AlumniProfile
        fields = [
            "id",
            "user",
            "academic_group",
            "academic_group_id",
            "graduation_year",
            "specialty",
            "direction",
            "profile",
            "study_form",
            "study_form_display",
            "degree_level",
            "degree_level_display",
            "is_surveyed",
            "employment_status",
            "employment_status_display",
            "is_employed",
            "employer",
            "workplace",
            "position",
            "continuing_education_place",
            "useful_subjects",
            "self_study_topics",
            "resume",
        ]
        read_only_fields = ("user", "academic_group", "is_employed")
        extra_kwargs = {
            "resume": {"required": False},
            "position": {"required": False},
            "employer": {"required": False},
        }


class AlumniProfileSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    academic_group = AcademicGroupSerializer(read_only=True)
    academic_group_id = serializers.PrimaryKeyRelatedField(
        source="academic_group",
        queryset=AcademicGroup.objects.all(),
        required=False,
        allow_null=True,
        write_only=True,
    )
    employer = serializers.PrimaryKeyRelatedField(queryset=Employer.objects.all(), required=False, allow_null=True)

    class Meta:
        model = AlumniProfile
        fields = [
            "id",
            "user",
            "academic_group",
            "academic_group_id",
            "graduation_year",
            "specialty",
            "direction",
            "profile",
            "study_form",
            "degree_level",
            "is_surveyed",
            "employment_status",
            "is_employed",
            "employer",
            "workplace",
            "position",
            "continuing_education_place",
            "useful_subjects",
            "self_study_topics",
            "resume",
        ]
        read_only_fields = ("user", "academic_group", "is_employed")
        extra_kwargs = {
            "resume": {"required": False, "allow_null": True},
            "position": {"required": False, "allow_null": True},
            "employer": {"required": False, "allow_null": True},
            "graduation_year": {"required": False, "allow_null": True},
            "specialty": {"required": False, "allow_null": True},
            "direction": {"required": False, "allow_null": True},
            "profile": {"required": False, "allow_null": True},
            "study_form": {"required": False, "allow_null": True},
            "workplace": {"required": False, "allow_null": True},
            "continuing_education_place": {"required": False, "allow_null": True},
            "useful_subjects": {"required": False, "allow_null": True},
            "self_study_topics": {"required": False, "allow_null": True},
        }



    def validate_resume(self, value):
        if value is None:
            return value

        extension = Path(value.name).suffix.lower()
        if extension not in settings.RESUME_ALLOWED_EXTENSIONS:
            raise serializers.ValidationError("Only PDF, DOC, and DOCX resume files are allowed.")

        max_size = settings.RESUME_MAX_UPLOAD_SIZE
        if value.size > max_size:
            raise serializers.ValidationError(f"Resume file must be smaller than {max_size // (1024 * 1024)} MB.")

        allowed_content_types = {
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        }
        content_type = getattr(value, "content_type", "")
        if content_type and content_type not in allowed_content_types:
            raise serializers.ValidationError("Unsupported resume file type.")

        return value


class AdminAlumniCreateSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    password2 = serializers.CharField(write_only=True, required=False, allow_blank=True)
    academic_group_id = serializers.PrimaryKeyRelatedField(
        queryset=AcademicGroup.objects.all(),
        source="academic_group",
        required=False,
        allow_null=True,
    )
    graduation_year = serializers.IntegerField(required=False, allow_null=True)
    specialty = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    direction = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    profile = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    study_form = serializers.ChoiceField(
        choices=AcademicGroup.StudyForm.choices,
        required=False,
        allow_null=True,
    )
    degree_level = serializers.ChoiceField(
        choices=AcademicGroup.DegreeLevel.choices,
        required=False,
    )
    is_surveyed = serializers.BooleanField(required=False)
    employment_status = serializers.ChoiceField(
        choices=AlumniProfile.EmploymentStatus.choices,
        required=False,
    )
    employer = serializers.PrimaryKeyRelatedField(queryset=Employer.objects.all(), required=False, allow_null=True)
    workplace = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    position = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    continuing_education_place = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    useful_subjects = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    self_study_topics = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    def validate_email(self, value):
        normalized = User.objects.normalize_email(value)
        if User.objects.filter(email__iexact=normalized).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return normalized

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def validate_password(self, value):
        if value:
            validate_password(value)
        return value

    def validate(self, attrs):
        password = attrs.get("password") or ""
        password2 = attrs.get("password2") or ""
        if password or password2:
            if password != password2:
                raise serializers.ValidationError({"password2": "Password fields didn’t match."})
        return attrs

    def create(self, validated_data):
        profile_fields = {
            key: validated_data.pop(key)
            for key in list(validated_data.keys())
            if key
            in {
                "academic_group",
                "graduation_year",
                "specialty",
                "direction",
                "profile",
                "study_form",
                "degree_level",
                "is_surveyed",
                "employment_status",
                "employer",
                "workplace",
                "position",
                "continuing_education_place",
                "useful_subjects",
                "self_study_topics",
            }
        }
        password = validated_data.pop("password", "") or "DemoPass123!"
        validated_data.pop("password2", None)
        user = User.objects.create_user(role=User.Roles.ALUMNI, password=password, **validated_data)
        profile, _ = AlumniProfile.objects.get_or_create(user=user)
        for field, value in profile_fields.items():
            setattr(profile, field, value)
        profile.save()
        return profile

    def to_representation(self, instance):
        return GetAlumniProfileSerializer(instance, context=self.context).data
