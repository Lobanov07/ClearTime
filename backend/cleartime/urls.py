from django.urls import path, include
from .routers import router
from .views import CurrentUserView

urlpatterns = [
    path('', include(router.urls)),
    path('api/user/', CurrentUserView.as_view(), name='current_user')
]