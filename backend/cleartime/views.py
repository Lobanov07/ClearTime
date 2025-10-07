from rest_framework import viewsets
from .serializers.task_serializer import TaskSerializer
from .models import Task

# Create your views here.
class TaskApiViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    