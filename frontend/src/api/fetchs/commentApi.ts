import api from '../interceptors';
import { Comment } from '../Models/Comment';

export const fetchComments = async (taskId: number): Promise<Comment[]> => {
  const response = await api.get(`/taskmanager/comment_by_task/?task_id=${taskId}`);
  return response.data;
};

export const addComment = async (commentData: {
  task: number;
  text: string;
  author: number;
}): Promise<Comment> => {
  const response = await api.post('/taskmanager/comment/', commentData);
  return response.data;
};

// Дополнительные методы при необходимости
export const updateComment = async (id: number, text: string): Promise<Comment> => {
  const response = await api.patch(`/taskmanager/comment/${id}/`, { text });
  return response.data;
};

export const deleteComment = async (id: number): Promise<void> => {
  await api.delete(`/taskmanager/comment/${id}/`);
};