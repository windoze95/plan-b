import { useState, useCallback } from "react";
import { DEMO_TASKS, DEMO_BUCKET_NAMES, DEMO_TAG_NAMES, DEMO_TASK_DETAILS } from "./demoData";

export function useDemoData() {
  const [details, setDetails] = useState(null);

  const fetchDetails = useCallback((taskId) => {
    setDetails(DEMO_TASK_DETAILS[taskId] || null);
  }, []);

  const clearDetails = useCallback(() => {
    setDetails(null);
  }, []);

  return {
    // usePlannerData shape
    tasks: DEMO_TASKS,
    bucketNames: DEMO_BUCKET_NAMES,
    tagNames: DEMO_TAG_NAMES,
    loading: false,
    error: null,
    refresh: () => {},
    optimisticUpdate: () => {},

    // useTaskDetails shape
    details,
    detailsLoading: false,
    detailsError: null,
    fetchDetails,
    clearDetails,
  };
}
