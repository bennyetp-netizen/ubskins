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
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
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
          buff_purchased_at: string | null
          created_at: string
          deposit_amount: number | null
          deposit_paid: boolean
          email: string | null
          exact_float_request: string | null
          float_preference: string | null
          float_value: number | null
          id: string
          order_number: string | null
          payment_confirmed: boolean
          payment_method: string
          payment_reference: string | null
          phone: string | null
          price_adjustment_pct: number
          price_mnt: number
          product_type: string
          qpay_invoice_id: string | null
          qpay_qr_image: string | null
          qpay_qr_text: string | null
          qpay_remaining_invoice_id: string | null
          qpay_remaining_qr_image: string | null
          qpay_remaining_qr_text: string | null
          remaining_amount: number | null
          remaining_paid: boolean
          skin_id: string
          skin_image: string | null
          skin_name: string
          status: string
          sticker_request: string | null
          trade_hold_until: string | null
          trade_offer_id: string | null
          trade_url: string | null
          updated_at: string
          user_id: string
          wear: string | null
        }
        Insert: {
          buff_purchased_at?: string | null
          created_at?: string
          deposit_amount?: number | null
          deposit_paid?: boolean
          email?: string | null
          exact_float_request?: string | null
          float_preference?: string | null
          float_value?: number | null
          id?: string
          order_number?: string | null
          payment_confirmed?: boolean
          payment_method: string
          payment_reference?: string | null
          phone?: string | null
          price_adjustment_pct?: number
          price_mnt: number
          product_type?: string
          qpay_invoice_id?: string | null
          qpay_qr_image?: string | null
          qpay_qr_text?: string | null
          qpay_remaining_invoice_id?: string | null
          qpay_remaining_qr_image?: string | null
          qpay_remaining_qr_text?: string | null
          remaining_amount?: number | null
          remaining_paid?: boolean
          skin_id: string
          skin_image?: string | null
          skin_name: string
          status?: string
          sticker_request?: string | null
          trade_hold_until?: string | null
          trade_offer_id?: string | null
          trade_url?: string | null
          updated_at?: string
          user_id: string
          wear?: string | null
        }
        Update: {
          buff_purchased_at?: string | null
          created_at?: string
          deposit_amount?: number | null
          deposit_paid?: boolean
          email?: string | null
          exact_float_request?: string | null
          float_preference?: string | null
          float_value?: number | null
          id?: string
          order_number?: string | null
          payment_confirmed?: boolean
          payment_method?: string
          payment_reference?: string | null
          phone?: string | null
          price_adjustment_pct?: number
          price_mnt?: number
          product_type?: string
          qpay_invoice_id?: string | null
          qpay_qr_image?: string | null
          qpay_qr_text?: string | null
          qpay_remaining_invoice_id?: string | null
          qpay_remaining_qr_image?: string | null
          qpay_remaining_qr_text?: string | null
          remaining_amount?: number | null
          remaining_paid?: boolean
          skin_id?: string
          skin_image?: string | null
          skin_name?: string
          status?: string
          sticker_request?: string | null
          trade_hold_until?: string | null
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
      skin_costs: {
        Row: {
          cost_price_mnt: number
          created_at: string
          skin_id: string
          updated_at: string
        }
        Insert: {
          cost_price_mnt: number
          created_at?: string
          skin_id: string
          updated_at?: string
        }
        Update: {
          cost_price_mnt?: number
          created_at?: string
          skin_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "skin_costs_skin_id_fkey"
            columns: ["skin_id"]
            isOneToOne: true
            referencedRelation: "skins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skin_costs_skin_id_fkey"
            columns: ["skin_id"]
            isOneToOne: true
            referencedRelation: "skins_public"
            referencedColumns: ["id"]
          },
        ]
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
          product_type: string
          rarity: string | null
          stattrak: boolean
          stock: number
          stock_quantity: number
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
          product_type?: string
          rarity?: string | null
          stattrak?: boolean
          stock?: number
          stock_quantity?: number
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
          product_type?: string
          rarity?: string | null
          stattrak?: boolean
          stock?: number
          stock_quantity?: number
          updated_at?: string
          weapon?: string
          weapon_type?: string | null
          wear?: string | null
        }
        Relationships: []
      }
      sms_logs: {
        Row: {
          created_at: string
          id: string
          matched_action: string | null
          matched_order_id: string | null
          parsed_amount: number | null
          parsed_reference: string | null
          raw_text: string
          source_ip: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          matched_action?: string | null
          matched_order_id?: string | null
          parsed_amount?: number | null
          parsed_reference?: string | null
          raw_text: string
          source_ip?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          matched_action?: string | null
          matched_order_id?: string | null
          parsed_amount?: number | null
          parsed_reference?: string | null
          raw_text?: string
          source_ip?: string | null
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
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
      skins_public: {
        Row: {
          created_at: string | null
          description: string | null
          float_value: number | null
          game: string | null
          id: string | null
          image_url: string | null
          is_active: boolean | null
          is_available: boolean | null
          is_featured: boolean | null
          last_synced_at: string | null
          name: string | null
          price_mnt: number | null
          product_type: string | null
          rarity: string | null
          stattrak: boolean | null
          stock: number | null
          stock_quantity: number | null
          weapon: string | null
          weapon_type: string | null
          wear: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          float_value?: number | null
          game?: string | null
          id?: string | null
          image_url?: string | null
          is_active?: boolean | null
          is_available?: boolean | null
          is_featured?: boolean | null
          last_synced_at?: string | null
          name?: string | null
          price_mnt?: number | null
          product_type?: string | null
          rarity?: string | null
          stattrak?: boolean | null
          stock?: number | null
          stock_quantity?: number | null
          weapon?: string | null
          weapon_type?: string | null
          wear?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          float_value?: number | null
          game?: string | null
          id?: string | null
          image_url?: string | null
          is_active?: boolean | null
          is_available?: boolean | null
          is_featured?: boolean | null
          last_synced_at?: string | null
          name?: string | null
          price_mnt?: number | null
          product_type?: string | null
          rarity?: string | null
          stattrak?: boolean | null
          stock?: number | null
          stock_quantity?: number | null
          weapon?: string | null
          weapon_type?: string | null
          wear?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
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
