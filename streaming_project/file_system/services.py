from rest_framework.generics import get_object_or_404

from file_system.models import Folder


class FileSystemService:
   @staticmethod
   def get_struct_by_directory(department, directory_id = None):
       if directory_id:
           folder = get_object_or_404(Folder, id=directory_id)
       else:
           folder = department.folder
       folders = folder.subfolders.filter(department=department)
       files = folder.files.all()
       response = {
           'folders': folders,
           'files': files
           }
       return response
   @staticmethod
   def create_file(validated_data, user):
       # Добавляем текущего пользователя
       validated_data['uploaded_by'] = user
       # Создаём и сохраняем файл
       file = File.objects.create(**validated_data)
       return file
   @staticmethod
   def delete_file(file):
       File.objects.filter(file)
       return True

   @staticmethod
   def create_folder(validated_data):
       parent_folder= Folder.objects.get(pk=validated_data['parent'])
       folder = Folder.objects.create(
           name=validated_data['name'],
           department=parent_folder.departments,
           path=validated_data['path'],
           parent=parent_folder
       )
       return folder
   def delete_folder(self, folder):
       folder.delete()
       return True
        







