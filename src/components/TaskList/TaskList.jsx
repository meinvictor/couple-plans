import { useState, useEffect } from "react";
import TaskItem from "./TaskItem/TaskItem";
import {
  db,
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  where
} from "../../firebase/config";
import dayjs from "dayjs";
import "./TaskList.css";

const TaskList = ({ selectedDate, userId, onTaskCountChange }) => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: "", subtitle: "", time: "" });

  useEffect(() => {
    const q = query(
      collection(db, "tasks"),
      where("date", "==", selectedDate.format("YYYY-MM-DD")),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTasks(tasksData);
      onTaskCountChange?.(tasksData.length); // <- повідомляємо Home
    });

    return () => unsubscribe();
  }, [selectedDate, userId, onTaskCountChange]);

  // Додавання часу
  const handleTimeInputChange = (e) => {
    let value = e.target.value.replace(/\D/g, ""); // лише цифри
    if (value.length > 4) value = value.slice(0, 4);

    let formatted = value;
    if (value.length > 2) {
      formatted = `${value.slice(0, 2)}:${value.slice(2)}`;
      const hours = parseInt(value.slice(0, 2));
      const minutes = parseInt(value.slice(2));
      if (hours > 23 || minutes > 59) return; // не оновлюємо, якщо час некоректний
    }

    setNewTask((prev) => ({
      ...prev,
      time: formatted,
    }));
  };


  // Додавання задачі у Firebase
  const handleAddTask = async () => {
    if (!newTask.title.trim()) return;

    await addDoc(collection(db, "tasks"), {
      title: newTask.title,
      subtitle: newTask.subtitle,
      time: newTask.time,
      date: selectedDate.format("YYYY-MM-DD")
    });

    setNewTask({ title: "", subtitle: "", time: "" });
  };

  // Видалення задачі
  const handleCompleteTask = async (id) => {
    // видаляємо з Firebase після 5 секунд (UI вже оновлено через TaskItem)
    await deleteDoc(doc(db, "tasks", id));
  };

  // Редагування задачі
  const handleEditTask = async (id, updatedTask) => {
    await updateDoc(doc(db, "tasks", id), updatedTask);
  };


  return (
    <div className="task-list glass">
      <h3>Список задач</h3>

      <div className="add-task">
        <input
          type="text"
          placeholder="Заголовок"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
        />
        <textarea
          placeholder="Опис"
          value={newTask.subtitle}
          onChange={(e) => setNewTask({ ...newTask, subtitle: e.target.value })}
          rows={3}
        />
        <input
          type="text"
          placeholder="Час"
          value={newTask.time}
          onChange={handleTimeInputChange}
          inputMode="numeric"
          pattern="\d*"
        />
        <button onClick={handleAddTask} className="addTaskButton">Додати</button>
      </div>

      {tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          onEdit={handleEditTask}
          onComplete={handleCompleteTask} // передаємо нову функцію
        />
      ))}
    </div>
  );
};

export default TaskList;
