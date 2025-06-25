from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from users.models import User
from .models import Employer

@receiver(post_save, sender=User)
def create_employer_profile(sender, instance, created, **kwargs):
    if created and instance.role == User.Roles.EMPLOYER:
        Employer.objects.create(user=instance, company_name="")

@receiver(post_delete, sender=Employer)
def delete_employer_user(sender, instance, **kwargs):
    if instance.user:
        instance.user.delete()
