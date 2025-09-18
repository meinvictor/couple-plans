import React, { useState, useContext, useEffect } from "react";
import Navbar from "../components/Navbar/Navbar";
import Calendar from "../components/Calendar/Calendar";
import TaskList from "../components/TaskList/TaskList";
import Starfield from "../components/Starfield/Starfield";
import Orbs from "../components/Orbs/Orbs";
import { ThemeContext } from "../context/ThemeContext";
import dayjs from "dayjs";

const Home = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [taskCount, setTaskCount] = useState(0); 
  const userId = "user1";
  const { theme } = useContext(ThemeContext);

  // Відновлення вибраної дати з localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("selectedDate");
      if (stored) {
        const parsed = dayjs(stored);
        if (parsed.isValid()) {
          setSelectedDate(parsed);
        }
      }
    } catch {}
  }, []);

  // Збереження вибраної дати
  useEffect(() => {
    try { localStorage.setItem("selectedDate", selectedDate.format("YYYY-MM-DD")); } catch {}
  }, [selectedDate]);

  return (
    <div className="container">
      {theme === "dark" && <Starfield />}
      {theme === "light" && <Orbs />}
      <Navbar taskCount={taskCount} />
      <Calendar selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
      <TaskList selectedDate={selectedDate}
        userId={userId}
        onTaskCountChange={setTaskCount} />
    </div>
  );
};

export default Home;
