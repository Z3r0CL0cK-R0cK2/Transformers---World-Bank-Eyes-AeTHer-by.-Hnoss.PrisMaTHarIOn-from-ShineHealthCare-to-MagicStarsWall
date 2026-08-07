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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      api_keys: {
        Row: {
          created_at: string
          id: string
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          revoked: boolean
          scopes: string[]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          revoked?: boolean
          scopes?: string[]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          revoked?: boolean
          scopes?: string[]
          user_id?: string
        }
        Relationships: []
      }
      badges: {
        Row: {
          application_id: string | null
          badge_type: string
          created_at: string
          id: string
          label: string
          slug: string
          status: string
          user_id: string
        }
        Insert: {
          application_id?: string | null
          badge_type: string
          created_at?: string
          id?: string
          label: string
          slug: string
          status?: string
          user_id: string
        }
        Update: {
          application_id?: string | null
          badge_type?: string
          created_at?: string
          id?: string
          label?: string
          slug?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "badges_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "partner_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      canvas_nodes: {
        Row: {
          catalog_item_id: string | null
          created_at: string
          id: string
          links: string[]
          node_type: string
          note: string
          pos_x: number
          pos_y: number
          status: string
          tier: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          catalog_item_id?: string | null
          created_at?: string
          id?: string
          links?: string[]
          node_type?: string
          note?: string
          pos_x?: number
          pos_y?: number
          status?: string
          tier?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          catalog_item_id?: string | null
          created_at?: string
          id?: string
          links?: string[]
          node_type?: string
          note?: string
          pos_x?: number
          pos_y?: number
          status?: string
          tier?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "canvas_nodes_catalog_item_id_fkey"
            columns: ["catalog_item_id"]
            isOneToOne: false
            referencedRelation: "catalog_items"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_items: {
        Row: {
          category: string
          created_at: string
          description: string
          docker_compose: string | null
          docs_url: string | null
          id: string
          install_command: string | null
          kind: string
          mcp_config: Json | null
          name: string
          slug: string
          tech_stack: string[]
          vendor: string | null
          verified: boolean
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          docker_compose?: string | null
          docs_url?: string | null
          id?: string
          install_command?: string | null
          kind: string
          mcp_config?: Json | null
          name: string
          slug: string
          tech_stack?: string[]
          vendor?: string | null
          verified?: boolean
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          docker_compose?: string | null
          docs_url?: string | null
          id?: string
          install_command?: string | null
          kind?: string
          mcp_config?: Json | null
          name?: string
          slug?: string
          tech_stack?: string[]
          vendor?: string | null
          verified?: boolean
        }
        Relationships: []
      }
      deployments: {
        Row: {
          commit_sha: string | null
          created_at: string
          environment: string
          id: string
          log: string
          repository_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          commit_sha?: string | null
          created_at?: string
          environment?: string
          id?: string
          log?: string
          repository_id?: string | null
          status?: string
          user_id: string
        }
        Update: {
          commit_sha?: string | null
          created_at?: string
          environment?: string
          id?: string
          log?: string
          repository_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deployments_repository_id_fkey"
            columns: ["repository_id"]
            isOneToOne: false
            referencedRelation: "repositories"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_applications: {
        Row: {
          checks: Json
          company_name: string
          contact_email: string
          created_at: string
          id: string
          repo_url: string | null
          score: number
          solution_description: string
          solution_name: string
          status: string
          updated_at: string
          user_id: string
          website: string
        }
        Insert: {
          checks?: Json
          company_name: string
          contact_email: string
          created_at?: string
          id?: string
          repo_url?: string | null
          score?: number
          solution_description: string
          solution_name: string
          status?: string
          updated_at?: string
          user_id: string
          website: string
        }
        Update: {
          checks?: Json
          company_name?: string
          contact_email?: string
          created_at?: string
          id?: string
          repo_url?: string | null
          score?: number
          solution_description?: string
          solution_name?: string
          status?: string
          updated_at?: string
          user_id?: string
          website?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      repositories: {
        Row: {
          created_at: string
          default_branch: string
          full_name: string
          id: string
          provider: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          default_branch?: string
          full_name: string
          id?: string
          provider?: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          default_branch?: string
          full_name?: string
          id?: string
          provider?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      timeline_events: {
        Row: {
          created_at: string
          detail: string
          id: string
          label: string
          phase: string
          severity: string
          user_id: string
        }
        Insert: {
          created_at?: string
          detail?: string
          id?: string
          label: string
          phase?: string
          severity?: string
          user_id: string
        }
        Update: {
          created_at?: string
          detail?: string
          id?: string
          label?: string
          phase?: string
          severity?: string
          user_id?: string
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
      app_role: "user" | "partner" | "admin"
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
      app_role: ["user", "partner", "admin"],
    },
  },
} as const
