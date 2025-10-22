from rest_framework import viewsets, response, permissions, generics
from django.shortcuts import get_list_or_404
from .serializers import TaskSerializer, UserSerializer
from .models import Task

# Create your views here.
class TaskApiViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class UserApiViewSet(viewsets.ViewSet):
    def retrieve(self, request, pk=None):
        queryset = Task.objects.all()
        tasks = get_list_or_404(queryset, user_id=pk)
        serialized = TaskSerializer(tasks, many=True)
        return response.Response(serialized.data)

user_tasks = UserApiViewSet.as_view({'get': 'retrieve'})

class CurrentUserView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user