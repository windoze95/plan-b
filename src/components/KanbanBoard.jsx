import { useMemo, useState, useCallback, useRef } from "react";
import { theme, monoLabel } from "../utils/styles";
import { PRIORITY_MAP, PRIORITY_COLOR, STATUS_MAP } from "../utils/constants";
import { fmt } from "../utils/formatters";

const STATUS_ORDER = [
  [0, "Not Started", "#ff9500"],
  [50, "In Progress", "#3b82f6"],
  [100, "Completed", "#34c759"],
];

const PRIORITY_ORDER = [
  [1, "Urgent", "#ff3b30"],
  [3, "Important", "#ff9500"],
  [5, "Medium", "#34c759"],
  [9, "Low", "#636366"],
];

export default function KanbanBoard({
  tasks,
  bucketNames,
  groupBy,
  onTaskClick,
  onMoveTask,
}) {
  const [dragTaskId, setDragTaskId] = useState(null);

  const columns = useMemo(() => {
    if (groupBy === "status") {
      return STATUS_ORDER.map(([val, label]) => {
        const col = tasks.filter((t) => t.percentComplete === val);
        return [label, col];
      }).filter(([, col]) => col.length > 0);
    }

    if (groupBy === "priority") {
      return PRIORITY_ORDER.map(([val, label]) => {
        const col = tasks.filter((t) => t.priority === val);
        return [label, col];
      }).filter(([, col]) => col.length > 0);
    }

    const grouped = {};
    tasks.forEach((t) => {
      const name = bucketNames[t.bucketId] || "Other";
      if (!grouped[name]) grouped[name] = [];
      grouped[name].push(t);
    });
    return Object.entries(grouped).sort((a, b) => b[1].length - a[1].length);
  }, [tasks, bucketNames, groupBy]);

  // Also compute all possible drop targets (columns that might be empty)
  const allColumnNames = useMemo(() => {
    if (groupBy === "status") return STATUS_ORDER.map(([, l]) => l);
    if (groupBy === "priority") return PRIORITY_ORDER.map(([, l]) => l);
    return [...new Set(Object.values(bucketNames))].sort();
  }, [groupBy, bucketNames]);

  // Merge: show populated columns + empty ones as drop targets when dragging
  const visibleColumns = useMemo(() => {
    if (!dragTaskId) return columns;
    const existing = new Set(columns.map(([name]) => name));
    const extras = allColumnNames
      .filter((n) => !existing.has(n))
      .map((n) => [n, []]);
    // For status/priority, maintain defined order
    if (groupBy === "status") {
      const order = STATUS_ORDER.map(([, l]) => l);
      return [...columns, ...extras].sort(
        (a, b) => order.indexOf(a[0]) - order.indexOf(b[0])
      );
    }
    if (groupBy === "priority") {
      const order = PRIORITY_ORDER.map(([, l]) => l);
      return [...columns, ...extras].sort(
        (a, b) => order.indexOf(a[0]) - order.indexOf(b[0])
      );
    }
    return [...columns, ...extras];
  }, [columns, dragTaskId, allColumnNames, groupBy]);

  const handleDrop = useCallback(
    (columnName) => {
      if (!dragTaskId) return;
      const task = tasks.find((t) => t.id === dragTaskId);
      if (task) onMoveTask(task, groupBy, columnName);
      setDragTaskId(null);
    },
    [dragTaskId, tasks, groupBy, onMoveTask]
  );

  if (columns.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: 40,
          color: theme.textDim,
          fontSize: 14,
        }}
      >
        No tasks match your filters.
      </div>
    );
  }

  return (
    <div
      className="kanban-board"
      style={{
        display: "flex",
        gap: 12,
        overflowX: "auto",
        paddingBottom: 8,
      }}
    >
      <style>
        {`
          .kanban-board::-webkit-scrollbar { height: 6px; }
          .kanban-board::-webkit-scrollbar-track { background: transparent; }
          .kanban-board::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
          .kanban-board::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
          .kanban-col::-webkit-scrollbar { width: 6px; }
          .kanban-col::-webkit-scrollbar-track { background: transparent; }
          .kanban-col::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
          .kanban-col::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        `}
      </style>
      {visibleColumns.map(([colName, colTasks]) => (
        <KanbanColumn
          key={colName}
          name={colName}
          tasks={colTasks}
          isDragging={!!dragTaskId}
          onTaskClick={onTaskClick}
          onDragStart={setDragTaskId}
          onDrop={() => handleDrop(colName)}
        />
      ))}
    </div>
  );
}

function KanbanColumn({
  name,
  tasks,
  isDragging,
  onTaskClick,
  onDragStart,
  onDrop,
}) {
  const [dragOver, setDragOver] = useState(false);
  const done = tasks.filter((t) => t.percentComplete === 100).length;

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        onDrop();
      }}
      style={{
        flex: "0 0 280px",
        minWidth: 280,
        background: dragOver
          ? "rgba(59,130,246,0.06)"
          : "rgba(255,255,255,0.02)",
        border: `1px solid ${dragOver ? "rgba(59,130,246,0.4)" : theme.border}`,
        borderRadius: 12,
        display: "flex",
        flexDirection: "column",
        maxHeight: "70vh",
        transition: "all 0.15s ease",
      }}
    >
      {/* Column header */}
      <div
        style={{
          padding: "14px 14px 10px",
          borderBottom: `1px solid ${theme.border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 13, color: theme.text, fontWeight: 500 }}>
          {name}
        </span>
        <span style={{ ...monoLabel, fontSize: 10, margin: 0 }}>
          {done}/{tasks.length}
        </span>
      </div>

      {/* Cards */}
      <div
        className="kanban-col"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 8,
          display: "flex",
          flexDirection: "column",
          gap: 6,
          minHeight: isDragging ? 60 : 0,
        }}
      >
        {tasks.map((t) => (
          <KanbanCard
            key={t.id || t.title}
            task={t}
            onTaskClick={onTaskClick}
            onDragStart={onDragStart}
          />
        ))}
        {tasks.length === 0 && isDragging && (
          <div
            style={{
              padding: 16,
              textAlign: "center",
              color: theme.textDim,
              fontSize: 11,
              fontFamily: theme.fontMono,
            }}
          >
            Drop here
          </div>
        )}
      </div>
    </div>
  );
}

function KanbanCard({ task, onTaskClick, onDragStart }) {
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);
  const isOverdue =
    task.percentComplete < 100 &&
    task.dueDateTime &&
    new Date(task.dueDateTime) < new Date();

  const statusColor =
    task.percentComplete === 100
      ? theme.green
      : task.percentComplete === 50
        ? theme.blue
        : theme.orange;

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", task.id);
        setDragging(true);
        onDragStart(task.id);
      }}
      onDragEnd={() => {
        setDragging(false);
        onDragStart(null);
      }}
      onClick={() => onTaskClick(task)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "10px 12px",
        background: dragging
          ? "rgba(59,130,246,0.08)"
          : hovered
            ? "rgba(255,255,255,0.05)"
            : "rgba(255,255,255,0.025)",
        border: `1px solid ${dragging ? "rgba(59,130,246,0.3)" : hovered ? "rgba(255,255,255,0.1)" : theme.border}`,
        borderRadius: 8,
        cursor: "grab",
        transition: "all 0.15s ease",
        borderLeft: `3px solid ${statusColor}`,
        opacity: dragging ? 0.5 : 1,
      }}
    >
      {/* Title */}
      <div
        style={{
          fontSize: 12,
          color:
            task.percentComplete === 100 ? theme.textDim : theme.text,
          textDecoration:
            task.percentComplete === 100 ? "line-through" : "none",
          textDecorationColor: theme.textDark,
          lineHeight: 1.4,
          marginBottom: 8,
        }}
      >
        {task.title}
      </div>

      {/* Footer row */}
      <div
        style={{
          display: "flex",
          gap: 6,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontSize: 10,
            color: statusColor,
            fontFamily: theme.fontMono,
          }}
        >
          {STATUS_MAP[task.percentComplete]}
        </span>

        <span
          style={{
            fontSize: 9,
            padding: "1px 6px",
            borderRadius: 3,
            background: `${PRIORITY_COLOR[task.priority]}18`,
            color: PRIORITY_COLOR[task.priority],
            fontFamily: theme.fontMono,
          }}
        >
          {PRIORITY_MAP[task.priority]}
        </span>

        {isOverdue && (
          <span
            style={{
              fontSize: 9,
              color: theme.red,
              fontFamily: theme.fontMono,
            }}
          >
            overdue
          </span>
        )}

        {task.tags &&
          task.tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: 9,
                color: theme.purple,
                background: "rgba(175,82,222,0.12)",
                padding: "1px 5px",
                borderRadius: 3,
                fontFamily: theme.fontMono,
              }}
            >
              {tag}
            </span>
          ))}

        <span
          style={{
            fontSize: 10,
            color: theme.textDark,
            fontFamily: theme.fontMono,
            marginLeft: "auto",
          }}
        >
          {task.completedDateTime
            ? fmt(task.completedDateTime)
            : task.dueDateTime
              ? fmt(task.dueDateTime)
              : ""}
        </span>
      </div>
    </div>
  );
}
