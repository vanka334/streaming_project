import axios from 'axios';
import { Project } from '../Models/Project';
import api from "../interceptors.ts";



// Получить список проектов
export const fetchProjects = async (): Promise<Project[]> => {
  const response = await api.get<Project[]>('/users/projects/');
  return response.data;
};

// Получить один проект по id
export const fetchProject = async (projectId: number): Promise<Project> => {
  const response = await api.get(`/users/projects/${projectId}/`);
  return response.data;
};

// Создать проект
export const createProject = async (projectData: Omit<Project, 'id' | 'users_detail'>): Promise<Project> => {
  // projectData.users – это массив чисел!
  const response = await api.post('/users/projects/', projectData);
  return response.data;
};

// Обновить проект
export const updateProject = async (projectId: number, projectData: Omit<Project, 'id' | 'users_detail'>): Promise<Project> => {
  const response = await api.put(`/users/projects/${projectId}/`, projectData);
  return response.data;
};

// Удалить проект
export const deleteProject = async (projectId: number): Promise<void> => {
  await api.delete(`/users/projects/${projectId}/`);
};