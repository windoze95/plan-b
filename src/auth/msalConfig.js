import { TENANT_ID } from "../utils/constants";

export const msalConfig = {
  auth: {
    clientId: window.__CONFIG__?.CLIENT_ID || import.meta.env.VITE_CLIENT_ID || "",
    authority: `https://login.microsoftonline.com/${TENANT_ID}`,
    redirectUri: typeof window !== "undefined" ? window.location.origin : "",
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ["Tasks.Read", "Tasks.Read.Shared", "Group.Read.All", "User.Read"],
};
