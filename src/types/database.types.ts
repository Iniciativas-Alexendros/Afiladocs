// Supabase Database Types — auto-generado por Supabase CLI
// Para regenerar: npx supabase gen types typescript --project-id TU_PROJECT_ID > src/types/database.types.ts
// Este archivo es un placeholder para compilación. Reemplazar con los tipos reales del proyecto.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          full_name: string | null
          company_name: string | null
          nif: string | null
          phone: string | null
          role: string
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          full_name?: string | null
          company_name?: string | null
          nif?: string | null
          phone?: string | null
          role?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          full_name?: string | null
          company_name?: string | null
          nif?: string | null
          phone?: string | null
          role?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

type PublicSchema = Database[Extract<keyof Database, 'public'>]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    ? (PublicSchema['Tables'] & PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never
