import {useSearchParams} from "react-router-dom";
import {useState} from "react";
import api from "../../api/interceptors.ts";
import './ResetPasswordPage.css'

export const ResetPasswordPage = () => {
  const [params] = useSearchParams();
  const uid = params.get("uid");
  const token = params.get("token");
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState(false);

  const handleReset = async () => {
    try {
      await api.post("/users/password-reset/confirm/", {
        uid,
        token,
        password
      });
      setSuccess(true);
    } catch {
      alert("Ошибка: возможно, ссылка устарела");
    }
  };

  return (
    <div className="reset-container">
      <h1>Сброс пароля</h1>
      {success ? (
        <p>Пароль успешно изменён. Можете войти.</p>
      ) : (
        <>
          <input
            type="password"
            placeholder="Новый пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleReset}>Сменить пароль</button>
        </>
      )}
    </div>
  );
};
