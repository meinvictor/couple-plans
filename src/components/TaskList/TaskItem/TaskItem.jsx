import React, { useState, useEffect, useRef } from "react";
import "./TaskItem.css";
import editIcon from "../../../assets/icons/edit-icon.svg";
import saveIcon from "../../../assets/icons/save-icon.svg"

const TaskItem = ({ task, onEdit, onComplete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);
  const [checked, setChecked] = useState(false);
  const [translateX, setTranslateX] = useState(0);
  const [removing, setRemoving] = useState(false);
  const touchStartX = useRef(null);

  const handleSave = () => {
    onEdit(task.id, editedTask);
    setIsEditing(false);
  };

  // Чекбокс: видалення через 5 секунд
  useEffect(() => {
    if (checked) {
      const timer = setTimeout(() => triggerRemove(), 5000);
      return () => clearTimeout(timer);
    }
  }, [checked]);

  const triggerRemove = () => {
    setRemoving(true);
    setTimeout(() => {
      onComplete(task.id);
    }, 500); // співпадає з transition в CSS
  };

  // Свайп логіка
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    if (!touchStartX.current) return;
    const deltaX = e.touches[0].clientX - touchStartX.current;
    if (deltaX < 0) setTranslateX(deltaX); // тільки свайп вліво
  };

  const handleTouchEnd = () => {
    if (translateX < -100) triggerRemove();
    setTranslateX(0);
    touchStartX.current = null;
  };

  return (
    <div
      className={`task-item ${isEditing ? "editing" : ""} ${removing ? "removing" : ""}`}
      style={{ transform: `translateX(${translateX}px)`, transition: translateX === 0 ? "0.3s ease" : "none" }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {isEditing ? (
        <div className="task-edit-form">
          <input
            value={editedTask.time}
            onChange={(e) => setEditedTask({ ...editedTask, time: e.target.value })}
            placeholder="Час"
          />
          <input
            value={editedTask.title}
            onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
            placeholder="Заголовок"
          />
          <input
            value={editedTask.subtitle}
            onChange={(e) => setEditedTask({ ...editedTask, subtitle: e.target.value })}
            placeholder="Опис"
          />
          <button className="save-btn" onClick={handleSave}>
            <span>SAVE</span>
          </button>
        </div>
      ) : (
        <>
          {task.time && <div className="task-time">{task.time}</div>}

          <input
            type="checkbox"
            checked={checked}
            onChange={() => setChecked(!checked)}
            className="taskCompleteCheckbox"
            title="Позначити як виконане"
          />

          <div className="task-content" style={{ textDecoration: checked ? "line-through" : "none", opacity: checked ? 0.5 : 1 }}>
            <p className="task-title">{task.title}</p>
            <small className="task-subtitle">{task.subtitle}</small>
          </div>

          <div className="task-actions">
            <button onClick={() => setIsEditing(true)} title="Редагувати">
              <img src={editIcon} alt="Edit" width="24px" height="24px" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default TaskItem;
