from django.urls import path
from .views import EmploymentReportPdfView, EmploymentStatsView

urlpatterns = [
    path("employment-stats/", EmploymentStatsView.as_view(), name="employment-stats"),
    path("employment-report.pdf", EmploymentReportPdfView.as_view(), name="employment-report-pdf"),
]
