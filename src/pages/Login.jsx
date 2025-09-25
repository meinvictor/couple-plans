import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { loginAs, allowedUsers } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(allowedUsers?.[0]?.name || "");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!allowedUsers || allowedUsers.length === 0) return;
    setName(allowedUsers[0].name);
  }, [allowedUsers]);

  function handleSubmit(e) {
    e.preventDefault();
    const ok = loginAs(name);
    if (!ok) setError("Користувача не знайдено");
    else {
      setError("");
      navigate("/", { replace: true });
    }
  }

  return (
    <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <form onSubmit={handleSubmit} className="glass" style={{ padding: 24, borderRadius: 12, display: "flex", flexDirection: "column", gap: 12, minWidth: 280 }}>
        <h2 style={{ margin: 0, textAlign: "center" }}>Вхід</h2>
        {allowedUsers.length === 0 ? (
          <div style={{ color: "#ffcc00" }}>Немає доступних користувачів</div>
        ) : (
          <>
            <label>Оберіть користувача</label>
            <select value={name} onChange={(e) => setName(e.target.value)}>
              {allowedUsers.map((u) => (
                <option key={u.id} value={u.name}>{u.name}</option>
              ))}
            </select>
          </>
        )}
        <button type="submit" className="btn-primary" disabled={allowedUsers.length === 0}>Увійти</button>
        {error && <div style={{ color: "#ff6b6b" }}>{error}</div>}
      </form>
    </div>
  );
};

export default Login;


