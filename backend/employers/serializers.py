from pathlib import Path

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from PIL import Image, UnidentifiedImageError
from rest_framework import serializers

from users.serializers import UserSerializer
from .models import Employer, Partner

User = get_user_model()


class EmployerSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Employer
        fields = ("id", "user", "company_name", "address", "phone", "description", "is_verified")
        read_only_fields = ("user",)

    def validate_is_verified(self, value):
        request = self.context.get("request")
        if not (request and request.user and request.user.is_authenticated and request.user.role == request.user.Roles.ADMIN):
            raise serializers.ValidationError("Only an administrator can change employer verification status.")
        return value


class AdminEmployerCreateSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, validators=[validate_password], trim_whitespace=False)
    password2 = serializers.CharField(write_only=True, trim_whitespace=False)
    company_name = serializers.CharField(max_length=255)
    address = serializers.CharField(max_length=512, required=False, allow_blank=True, allow_null=True)
    phone = serializers.CharField(max_length=50, required=False, allow_blank=True, allow_null=True)
    description = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    is_verified = serializers.BooleanField(required=False, default=True)

    def validate_email(self, value):
        normalized = User.objects.normalize_email(value)
        if User.objects.filter(email__iexact=normalized).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return normalized

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password2": "Password fields didn’t match."})
        return attrs

    def create(self, validated_data):
        employer_fields = {
            "company_name": validated_data.pop("company_name"),
            "address": validated_data.pop("address", "") or "",
            "phone": validated_data.pop("phone", "") or "",
            "description": validated_data.pop("description", "") or "",
            "is_verified": validated_data.pop("is_verified", True),
        }
        password = validated_data.pop("password")
        validated_data.pop("password2")
        user = User.objects.create_user(
            role=User.Roles.EMPLOYER,
            password=password,
            **validated_data,
        )
        employer, _ = Employer.objects.get_or_create(user=user)
        for field, value in employer_fields.items():
            setattr(employer, field, value)
        employer.save()
        return employer

    def to_representation(self, instance):
        return EmployerSerializer(instance, context=self.context).data


class PartnerSerializer(serializers.ModelSerializer):
    logo_url = serializers.SerializerMethodField()

    class Meta:
        model = Partner
        fields = (
            "id",
            "name",
            "slug",
            "description",
            "website",
            "logo",
            "logo_url",
            "employer",
            "order",
            "is_active",
        )
        extra_kwargs = {
            "logo": {"required": False, "allow_null": True},
            "employer": {"required": False, "allow_null": True},
            "description": {"required": False, "allow_blank": True},
            "website": {"required": False, "allow_blank": True},
        }


    def validate_logo(self, value):
        if value is None:
            return value

        extension = Path(value.name).suffix.lower()
        if extension not in settings.PARTNER_LOGO_ALLOWED_EXTENSIONS:
            raise serializers.ValidationError("Only JPG, PNG, and WEBP logo images are allowed.")

        if value.size > settings.PARTNER_LOGO_MAX_UPLOAD_SIZE:
            max_mb = settings.PARTNER_LOGO_MAX_UPLOAD_SIZE // (1024 * 1024)
            raise serializers.ValidationError(f"Logo file must be smaller than {max_mb} MB.")

        content_type = getattr(value, "content_type", "")
        if content_type and content_type not in settings.PARTNER_LOGO_ALLOWED_CONTENT_TYPES:
            raise serializers.ValidationError("Unsupported logo image type.")

        try:
            image = Image.open(value)
            image.verify()
        except (UnidentifiedImageError, OSError) as exc:
            raise serializers.ValidationError("Uploaded logo must be a valid image file.") from exc
        finally:
            value.seek(0)

        return value

    def get_logo_url(self, obj) -> str | None:
        if not obj.logo:
            return None
        request = self.context.get("request")
        url = obj.logo.url
        return request.build_absolute_uri(url) if request else url
