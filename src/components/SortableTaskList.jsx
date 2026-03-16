import { theme, monoLabel } from "../utils/styles";
import TaskRow from "./TaskRow";

const GRID = "8px 1fr 140px 80px 110px";

const columns = [
  { key: "title", label: "Task" },
  { key: "bucket", label: "Bucket" },
  { key: "priority", label: "Priority" },
  { key: "dueDate", label: "Date", align: "right" },
];

export default function SortableTaskList({
  tasks,
  bucketNames,
  sortColumn,
  sortDirection,
  onSort,
  onTaskClick,
}) {
  const arrow = (col) => {
    if (sortColumn !== col) return "";
    return sortDirection === "asc" ? " \u2191" : " \u2193";
  };

  return (
    <div>
      {/* Column headers */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: GRID,
          gap: 14,
          padding: "8px 16px",
          marginBottom: 4,
        }}
      >
        <div />
        {columns.map((col) => (
          <div
            key={col.key}
            onClick={() => onSort(col.key)}
            style={{
              ...monoLabel,
              fontSize: 10,
              cursor: "pointer",
              textAlign: col.align || "left",
              userSelect: "none",
              color:
                sortColumn === col.key ? theme.blueLight : theme.textMuted,
              transition: "color 0.15s ease",
            }}
          >
            {col.label}
            {arrow(col.key)}
          </div>
        ))}
      </div>

      {/* Task rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {tasks.length === 0 && (
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
        )}
        {tasks.map((t) => (
          <TaskRow
            key={t.id || t.title}
            task={t}
            bucketName={bucketNames[t.bucketId] || "Other"}
            grid={GRID}
            onClick={() => onTaskClick(t)}
          />
        ))}
      </div>
    </div>
  );
}
