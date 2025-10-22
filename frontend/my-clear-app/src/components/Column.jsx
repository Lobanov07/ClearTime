import { Droppable } from "react-beautiful-dnd";
import TaskCard from "./TaskCard";
import { useState } from "react";
import "../styles/column.css"

// Сервис для работы с API (заглушка - замените на реальные вызовы к Django)
const apiService = {
  // Получение задач для колонки
  getTasks: async (columnId) => {
    // Замените на реальный API call
    const response = await fetch(`/api/columns/${columnId}/tasks/`);
    return await response.json();
  },

  // Создание новой задачи
  createTask: async (columnId, taskData) => {
    // Замените на реальный API call
    const response = await fetch(`/api/tasks/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...taskData,
        column: columnId,
        status: titleToStatus(columnId) // Конвертируем название колонки в статус
      })
    });
    return await response.json();
  },

  // Обновление задачи (при перетаскивании)
  updateTask: async (taskId, updates) => {
    const response = await fetch(`/api/tasks/${taskId}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates)
    });
    return await response.json();
  }
};

// Вспомогательная функция для конвертации названия колонки в статус
const titleToStatus = (title) => {
  const statusMap = {
    'To Do': 'todo',
    'In Progress': 'in_progress',
    'Done': 'done',
    'Backlog': 'backlog'
  };
  return statusMap[title] || 'todo';
};

export default function Column({ title, tasks, onAddTask, columnId, onOpenTask, onDoubleClickTask, onTaskUpdated}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    assignee: "",
    due_date: "", // Используем snake_case для совместимости с Django
    tags: []
  });

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      assignee: "",
      due_date: "",
      tags: []
    });
  };

  const handleInputChange = (field, value) => {
    setNewTask(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTask = async () => {
    if (!newTask.title.trim()) {
      alert('Пожалуйста, введите название задачи.');
      return;
    }

    setIsLoading(true);

    try {
      // Вариант 1: Если родительский компонент управляет состоянием
      if (typeof onAddTask === 'function') {
        await onAddTask(columnId || title, newTask);
      }
      // Вариант 2: Прямой вызов API (если используется локальное состояние)
      else {
        await apiService.createTask(columnId || title, newTask);
        // Здесь можно обновить локальное состояние или вызвать callback для обновления списка
      }

      closeModal();
    } catch (error) {
      console.error('Ошибка при создании задачи:', error);
      // Можно добавить уведомление об ошибке
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчик клавиатуры для модального окна
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeModal();
    } else if (e.key === 'Enter' && !isLoading && e.ctrlKey) {
      handleAddTask();
    }
  };

  // Форматирование даты для input[type="date"]
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    return dateString.split('T')[0];
  };

  return (
    <div className="column">
      <div className="column-header">
        <h2>{title}</h2>
        <button onClick={openModal} className="add-task-btn" disabled={isLoading} hidden>
          {isLoading ? 'Загрузка...' : '+ Добавить задачу'}
        </button>
      </div>

      <Droppable droppableId={columnId || title}>
        {(provided, snapshot) => (
          <div
            className={`task-list ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {tasks.map((task, index) => (
  <TaskCard
    key={task.id}
    task={task}
    index={index}
    onOpenTask={onOpenTask}
    onDoubleClick={onDoubleClickTask}
    onTaskUpdated={onTaskUpdated}
  />
))}

            {provided.placeholder}

            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="empty-state">
                Нет задач. Добавьте новую задачу.
              </div>
            )}
          </div>
        )}
      </Droppable>

      {/* Модальное окно добавления задачи */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} onKeyDown={handleKeyDown}>
            <div className="modal-header">
              <h3>Создать новую задачу в "{title}"</h3>
              <button onClick={closeModal} className="close-btn">×</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Название задачи *</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Введите название задачи..."
                  className="form-input"
                  autoFocus
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label>Описание</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Подробное описание задачи..."
                  className="form-textarea"
                  rows="3"
                  disabled={isLoading}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Приоритет</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="form-select"
                    disabled={isLoading}
                  >
                    <option value="low">Срочно</option>
                    <option value="medium">Нормально</option>
                    <option value="high">Неважно</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Исполнитель</label>
                  <input
                    type="text"
                    value={newTask.assignee}
                    onChange={(e) => handleInputChange('assignee', e.target.value)}
                    placeholder="Кому назначить..."
                    className="form-input"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Срок выполнения</label>
                <input
                  type="date"
                  value={formatDateForInput(newTask.due_date)}
                  onChange={(e) => handleInputChange('due_date', e.target.value)}
                  className="form-input"
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label>Теги (через запятую)</label>
                <input
                  type="text"
                  value={newTask.tags.join(', ')}
                  onChange={(e) => handleInputChange('tags', e.target.value.split(',').map(tag => tag.trim()))}
                  placeholder="тег1, тег2, тег3"
                  className="form-input"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={closeModal} className="cancel-btn" disabled={isLoading}>
                Отмена
              </button>
              <button
                onClick={handleAddTask}
                className="confirm-btn"
                disabled={isLoading}
              >
                {isLoading ? 'Создание...' : 'Создать задачу'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}