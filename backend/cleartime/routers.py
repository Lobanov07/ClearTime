from rest_framework import routers
from .views import TaskApiViewSet, UserApiViewSet

router = routers.DefaultRouter()
router.register(r'api/task', TaskApiViewSet)
router.include_root_view = False