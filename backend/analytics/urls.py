from django.urls import path
from .views import EmploymentReportExportView, EmploymentStatsView

urlpatterns = [
    path("employment-stats/", EmploymentStatsView.as_view(), name="employment-stats"),
    path("employment-report.<str:export_format>", EmploymentReportExportView.as_view(), name="employment-report-export"),
]
