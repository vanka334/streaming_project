import {JSX} from 'react'

import './App.css'


import {Navigate, Route, Routes} from "react-router-dom";
import LoginPage from "../pages/LoginPage/LoginPage.tsx";
import {MainPage} from "../pages/MainPage/MainPage.tsx";
import {getAccessToken} from "../api/interceptors.ts";

import FileSystemBrowser from "../ui/BodyComponents/FileSystemBrowser/FileSystemBrowser.tsx";
import Tasks from "../ui/BodyComponents/Tasks/Tasks.tsx";
import UserProfilePage from "../ui/BodyComponents/UserProfilePage/UserProfilePage.tsx";
import ProjectsPage from "../ui/BodyComponents/ProjectPage/ProjectPage.tsx";
import ProjectDashboard from "../ui/BodyComponents/ProjectPage/ProjectDashboard/ProjectDashboard.tsx";
import {CreateVideoCall} from "../ui/BodyComponents/CreateVideoCall/CreateVideoCall.tsx";
import VideoRoomWrapper from "../ui/BodyComponents/CreateVideoCall/VideoRoom/VideoRoomWrapper.tsx";
import {RegisterPage} from "../pages/RegisterPage/RegisterPage.tsx";
import {InviteUser} from "../ui/BodyComponents/InviteUser/InviteUser.tsx";
import {ForgotPasswordPage} from "../pages/ForgotPasswordPage/ForgotPasswordPage.tsx";
import {ResetPasswordPage} from "../pages/ResetPasswordPage/ResetPasswordPage.tsx";

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
              <Route path="projects/:projectId" element={<ProjectDashboard />} />
               <Route path="/videocall" element={<CreateVideoCall />}/>
              <Route path="/invite" element={<InviteUser />} />
</Route>
          {/* Другие защищённые маршруты */}

          <Route path="/videocall/:callId" element={<ProtectedRoute><VideoRoomWrapper /></ProtectedRoute>}/>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Routes>

    </>


  );
}
export default App
