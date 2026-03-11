-- ============================================================
-- Potencia Tracking — Seed Data
-- Story 1.2: Database Schema & Supabase Setup
-- ============================================================

-- Default project: Potencia Educacao — Geral
INSERT INTO public.projects (name, slug, description, base_url)
VALUES (
  'Potencia Educacao — Geral',
  'potencia-geral',
  'Projeto padrao para tracking geral da Potencia Educacao',
  'https://potencia.edu.br'
);

-- Default page: Site Principal (linked to default project)
INSERT INTO public.project_pages (project_id, name, url, is_default)
SELECT id, 'Site Principal', 'https://potencia.edu.br', true
FROM public.projects WHERE slug = 'potencia-geral';
