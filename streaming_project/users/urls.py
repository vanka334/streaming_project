from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import CreateInviteView, RetrieveInviteView, RegisterView, PasswordResetRequestView, \
    PasswordResetConfirmView
from users import views


urlpatterns = [
    path('register/', views.AuthApiView.as_view(), name='register'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('users/', views.UserListView.as_view(), name='users'),
    path('users/<int:pk>/', views.UserDetailView.as_view(), name='users'),
    path('users/isManager/', views.checkUser, name='isManager'),
    path('callUsers/', views.getUsersDepartaments, name='callUser'),
    path('invites/', CreateInviteView.as_view()),               # POST
    path('invites/<uuid:token>/', RetrieveInviteView.as_view()), # GET
    path('password-reset/', PasswordResetRequestView.as_view()),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view()),
    # Departments URLs
    path('departments/', views.DepartmentsListAPIView.as_view(), name='departments-list'),
    path('departments/<int:pk>/', views.DepartmentsDetailAPIView.as_view(), name='departments-detail'),

    # Project URLs
    path('projects/', views.ProjectListAPIView.as_view(), name='projects-list'),
    path('projects/<int:pk>/', views.ProjectDetailAPIView.as_view(), name='projects-detail'),
]