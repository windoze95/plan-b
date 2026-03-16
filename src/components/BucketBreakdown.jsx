import { useState, useEffect } from "react";
import { theme, panelBase, monoLabel } from "../utils/styles";

export default function BucketBreakdown({
  byBucket,
  selectedBucket,
  onBucketClick,
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setTimeout(() => setMounted(true), 100);
  }, []);

  const entries = Object.entries(byBucket).sort(
    (a, b) => b[1].total - a[1].total
  );

  return (
    <div
      style={{
        ...panelBase,
        marginBottom: 40,
        opacity: mounted ? 1 : 0,
        transition: "opacity 1s ease 0.6s",
      }}
    >
      <div style={{ ...monoLabel, marginBottom: 20 }}>Board Breakdown</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {entries.map(([name, d], i) => (
          <div
            key={i}
            style={{ cursor: "pointer" }}
            onClick={() =>
              onBucketClick(selectedBucket === name ? "all" : name)
            }
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 4,
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  color: selectedBucket === name ? "#fff" : "#a1a1a6",
                }}
              >
                {name}
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: theme.textDim,
                  fontFamily: theme.fontMono,
                }}
              >
                {d.done}/{d.total}
              </span>
            </div>
            <div
              style={{
                height: 6,
                background: "rgba(255,255,255,0.04)",
                borderRadius: 3,
                overflow: "hidden",
                display: "flex",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${(d.done / d.total) * 100}%`,
                  background: theme.green,
                  transition: "width 0.6s ease",
                }}
              />
              <div
                style={{
                  height: "100%",
                  width: `${(d.active / d.total) * 100}%`,
                  background: theme.blue,
                  transition: "width 0.6s ease",
                }}
              />
              <div
                style={{
                  height: "100%",
                  width: `${(d.notStarted / d.total) * 100}%`,
                  background: theme.orange,
                  transition: "width 0.6s ease",
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
        {[
          [theme.green, "Done"],
          [theme.blue, "Active"],
          [theme.orange, "Queued"],
        ].map(([c, l]) => (
          <div
            key={l}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 2,
                background: c,
              }}
            />
            <span style={{ fontSize: 11, color: theme.textDim }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
