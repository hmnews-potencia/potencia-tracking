import type { Tables, InsertTables } from '@/types/database';

type TrackingEvent = Tables<'tracking_events'>;
type TrackingEventInsert = InsertTables<'tracking_events'>;

export interface KPIs {
  totalClicks: number;
  totalConversions: number;
  conversionRate: number;
  totalPageviews: number;
}

export interface TimelinePoint {
  date: string;
  clicks: number;
  conversions: number;
  pageviews: number;
}

export interface TopSource {
  source: string;
  clicks: number;
  conversions: number;
}

/**
 * Repository stubs for tracking_events table.
 */

export async function insertEvent(
  data: TrackingEventInsert,
): Promise<TrackingEvent | null> {
  void data;
  // TODO: implement with service_role client
  return null;
}

export async function getKPIs(
  projectId: string,
  dateFrom?: string,
  dateTo?: string,
): Promise<KPIs> {
  void projectId;
  void dateFrom;
  void dateTo;
  // TODO: implement with Supabase client
  return { totalClicks: 0, totalConversions: 0, conversionRate: 0, totalPageviews: 0 };
}

export async function getTimeline(
  projectId: string,
  dateFrom?: string,
  dateTo?: string,
): Promise<TimelinePoint[]> {
  void projectId;
  void dateFrom;
  void dateTo;
  // TODO: implement with Supabase client
  return [];
}

export async function getTopSources(
  projectId: string,
  limit?: number,
): Promise<TopSource[]> {
  void projectId;
  void limit;
  // TODO: implement with Supabase client
  return [];
}
