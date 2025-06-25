from rest_framework import viewsets, permissions, filters
from .models import Employer
from .serializers import EmployerSerializer

class IsEmployerOwnerOrReadOnly(permissions.BasePermission):
    """
    Только владелец профиля Employer (role=EMPLOYER) или ADMIN может редактировать.
    Остальные могут только read-only.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        # ADMIN может
        if request.user.role == request.user.Roles.ADMIN:
            return True
        # владелец записи (user)
        return obj.user == request.user

class EmployerViewSet(viewsets.ModelViewSet):
    queryset = Employer.objects.all().select_related("user")
    serializer_class = EmployerSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["company_name", "address", "phone"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated(), IsEmployerOwnerOrReadOnly()]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_queryset(self):
        user = self.request.user
        if user.role == user.Roles.ADMIN:
            return Employer.objects.all()
        # Если работодатель, он смотрит только свой
        if user.role == user.Roles.EMPLOYER:
            return Employer.objects.filter(user=user)
        # для остальных (выпускники) можно показывать всех работодателей, чтобы выбирать
        return Employer.objects.all()
