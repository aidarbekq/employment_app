from rest_framework import generics, permissions
from .models import User
from .serializers import UserRegistrationSerializer, UserSerializer
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = (permissions.AllowAny,)


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
    permission_classes = (permissions.IsAdminUser,)
