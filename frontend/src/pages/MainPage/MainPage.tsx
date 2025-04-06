// src/components/Layout/MainLayout.tsx
import { Outlet } from 'react-router-dom';
import "./MainPage.css"
import LeftMenu from "../../ui/MainComponents/LeftMenu/LeftMenu.tsx";
import BodyComponent from "../../ui/MainComponents/Main/BodyComponent.tsx";
import {fetchTasks} from "../../api/fetchs/taskApi.ts";
import Tasks from "../../ui/BodyComponents/Tasks/Tasks.tsx";
import {useEffect} from "react";

export const MainPage = () => {



  return (
       <div className="app">
    <div className="main-layout">
      <LeftMenu />
      <div className="main-content">
        <BodyComponent><Tasks /></BodyComponent>

      </div>
    </div>
       </div>
  );
};