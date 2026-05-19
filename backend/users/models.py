from django.contrib.auth.models import AbstractUser
from django.db import models
from django.contrib.auth.models import BaseUserManager


class CustomUserManager(BaseUserManager):
    def create_user(self, username, email=None, password=None, **extra_fields):
        if not username:
            raise ValueError("The Username must be set")
        email = self.normalize_email(email)
        extra_fields.setdefault("role", User.Roles.ALUMNI)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email=None, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", User.Roles.ADMIN)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")
        if extra_fields.get("role") != User.Roles.ADMIN:
            raise ValueError("Superuser must have role=ADMIN.")

        return self.create_user(username, email, password, **extra_fields)

class User(AbstractUser):
    """
    Пользовательская модель:
      - username, email, password, first_name, last_name, etc. (унаследовано)
      - добавляем поле 'role': выпускник, работодатель, админ
    """
    class Roles(models.TextChoices):
        ALUMNI = "ALUMNI", "Alumni"
        EMPLOYER = "EMPLOYER", "Employer"
        ADMIN = "ADMIN", "Administrator"

    role = models.CharField(
        max_length=20,
        choices=Roles.choices,
        default=Roles.ALUMNI,
        help_text="Role of the user: Alumni, Employer, or Administrator"
    )

    objects = CustomUserManager()

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
