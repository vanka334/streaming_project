// src/components/Layout/MainLayout.tsx
import {Outlet} from 'react-router-dom';
import "./MainPage.css"
import LeftMenu from "../../ui/MainComponents/LeftMenu/LeftMenu.tsx";
import BodyComponent from "../../ui/MainComponents/Main/BodyComponent.tsx";

import  {useEffect} from "react";

import {fetchUserData} from "../../api/fetchs/userApi.ts";


export const MainPage = () => {
  useEffect(() => {
  const loadAndStoreUser = async () => {
    try {
      const user_id = localStorage.getItem('user_id');
      if (user_id) {
        const user = await fetchUserData(parseInt(user_id));

        console.log('Получен пользователь:', user);

        // Сохраняем данные пользователя в localStorage
        localStorage.setItem('user_data', JSON.stringify(user));
      }
    } catch (error) {
      console.error('Ошибка при загрузке пользователя:', error);
    }
  };

  loadAndStoreUser();
}, []);

  return (
       <div className="app">
    <div className="main-layout">
      <LeftMenu />
      <div className="main-content">
        <BodyComponent>
           <Outlet/>
        </BodyComponent>

      </div>
    </div>
       </div>
  );
};