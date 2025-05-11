import { Routes, Route } from 'react-router-dom';

import {MainPage} from "../pages/MainPage/MainPage.tsx";
import {ProtectedRoute} from "../pages/ProtectedRoutes/ProtectedRoutes.tsx";
import Tasks from "../ui/BodyComponents/Tasks/Tasks.tsx";
import FileSystemBrowser from "../ui/BodyComponents/FileSystemBrowser/FileSystemBrowser.tsx";


const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<MainPage />}>
        <Route
          path="tasks"
          element={
            <ProtectedRoute>
              <Tasks />
            </ProtectedRoute>
          }
        />
        <Route
          path="filesystem"
          element={
            <ProtectedRoute>
              <FileSystemBrowser />
            </ProtectedRoute>
          }
        />
        {/* index route — например, чтобы по умолчанию шли в /tasks */}
        <Route index element={<Tasks />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
