import type { Tables, InsertTables, UpdateTables } from '@/types/database';

type Project = Tables<'projects'>;
type ProjectInsert = InsertTables<'projects'>;
type ProjectUpdate = UpdateTables<'projects'>;

/**
 * Repository stubs for projects table.
 * Implementations will use Supabase client when backend is available.
 */

export async function getAll(): Promise<Project[]> {
  // TODO: implement with Supabase client
  return [];
}

export async function getBySlug(slug: string): Promise<Project | null> {
  void slug;
  // TODO: implement with Supabase client
  return null;
}

export async function create(data: ProjectInsert): Promise<Project | null> {
  void data;
  // TODO: implement with Supabase client
  return null;
}

export async function update(
  id: string,
  data: ProjectUpdate,
): Promise<Project | null> {
  void id;
  void data;
  // TODO: implement with Supabase client
  return null;
}

export async function remove(id: string): Promise<boolean> {
  void id;
  // TODO: implement with Supabase client
  return false;
}
