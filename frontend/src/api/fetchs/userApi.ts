// src/api/taskApi.ts
import api from '../interceptors';
import {Task} from "../Models/Task.ts";
import {Department} from "../Models/Department.ts";
import {User} from "../Models/User.ts";
export const fetchUsers = async (): Promise<Task[]> => {
    const response = await api.get("/users/users")
    return response.data;
};

// Получение данных пользователя
export const fetchUserData = async (userId: number): Promise<User> => {
  const response = await api.get(`/users/users/${userId}/`);
  return response.data;
};
