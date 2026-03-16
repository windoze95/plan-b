export const isDemoMode =
  new URLSearchParams(window.location.search).has("demo") ||
  import.meta.env.VITE_DEMO === "true";
