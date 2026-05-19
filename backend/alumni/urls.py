from rest_framework.routers import DefaultRouter
from .views import AlumniProfileViewSet

router = DefaultRouter()
router.register(r"alumni-profiles", AlumniProfileViewSet, basename="alumniprofile")

urlpatterns = router.urls
