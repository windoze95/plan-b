import { useState, useRef, useCallback } from "react";
import { getTaskDetails } from "../api/plannerApi";

export function useTaskDetails(token) {
  const cache = useRef(new Map());
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDetails = useCallback(
    async (taskId) => {
      if (cache.current.has(taskId)) {
        setDetails(cache.current.get(taskId));
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await getTaskDetails(taskId, token);
        cache.current.set(taskId, data);
        setDetails(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const clearDetails = useCallback(() => {
    setDetails(null);
    setError(null);
  }, []);

  return { details, loading, error, fetchDetails, clearDetails };
}
