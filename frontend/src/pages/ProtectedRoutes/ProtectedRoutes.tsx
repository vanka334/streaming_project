// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { getAccessToken } from '../../api/interceptors.ts';
import {JSX} from "react";

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const token = getAccessToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};