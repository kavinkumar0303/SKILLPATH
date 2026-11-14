# Skillpath — Your path from skills to career

Skillpath is a personalized learning intelligence platform that connects an individual's technical competencies with target industry career requirements through automated diagnostics, topological learning roadmap synthesis, and adaptive remediation.

Skillpath runs entirely as a modern React + TypeScript application connected directly to **Supabase** (PostgreSQL, Auth, Storage) without requiring a separate backend service.

---

## ⚡ Quick Start

### 1. Install & Run Frontend
```bash
cd frontend
npm install
npm run dev
```
Visit **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 🗄️ Supabase Setup (Database & Authentication)

Skillpath connects directly to Supabase for authentication, user profiles, skill tracking, and resume storage.

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a free project.

### 2. Run Database Migration
1. In your Supabase Dashboard, open **SQL Editor**.
2. Click **New query**, paste the entire contents of [`supabase/schema.sql`](./supabase/schema.sql), and click **Run**.
3. This creates all necessary tables (`profiles`, `user_skills`, `resumes`, `resume_versions`, `roadmaps`, `assessments`, `roles`) with Row Level Security (RLS) enabled.

### 3. Add Supabase Environment Variables
1. In Supabase Dashboard, go to **Project Settings** -> **API**.
2. Copy **Project URL** and **anon public key**.
3. In `frontend/.env` (and in your Vercel project environment variables):
```env
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-public-key"
```

*(Optional: If Supabase keys are not set, Skillpath automatically operates with local persistence and preloaded demo data so the application never breaks).*

---

## 🚀 Vercel Deployment

Deploying on Vercel is seamless since the project is a single high-performance static SPA:
1. Connect this GitHub repository to Vercel.
2. In Vercel Project Settings, add the environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy! Vercel will build `frontend/dist` and handle client-side routing automatically.
