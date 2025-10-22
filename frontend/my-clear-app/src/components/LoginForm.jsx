import { useState } from "react";

export default function LoginForm({ onSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("http://localhost:8000/api/token/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) throw new Error("Неверный логин или пароль");

      const data = await res.json();
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      onSuccess(); // например, закрыть модалку и обновить состояние
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <h3>Вход</h3>
      {error && <div className="error">{error}</div>}
      <input
        type="text"
        placeholder="Имя пользователя"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Войти</button>
    </form>
  );
}