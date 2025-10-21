import { DragDropContext } from "react-beautiful-dnd";
import Column from "../components/Column";
import { useMemo, useState } from "react";

export default function Board({ filters, columns, setColumns, onOpenTask }) {

  const normalizeUrgency = (tag) => {
    const t = (tag || "").toLowerCase();
    if (t.startsWith("сроч")) return "urgent";
    if (t.startsWith("норм")) return "normal";
    if (t.startsWith("неваж")) return "low";
    return "normal";
  };

  const filteredColumns = useMemo(() => {
    const byUrgency = filters?.urgency && filters.urgency !== "all";
    const byDate = filters?.hasDate && filters.hasDate !== "all";

    const next = {};
    Object.keys(columns).forEach((col) => {
      let list = columns[col];
      if (byUrgency) {
        list = list.filter((t) => normalizeUrgency(t.tag) === filters.urgency);
      }
      if (byDate) {
        list = list.filter((t) => {
          const has = Boolean(t.due_date);
          return filters.hasDate === "with" ? has : !has;
        });
      }
      next[col] = list;
    });
    return next;
  }, [columns, filters]);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination } = result;

    const sourceCol = [...columns[source.droppableId]];
    const destCol = [...columns[destination.droppableId]];
    const [movedTask] = sourceCol.splice(source.index, 1);
    destCol.splice(destination.index, 0, movedTask);

    setColumns({
      ...columns,
      [source.droppableId]: sourceCol,
      [destination.droppableId]: destCol
    });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="board">
        {Object.keys(filteredColumns).map((colName) => (
          <Column key={colName} title={colName} tasks={filteredColumns[colName]} onOpenTask={onOpenTask} />
        ))}
      </div>
    </DragDropContext>
  );
}
