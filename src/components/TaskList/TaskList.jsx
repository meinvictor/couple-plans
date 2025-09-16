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
        <input
          type="text"
          placeholder="Опис"
          value={newTask.subtitle}
          onChange={(e) => setNewTask({ ...newTask, subtitle: e.target.value })}
        />
        <input
          type="text"
          placeholder="Час (10:00 - 11:00)"
          value={newTask.time}
          onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
        />
        <button onClick={handleAddTask} className="AddTaskButton">Додати</button>
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
