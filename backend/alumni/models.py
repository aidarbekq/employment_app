from django.db import models
from django.conf import settings

def resume_upload_path(instance, filename):
    # присваиваем файл в папку media/resumes/<username>/<filename>
    return f"resumes/{instance.user.username}/{filename}"

class AlumniProfile(models.Model):
    """
    Профиль выпускника:
      - привязан к User с role='ALUMNI'
      - если работает: получаем ForeignKey на Employer
      - если не работает: хранится файл резюме
      - дата выпуска, специальность, контакты
    """
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="alumni_profile")
    graduation_year = models.PositiveIntegerField(null=True, blank=True)
    specialty = models.CharField(max_length=255, null=True, blank=True)
    is_employed = models.BooleanField(default=False)
    employer = models.ForeignKey("employers.Employer", on_delete=models.SET_NULL, null=True, blank=True, related_name="employees")
    resume = models.FileField(upload_to=resume_upload_path, null=True, blank=True)
    position = models.CharField(max_length=255, null=True, blank=True, help_text="Current position/title at employer (if employed)")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-graduation_year", "user__last_name"]

    def __str__(self):
        return f"{self.user.get_full_name()} ({self.graduation_year})"
