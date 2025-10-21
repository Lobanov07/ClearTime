import { Draggable } from "react-beautiful-dnd";

export default function TaskCard({ task, index, onOpenTask, onDoubleClick }) {
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

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided) => (
        <div
          className="task-card"
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onOpenTask && onOpenTask(task)}
          onDoubleClick={() => onDoubleClick && onDoubleClick(task)}
          style={{ cursor: onOpenTask ? 'pointer' : 'default' }}
        >
          <p>{title}</p>
          {due ? <div style={{ fontSize: 12, color: overdue ? "#b91c1c" : "#6b7280" }}>{overdue ? "просрочено до" : "до"} {due}</div> : null}
          <div className="task-footer">
            <span className={`tag tag-${urgencyKey}`}>{tag}</span>
            <span className="avatar">{avatar}</span>
          </div>
        </div>
      )}
    </Draggable>
  );
}
