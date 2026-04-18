# 🚀 Portfolio + Blog + Admin Dashboard

A high-performance personal portfolio and blog system built with **Next.js 14**, **Supabase**, **Prisma**, and **Tailwind CSS**. Features a glassmorphism public site and a full-featured admin dashboard.

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
- **Protected Routes** — Supabase Auth, single-email access control
- **Dashboard** — Stats overview, recent messages, quick actions
- **Project CRUD** — Image upload to Supabase Storage, category, featured flag
- **Blog Editor** — Markdown editor with live preview, publish/draft toggle
- **Inbox** — Read/delete contact messages, reply via email link
- **Experience Manager** — Timeline entries with tech stack

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Supabase (PostgreSQL) |
| ORM | Prisma |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
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
│   ├── (admin)/           # Protected admin routes
│   │   ├── login/
│   │   └── admin/         # Dashboard, projects, blog, inbox, experience
│   └── api/               # API routes (contact, upload, blog views)
├── components/
│   ├── ui/                # shadcn/ui primitives
│   ├── layout/            # Navbar, Footer, AdminSidebar, ThemeToggle
│   ├── public/            # HeroSection, ProjectCard, BlogCard, ContactForm…
│   └── admin/             # ProjectForm, BlogEditor, DeleteButtons…
├── lib/
│   ├── actions/           # Next.js Server Actions (projects, blog, messages)
│   ├── supabase/          # client.ts, server.ts, storage.ts
│   ├── utils/             # cn.ts, helpers.ts
│   ├── prisma.ts
│   └── resend.ts
└── types/                 # Shared TypeScript types
```

---

## ⚡ Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/portfolio.git
cd portfolio
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in all values:

```bash
cp .env.example .env.local
```

```env
# Supabase — get these from your project dashboard
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Database — use Transaction Pooler URL (port 6543) for DATABASE_URL
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres

# Auth — ONLY this email can access /admin
ADMIN_EMAIL=your@email.com

# Email (get from resend.com)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=Portfolio <noreply@yourdomain.com>

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

```bash
# Push schema to Supabase
npx prisma db push

# Seed with sample data
npm run db:seed

# (Optional) Open Prisma Studio
npm run db:studio
```

### 4. Supabase Storage Setup

In your Supabase dashboard:

1. Go to **Storage** → **New Bucket**
2. Name it `portfolio-images`
3. Set to **Public**
4. Go to **Policies** and run this SQL:

```sql
-- Allow public read
CREATE POLICY "Public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio-images');

-- Allow authenticated uploads
CREATE POLICY "Admin upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'portfolio-images'
  AND auth.role() = 'authenticated'
);

-- Allow authenticated deletes
CREATE POLICY "Admin delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'portfolio-images'
  AND auth.uid() = owner
);
```

### 5. Supabase Auth Setup

1. Go to **Authentication** → **Providers** → enable **Email**
2. Go to **Authentication** → **Users** → **Invite User**
3. Enter your admin email and set a password
4. In **Authentication** → **URL Configuration**, add:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/admin`

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the public site.
Open [http://localhost:3000/login](http://localhost:3000/login) for admin access.

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
| `DATABASE_URL` | Use Supabase **Transaction Pooler** URL (port 6543) |
| `DIRECT_URL` | Use Supabase **Direct** URL (port 5432) |
| `NEXT_PUBLIC_SUPABASE_URL` | From Supabase dashboard |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | From Supabase dashboard |
| `ADMIN_EMAIL` | Your email address |
| `RESEND_API_KEY` | From resend.com |
| `RESEND_FROM_EMAIL` | Verified sender (e.g. `noreply@yourdomain.com`) |
| `NEXT_PUBLIC_APP_URL` | Your production URL |

### Step 4 — Configure Build Command

In Vercel project settings → **Build & Development Settings**:

```
Build Command: prisma generate && next build
```

### Step 5 — Run Production Migration

From your local terminal (uses `DIRECT_URL`):

```bash
npx prisma migrate deploy
```

Or if using `db push`:

```bash
npx prisma db push
```

### Step 6 — Deploy

Click **Deploy** in Vercel. Your site will be live in ~2 minutes.

### Step 7 — Update Supabase Auth URLs

In Supabase → **Authentication** → **URL Configuration**:
- Site URL: `https://yourdomain.com`
- Redirect URLs: `https://yourdomain.com/admin`

---

## 🔧 Customization

### Update Your Personal Info

1. Log into `/admin`
2. The `SiteConfig` table stores editable content — you can extend the admin UI to edit these, or run directly:

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

Place `resume.pdf` in the `public/` directory. The hero section links to `/resume.pdf` automatically.

### Add OG Image

Place `og-image.png` (1200×630px) in `public/`. Update `src/app/layout.tsx` to reference it.

---

## 📊 Performance Notes

- **ISR** (`revalidate = 60`) on all public pages — fresh data every 60 seconds without rebuild
- **SSG** on blog post pages via `generateStaticParams` — pre-built at deploy time
- **Image optimization** via Next.js `<Image>` with Supabase Storage CDN
- **Connection pooling** via Supabase PgBouncer (port 6543) for serverless compatibility
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
```

---

## 🔐 Security Notes

- Admin routes protected at middleware level (Supabase session check)
- Additional server-side `assertAdmin()` check in every Server Action and API route
- File uploads validated for type and size (max 5MB, images only)
- Zod validation on all form inputs
- SQL injection protection via Prisma ORM
- Rate limiting recommended for `/api/contact` in production (add via Vercel Edge Config or Upstash)

---

## 🤝 License

MIT — use freely, attribution appreciated.
