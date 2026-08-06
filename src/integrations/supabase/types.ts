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
      app_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json
          id: string
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      collection_items: {
        Row: {
          collection_id: string
          created_at: string
          id: string
          image_url: string | null
          item_key: string
          item_type: Database["public"]["Enums"]["review_subject"]
          title: string
          wishlist_item_id: string | null
        }
        Insert: {
          collection_id: string
          created_at?: string
          id?: string
          image_url?: string | null
          item_key: string
          item_type: Database["public"]["Enums"]["review_subject"]
          title: string
          wishlist_item_id?: string | null
        }
        Update: {
          collection_id?: string
          created_at?: string
          id?: string
          image_url?: string | null
          item_key?: string
          item_type?: Database["public"]["Enums"]["review_subject"]
          title?: string
          wishlist_item_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collection_items_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_items_wishlist_item_id_fkey"
            columns: ["wishlist_item_id"]
            isOneToOne: false
            referencedRelation: "wishlist_items"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          cover_url: string | null
          created_at: string
          description: string | null
          id: string
          is_shared: boolean
          name: string
          share_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_shared?: boolean
          name: string
          share_id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_shared?: boolean
          name?: string
          share_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      expense_shares: {
        Row: {
          amount: number
          created_at: string
          expense_id: string
          id: string
          settled: boolean
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          expense_id: string
          id?: string
          settled?: boolean
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          expense_id?: string
          id?: string
          settled?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_shares_expense_id_fkey"
            columns: ["expense_id"]
            isOneToOne: false
            referencedRelation: "trip_expenses"
            referencedColumns: ["id"]
          },
        ]
      }
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
      promo_codes: {
        Row: {
          active: boolean
          code: string
          created_at: string
          currency: string
          description: string | null
          discount_flat: number | null
          discount_percent: number | null
          expires_at: string | null
          id: string
          max_uses: number | null
          updated_at: string
          used_count: number
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          currency?: string
          description?: string | null
          discount_flat?: number | null
          discount_percent?: number | null
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          updated_at?: string
          used_count?: number
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          currency?: string
          description?: string | null
          discount_flat?: number | null
          discount_percent?: number | null
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          updated_at?: string
          used_count?: number
        }
        Relationships: []
      }
      promo_redemptions: {
        Row: {
          created_at: string
          id: string
          promo_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          promo_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          promo_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "promo_redemptions_promo_id_fkey"
            columns: ["promo_id"]
            isOneToOne: false
            referencedRelation: "promo_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          code: string
          created_at: string
          id: string
          referred_by: string | null
          signups: number
          user_id: string
        }
        Insert: {
          code?: string
          created_at?: string
          id?: string
          referred_by?: string | null
          signups?: number
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          referred_by?: string | null
          signups?: number
          user_id?: string
        }
        Relationships: []
      }
      review_reports: {
        Row: {
          created_at: string
          id: string
          reason: string
          reporter_id: string
          resolved: boolean
          review_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason: string
          reporter_id: string
          resolved?: boolean
          review_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string
          reporter_id?: string
          resolved?: boolean
          review_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_reports_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      review_votes: {
        Row: {
          created_at: string
          id: string
          review_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          review_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          review_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_votes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          admin_reply: string | null
          admin_reply_at: string | null
          body: string
          city: string | null
          country: string | null
          created_at: string
          helpful_count: number
          id: string
          is_verified: boolean
          photo_urls: string[]
          rating: number
          status: Database["public"]["Enums"]["review_status"]
          subject_key: string
          subject_name: string
          subject_type: Database["public"]["Enums"]["review_subject"]
          title: string | null
          traveler_type: Database["public"]["Enums"]["traveler_type"] | null
          trip_id: string | null
          updated_at: string
          user_id: string
          video_urls: string[]
        }
        Insert: {
          admin_reply?: string | null
          admin_reply_at?: string | null
          body: string
          city?: string | null
          country?: string | null
          created_at?: string
          helpful_count?: number
          id?: string
          is_verified?: boolean
          photo_urls?: string[]
          rating: number
          status?: Database["public"]["Enums"]["review_status"]
          subject_key: string
          subject_name: string
          subject_type: Database["public"]["Enums"]["review_subject"]
          title?: string | null
          traveler_type?: Database["public"]["Enums"]["traveler_type"] | null
          trip_id?: string | null
          updated_at?: string
          user_id: string
          video_urls?: string[]
        }
        Update: {
          admin_reply?: string | null
          admin_reply_at?: string | null
          body?: string
          city?: string | null
          country?: string | null
          created_at?: string
          helpful_count?: number
          id?: string
          is_verified?: boolean
          photo_urls?: string[]
          rating?: number
          status?: Database["public"]["Enums"]["review_status"]
          subject_key?: string
          subject_name?: string
          subject_type?: Database["public"]["Enums"]["review_subject"]
          title?: string | null
          traveler_type?: Database["public"]["Enums"]["traveler_type"] | null
          trip_id?: string | null
          updated_at?: string
          user_id?: string
          video_urls?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "reviews_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "saved_trips"
            referencedColumns: ["id"]
          },
        ]
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
      support_tickets: {
        Row: {
          body: string
          category: string
          created_at: string
          id: string
          status: Database["public"]["Enums"]["ticket_status"]
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          category?: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["ticket_status"]
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          category?: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["ticket_status"]
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ticket_messages: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          is_admin: boolean
          ticket_id: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          is_admin?: boolean
          ticket_id: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          is_admin?: boolean
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
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
      trip_invites: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          id: string
          invited_by: string
          role: Database["public"]["Enums"]["trip_member_role"]
          token: string
          trip_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          id?: string
          invited_by: string
          role?: Database["public"]["Enums"]["trip_member_role"]
          token?: string
          trip_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          id?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["trip_member_role"]
          token?: string
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_invites_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "saved_trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_members: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["trip_member_role"]
          trip_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["trip_member_role"]
          trip_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["trip_member_role"]
          trip_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_members_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "saved_trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_messages: {
        Row: {
          body: string
          created_at: string
          id: string
          trip_id: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          trip_id: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          trip_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_messages_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "saved_trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_vote_ballots: {
        Row: {
          created_at: string
          id: string
          option_index: number
          user_id: string
          vote_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          option_index: number
          user_id: string
          vote_id: string
        }
        Update: {
          created_at?: string
          id?: string
          option_index?: number
          user_id?: string
          vote_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_vote_ballots_vote_id_fkey"
            columns: ["vote_id"]
            isOneToOne: false
            referencedRelation: "trip_votes"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_votes: {
        Row: {
          closed: boolean
          created_at: string
          created_by: string
          id: string
          options: string[]
          question: string
          trip_id: string
        }
        Insert: {
          closed?: boolean
          created_at?: string
          created_by: string
          id?: string
          options: string[]
          question: string
          trip_id: string
        }
        Update: {
          closed?: boolean
          created_at?: string
          created_by?: string
          id?: string
          options?: string[]
          question?: string
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_votes_trip_id_fkey"
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
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          description: string
          id: string
          kind: Database["public"]["Enums"]["wallet_kind"]
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          description: string
          id?: string
          kind?: Database["public"]["Enums"]["wallet_kind"]
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          description?: string
          id?: string
          kind?: Database["public"]["Enums"]["wallet_kind"]
          user_id?: string
        }
        Relationships: []
      }
      wishlist_items: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          currency: string
          id: string
          image_url: string | null
          item_key: string
          item_type: Database["public"]["Enums"]["review_subject"]
          metadata: Json
          price_estimate: number | null
          subtitle: string | null
          title: string
          user_id: string
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          currency?: string
          id?: string
          image_url?: string | null
          item_key: string
          item_type: Database["public"]["Enums"]["review_subject"]
          metadata?: Json
          price_estimate?: number | null
          subtitle?: string | null
          title: string
          user_id: string
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          currency?: string
          id?: string
          image_url?: string | null
          item_key?: string
          item_type?: Database["public"]["Enums"]["review_subject"]
          metadata?: Json
          price_estimate?: number | null
          subtitle?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_trip_invite: { Args: { _token: string }; Returns: string }
      get_shared_collection: {
        Args: { _share_id: string }
        Returns: {
          cover_url: string
          description: string
          items: Json
          name: string
        }[]
      }
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
      is_trip_member: {
        Args: { _trip_id: string; _user_id: string }
        Returns: boolean
      }
      is_trip_owner: {
        Args: { _trip_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      review_status: "published" | "hidden" | "removed"
      review_subject:
        | "hotel"
        | "flight"
        | "activity"
        | "destination"
        | "restaurant"
      ticket_status: "open" | "pending" | "resolved" | "closed"
      traveler_type: "solo" | "couple" | "family" | "business"
      trip_member_role: "owner" | "editor" | "viewer"
      wallet_kind: "wallet" | "points" | "cashback" | "referral"
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
      review_status: ["published", "hidden", "removed"],
      review_subject: [
        "hotel",
        "flight",
        "activity",
        "destination",
        "restaurant",
      ],
      ticket_status: ["open", "pending", "resolved", "closed"],
      traveler_type: ["solo", "couple", "family", "business"],
      trip_member_role: ["owner", "editor", "viewer"],
      wallet_kind: ["wallet", "points", "cashback", "referral"],
    },
  },
} as const
