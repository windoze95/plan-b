import { graphFetch, graphFetchAll, graphPatch } from "./graphClient";

export async function getMyPlans(token) {
  const data = await graphFetch("/me/planner/plans", token);
  return data.value;
}

export async function getPlanTasks(planId, token) {
  return graphFetchAll(`/planner/plans/${planId}/tasks`, token);
}

export async function getPlanBuckets(planId, token) {
  const data = await graphFetch(`/planner/plans/${planId}/buckets`, token);
  return data.value;
}

export async function getPlanDetails(planId, token) {
  return graphFetch(`/planner/plans/${planId}/details`, token);
}

export async function getTaskDetails(taskId, token) {
  return graphFetch(`/planner/tasks/${taskId}/details`, token);
}

export async function updateTask(taskId, etag, token, fields) {
  return graphPatch(`/planner/tasks/${taskId}`, token, etag, fields);
}

export async function completeTask(taskId, etag, token) {
  return updateTask(taskId, etag, token, { percentComplete: 100 });
}
