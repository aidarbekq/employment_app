from django.db import models
from django.conf import settings
from employers.models import Employer

class Vacancy(models.Model):
    """
    Вакансия от работодателя:
     - title, description, requirements
     - владельцем является профиль Employer
     - дата публикации
    """
    employer = models.ForeignKey(Employer, on_delete=models.CASCADE, related_name="vacancies")
    title = models.CharField(max_length=255, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    requirements = models.TextField(null=True, blank=True)
    location = models.CharField(max_length=255, null=True, blank=True)
    salary = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} @ {self.employer.company_name}"
