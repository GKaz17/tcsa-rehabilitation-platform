# TCSA React client

The public website and staff interface use React, React Router and Vite.
Oxlint provides lint checks. Staff requests go through the PHP API and use
server-side sessions; care records are stored in MySQL.

See the [project README](../README.md) for installation, local PHP/MySQL setup,
features and links to both deployments.

    npm ci
    npm run dev

The development server runs on port 5173 and proxies /api to PHP on port 8080.
Run npm run lint, npm test, npm run build and npm run test:seo to check
the client. npm run preview serves the compiled frontend without an API proxy.