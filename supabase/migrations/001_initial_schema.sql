-- ============================================================
-- Potencia Tracking — Initial Schema Migration
-- Story 1.2: Database Schema & Supabase Setup
-- ============================================================
-- Tables: profiles, projects, project_pages, utm_links, tracking_events
-- Includes: indexes, triggers, functions, RLS policies, seed data
-- ============================================================

-- Enable UUID extension (usually enabled by default in Supabase)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. TABLES
-- ============================================================

-- profiles: user profiles linked to Supabase Auth
CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT NOT NULL DEFAULT '',
  role        TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- projects: marketing projects/products
CREATE TABLE public.projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  base_url    TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- project_pages: landing pages per project
CREATE TABLE public.project_pages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  url         TEXT NOT NULL,
  is_default  BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- utm_links: UTM-tagged links
CREATE TABLE public.utm_links (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  page_id      UUID REFERENCES public.project_pages(id) ON DELETE SET NULL,
  label        TEXT NOT NULL,
  base_url     TEXT NOT NULL,
  utm_source   TEXT NOT NULL,
  utm_medium   TEXT NOT NULL DEFAULT '',
  utm_campaign TEXT NOT NULL DEFAULT '',
  utm_content  TEXT,
  utm_term     TEXT,
  short_slug   TEXT NOT NULL UNIQUE,
  full_url     TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- tracking_events: clicks, pageviews, and conversions
CREATE TABLE public.tracking_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  link_id         UUID REFERENCES public.utm_links(id) ON DELETE SET NULL,
  tracking_id     TEXT NOT NULL,
  event_type      TEXT NOT NULL CHECK (event_type IN ('pageview', 'click', 'conversion')),
  timestamp       TIMESTAMPTZ NOT NULL DEFAULT now(),
  utm_source      TEXT NOT NULL DEFAULT '',
  utm_medium      TEXT NOT NULL DEFAULT '',
  utm_campaign    TEXT NOT NULL DEFAULT '',
  utm_content     TEXT,
  utm_term        TEXT,
  page_url        TEXT NOT NULL DEFAULT '',
  referrer        TEXT,
  user_agent      TEXT NOT NULL DEFAULT '',
  ip_hash         TEXT NOT NULL DEFAULT '',
  conversion_data JSONB,
  is_orphan       BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. INDEXES
-- ============================================================

-- projects
CREATE INDEX idx_projects_slug ON public.projects(slug);

-- project_pages
CREATE INDEX idx_project_pages_project ON public.project_pages(project_id);
CREATE UNIQUE INDEX idx_project_pages_default ON public.project_pages(project_id) WHERE is_default = true;

-- utm_links
CREATE INDEX idx_utm_links_project ON public.utm_links(project_id);
CREATE INDEX idx_utm_links_slug ON public.utm_links(short_slug);
CREATE INDEX idx_utm_links_search ON public.utm_links(project_id, label, utm_source, utm_campaign);

-- tracking_events
CREATE INDEX idx_tracking_project_time ON public.tracking_events(project_id, timestamp DESC);
CREATE INDEX idx_tracking_project_type_time ON public.tracking_events(project_id, event_type, timestamp DESC);
CREATE INDEX idx_tracking_source ON public.tracking_events(project_id, utm_source, timestamp DESC);
CREATE INDEX idx_tracking_campaign ON public.tracking_events(project_id, utm_campaign, timestamp DESC) WHERE utm_campaign != '';
CREATE INDEX idx_tracking_tracking_id ON public.tracking_events(tracking_id);
CREATE INDEX idx_tracking_link ON public.tracking_events(link_id) WHERE link_id IS NOT NULL;
CREATE INDEX idx_tracking_conversions ON public.tracking_events(project_id, timestamp DESC) WHERE event_type = 'conversion';

-- ============================================================
-- 3. FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.utm_links
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.utm_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;

-- profiles: users can only read/update their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- projects: full CRUD for authenticated users (MVP = internal team)
CREATE POLICY "Authenticated users can view projects"
  ON public.projects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create projects"
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update projects"
  ON public.projects FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete projects"
  ON public.projects FOR DELETE
  TO authenticated
  USING (true);

-- project_pages: full CRUD for authenticated users
CREATE POLICY "Authenticated users can view pages"
  ON public.project_pages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create pages"
  ON public.project_pages FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update pages"
  ON public.project_pages FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete pages"
  ON public.project_pages FOR DELETE
  TO authenticated
  USING (true);

-- utm_links: full CRUD for authenticated users
CREATE POLICY "Authenticated users can view links"
  ON public.utm_links FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create links"
  ON public.utm_links FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update links"
  ON public.utm_links FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete links"
  ON public.utm_links FOR DELETE
  TO authenticated
  USING (true);

-- tracking_events: SELECT for authenticated, INSERT only for service_role
CREATE POLICY "Authenticated users can view events"
  ON public.tracking_events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can insert events"
  ON public.tracking_events FOR INSERT
  TO service_role
  WITH CHECK (true);
