import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { User } from '../../../api/Models/User';
import {fetchUserBio, fetchUserData} from '../../../api/fetchs/userApi';
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
    const [editBio, setEditBio] = useState<boolean>(false); // NEW
  const [bioDraft, setBioDraft] = useState<string>('');
  const [isCurrentUser, setIsCurrentUser] = useState<boolean>(false);
  useEffect(() => {

    const loadUserData = async () => {
      try {
        if (userId) {
          const userData = await fetchUserData(Number(userId));
          setUser(userData);
           setBioDraft(userData.bio || '');
           if(userData.id === parseInt(currentUserId)){}// NEW
           setIsCurrentUser(true)
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
 const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file || !user) return;

  try {
    const res = await fetchUserBio(user.id.toString(), undefined, file);
    setUser(res);
  } catch (err) {
    console.error("Ошибка при загрузке аватарки", err);
  }
};

  const handleBioSave = async(user_id:number, bio:string)=>{
   try {
    const response = await fetchUserBio(userId, bio);
    setUser(response);
    setEditBio(false);  // скрыть textarea и вернуть кнопку
  } catch (err) {
    console.error("Ошибка при сохранении био", err);
  }
  }
  if (loading) return <div className="loading-spinner">Загрузка...</div>;
  if (error) return <div className="error-message">Ошибка: {error}</div>;
  if (!user) return <div>Пользователь не найден</div>;

  return (
    <div className="user-profile-container">
      <div className="user-profile-header">
        <div className="avatar-container">
          <label htmlFor="avatar-upload" className="avatar-edit-icon">+</label>
          <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{display: "none"}}
          />
          {user.avatar ? (
              <img src={API + user.avatar} alt={`Аватар ${user.username}`} className="user-avatar-bio"/>
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

      <div className="user-bio">
        <h3>О себе</h3>
        {editBio && isCurrentUser ? (
            <>
            <textarea
                className="bio-textarea"
                value={bioDraft}
                onChange={(e) => setBioDraft(e.target.value)}
            />
              <button className="save-button" onClick={() => handleBioSave(Number(currentUserId), bioDraft)}>
                💾 Сохранить
              </button>
            </>
        ) : (
            <>
            <p>{user.bio || 'Нет информации'}</p>
            {isCurrentUser && (
              <button className="edit-profile-button"  onClick={()=>setEditBio(true)}>
                ✏️ Редактировать
              </button>
            )}
          </>
        )}
      </div>

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
