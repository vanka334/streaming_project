// src/api/taskApi.ts
import api from '../interceptors';
import {Task} from "../Models/Task.ts";
export const fetchUsers = async (): Promise<Task[]> => {
    const response = await api.get("/users/users")
    return response.data;
};
