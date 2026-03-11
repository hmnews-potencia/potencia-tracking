import type { Tables, InsertTables, UpdateTables } from '@/types/database';

type UtmLink = Tables<'utm_links'>;
type UtmLinkInsert = InsertTables<'utm_links'>;
type UtmLinkUpdate = UpdateTables<'utm_links'>;

/**
 * Repository stubs for utm_links table.
 */

export async function getByProject(projectId: string): Promise<UtmLink[]> {
  void projectId;
  // TODO: implement with Supabase client
  return [];
}

export async function getBySlug(slug: string): Promise<UtmLink | null> {
  void slug;
  // TODO: implement with Supabase client
  return null;
}

export async function create(data: UtmLinkInsert): Promise<UtmLink | null> {
  void data;
  // TODO: implement with Supabase client
  return null;
}

export async function update(
  id: string,
  data: UtmLinkUpdate,
): Promise<UtmLink | null> {
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
