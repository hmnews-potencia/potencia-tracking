import type { Tables, UpdateTables } from '@/types/database';

type Profile = Tables<'profiles'>;
type ProfileUpdate = UpdateTables<'profiles'>;

/**
 * Repository stubs for profiles table.
 */

export async function getById(id: string): Promise<Profile | null> {
  void id;
  // TODO: implement with Supabase client
  return null;
}

export async function update(
  id: string,
  data: ProfileUpdate,
): Promise<Profile | null> {
  void id;
  void data;
  // TODO: implement with Supabase client
  return null;
}
