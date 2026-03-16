import { useState, useCallback, useMemo } from "react";
import DashboardShell from "../components/DashboardShell";
import StatsCards from "../components/StatsCards";
import VelocityChart from "../components/VelocityChart";
import BucketBreakdown from "../components/BucketBreakdown";
import FilterBar from "../components/FilterBar";
import SortableTaskList from "../components/SortableTaskList";
import KanbanBoard from "../components/KanbanBoard";
import TaskDetailPanel from "../components/TaskDetailPanel";
import { useFilterSort } from "../hooks/useFilterSort";
import { computeStats, computeByBucket, computeByMonth } from "../utils/analytics";
import { useDemoData } from "./useDemoData";

export default function DemoApp() {
  const {
    tasks,
    bucketNames,
    tagNames,
    loading,
    error,
    refresh,
    details,
    detailsLoading,
    detailsError,
    fetchDetails,
    clearDetails,
  } = useDemoData();

  const plan = { id: "demo", title: "Product Roadmap Q1" };

  const [selectedTask, setSelectedTask] = useState(null);
  const [viewMode, setViewMode] = useState("list");
  const [kanbanGroup, setKanbanGroup] = useState("bucket");

  const {
    filters,
    setFilter,
    clearFilters,
    sortColumn,
    sortDirection,
    toggleSort,
    filtered,
    activeFilterCount,
  } = useFilterSort(tasks, bucketNames);

  const handleTaskClick = useCallback(
    (task) => {
      setSelectedTask(task);
      fetchDetails(task.id);
    },
    [fetchDetails]
  );

  const handleCloseDetail = useCallback(() => {
    setSelectedTask(null);
    clearDetails();
  }, [clearDetails]);

  const stats = useMemo(() => computeStats(tasks), [tasks]);
  const byBucket = useMemo(() => computeByBucket(tasks, bucketNames), [tasks, bucketNames]);
  const monthData = useMemo(() => computeByMonth(tasks), [tasks]);

  // No-ops for actions that require auth
  const noop = () => {};

  return (
    <>
      <DashboardShell
        planTitle={plan.title}
        onChangePlan={noop}
        onRefresh={noop}
        onLogout={noop}
        loading={loading}
        taskCount={tasks.length}
        completedCount={stats.completed}
        activeCount={stats.inProgress + stats.notStarted}
      >
        <StatsCards stats={stats} total={tasks.length} />
        <VelocityChart monthData={monthData} />
        <BucketBreakdown
          byBucket={byBucket}
          selectedBucket={filters.bucket}
          onBucketClick={(b) => setFilter("bucket", b)}
        />
        {/* View toggle + kanban grouping */}
        <div style={{ display: "flex", gap: 4, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
          {[["list", "List"], ["kanban", "Kanban"]].map(([v, l]) => (
            <button
              key={v}
              onClick={() => setViewMode(v)}
              style={{
                padding: "6px 16px",
                borderRadius: 20,
                border: "1px solid",
                borderColor: viewMode === v ? "rgba(59,130,246,0.5)" : "rgba(255,255,255,0.08)",
                background: viewMode === v ? "rgba(59,130,246,0.12)" : "transparent",
                color: viewMode === v ? "#93c5fd" : "#8e8e93",
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "'DM Sans', system-ui, sans-serif",
                transition: "all 0.2s ease",
              }}
            >
              {l}
            </button>
          ))}
          {viewMode === "kanban" && (
            <>
              <span style={{ fontSize: 11, color: "#636366", margin: "0 6px 0 12px" }}>Group by</span>
              {[["bucket", "Bucket"], ["status", "Status"], ["priority", "Priority"]].map(([v, l]) => (
                <button
                  key={v}
                  onClick={() => setKanbanGroup(v)}
                  style={{
                    padding: "4px 12px",
                    borderRadius: 16,
                    border: "1px solid",
                    borderColor: kanbanGroup === v ? "rgba(52,199,89,0.5)" : "rgba(255,255,255,0.08)",
                    background: kanbanGroup === v ? "rgba(52,199,89,0.12)" : "transparent",
                    color: kanbanGroup === v ? "#34c759" : "#8e8e93",
                    fontSize: 11,
                    cursor: "pointer",
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                    transition: "all 0.2s ease",
                  }}
                >
                  {l}
                </button>
              ))}
            </>
          )}
        </div>
        <FilterBar
          filters={filters}
          setFilter={setFilter}
          clearFilters={clearFilters}
          activeFilterCount={activeFilterCount}
          bucketNames={bucketNames}
          tagNames={tagNames}
          resultCount={filtered.length}
          totalCount={tasks.length}
        />
        {viewMode === "list" ? (
          <SortableTaskList
            tasks={filtered}
            bucketNames={bucketNames}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={toggleSort}
            onTaskClick={handleTaskClick}
          />
        ) : (
          <KanbanBoard
            tasks={filtered}
            bucketNames={bucketNames}
            groupBy={kanbanGroup}
            onTaskClick={handleTaskClick}
            onMoveTask={noop}
          />
        )}
      </DashboardShell>

      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          planId={plan.id}
          details={details}
          detailsLoading={detailsLoading}
          detailsError={detailsError}
          bucketName={bucketNames[selectedTask.bucketId] || "Other"}
          onClose={handleCloseDetail}
          onComplete={noop}
        />
      )}
    </>
  );
}
