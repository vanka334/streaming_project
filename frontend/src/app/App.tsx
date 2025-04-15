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
import FileSystem from "../ui/BodyComponents/FileSystemBrowser/FileSystemBrowser.tsx";
import FileSystemBrowser from "../ui/BodyComponents/FileSystemBrowser/FileSystemBrowser.tsx";
import Tasks from "../ui/BodyComponents/Tasks/Tasks.tsx";
import UserProfilePage from "../ui/BodyComponents/UserProfilePage/UserProfilePage.tsx";
import ProjectsPage from "../ui/BodyComponents/ProjectPage/ProjectPage.tsx";

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
          >
        <Route index element={<Navigate to="/tasks" />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="filesystem" element={<FileSystemBrowser />} />
              <Route path="user/:userId" element={<UserProfilePage />} />
               <Route path="projects" element={<ProjectsPage />} />
</Route>
          {/* Другие защищённые маршруты */}
        </Routes>

    </>


  );
}
export default App
