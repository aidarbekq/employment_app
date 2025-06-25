from django.urls import path
from .views import EmploymentStatsView

urlpatterns = [
    path("employment-stats/", EmploymentStatsView.as_view(), name="employment-stats"),
]
