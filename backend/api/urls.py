from django.urls import include, path
from rest_framework.authtoken.views import obtain_auth_token
from rest_framework.routers import DefaultRouter

from .views import IdeaViewSet, RegisterView

app_name = 'api'

router = DefaultRouter()
router.register(r'ideas', IdeaViewSet, basename='idea')

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', obtain_auth_token, name='login'),
    path('', include(router.urls)),
]
