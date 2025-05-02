// src/api/interceptors.ts
import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  AxiosHeaders,
  RawAxiosRequestHeaders
} from 'axios';
import { jwtDecode } from 'jwt-decode';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1/';
const api: AxiosInstance = axios.create({
  baseURL:API_URL ,
});

// Функции для работы с токенами (остаются без изменений)
export const setTokens = (access: string, refresh: string) => {
  localStorage.setItem('accessToken', access);
  const decoded = jwtDecode(access);
  const userId  = decoded.user_id.toString();
  if (typeof userId === "string") {
    localStorage.setItem('user_id', userId);
  }
  localStorage.setItem('refreshToken', refresh);
};

export const clearTokens = () => {

  localStorage.clear()
};

export const getAccessToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refreshToken');
};

// Интерцептор запросов с правильной типизацией
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    // Правильное создание заголовков
    const headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`
    } as RawAxiosRequestHeaders & AxiosHeaders;

    config.headers = headers;
  }
  return config;
});

// Интерцептор ответов
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          const response = await axios.post(`http://localhost:8000/api/v1/users/token/refresh/`, {
            refresh: refreshToken
          });
          const { access } = response.data;
          localStorage.setItem('accessToken', access);

          // Обновляем заголовки с правильной типизацией
          const headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${access}`
          } as RawAxiosRequestHeaders & AxiosHeaders;

          originalRequest.headers = headers;
          return api(originalRequest);
        }
      } catch (refreshError) {
        clearTokens()
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;