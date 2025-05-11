// src/api/taskApi.ts
import api from '../interceptors';
import {Task} from "../Models/Task.ts";

import {User} from "../Models/User.ts";
export const fetchUsers = async (): Promise<User[]> => {
    const response = await api.get("/users/users")
    return response.data;
};

// Получение данных пользователя
export const fetchUserData = async (userId: number): Promise<User> => {
  const response = await api.get(`/users/users/${userId}/`);
  return response.data;
};
export const fetchIsManager= async (userId: number) => {
  const response = await api.get(`/users/users/isManager/?user_id=${userId}`);
  return response.data;
};
export const fetchUserBio = async (
  userId: string,
  bio?: string,
  avatar?: File
): Promise<User> => {
  const formData = new FormData();
  if (bio !== undefined) formData.append("bio", bio);
  if (avatar) formData.append("avatar", avatar);

  const response = await api.patch(`/users/users/${userId}/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};
export const fetchUsersDepartments = async (): Promise<User[]> => {
    const response = await api.get("/users/callUsers")
    return response.data;
};