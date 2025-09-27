import React, { createContext, useState, useEffect } from "react";

// Створюємо контекст теми
export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Спочатку перевіряємо налаштування системи
  const getSystemTheme = () => {
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  };

  const [theme, setTheme] = useState(getSystemTheme);

  // Застосовуємо клас до body при зміні теми
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  // Слухаємо зміни в налаштуваннях пристрою
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      setTheme(e.matches ? "dark" : "light");
    };
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
