// Static seed data with dates relative to now so it always looks fresh.

const NOW = Date.now();
const DAY = 86400000;

function daysAgo(n) {
  return new Date(NOW - n * DAY).toISOString();
}
function daysFromNow(n) {
  return new Date(NOW + n * DAY).toISOString();
}

// Bucket IDs → names
export const DEMO_BUCKET_NAMES = {
  b1: "Backlog",
  b2: "Design",
  b3: "Development",
  b4: "QA / Testing",
  b5: "Shipped",
};

// Tag category keys → names
export const DEMO_TAG_NAMES = {
  category1: "Bug",
  category2: "Feature",
  category3: "Infra",
  category4: "Docs",
};

// ~20 tasks covering all statuses, priorities, overdue, tags, and spread completions
export const DEMO_TASKS = [
  // ── Backlog (not started) ──
  { id: "t01", title: "Write onboarding guide for new hires", percentComplete: 0, createdDateTime: daysAgo(12), dueDateTime: daysFromNow(20), completedDateTime: null, priority: 5, bucketId: "b1", assigneeCount: 1, etag: null, tags: ["Docs"] },
  { id: "t02", title: "Evaluate new charting library options", percentComplete: 0, createdDateTime: daysAgo(8), dueDateTime: daysFromNow(14), completedDateTime: null, priority: 9, bucketId: "b1", assigneeCount: 0, etag: null, tags: [] },
  { id: "t03", title: "Audit third-party dependency licenses", percentComplete: 0, createdDateTime: daysAgo(5), dueDateTime: daysFromNow(30), completedDateTime: null, priority: 5, bucketId: "b1", assigneeCount: 1, etag: null, tags: ["Infra"] },

  // ── Design (mix) ──
  { id: "t04", title: "Design settings page mockups", percentComplete: 50, createdDateTime: daysAgo(18), dueDateTime: daysFromNow(5), completedDateTime: null, priority: 3, bucketId: "b2", assigneeCount: 2, etag: null, tags: ["Feature"] },
  { id: "t05", title: "Create icon set for notifications", percentComplete: 0, createdDateTime: daysAgo(6), dueDateTime: daysFromNow(10), completedDateTime: null, priority: 5, bucketId: "b2", assigneeCount: 1, etag: null, tags: [] },
  { id: "t06", title: "Redesign empty-state illustrations", percentComplete: 50, createdDateTime: daysAgo(22), dueDateTime: daysFromNow(3), completedDateTime: null, priority: 5, bucketId: "b2", assigneeCount: 1, etag: null, tags: ["Feature"] },

  // ── Development (in progress + not started + overdue) ──
  { id: "t07", title: "Implement dark mode toggle", percentComplete: 50, createdDateTime: daysAgo(30), dueDateTime: daysFromNow(2), completedDateTime: null, priority: 3, bucketId: "b3", assigneeCount: 2, etag: null, tags: ["Feature"] },
  { id: "t08", title: "Fix timezone offset in date picker", percentComplete: 50, createdDateTime: daysAgo(10), dueDateTime: daysAgo(2), completedDateTime: null, priority: 1, bucketId: "b3", assigneeCount: 1, etag: null, tags: ["Bug"] },
  { id: "t09", title: "Add CSV export for reports", percentComplete: 0, createdDateTime: daysAgo(4), dueDateTime: daysFromNow(12), completedDateTime: null, priority: 5, bucketId: "b3", assigneeCount: 0, etag: null, tags: ["Feature"] },
  { id: "t10", title: "Migrate CI pipeline to GitHub Actions", percentComplete: 50, createdDateTime: daysAgo(15), dueDateTime: daysAgo(5), completedDateTime: null, priority: 3, bucketId: "b3", assigneeCount: 1, etag: null, tags: ["Infra"] },
  { id: "t11", title: "Refactor auth token refresh logic", percentComplete: 0, createdDateTime: daysAgo(3), dueDateTime: daysFromNow(8), completedDateTime: null, priority: 1, bucketId: "b3", assigneeCount: 1, etag: null, tags: ["Bug", "Infra"] },

  // ── QA / Testing (in progress + not started) ──
  { id: "t12", title: "Write E2E tests for checkout flow", percentComplete: 0, createdDateTime: daysAgo(7), dueDateTime: daysFromNow(6), completedDateTime: null, priority: 3, bucketId: "b4", assigneeCount: 1, etag: null, tags: [] },
  { id: "t13", title: "Load test API under 500 concurrent users", percentComplete: 0, createdDateTime: daysAgo(2), dueDateTime: daysFromNow(15), completedDateTime: null, priority: 5, bucketId: "b4", assigneeCount: 0, etag: null, tags: ["Infra"] },

  // ── Shipped (completed, spread across 6 months) ──
  { id: "t14", title: "Set up error monitoring with Sentry", percentComplete: 100, createdDateTime: daysAgo(180), dueDateTime: daysAgo(160), completedDateTime: daysAgo(166), priority: 3, bucketId: "b5", assigneeCount: 1, etag: null, tags: ["Infra"] },
  { id: "t15", title: "Build user profile page", percentComplete: 100, createdDateTime: daysAgo(150), dueDateTime: daysAgo(120), completedDateTime: daysAgo(125), priority: 5, bucketId: "b5", assigneeCount: 2, etag: null, tags: ["Feature"] },
  { id: "t16", title: "Fix broken pagination on search results", percentComplete: 100, createdDateTime: daysAgo(120), dueDateTime: daysAgo(100), completedDateTime: daysAgo(105), priority: 1, bucketId: "b5", assigneeCount: 1, etag: null, tags: ["Bug"] },
  { id: "t17", title: "Add keyboard shortcuts for power users", percentComplete: 100, createdDateTime: daysAgo(90), dueDateTime: daysAgo(70), completedDateTime: daysAgo(76), priority: 9, bucketId: "b5", assigneeCount: 1, etag: null, tags: ["Feature"] },
  { id: "t18", title: "Upgrade React to v19", percentComplete: 100, createdDateTime: daysAgo(60), dueDateTime: daysAgo(40), completedDateTime: daysAgo(46), priority: 3, bucketId: "b5", assigneeCount: 2, etag: null, tags: ["Infra"] },
  { id: "t19", title: "Write API documentation for v2 endpoints", percentComplete: 100, createdDateTime: daysAgo(45), dueDateTime: daysAgo(25), completedDateTime: daysAgo(28), priority: 5, bucketId: "b5", assigneeCount: 1, etag: null, tags: ["Docs"] },
  { id: "t20", title: "Resolve memory leak in WebSocket handler", percentComplete: 100, createdDateTime: daysAgo(28), dueDateTime: daysAgo(14), completedDateTime: daysAgo(18), priority: 1, bucketId: "b5", assigneeCount: 1, etag: null, tags: ["Bug"] },
  { id: "t21", title: "Implement SSO with SAML provider", percentComplete: 100, createdDateTime: daysAgo(20), dueDateTime: daysAgo(5), completedDateTime: daysAgo(6), priority: 3, bucketId: "b5", assigneeCount: 2, etag: null, tags: ["Feature", "Infra"] },
];

// Task detail data (description, checklist, references) for selected tasks
export const DEMO_TASK_DETAILS = {
  t07: {
    description: `## Dark Mode Implementation\n\nAdd a system-aware dark/light theme toggle to the app shell.\n\n### Requirements\n- Respect \`prefers-color-scheme\` on first visit\n- Persist choice in localStorage\n- Transition smoothly (no flash of wrong theme)\n\n> **Note:** The design tokens are already in \`src/utils/styles.js\` — wire them up to a CSS custom-property layer.`,
    checklist: {
      c1: { title: "Add ThemeProvider context", isChecked: true },
      c2: { title: "Create toggle component", isChecked: true },
      c3: { title: "Map design tokens to CSS variables", isChecked: false },
      c4: { title: "Test across Chrome, Firefox, Safari", isChecked: false },
      c5: { title: "Update Storybook stories", isChecked: false },
    },
    references: {
      "https%3A%2F%2Ffigma.com%2Ffile%2Fabc123%2Fdark-mode": { alias: "Figma — Dark Mode Spec" },
      "https%3A%2F%2Fgithub.com%2Forg%2Frepo%2Fissues%2F42": { alias: "GitHub Issue #42" },
    },
  },
  t08: {
    description: `### Bug: Timezone offset in date picker\n\nUsers in UTC−5 and further west see dates shifted by one day when selecting a due date. Root cause: the \`toISOString()\` call normalises to UTC before we strip the time component.\n\n**Steps to reproduce:**\n1. Set system TZ to \`America/Chicago\`\n2. Open task → pick March 15\n3. Saved value shows March 14\n\n**Fix:** use \`toLocaleDateString\` or a TZ-aware library.`,
    checklist: {
      c1: { title: "Write failing regression test", isChecked: true },
      c2: { title: "Patch date normalisation util", isChecked: true },
      c3: { title: "Verify fix across timezones", isChecked: false },
    },
    references: {
      "https%3A%2F%2Flinear.app%2Fteam%2FENG%2Fissue%2FENG-318": { alias: "Linear ENG-318" },
    },
  },
  t11: {
    description: `Refactor the token refresh logic to use a single in-flight promise so parallel API calls don't trigger multiple refresh requests.\n\n### Current behaviour\nEach 401 response independently calls \`/oauth2/token\`. Under load this causes a race where one refresh invalidates the other's new token.\n\n### Proposed fix\nWrap refresh in a shared promise (singleton pattern). All callers await the same promise until it resolves.`,
    checklist: {
      c1: { title: "Extract refreshToken into shared module", isChecked: false },
      c2: { title: "Add mutex / dedup wrapper", isChecked: false },
      c3: { title: "Integration test with concurrent 401s", isChecked: false },
    },
    references: {},
  },
};
