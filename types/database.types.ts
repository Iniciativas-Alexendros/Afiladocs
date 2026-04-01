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
      orders: {
        Row: {
          id: string
          user_id: string
          product_id: string
          stripe_session_id: string | null
          stripe_payment_intent: string | null
          amount_cents: number
          currency: string
          status: string
          eideas_level: string
          intake_data: Json | null
          intake_completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          stripe_session_id?: string | null
          stripe_payment_intent?: string | null
          amount_cents: number
          currency?: string
          status?: string
          eideas_level: string
          intake_data?: Json | null
          intake_completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          stripe_session_id?: string | null
          stripe_payment_intent?: string | null
          amount_cents?: number
          currency?: string
          status?: string
          eideas_level?: string
          intake_data?: Json | null
          intake_completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          order_id: string
          product_id: string
          version: string
          eideas_level: string
          signature_provider: string | null
          documenso_document_id: string | null
          status: string
          draft_pdf_path: string | null
          signed_pdf_path: string | null
          hash_sha256_draft: string | null
          hash_sha256_signed: string | null
          signed_at: string | null
          delivery_url_expires: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          version?: string
          eideas_level: string
          signature_provider?: string | null
          documenso_document_id?: string | null
          status?: string
          draft_pdf_path?: string | null
          signed_pdf_path?: string | null
          hash_sha256_draft?: string | null
          hash_sha256_signed?: string | null
          signed_at?: string | null
          delivery_url_expires?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          version?: string
          eideas_level?: string
          signature_provider?: string | null
          documenso_document_id?: string | null
          status?: string
          draft_pdf_path?: string | null
          signed_pdf_path?: string | null
          hash_sha256_draft?: string | null
          hash_sha256_signed?: string | null
          signed_at?: string | null
          delivery_url_expires?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      audit_log: {
        Row: {
          id: string
          event: string
          order_id: string | null
          user_id: string | null
          metadata: Json | null
          ip_hash: string | null
          created_at: string
        }
        Insert: {
          id?: string
          event: string
          order_id?: string | null
          user_id?: string | null
          metadata?: Json | null
          ip_hash?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          event?: string
          order_id?: string | null
          user_id?: string | null
          metadata?: Json | null
          ip_hash?: string | null
          created_at?: string
        }
      }
      monitor_alerts: {
        Row: {
          id: string
          source: string
          title: string
          summary: string | null
          urgency: string | null
          status: string
          raw_url: string | null
          published_at: string | null
          areas: string[]
          reviewed_by: string | null
          reviewed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          source: string
          title: string
          summary?: string | null
          urgency?: string | null
          status?: string
          raw_url?: string | null
          published_at?: string | null
          areas?: string[]
          reviewed_by?: string | null
          reviewed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          source?: string
          title?: string
          summary?: string | null
          urgency?: string | null
          status?: string
          raw_url?: string | null
          published_at?: string | null
          areas?: string[]
          reviewed_by?: string | null
          reviewed_at?: string | null
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          product_id: string
          stripe_subscription_id: string | null
          status: string
          normative_profile: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id?: string
          stripe_subscription_id?: string | null
          status?: string
          normative_profile?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          stripe_subscription_id?: string | null
          status?: string
          normative_profile?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          company_name: string | null
          nif: string | null
          phone: string | null
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          company_name?: string | null
          nif?: string | null
          phone?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          company_name?: string | null
          nif?: string | null
          phone?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
