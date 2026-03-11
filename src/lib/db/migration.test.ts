import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('SQL Migration', () => {
  const migrationPath = path.resolve(
    __dirname,
    '../../../supabase/migrations/001_initial_schema.sql',
  );

  it('should exist as a file', () => {
    expect(fs.existsSync(migrationPath)).toBe(true);
  });

  it('should be non-empty', () => {
    const content = fs.readFileSync(migrationPath, 'utf-8');
    expect(content.length).toBeGreaterThan(0);
  });

  it('should contain all 5 CREATE TABLE statements', () => {
    const content = fs.readFileSync(migrationPath, 'utf-8');
    expect(content).toContain('CREATE TABLE public.profiles');
    expect(content).toContain('CREATE TABLE public.projects');
    expect(content).toContain('CREATE TABLE public.project_pages');
    expect(content).toContain('CREATE TABLE public.utm_links');
    expect(content).toContain('CREATE TABLE public.tracking_events');
  });

  it('should enable RLS on all 5 tables', () => {
    const content = fs.readFileSync(migrationPath, 'utf-8');
    const rlsMatches = content.match(/ENABLE ROW LEVEL SECURITY/g);
    expect(rlsMatches).not.toBeNull();
    expect(rlsMatches!.length).toBe(5);
  });

  it('should contain required indexes', () => {
    const content = fs.readFileSync(migrationPath, 'utf-8');
    expect(content).toContain('idx_projects_slug');
    expect(content).toContain('idx_project_pages_project');
    expect(content).toContain('idx_project_pages_default');
    expect(content).toContain('idx_utm_links_project');
    expect(content).toContain('idx_utm_links_slug');
    expect(content).toContain('idx_utm_links_search');
    expect(content).toContain('idx_tracking_project_time');
    expect(content).toContain('idx_tracking_tracking_id');
    expect(content).toContain('idx_tracking_conversions');
  });

  it('should contain trigger functions', () => {
    const content = fs.readFileSync(migrationPath, 'utf-8');
    expect(content).toContain('handle_new_user');
    expect(content).toContain('handle_updated_at');
    expect(content).toContain('SECURITY DEFINER');
  });

  it('should contain RLS policies', () => {
    const content = fs.readFileSync(migrationPath, 'utf-8');
    expect(content).toContain('CREATE POLICY');
    expect(content).toContain('auth.uid()');
    expect(content).toContain('TO authenticated');
    expect(content).toContain('TO service_role');
  });

  it('should contain correct CHECK constraints', () => {
    const content = fs.readFileSync(migrationPath, 'utf-8');
    expect(content).toContain("role IN ('admin', 'member')");
    expect(content).toContain(
      "event_type IN ('pageview', 'click', 'conversion')",
    );
  });

  it('should contain proper FK constraints', () => {
    const content = fs.readFileSync(migrationPath, 'utf-8');
    expect(content).toContain('REFERENCES auth.users(id) ON DELETE CASCADE');
    expect(content).toContain(
      'REFERENCES public.projects(id) ON DELETE CASCADE',
    );
    expect(content).toContain(
      'REFERENCES public.utm_links(id) ON DELETE SET NULL',
    );
    expect(content).toContain(
      'REFERENCES public.project_pages(id) ON DELETE SET NULL',
    );
  });
});

describe('Seed SQL', () => {
  const seedPath = path.resolve(__dirname, '../../../supabase/seed.sql');

  it('should exist as a file', () => {
    expect(fs.existsSync(seedPath)).toBe(true);
  });

  it('should contain default project insert', () => {
    const content = fs.readFileSync(seedPath, 'utf-8');
    expect(content).toContain('Potencia Educacao');
    expect(content).toContain('potencia-geral');
  });

  it('should contain default page insert', () => {
    const content = fs.readFileSync(seedPath, 'utf-8');
    expect(content).toContain('Site Principal');
    expect(content).toContain('is_default');
  });
});
