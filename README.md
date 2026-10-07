# Orison School ERP

One codebase, three applications:

- `apps/web` — React screens, navigation, and forms. School workspace and platform workspace live in this app.
- `apps/api` — NestJS. Authentication, tenant, authorization, and domain modules.
- `apps/worker` — background jobs (email, reports, payroll, documents). It stays idle until `REDIS_URL` is set.

## Run

```bash
npm run dev
```

- Web: http://localhost:3002
- API: http://localhost:8002

Choose a school role for the campus workspace, or Platform Administrator for schools, plans, subscriptions, billing, and platform users.

School records are kept in memory for this API process and reset when it restarts. PostgreSQL and Redis are the next data and queue connections; they are not required to sign in locally.

## Deploy the web app on Vercel

The hosted app is `apps/web`. In the Vercel import, set the root directory to `apps/web` (the Vite app), not `apps` or `api`. That folder installs with npm and builds the admin panel on its own. Every screen route is sent to `index.html`.

Use the `development` branch for the deployment. The admin panel still loads without the API and shows the built-in demo school.

Optional environment variable, set before the build:

- `VITE_API_URL` — public API origin, with no `/api` suffix, for example `https://api.example.com`

If `VITE_API_URL` is empty, the deployed app uses its built-in demo data.
