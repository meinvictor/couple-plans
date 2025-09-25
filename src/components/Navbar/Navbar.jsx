import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import dayjs from "dayjs";
import "dayjs/locale/uk"; 
import { ReactComponent as DayTheme } from '../../assets/icons/day-icon.svg';
import { ReactComponent as NightTheme } from '../../assets/icons/night-icon.svg';
import "./Navbar.css";

dayjs.locale("uk"); 

const Navbar = ({ taskCount }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user, logout } = useAuth();

  const todayRaw = dayjs().format("dddd, D MMMM");
  const today = capitalizeFirstLetter(todayRaw);   

  function capitalizeFirstLetter(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  function formatTaskCount(count) {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return `${count} задач`;
    if (lastDigit === 1) return `${count} задача`;
    if (lastDigit >= 2 && lastDigit <= 4) return `${count} задачі`;
    return `${count} задач`;
  }

  return (
    <div className={`navbar glass ${theme}`}>
      <div className="left">
        <h2>{today}</h2>
        <span>{formatTaskCount(taskCount)}</span>
      </div>
      <div className="right">
        <button onClick={toggleTheme} className="theme-toggle">
          {theme === "light" ? <DayTheme /> : <NightTheme />}
        </button>
        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ opacity: 0.8 }}>{user.name}</span>
            <button onClick={logout} className="btn-secondary">Вийти</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
