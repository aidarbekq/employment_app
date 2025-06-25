from django.db import models
from django.conf import settings

class Employer(models.Model):
    """
    Работодатель/организация:
      - Привязан к User с role='EMPLOYER'
      - Содержит название компании, адрес, контакты
    """
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="employer_profile")
    company_name = models.CharField(max_length=255, null=True, blank=True)
    address = models.CharField(max_length=512, null=True, blank=True)
    phone = models.CharField(max_length=50, null=True, blank=True)
    description = models.TextField(blank=True, null=True, help_text="Brief description of the company")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["company_name"]

    def __str__(self):
        return self.company_name
