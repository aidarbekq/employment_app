import csv

from django.http import HttpResponse
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
    queryset = AcademicGroup.objects.all()
    serializer_class = AcademicGroupSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["graduation_year", "study_form", "degree_level", "is_active"]
    search_fields = ["name", "direction_name", "profile"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [permissions.IsAuthenticated()]
        return [IsAdminUserRole()]


class AlumniProfileViewSet(viewsets.ModelViewSet):
    queryset = AlumniProfile.objects.all().select_related("user", "employer", "academic_group")
    serializer_class = AlumniProfileSerializer
    parser_classes = (JSONParser, MultiPartParser, FormParser)
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
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
        "specialty",
        "direction",
        "profile",
        "academic_group__name",
        "workplace",
        "position",
    ]

    def get_serializer_class(self):
        if self.action == "create" and self.request.user.role == self.request.user.Roles.ADMIN:
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
        base_qs = AlumniProfile.objects.all().select_related("user", "employer", "academic_group")
        if user.role in (user.Roles.ADMIN, user.Roles.EMPLOYER):
            return base_qs
        return base_qs.filter(user=user)

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
