import { useState, useEffect } from "react";
import { getMyPlans } from "../api/plannerApi";
import { theme, cardBase, monoLabel } from "../utils/styles";

export default function PlanSelector({ token, onSelect }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getMyPlans(token);
        if (!cancelled) setPlans(data);
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: theme.fontSans,
      }}
    >
      {/* Ambient glow */}
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
        }}
      />

      <div style={{ maxWidth: 520, width: "100%", padding: "0 24px" }}>
        <div style={{ ...monoLabel, marginBottom: 8 }}>PlannerDash</div>
        <h2
          style={{
            color: theme.text,
            fontSize: 28,
            fontWeight: 700,
            margin: "0 0 8px",
          }}
        >
          Select a Plan
        </h2>
        <p
          style={{
            color: theme.textDim,
            fontSize: 13,
            margin: "0 0 32px",
          }}
        >
          Choose a Planner board to view its dashboard.
        </p>

        {loading && (
          <div style={{ color: theme.textMuted, fontSize: 14 }}>
            Loading plans...
          </div>
        )}
        {error && (
          <div style={{ color: theme.red, fontSize: 14 }}>{error}</div>
        )}
        {!loading && !error && plans.length === 0 && (
          <div style={{ color: theme.textDim, fontSize: 14 }}>
            No plans found. Make sure your token has Tasks.Read permissions.
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {plans.map((plan, i) => (
            <div
              key={plan.id}
              onClick={() => onSelect(plan)}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                ...cardBase,
                cursor: "pointer",
                background:
                  hovered === i ? theme.surfaceHover : theme.surface,
                transition: "all 0.2s ease",
              }}
            >
              <div
                style={{
                  fontSize: 15,
                  color: theme.text,
                  fontWeight: 500,
                }}
              >
                {plan.title}
              </div>
              {plan.owner && plan.owner.user && (
                <div
                  style={{
                    fontSize: 12,
                    color: theme.textDim,
                    marginTop: 4,
                    fontFamily: theme.fontMono,
                  }}
                >
                  {plan.owner.user.displayName || plan.id.slice(0, 12) + "..."}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
