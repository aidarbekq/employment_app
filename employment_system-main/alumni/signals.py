from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from users.models import User
from .models import AlumniProfile

@receiver(post_save, sender=User)
def create_alumni_profile(sender, instance, created, **kwargs):
    if created and instance.role == User.Roles.ALUMNI:
        AlumniProfile.objects.create(user=instance)

@receiver(post_delete, sender=AlumniProfile)
def delete_user_with_alumni_profile(sender, instance, **kwargs):
    user = instance.user
    if user and user.role == user.Roles.ALUMNI:
        user.delete()