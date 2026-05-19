from rest_framework.routers import DefaultRouter

from .views import EmployerViewSet, PartnerViewSet

router = DefaultRouter()
router.register(r"employers", EmployerViewSet, basename="employer")
router.register(r"partners", PartnerViewSet, basename="partner")

urlpatterns = router.urls
