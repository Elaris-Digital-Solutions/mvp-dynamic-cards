export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      action_buttons: {
        Row: {
          id: string
          profile_id: string
          label: string
          url: string
          icon: string
          sort_order: number
          is_active: boolean
          created_at: string | null
        }
        Insert: {
          id?: string
          profile_id: string
          label: string
          url: string
          icon?: string
          sort_order?: number
          is_active?: boolean
          created_at?: string | null
        }
        Update: {
          id?: string
          profile_id?: string
          label?: string
          url?: string
          icon?: string
          sort_order?: number
          is_active?: boolean
          created_at?: string | null
        }
      }
      click_events: {
        Row: {
          id: string
          profile_id: string
          button_id: string | null
          event_type: 'page_view' | 'button_click' | 'vcf_download' | 'whatsapp_click'
          user_agent: string | null
          ip_hash: string | null
          platform: string
          button_label: string | null
          url: string | null
          metadata: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          profile_id: string
          button_id?: string | null
          event_type: 'page_view' | 'button_click' | 'vcf_download' | 'whatsapp_click'
          user_agent?: string | null
          ip_hash?: string | null
          platform?: string
          button_label?: string | null
          url?: string | null
          metadata?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          profile_id?: string
          button_id?: string | null
          event_type?: 'page_view' | 'button_click' | 'vcf_download' | 'whatsapp_click'
          user_agent?: string | null
          ip_hash?: string | null
          platform?: string
          button_label?: string | null
          url?: string | null
          metadata?: Json | null
          created_at?: string | null
        }
      }
      nfc_cards: {
        Row: {
          id: string
          card_uid: string
          profile_id: string | null
          assigned_at: string | null
          is_active: boolean
          notes: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          card_uid: string
          profile_id?: string | null
          assigned_at?: string | null
          is_active?: boolean
          notes?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          card_uid?: string
          profile_id?: string | null
          assigned_at?: string | null
          is_active?: boolean
          notes?: string | null
          created_at?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string | null
          first_name: string | null
          last_name: string | null
          job_title: string | null
          company: string | null
          email: string | null
          phone: string | null
          whatsapp: string | null
          bio: string | null
          avatar_url: string | null
          banner_url: string | null
          template_id: number
          is_active: boolean
          role: 'user' | 'admin'
          service_expires_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          username: string
          full_name?: string | null
          first_name?: string | null
          last_name?: string | null
          job_title?: string | null
          company?: string | null
          email?: string | null
          phone?: string | null
          whatsapp?: string | null
          bio?: string | null
          avatar_url?: string | null
          banner_url?: string | null
          template_id?: number
          is_active?: boolean
          role?: 'user' | 'admin'
          service_expires_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          username?: string
          full_name?: string | null
          first_name?: string | null
          last_name?: string | null
          job_title?: string | null
          company?: string | null
          email?: string | null
          phone?: string | null
          whatsapp?: string | null
          bio?: string | null
          avatar_url?: string | null
          banner_url?: string | null
          template_id?: number
          is_active?: boolean
          role?: 'user' | 'admin'
          service_expires_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
