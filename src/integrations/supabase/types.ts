export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          accessibility_needs: string[]
          created_at: string
          default_airport: string | null
          dietary_preferences: string[]
          full_name: string | null
          has_completed_onboarding: boolean
          home_city: string | null
          id: string
          intl_addon: boolean
          nationality: string | null
          notification_choice: string | null
          passport_expiry: string | null
          passport_number: string | null
          phone: string | null
          plan: string
          plan_seats: number
          preferred_currency: string
          show_name_to_companions: boolean
          travel_interests: string[]
          updated_at: string
          visa_notes: string | null
        }
        Insert: {
          accessibility_needs?: string[]
          created_at?: string
          default_airport?: string | null
          dietary_preferences?: string[]
          full_name?: string | null
          has_completed_onboarding?: boolean
          home_city?: string | null
          id: string
          intl_addon?: boolean
          nationality?: string | null
          notification_choice?: string | null
          passport_expiry?: string | null
          passport_number?: string | null
          phone?: string | null
          plan?: string
          plan_seats?: number
          preferred_currency?: string
          show_name_to_companions?: boolean
          travel_interests?: string[]
          updated_at?: string
          visa_notes?: string | null
        }
        Update: {
          accessibility_needs?: string[]
          created_at?: string
          default_airport?: string | null
          dietary_preferences?: string[]
          full_name?: string | null
          has_completed_onboarding?: boolean
          home_city?: string | null
          id?: string
          intl_addon?: boolean
          nationality?: string | null
          notification_choice?: string | null
          passport_expiry?: string | null
          passport_number?: string | null
          phone?: string | null
          plan?: string
          plan_seats?: number
          preferred_currency?: string
          show_name_to_companions?: boolean
          travel_interests?: string[]
          updated_at?: string
          visa_notes?: string | null
        }
        Relationships: []
      }
      saved_trips: {
        Row: {
          created_at: string
          days: number
          destination: string
          id: string
          origin: string
          pdf_exported_once: boolean
          plan_id: string
          start_date: string
          travelers: number
          trip_data: Json
          trip_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          days: number
          destination: string
          id?: string
          origin: string
          pdf_exported_once?: boolean
          plan_id?: string
          start_date: string
          travelers?: number
          trip_data: Json
          trip_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          days?: number
          destination?: string
          id?: string
          origin?: string
          pdf_exported_once?: boolean
          plan_id?: string
          start_date?: string
          travelers?: number
          trip_data?: Json
          trip_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shared_trips: {
        Row: {
          created_at: string
          created_by: string
          destination: string
          id: string
          origin: string
          share_id: string
          trip_data: Json
          trip_name: string
        }
        Insert: {
          created_at?: string
          created_by: string
          destination: string
          id?: string
          origin: string
          share_id?: string
          trip_data: Json
          trip_name: string
        }
        Update: {
          created_at?: string
          created_by?: string
          destination?: string
          id?: string
          origin?: string
          share_id?: string
          trip_data?: Json
          trip_name?: string
        }
        Relationships: []
      }
      trip_expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          currency: string
          id: string
          label: string
          spent_on: string
          trip_id: string | null
          user_id: string
        }
        Insert: {
          amount?: number
          category?: string
          created_at?: string
          currency?: string
          id?: string
          label: string
          spent_on?: string
          trip_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          currency?: string
          id?: string
          label?: string
          spent_on?: string
          trip_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_expenses_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "saved_trips"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_shared_trip: {
        Args: { _share_id: string }
        Returns: {
          created_at: string
          destination: string
          origin: string
          share_id: string
          trip_data: Json
          trip_name: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
