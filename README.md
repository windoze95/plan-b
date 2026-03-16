# plan-b

Because Planner was never plan A.

A dashboard that makes Microsoft Planner data actually useful — built with React, Vite, and spite.

## Run it

```bash
docker run -d --restart always -p 3000:80 ghcr.io/windoze95/plan-b:latest
```

Open `http://localhost:3000`, grab a token from [Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer), paste it in, done. Tokens expire after ~1 hour — just paste a new one.

## MSAL setup (optional, for persistent sign-in)

To get a "Sign in with Microsoft" button instead of pasting tokens:

1. Register an app in Azure AD with `Tasks.Read`, `Tasks.Read.Shared`, `Group.Read.All`, `User.Read` permissions
2. Pass your credentials as env vars:

```bash
docker run -d --restart always -p 3000:80 \
  -e VITE_TENANT_ID=your-tenant-id \
  -e VITE_CLIENT_ID=your-client-id \
  ghcr.io/windoze95/plan-b:latest
```

## Development

```bash
cp .env.example .env  # fill in Azure AD IDs if using MSAL
npm install && npm run dev
```
