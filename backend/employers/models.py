from django.conf import settings
from django.db import models


def partner_logo_upload_path(instance, filename):
    return f"partners/{instance.slug or instance.name}/{filename}"


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
        return self.company_name or self.user.username


class Partner(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    description = models.TextField(blank=True, default="")
    website = models.URLField(blank=True, default="")
    logo = models.FileField(upload_to=partner_logo_upload_path, blank=True, null=True)
    employer = models.ForeignKey(
        Employer,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="partner_cards",
        help_text="Optional link to an employer profile in the system.",
    )
    order = models.PositiveIntegerField(default=100)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order", "name"]
        verbose_name = "Партнер"
        verbose_name_plural = "Партнеры"

    def __str__(self):
        return self.name
