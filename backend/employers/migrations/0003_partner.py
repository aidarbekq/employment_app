# Generated manually for partner management.

import django.db.models.deletion
import employers.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("employers", "0002_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Partner",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=255)),
                ("slug", models.SlugField(max_length=255, unique=True)),
                ("description", models.TextField(blank=True, default="")),
                ("website", models.URLField(blank=True, default="")),
                ("logo", models.FileField(blank=True, null=True, upload_to=employers.models.partner_logo_upload_path)),
                ("order", models.PositiveIntegerField(default=100)),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("employer", models.ForeignKey(blank=True, help_text="Optional link to an employer profile in the system.", null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="partner_cards", to="employers.employer")),
            ],
            options={
                "verbose_name": "Партнер",
                "verbose_name_plural": "Партнеры",
                "ordering": ["order", "name"],
            },
        ),
    ]
