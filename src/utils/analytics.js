import { daysBetween } from "./formatters";

export function computeStats(tasks) {
  const completed = tasks.filter((t) => t.percentComplete === 100);
  const inProgress = tasks.filter((t) => t.percentComplete === 50);
  const notStarted = tasks.filter((t) => t.percentComplete === 0);

  const overdue = [...inProgress, ...notStarted].filter(
    (t) => t.dueDateTime && new Date(t.dueDateTime) < new Date()
  ).length;

  const withCycle = completed.filter(
    (t) => t.createdDateTime && t.completedDateTime
  );
  const avgCycle =
    withCycle.length > 0
      ? Math.round(
          withCycle.reduce(
            (acc, t) => acc + daysBetween(t.createdDateTime, t.completedDateTime),
            0
          ) / withCycle.length
        )
      : 0;

  return {
    completed: completed.length,
    inProgress: inProgress.length,
    notStarted: notStarted.length,
    overdue,
    avgCycle,
    total: tasks.length,
  };
}

export function computeByBucket(tasks, bucketNames) {
  const byBucket = {};
  tasks.forEach((t) => {
    const name = bucketNames[t.bucketId] || "Other";
    if (!byBucket[name])
      byBucket[name] = { total: 0, done: 0, active: 0, notStarted: 0 };
    byBucket[name].total++;
    if (t.percentComplete === 100) byBucket[name].done++;
    else if (t.percentComplete === 50) byBucket[name].active++;
    else byBucket[name].notStarted++;
  });
  return byBucket;
}

export function computeByMonth(tasks) {
  const byMonth = {};
  tasks
    .filter((t) => t.percentComplete === 100 && t.completedDateTime)
    .forEach((t) => {
      const d = new Date(t.completedDateTime);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      byMonth[key] = (byMonth[key] || 0) + 1;
    });
  const months = Object.keys(byMonth).sort();
  return months.map((m) => ({ month: m, count: byMonth[m] }));
}
