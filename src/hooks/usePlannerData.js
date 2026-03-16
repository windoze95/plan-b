import { useReducer, useCallback } from "react";
import { getPlanTasks, getPlanBuckets, getPlanDetails } from "../api/plannerApi";

const initialState = {
  tasks: [],
  bucketNames: {},
  tagNames: {},
  loading: false,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return {
        ...state,
        loading: false,
        tasks: action.tasks,
        bucketNames: action.bucketNames,
        tagNames: action.tagNames,
      };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.error };
    case "UPDATE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.taskId ? { ...t, ...action.fields } : t
        ),
      };
    default:
      return state;
  }
}

export function usePlannerData(planId, token) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const refresh = useCallback(async () => {
    if (!planId || !token) return;
    dispatch({ type: "FETCH_START" });
    try {
      const [tasks, buckets, planDetails] = await Promise.all([
        getPlanTasks(planId, token),
        getPlanBuckets(planId, token),
        getPlanDetails(planId, token),
      ]);

      const bucketNames = {};
      buckets.forEach((b) => {
        bucketNames[b.id] = b.name;
      });

      const tagNames = {};
      if (planDetails.categoryDescriptions) {
        Object.entries(planDetails.categoryDescriptions).forEach(([key, name]) => {
          if (name) tagNames[key] = name;
        });
      }

      const transformedTasks = tasks.map((t) => {
        const tags = [];
        if (t.appliedCategories) {
          Object.entries(t.appliedCategories).forEach(([key, applied]) => {
            if (applied && tagNames[key]) tags.push(tagNames[key]);
          });
        }
        return {
          id: t.id,
          title: t.title,
          percentComplete: t.percentComplete,
          createdDateTime: t.createdDateTime,
          dueDateTime: t.dueDateTime,
          completedDateTime: t.completedDateTime,
          priority: t.priority,
          bucketId: t.bucketId,
          assigneeCount: t.assignments ? Object.keys(t.assignments).length : 0,
          etag: t["@odata.etag"] || null,
          tags,
        };
      });

      dispatch({
        type: "FETCH_SUCCESS",
        tasks: transformedTasks,
        bucketNames,
        tagNames,
      });
    } catch (e) {
      dispatch({
        type: "FETCH_ERROR",
        error: e.status === 401 ? "auth_expired" : e.message || "Failed to fetch plan data",
      });
    }
  }, [planId, token]);

  const optimisticUpdate = useCallback((taskId, fields) => {
    dispatch({ type: "UPDATE_TASK", taskId, fields });
  }, []);

  return { ...state, refresh, optimisticUpdate };
}
