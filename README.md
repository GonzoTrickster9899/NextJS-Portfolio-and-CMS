# 🚀 Portfolio + Blog + Admin Dashboard

A high-performance personal portfolio and blog system built with **Next.js 16**, **Neon** (Postgres, Auth and Object Storage), **Prisma**, and **Tailwind CSS**. Features a glassmorphism public site and a full-featured admin dashboard.

---

## ✨ Features

### Public Site
- **Hero Section** — Framer Motion animations, floating tech badges, ambient gradients
- **Portfolio Grid** — Category filtering with animated transitions
- **Blog System** — SSG + ISR, syntax highlighting, reading time, view counter
- **Contact Form** — Zod validation, saves to DB, sends email via Resend
- **Dark / Light Mode** — System-aware with smooth toggle
- **SEO** — OpenGraph, Twitter cards, dynamic metadata per page
- **Glassmorphism Design** — Soft/modern aesthetic with warm accents

### Admin Dashboard (`/admin`)
- **Protected Routes** — Neon Auth, single-email access control
- **Dashboard** — Stats overview, recent messages, quick actions
- **Project CRUD** — Image upload to Neon Object Storage, category, featured flag
- **Blog Editor** — Markdown editor with live preview, publish/draft toggle
- **Inbox** — Read/delete contact messages, reply via email link
- **Experience Manager** — Timeline entries with tech stack

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Neon (serverless Postgres) |
| ORM | Prisma |
| Auth | Neon Auth (managed Better Auth) |
| Storage | Neon Object Storage (S3-compatible) |
| Email | Resend |
| Animations | Framer Motion |
| Validation | Zod + React Hook Form |
| Deployment | Vercel |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (public)/          # Public routes (home, portfolio, blog, contact)
│   ├── (auth)/login/      # Admin login
│   ├── (admin)/admin/     # Dashboard, projects, blog, inbox, experience, skills, resume
│   └── api/               # API routes (auth proxy, contact, upload, blog views)
├── components/
│   ├── ui/                # shadcn/ui primitives
│   ├── layout/            # Navbar, Footer, AdminSidebar, ThemeToggle
│   ├── auth/              # LoginForm
│   ├── public/            # HeroSection, ProjectCard, BlogCard, ContactForm…
│   └── admin/             # ProjectForm, BlogEditor, DeleteButtons…
├── lib/
│   ├── actions/           # Next.js Server Actions (auth, projects, blog, messages…)
│   ├── auth/              # server.ts (Neon Auth instance), admin.ts (assertAdmin)
│   ├── utils/             # cn.ts, helpers.ts
│   ├── prisma.ts
│   ├── resend.ts
│   └── storage.ts         # Neon Object Storage (S3 API)
├── proxy.ts               # Route protection for /admin (Next.js 16 "proxy", formerly middleware)
└── types/                 # Shared TypeScript types
scripts/
├── copy-supabase-data.ts         # One-off: copy table rows from Supabase to Neon
├── migrate-supabase-storage.ts   # One-off: copy files from Supabase Storage to Neon
└── move-to-public-bucket.ts      # Move files into a Public read bucket (fixes 403s)
```

---

## ⚡ Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/portfolio.git
cd portfolio
npm install
```

### 2. Create a Neon Project

Create a project at [console.neon.tech](https://console.neon.tech). Pick the **AWS Asia Pacific (Singapore)** region (`aws-ap-southeast-1`) so the database sits next to the Vercel `sin1` region configured in `vercel.json`. That region also supports Object Storage.

### 3. Environment Variables

Copy `.env.example` to `.env.local` and fill in all values:

```bash
cp .env.example .env.local
```

```env
# Database — Neon Console → Connect. Pooled string (host has "-pooler") for the app,
# direct string for Prisma migrations
DATABASE_URL=postgresql://[user]:[password]@ep-[id]-pooler.[region].aws.neon.tech/neondb?sslmode=require&connect_timeout=15
DIRECT_URL=postgresql://[user]:[password]@ep-[id].[region].aws.neon.tech/neondb?sslmode=require&connect_timeout=15

# Auth — Neon Console → Auth → Configuration
NEON_AUTH_BASE_URL=https://ep-[id].neonauth.[region].aws.neon.tech/neondb/auth
NEON_AUTH_COOKIE_SECRET=   # openssl rand -base64 32
ADMIN_EMAIL=your@email.com # ONLY this email can access /admin

# Object storage — Neon Console → Object storage
NEON_STORAGE_ENDPOINT=https://br-[branch-id].storage.c-[n].[region].aws.neon.tech
NEON_STORAGE_REGION=ap-southeast-1
NEON_STORAGE_ACCESS_KEY_ID=nak_live_...
NEON_STORAGE_SECRET_ACCESS_KEY=nsk_live_...
NEON_STORAGE_BUCKET=portfolio-images

# Email (get from resend.com)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=Portfolio <noreply@yourdomain.com>

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> The `npm run db:*` scripts load `.env.local` for you. Plain `npx prisma …` commands don't (Prisma CLI only reads `.env`), so use the npm scripts.

### 4. Database Setup

```bash
# Create the tables on Neon (uses DIRECT_URL)
npm run db:push

# Seed with sample data (skip this if you're migrating existing data, see below)
npm run db:seed

# (Optional) Open Prisma Studio
npm run db:studio
```

Neon Auth keeps its users and sessions in a separate `neon_auth` schema in the same database. Prisma only manages the `public` schema, so `db push` leaves it alone.

### 5. Object Storage Setup

1. In the Neon Console, open your project → **Object storage** → **New bucket**
2. Name it `portfolio-images` and set the access level to **Public read**. Uploaded images and the resume are served by public URL. *The access level can't be changed after the bucket is created.*
   > **Images return 403 `AccessDenied`?** The bucket was created as Private (the default). Create a new bucket with **Public read**, then run `npm run storage:move-bucket -- --to <new-bucket>`. It copies every object, repoints the URLs in the database, and leaves the old bucket untouched. Then set `NEON_STORAGE_BUCKET` to the new name and restart.
3. Copy the S3 endpoint, region and an access key pair into the `NEON_STORAGE_*` variables. If you use the Neon CLI, `neon env pull` writes them as `AWS_*` variables. Rename them:

| `neon env pull` writes | Put it in |
|---|---|
| `AWS_ENDPOINT_URL_S3` | `NEON_STORAGE_ENDPOINT` |
| `AWS_REGION` | `NEON_STORAGE_REGION` |
| `AWS_ACCESS_KEY_ID` | `NEON_STORAGE_ACCESS_KEY_ID` |
| `AWS_SECRET_ACCESS_KEY` | `NEON_STORAGE_SECRET_ACCESS_KEY` |

The app uses `NEON_STORAGE_*` names because Vercel reserves the `AWS_*` names for its own runtime.

> The storage code uses the plain S3 API (`@aws-sdk/client-s3`). If Neon Object Storage isn't enabled on your account yet, any S3-compatible store with public-read objects (Cloudflare R2, AWS S3…) works by changing only these variables.

### 6. Neon Auth Setup

1. In the Neon Console, open your project → **Auth** and enable it. Copy the **Auth URL** into `NEON_AUTH_BASE_URL`.
2. Generate a cookie secret (at least 32 characters) for `NEON_AUTH_COOKIE_SECRET`:
   ```bash
   openssl rand -base64 32
   ```
3. On the **Auth** page, use **Create user** to create the admin account with your `ADMIN_EMAIL` (the Console asks only for an email and name).
   Then set its password from the app: start the dev server, open `/login`, click **Forgot password?**, enter `ADMIN_EMAIL`, and use the emailed code to choose a password (12+ characters).
   Signing in takes two steps: the password, then a one-time code that Neon Auth emails to `ADMIN_EMAIL`. Emails come from Neon Auth's built-in email provider, so no Resend setup is needed for this. If the code doesn't arrive, check spam, or set up a custom email provider under **Auth → Configuration**.
4. Turn off public sign-ups for the project if your Auth settings offer it (the Neon API calls this `disable_sign_up`). The app's `/api/auth` proxy rejects sign-up requests either way.
5. Under **Auth → Configuration → Domains**, add your production domain. Localhost is pre-approved.

### 7. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the public site.
Open [http://localhost:3000/login](http://localhost:3000/login) for admin access.

> Neon Auth session cookies are `Secure`. Chrome and Firefox accept them on `http://localhost`, but Safari doesn't. To test login in Safari, run `npm run dev -- --experimental-https`.

---

## 🔁 Migrating from Supabase

For an existing install with content in Supabase. Do this once, before pointing production at Neon.

**1. Create the tables on Neon.** With `.env.local` pointing at Neon, run:

```bash
npm run db:push
```

Don't run the seed: its rows would win over your real Supabase rows (for example `hero_name`).

**2. Copy the data.** Get your Supabase connection string from the Supabase dashboard → **Connect** → **Session pooler** (port 5432). Then, in PowerShell:

```powershell
$env:SUPABASE_DATABASE_URL = "postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
npm run db:copy-from-supabase -- --dry-run   # show row counts only
npm run db:copy-from-supabase                # copy the rows
```

(bash: `export SUPABASE_DATABASE_URL="…"`.) The script copies all six app tables (projects, blog posts, messages, experience, site config, skills) with their original ids and timestamps, writing to Neon through `DIRECT_URL`. It needs no `pg_dump` or Docker. Rows already on Neon are skipped, so it's safe to re-run.

**3. Copy the uploaded files.** Set up the bucket ([step 5](#5-object-storage-setup)), make sure `.env.local` points at Neon, then run:

```bash
npm run storage:migrate -- --dry-run   # preview what will be copied and rewritten
npm run storage:migrate                # copy files and rewrite URLs
```

The script finds every Supabase Storage URL in the database: project images, blog thumbnails, images inside blog post Markdown, skill icons, the resume, and any other site config value. It copies each file to Neon under the same key and rewrites the URL. It needs no Supabase credentials, because the files are downloaded through their public URLs. It's safe to re-run: if a file fails to copy, the row that references it keeps its Supabase URL, and the next run retries it.

**4. Recreate the admin account** in Neon Auth ([step 6](#6-neon-auth-setup)). Passwords can't be exported from Supabase Auth.

**5. Update Vercel env vars** (see below), remove `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and redeploy. You can shut down the Supabase project once everything checks out.

---

## 🌐 Deploying to Vercel

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "feat: initial portfolio setup"
git remote add origin https://github.com/yourusername/portfolio.git
git push -u origin main
```

### Step 2 — Import to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repository
3. Framework preset: **Next.js** (auto-detected)

### Step 3 — Set Environment Variables

In Vercel project settings → **Environment Variables**, add all variables from `.env.example` with production values:

| Variable | Notes |
|----------|-------|
| `DATABASE_URL` | Neon **pooled** connection string (host contains `-pooler`) |
| `DIRECT_URL` | Neon **direct** connection string |
| `NEON_AUTH_BASE_URL` | Neon Console → Auth → Configuration |
| `NEON_AUTH_COOKIE_SECRET` | 32+ random characters |
| `ADMIN_EMAIL` | Your email address |
| `NEON_STORAGE_ENDPOINT` | Neon Console → Object storage |
| `NEON_STORAGE_REGION` | e.g. `ap-southeast-1` |
| `NEON_STORAGE_ACCESS_KEY_ID` | Object storage access key |
| `NEON_STORAGE_SECRET_ACCESS_KEY` | Object storage secret |
| `NEON_STORAGE_BUCKET` | `portfolio-images` |
| `RESEND_API_KEY` | From resend.com |
| `RESEND_FROM_EMAIL` | Verified sender (e.g. `noreply@yourdomain.com`) |
| `NEXT_PUBLIC_APP_URL` | Your production URL |

The storage variables must be available at **build time** too: `next.config.js` uses them to allow the bucket's host in `next/image`.

### Step 4 — Configure Build Command

In Vercel project settings → **Build & Development Settings**:

```
Build Command: prisma generate && next build
```

### Step 5 — Run Production Migration

From your local terminal (uses `DIRECT_URL` from `.env.local`):

```bash
npm run db:migrate:deploy
```

Or if using `db push`:

```bash
npm run db:push
```

### Step 6 — Deploy

Click **Deploy** in Vercel. Your site will be live in ~2 minutes.

### Step 7 — Add Your Domain to Neon Auth

In Neon Console → **Auth → Configuration → Domains**, add `https://yourdomain.com`.

---

## 🔧 Customization

### Update Your Personal Info

1. Log into `/admin`
2. The `SiteConfig` table stores editable content. You can extend the admin UI to edit these, or run SQL directly (e.g. in the Neon Console **SQL Editor**):

```sql
UPDATE "SiteConfig" SET value = 'Your Name' WHERE key = 'hero_name';
UPDATE "SiteConfig" SET value = 'Senior Software Engineer' WHERE key = 'hero_title';
UPDATE "SiteConfig" SET value = 'Your bio here...' WHERE key = 'hero_bio';
UPDATE "SiteConfig" SET value = 'https://github.com/you' WHERE key = 'github_url';
UPDATE "SiteConfig" SET value = 'https://linkedin.com/in/you' WHERE key = 'linkedin_url';
```

Or use Prisma Studio:
```bash
npm run db:studio
```

### Change the Color Scheme

Edit CSS variables in `src/app/globals.css`:

```css
:root {
  --primary: 25 95% 58%;   /* Change hue for different accent */
  --accent: 340 80% 65%;   /* Secondary accent color */
}
```

### Add Your Resume

Upload a PDF from **Admin → Resume**. It's stored in Neon Object Storage, and the hero section's **Download Resume** button links to it.

### Add OG Image

Place `og-image.png` (1200×630px) in `public/`. Update `src/app/layout.tsx` to reference it.

---

## 📊 Performance Notes

- **ISR** (`revalidate = 60`) on all public pages: fresh data every 60 seconds without a rebuild
- **SSG** on blog post pages via `generateStaticParams`: pre-built at deploy time
- **Image optimization** via Next.js `<Image>`. Neon Object Storage has no CDN, so optimized images are cached by Vercel's image cache.
- **Connection pooling** via Neon's built-in PgBouncer (the `-pooler` connection string), for serverless compatibility
- **Cold starts**: Neon computes scale to zero when idle; `connect_timeout=15` in the connection strings covers the wake-up
- **Code splitting** automatic via Next.js App Router

Target: **95+ Lighthouse score** on public pages.

---

## 📦 npm Scripts

```bash
npm run dev              # Start development server
npm run build            # Generate Prisma client + build Next.js
npm run start            # Start production server
npm run lint             # Run ESLint
npm run db:push          # Push schema to database (no migration file)
npm run db:migrate       # Create and run a migration
npm run db:migrate:deploy # Apply migrations in production
npm run db:studio        # Open Prisma Studio GUI
npm run db:seed          # Seed database with sample data
npm run db:copy-from-supabase # One-off: copy table rows from Supabase to Neon (see above)
npm run storage:migrate  # One-off: copy files from Supabase Storage to Neon (see above)
npm run storage:move-bucket -- --to <bucket> # Move files into a Public read bucket (fixes 403s)
```

---

## 🔐 Security Notes

- Admin routes protected at the proxy level (Neon Auth session check)
- Two-step admin sign-in: after the password, a single-use code is emailed to `ADMIN_EMAIL` (Neon Auth email OTP: expires after a few minutes, with a limited number of attempts). A correct code unlocks the admin area for 12 hours in that browser
- Additional server-side `assertAdmin()` check (session + `ADMIN_EMAIL` + verified code) in every Server Action and API route
- Public sign-up is refused by the `/api/auth` proxy; the admin account is created in the Neon Console and its password is set with an emailed code (**Forgot password?** on `/login`)
- Sign-in attempts for any email other than `ADMIN_EMAIL` are rejected without contacting Neon Auth
- File uploads validated for type and size (max 5MB, images only)
- Zod validation on all form inputs
- SQL injection protection via Prisma ORM
- Rate limiting recommended for `/api/contact` in production (add via Vercel Edge Config or Upstash)

---

## 🤝 License

MIT — use freely, attribution appreciated.
