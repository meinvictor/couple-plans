import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { db } from "../../firebase/config";
import { collection, getDocs } from "firebase/firestore"
import "./Calendar.css";

const Calendar = ({ selectedDate, setSelectedDate }) => {
  const [datesWithTasks, setDatesWithTasks] = useState([]);

  const days = Array.from({ length: 7 }, (_, i) =>
    dayjs().add(i, "day")
  );

  // Отримуємо всі дати з задачами
  useEffect(() => {
    const fetchDates = async () => {
      const snapshot = await getDocs(collection(db, "tasks"));
      const dateSet = new Set();

      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.date) {
          dateSet.add(data.date);
        }
      });

      setDatesWithTasks(Array.from(dateSet));
    };

    fetchDates();
  }, []);

  return (
    <div className="calendar glass">
      {days.map((day, index) => {
        const isSelected = day.isSame(selectedDate, "day");
        const hasTasks = datesWithTasks.includes(day.format("YYYY-MM-DD"));

        return (
          <div
            key={index}
            className={`day ${isSelected ? "selected" : ""}`}
            onClick={() => setSelectedDate(day)}
          >
            <div className="day-name">{day.format("dd")}</div>
            <div className="day-number">{day.format("D")}</div>
            {hasTasks && <div className="task-dot" />}
          </div>
        );
      })}
    </div>
  );
};

export default Calendar;
