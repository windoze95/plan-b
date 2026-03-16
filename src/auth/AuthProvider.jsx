import { createContext, useState, useCallback, useEffect, useRef } from "react";
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig, loginRequest } from "./msalConfig";
import { theme, cardBase, monoLabel } from "../utils/styles";

export const GraphAuthContext = createContext(null);

const LS_TOKEN = "plannerdash_token";
const LS_FAILURES = "plannerdash_auth_failures";
const MAX_FAILURES = 2;

const msalEnabled = !!msalConfig.auth.clientId;
let msalInstance = null;
if (msalEnabled) {
  msalInstance = new PublicClientApplication(msalConfig);
  msalInstance.initialize();
}

function loadSavedToken() {
  try {
    const failures = parseInt(localStorage.getItem(LS_FAILURES) || "0", 10);
    if (failures >= MAX_FAILURES) {
      localStorage.removeItem(LS_TOKEN);
      localStorage.removeItem(LS_FAILURES);
      return null;
    }
    return localStorage.getItem(LS_TOKEN) || null;
  } catch {
    return null;
  }
}

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(loadSavedToken);
  const [pasteValue, setPasteValue] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(() => !!loadSavedToken());
  const failureCount = useRef(
    parseInt(localStorage.getItem(LS_FAILURES) || "0", 10)
  );

  // Validate saved token on mount
  useEffect(() => {
    const saved = loadSavedToken();
    if (!saved) {
      setValidating(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch("https://graph.microsoft.com/v1.0/me", {
          headers: { Authorization: `Bearer ${saved}` },
        });
        if (!res.ok) throw new Error("expired");
        failureCount.current = 0;
        localStorage.setItem(LS_FAILURES, "0");
        setToken(saved);
      } catch {
        failureCount.current++;
        localStorage.setItem(LS_FAILURES, String(failureCount.current));
        if (failureCount.current >= MAX_FAILURES) {
          localStorage.removeItem(LS_TOKEN);
          localStorage.removeItem(LS_FAILURES);
        }
        setToken(null);
      } finally {
        setValidating(false);
      }
    })();
  }, []);

  const saveToken = useCallback((t) => {
    setToken(t);
    failureCount.current = 0;
    try {
      localStorage.setItem(LS_TOKEN, t);
      localStorage.setItem(LS_FAILURES, "0");
    } catch {}
  }, []);

  const validateToken = useCallback(async (t) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("https://graph.microsoft.com/v1.0/me", {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (!res.ok) throw new Error(`Token validation failed (${res.status})`);
      saveToken(t);
    } catch (e) {
      setError(e.message);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, [saveToken]);

  const loginMsal = useCallback(async () => {
    if (!msalInstance) return;
    setLoading(true);
    setError(null);
    try {
      const result = await msalInstance.loginPopup(loginRequest);
      const tokenResult = await msalInstance.acquireTokenSilent({
        ...loginRequest,
        account: result.account,
      });
      saveToken(tokenResult.accessToken);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [saveToken]);

  const recordFailure = useCallback(() => {
    failureCount.current++;
    try {
      localStorage.setItem(LS_FAILURES, String(failureCount.current));
      if (failureCount.current >= MAX_FAILURES) {
        localStorage.removeItem(LS_TOKEN);
        localStorage.removeItem(LS_FAILURES);
      }
    } catch {}
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setPasteValue("");
    setError(null);
    try {
      localStorage.removeItem(LS_TOKEN);
      localStorage.removeItem(LS_FAILURES);
    } catch {}
    if (msalInstance) {
      msalInstance.logoutPopup().catch(() => {});
    }
  }, []);

  if (validating) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: theme.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: theme.textMuted,
          fontSize: 14,
          fontFamily: theme.fontSans,
        }}
      >
        Reconnecting...
      </div>
    );
  }

  if (token) {
    return (
      <GraphAuthContext.Provider value={{ token, logout, recordFailure, isAuthenticated: true }}>
        {children}
      </GraphAuthContext.Provider>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: theme.fontSans,
      }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: "fixed",
          top: "-30%",
          right: "-20%",
          width: "60vw",
          height: "60vw",
          background:
            "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          ...cardBase,
          borderRadius: 16,
          padding: "40px 36px",
          maxWidth: 440,
          width: "100%",
        }}
      >
        <div style={{ ...monoLabel, marginBottom: 8 }}>PlannerDash</div>
        <h2
          style={{
            color: theme.text,
            fontSize: 24,
            fontWeight: 700,
            margin: "0 0 8px",
          }}
        >
          Connect to Microsoft Graph
        </h2>
        <p
          style={{
            color: theme.textDim,
            fontSize: 13,
            margin: "0 0 24px",
            lineHeight: 1.5,
          }}
        >
          Paste an access token from{" "}
          <a
            href="https://developer.microsoft.com/en-us/graph/graph-explorer"
            target="_blank"
            rel="noreferrer"
            style={{ color: theme.blue }}
          >
            Graph Explorer
          </a>{" "}
          with Tasks.Read permissions.
        </p>

        <textarea
          value={pasteValue}
          onChange={(e) => setPasteValue(e.target.value)}
          placeholder="Paste your access token here..."
          spellCheck={false}
          style={{
            width: "100%",
            height: 80,
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${error ? theme.red : theme.borderLight}`,
            borderRadius: 8,
            color: theme.text,
            fontSize: 12,
            fontFamily: theme.fontMono,
            padding: 12,
            resize: "none",
            outline: "none",
            boxSizing: "border-box",
          }}
        />

        {error && (
          <div style={{ color: theme.red, fontSize: 12, marginTop: 8 }}>
            {error}
          </div>
        )}

        <button
          onClick={() => validateToken(pasteValue.trim())}
          disabled={!pasteValue.trim() || loading}
          style={{
            width: "100%",
            padding: 12,
            marginTop: 16,
            background: loading
              ? "rgba(59,130,246,0.3)"
              : "rgba(59,130,246,0.15)",
            border: "1px solid rgba(59,130,246,0.3)",
            borderRadius: 8,
            color: theme.blue,
            fontSize: 14,
            fontWeight: 500,
            cursor: loading ? "wait" : "pointer",
            fontFamily: theme.fontSans,
            transition: "all 0.2s ease",
          }}
        >
          {loading ? "Validating..." : "Connect"}
        </button>

        {msalEnabled && (
          <>
            <div
              style={{
                textAlign: "center",
                color: theme.textDark,
                fontSize: 12,
                margin: "16px 0",
              }}
            >
              or
            </div>
            <button
              onClick={loginMsal}
              disabled={loading}
              style={{
                width: "100%",
                padding: 12,
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${theme.borderLight}`,
                borderRadius: 8,
                color: theme.text,
                fontSize: 14,
                cursor: "pointer",
                fontFamily: theme.fontSans,
              }}
            >
              Sign in with Microsoft
            </button>
          </>
        )}
      </div>
    </div>
  );
}
