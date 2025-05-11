import {useState} from "react";
import api from "../../api/interceptors.ts";
import '../ResetPasswordPage/ResetPasswordPage.css'
export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    await api.post("/users/password-reset/", { email });
    setSent(true);
  };

  return (
    <div className="reset-container">
      <h1>Восстановление пароля</h1>
      {sent ? (
        <p>Если такой email существует, мы отправили ссылку на восстановление.</p>
      ) : (
        <>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button onClick={handleSubmit}>Отправить</button>
        </>
      )}
    </div>
  );
};
