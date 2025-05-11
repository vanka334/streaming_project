// pages/RegisterFromInvitePage.tsx
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api, {setTokens} from '../../api/interceptors';
import './RegisterPage.css'

export const RegisterPage = () => {
  const [params] = useSearchParams();
  const token = params.get('token');
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    surname: '',
    patronymic: '',
    password: ''
  });
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      api.get(`users/invites/${token}/`)
        .then(res => {
          setForm(prev => ({
            ...prev,
            name: res.data.name,
            surname: res.data.surname,
            patronymic: res.data.patronymic || ''
          }));
          setEmail(res.data.email);
        })
        .catch(() => setError("Ссылка недействительна"));
    }
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

 const handleRegister = async () => {
  try {
    const response = await api.post('users/register/', {
      username: email,
      email: email,
      password: form.password,
      name: form.name,
      surname: form.surname,
      patronymic: form.patronymic,
        token
    });

    // можно сохранить токены или просто редирект
      setTokens(response.data.tokens.access, response.data.tokens.refresh)


    navigate('/login'); // или в профиль
  } catch (err: any) {
    setError("Ошибка регистрации");
  }
};

  if (!token) return <p>Токен не найден в ссылке</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
      <div className="register-page">
          <h1 className="register-title">Регистрация</h1>
          <input value={email} disabled className="register-input disabled"/>
          <input name="name" placeholder="Имя" value={form.name} onChange={handleChange} className="register-input"/>
          <input name="surname" placeholder="Фамилия" value={form.surname} onChange={handleChange}
                 className="register-input"/>
          <input name="patronymic" placeholder="Отчество" value={form.patronymic} onChange={handleChange}
                 className="register-input"/>
          <input name="password" type="password" placeholder="Пароль" value={form.password} onChange={handleChange}
                 className="register-input"/>
          <button onClick={handleRegister} className="register-button">Зарегистрироваться</button>
      </div>
  );
};
