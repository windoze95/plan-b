import { TENANT_ID } from "./constants";
import { marked } from "marked";

export const fmt = (d) => {
  if (!d) return "\u2014";
  const dt = new Date(d);
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" });
};

export const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);

export const buildPlannerDeepLink = (planId, taskId) =>
  `https://tasks.office.com/${TENANT_ID}/Home/PlanViews/${planId}?Type=PlanLink&Channel=Link&TaskId=${taskId}`;

marked.setOptions({
  breaks: true,
  gfm: true,
});

const renderer = new marked.Renderer();
renderer.link = ({ href, text }) =>
  `<a href="${href}" target="_blank" rel="noreferrer">${text}</a>`;

export function renderMarkdown(text) {
  if (!text) return "";
  return marked.parse(text, { renderer });
}
