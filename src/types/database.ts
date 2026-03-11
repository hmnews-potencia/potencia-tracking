/**
 * Database types for Potencia Tracking.
 * Manual types based on the schema in supabase/migrations/001_initial_schema.sql.
 * When Supabase is running on VPS, replace with: supabase gen types typescript
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  __InternalSupabase: {
    PostgrestVersion: '12';
  };
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: 'admin' | 'member';
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string;
          role?: 'admin' | 'member';
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: 'admin' | 'member';
          created_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          base_url: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          base_url: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          base_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      project_pages: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          url: string;
          is_default: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          name: string;
          url: string;
          is_default?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          name?: string;
          url?: string;
          is_default?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'project_pages_project_id_fkey';
            columns: ['project_id'];
            isOneToOne: false;
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
        ];
      };
      utm_links: {
        Row: {
          id: string;
          project_id: string;
          page_id: string | null;
          label: string;
          base_url: string;
          utm_source: string;
          utm_medium: string;
          utm_campaign: string;
          utm_content: string | null;
          utm_term: string | null;
          short_slug: string;
          full_url: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          page_id?: string | null;
          label: string;
          base_url: string;
          utm_source: string;
          utm_medium?: string;
          utm_campaign?: string;
          utm_content?: string | null;
          utm_term?: string | null;
          short_slug: string;
          full_url: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          page_id?: string | null;
          label?: string;
          base_url?: string;
          utm_source?: string;
          utm_medium?: string;
          utm_campaign?: string;
          utm_content?: string | null;
          utm_term?: string | null;
          short_slug?: string;
          full_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'utm_links_project_id_fkey';
            columns: ['project_id'];
            isOneToOne: false;
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'utm_links_page_id_fkey';
            columns: ['page_id'];
            isOneToOne: false;
            referencedRelation: 'project_pages';
            referencedColumns: ['id'];
          },
        ];
      };
      tracking_events: {
        Row: {
          id: string;
          project_id: string;
          link_id: string | null;
          tracking_id: string;
          event_type: 'pageview' | 'click' | 'conversion';
          timestamp: string;
          utm_source: string;
          utm_medium: string;
          utm_campaign: string;
          utm_content: string | null;
          utm_term: string | null;
          page_url: string;
          referrer: string | null;
          user_agent: string;
          ip_hash: string;
          conversion_data: Json | null;
          is_orphan: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          link_id?: string | null;
          tracking_id: string;
          event_type: 'pageview' | 'click' | 'conversion';
          timestamp?: string;
          utm_source?: string;
          utm_medium?: string;
          utm_campaign?: string;
          utm_content?: string | null;
          utm_term?: string | null;
          page_url?: string;
          referrer?: string | null;
          user_agent?: string;
          ip_hash?: string;
          conversion_data?: Json | null;
          is_orphan?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          link_id?: string | null;
          tracking_id?: string;
          event_type?: 'pageview' | 'click' | 'conversion';
          timestamp?: string;
          utm_source?: string;
          utm_medium?: string;
          utm_campaign?: string;
          utm_content?: string | null;
          utm_term?: string | null;
          page_url?: string;
          referrer?: string | null;
          user_agent?: string;
          ip_hash?: string;
          conversion_data?: Json | null;
          is_orphan?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'tracking_events_project_id_fkey';
            columns: ['project_id'];
            isOneToOne: false;
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tracking_events_link_id_fkey';
            columns: ['link_id'];
            isOneToOne: false;
            referencedRelation: 'utm_links';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

/** Helper type aliases for convenience */
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
