"""
URL configuration for streaming_project project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.conf.urls.static import static

from django.urls import path, include, re_path
from drf_yasg import openapi
from drf_yasg.views import get_schema_view

from . import settings
from .swagger import urlpatterns as swagger_urls



urlpatterns = [

    path('admin/', admin.site.urls),
    path('api/v1/users/', include('users.urls')),
    path('api/v1/files/', include('file_system.urls')),
    path('api/v1/taskmanager/', include('taskmanager.urls')),
    path('api/', include(swagger_urls)),
    path('metrics/', include('django_prometheus.urls')),

]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
