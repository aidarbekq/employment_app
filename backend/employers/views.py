from rest_framework import filters, permissions, viewsets
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser

from .models import Employer, Partner
from .serializers import AdminEmployerCreateSerializer, EmployerSerializer, PartnerSerializer


class IsAdminUserRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == request.user.Roles.ADMIN)


class IsEmployerOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.user.role == request.user.Roles.ADMIN:
            return True
        return obj.user == request.user


class EmployerViewSet(viewsets.ModelViewSet):
    queryset = Employer.objects.all().select_related("user")
    serializer_class = EmployerSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["company_name", "address", "phone"]


    def get_serializer_class(self):
        if self.action == "create" and self.request.user.role == self.request.user.Roles.ADMIN:
            return AdminEmployerCreateSerializer
        return EmployerSerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated(), IsEmployerOwnerOrReadOnly()]

    def perform_create(self, serializer):
        if self.request.user.role == self.request.user.Roles.ADMIN:
            serializer.save()
        else:
            serializer.save(user=self.request.user)

    def get_queryset(self):
        user = self.request.user
        if user.role == user.Roles.ADMIN:
            return Employer.objects.all().select_related("user")
        if user.role == user.Roles.EMPLOYER:
            return Employer.objects.filter(user=user).select_related("user")
        return Employer.objects.all().select_related("user")


class PartnerViewSet(viewsets.ModelViewSet):
    queryset = Partner.objects.all().select_related("employer")
    serializer_class = PartnerSerializer
    parser_classes = (JSONParser, MultiPartParser, FormParser)
    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "description", "website"]

    def get_queryset(self):
        qs = Partner.objects.all().select_related("employer")
        user = self.request.user
        if not (user.is_authenticated and user.role == user.Roles.ADMIN):
            qs = qs.filter(is_active=True)
        return qs

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [permissions.AllowAny()]
        return [IsAdminUserRole()]
