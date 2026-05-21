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
    queryset = Employer.objects.all().select_related("user").order_by("company_name")
    serializer_class = EmployerSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["company_name", "address", "phone", "user__email", "user__username"]
    ordering_fields = ["company_name", "address", "id"]
    ordering = ["company_name"]


    def get_serializer_class(self):
        user = getattr(self.request, "user", None)
        if self.action == "create" and user and user.is_authenticated and user.role == user.Roles.ADMIN:
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
        if not user or not user.is_authenticated:
            return Employer.objects.none()
        if user.role == user.Roles.ADMIN:
            return Employer.objects.all().select_related("user").order_by("company_name")
        if user.role == user.Roles.EMPLOYER:
            return Employer.objects.filter(user=user).select_related("user").order_by("company_name")
        return Employer.objects.all().select_related("user").order_by("company_name")


class PartnerViewSet(viewsets.ModelViewSet):
    queryset = Partner.objects.all().select_related("employer").order_by("order", "name")
    serializer_class = PartnerSerializer
    parser_classes = (JSONParser, MultiPartParser, FormParser)
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "description", "website"]
    ordering_fields = ["order", "name", "id"]
    ordering = ["order", "name"]

    @staticmethod
    def _is_truthy(value):
        return str(value).lower() in {"1", "true", "yes", "on"}

    def get_queryset(self):
        qs = Partner.objects.all().select_related("employer").order_by("order", "name")
        user = self.request.user
        is_admin = bool(user and user.is_authenticated and user.role == user.Roles.ADMIN)

        # The same endpoint is used by the public home page and by the admin panel.
        # Public list requests must never expose hidden partners, even when an admin
        # is currently logged in and Axios sends a JWT token automatically.
        if self.action == "list":
            include_inactive = self._is_truthy(self.request.query_params.get("include_inactive"))
            if is_admin and include_inactive:
                return qs
            return qs.filter(is_active=True)

        if is_admin:
            return qs
        return qs.filter(is_active=True)

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [permissions.AllowAny()]
        return [IsAdminUserRole()]