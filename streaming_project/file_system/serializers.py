from rest_framework import serializers
from .models import File, Folder
from users.models import Department


class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = '__all__'

class FolderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Folder
        fields = '__all__'
class FolderCreateSerializer(serializers.ModelSerializer):
    path = serializers.CharField(required=False, allow_blank=True)
    class Meta:
        model = Folder
        fields = ['name', 'path', 'parent']


