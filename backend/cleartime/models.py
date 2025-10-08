from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Task(models.Model):
    title = models.CharField("Title", blank=False, max_length=128)
    description = models.CharField("Description", blank=True, max_length=256)
    is_completed = models.BooleanField('Is completed', default=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tasks")
    
    def __str__(self) -> str:
        return self.title