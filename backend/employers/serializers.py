from rest_framework import serializers

from users.serializers import UserSerializer
from .models import Employer, Partner


class EmployerSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Employer
        fields = ("id", "user", "company_name", "address", "phone", "description")
        read_only_fields = ("user",)


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
