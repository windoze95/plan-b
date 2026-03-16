# plan-b

Because Planner was never plan A.

A dashboard that makes Microsoft Planner data actually useful — built with React, Vite, and spite.

## Run it

```bash
docker run -d --restart always -p 3000:80 ghcr.io/YOUR_USERNAME/plan-b:latest
```

## Setup

1. Copy `.env.example` to `.env` and fill in your Azure AD tenant/client IDs
2. Register an Azure AD app with `Tasks.Read`, `Tasks.Read.Shared`, `Group.Read.All`, `User.Read` permissions
3. `npm install && npm run dev`
