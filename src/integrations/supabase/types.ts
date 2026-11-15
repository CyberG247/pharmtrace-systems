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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      batches: {
        Row: {
          batch_number: string
          created_at: string
          expiry_date: string
          gtin: string
          id: string
          organization_id: string
          product_id: string
          serial_number: string
          state: Database["public"]["Enums"]["batch_state"]
        }
        Insert: {
          batch_number: string
          created_at?: string
          expiry_date: string
          gtin: string
          id?: string
          organization_id: string
          product_id: string
          serial_number: string
          state?: Database["public"]["Enums"]["batch_state"]
        }
        Update: {
          batch_number?: string
          created_at?: string
          expiry_date?: string
          gtin?: string
          id?: string
          organization_id?: string
          product_id?: string
          serial_number?: string
          state?: Database["public"]["Enums"]["batch_state"]
        }
        Relationships: [
          {
            foreignKeyName: "batches_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batches_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          buyer_organization_id: string
          created_at: string
          id: string
          product_id: string
          quantity: number
          status: string
          supplier_organization_id: string
          unit_price_at_order: number
        }
        Insert: {
          buyer_organization_id: string
          created_at?: string
          id?: string
          product_id: string
          quantity: number
          status?: string
          supplier_organization_id: string
          unit_price_at_order: number
        }
        Update: {
          buyer_organization_id?: string
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          status?: string
          supplier_organization_id?: string
          unit_price_at_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "orders_buyer_organization_id_fkey"
            columns: ["buyer_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_supplier_organization_id_fkey"
            columns: ["supplier_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          created_by: string
          id: string
          license_number: string
          name: string
          state: string
          type: Database["public"]["Enums"]["organization_type"]
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          license_number?: string
          name: string
          state?: string
          type: Database["public"]["Enums"]["organization_type"]
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          license_number?: string
          name?: string
          state?: string
          type?: Database["public"]["Enums"]["organization_type"]
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string
          created_at: string
          currency: string
          gtin: string
          id: string
          inventory: number
          name: string
          organization_id: string
          published: boolean
          unit_price: number
        }
        Insert: {
          category?: string
          created_at?: string
          currency?: string
          gtin: string
          id?: string
          inventory?: number
          name: string
          organization_id: string
          published?: boolean
          unit_price?: number
        }
        Update: {
          category?: string
          created_at?: string
          currency?: string
          gtin?: string
          id?: string
          inventory?: number
          name?: string
          organization_id?: string
          published?: boolean
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "products_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string
          full_name?: string
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      supply_events: {
        Row: {
          actor_organization_id: string | null
          batch_id: string
          event_type: Database["public"]["Enums"]["supply_event_type"]
          id: string
          location: string
          notes: string
          occurred_at: string
          organization_id: string
          performed_by: string
        }
        Insert: {
          actor_organization_id?: string | null
          batch_id: string
          event_type: Database["public"]["Enums"]["supply_event_type"]
          id?: string
          location?: string
          notes?: string
          occurred_at?: string
          organization_id: string
          performed_by: string
        }
        Update: {
          actor_organization_id?: string | null
          batch_id?: string
          event_type?: Database["public"]["Enums"]["supply_event_type"]
          id?: string
          location?: string
          notes?: string
          occurred_at?: string
          organization_id?: string
          performed_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "supply_events_actor_organization_id_fkey"
            columns: ["actor_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supply_events_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supply_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          organization_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id?: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_global_role: {
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      has_org_role: {
        Args: {
          _organization_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      is_org_member: { Args: { _organization_id: string }; Returns: boolean }
      verify_product_serial: {
        Args: { _serial_number: string }
        Returns: {
          batch_number: string
          batch_state: Database["public"]["Enums"]["batch_state"]
          expiry_date: string
          is_authentic: boolean
          product_name: string
          supplier_name: string
        }[]
      }
    }
    Enums: {
      app_role: "super_admin" | "manufacturer" | "pharmacy" | "regulator"
      batch_state: "active" | "quarantined" | "recalled"
      organization_type: "manufacturer" | "distributor" | "pharmacy"
      supply_event_type: "commissioning" | "packing" | "shipping" | "receiving"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["super_admin", "manufacturer", "pharmacy", "regulator"],
      batch_state: ["active", "quarantined", "recalled"],
      organization_type: ["manufacturer", "distributor", "pharmacy"],
      supply_event_type: ["commissioning", "packing", "shipping", "receiving"],
    },
  },
} as const
