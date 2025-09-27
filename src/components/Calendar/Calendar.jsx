import React, { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import { db } from "../../firebase/config";
import { collection, getDocs } from "firebase/firestore"
import "./Calendar.css";

const Calendar = ({ selectedDate, setSelectedDate }) => {
  const [datesWithTasks, setDatesWithTasks] = useState([]);
  const [showLeftIndicator, setShowLeftIndicator] = useState(true);

  const days = Array.from({ length: 15 }, (_, i) =>
    dayjs().subtract(7, "day").add(i, "day")
  );

  const containerRef = useRef(null);
  const todayIndex = 7;

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

  // Прокрутити до сьогодні при першому показі (показуємо сьогодні як перший видимий день)
  useEffect(() => {
    const el = containerRef.current?.children?.[todayIndex];
    if (el && typeof el.scrollIntoView === "function") {
      el.scrollIntoView({ behavior: "auto", inline: "start", block: "nearest" });
    }
    // одноразово на монтування
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Відстеження прокрутки для показу/приховування індикатора
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      setShowLeftIndicator(scrollLeft > 0);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div ref={containerRef} className="calendar glass">
      {/* Індикатор прокрутки вліво */}
      {showLeftIndicator && (
        <div className="scroll-indicator left">
          <div className="scroll-arrow">←</div>
        </div>
      )}
      
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
