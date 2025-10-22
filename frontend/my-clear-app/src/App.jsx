import "./styles/app.css";
import "./styles/board.css";
import "./styles/filter.css";
import Header from "./components/Header";
import FilterBar from "./components/FilterBar";
import Board from "./pages/Board";
import { useEffect, useMemo, useState } from "react";
import Column from "./components/Column";

function App() {
  const [filters, setFilters] = useState({ urgency: "all", hasDate: "all" });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [columns, setColumns] = useState({
    "На день": [
      { id: "1", text: "Сделать дизайн", tag: "Срочно", user: "👩", due_date: "2025-10-10" },
      { id: "2", text: "Сверстать страницу", tag: "Нормально", user: "👨" },
      { id: "3", text: "Подключить API", tag: "Неважно", user: "👩‍💻", due_date: "" }
    ],
    "На неделю": [],
    "На месяц": [],
    "На дату": []
  });

// Загружаем задачи текущего пользователя по JWT токену
  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) return;

    const loadUserTasks = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/user/", {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Ошибка ${res.status}: не удалось получить задачи`);
        }

        const user = await res.json();
        // console.log("Данные пользователя:", user);
        localStorage.setItem("username", user.username)
        // Если сервер возвращает user.tasks
        if (user && Array.isArray(user.tasks)) {
          const userTasks = user.tasks;

          // Преобразуем задачи в формат твоих колонок
          const mappedColumns = {
            "На день": userTasks.map(t => ({
              id: String(t.id),
              text: t.title,
              description: t.description,
              tag: t.is_completed ? "Готово" : "Не сделана",
              user: user.username || "👤",
              due_date: ""
            })),
            "На неделю": [],
            "На месяц": [],
            "На дату": []
          };

          setColumns(mappedColumns);
        }
      } catch (err) {
        console.error("Ошибка при загрузке задач:", err);
      }
    };

    loadUserTasks();
  }, []);

  // Save on change
  useEffect(() => {
    try {
      localStorage.setItem("cleartime.columns", JSON.stringify(columns));
    } catch (e) {
      // ignore
    }
  }, [columns]);

  // Темная тема отключена по просьбе пользователя (код удален/закомментирован)
  return (
    <div className="app">
      <Header onCreateClick={() => setIsCreateOpen(true)} />
      <FilterBar filters={filters} onChange={setFilters} />
      <Board
  filters={filters}
  columns={columns}
  setColumns={setColumns}
  onOpenTask={setActiveTask}
  onDoubleClickTask={setActiveTask}
  onTaskUpdated={(updatedTask) => {
    setColumns(prev => {
      const next = { ...prev };
      for (const col in next) {
        const idx = next[col].findIndex(t => t.id === updatedTask.id);
        if (idx !== -1) {
          next[col] = [...next[col]];
          next[col][idx] = { ...next[col][idx], ...updatedTask };
          break;
        }
      }
      return next;
    });
  }}
/>


      {isCreateOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Создать новую задачу</h3>
              <button className="close-btn" onClick={() => setIsCreateOpen(false)}>×</button>
            </div>
            <CreateTaskForm
              onCancel={() => setIsCreateOpen(false)}
              onCreate={async (colTitle, task) => {
    try {
      const response = await fetch("http://localhost:8000/api/task/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // если ты используешь JWT или session auth:
          "Authorization": `Bearer ${localStorage.getItem("access")}`,
        },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ошибка ${response.status}`);
      }

      const created = await response.json();

      // добавляем в UI новую задачу
      setColumns(prev => ({
        ...prev,
        [colTitle]: [...(prev[colTitle] || []), { ...task, id: created.id }]
      }));

      setIsCreateOpen(false);
    } catch (err) {
      console.error("Ошибка при создании задачи:", err);
      alert("Не удалось создать задачу на сервере");
    }
  }}
  columnTitles={Object.keys(columns)}
            />
          </div>
        </div>
      )}

      {activeTask && (
        <div className="modal-overlay" onClick={() => setActiveTask(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Задача</h3>
              <button className="close-btn" onClick={() => setActiveTask(null)}>×</button>
            </div>
            <TaskDetailsForm
  task={activeTask}
  onCancel={() => setActiveTask(null)}
  onSave={async (updated) => {
    try {
      const token = localStorage.getItem("access");
      if (!token) throw new Error("Пользователь не авторизован");

      const res = await fetch(`http://localhost:8000/api/task/${updated.id}/`, {
        method: "PATCH", // или "PUT" — зависит от твоего DRF ViewSet
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: updated.title,
          description: updated.description,
          is_completed: updated.tag === "Готово",
        }),
      });

      if (!res.ok) {
        throw new Error(`Ошибка обновления: ${res.status}`);
      }

      const saved = await res.json();
      console.log("Обновлено на сервере:", saved);

      // обновляем локально в колонках
      setColumns(prev => {
        const next = { ...prev };
        for (const col in next) {
          const idx = next[col].findIndex(t => t.id === updated.id);
          if (idx !== -1) {
            next[col] = [...next[col]];
            next[col][idx] = { ...next[col][idx], ...saved };
            break;
          }
        }
        return next;
      });

      setActiveTask(null);
    } catch (err) {
      console.error("Ошибка при обновлении задачи:", err);
      alert("Не удалось обновить задачу на сервере");
    }
  }}
/>
          </div>
        </div>
      )}
    </div>
  );
}

function CreateTaskForm({ onCancel, onCreate, columnTitles }) {
  const [state, setState] = useState({
    title: "",
    description: "",
    priority: "Нормально",
    assignee: "",
    due_date: "",
    column: columnTitles[0] || "На день"
  });

  const disabled = !state.title.trim();

  // Обработчик клавиатуры
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onCancel();
    } else if (e.key === 'Enter' && !disabled && e.ctrlKey) {
      onCreate(state.column, {
        title: state.title,
        description: state.description,
        priority: state.priority,
        assignee: state.assignee,
        due_date: state.due_date
      });
    }
  };

  return (
    <div className="modal-body" onKeyDown={handleKeyDown}>
      <div className="form-group">
        <label>Колонка</label>
        <select className="form-select" value={state.column} onChange={(e) => setState(s => ({ ...s, column: e.target.value }))}>
          {columnTitles.map(ct => <option key={ct} value={ct}>{ct}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label>Название задачи *</label>
        <input className="form-input" type="text" value={state.title} onChange={(e) => setState(s => ({ ...s, title: e.target.value }))} />
      </div>
      <div className="form-group">
        <label>Описание</label>
        <textarea className="form-textarea" rows="3" value={state.description} onChange={(e) => setState(s => ({ ...s, description: e.target.value }))} />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Срочность</label>
          <select className="form-select" value={state.priority} onChange={(e) => setState(s => ({ ...s, priority: e.target.value }))}>
            <option>Срочно</option>
            <option>Нормально</option>
            <option>Неважно</option>
          </select>
        </div>
        <div className="form-group">
          <label>Исполнитель</label>
          <input className="form-input" type="text" value={state.assignee} onChange={(e) => setState(s => ({ ...s, assignee: e.target.value }))} />
        </div>
      </div>
      <div className="form-group">
        <label>Срок</label>
        <input className="form-input" type="date" value={state.due_date} onChange={(e) => setState(s => ({ ...s, due_date: e.target.value }))} />
      </div>
      <div className="modal-footer">
        <button className="cancel-btn" onClick={onCancel}>Отмена</button>
        <button className="confirm-btn" disabled={disabled} onClick={() => onCreate(state.column, {
          title: state.title,
          description: state.description,
          priority: state.priority,
          assignee: state.assignee,
          due_date: state.due_date
        })}>Создать</button>
      </div>
    </div>
  );
}

function TaskDetailsForm({ task, onCancel, onSave }) {
  const [state, setState] = useState({
    id: task.id,
    title: task.title || task.text || "",
    description: task.description || "",
    priority: task.priority || task.tag || "Нормально",
    assignee: task.assignee || task.user || "",
    due_date: task.due_date || ""
  });

  // Обработчик клавиатуры
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onCancel();
    } else if (e.key === 'Enter' && e.ctrlKey) {
      onSave(state);
    }
  };

  return (
    <div className="modal-body" onKeyDown={handleKeyDown}>
      <div className="form-group">
        <label>Название</label>
        <input className="form-input" type="text" value={state.title} onChange={(e) => setState(s => ({ ...s, title: e.target.value }))} />
      </div>
      <div className="form-group">
        <label>Описание</label>
        <textarea className="form-textarea" rows="4" value={state.description} onChange={(e) => setState(s => ({ ...s, description: e.target.value }))} />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Срочность</label>
          <select className="form-select" value={state.priority} onChange={(e) => setState(s => ({ ...s, priority: e.target.value }))}>
            <option>Срочно</option>
            <option>Нормально</option>
            <option>Неважно</option>
          </select>
        </div>
        <div className="form-group">
          <label>Исполнитель</label>
          <input className="form-input" type="text" value={state.assignee} onChange={(e) => setState(s => ({ ...s, assignee: e.target.value }))} />
        </div>
      </div>
      <div className="form-group">
        <label>Срок</label>
        <input className="form-input" type="date" value={state.due_date} onChange={(e) => setState(s => ({ ...s, due_date: e.target.value }))} />
      </div>
      <div className="modal-footer">
        <button className="cancel-btn" onClick={onCancel}>Отмена</button>
        <button className="confirm-btn" onClick={() => onSave(state)}>Сохранить</button>
      </div>
    </div>
  );
}

export default App;
