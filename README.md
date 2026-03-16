# plan-b

Because Planner was never plan A.

A dashboard that makes Microsoft Planner data actually useful — built with React, Vite, and spite.

## Run it

```bash
docker run -d --restart always -p 3000:80 ghcr.io/windoze95/plan-b:latest
```

## Setup

1. Copy `.env.example` to `.env` and fill in your Azure AD tenant/client IDs
2. Register an Azure AD app with `Tasks.Read`, `Tasks.Read.Shared`, `Group.Read.All`, `User.Read` permissions
3. `npm install && npm run dev`

## Auth

Two ways to authenticate:

- **Quick start** — Grab a token from [Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer), paste it into the login screen. Tokens expire after ~1 hour.
- **MSAL (recommended)** — Set `VITE_TENANT_ID` and `VITE_CLIENT_ID` in your `.env` to enable "Sign in with Microsoft" for automatic token refresh.
