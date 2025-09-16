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

  // Слухаємо зміни в налаштуваннях пристрою
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      setTheme(e.matches ? "dark" : "light");
    };
    mediaQuery.addEventListener("change", handleChange);

    // Застосовуємо клас до body
    document.body.className = theme;

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
