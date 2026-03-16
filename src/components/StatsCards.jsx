import { useState, useEffect } from "react";
import { theme, cardBase, monoLabel } from "../utils/styles";

export default function StatsCards({ stats, total }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setTimeout(() => setMounted(true), 100);
  }, []);

  const cards = [
    {
      label: "Completed",
      value: stats.completed,
      color: theme.green,
      pct: Math.round((stats.completed / total) * 100),
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      color: theme.blue,
      pct: Math.round((stats.inProgress / total) * 100),
    },
    {
      label: "Not Started",
      value: stats.notStarted,
      color: theme.orange,
      pct: Math.round((stats.notStarted / total) * 100),
    },
    { label: "Overdue", value: stats.overdue, color: theme.red, pct: null },
    {
      label: "Avg Cycle",
      value: `${stats.avgCycle}d`,
      color: theme.purple,
      pct: null,
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: 12,
        marginBottom: 40,
      }}
    >
      {cards.map((s, i) => (
        <div
          key={i}
          style={{
            ...cardBase,
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(20px)",
            transition: `all 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.08}s`,
          }}
        >
          <div style={{ ...monoLabel, marginBottom: 8 }}>{s.label}</div>
          <div
            style={{ fontSize: 32, fontWeight: 700, color: s.color, lineHeight: 1 }}
          >
            {s.value}
          </div>
          {s.pct !== null && (
            <div
              style={{
                marginTop: 10,
                height: 3,
                background: theme.border,
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${s.pct}%`,
                  background: s.color,
                  borderRadius: 2,
                  transition:
                    "width 1.5s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
