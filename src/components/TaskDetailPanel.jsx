import { useEffect, useState, useCallback } from "react";
import { theme, monoLabel } from "../utils/styles";
import { PRIORITY_MAP, PRIORITY_COLOR, STATUS_MAP } from "../utils/constants";
import { fmt, daysBetween, buildPlannerDeepLink, renderMarkdown } from "../utils/formatters";

export default function TaskDetailPanel({
  task,
  planId,
  details,
  detailsLoading,
  detailsError,
  bucketName,
  onClose,
  onComplete,
}) {
  // Close on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const [completing, setCompleting] = useState(false);
  const [completeError, setCompleteError] = useState(null);

  const handleComplete = useCallback(async () => {
    setCompleting(true);
    setCompleteError(null);
    try {
      await onComplete(task);
    } catch (e) {
      setCompleteError(e.message);
      setCompleting(false);
    }
  }, [onComplete, task]);

  if (!task) return null;

  const isOverdue =
    task.percentComplete < 100 &&
    task.dueDateTime &&
    new Date(task.dueDateTime) < new Date();

  const cycleTime =
    task.createdDateTime && task.completedDateTime
      ? daysBetween(task.createdDateTime, task.completedDateTime)
      : null;

  const deepLink = buildPlannerDeepLink(planId, task.id);

  const checklist = details?.checklist
    ? Object.values(details.checklist)
    : [];
  const checklistDone = checklist.filter((c) => c.isChecked).length;

  const references = details?.references
    ? Object.entries(details.references)
    : [];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          zIndex: 100,
          animation: "fadeIn 0.2s ease-out",
        }}
      />

      <style>
        {`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slideUp { from { transform: translateX(-50%) translateY(100%); } to { transform: translateX(-50%) translateY(0); } }
          @keyframes pulse { 0%,100% { opacity: 0.4; } 50% { opacity: 0.8; } }
          .detail-card::-webkit-scrollbar { width: 6px; }
          .detail-card::-webkit-scrollbar-track { background: transparent; }
          .detail-card::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
          .detail-card::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
          .md-content a { color: #3b82f6; text-decoration: none; }
          .md-content a:hover { text-decoration: underline; }
          .md-content p { margin: 0 0 8px; }
          .md-content p:last-child { margin-bottom: 0; }
          .md-content h1, .md-content h2, .md-content h3, .md-content h4 { color: #e8e6e3; margin: 12px 0 6px; font-size: 14px; font-weight: 600; }
          .md-content h1 { font-size: 17px; } .md-content h2 { font-size: 15px; }
          .md-content ul, .md-content ol { margin: 4px 0 8px; padding-left: 20px; }
          .md-content li { margin-bottom: 2px; }
          .md-content code { background: rgba(255,255,255,0.06); padding: 1px 5px; border-radius: 3px; font-family: 'DM Mono', monospace; font-size: 12px; }
          .md-content pre { background: rgba(255,255,255,0.04); padding: 10px; border-radius: 6px; overflow-x: auto; margin: 8px 0; }
          .md-content pre code { background: none; padding: 0; }
          .md-content blockquote { border-left: 3px solid rgba(255,255,255,0.1); margin: 8px 0; padding: 4px 12px; color: #8e8e93; }
          .md-content strong { color: #e8e6e3; }
          .md-content hr { border: none; border-top: 1px solid rgba(255,255,255,0.06); margin: 12px 0; }
          .md-content table { border-collapse: collapse; width: 100%; margin: 8px 0; }
          .md-content th, .md-content td { border: 1px solid rgba(255,255,255,0.08); padding: 6px 10px; font-size: 12px; text-align: left; }
          .md-content th { background: rgba(255,255,255,0.04); color: #8e8e93; }
        `}
      </style>

      {/* Bottom card */}
      <div
        className="detail-card"
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          width: "calc(100% - 48px)",
          maxWidth: 960,
          height: "85vh",
          background: "#111112",
          border: `1px solid ${theme.border}`,
          borderBottom: "none",
          borderRadius: "16px 16px 0 0",
          zIndex: 101,
          overflowY: "auto",
          animation: "slideUp 0.25s ease-out forwards",
          fontFamily: theme.fontSans,
        }}
      >
        {/* Drag handle */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "10px 0 0",
          }}
        >
          <div
            style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              background: "rgba(255,255,255,0.12)",
            }}
          />
        </div>

        {/* Header */}
        <div
          style={{
            padding: "16px 32px 14px",
            borderBottom: `1px solid ${theme.border}`,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 12,
            }}
          >
            <h3
              style={{
                color: theme.text,
                fontSize: 20,
                fontWeight: 600,
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              {task.title}
            </h3>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                color: theme.textDim,
                fontSize: 20,
                cursor: "pointer",
                padding: 4,
                lineHeight: 1,
                flexShrink: 0,
              }}
            >
              {"\u2715"}
            </button>
          </div>

          {/* Badges */}
          <div
            style={{
              display: "flex",
              gap: 8,
              marginTop: 12,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontSize: 11,
                padding: "3px 10px",
                borderRadius: 4,
                background:
                  task.percentComplete === 100
                    ? `${theme.green}22`
                    : task.percentComplete === 50
                      ? `${theme.blue}22`
                      : `${theme.orange}22`,
                color:
                  task.percentComplete === 100
                    ? theme.green
                    : task.percentComplete === 50
                      ? theme.blue
                      : theme.orange,
                fontFamily: theme.fontMono,
              }}
            >
              {STATUS_MAP[task.percentComplete] || "Unknown"}
            </span>
            <span
              style={{
                fontSize: 11,
                padding: "3px 10px",
                borderRadius: 4,
                background: `${PRIORITY_COLOR[task.priority]}22`,
                color: PRIORITY_COLOR[task.priority],
                fontFamily: theme.fontMono,
              }}
            >
              {PRIORITY_MAP[task.priority]}
            </span>
            {task.tags &&
              task.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: 11,
                    padding: "3px 10px",
                    borderRadius: 4,
                    background: "rgba(175,82,222,0.13)",
                    color: "#af52de",
                    fontFamily: theme.fontMono,
                  }}
                >
                  {tag}
                </span>
              ))}
            {isOverdue && (
              <span
                style={{
                  fontSize: 11,
                  padding: "3px 10px",
                  borderRadius: 4,
                  background: `${theme.red}22`,
                  color: theme.red,
                  fontFamily: theme.fontMono,
                }}
              >
                Overdue
              </span>
            )}
          </div>
        </div>

        {/* Body — two-column layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 3fr",
            gap: 0,
          }}
        >
          {/* Left column: metadata + open in planner */}
          <div
            style={{
              padding: "24px 32px",
              borderRight: `1px solid ${theme.border}`,
            }}
          >
            {/* Action buttons */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              <a
                href={deepLink}
                target="_blank"
                rel="noreferrer"
                style={{
                  flex: 1,
                  display: "block",
                  textAlign: "center",
                  padding: 10,
                  background: "rgba(59,130,246,0.12)",
                  border: "1px solid rgba(59,130,246,0.3)",
                  borderRadius: 8,
                  color: theme.blue,
                  fontSize: 13,
                  fontWeight: 500,
                  textDecoration: "none",
                  fontFamily: theme.fontSans,
                  transition: "all 0.2s ease",
                }}
              >
                Open in Planner
              </a>
              {task.percentComplete < 100 && (
                <button
                  onClick={handleComplete}
                  disabled={completing}
                  style={{
                    flex: 1,
                    padding: 10,
                    background: completing
                      ? "rgba(52,199,89,0.25)"
                      : "rgba(52,199,89,0.12)",
                    border: "1px solid rgba(52,199,89,0.3)",
                    borderRadius: 8,
                    color: theme.green,
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: completing ? "wait" : "pointer",
                    fontFamily: theme.fontSans,
                    transition: "all 0.2s ease",
                  }}
                >
                  {completing ? "Completing..." : "Mark Complete"}
                </button>
              )}
            </div>
            {completeError && (
              <div
                style={{
                  color: theme.red,
                  fontSize: 12,
                  marginBottom: 16,
                }}
              >
                {completeError}
              </div>
            )}

            {/* Metadata grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
              }}
            >
              {[
                ["Bucket", bucketName],
                ["Assignees", `${task.assigneeCount} people`],
                ["Created", fmt(task.createdDateTime)],
                ["Due", task.dueDateTime ? fmt(task.dueDateTime) : "\u2014"],
                [
                  "Completed",
                  task.completedDateTime
                    ? fmt(task.completedDateTime)
                    : "\u2014",
                ],
                [
                  "Cycle Time",
                  cycleTime !== null ? `${cycleTime} days` : "\u2014",
                ],
              ].map(([label, value]) => (
                <div key={label}>
                  <div style={{ ...monoLabel, fontSize: 10, marginBottom: 4 }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 13, color: theme.text }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column: details (lazy loaded) */}
          <div style={{ padding: "24px 32px", minWidth: 0 }}>
            {detailsLoading && (
              <div>
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      height: 14,
                      background: "rgba(255,255,255,0.04)",
                      borderRadius: 4,
                      marginBottom: 10,
                      width: `${80 - i * 15}%`,
                      animation: "pulse 1.5s infinite",
                    }}
                  />
                ))}
              </div>
            )}

            {detailsError && (
              <div style={{ color: theme.red, fontSize: 12 }}>
                Failed to load details: {detailsError}
              </div>
            )}

            {details && !detailsLoading && (
              <>
                {/* Description */}
                {details.description && (
                  <div style={{ marginBottom: 20 }}>
                    <div
                      style={{ ...monoLabel, fontSize: 10, marginBottom: 8 }}
                    >
                      Description
                    </div>
                    <div
                      className="md-content"
                      dangerouslySetInnerHTML={{
                        __html: renderMarkdown(details.description),
                      }}
                      style={{
                        fontSize: 13,
                        color: theme.text,
                        lineHeight: 1.6,
                        wordBreak: "break-word",
                        overflowWrap: "break-word",
                        background: "rgba(255,255,255,0.02)",
                        padding: 12,
                        borderRadius: 8,
                        border: `1px solid ${theme.border}`,
                      }}
                    />
                  </div>
                )}

                {/* Checklist */}
                {checklist.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <div
                      style={{ ...monoLabel, fontSize: 10, marginBottom: 8 }}
                    >
                      Checklist ({checklistDone}/{checklist.length})
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      {checklist.map((item, i) => (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={item.isChecked}
                            readOnly
                            style={{ accentColor: theme.green }}
                          />
                          <span
                            style={{
                              fontSize: 13,
                              color: item.isChecked
                                ? theme.textDim
                                : theme.text,
                              textDecoration: item.isChecked
                                ? "line-through"
                                : "none",
                              wordBreak: "break-word",
                              overflowWrap: "break-word",
                            }}
                          >
                            {item.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* References */}
                {references.length > 0 && (
                  <div>
                    <div
                      style={{ ...monoLabel, fontSize: 10, marginBottom: 8 }}
                    >
                      References
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      {references.map(([url, ref], i) => (
                        <a
                          key={i}
                          href={decodeURIComponent(url)}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            fontSize: 12,
                            color: theme.blue,
                            textDecoration: "none",
                            wordBreak: "break-all",
                            overflowWrap: "break-word",
                          }}
                        >
                          {ref.alias ||
                            decodeURIComponent(url).replace(
                              /^https?:\/\//,
                              ""
                            )}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty details state */}
                {!details.description &&
                  checklist.length === 0 &&
                  references.length === 0 && (
                    <div
                      style={{
                        color: theme.textDim,
                        fontSize: 13,
                        fontStyle: "italic",
                      }}
                    >
                      No additional details.
                    </div>
                  )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
