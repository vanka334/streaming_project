from django.shortcuts import render
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from file_system.models import Folder
from file_system.serializers import FileSerializer, FolderSerializer
import file_system.services as services

# Create your views here.
class FileSystemList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        departments = user.departments.all()
        directory_id = request.data.get('directory')
        folders = []
        files = []
        if len(departments) > 1:

            for department in departments:
                if department.isManagement:
                    struct = services.FileSystemService.get_struct_by_directory(department, directory_id)
                    folders.extend(struct['folders'])
                    files.extend(struct['files'])
        else:
            department = departments[0]
            struct = services.FileSystemService.get_struct_by_directory(department, directory_id)
            folders = struct['folders']
            files = struct['files']

        response = {
            'folders': FolderSerializer(folders, many=True).data,
            'files': FileSerializer(files, many=True).data,
        }
        return Response(response)
    def post(self, request):
        serializer = FileSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Используем сервис для создания файла
            file = services.FileSystemService.create_file(serializer.validated_data, request.user)
            # Возвращаем данные созданного файла
            return Response(FileSerializer(file).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            # Обрабатываем ошибки
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class FolderAPIView(APIView):
    def post(self, request):
        serializer = FolderSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        try:
                folder = services.FileSystemService.create_folder(serializer)
                return Response(FolderSerializer(folder).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    def delete(self, request):
        id = request.data["folder_id"]
        folder = Folder.objects.get(pk = id)
        if(folder):
            if(services.FileSystemService.delete_folder(folder)):
                return Response({'status': 'Success'}, status=status.HTTP_200_OK)
            else: return Response({'status': 'Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else: return Response({'status': 'Error'}, status=status.HTTP_404_NOT_FOUND)




