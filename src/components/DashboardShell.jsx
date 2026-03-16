import { useState, useEffect } from "react";
import { theme, monoLabel } from "../utils/styles";
import RefreshButton from "./RefreshButton";

export default function DashboardShell({
  planTitle,
  onChangePlan,
  onRefresh,
  onLogout,
  loading,
  taskCount,
  completedCount,
  activeCount,
  onMetrics,
  children,
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setTimeout(() => setMounted(true), 100);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.bg,
        color: theme.text,
        fontFamily: theme.fontSans,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient glows */}
      <div
        style={{
          position: "fixed",
          top: "-30%",
          right: "-20%",
          width: "60vw",
          height: "60vw",
          background:
            "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: "-20%",
          left: "-10%",
          width: "50vw",
          height: "50vw",
          background:
            "radial-gradient(circle, rgba(52,199,89,0.04) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1200,
          margin: "0 auto",
          padding: "32px 24px",
        }}
      >
        {/* Header */}
        <div
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: theme.fontMono,
                  fontSize: 11,
                  color: theme.textDim,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                {planTitle} · Planner Board
              </div>
<div
                style={{ fontSize: 14, color: theme.textDim, marginTop: 4 }}
              >
                {taskCount} tasks tracked · {completedCount} shipped ·{" "}
                {activeCount} in flight
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              {onMetrics && (
                <button
                  onClick={onMetrics}
                  style={{
                    padding: "8px 16px",
                    background: "rgba(59,130,246,0.10)",
                    border: "1px solid rgba(59,130,246,0.3)",
                    borderRadius: 8,
                    color: "#93c5fd",
                    fontSize: 12,
                    cursor: "pointer",
                    fontFamily: theme.fontSans,
                    transition: "all 0.2s ease",
                  }}
                >
                  Metrics
                </button>
              )}
              <RefreshButton onClick={onRefresh} loading={loading} />
              <button
                onClick={onChangePlan}
                style={{
                  padding: "8px 16px",
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: 8,
                  color: theme.textMuted,
                  fontSize: 12,
                  cursor: "pointer",
                  fontFamily: theme.fontSans,
                  transition: "all 0.2s ease",
                }}
              >
                Change Plan
              </button>
              <button
                onClick={onLogout}
                style={{
                  padding: "8px 16px",
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${theme.borderLight}`,
                  borderRadius: 8,
                  color: theme.textMuted,
                  fontSize: 12,
                  cursor: "pointer",
                  fontFamily: theme.fontSans,
                  transition: "all 0.2s ease",
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
