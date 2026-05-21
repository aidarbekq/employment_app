"""
URL configuration for employment_system project.
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

from .health import health_check

urlpatterns = [
    path("django-admin/", admin.site.urls),
    path("api/health/", health_check, name="health-check"),

    # Authentication, registration, JWT
    path("api/users/", include("users.urls")),

    # API endpoints
    path("api/alumni/", include("alumni.urls")),
    path("api/employers/", include("employers.urls")),
    path("api/vacancies/", include("vacancies.urls")),
    path("api/analytics/", include("analytics.urls")),

]

if settings.ENABLE_API_DOCS:
    urlpatterns += [
        path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
        path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
        path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
    ]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
