from drf_yasg.utils import swagger_auto_schema
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import UserSerializer, UserCallSerializer, RegisterSerializer
from .services import RegService, DepartmentService, ProjectService, UserService, PasswordResetService

from users.serializers import UserRegistrationSerializer, DepartmentSerializer, ProjectSerializer


#
class AuthApiView(APIView):
   permission_classes = [AllowAny]

   def post(self, request):
      serializer = RegisterSerializer(data=request.data)
      if not serializer.is_valid():
         errors = {}
         for field, error_details in serializer.errors.items():
            errors[field] = [str(error) for error in error_details]
         return Response({"error": errors}, status=status.HTTP_400_BAD_REQUEST)

      try:
         reg_info = RegService.register(
            username=serializer.validated_data['username'],
            email=serializer.validated_data['email'],
            password=serializer.validated_data['password'],
            name=serializer.validated_data['name'],
            surname=serializer.validated_data['surname'],
            patronymic=serializer.validated_data.get('patronymic', ''),
            token=serializer.validated_data['token']
         )
         return Response(reg_info, status=status.HTTP_201_CREATED)
      except Exception as e:
         return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class UserListView(APIView):
   permission_classes = [IsAuthenticated]

   @swagger_auto_schema(tags=["User"])
   def get(self, request):
      users = UserService.get_all_users()
      serializer = UserSerializer(users, many=True)
      return Response(serializer.data)
class UserDetailView(APIView):
   permission_classes = [IsAuthenticated]

   @swagger_auto_schema(tags=["User"])
   def get(self, request, pk):
      users = UserService.get_user_by_id(pk)
      serializer = UserSerializer(users)
      return Response(serializer.data)

   @swagger_auto_schema(tags=["User"])
   def patch(self, request, pk):
      user = UserService.get_user_by_id(pk)
      if not user:
         return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)

      serializer = UserSerializer(user, data=request.data, partial=True)
      if serializer.is_valid():
         updated_user = UserService.update_user_profile(user, **serializer.validated_data)
         return Response(UserSerializer(updated_user).data)

      return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)





class DepartmentsListAPIView(APIView):
   permission_classes = [IsAuthenticated]

   @swagger_auto_schema(tags=["Departments"])
   def get(self, request):
      departments = DepartmentService.get_all_departments()
      serializer = DepartmentSerializer(departments, many=True)
      return Response(serializer.data)

   @swagger_auto_schema(tags=["Departments"])
   def post(self, request):
      serializer = DepartmentSerializer(data=request.data)
      if serializer.is_valid():
         department = DepartmentService.create_department(
            serializer.validated_data['name'],
            serializer.validated_data['users']
         )
         return Response(DepartmentSerializer(department).data,
                         status=status.HTTP_201_CREATED)
      return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DepartmentsDetailAPIView(APIView):
   permission_classes = [IsAuthenticated]

   @swagger_auto_schema(tags=["Departments"])
   def get(self, request, pk):
      department = DepartmentService.get_department_by_id(pk)
      if department:
         serializer = DepartmentSerializer(department)
         return Response(serializer.data)
      return Response({"error": "Department not found"},
                      status=status.HTTP_404_NOT_FOUND)

   @swagger_auto_schema(tags=["Departments"])
   def put(self, request, pk):
      department = DepartmentService.get_department_by_id(pk)
      if not department:
         return Response({"error": "Department not found"},
                         status=status.HTTP_404_NOT_FOUND)

      serializer = DepartmentSerializer(department, data=request.data)
      if not serializer.is_valid():
         return Response(serializer.errors,
                         status=status.HTTP_400_BAD_REQUEST)

      updated_department = DepartmentService.update_department(
         name=serializer.validated_data['name'],
         users=serializer.validated_data['users']
      )
      return Response(DepartmentSerializer(updated_department).data)

   @swagger_auto_schema(tags=["Departments"])
   def delete(self, request, pk):
      department = DepartmentService.get_department_by_id(pk)
      if not department:
         return Response({"error": "Department not found"},
                         status=status.HTTP_404_NOT_FOUND)

      DepartmentService.delete_department(pk)
      return Response(status=status.HTTP_204_NO_CONTENT)


class ProjectListAPIView(APIView):
   @swagger_auto_schema(tags=["Project"])
   def get(self, request):
      projects = ProjectService.get_all_projects()
      serializer = ProjectSerializer(projects, many=True)
      return Response(serializer.data)

   @swagger_auto_schema(tags=["Project"])
   def post(self, request):
      serializer = ProjectSerializer(data=request.data)
      if serializer.is_valid():
         project = ProjectService.create_project(**serializer.validated_data)
         return Response(ProjectSerializer(project).data,
                         status=status.HTTP_201_CREATED)
      return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProjectDetailAPIView(APIView):
   @swagger_auto_schema(tags=["Project"])
   def get(self, request, pk):
      project, statistics = ProjectService.get_project_by_id(pk)
      if not project:
         return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

      serializer = ProjectSerializer(project)
      data = serializer.data
      data["statistics"] = statistics

      return Response(data)

   @swagger_auto_schema(tags=["Project"])
   def put(self, request, pk):
      project = ProjectService.get_project_by_id(pk)
      if not project:
         return Response({"detail": "Not found."},
                         status=status.HTTP_404_NOT_FOUND)

      serializer = ProjectSerializer(project, data=request.data, partial=True)
      if not serializer.is_valid():
         return Response(serializer.errors,
                         status=status.HTTP_400_BAD_REQUEST)

      updated_project = ProjectService.update_project(
         project_id=pk,
         name=serializer.validated_data.get('name'),
         description=serializer.validated_data.get('description'),
         departament_ids=serializer.validated_data.get('departament')
      )

      if not updated_project:
         return Response({"detail": "Update failed"},
                         status=status.HTTP_400_BAD_REQUEST)

      return Response(ProjectSerializer(updated_project).data)

   @swagger_auto_schema(tags=["Project"])
   def delete(self, request, pk):
      success = ProjectService.delete_project(pk)
      if not success:
         return Response({"detail": "Not found."},
                         status=status.HTTP_404_NOT_FOUND)
      return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
def checkUser(request):
   user_id = request.query_params.get('user_id')
   response = UserService.checkUser(user_id=user_id)
   return Response({'result':response}, status=status.HTTP_200_OK)


@api_view(['GET'])
def getUsersDepartaments(request):

   users = UserService.get_all_users()
   serializer = UserCallSerializer(users, many=True)
   return Response(serializer.data)

from rest_framework import generics

from .models import UserInvite
from .serializers import (
    UserInviteCreateSerializer,
    UserInviteRetrieveSerializer,
)


class CreateInviteView(generics.CreateAPIView):
    serializer_class = UserInviteCreateSerializer
    permission_classes = [IsAuthenticated]


class RetrieveInviteView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    queryset = UserInvite.objects.all()
    serializer_class = UserInviteRetrieveSerializer
    lookup_field = 'token'



class RegisterView(APIView):
   permission_classes = [AllowAny]

   def post(self, request):
      serializer = RegisterSerializer(data=request.data)
      if serializer.is_valid():
         result = RegService.register(**serializer.validated_data)
         return Response(result, status=status.HTTP_201_CREATED)
      return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetRequestView(APIView):
    permission_classes = []

    def post(self, request):
        email = request.data.get('email')
        PasswordResetService.send_reset_email(
            email=email,
            domain=request.get_host(),
            protocol=request.scheme
        )
        return Response({"detail": "Письмо отправлено (если пользователь существует)."}, status=status.HTTP_200_OK)


class PasswordResetConfirmView(APIView):
    permission_classes = []

    def post(self, request):
        uid = request.data.get("uid")
        token = request.data.get("token")
        password = request.data.get("password")

        try:
            PasswordResetService.reset_password(uid, token, password)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"detail": "Пароль успешно изменён"}, status=status.HTTP_200_OK)