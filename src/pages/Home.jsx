import React, { useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import Calendar from "../components/Calendar/Calendar";
import TaskList from "../components/TaskList/TaskList";
import dayjs from "dayjs";

const Home = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [taskCount, setTaskCount] = useState(0); 
  const userId = "user1";

  return (
    <div className="container">
      <Navbar taskCount={taskCount} />
      <Calendar selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
      <TaskList selectedDate={selectedDate}
        userId={userId}
        onTaskCountChange={setTaskCount} />
    </div>
  );
};

export default Home;
