import { useState, useMemo, useCallback, useEffect } from "react";

const LS_FILTERS = "plannerdash_filters";
const LS_SORT = "plannerdash_sort";

const defaultFilters = {
  search: "",
  statuses: {},   // { "notStarted": "include" | "exclude", ... }
  priorities: {}, // { "1": "include" | "exclude", ... }
  bucket: "all",
  tags: {},       // { tagName: "include" | "exclude" }
  dateFrom: "",
  dateTo: "",
  overdueOnly: false,
};

function loadFilters() {
  try {
    const raw = localStorage.getItem(LS_FILTERS);
    if (!raw) return defaultFilters;
    const saved = JSON.parse(raw);
    return { ...defaultFilters, ...saved };
  } catch {
    return defaultFilters;
  }
}

function loadSort() {
  try {
    const raw = localStorage.getItem(LS_SORT);
    if (!raw) return { column: "title", direction: "asc" };
    return JSON.parse(raw);
  } catch {
    return { column: "title", direction: "asc" };
  }
}

export function useFilterSort(tasks, bucketNames) {
  const [filters, setFilters] = useState(loadFilters);
  const savedSort = loadSort();
  const [sortColumn, setSortColumn] = useState(savedSort.column);
  const [sortDirection, setSortDirection] = useState(savedSort.direction);

  // Persist filters
  useEffect(() => {
    try {
      localStorage.setItem(LS_FILTERS, JSON.stringify(filters));
    } catch {}
  }, [filters]);

  // Persist sort
  useEffect(() => {
    try {
      localStorage.setItem(
        LS_SORT,
        JSON.stringify({ column: sortColumn, direction: sortDirection })
      );
    } catch {}
  }, [sortColumn, sortDirection]);

  const setFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const toggleSort = useCallback((column) => {
    setSortColumn((prev) => {
      if (prev === column) {
        setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
        return column;
      }
      setSortDirection("asc");
      return column;
    });
  }, []);

  const filtered = useMemo(() => {
    let result = [...tasks];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter((t) => t.title.toLowerCase().includes(q));
    }

    // Status filter — 3-state multi-select
    const statusResolve = (key, t) => {
      if (key === "notStarted") return t.percentComplete === 0;
      if (key === "inProgress") return t.percentComplete === 50;
      if (key === "completed") return t.percentComplete === 100;
      if (key === "active") return t.percentComplete < 100;
      if (key === "overdue")
        return (
          t.percentComplete < 100 &&
          t.dueDateTime &&
          new Date(t.dueDateTime) < new Date()
        );
      return false;
    };
    const includedStatuses = Object.entries(filters.statuses)
      .filter(([, v]) => v === "include")
      .map(([k]) => k);
    const excludedStatuses = Object.entries(filters.statuses)
      .filter(([, v]) => v === "exclude")
      .map(([k]) => k);
    if (includedStatuses.length > 0) {
      result = result.filter((t) =>
        includedStatuses.some((s) => statusResolve(s, t))
      );
    }
    if (excludedStatuses.length > 0) {
      result = result.filter(
        (t) => !excludedStatuses.some((s) => statusResolve(s, t))
      );
    }

    // Priority filter — 3-state multi-select
    const includedPriorities = Object.entries(filters.priorities)
      .filter(([, v]) => v === "include")
      .map(([k]) => Number(k));
    const excludedPriorities = Object.entries(filters.priorities)
      .filter(([, v]) => v === "exclude")
      .map(([k]) => Number(k));
    if (includedPriorities.length > 0) {
      result = result.filter((t) => includedPriorities.includes(t.priority));
    }
    if (excludedPriorities.length > 0) {
      result = result.filter((t) => !excludedPriorities.includes(t.priority));
    }

    if (filters.bucket !== "all") {
      result = result.filter(
        (t) => (bucketNames[t.bucketId] || "Other") === filters.bucket
      );
    }

    const includedTags = Object.entries(filters.tags)
      .filter(([, v]) => v === "include")
      .map(([k]) => k);
    const excludedTags = Object.entries(filters.tags)
      .filter(([, v]) => v === "exclude")
      .map(([k]) => k);
    if (includedTags.length > 0) {
      result = result.filter(
        (t) => t.tags && includedTags.some((tag) => t.tags.includes(tag))
      );
    }
    if (excludedTags.length > 0) {
      result = result.filter(
        (t) => !t.tags || !excludedTags.some((tag) => t.tags.includes(tag))
      );
    }

    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom);
      result = result.filter(
        (t) => t.dueDateTime && new Date(t.dueDateTime) >= from
      );
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo);
      result = result.filter(
        (t) => t.dueDateTime && new Date(t.dueDateTime) <= to
      );
    }

    if (filters.overdueOnly) {
      result = result.filter(
        (t) =>
          t.percentComplete < 100 &&
          t.dueDateTime &&
          new Date(t.dueDateTime) < new Date()
      );
    }

    result.sort((a, b) => {
      let valA, valB;
      switch (sortColumn) {
        case "title":
          valA = a.title.toLowerCase();
          valB = b.title.toLowerCase();
          break;
        case "bucket":
          valA = (bucketNames[a.bucketId] || "Other").toLowerCase();
          valB = (bucketNames[b.bucketId] || "Other").toLowerCase();
          break;
        case "priority":
          valA = a.priority;
          valB = b.priority;
          break;
        case "dueDate":
          valA = a.dueDateTime || "9999";
          valB = b.dueDateTime || "9999";
          break;
        case "createdDate":
          valA = a.createdDateTime || "";
          valB = b.createdDateTime || "";
          break;
        case "assignees":
          valA = a.assigneeCount;
          valB = b.assigneeCount;
          break;
        default:
          valA = a.title;
          valB = b.title;
      }
      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [tasks, bucketNames, filters, sortColumn, sortDirection]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    count += Object.keys(filters.statuses).length;
    count += Object.keys(filters.priorities).length;
    if (filters.bucket !== "all") count++;
    count += Object.keys(filters.tags).length;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    if (filters.overdueOnly) count++;
    return count;
  }, [filters]);

  return {
    filters,
    setFilter,
    clearFilters,
    sortColumn,
    sortDirection,
    toggleSort,
    filtered,
    activeFilterCount,
  };
}
