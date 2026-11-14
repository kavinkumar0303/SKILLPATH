-- ==============================================================================
-- SKILLPATH - Complete Supabase PostgreSQL Schema
-- Run this in the Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- 1. Profiles Table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar TEXT,
  bio TEXT,
  phone TEXT,
  location TEXT,
  linkedin TEXT,
  github TEXT,
  education_level TEXT DEFAULT 'B.Tech',
  branch TEXT DEFAULT 'Computer Science',
  target_role TEXT DEFAULT 'role_fullstack',
  education JSONB DEFAULT '[]'::jsonb,
  projects JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. User Skills Table
CREATE TABLE IF NOT EXISTS public.user_skills (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  skill_id TEXT NOT NULL,
  level INT DEFAULT 50,
  verified BOOLEAN DEFAULT false,
  verified_score INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, skill_id)
);

-- 3. Resumes Table
CREATE TABLE IF NOT EXISTS public.resumes (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role_id TEXT NOT NULL DEFAULT 'role_fullstack',
  template TEXT NOT NULL DEFAULT 'modern',
  resume_data JSONB NOT NULL,
  ats_score INT DEFAULT 80,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, role_id)
);

-- 4. Resume Versions (Version History)
CREATE TABLE IF NOT EXISTS public.resume_versions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  version_id TEXT NOT NULL,
  role_id TEXT NOT NULL,
  template TEXT NOT NULL,
  resume_data JSONB NOT NULL,
  ats_score INT DEFAULT 80,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Roadmaps Table
CREATE TABLE IF NOT EXISTS public.roadmaps (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role_id TEXT NOT NULL,
  roadmap_data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

-- 6. Assessment Results
CREATE TABLE IF NOT EXISTS public.assessments (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  skill_id TEXT NOT NULL,
  score INT NOT NULL,
  passed BOOLEAN NOT NULL,
  feedback JSONB,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Roles Table (Seed / Reference)
CREATE TABLE IF NOT EXISTS public.roles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  required_skills JSONB DEFAULT '[]'::jsonb
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can view and manage their own data
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can manage their skills" ON public.user_skills FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their resumes" ON public.resumes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their resume versions" ON public.resume_versions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their roadmaps" ON public.roadmaps FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view their assessments" ON public.assessments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public can view roles" ON public.roles FOR SELECT USING (true);

-- Auto-create profile trigger on new signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, avatar)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Seed Roles
INSERT INTO public.roles (id, name, description)
VALUES 
  ('role_fullstack', 'Full Stack Developer', 'Builds both client-side and server-side software, handling the entire web application stack.'),
  ('role_frontend', 'Frontend Developer', 'Specializes in user interfaces, component design, and modern interactive web applications.'),
  ('role_backend', 'Backend Developer', 'Designs and implements APIs, databases, microservices, and server-side infrastructure.'),
  ('role_data_scientist', 'Data Scientist', 'Analyzes complex datasets, engineers features, and creates predictive ML pipelines.'),
  ('role_devops', 'DevOps Engineer', 'Automates cloud infrastructure, CI/CD pipelines, container orchestration, and monitoring.'),
  ('role_ml_engineer', 'ML Engineer', 'Productionizes machine learning models, neural architectures, and distributed training.')
ON CONFLICT (id) DO NOTHING;

