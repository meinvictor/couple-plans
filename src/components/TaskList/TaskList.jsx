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
import "./TaskList.css";

const TaskList = ({ selectedDate, userId, onTaskCountChange }) => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: "", subtitle: "" });

  // Ключ для localStorage залежно від дати
  const draftStorageKey = `draftTask:${selectedDate.format("YYYY-MM-DD")}`;

  // Завантажуємо чернетку при зміні дати
  useEffect(() => {
    try {
      const saved = localStorage.getItem(draftStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        // проста валідація
        if (typeof parsed?.title === "string" && typeof parsed?.subtitle === "string") {
          setNewTask(parsed);
        } else {
          setNewTask({ title: "", subtitle: "" });
        }
      } else {
        setNewTask({ title: "", subtitle: "" });
      }
    } catch {
      setNewTask({ title: "", subtitle: "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftStorageKey]);

  // Зберігаємо чернетку при кожній зміні полів
  useEffect(() => {
    try {
      localStorage.setItem(draftStorageKey, JSON.stringify(newTask));
    } catch {}
  }, [newTask, draftStorageKey]);

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
      date: selectedDate.format("YYYY-MM-DD")
    });

    setNewTask({ title: "", subtitle: "" });
    // очищаємо чернетку після створення
    try { localStorage.removeItem(draftStorageKey); } catch {}
  };

  // Видалення задачі
  const handleCompleteTask = async (id) => {
    // видаляємо з Firebase після 5 секунд (UI вже оновлено через TaskItem)
    await deleteDoc(doc(db, "tasks", id));
  };

  // Редагування задачі
  const handleEditTask = async (id, updatedTask) => {
    console.log('Updating task in Firebase:', id, updatedTask); // Діагностика
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
        <button onClick={handleAddTask} className="addTaskButton">Додати</button>
      </div>

      {tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          onEdit={handleEditTask}
          onComplete={handleCompleteTask} 
        />
      ))}
    </div>
  );
};

export default TaskList;
