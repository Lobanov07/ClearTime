from rest_framework import routers
from .views import TaskApiViewSet

router = routers.DefaultRouter()
router.register(r'api/task', TaskApiViewSet)