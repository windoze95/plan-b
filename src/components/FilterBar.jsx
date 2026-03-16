import { useState } from "react";
import { theme, monoLabel } from "../utils/styles";
import { PRIORITY_MAP, PRIORITY_COLOR } from "../utils/constants";

const pillStyle = (active) => ({
  padding: "6px 16px",
  borderRadius: 20,
  border: "1px solid",
  borderColor: active ? "rgba(59,130,246,0.5)" : theme.borderLight,
  background: active ? "rgba(59,130,246,0.12)" : "transparent",
  color: active ? theme.blueLight : theme.textMuted,
  fontSize: 12,
  cursor: "pointer",
  fontFamily: theme.fontSans,
  transition: "all 0.2s ease",
  whiteSpace: "nowrap",
});

const statusOptions = [
  ["active", "Active", "#3b82f6"],
  ["notStarted", "Not Started", "#ff9500"],
  ["inProgress", "In Progress", "#3b82f6"],
  ["completed", "Done", "#34c759"],
  ["overdue", "Overdue", "#ff3b30"],
];

const priorityOptions = [
  ["1", "Urgent", "#ff3b30"],
  ["3", "Important", "#ff9500"],
  ["5", "Medium", "#34c759"],
  ["9", "Low", "#636366"],
];

function cycleState(currentMap, key) {
  const next = { ...currentMap };
  const state = next[key];
  if (!state) next[key] = "include";
  else if (state === "include") next[key] = "exclude";
  else delete next[key];
  return next;
}

function triPillStyle(state, color) {
  const base = pillStyle(false);
  if (state === "include") {
    return {
      ...base,
      borderColor: `${color}80`,
      background: `${color}1a`,
      color,
    };
  }
  if (state === "exclude") {
    return {
      ...base,
      borderColor: "rgba(255,59,48,0.5)",
      background: "rgba(255,59,48,0.10)",
      color: "#ff3b30",
      textDecoration: "line-through",
    };
  }
  return base;
}

export default function FilterBar({
  filters,
  setFilter,
  clearFilters,
  activeFilterCount,
  bucketNames,
  tagNames,
  resultCount,
  totalCount,
}) {
  const uniqueBuckets = [...new Set(Object.values(bucketNames))].sort();
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem("plannerdash_filters_collapsed") === "1"; } catch { return false; }
  });

  // Collect active pills for collapsed view
  const activePills = [];
  statusOptions.forEach(([v, l, c]) => {
    const state = filters.statuses[v];
    if (state) activePills.push({ key: `s-${v}`, label: l, state, color: c, onClick: () => setFilter("statuses", cycleState(filters.statuses, v)) });
  });
  priorityOptions.forEach(([v, l, c]) => {
    const state = filters.priorities[v];
    if (state) activePills.push({ key: `p-${v}`, label: l, state, color: c, onClick: () => setFilter("priorities", cycleState(filters.priorities, v)) });
  });
  Object.values(tagNames).forEach((name) => {
    const state = filters.tags[name];
    if (state) activePills.push({ key: `t-${name}`, label: name, state, color: "#af52de", onClick: () => setFilter("tags", cycleState(filters.tags, name)) });
  });
  if (filters.bucket !== "all") activePills.push({ key: "bucket", label: filters.bucket, state: "include", color: "#3b82f6", onClick: () => setFilter("bucket", "all") });
  if (filters.overdueOnly) activePills.push({ key: "overdue", label: "Overdue only", state: "include", color: "#ff3b30", onClick: () => setFilter("overdueOnly", false) });
  if (filters.search) activePills.push({ key: "search", label: `"${filters.search}"`, state: "include", color: "#3b82f6", onClick: () => setFilter("search", "") });
  if (filters.dateFrom) activePills.push({ key: "dateFrom", label: `From ${filters.dateFrom}`, state: "include", color: "#3b82f6", onClick: () => setFilter("dateFrom", "") });
  if (filters.dateTo) activePills.push({ key: "dateTo", label: `To ${filters.dateTo}`, state: "include", color: "#3b82f6", onClick: () => setFilter("dateTo", "") });

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    try { localStorage.setItem("plannerdash_filters_collapsed", next ? "1" : "0"); } catch {}
  };

  if (collapsed) {
    return (
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          <button
            onClick={toggleCollapsed}
            style={{
              padding: "4px 12px",
              borderRadius: 16,
              border: `1px solid ${theme.borderLight}`,
              background: "transparent",
              color: theme.textMuted,
              fontSize: 11,
              cursor: "pointer",
              fontFamily: theme.fontSans,
            }}
          >
            Filters
          </button>
          {activePills.map((p) => (
            <button
              key={p.key}
              onClick={p.onClick}
              style={triPillStyle(p.state, p.color)}
            >
              {p.state === "include" ? "+ " : p.state === "exclude" ? "\u2212 " : ""}{p.label}
            </button>
          ))}
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              style={{
                padding: "4px 12px",
                borderRadius: 16,
                border: `1px solid ${theme.borderLight}`,
                background: "transparent",
                color: theme.textMuted,
                fontSize: 11,
                cursor: "pointer",
                fontFamily: theme.fontSans,
              }}
            >
              Clear {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""}
            </button>
          )}
          <div style={{ marginLeft: "auto", fontSize: 12, color: theme.textDark, fontFamily: theme.fontMono }}>
            Showing {resultCount} of {totalCount} tasks
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 20 }}>
      {/* Collapse button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <button
          onClick={toggleCollapsed}
          style={{
            padding: "4px 12px",
            borderRadius: 16,
            border: `1px solid ${theme.borderLight}`,
            background: "transparent",
            color: theme.textMuted,
            fontSize: 11,
            cursor: "pointer",
            fontFamily: theme.fontSans,
          }}
        >
          Minimize
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        value={filters.search}
        onChange={(e) => setFilter("search", e.target.value)}
        placeholder="Search tasks..."
        style={{
          width: "100%",
          padding: "10px 14px",
          background: "rgba(255,255,255,0.04)",
          border: `1px solid ${theme.borderLight}`,
          borderRadius: 8,
          color: theme.text,
          fontSize: 13,
          fontFamily: theme.fontSans,
          outline: "none",
          marginBottom: 12,
          boxSizing: "border-box",
        }}
      />

      {/* Status pills — 3-state: off → include → exclude → off */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 10,
          flexWrap: "wrap",
        }}
      >
        <span style={{ ...monoLabel, alignSelf: "center", marginRight: 4 }}>
          Status
        </span>
        {statusOptions.map(([v, l, c]) => {
          const state = filters.statuses[v];
          return (
            <button
              key={v}
              onClick={() => setFilter("statuses", cycleState(filters.statuses, v))}
              style={triPillStyle(state, c)}
            >
              {state === "include" ? "+ " : state === "exclude" ? "\u2212 " : ""}{l}
            </button>
          );
        })}
      </div>

      {/* Priority pills — 3-state: off → include → exclude → off */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 10,
          flexWrap: "wrap",
        }}
      >
        <span style={{ ...monoLabel, alignSelf: "center", marginRight: 4 }}>
          Priority
        </span>
        {priorityOptions.map(([v, l, c]) => {
          const state = filters.priorities[v];
          return (
            <button
              key={v}
              onClick={() => setFilter("priorities", cycleState(filters.priorities, v))}
              style={triPillStyle(state, c)}
            >
              {state === "include" ? "+ " : state === "exclude" ? "\u2212 " : ""}{l}
            </button>
          );
        })}
      </div>

      {/* Tag pills — 3-state: off → include → exclude → off */}
      {Object.keys(tagNames).length > 0 && (
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 10,
            flexWrap: "wrap",
          }}
        >
          <span style={{ ...monoLabel, alignSelf: "center", marginRight: 4 }}>
            Tags
          </span>
          {Object.values(tagNames).map((name) => {
            const state = filters.tags[name];
            return (
              <button
                key={name}
                onClick={() => setFilter("tags", cycleState(filters.tags, name))}
                style={triPillStyle(state, "#af52de")}
              >
                {state === "include" ? "+ " : state === "exclude" ? "\u2212 " : ""}{name}
              </button>
            );
          })}
        </div>
      )}

      {/* Bucket + Date + Overdue row */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 12,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <select
          value={filters.bucket}
          onChange={(e) => setFilter("bucket", e.target.value)}
          style={{
            padding: "6px 12px",
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${theme.borderLight}`,
            borderRadius: 8,
            color: theme.text,
            fontSize: 12,
            fontFamily: theme.fontSans,
            outline: "none",
            cursor: "pointer",
          }}
        >
          <option value="all">All Buckets</option>
          {uniqueBuckets.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 11, color: theme.textDim }}>Due from</span>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilter("dateFrom", e.target.value)}
            style={{
              padding: "5px 8px",
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${theme.borderLight}`,
              borderRadius: 6,
              color: theme.text,
              fontSize: 12,
              fontFamily: theme.fontMono,
              outline: "none",
              colorScheme: "dark",
            }}
          />
          <span style={{ fontSize: 11, color: theme.textDim }}>to</span>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilter("dateTo", e.target.value)}
            style={{
              padding: "5px 8px",
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${theme.borderLight}`,
              borderRadius: 6,
              color: theme.text,
              fontSize: 12,
              fontFamily: theme.fontMono,
              outline: "none",
              colorScheme: "dark",
            }}
          />
        </div>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            cursor: "pointer",
            fontSize: 12,
            color: filters.overdueOnly ? theme.red : theme.textMuted,
          }}
        >
          <input
            type="checkbox"
            checked={filters.overdueOnly}
            onChange={(e) => setFilter("overdueOnly", e.target.checked)}
            style={{ accentColor: theme.red }}
          />
          Overdue only
        </label>
      </div>

      {/* Active filter chips + result count */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              style={{
                padding: "4px 12px",
                borderRadius: 16,
                border: `1px solid ${theme.borderLight}`,
                background: "transparent",
                color: theme.textMuted,
                fontSize: 11,
                cursor: "pointer",
                fontFamily: theme.fontSans,
              }}
            >
              Clear {activeFilterCount} filter
              {activeFilterCount > 1 ? "s" : ""}
            </button>
          )}
        </div>
        <div
          style={{
            fontSize: 12,
            color: theme.textDark,
            fontFamily: theme.fontMono,
          }}
        >
          Showing {resultCount} of {totalCount} tasks
        </div>
      </div>
    </div>
  );
}
