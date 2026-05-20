from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    AdminChangeUserPasswordView,
    AdminUserDetailView,
    ChangeOwnPasswordView,
    UserDetailView,
    UserRegistrationView,
)

urlpatterns = [
    path("register/", UserRegistrationView.as_view(), name="user-register"),
    path("login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("me/", UserDetailView.as_view(), name="user-details"),
    path("password/change/", ChangeOwnPasswordView.as_view(), name="user-password-change"),
    path("user/<int:pk>/", AdminUserDetailView.as_view(), name="admin-user-details"),
    path("user/<int:pk>/password/", AdminChangeUserPasswordView.as_view(), name="admin-user-password-change"),
]
