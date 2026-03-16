import { useState } from "react";
import { theme } from "../utils/styles";
import { PRIORITY_MAP, PRIORITY_COLOR, STATUS_MAP } from "../utils/constants";
import { fmt } from "../utils/formatters";

export default function TaskRow({ task, bucketName, grid, onClick }) {
  const [hovered, setHovered] = useState(false);
  const isOverdue =
    task.percentComplete < 100 &&
    task.dueDateTime &&
    new Date(task.dueDateTime) < new Date();

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "grid",
        gridTemplateColumns: grid,
        alignItems: "center",
        gap: 14,
        padding: "12px 16px",
        background: hovered ? theme.surfaceHover : theme.surfaceSubtle,
        borderRadius: 8,
        transition: "background 0.15s ease",
        cursor: "pointer",
      }}
    >
      {/* Status dot */}
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background:
            task.percentComplete === 100
              ? theme.green
              : task.percentComplete === 50
                ? theme.blue
                : theme.orange,
          boxShadow:
            task.percentComplete === 100
              ? "0 0 6px rgba(52,199,89,0.4)"
              : "none",
        }}
      />

      {/* Title + tags */}
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            color:
              task.percentComplete === 100 ? theme.textDim : theme.text,
            textDecoration:
              task.percentComplete === 100 ? "line-through" : "none",
            textDecorationColor: theme.textDark,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {task.title}
        </div>
        <div
          style={{
            fontSize: 11,
            color: theme.textDark,
            marginTop: 2,
            display: "flex",
            gap: 6,
            fontFamily: theme.fontMono,
            alignItems: "center",
          }}
        >
            <span style={{
              color: task.percentComplete === 100
                ? theme.green
                : task.percentComplete === 50
                  ? theme.blue
                  : theme.orange,
            }}>
              {STATUS_MAP[task.percentComplete] || "Unknown"}
            </span>
            {isOverdue && <span style={{ color: theme.red }}>overdue</span>}
            {task.tags &&
              task.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    color: theme.purple,
                    background: "rgba(175,82,222,0.12)",
                    padding: "0 5px",
                    borderRadius: 3,
                    fontSize: 10,
                  }}
                >
                  {tag}
                </span>
              ))}
        </div>
      </div>

      {/* Bucket */}
      <div
        style={{
          fontSize: 11,
          color: theme.textDim,
          fontFamily: theme.fontMono,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {bucketName}
      </div>

      {/* Priority badge */}
      <div>
        <span
          style={{
            fontSize: 10,
            padding: "2px 8px",
            borderRadius: 4,
            background: `${PRIORITY_COLOR[task.priority]}18`,
            color: PRIORITY_COLOR[task.priority],
            fontFamily: theme.fontMono,
            whiteSpace: "nowrap",
          }}
        >
          {PRIORITY_MAP[task.priority]}
        </span>
      </div>

      {/* Date */}
      <div
        style={{
          fontSize: 11,
          color: theme.textDark,
          fontFamily: theme.fontMono,
          whiteSpace: "nowrap",
          textAlign: "right",
        }}
      >
        {task.completedDateTime
          ? fmt(task.completedDateTime)
          : task.dueDateTime
            ? `due ${fmt(task.dueDateTime)}`
            : "no date"}
      </div>
    </div>
  );
}
