import { useContext } from "react";
import { GraphAuthContext } from "./AuthProvider";

export function useGraphToken() {
  const ctx = useContext(GraphAuthContext);
  if (!ctx) throw new Error("useGraphToken must be used within AuthProvider");
  return ctx;
}
