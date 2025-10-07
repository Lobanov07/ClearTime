from rest_framework import serializers
from cleartime.models import Task

class TaskSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Task
        fields = ["id","title","description"]
        
        