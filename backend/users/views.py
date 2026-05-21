from drf_spectacular.utils import extend_schema
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .models import User
from .serializers import (
    AdminPasswordResetSerializer,
    ChangeOwnPasswordSerializer,
    UserRegistrationSerializer,
    UserSerializer,
)


class IsAdminUserRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == request.user.Roles.ADMIN)


class ThrottledTokenObtainPairView(TokenObtainPairView):
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth"


class ThrottledTokenRefreshView(TokenRefreshView):
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth"


class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = (permissions.AllowAny,)
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth"


class UserDetailView(generics.RetrieveUpdateAPIView):
    """
    Позволяет пользователю смотреть и редактировать свои данные (кроме роли).
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user


class AdminUserDetailView(generics.RetrieveUpdateAPIView):
    """
    Позволяет админу смотреть и редактировать данные.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (IsAdminUserRole,)


@extend_schema(request=ChangeOwnPasswordSerializer, responses={200: dict})
class ChangeOwnPasswordView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "password"
    serializer_class = ChangeOwnPasswordSerializer

    def post(self, request):
        serializer = ChangeOwnPasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Password changed successfully."}, status=status.HTTP_200_OK)


@extend_schema(request=AdminPasswordResetSerializer, responses={200: dict})
class AdminChangeUserPasswordView(APIView):
    permission_classes = (IsAdminUserRole,)
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "password"
    serializer_class = AdminPasswordResetSerializer

    def post(self, request, pk: int):
        target_user = generics.get_object_or_404(User, pk=pk)
        serializer = AdminPasswordResetSerializer(
            data=request.data,
            context={"request": request, "target_user": target_user},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Password changed successfully."}, status=status.HTTP_200_OK)
