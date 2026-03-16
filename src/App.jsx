import React, { Suspense, useState, useEffect, useCallback, useMemo } from "react";
import { isDemoMode } from "./demo/isDemoMode";
import AuthProvider from "./auth/AuthProvider";
import { GraphAuthContext } from "./auth/AuthProvider";

const DemoApp = isDemoMode ? React.lazy(() => import("./demo/DemoApp")) : null;
import PlanSelector from "./components/PlanSelector";
import DashboardShell from "./components/DashboardShell";
import StatsCards from "./components/StatsCards";
import VelocityChart from "./components/VelocityChart";
import BucketBreakdown from "./components/BucketBreakdown";
import FilterBar from "./components/FilterBar";
import SortableTaskList from "./components/SortableTaskList";
import KanbanBoard from "./components/KanbanBoard";
import TaskDetailPanel from "./components/TaskDetailPanel";
import { usePlannerData } from "./hooks/usePlannerData";
import { useTaskDetails } from "./hooks/useTaskDetails";
import { useFilterSort } from "./hooks/useFilterSort";
import { completeTask, updateTask } from "./api/plannerApi";
import { computeStats, computeByBucket, computeByMonth } from "./utils/analytics";
import { theme } from "./utils/styles";

export default function App() {
  if (isDemoMode && DemoApp) {
    return (
      <Suspense fallback={<div style={{ color: "#e8e6e3", textAlign: "center", padding: 80 }}>Loading demo...</div>}>
        <DemoApp />
      </Suspense>
    );
  }

  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}

function AuthenticatedApp() {
  return (
    <GraphAuthContext.Consumer>
      {(auth) => (auth ? <AppContent auth={auth} /> : null)}
    </GraphAuthContext.Consumer>
  );
}

const LS_PLAN = "plannerdash_plan";

function loadSavedPlan() {
  try {
    const raw = localStorage.getItem(LS_PLAN);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function AppContent({ auth }) {
  const { token, logout, recordFailure } = auth;
  const [selectedPlan, setSelectedPlan] = useState(loadSavedPlan);
  const [selectedTask, setSelectedTask] = useState(null);
  const [viewMode, setViewMode] = useState(() => {
    try { return localStorage.getItem("plannerdash_view") || "list"; } catch { return "list"; }
  });
  const [kanbanGroup, setKanbanGroup] = useState(() => {
    try { return localStorage.getItem("plannerdash_kanban_group") || "bucket"; } catch { return "bucket"; }
  });

  const { tasks, bucketNames, tagNames, loading, error, refresh, optimisticUpdate } = usePlannerData(
    selectedPlan?.id,
    token
  );
  const {
    details,
    loading: detailsLoading,
    error: detailsError,
    fetchDetails,
    clearDetails,
  } = useTaskDetails(token);
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

  // Auto-fetch on plan selection
  useEffect(() => {
    if (selectedPlan) refresh();
  }, [selectedPlan, refresh]);

  // Persist selected plan
  useEffect(() => {
    try {
      if (selectedPlan) {
        localStorage.setItem(LS_PLAN, JSON.stringify(selectedPlan));
      } else {
        localStorage.removeItem(LS_PLAN);
      }
    } catch {}
  }, [selectedPlan]);

  // Handle 401 errors — record failure, then logout
  useEffect(() => {
    if (error === "auth_expired") {
      recordFailure();
      logout();
    }
  }, [error, recordFailure, logout]);

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

  const handleComplete = useCallback(
    async (task) => {
      if (!task.etag) return;
      await completeTask(task.id, task.etag, token);
      setSelectedTask(null);
      clearDetails();
      refresh();
    },
    [token, clearDetails, refresh]
  );

  const handleMoveTask = useCallback(
    async (task, groupBy, targetColumnKey) => {
      if (!task.etag) return;
      let fields;
      if (groupBy === "bucket") {
        // Resolve bucket name back to bucket ID
        const bucketId = Object.entries(bucketNames).find(
          ([, name]) => name === targetColumnKey
        )?.[0];
        if (!bucketId || bucketId === task.bucketId) return;
        fields = { bucketId };
      } else if (groupBy === "status") {
        const map = { "Not Started": 0, "In Progress": 50, "Completed": 100 };
        const val = map[targetColumnKey];
        if (val === undefined || val === task.percentComplete) return;
        fields = { percentComplete: val };
      } else if (groupBy === "priority") {
        const map = { "Urgent": 1, "Important": 3, "Medium": 5, "Low": 9 };
        const val = map[targetColumnKey];
        if (val === undefined || val === task.priority) return;
        fields = { priority: val };
      }
      if (!fields) return;
      // Optimistic update
      optimisticUpdate(task.id, fields);
      try {
        await updateTask(task.id, task.etag, token, fields);
        refresh();
      } catch (e) {
        refresh(); // revert on failure
      }
    },
    [bucketNames, token, optimisticUpdate, refresh]
  );

  const handleChangePlan = useCallback(() => {
    setSelectedPlan(null);
    setSelectedTask(null);
    clearDetails();
    clearFilters();
  }, [clearDetails, clearFilters]);

  const stats = useMemo(() => computeStats(tasks), [tasks]);
  const byBucket = useMemo(
    () => computeByBucket(tasks, bucketNames),
    [tasks, bucketNames]
  );
  const monthData = useMemo(() => computeByMonth(tasks), [tasks]);

  // Plan selector screen
  if (!selectedPlan) {
    return <PlanSelector token={token} onSelect={setSelectedPlan} />;
  }

  return (
    <>
      <DashboardShell
        planTitle={selectedPlan.title}
        onChangePlan={handleChangePlan}
        onRefresh={refresh}
        onLogout={logout}
        loading={loading}
        taskCount={tasks.length}
        completedCount={stats.completed}
        activeCount={stats.inProgress + stats.notStarted}
      >
        {/* Error banner */}
        {error && error !== "auth_expired" && (
          <div
            style={{
              padding: "12px 16px",
              background: `${theme.red}15`,
              border: `1px solid ${theme.red}40`,
              borderRadius: 8,
              color: theme.red,
              fontSize: 13,
              marginBottom: 24,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>{error}</span>
            <button
              onClick={refresh}
              style={{
                background: "none",
                border: "none",
                color: theme.red,
                cursor: "pointer",
                fontSize: 12,
                textDecoration: "underline",
                fontFamily: theme.fontSans,
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading && tasks.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: 80,
              color: theme.textDim,
              fontSize: 14,
            }}
          >
            Loading plan data...
          </div>
        )}

        {/* Dashboard content */}
        {tasks.length > 0 && (
          <>
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
                  onClick={() => {
                    setViewMode(v);
                    try { localStorage.setItem("plannerdash_view", v); } catch {}
                  }}
                  style={{
                    padding: "6px 16px",
                    borderRadius: 20,
                    border: "1px solid",
                    borderColor: viewMode === v ? "rgba(59,130,246,0.5)" : "rgba(255,255,255,0.08)",
                    background: viewMode === v ? "rgba(59,130,246,0.12)" : "transparent",
                    color: viewMode === v ? theme.blueLight : theme.textMuted,
                    fontSize: 12,
                    cursor: "pointer",
                    fontFamily: theme.fontSans,
                    transition: "all 0.2s ease",
                  }}
                >
                  {l}
                </button>
              ))}
              {viewMode === "kanban" && (
                <>
                  <span style={{ fontSize: 11, color: theme.textDim, margin: "0 6px 0 12px" }}>Group by</span>
                  {[["bucket", "Bucket"], ["status", "Status"], ["priority", "Priority"]].map(([v, l]) => (
                    <button
                      key={v}
                      onClick={() => {
                        setKanbanGroup(v);
                        try { localStorage.setItem("plannerdash_kanban_group", v); } catch {}
                      }}
                      style={{
                        padding: "4px 12px",
                        borderRadius: 16,
                        border: "1px solid",
                        borderColor: kanbanGroup === v ? "rgba(52,199,89,0.5)" : "rgba(255,255,255,0.08)",
                        background: kanbanGroup === v ? "rgba(52,199,89,0.12)" : "transparent",
                        color: kanbanGroup === v ? theme.green : theme.textMuted,
                        fontSize: 11,
                        cursor: "pointer",
                        fontFamily: theme.fontSans,
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
                onMoveTask={handleMoveTask}
              />
            )}
          </>
        )}
      </DashboardShell>

      {/* Task detail panel */}
      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          planId={selectedPlan.id}
          details={details}
          detailsLoading={detailsLoading}
          detailsError={detailsError}
          bucketName={bucketNames[selectedTask.bucketId] || "Other"}
          onClose={handleCloseDetail}
          onComplete={handleComplete}
        />
      )}
    </>
  );
}
