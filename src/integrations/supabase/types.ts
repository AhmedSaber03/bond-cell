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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      products: {
        Row: {
          created_at: string
          description: string | null
          details: Json | null
          id: string
          images: string[] | null
          in_stock: boolean | null
          manufacturer: string | null
          name: string
          specifications: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          details?: Json | null
          id?: string
          images?: string[] | null
          in_stock?: boolean | null
          manufacturer?: string | null
          name: string
          specifications?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          details?: Json | null
          id?: string
          images?: string[] | null
          in_stock?: boolean | null
          manufacturer?: string | null
          name?: string
          specifications?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      serial_numbers: {
        Row: {
          created_at: string
          id: string
          is_verified: boolean | null
          password_hash: string
          product_id: string
          serial_number: string
          session_expires_at: string | null
          verification_city: string | null
          verification_country: string | null
          verification_ip: string | null
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_verified?: boolean | null
          password_hash: string
          product_id: string
          serial_number: string
          session_expires_at?: string | null
          verification_city?: string | null
          verification_country?: string | null
          verification_ip?: string | null
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_verified?: boolean | null
          password_hash?: string
          product_id?: string
          serial_number?: string
          session_expires_at?: string | null
          verification_city?: string | null
          verification_country?: string | null
          verification_ip?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "serial_numbers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      faqs: {
        Row: {
          answer: string
          category: string
          created_at: string
          id: string
          is_published: boolean
          question: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          answer: string
          category: string
          created_at?: string
          id?: string
          is_published?: boolean
          question: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          answer?: string
          category?: string
          created_at?: string
          id?: string
          is_published?: boolean
          question?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      stock_requests: {
        Row: {
          created_at: string
          customer_name: string
          id: string
          phone_number: string
          product_id: string
          quantity: number
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_name: string
          id?: string
          phone_number: string
          product_id: string
          quantity?: number
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_name?: string
          id?: string
          phone_number?: string
          product_id?: string
          quantity?: number
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_requests_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      verification_logs: {
        Row: {
          action: string
          city: string | null
          country: string | null
          created_at: string
          id: string
          ip_address: string | null
          serial_number_id: string
          user_agent: string | null
        }
        Insert: {
          action: string
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          serial_number_id: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          serial_number_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verification_logs_serial_number_id_fkey"
            columns: ["serial_number_id"]
            isOneToOne: false
            referencedRelation: "serial_numbers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_logs_serial_number_id_fkey"
            columns: ["serial_number_id"]
            isOneToOne: false
            referencedRelation: "serial_numbers_public"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      serial_numbers_public: {
        Row: {
          created_at: string | null
          id: string | null
          is_verified: boolean | null
          product_id: string | null
          serial_number: string | null
          session_expires_at: string | null
          verification_city: string | null
          verification_country: string | null
          verified_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          is_verified?: boolean | null
          product_id?: string | null
          serial_number?: string | null
          session_expires_at?: string | null
          verification_city?: string | null
          verification_country?: string | null
          verified_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          is_verified?: boolean | null
          product_id?: string | null
          serial_number?: string | null
          session_expires_at?: string | null
          verification_city?: string | null
          verification_country?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "serial_numbers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      generate_serial_numbers: {
        Args: { _count?: number; _product_id: string }
        Returns: {
          raw_password: string
          serial_number: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      log_verification: {
        Args: {
          _action: string
          _city?: string
          _country?: string
          _ip_address?: string
          _serial_number_id: string
          _user_agent?: string
        }
        Returns: string
      }
      verify_product: {
        Args: {
          _city?: string
          _country?: string
          _ip_address?: string
          _password: string
          _serial_number: string
          _user_agent?: string
        }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "user" | "super_admin"
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
      app_role: ["admin", "user", "super_admin"],
    },
  },
} as const
