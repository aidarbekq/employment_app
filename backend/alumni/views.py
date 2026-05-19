from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
import csv
from django.http import HttpResponse
from .models import AlumniProfile
from .serializers import AlumniProfileSerializer, GetAlumniProfileSerializer
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters

class IsAlumniOwnerOrReadOnly(permissions.BasePermission):
    """
    Пользователь может редактировать только свой профиль (для роли ALUMNI).
    Администратор (role=ADMIN) может редактировать любой.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        # если админ
        if request.user.role == request.user.Roles.ADMIN:
            return True
        # иначе, проверяем, что профиль принадлежит текущему юзеру
        return obj.user == request.user


class AlumniProfileViewSet(viewsets.ModelViewSet):
    queryset = AlumniProfile.objects.all().select_related("user", "employer")
    serializer_class = AlumniProfileSerializer
    parser_classes = (JSONParser, MultiPartParser, FormParser)
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["graduation_year", "is_employed", "employer"]
    search_fields = ["user__first_name", "user__last_name", "specialty"]

    def get_serializer_class(self):
        if self.action in ("list", "retrieve"):
            return GetAlumniProfileSerializer
        return AlumniProfileSerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            # любой авторизованный пользователь может смотреть список/детали
            return [permissions.IsAuthenticated()]
        # создание/обновление/удаление
        return [permissions.IsAuthenticated(), IsAlumniOwnerOrReadOnly()]

    def perform_create(self, serializer):
        # авто-привязка current user
        serializer.save(user=self.request.user)

    def get_queryset(self):
        user = self.request.user
        if user.role == user.Roles.ADMIN or user.role == user.Roles.EMPLOYER:
            return AlumniProfile.objects.all()
        # обычный выпускник видит только свой
        return AlumniProfile.objects.filter(user=user)

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def export_csv(self, request):
        """
        Возвращает CSV всех профилей выпускников (возможно, для администратора).
        """
        if request.user.role != request.user.Roles.ADMIN:
            return Response({"detail": "No permission"}, status=403)

        qs = AlumniProfile.objects.select_related("user", "employer").all()
        # Формируем HTTPResponse с csv
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="alumni_profiles.csv"'

        writer = csv.writer(response)
        writer.writerow(["Username", "Full Name", "Graduation Year", "Specialty", "Employed", "Employer", "Position"])
        for p in qs:
            writer.writerow([
                p.user.username,
                p.user.get_full_name(),
                p.graduation_year,
                p.specialty,
                "Yes" if p.is_employed else "No",
                p.employer.company_name if p.employer else "",
                p.position or "",
            ])

        return response
