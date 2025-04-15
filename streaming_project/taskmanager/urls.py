from django.urls import path

from taskmanager import views

urlpatterns = [
    # Status URLs
    path('status/', views.StatusListAPIView.as_view(), name='status-list'),
    path('status/<int:pk>/', views.StatusDetailAPIView.as_view(), name='status-detail'),

    # Task URLs
    path('task/', views.TaskListAPIView.as_view(), name='task-list'),
    path('task/<int:pk>/', views.TaskDetailAPIView.as_view(), name='task-detail'),

    # Comment URLs
    path('comment/', views.CommentListAPIView.as_view(), name='comment-list'),
    path('comment/<int:pk>/', views.CommentDetailAPIView.as_view(), name='comment-detail'),
    path('comment_by_task/', views.get_comment_by_task, name='comment-by-task'),

]