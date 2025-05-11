// src/pages/LoginPage/LoginPage.tsx
import React, {useEffect, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import { login } from '../../api/fetchs/Auth';
import './LoginPage.css';

export default function  LoginPage(){
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(()=>{
    const token  = localStorage.getItem('accessToken')
    if(token){
      navigate("/")
    }
      }, [navigate]
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {

       // Проверяем, если логин и пароль равны "admin"
      if (username === 'admin' && password === 'admin') {
        // Перенаправляем на localhost:8000/admin
        window.location.href = 'http://localhost:8000/admin';
      } else {
        await login({ username, password });
        // Иначе перенаправляем на обычную страницу
        navigate('/');
      }
    } catch (err) {
      setError('Неверный username или пароль');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Вход в систему</h1>
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
                id="username"

                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
        <p>
          <Link to="/forgot-password" className="forgot-password-link">
            Забыли пароль?
          </Link>
        </p>
      </div>
    </div>
  );
};