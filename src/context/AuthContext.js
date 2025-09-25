import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext({
  user: null,
  loginAs: (name) => {},
  logout: () => {},
});

const allowedUsers = [];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("auth_user");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.id && parsed.name) {
          setUser(parsed);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      if (user) localStorage.setItem("auth_user", JSON.stringify(user));
      else localStorage.removeItem("auth_user");
    } catch {}
  }, [user]);

  function loginAs(name) {
    const match = allowedUsers.find(
      (u) => u.name.toLowerCase() === String(name).toLowerCase()
    );
    if (match) {
      setUser(match);
      return true;
    }
    return false;
  }

  function logout() {
    setUser(null);
  }

  const value = useMemo(() => ({ user, loginAs, logout, allowedUsers }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);



