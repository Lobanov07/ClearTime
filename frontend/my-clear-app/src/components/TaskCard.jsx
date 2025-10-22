import { Draggable } from "react-beautiful-dnd";

export default function TaskCard({ task, index, onOpenTask, onDoubleClick, onTaskUpdated }) {
  const title = task.title || task.text;
  const tag = task.tag || task.priority || "";
  const avatar = task.assignee || task.user || "";
  const due = task.due_date;

  const urgencyKey = (() => {
    const t = (tag || "").toLowerCase();
    if (t.startsWith("сроч") || t === "urgent") return "urgent";
    if (t.startsWith("неваж") || t === "low") return "low";
    return "normal";
  })();

  const overdue = (() => {
    if (!due) return false;
    const today = new Date();
    const d = new Date(due);
    return d.toString() !== "Invalid Date" && d < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  })();

  // ==== Новый код: функция для обновления is_completed ====
  const handleToggleComplete = async (e) => {
    e.stopPropagation(); // не открывать карточку при клике по тегу
    const token = localStorage.getItem("access");
    if (!token) {
      alert("Необходимо войти в систему");
      return;
    }

    try {
      const res = await fetch(`http://localhost:8000/api/task/${task.id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          is_completed: task.tag === "Готово" ? false : true,
        }),
      });

      if (!res.ok) throw new Error(`Ошибка ${res.status}`);

      const updated = await res.json();
      // console.log("Задача обновлена:", updated);

      // Сообщаем родителю (Board/App), что задача изменилась
      if (onTaskUpdated) {
        onTaskUpdated(updated);
      }
    } catch (err) {
      console.error("Ошибка при обновлении статуса задачи:", err);
      alert("Не удалось обновить статус задачи");
    }
  };

  // ==== Разметка ====
  return (
    <Draggable draggableId={task.id.toString()} index={index}>
      {(provided) => (
        <div
          className="task-card"
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onOpenTask && onOpenTask(task)}
          onDoubleClick={() => onDoubleClick && onDoubleClick(task)}
          style={{ cursor: onOpenTask ? "pointer" : "default" }}
        >
          <p>{title}</p>
          {due ? (
            <div style={{ fontSize: 12, color: overdue ? "#b91c1c" : "#6b7280" }}>
              {overdue ? "просрочено до" : "до"} {due}
            </div>
          ) : null}
          <div className="task-footer">
            <span
              className={`tag tag-${urgencyKey}`}
              onClick={handleToggleComplete}
              style={{ cursor: "pointer", userSelect: "none" }}
              title="Отметить как выполнено"
            >
              {task.is_completed ? "Готово" : tag || "В работе"}
            </span>
            <span className="avatar">{avatar}</span>
          </div>
        </div>
      )}
    </Draggable>
  );
}