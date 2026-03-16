# plan-b

Because Planner was never plan A.

A dashboard that makes Microsoft Planner data actually useful — built with React, Vite, and spite.

## Run it

```bash
docker run -d --restart always -p 3000:80 ghcr.io/windoze95/plan-b:latest
```

## Quick start (no config needed)

1. `npm install && npm run dev`
2. Grab a token from [Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer) and paste it into the login screen
3. That's it — tokens expire after ~1 hour, just paste a new one

## MSAL setup (optional, for persistent sign-in)

If you want a "Sign in with Microsoft" button instead of pasting tokens:

1. Register an app in Azure AD with `Tasks.Read`, `Tasks.Read.Shared`, `Group.Read.All`, `User.Read` permissions
2. Copy `.env.example` to `.env` and fill in `VITE_TENANT_ID` and `VITE_CLIENT_ID`
3. `npm install && npm run dev`
