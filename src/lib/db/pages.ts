import type { Tables, InsertTables, UpdateTables } from '@/types/database';

type ProjectPage = Tables<'project_pages'>;
type ProjectPageInsert = InsertTables<'project_pages'>;
type ProjectPageUpdate = UpdateTables<'project_pages'>;

/**
 * Repository stubs for project_pages table.
 */

export async function getByProject(projectId: string): Promise<ProjectPage[]> {
  void projectId;
  // TODO: implement with Supabase client
  return [];
}

export async function create(
  data: ProjectPageInsert,
): Promise<ProjectPage | null> {
  void data;
  // TODO: implement with Supabase client
  return null;
}

export async function update(
  id: string,
  data: ProjectPageUpdate,
): Promise<ProjectPage | null> {
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
