from django.shortcuts import render
from django.utils.decorators import method_decorator
from drf_yasg.utils import swagger_auto_schema

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Status, Task, Comment
from .serializers import StatusSerializer, TaskSerializer, CommentSerializer
from .services import StatusService, TaskService, CommentService

class StatusListAPIView(APIView):
    @swagger_auto_schema(tags=["Status"])
    def get(self, request):
        statuses = StatusService.get_all_statuses()
        serializer = StatusSerializer(statuses, many=True)
        return Response(serializer.data)

    @swagger_auto_schema(tags=["Status"])
    def post(self, request):
        serializer = StatusSerializer(data=request.data)
        if serializer.is_valid():
            status = StatusService.create_status(**serializer.validated_data)
            return Response(StatusSerializer(status).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class StatusDetailAPIView(APIView):
    @swagger_auto_schema(tags=["Status"])
    def get(self, request, pk):
        status = StatusService.get_status_by_id(pk)
        if status:
            serializer = StatusSerializer(status)
            return Response(serializer.data)
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    @swagger_auto_schema(tags=["Status"])
    def put(self, request, pk):
        status = StatusService.get_status_by_id(pk)
        if status:
            serializer = StatusSerializer(status, data=request.data, partial=True)
            if serializer.is_valid():
                updated_status = StatusService.update_status(pk, **serializer.validated_data)
                return Response(StatusSerializer(updated_status).data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    @swagger_auto_schema(tags=["Status"])
    def delete(self, request, pk):
        status = StatusService.delete_status(pk)
        if status:
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

class TaskListAPIView(APIView):
    @swagger_auto_schema(tags=["Task"])
    def get(self, request):
        tasks = TaskService.get_all_tasks()
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)

    @swagger_auto_schema(tags=["Task"])
    def post(self, request):
        serializer = TaskSerializer(data=request.data)
        if serializer.is_valid():
            task = TaskService.create_task(**serializer.validated_data)
            return Response(TaskSerializer(task).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TaskDetailAPIView(APIView):
    @swagger_auto_schema(tags=["Task"])
    def get(self, request, pk):
        task = TaskService.get_task_by_id(pk)
        if task:
            serializer = TaskSerializer(task)
            return Response(serializer.data)
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    @swagger_auto_schema(tags=["Task"])
    def put(self, request, pk):
        task = TaskService.get_task_by_id(pk)
        if task:
            serializer = TaskSerializer(task, data=request.data, partial=True)
            if serializer.is_valid():
                updated_task = TaskService.update_task(pk, **serializer.validated_data)
                return Response(TaskSerializer(updated_task).data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    @swagger_auto_schema(tags=["Task"])
    def delete(self, request, pk):
        task = TaskService.delete_task(pk)
        if task:
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    @swagger_auto_schema(tags=["Task"])
    def patch(self, request, pk):
        print(f"PATCH request received for task {pk}")
        task = TaskService.get_task_by_id(pk)
        if task:
            serializer = TaskSerializer(task, data=request.data, partial=True)
            if serializer.is_valid():
                updated_task = TaskService.update_task(pk, **serializer.validated_data)
                return Response(TaskSerializer(updated_task).data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
class CommentListAPIView(APIView):
    @swagger_auto_schema(tags=["Comment"])
    def get(self, request):
        comments = CommentService.get_all_comments()
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)

    @swagger_auto_schema(tags=["Comment"])
    def post(self, request):
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            comment = CommentService.create_comment(**serializer.validated_data)
            return Response(CommentSerializer(comment).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CommentDetailAPIView(APIView):
    @swagger_auto_schema(tags=["Comment"])
    def get(self, request, pk):
        comment = CommentService.get_comment_by_id(pk)
        if comment:
            serializer = CommentSerializer(comment)
            return Response(serializer.data)
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    @swagger_auto_schema(tags=["Comment"])
    def put(self, request, pk):
        comment = CommentService.get_comment_by_id(pk)
        if comment:
            serializer = CommentSerializer(comment, data=request.data, partial=True)
            if serializer.is_valid():
                updated_comment = CommentService.update_comment(pk, **serializer.validated_data)
                return Response(CommentSerializer(updated_comment).data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    @swagger_auto_schema(tags=["Comment"])
    def delete(self, request, pk):
        comment = CommentService.delete_comment(pk)
        if comment:
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)