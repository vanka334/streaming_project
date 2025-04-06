// src/api/auth.ts
import api from '../interceptors';
import { setTokens, clearTokens } from '../interceptors';
import {getRefreshToken} from "../interceptors.ts";

interface TokenResponse {
  access: string;
  refresh: string;
}

interface LoginCredentials {
  username: string;
  password: string;
}

export const login = async (credentials: { password: string; username: string }): Promise<void> => {
  const response = await api.post<TokenResponse>('/users/token/', credentials);
  setTokens(response.data.access, response.data.refresh);
};

export const logout = (): void => {
  clearTokens();
};

export const refreshToken = async (): Promise<void> => {
  const refresh = getRefreshToken();
  if (!refresh) throw new Error('No refresh token');

  const response = await api.post<TokenResponse>('/users/token/refresh/', { refresh });
  setTokens(response.data.refresh, refresh);
};