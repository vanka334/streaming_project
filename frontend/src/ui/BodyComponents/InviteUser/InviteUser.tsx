// pages/InviteUserPage.tsx
import { useState } from 'react';
import api from '../../../api/interceptors'; // твой axios instance
import './InviteUser.css'

export const InviteUser= () => {
  const [form, setForm] = useState({ email: '', name: '', surname: '', patronymic: '' });
  const [link, setLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleInvite = async () => {
    try {
      const res = await api.post('users/invites/', form);
      setLink(`${window.location.origin}/register?token=${res.data.token}`);
    } catch (err: any) {
  if (err.response?.data?.email) {
    setError(err.response.data.email[0]);  // покажи текст ошибки пользователю
  } else {
    setError("Ошибка при создании приглашения");
  }
  }};
  if (error) return <div>Ошибка: {error}</div>;
  return (
      <div className="invite-box">
          <h3 className="invite-title">Пригласить пользователя</h3>
          <input name="email" required placeholder="Почта" value={form.email} onChange={handleChange} className="invite-input"/>
          <input name="name" required placeholder="Имя" value={form.name} onChange={handleChange} className="invite-input"/>
          <input name="surname" required placeholder="Фамилия" value={form.surname} onChange={handleChange}
                 className="invite-input"/>
          <input name="patronymic" required placeholder="Отчество" value={form.patronymic} onChange={handleChange}
                 className="invite-input"/>
          <button onClick={handleInvite} className="invite-button">Создать приглашение</button>

          {link && (
              <div className="invite-result">
                  Ссылка: <a href={link}>{link}</a>
              </div>
          )}
      </div>
  );
};
