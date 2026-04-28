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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      exchange_rates: {
        Row: {
          base: string
          id: string
          quote: string
          rate: number
          source: string | null
          updated_at: string
        }
        Insert: {
          base: string
          id?: string
          quote: string
          rate: number
          source?: string | null
          updated_at?: string
        }
        Update: {
          base?: string
          id?: string
          quote?: string
          rate?: number
          source?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          float_value: number | null
          id: string
          payment_method: string
          payment_reference: string | null
          phone: string | null
          price_mnt: number
          skin_id: string
          skin_image: string | null
          skin_name: string
          status: string
          trade_offer_id: string | null
          trade_url: string | null
          updated_at: string
          user_id: string
          wear: string | null
        }
        Insert: {
          created_at?: string
          float_value?: number | null
          id?: string
          payment_method: string
          payment_reference?: string | null
          phone?: string | null
          price_mnt: number
          skin_id: string
          skin_image?: string | null
          skin_name: string
          status?: string
          trade_offer_id?: string | null
          trade_url?: string | null
          updated_at?: string
          user_id: string
          wear?: string | null
        }
        Update: {
          created_at?: string
          float_value?: number | null
          id?: string
          payment_method?: string
          payment_reference?: string | null
          phone?: string | null
          price_mnt?: number
          skin_id?: string
          skin_image?: string | null
          skin_name?: string
          status?: string
          trade_offer_id?: string | null
          trade_url?: string | null
          updated_at?: string
          user_id?: string
          wear?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          profile_url: string | null
          steam_id: string | null
          trade_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          profile_url?: string | null
          steam_id?: string | null
          trade_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          profile_url?: string | null
          steam_id?: string | null
          trade_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      skins: {
        Row: {
          buff_id: string | null
          buff_price_cny: number | null
          created_at: string
          description: string | null
          float_value: number | null
          game: string
          id: string
          image_url: string | null
          is_active: boolean
          is_available: boolean
          is_featured: boolean
          last_synced_at: string | null
          name: string
          price_mnt: number
          rarity: string | null
          stattrak: boolean
          stock: number
          updated_at: string
          weapon: string
          weapon_type: string | null
          wear: string | null
        }
        Insert: {
          buff_id?: string | null
          buff_price_cny?: number | null
          created_at?: string
          description?: string | null
          float_value?: number | null
          game?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_available?: boolean
          is_featured?: boolean
          last_synced_at?: string | null
          name: string
          price_mnt: number
          rarity?: string | null
          stattrak?: boolean
          stock?: number
          updated_at?: string
          weapon: string
          weapon_type?: string | null
          wear?: string | null
        }
        Update: {
          buff_id?: string | null
          buff_price_cny?: number | null
          created_at?: string
          description?: string | null
          float_value?: number | null
          game?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_available?: boolean
          is_featured?: boolean
          last_synced_at?: string | null
          name?: string
          price_mnt?: number
          rarity?: string | null
          stattrak?: boolean
          stock?: number
          updated_at?: string
          weapon?: string
          weapon_type?: string | null
          wear?: string | null
        }
        Relationships: []
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
