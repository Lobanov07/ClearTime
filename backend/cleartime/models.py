from django.db import models

# Create your models here.
class Task(models.Model):
    title = models.CharField("Title", blank=False, max_length=128)
    description = models.CharField("Description", blank=True, max_length=256)