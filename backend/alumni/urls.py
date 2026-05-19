from rest_framework.routers import DefaultRouter
from .views import AcademicGroupViewSet, AlumniProfileViewSet

router = DefaultRouter()
router.register(r"academic-groups", AcademicGroupViewSet, basename="academic-group")
router.register(r"alumni-profiles", AlumniProfileViewSet, basename="alumni-profile")

urlpatterns = router.urls
