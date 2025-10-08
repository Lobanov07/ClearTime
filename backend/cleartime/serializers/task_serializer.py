from rest_framework import serializers
from django.contrib.auth.models import User
from cleartime.models import Task
from .user_serializer import UserSerializer

class TaskSerializer(serializers.HyperlinkedModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Task
        fields = ("id","user","title","description","is_completed")