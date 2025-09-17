import { useState } from "react";
import "./TaskItem.css";
import { ReactComponent as EditIcon } from "../../../assets/icons/edit-icon.svg";
import { ReactComponent as TaskIcon } from "../../../assets/icons/task-icon.svg";
import { ReactComponent as DeleteIcon } from "../../../assets/icons/delete-icon.svg";

const TaskItem = ({ task, onEdit, onComplete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);
  const [subtaskInput, setSubtaskInput] = useState("");
  const [isChecklist, setIsChecklist] = useState(task.subtasks?.length > 0);
  const [showSubtaskInput, setShowSubtaskInput] = useState(false);

  // Toggle підзадач
  const handleToggleSubtask = async (id) => {
    const updated = editedTask.subtasks.map(st =>
      st.id === id ? { ...st, completed: !st.completed } : st
    );
    setEditedTask({ ...editedTask, subtasks: updated });

    // синхронізація з Firebase
    await onEdit(task.id, { subtasks: updated });
  };

  const handleAddSubtask = () => {
    if (!subtaskInput.trim()) return;
    const newSubtask = { id: Date.now().toString(), title: subtaskInput, completed: false };
    const updatedSubtasks = [...(editedTask.subtasks || []), newSubtask];
    setEditedTask({ ...editedTask, subtasks: updatedSubtasks });
    setSubtaskInput("");
    setIsChecklist(true);
  };

  const handleTitleChange = async (value) => {
    setEditedTask({ ...editedTask, title: value });
    await onEdit(task.id, { title: value });
  };

  const handleSubtitleChange = async (value) => {
    setEditedTask({ ...editedTask, subtitle: value });
    await onEdit(task.id, { subtitle: value });
  };

  const handleSubtaskTitleChange = async (id, value) => {
  const updated = editedTask.subtasks.map(st =>
    st.id === id ? { ...st, title: value } : st
  );
  setEditedTask({ ...editedTask, subtasks: updated });
  
  // синхронізація з Firebase
  await onEdit(task.id, { subtasks: updated });
};

  const handleConvertToChecklist = () => {
    if (!editedTask.subtitle) return;
    const lines = editedTask.subtitle.split("\n").filter(l => l.trim() !== "");
    const subtasks = lines.map(line => ({ id: Date.now() + Math.random(), title: line, completed: false }));
    setEditedTask({ ...editedTask, subtasks, subtitle: "" });
    setIsChecklist(true);
  };

  const handleSave = () => {
    onEdit(task.id, editedTask);
    setIsEditing(false);
  };

  const handleChecklistIconClick = () => {
    if (!isChecklist && editedTask.subtitle) {
      handleConvertToChecklist();
    }
    setIsChecklist(true);
    setShowSubtaskInput(prev => !prev);
  };

  return (
    <div className="task-item">
      {task.time && <div className="task-time">{task.time}</div>}

      {isEditing ? (
        <div className="task-edit-form">
          <input
            value={editedTask.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Заголовок"
          />
          {!isChecklist && (
            <textarea
              value={editedTask.subtitle}
              onChange={(e) => handleSubtitleChange(e.target.value)}
              rows={2}
              placeholder="Опис"
            />
          )}

          {isChecklist && (
            <ul className="subtasks-list">
              {editedTask.subtasks.map((st) => (
                <li key={st.id} className={`subtask-item ${st.completed ? "completed" : "pending"}`}>
                  <input
                    type="checkbox"
                    checked={st.completed}
                    onChange={() => handleToggleSubtask(st.id)}
                  />
                  <input
                    type="text"
                    value={st.title}
                    onChange={(e) => handleSubtaskTitleChange(st.id, e.target.value)}
                    style={{ flex: 1, border: "none", background: "transparent", color: "inherit" }}
                  />
                </li>
              ))}
            </ul>
          )}

          {isChecklist && showSubtaskInput && (
            <div className="add-subtask">
              <input
                type="text"
                placeholder="Нова підзадача"
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
              />
              <button onClick={handleAddSubtask}>Додати</button>
            </div>
          )}

          <button className="save-btn" onClick={handleSave}>Зберегти</button>
        </div>
      ) : (
        <div className="task-content">
          <div className="task-title">{task.title}</div>
          {!isChecklist && <div className="task-subtitle">{task.subtitle}</div>}

          {isChecklist && (
            <ul className="subtasks-list">
              {editedTask.subtasks.map((st) => (
                <li key={st.id} className={`subtask-item ${st.completed ? "completed" : "pending"}`}>
                  <input
                    type="checkbox"
                    checked={st.completed}
                    onChange={() => handleToggleSubtask(st.id)}
                  />
                  <span>{st.title}</span>
                </li>
              ))}
            </ul>
          )}

          {isChecklist && showSubtaskInput && (
            <div className="add-subtask">
              <input
                type="text"
                placeholder="Нова підзадача"
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
              />
              <button onClick={handleAddSubtask}>Додати</button>
            </div>
          )}
        </div>
      )}

      <div className="task-actions">
        <button onClick={handleChecklistIconClick}>
          <TaskIcon className="task-icon" width='14' height='14' />
        </button>
        <button onClick={() => setIsEditing(!isEditing)}>
          <EditIcon className="task-icon" width='14' height='14' />
        </button>
        <button onClick={() => onComplete(task.id)}>
          <DeleteIcon className="task-icon" width='14' height='14' />
        </button>
      </div>
    </div>
  );
};

export default TaskItem;
