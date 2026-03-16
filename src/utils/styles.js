export const theme = {
  bg: "#0a0a0b",
  surface: "rgba(255,255,255,0.03)",
  surfaceHover: "rgba(255,255,255,0.04)",
  surfaceSubtle: "rgba(255,255,255,0.015)",
  border: "rgba(255,255,255,0.06)",
  borderLight: "rgba(255,255,255,0.08)",
  text: "#e8e6e3",
  textMuted: "#8e8e93",
  textDim: "#636366",
  textDark: "#48484a",
  textDarkest: "#2c2c2e",
  fontSans: "'DM Sans', 'Helvetica Neue', sans-serif",
  fontMono: "'DM Mono', monospace",
  green: "#34c759",
  blue: "#3b82f6",
  blueLight: "#60a5fa",
  orange: "#ff9500",
  red: "#ff3b30",
  purple: "#af52de",
};

export const cardBase = {
  background: theme.surface,
  border: `1px solid ${theme.border}`,
  borderRadius: 12,
  padding: "20px 18px",
};

export const panelBase = {
  background: "rgba(255,255,255,0.02)",
  border: `1px solid ${theme.border}`,
  borderRadius: 16,
  padding: "24px 20px",
};

export const monoLabel = {
  fontSize: 11,
  color: theme.textMuted,
  textTransform: "uppercase",
  letterSpacing: 1.5,
  fontFamily: theme.fontMono,
};
