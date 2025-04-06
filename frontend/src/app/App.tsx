import React, {JSX, ReactElement, useState} from 'react'
import reactLogo from '../assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Header from "../ui/MainComponents/Header/Header.tsx";
import LeftMenu from "../ui/MainComponents/LeftMenu/LeftMenu.tsx";
import BodyComponent from "../ui/MainComponents/Main/BodyComponent.tsx";

import {Navigate, Route, Routes} from "react-router-dom";
import LoginPage from "../pages/LoginPage/LoginPage.tsx";
import {MainPage} from "../pages/MainPage/MainPage.tsx";
import {getAccessToken} from "../api/interceptors.ts";

function App() {
  const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const token = getAccessToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
  return (
     <>
      {/* Маршрут авторизации - вне основного layout'а */}
      <Routes>
        <Route path="/login" element={<LoginPage />} />




          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainPage />
              </ProtectedRoute>
            }
          />
          {/* Другие защищённые маршруты */}
        </Routes>

    </>


  );
}
export default App
