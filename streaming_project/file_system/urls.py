from django.urls import path

from file_system import views

urlpatterns = [
    path('filesystem/', views.FileSystemList.as_view(), name='filesystem-list'),
    path('folder/', views.FolderAPIView.as_view(), name='folder'),
    path('file/', views.FileAPIView.as_view(), name='file')
]