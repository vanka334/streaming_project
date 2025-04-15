import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { User } from '../../../api/Models/User';
import { fetchUserData } from '../../../api/fetchs/userApi';
import './UserProfilePage.css';
import {meta} from "@eslint/js";
import {clearTokens} from "../../../api/interceptors.ts";

interface UserProfilePageProps {
  // Если не используем props напрямую, то параметры получим через useParams
}

const UserProfilePage: React.FC<UserProfilePageProps> = () => {
  const API = import.meta.env.VITE_API_DOWNLOAD_URL;
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const currentUserId = localStorage.getItem('user_id');
  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (userId) {
          const userData = await fetchUserData(Number(userId));
          setUser(userData);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [userId]);

  const handleLogout = async () => {

    clearTokens()
    window.location.reload()
    // Реализация выхода, если нужно
  };

  if (loading) return <div className="loading-spinner">Загрузка...</div>;
  if (error) return <div className="error-message">Ошибка: {error}</div>;
  if (!user) return <div>Пользователь не найден</div>;

  return (
    <div className="user-profile-container">
      <div className="user-profile-header">
        <div className="avatar-container">
          {user.avatar ? (
            <img src={API+user.avatar} alt={`Аватар ${user.username}`} className="user-avatar" />
          ) : (
            <div className="avatar-placeholder">
              {user.name?.charAt(0) || user.email.charAt(0)}
            </div>
          )}
        </div>

        <div className="user-info">
          <h1 className="user-name">
            {user.name || user.username}
            {user.surname && ` ${user.surname}`}
            {user.patronymic && ` ${user.patronymic}`}
          </h1>

          <div className="user-meta">
            <span className="username">{user.username}</span>
            {user.email && <span className="email">{user.email}</span>}
          </div>
        </div>
      </div>

      {user.bio && (
        <div className="user-bio">
          <h3>О себе</h3>
          <p>{user.bio}</p>
        </div>
      )}

      {user.departments && user.departments.length > 0 && (
        <div className="user-departments">
          <h3>Отделы</h3>
          <div className="departments-list">
            {user.departments.map((dept) => (
              <span key={dept.id} className="department-tag">
                {dept.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="user-actions">
         {user.id === parseInt(currentUserId) && (
    <button className="logout-button" onClick={handleLogout}>
      Выйти
    </button>
  )}
      </div>
    </div>
  );
};

export default UserProfilePage;
