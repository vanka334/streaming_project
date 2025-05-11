from django.urls import path
from .views import create_video_call, get_video_token

urlpatterns = [
    path("create/", create_video_call),
    path("token/", get_video_token),
]
