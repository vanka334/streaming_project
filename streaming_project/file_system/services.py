from rest_framework.exceptions import ValidationError, NotFound
from rest_framework.generics import get_object_or_404

from file_system.models import Folder

from file_system.models import File


class FileSystemService:
   @staticmethod
   def get_struct_by_directory(department, directory_id = None):
       if directory_id:
           print("if dir_id")
           folder = get_object_or_404(Folder, id=directory_id)

       else:
           print("else dir_id")
           folder = get_object_or_404(Folder,name=department.folder)
       folders = folder.subfolders.all()
       print(folders)
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
   def create_folder(validated_data):
       print("PARENT VALUE:", validated_data['parent'])
       print("PARENT TYPE:", type(validated_data['parent']))
       parent_folder= validated_data['parent']

       # Если path пустой — генерим
       path = validated_data.get('path')
       if not path:
           # Берём корневую папку (у которой нет parent)
           root_folder = Folder.objects.filter(parent=None).first()
           if root_folder:
               path = f"{root_folder.path}\\{validated_data['name']}"
           else:
               # если нет root-папки — создаём с именем как путь
               path = validated_data['name']
       folder = Folder.objects.create(
           name=validated_data['name'],

           path=path,
           parent=parent_folder
       )
       folder.departments.set(parent_folder.departments.all())
       print(folder)
       return folder
   def delete_folder(self, folder):
       folder.delete()
       return True
        
class FileService:
    @staticmethod
    def create_file(file, folder_id, user, name=None):
        if not file or not folder_id:
            raise ValidationError('Файл и папка обязательны')

        try:
            folder = Folder.objects.get(id=folder_id)
        except Folder.DoesNotExist:
            raise NotFound('Папка не найдена')

        uploaded_file = File.objects.create(
            folder=folder,
            file=file,
            name=name or file.name,
            owner=user
        )

        return uploaded_file
    @staticmethod
    def delete_file(file_id):
        file = File.objects.get(id=file_id)
        file.delete()
        return True





