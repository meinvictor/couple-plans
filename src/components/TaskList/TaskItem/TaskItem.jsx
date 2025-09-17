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


  // Drag & Drop
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleToggleSubtask = (id) => {
    const updated = editedTask.subtasks.map(st =>
      st.id === id ? { ...st, completed: !st.completed } : st
    );
    setEditedTask({ ...editedTask, subtasks: updated });
    onEdit(task.id, { subtasks: updated });
  };

  const handleAddSubtask = () => {
    if (!subtaskInput.trim()) return;
    const newSubtask = { id: Date.now().toString(), title: subtaskInput, completed: false };
    const updatedSubtasks = [...(editedTask.subtasks || []), newSubtask];
    setEditedTask({ ...editedTask, subtasks: updatedSubtasks });
    onEdit(task.id, { subtasks: updatedSubtasks });
    setSubtaskInput("");
    setIsChecklist(true);
  };

  const handleConvertToChecklist = () => {
    if (!editedTask.subtitle) return;
    const lines = editedTask.subtitle.split("\n").filter(l => l.trim() !== "");
    const subtasks = lines.map(line => ({ id: Date.now() + Math.random(), title: line, completed: false }));
    setEditedTask({ ...editedTask, subtasks, subtitle: "" });
    onEdit(task.id, { subtasks, subtitle: "" });
    setIsChecklist(true);
  };

  const handleSave = () => {
    onEdit(task.id, editedTask);
    setIsEditing(false);
  };

  // Drag & Drop handlers
  const handleDragStart = (index) => setDraggedIndex(index);

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const updatedSubtasks = [...editedTask.subtasks];
    const draggedItem = updatedSubtasks[draggedIndex];
    updatedSubtasks.splice(draggedIndex, 1);
    updatedSubtasks.splice(index, 0, draggedItem);

    setDraggedIndex(index);
    setEditedTask({ ...editedTask, subtasks: updatedSubtasks });
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    onEdit(task.id, { subtasks: editedTask.subtasks });
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
      {task.time && (
        <div className="task-time">{task.time}</div>
      )}

      {isEditing ? (
        <div className="task-edit-form">
          <input
            value={editedTask.title}
            onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
          />
          <textarea
            value={editedTask.subtitle}
            onChange={(e) => setEditedTask({ ...editedTask, subtitle: e.target.value })}
            rows={2}
          />
          <button className="save-btn" onClick={handleSave}>Зберегти</button>
        </div>
      ) : (
        <div className="task-content">
          <div className="task-title">{task.title}</div>
          {!isChecklist && <div className="task-subtitle">{task.subtitle}</div>}

          {isChecklist && (
            <ul className="subtasks-list">
              {editedTask.subtasks.map((st, index) => (
                <li
                  key={st.id}
                  className={`subtask-item ${st.completed ? "completed" : "pending"}`}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                >
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
