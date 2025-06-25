from django.urls import path
from .views import UserRegistrationView, UserDetailView, AdminUserDetailView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("register/", UserRegistrationView.as_view(), name="user-register"),
    path("login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("me/", UserDetailView.as_view(), name="user-details"),
    path("user/<int:pk>/", AdminUserDetailView.as_view(), name="user-details"),
]
