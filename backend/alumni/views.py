import csv
from pathlib import Path

from django.http import FileResponse, Http404, HttpResponse
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser

from .models import AcademicGroup, AlumniProfile
from .serializers import (
    AcademicGroupSerializer,
    AdminAlumniCreateSerializer,
    AlumniProfileSerializer,
    GetAlumniProfileSerializer,
)


class IsAdminUserRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == request.user.Roles.ADMIN)


class IsAlumniOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.user.role == request.user.Roles.ADMIN:
            return True
        return obj.user == request.user


class AcademicGroupViewSet(viewsets.ModelViewSet):
    queryset = AcademicGroup.objects.all().order_by("-graduation_year", "name")
    serializer_class = AcademicGroupSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["graduation_year", "study_form", "degree_level", "is_active", "direction_code"]
    search_fields = ["name", "direction_name", "profile", "direction_code"]
    ordering_fields = ["name", "graduation_year", "direction_code", "study_form", "degree_level"]
    ordering = ["-graduation_year", "name"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [permissions.IsAuthenticated()]
        return [IsAdminUserRole()]


class AlumniProfileViewSet(viewsets.ModelViewSet):
    queryset = AlumniProfile.objects.all().select_related("user", "employer", "academic_group").order_by(
        "user__last_name", "user__first_name", "id"
    )
    serializer_class = AlumniProfileSerializer
    parser_classes = (JSONParser, MultiPartParser, FormParser)
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = [
        "graduation_year",
        "is_employed",
        "employment_status",
        "is_surveyed",
        "employer",
        "academic_group",
        "study_form",
        "degree_level",
        "direction",
        "profile",
    ]
    search_fields = [
        "user__first_name",
        "user__last_name",
        "user__email",
        "user__username",
        "specialty",
        "direction",
        "profile",
        "academic_group__name",
        "workplace",
        "position",
    ]
    ordering_fields = ["graduation_year", "user__last_name", "user__first_name", "academic_group__name", "employment_status"]
    ordering = ["user__last_name", "user__first_name", "id"]

    def get_serializer_class(self):
        user = getattr(self.request, "user", None)
        if self.action == "create" and user and user.is_authenticated and user.role == user.Roles.ADMIN:
            return AdminAlumniCreateSerializer
        if self.action in ("list", "retrieve"):
            return GetAlumniProfileSerializer
        return AlumniProfileSerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated(), IsAlumniOwnerOrReadOnly()]

    def perform_create(self, serializer):
        if self.request.user.role == self.request.user.Roles.ADMIN:
            serializer.save()
        else:
            serializer.save(user=self.request.user)

    def get_queryset(self):
        user = self.request.user
        base_qs = AlumniProfile.objects.all().select_related("user", "employer", "academic_group").order_by(
            "user__last_name", "user__first_name", "id"
        )
        if not user or not user.is_authenticated:
            return base_qs.none()
        if user.role == user.Roles.ADMIN:
            return base_qs
        if user.role == user.Roles.EMPLOYER:
            employer_profile = getattr(user, "employer_profile", None)
            if employer_profile and employer_profile.is_verified:
                return base_qs
            return base_qs.none()
        return base_qs.filter(user=user)


    @action(detail=True, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def resume(self, request, pk=None):
        profile = self.get_object()
        if not profile.resume:
            raise Http404("Resume was not uploaded.")
        file_handle = profile.resume.open("rb")
        filename = Path(profile.resume.name).name
        return FileResponse(file_handle, as_attachment=True, filename=filename)

    @action(detail=False, methods=["get"], permission_classes=[IsAdminUserRole])
    def export_csv(self, request):
        qs = self.filter_queryset(self.get_queryset())
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="alumni_profiles.csv"'

        writer = csv.writer(response)
        writer.writerow([
            "Username",
            "Full Name",
            "Group",
            "Graduation Year",
            "Direction",
            "Profile",
            "Study Form",
            "Employment Status",
            "Employer",
            "Workplace",
            "Position",
            "Continued Education",
        ])
        for p in qs:
            writer.writerow([
                p.user.username,
                p.user.get_full_name(),
                p.academic_group.name if p.academic_group else "",
                p.graduation_year or "",
                p.direction or "",
                p.profile or "",
                p.get_study_form_display() if p.study_form else "",
                p.get_employment_status_display(),
                p.employer.company_name if p.employer else "",
                p.workplace or "",
                p.position or "",
                p.continuing_education_place or "",
            ])

        return response
