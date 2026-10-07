# Northstar Estates

Real-estate marketplace with a Next.js frontend and Laravel API backend.

## Project structure

```text
frontend/  Next.js, React, Bootstrap, Redux Toolkit
backend/   Laravel, PHP, MySQL API
```

## Run the frontend

```bash
cd frontend
pnpm install
pnpm run dev
```

Open `http://localhost:3000`.

## Run the backend

```bash
cd backend
php artisan serve --host=127.0.0.1 --port=8000
php artisan migrate --seed
```

The API is available at `http://127.0.0.1:8000/api/properties`.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

### Portfolio deployment (Render + Vercel)

- Deploy the repository's `render.yaml` Blueprint on Render. It configures the API's allowed frontend origin, MySQL, TLS certificate verification, and file-backed sessions/cache so Vercel API requests do not depend on TiDB session/cache tables.
- In TiDB Cloud, create an application database such as `real_estate` (do not use the system database `sys`), download its CA certificate, and add that certificate to the Render service as a secret file named `ca.pem`. The app expects it at `/etc/secrets/ca.pem`.
- Set the Render `DB_URL` secret to the TiDB MySQL URL in the form `mysql://<username>:<password>@<host>:4000/real_estate`; URL-encode any reserved characters in the username or password. Keep this URL private, then redeploy so Laravel can run its migrations against TiDB.
- For a local import, leave the source `DB_*` settings in `backend/.env` unchanged and add `TIDB_URL` (same URL format), `TIDB_SSL_CA` (local path to the downloaded certificate), and `TIDB_SSL_VERIFY_SERVER_CERT=true`. Back up the old database, start it, then run `php artisan db:copy-to-tidb` from `backend`; the command runs target migrations, refuses to import into non-empty application tables, copies user/property-related rows, and verifies row counts. It does not copy sessions, caches, queued jobs, password-reset tokens, or API tokens.
- After the local import succeeds, set Render's `DB_URL` to the same TiDB connection URL. The Blueprint already sets `DB_CONNECTION=mysql`, points TLS verification at the uploaded CA secret file, and disables demo seeding so the migrated data is not mixed with extra sample rows.
- In Vercel, keep the project root at the repository root (the root `vercel.json` builds `frontend`) and define `NEXT_PUBLIC_API_URL` as `https://real-eastate-project.onrender.com/api` before deploying.
- Keep `SEED_DEMO_DATA=false` while importing the old database so the deployment does not insert extra demo records. Render free services can sleep while idle; the first request after inactivity may take longer while the API starts.
