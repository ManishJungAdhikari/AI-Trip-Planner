from django.conf import settings
from django.db import models
from django.utils import timezone


class User(models.Model):
    class RoleChoices(models.TextChoices):
        ADMIN = "admin", "Admin"
        USER = "user", "User"

    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    password_hash = models.CharField(max_length=255)
    role = models.CharField(max_length=20, choices=RoleChoices.choices, default=RoleChoices.USER)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "users"


class PasswordResetToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="password_reset_tokens")
    token = models.CharField(max_length=255, unique=True)
    expires_at = models.DateTimeField()
    used_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "password_reset_tokens"
        ordering = ["-created_at"]

    @property
    def is_active(self):
        return self.used_at is None and self.expires_at > timezone.now()
