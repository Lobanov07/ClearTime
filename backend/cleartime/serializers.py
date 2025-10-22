from rest_framework import serializers
from django.contrib.auth.models import User
from cleartime.models import Task

class TaskSerializer(serializers.ModelSerializer):    
    class Meta:
        model = Task
        fields = ("id", "title", "description", "is_completed")

class UserSerializer(serializers.ModelSerializer):
    tasks = TaskSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = ("id", "username", "email", "tasks")