from rest_framework import serializers
from users.serializers import UserSerializer
from .models import Employer

class EmployerSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Employer
        fields = ("id", "user", "company_name", "address", "phone", "description")
        read_only_fields = ("user",)
