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
}): Promise<{
  id: number;
  name: string;
  description: string;
  comments?: Comment[];
}> => {
 await api.post('/taskmanager/task/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData)
  });

};