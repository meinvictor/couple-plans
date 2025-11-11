import { useState, useEffect } from "react";
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
  // drag & drop state for reordering subtasks
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Persist in-progress edits per task
  const storageKey = `taskDraft:${task.id}`;

  // Load draft on mount or when task changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          if (parsed.editedTask) setEditedTask(parsed.editedTask);
          if (typeof parsed.isEditing === "boolean") setIsEditing(parsed.isEditing);
          if (typeof parsed.isChecklist === "boolean") setIsChecklist(parsed.isChecklist);
          if (typeof parsed.showSubtaskInput === "boolean") setShowSubtaskInput(parsed.showSubtaskInput);
          if (typeof parsed.subtaskInput === "string") setSubtaskInput(parsed.subtaskInput);
        }
      } else {
        // sync with latest task data if no draft
        setEditedTask(task);
        setIsChecklist(task.subtasks?.length > 0);
      }
    } catch {
      // ignore storage errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  // Save draft on changes
  useEffect(() => {
    try {
      const payload = {
        isEditing,
        editedTask,
        isChecklist,
        showSubtaskInput,
        subtaskInput
      };
      localStorage.setItem(storageKey, JSON.stringify(payload));
    } catch {
      // ignore storage errors
    }
  }, [isEditing, editedTask, isChecklist, showSubtaskInput, subtaskInput, storageKey]);

  // Sync from Firestore when task prop changes (e.g., updates from another device)
  useEffect(() => {
    if (isEditing) return; // do not override local edits in progress
    console.log('TaskItem: Syncing task data:', task); // Діагностика
    setEditedTask(task);
    setIsChecklist((task.subtasks || []).length > 0);
  }, [task, isEditing]);

  // Toggle підзадач
  const handleToggleSubtask = async (id) => {
    const current = editedTask.subtasks || [];
    const updated = current.map(st =>
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
    // одразу синхронізуємо з Firebase
    onEdit(task.id, { subtasks: updatedSubtasks });
    setSubtaskInput("");
    setIsChecklist(true);
  };

  const handleSubtaskInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSubtask();
    }
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
  const updated = (editedTask.subtasks || []).map(st =>
    st.id === id ? { ...st, title: value } : st
  );
  setEditedTask({ ...editedTask, subtasks: updated });
  
  // синхронізація з Firebase
  await onEdit(task.id, { subtasks: updated });
};

  // Drag handlers for reordering subtasks
  const handleDragStart = (index) => (e) => {
    try { e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", String(index)); } catch {}
    setDraggingIndex(index);
  };

  const handleDragOver = (index) => (e) => {
    e.preventDefault(); // allow drop
    if (dragOverIndex !== index) setDragOverIndex(index);
  };

  const handleDrop = (index) => async (e) => {
    e.preventDefault();
    const from = draggingIndex != null ? draggingIndex : parseInt(e.dataTransfer.getData("text/plain"), 10);
    const to = index;
    if (isNaN(from) || from === to) {
      setDraggingIndex(null);
      setDragOverIndex(null);
      return;
    }

    const arr = [...(editedTask.subtasks || [])];
    const [moved] = arr.splice(from, 1);
    arr.splice(to, 0, moved);

    setEditedTask({ ...editedTask, subtasks: arr });
    // persist new order
    await onEdit(task.id, { subtasks: arr });

    setDraggingIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggingIndex(null);
    setDragOverIndex(null);
  };

  // Видалення підзадачі
  const handleDeleteSubtask = async (id) => {
    const updated = (editedTask.subtasks || []).filter(st => st.id !== id);
    setEditedTask({ ...editedTask, subtasks: updated });
    // синхронізація з Firebase
    await onEdit(task.id, { subtasks: updated });
  };

  const handleConvertToChecklist = async () => {
    if (!editedTask.subtitle) return;
    const lines = editedTask.subtitle.split("\n").filter(l => l.trim() !== "");
    const subtasks = lines.map(line => ({ id: Date.now() + Math.random(), title: line, completed: false }));
    const updatedTask = { ...editedTask, subtasks, subtitle: "" };
    console.log('Converting to checklist:', updatedTask); // Діагностика
    setEditedTask(updatedTask);
    setIsChecklist(true);
    
    // Зберігаємо в Firebase одразу після конвертації
    await onEdit(task.id, updatedTask);
  };

  const handleSave = () => {
    onEdit(task.id, editedTask);
    setIsEditing(false);
    setShowSubtaskInput(false);
    try { localStorage.removeItem(storageKey); } catch {}
  };

  const handleChecklistIconClick = () => {
    if (!isChecklist && editedTask.subtitle) {
      handleConvertToChecklist();
    }
    setIsChecklist(true);
    // Не відкривати інпут додавання при перетворенні
    setShowSubtaskInput(false);
  };

  return (
    <div className="task-item">

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
              {(editedTask.subtasks || [])
                .filter((st) => (st.title || "").trim() !== "")
                .map((st, idx) => (
                <li
                  key={st.id}
                  className={`subtask-item ${st.completed ? "completed" : "pending"} ${draggingIndex === idx ? 'dragging' : ''} ${dragOverIndex === idx ? 'drag-over' : ''}`}
                  draggable
                  onDragStart={handleDragStart(idx)}
                  onDragOver={handleDragOver(idx)}
                  onDrop={handleDrop(idx)}
                  onDragEnd={handleDragEnd}
                  role="option"
                  aria-grabbed={draggingIndex === idx}
                  aria-selected={draggingIndex === idx}
                >
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      className="checkbox-input"
                      checked={st.completed}
                      onChange={() => handleToggleSubtask(st.id)}
                    />
                    <span className="checkbox-custom"></span>
                  </label>
                  <input
                    type="text"
                    value={st.title}
                    onChange={(e) => handleSubtaskTitleChange(st.id, e.target.value)}
                    style={{ flex: 1, minWidth: 0, border: "none", background: "transparent", color: "inherit" }}
                  />
                  <button
                    type="button"
                    className="subtask-delete-btn"
                    onClick={() => handleDeleteSubtask(st.id)}
                    aria-label="Видалити підзадачу"
                    title="Видалити"
                    style={{
                      marginLeft: 8,
                      background: "transparent",
                      border: "none",
                      color: "inherit",
                      cursor: "pointer",
                      fontSize: 16,
                      lineHeight: 1
                    }}
                  >
                    ×
                  </button>
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
                onKeyDown={handleSubtaskInputKeyDown}
              />
              <button className="add-subtask-btn" onClick={handleAddSubtask}>Додати</button>
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
              {(editedTask.subtasks || [])
                .filter((st) => (st.title || "").trim() !== "")
                .map((st, idx) => (
                <li
                  key={st.id}
                  className={`subtask-item ${st.completed ? "completed" : "pending"} ${draggingIndex === idx ? 'dragging' : ''} ${dragOverIndex === idx ? 'drag-over' : ''}`}
                  draggable
                  onDragStart={handleDragStart(idx)}
                  onDragOver={handleDragOver(idx)}
                  onDrop={handleDrop(idx)}
                  onDragEnd={handleDragEnd}
                  role="option"
                  aria-grabbed={draggingIndex === idx}
                  aria-selected={draggingIndex === idx}
                >
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      className="checkbox-input"
                      checked={st.completed}
                      onChange={() => handleToggleSubtask(st.id)}
                    />
                    <span className="checkbox-custom"></span>
                  </label>
                  <span className="subtask-title">{st.title}</span>
                  <button
                    type="button"
                    className="subtask-delete-btn"
                    onClick={() => handleDeleteSubtask(st.id)}
                    aria-label="Видалити підзадачу"
                    title="Видалити"
                    style={{
                      marginLeft: 8,
                      background: "transparent",
                      border: "none",
                      color: "inherit",
                      cursor: "pointer",
                      fontSize: 16,
                      lineHeight: 1
                    }}
                  >
                    ×
                  </button>
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
                onKeyDown={handleSubtaskInputKeyDown}
              />
              <button className="add-subtask-btn" onClick={handleAddSubtask}>Додати</button>
            </div>
          )}
        </div>
      )}

      <div className="task-actions">
        <button className={`icon-btn ${showSubtaskInput ? 'active' : ''}`} onClick={handleChecklistIconClick}>
          <TaskIcon className="task-icon" width='14' height='14' />
        </button>
        <button
          className={`icon-btn ${isEditing ? 'active' : ''}`}
          onClick={() => {
            const next = !isEditing;
            setIsEditing(next);
            // Не змінюємо режим на чекліст автоматично,
            // лише показуємо інпут додавання, якщо вже чекліст
            if (next) {
              setShowSubtaskInput(isChecklist);
            } else {
              setShowSubtaskInput(false);
            }
          }}
        >
          <EditIcon className="task-icon" width='14' height='14' />
        </button>
        <button onClick={() => { try { localStorage.removeItem(storageKey); } catch {}; onComplete(task.id); }}>
          <DeleteIcon className="task-icon" width='14' height='14' />
        </button>
      </div>
    </div>
  );
};

export default TaskItem;
