import { useState, useEffect } from "react";
import { theme, panelBase, monoLabel } from "../utils/styles";

export default function VelocityChart({ monthData }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setTimeout(() => setMounted(true), 100);
  }, []);

  const maxMonth = Math.max(...monthData.map((m) => m.count), 1);

  return (
    <div
      style={{
        ...panelBase,
        marginBottom: 40,
        opacity: mounted ? 1 : 0,
        transition: "opacity 1s ease 0.5s",
      }}
    >
      <div style={{ ...monoLabel, marginBottom: 20 }}>
        Completion Velocity · Monthly
      </div>
      <div
        style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 120 }}
      >
        {monthData.map((m, i) => {
          const h = (m.count / maxMonth) * 100;
          const label = new Date(m.month + "-01").toLocaleDateString("en-US", {
            month: "short",
          });
          const yr = m.month.slice(2, 4);
          return (
            <div
              key={i}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: theme.textDim,
                  fontFamily: theme.fontMono,
                }}
              >
                {m.count}
              </div>
              <div
                style={{
                  width: "100%",
                  maxWidth: 40,
                  height: `${h}%`,
                  minHeight: 3,
                  background:
                    "linear-gradient(180deg, #3b82f6 0%, rgba(59,130,246,0.3) 100%)",
                  borderRadius: "4px 4px 0 0",
                  transition: `height 1s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.05}s`,
                }}
              />
              <div
                style={{
                  fontSize: 9,
                  color: theme.textDark,
                  fontFamily: theme.fontMono,
                  whiteSpace: "nowrap",
                }}
              >
                {label} '{yr}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
