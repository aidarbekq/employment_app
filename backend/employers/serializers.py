from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from users.serializers import UserSerializer
from .models import Employer, Partner

User = get_user_model()


class EmployerSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Employer
        fields = ("id", "user", "company_name", "address", "phone", "description")
        read_only_fields = ("user",)


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

    def get_logo_url(self, obj):
        if not obj.logo:
            return None
        request = self.context.get("request")
        url = obj.logo.url
        return request.build_absolute_uri(url) if request else url
