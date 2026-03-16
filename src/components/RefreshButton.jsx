import { theme } from "../utils/styles";

export default function RefreshButton({ onClick, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        padding: "8px 16px",
        background: loading
          ? "rgba(59,130,246,0.15)"
          : "rgba(255,255,255,0.04)",
        border: `1px solid ${theme.borderLight}`,
        borderRadius: 8,
        color: loading ? theme.blue : theme.textMuted,
        fontSize: 12,
        cursor: loading ? "wait" : "pointer",
        fontFamily: theme.fontSans,
        display: "flex",
        alignItems: "center",
        gap: 6,
        transition: "all 0.2s ease",
      }}
    >
      <span
        style={{
          display: "inline-block",
          animation: loading ? "spin 1s linear infinite" : "none",
          fontSize: 14,
        }}
      >
        {"\u21BB"}
      </span>
      {loading ? "Refreshing..." : "Refresh"}
    </button>
  );
}
