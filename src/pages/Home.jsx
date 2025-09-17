import React, { useState, useContext } from "react";
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
