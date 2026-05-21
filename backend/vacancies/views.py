from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets
from rest_framework.exceptions import PermissionDenied

from .models import Vacancy
from .serializers import VacancySerializer


class IsVerifiedEmployerForCreate(permissions.BasePermission):
    """Only verified employer accounts may publish new vacancies."""

    def has_permission(self, request, view):
        if view.action != "create":
            return True
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role != request.user.Roles.EMPLOYER:
            return False
        employer_profile = getattr(request.user, "employer_profile", None)
        return bool(employer_profile and employer_profile.is_verified)


class IsVacancyOwnerOrReadOnly(permissions.BasePermission):
    """
    Только работодатель-владелец или ADMIN может редактировать / удалять вакансию.
    Остальным – только смотреть.
    """

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.user.role == request.user.Roles.ADMIN:
            return True
        employer_profile = getattr(request.user, "employer_profile", None)
        return bool(employer_profile and employer_profile.is_verified and obj.employer.user == request.user)


class VacancyViewSet(viewsets.ModelViewSet):
    queryset = Vacancy.objects.all().select_related("employer").order_by("-created_at", "id")
    serializer_class = VacancySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["is_active", "location", "salary", "created_at"]
    search_fields = ["title", "description", "requirements", "location", "employer__company_name"]
    ordering_fields = ["created_at", "title", "location", "salary"]
    ordering = ["-created_at", "id"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [permissions.AllowAny()]
        if self.action == "create":
            return [permissions.IsAuthenticated(), IsVerifiedEmployerForCreate()]
        return [permissions.IsAuthenticated(), IsVacancyOwnerOrReadOnly()]

    def perform_create(self, serializer):
        employer = getattr(self.request.user, "employer_profile", None)
        if not employer or not employer.is_verified:
            raise PermissionDenied("Only verified employers can publish vacancies.")
        serializer.save(employer=employer)

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            if user.role == user.Roles.EMPLOYER:
                return Vacancy.objects.filter(employer__user=user).select_related("employer").order_by("-created_at", "id")
            if user.role == user.Roles.ADMIN:
                return Vacancy.objects.all().select_related("employer").order_by("-created_at", "id")
        return Vacancy.objects.filter(is_active=True).select_related("employer").order_by("-created_at", "id")
