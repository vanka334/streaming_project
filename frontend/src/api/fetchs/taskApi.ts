// src/api/taskApi.ts
import api from '../interceptors';
import {Task} from "../Models/Task.ts";
import {Status} from "../Models/Status.ts";

export const fetchTasks = async (): Promise<Task[]> => {
  const response = await api.get('/taskmanager/task/');
  return response.data;
};

export const fetchStatuses = async (): Promise<Status[]> => {
  const response = await api.get('/taskmanager/status/');
  return response.data;
};
export const updateTaskStatus = async (taskId: number, statusId: number): Promise<void> => {
  await api.patch(`/taskmanager/task/${taskId}/`, { status: statusId });
};
export const createTask = async (taskData: {
  name: string;
  description: string;
  status_detail: number;
  setter_detail: number;
  executor_detail: number | null;
  project:number;
  deadline: string;
}) => {
  const payload = {
    name: taskData.name,
    description: taskData.description,
    status: taskData.status_detail,
    setter: taskData.setter_detail,
    executor: taskData.executor_detail,
    project:taskData.project,
    deadline: taskData.deadline
  };

  const res = await api.post('/taskmanager/task/', payload, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return res.data; // 💡 добавь это
};
export const updateTask = async (
  taskId: number,
  taskData: {
    name: string;
    description: string;
    status_detail: number;
    setter_detail: number;
    executor_detail: number | null;
    deadline: string;
  }
): Promise<void> => {
  const payload = {
    name: taskData.name,
    description: taskData.description,
    status: taskData.status_detail,
    setter: taskData.setter_detail,
    executor: taskData.executor_detail,
    deadline: taskData.deadline
  };

  await api.put(`/taskmanager/task/${taskId}/`, payload, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
export const commitTask = async(taskId:number): Promise<void> =>{
  await api.post('/taskmanager/task/commit/', {"task_id" : taskId})
}
export const rejectTask = async(taskId:number): Promise<void> =>{
  await api.post('/taskmanager/task/reject/', {"task_id" : taskId})
}