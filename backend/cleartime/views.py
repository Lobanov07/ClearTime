from rest_framework import viewsets, response
from django.shortcuts import get_list_or_404
from .serializers.task_serializer import TaskSerializer
from .models import Task

# Create your views here.
class TaskApiViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

class UserApiViewSet(viewsets.ViewSet):
    def retrieve(self, request, pk=None):
        queryset = Task.objects.all()
        tasks = get_list_or_404(queryset, user_id=pk)
        serialized = TaskSerializer(tasks, many=True)
        return response.Response(serialized.data)
    
user_tasks = UserApiViewSet.as_view({'get': 'retrieve'})