export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      food_portions: {
        Row: {
          amount: number;
          created_at: string;
          food_id: string;
          id: string;
          name: string;
          position: number;
          user_id: string;
        };
        Insert: {
          amount: number;
          created_at?: string;
          food_id: string;
          id?: string;
          name: string;
          position?: number;
          user_id?: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          food_id?: string;
          id?: string;
          name?: string;
          position?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "food_portions_food_id_user_id_fkey";
            columns: ["food_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "foods";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      foods: {
        Row: {
          added_sugar: number | null;
          archived: boolean;
          base: Database["public"]["Enums"]["food_base"];
          base_amount: number;
          brand: string | null;
          calcium: number | null;
          carbs: number | null;
          category: string | null;
          created_at: string;
          fat: number | null;
          favorite: boolean;
          fiber: number | null;
          id: string;
          iron: number | null;
          kcal: number | null;
          name: string;
          notes: string | null;
          potassium: number | null;
          protein: number | null;
          sat_fat: number | null;
          sodium: number | null;
          sugar: number | null;
          trans_fat: number | null;
          updated_at: string;
          user_id: string;
          vit_c: number | null;
        };
        Insert: {
          added_sugar?: number | null;
          archived?: boolean;
          base: Database["public"]["Enums"]["food_base"];
          base_amount?: number;
          brand?: string | null;
          calcium?: number | null;
          carbs?: number | null;
          category?: string | null;
          created_at?: string;
          fat?: number | null;
          favorite?: boolean;
          fiber?: number | null;
          id?: string;
          iron?: number | null;
          kcal?: number | null;
          name: string;
          notes?: string | null;
          potassium?: number | null;
          protein?: number | null;
          sat_fat?: number | null;
          sodium?: number | null;
          sugar?: number | null;
          trans_fat?: number | null;
          updated_at?: string;
          user_id?: string;
          vit_c?: number | null;
        };
        Update: {
          added_sugar?: number | null;
          archived?: boolean;
          base?: Database["public"]["Enums"]["food_base"];
          base_amount?: number;
          brand?: string | null;
          calcium?: number | null;
          carbs?: number | null;
          category?: string | null;
          created_at?: string;
          fat?: number | null;
          favorite?: boolean;
          fiber?: number | null;
          id?: string;
          iron?: number | null;
          kcal?: number | null;
          name?: string;
          notes?: string | null;
          potassium?: number | null;
          protein?: number | null;
          sat_fat?: number | null;
          sodium?: number | null;
          sugar?: number | null;
          trans_fat?: number | null;
          updated_at?: string;
          user_id?: string;
          vit_c?: number | null;
        };
        Relationships: [];
      };
      goal_targets: {
        Row: {
          kind: Database["public"]["Enums"]["goal_kind"];
          nutrient: Database["public"]["Enums"]["nutrient_key"];
          user_id: string;
          value: number;
          version_id: string;
        };
        Insert: {
          kind: Database["public"]["Enums"]["goal_kind"];
          nutrient: Database["public"]["Enums"]["nutrient_key"];
          user_id?: string;
          value: number;
          version_id: string;
        };
        Update: {
          kind?: Database["public"]["Enums"]["goal_kind"];
          nutrient?: Database["public"]["Enums"]["nutrient_key"];
          user_id?: string;
          value?: number;
          version_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "goal_targets_version_id_user_id_fkey";
            columns: ["version_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "goal_versions";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      goal_versions: {
        Row: {
          created_at: string;
          id: string;
          start_date: string;
          updated_at: string;
          user_id: string;
          water_ml: number | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          start_date: string;
          updated_at?: string;
          user_id?: string;
          water_ml?: number | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          start_date?: string;
          updated_at?: string;
          user_id?: string;
          water_ml?: number | null;
        };
        Relationships: [];
      };
      meal_items: {
        Row: {
          added_sugar: number | null;
          amount: number;
          base: Database["public"]["Enums"]["food_base"];
          calcium: number | null;
          carbs: number | null;
          created_at: string;
          fat: number | null;
          fiber: number | null;
          food_brand: string | null;
          food_id: string;
          food_name: string;
          id: string;
          iron: number | null;
          kcal: number | null;
          meal_id: string;
          portion_amount: number | null;
          portion_count: number | null;
          portion_name: string | null;
          position: number;
          potassium: number | null;
          protein: number | null;
          sat_fat: number | null;
          sodium: number | null;
          sugar: number | null;
          trans_fat: number | null;
          updated_at: string;
          user_id: string;
          vit_c: number | null;
        };
        Insert: {
          added_sugar?: number | null;
          amount: number;
          base: Database["public"]["Enums"]["food_base"];
          calcium?: number | null;
          carbs?: number | null;
          created_at?: string;
          fat?: number | null;
          fiber?: number | null;
          food_brand?: string | null;
          food_id: string;
          food_name: string;
          id?: string;
          iron?: number | null;
          kcal?: number | null;
          meal_id: string;
          portion_amount?: number | null;
          portion_count?: number | null;
          portion_name?: string | null;
          position?: number;
          potassium?: number | null;
          protein?: number | null;
          sat_fat?: number | null;
          sodium?: number | null;
          sugar?: number | null;
          trans_fat?: number | null;
          updated_at?: string;
          user_id?: string;
          vit_c?: number | null;
        };
        Update: {
          added_sugar?: number | null;
          amount?: number;
          base?: Database["public"]["Enums"]["food_base"];
          calcium?: number | null;
          carbs?: number | null;
          created_at?: string;
          fat?: number | null;
          fiber?: number | null;
          food_brand?: string | null;
          food_id?: string;
          food_name?: string;
          id?: string;
          iron?: number | null;
          kcal?: number | null;
          meal_id?: string;
          portion_amount?: number | null;
          portion_count?: number | null;
          portion_name?: string | null;
          position?: number;
          potassium?: number | null;
          protein?: number | null;
          sat_fat?: number | null;
          sodium?: number | null;
          sugar?: number | null;
          trans_fat?: number | null;
          updated_at?: string;
          user_id?: string;
          vit_c?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "meal_items_food_id_user_id_fkey";
            columns: ["food_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "foods";
            referencedColumns: ["id", "user_id"];
          },
          {
            foreignKeyName: "meal_items_meal_id_user_id_fkey";
            columns: ["meal_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "meals";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      meals: {
        Row: {
          created_at: string;
          date: string;
          id: string;
          name: string;
          notes: string | null;
          position: number;
          time: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          date: string;
          id?: string;
          name: string;
          notes?: string | null;
          position?: number;
          time?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          date?: string;
          id?: string;
          name?: string;
          notes?: string | null;
          position?: number;
          time?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          activity_level: Database["public"]["Enums"]["activity_level"] | null;
          birth_date: string | null;
          created_at: string;
          height_cm: number | null;
          name: string;
          objective: Database["public"]["Enums"]["objective"] | null;
          timezone: string;
          updated_at: string;
          user_id: string;
          weight_kg: number | null;
        };
        Insert: {
          activity_level?: Database["public"]["Enums"]["activity_level"] | null;
          birth_date?: string | null;
          created_at?: string;
          height_cm?: number | null;
          name?: string;
          objective?: Database["public"]["Enums"]["objective"] | null;
          timezone?: string;
          updated_at?: string;
          user_id: string;
          weight_kg?: number | null;
        };
        Update: {
          activity_level?: Database["public"]["Enums"]["activity_level"] | null;
          birth_date?: string | null;
          created_at?: string;
          height_cm?: number | null;
          name?: string;
          objective?: Database["public"]["Enums"]["objective"] | null;
          timezone?: string;
          updated_at?: string;
          user_id?: string;
          weight_kg?: number | null;
        };
        Relationships: [];
      };
      water_entries: {
        Row: {
          created_at: string;
          date: string;
          id: string;
          ml: number;
          time: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          date: string;
          id?: string;
          ml: number;
          time?: string | null;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          date?: string;
          id?: string;
          ml?: number;
          time?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      add_meal_item: {
        Args: {
          p_amount: number;
          p_date: string;
          p_food_id: string;
          p_meal_name: string;
          p_portion_amount?: number;
          p_portion_count?: number;
          p_portion_name?: string;
        };
        Returns: string;
      };
      create_meal: {
        Args: {
          p_date: string;
          p_name: string;
          p_notes?: string;
          p_time?: string;
        };
        Returns: {
          created_at: string;
          date: string;
          id: string;
          name: string;
          notes: string | null;
          position: number;
          time: string | null;
          updated_at: string;
          user_id: string;
        };
        SetofOptions: {
          from: "*";
          to: "meals";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      delete_account: { Args: never; Returns: undefined };
      duplicate_meal: {
        Args: { p_meal_id: string; p_target_date: string };
        Returns: {
          created_at: string;
          date: string;
          id: string;
          name: string;
          notes: string | null;
          position: number;
          time: string | null;
          updated_at: string;
          user_id: string;
        };
        SetofOptions: {
          from: "*";
          to: "meals";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      move_meal: {
        Args: { p_direction: string; p_meal_id: string };
        Returns: undefined;
      };
      move_meal_item: {
        Args: {
          p_item_id: string;
          p_target_date?: string;
          p_target_meal_id?: string;
          p_target_meal_name?: string;
        };
        Returns: string;
      };
      save_goal_version: {
        Args: { p_goals: Json; p_start_date: string; p_water_ml?: number };
        Returns: {
          replaced: boolean;
          version_id: string;
        }[];
      };
    };
    Enums: {
      activity_level: "sedentary" | "light" | "moderate" | "active" | "very-active";
      food_base: "g" | "ml";
      goal_kind: "target" | "limit";
      nutrient_key:
        | "kcal"
        | "protein"
        | "carbs"
        | "fat"
        | "sat_fat"
        | "trans_fat"
        | "fiber"
        | "sugar"
        | "added_sugar"
        | "sodium"
        | "calcium"
        | "iron"
        | "potassium"
        | "vit_c";
      objective: "maintain" | "lose" | "gain" | "track";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    keyof (DefaultSchema["Tables"] & DefaultSchema["Views"]) | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      activity_level: ["sedentary", "light", "moderate", "active", "very-active"],
      food_base: ["g", "ml"],
      goal_kind: ["target", "limit"],
      nutrient_key: [
        "kcal",
        "protein",
        "carbs",
        "fat",
        "sat_fat",
        "trans_fat",
        "fiber",
        "sugar",
        "added_sugar",
        "sodium",
        "calcium",
        "iron",
        "potassium",
        "vit_c",
      ],
      objective: ["maintain", "lose", "gain", "track"],
    },
  },
} as const;
