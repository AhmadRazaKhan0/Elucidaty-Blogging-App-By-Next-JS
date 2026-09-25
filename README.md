# Elucidaty

A blogging platform: public site (Home, Blog, Post) plus an admin dashboard with full CRUD.

```
Frontend (Next.js, Vercel)  →  Backend API (Express, Node host)  →  MongoDB Atlas
```

## Features
Home, blog list (search, category filter, load more), single post (related posts, previous/next, reading progress, SEO metadata), admin dashboard (stats, table, create/edit, delete confirmation). Loading/empty/error states with retry. Restrained motion (Framer Motion + Lenis, transform/opacity only). Barba.js is intentionally not used: it fights the Next.js App Router, so `app/template.tsx` does page transitions.

## Tech stack
Frontend: Next.js 14.2, React 18, TypeScript, SCSS, Framer Motion 12, Lenis, ESLint (`next/core-web-vitals`). Backend: Node, Express 4, TypeScript, Mongoose 8, deployed as a Vercel serverless function. Database: MongoDB.

## Structure
```
Elucidaty/
├── Frontend/   app/ components/ services/api.ts (only API caller) types/ lib/
├── Backend/    src/{config,routes,controllers,services,models,middleware,utils} app.ts server.ts
└── README.md
```

## Local setup
```bash
cd Backend  && npm install
cd ../Frontend && npm install
```
**Backend env:** `Backend/.env` already exists with placeholders. Open it and replace the values (see *MongoDB Atlas*). If it is missing, copy `.env.example` to `.env` (exact name; on Windows make sure it is not `.env.txt`). The backend loads `Backend/.env` regardless of the folder you start it from.
**Frontend env:** `Frontend/.env.local` is pre-filled for local use (`NEXT_PUBLIC_API_URL=http://localhost:5000`). Restart `npm run dev` after changing it.

```bash
# Terminal 1
cd Backend && npm run dev     # expect: ✓ MongoDB connected successfully / ✓ Backend server running on http://localhost:5000
# Terminal 2
cd Frontend && npm run dev    # http://localhost:3000
```
Check `http://localhost:5000/api/health` → `{"success":true,"service":"elucidaty-api",...}`. Open `/admin` and create a post with status **Published**.

### Environment variables
| File | Variable | Purpose |
|---|---|---|
| Backend | `MONGODB_URI` | Atlas connection string (secret) |
| Backend | `PORT` | API port (hosts like Render set it for you) |
| Backend | `NODE_ENV` | `development` / `production` |
| Backend | `FRONTEND_URL` | Allowed CORS origin(s), comma-separated, no trailing slash (`CLIENT_URL` still accepted) |
| Backend | `MONGODB_DB_NAME`, `MONGODB_USERNAME`, `MONGODB_PASSWORD` | Optional |
| Frontend | `NEXT_PUBLIC_API_URL` | Backend base URL. **No localhost fallback in production** |
| Frontend | `NEXT_PUBLIC_SITE_URL` | Public site URL (canonical / Open Graph) |

## MongoDB Atlas
1. Create an Atlas project and a cluster (free tier is fine).
2. Database Access → add a user with a strong password (avoid special characters, or URL-encode them: `@`→`%40`, `:`→`%3A`, `/`→`%2F`, `#`→`%23`).
3. Network Access → add your IP for local work. For a host without a fixed IP (e.g. Render free tier) Atlas requires `0.0.0.0/0`; if you do this, use a long random password and a user limited to this one database.
4. Connect → Drivers → copy the string and put it in `Backend/.env` as `MONGODB_URI`, filling in the user, password and a database name (e.g. `elucidaty`).
5. In production, put the same value in your backend host's environment variables — never in Git.

## API
Envelope: `{ "success": true, "data": …, "message": "…" }` or `{ "success": false, "message": "…" }`.

| Method | Endpoint | Notes |
|---|---|---|
| GET | `/api/health` | 200 when the DB is connected, 503 otherwise |
| GET | `/api/posts` | `search`, `category` (`all` = every category), `status` (`published` default, `draft`, `all`), `page`, `limit` (≤50) → `{posts,total,page,pages}` |
| GET | `/api/posts/:id` | ObjectId or slug; `publishedOnly=true` hides drafts |
| GET | `/api/posts/:id/related` | `{related,prev,next}` |
| POST | `/api/posts` | required: `title, excerpt, content, category, author`; optional: `slug, featuredImage, tags, status` → 201 |
| PUT / PATCH | `/api/posts/:id` | partial update; 400 / 404 / 409 (duplicate slug) |
| DELETE | `/api/posts/:id` | 404 if missing |

## Git and GitHub
`.env` files are already git-ignored (root, Backend and Frontend). From the project root (Windows example):
```bash
cd C:\Users\user\Downloads\Elucidaty
git init
git status            # confirm NO .env file is listed
git add .
git commit -m "Initial commit - Elucidaty blogging platform"
git branch -M main
```
Create an empty repository on GitHub (e.g. `https://github.com/YOUR_USERNAME/Elucidaty`, no README/license), then:
```bash
git remote add origin https://github.com/YOUR_USERNAME/Elucidaty.git
git remote -v
git push -u origin main
```
**If a secret was ever committed:** change/rotate it first (Atlas → Database Access → edit user → new password), then remove it from tracking with `git rm --cached Backend/.env` and commit. The old value stays in history, so rotating is what actually protects you.

## Deployment (all three pieces on Vercel + Atlas)
The Backend is a plain Express app. To run it on Vercel it is wrapped as a serverless function at `Backend/api/index.ts`, which every request is rewritten to (see `Backend/vercel.json`) and which hands the request straight to the same Express app used by `npm run dev`. I have not deployed this for you — the steps below are exact but untested against your live Vercel/Atlas accounts.

Deploy as **two separate Vercel projects from the same GitHub repo** — one for `Backend`, one for `Frontend` — because each needs its own Root Directory and environment variables.

### 1. Backend → Vercel
1. Push the repo to GitHub, then Vercel → **Add New → Project** → import it.
2. **Root Directory: `Backend`**. Framework Preset: **Other** (it's not Next.js). Leave Build/Output settings on their defaults — there is no build step; Vercel compiles `api/index.ts` itself.
3. Settings → Environment Variables (Production, and Preview if you want):
   - `MONGODB_URI` = your Atlas connection string
   - `NODE_ENV` = `production`
   - `FRONTEND_URL` = your frontend's Vercel URL (update this after step 2 below; leave it as `http://localhost:3000` for now)
4. Deploy. Open `https://YOUR-BACKEND.vercel.app/api/health` — expect `"db":"connected"`. A 503 there means the database rejected the connection (see Troubleshooting).

**Atlas Network Access:** Vercel's serverless functions don't have a fixed IP, so under Atlas → Network Access, add `0.0.0.0/0` (Allow Access from Anywhere). Because that opens the database to the internet, use a long random password and a database user scoped to only this database.

**Serverless trade-offs, honestly:** cold starts add latency to the first request after idle time; the free tier limits a function to a ~10 second execution and MongoDB's own connection pooling behaves a little differently across invocations than on a long-running server. Functionally the API is unaffected — everything above passed against a local MongoDB-compatible test server — but if you later want a traditional always-on process (e.g. for very low latency or background jobs), the exact same `Backend/src` also runs unmodified on any Node host via `npm run build && npm start`.

### 2. Frontend → Vercel
1. Add New → Project → same repo, **Root Directory: `Frontend`**. Framework Preset: **Next.js** (auto-detected).
2. Environment Variables: `NEXT_PUBLIC_API_URL` = your backend's Vercel URL from step 1, no trailing slash; `NEXT_PUBLIC_SITE_URL` = this project's own Vercel URL.
3. Deploy. If you change a `NEXT_PUBLIC_` variable later, **redeploy** — they're baked in at build time.

### 3. Connect them
Back on the **Backend** Vercel project → Settings → Environment Variables → set `FRONTEND_URL` to the frontend's real domain (exact match, no trailing slash) → redeploy (Vercel does this automatically on a variable change, or trigger it from Deployments).

### 4. Test the live site
Home → Blog → single post → `/admin` create/edit/delete → pagination → category filter → mobile view. Check both projects' **Vercel → Deployments → Functions/Logs** tabs and the browser console for errors.

## Troubleshooting
- **`No .env file found` / `MONGODB_URI is empty` / `still contains placeholders`** – edit `Backend/.env` (real file, not `.env.example`) and restart.
- **`Authentication failed`** – wrong user/password, or unencoded special characters.
- **`Could not reach the server in time`** – Atlas Network Access doesn't include your IP; or the cluster is paused.
- **`Port 5000 is already in use`** – another program owns the port. Windows: `netstat -ano | findstr :5000`, then `taskkill /PID <pid> /F`, or change `PORT` and `NEXT_PUBLIC_API_URL`. A stray program answering on 5000 makes the site show *"Unable to load posts"*; `GET /api/health` must contain `"service":"elucidaty-api"`.
- **Frontend: "Unable to load posts"** – backend not running / wrong `NEXT_PUBLIC_API_URL` (restart frontend after editing).
- **CORS error in browser** – `FRONTEND_URL` must match the frontend origin exactly (scheme, host, port; no trailing slash).
- **`Failed to fetch Google Fonts` during build** – the build machine needs internet access.
- **`bis_skin_checked` hydration warning** – injected into the page by a browser extension (commonly antivirus/"safe browsing" add-ons), not by this app. Confirm by opening the site in a private window with extensions disabled.
- **"You have Reduced Motion enabled…" in the console** – Framer Motion's dev-only notice that your OS has reduced motion on. The app respects it (movement is minimised, Lenis is off) and the notice does not appear in production builds. To see the full animations, turn on *Windows Settings → Accessibility → Visual effects → Animation effects* (macOS: uncheck *Reduce motion*).
- **Backend `/api/health` returns 503 on Vercel** – almost always Atlas Network Access missing `0.0.0.0/0`, or `MONGODB_URI` not set for that environment (Production vs Preview are separate in Vercel).
- **404 on every backend route except `/api`** – `Backend/vercel.json`'s rewrite is missing or wrong; it must rewrite `/(.*)` to `/api` so Express (not Vercel) resolves the real path.
- **Slow first request after idle** – normal serverless cold start; subsequent requests reuse the warm function and are fast.
- **Build errors** – delete `node_modules` and `.next`, reinstall; Node 18.18+ (20/22 recommended).

## Testing checklist
Backend starts and prints both ✓ lines · `/api/health` · `/api/posts` (+ `?status=all&limit=50`, `?category=all&page=1&limit=9`) · create → appears on Blog · edit → updates · delete → removed · single post · `npm run build` (Frontend and Backend) · `npm run lint` (Frontend).

## Known gaps
No authentication: `/admin` and the write endpoints are open. Add auth before public deployment.
