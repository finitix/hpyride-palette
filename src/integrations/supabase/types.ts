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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          alternate_phone: string | null
          created_at: string
          driver_id: string
          drop_lat: number | null
          drop_lng: number | null
          drop_location: string | null
          id: string
          notes: string | null
          passenger_name: string
          passenger_phone: string
          payment_method: string | null
          pickup_lat: number | null
          pickup_lng: number | null
          pickup_location: string | null
          rejection_reason: string | null
          ride_id: string
          seats_booked: number
          status: Database["public"]["Enums"]["booking_status"] | null
          total_fare: number
          updated_at: string
          user_id: string
        }
        Insert: {
          alternate_phone?: string | null
          created_at?: string
          driver_id: string
          drop_lat?: number | null
          drop_lng?: number | null
          drop_location?: string | null
          id?: string
          notes?: string | null
          passenger_name: string
          passenger_phone: string
          payment_method?: string | null
          pickup_lat?: number | null
          pickup_lng?: number | null
          pickup_location?: string | null
          rejection_reason?: string | null
          ride_id: string
          seats_booked?: number
          status?: Database["public"]["Enums"]["booking_status"] | null
          total_fare: number
          updated_at?: string
          user_id: string
        }
        Update: {
          alternate_phone?: string | null
          created_at?: string
          driver_id?: string
          drop_lat?: number | null
          drop_lng?: number | null
          drop_location?: string | null
          id?: string
          notes?: string | null
          passenger_name?: string
          passenger_phone?: string
          payment_method?: string | null
          pickup_lat?: number | null
          pickup_lng?: number | null
          pickup_location?: string | null
          rejection_reason?: string | null
          ride_id?: string
          seats_booked?: number
          status?: Database["public"]["Enums"]["booking_status"] | null
          total_fare?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          booking_id: string
          created_at: string
          id: string
          message: string
          sender_id: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          id?: string
          message: string
          sender_id: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          id?: string
          message?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_verifications: {
        Row: {
          created_at: string
          dl_back_url: string | null
          dl_front_url: string | null
          dl_number: string | null
          id: string
          rejection_reason: string | null
          status: Database["public"]["Enums"]["verification_status"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dl_back_url?: string | null
          dl_front_url?: string | null
          dl_number?: string | null
          id?: string
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["verification_status"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dl_back_url?: string | null
          dl_front_url?: string | null
          dl_number?: string | null
          id?: string
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["verification_status"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          data: Json | null
          id: string
          is_read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          gender: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string
          comment: string | null
          created_at: string
          driver_id: string
          id: string
          rating: number
          reviewer_id: string
          ride_id: string
        }
        Insert: {
          booking_id: string
          comment?: string | null
          created_at?: string
          driver_id: string
          id?: string
          rating: number
          reviewer_id: string
          ride_id: string
        }
        Update: {
          booking_id?: string
          comment?: string | null
          created_at?: string
          driver_id?: string
          id?: string
          rating?: number
          reviewer_id?: string
          ride_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      rides: {
        Row: {
          created_at: string
          distance_km: number | null
          drop_lat: number
          drop_lng: number
          drop_location: string
          duration_minutes: number | null
          female_only: boolean | null
          has_ac: boolean | null
          id: string
          luggage_allowed: boolean | null
          music_allowed: boolean | null
          pickup_flexibility: string | null
          pickup_lat: number
          pickup_lng: number
          pickup_location: string
          price_per_km: number
          ride_date: string
          ride_time: string
          route_polyline: string | null
          route_type: string | null
          seats_available: number
          status: Database["public"]["Enums"]["ride_status"] | null
          total_price: number | null
          updated_at: string
          user_id: string
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string
          distance_km?: number | null
          drop_lat: number
          drop_lng: number
          drop_location: string
          duration_minutes?: number | null
          female_only?: boolean | null
          has_ac?: boolean | null
          id?: string
          luggage_allowed?: boolean | null
          music_allowed?: boolean | null
          pickup_flexibility?: string | null
          pickup_lat: number
          pickup_lng: number
          pickup_location: string
          price_per_km: number
          ride_date: string
          ride_time: string
          route_polyline?: string | null
          route_type?: string | null
          seats_available?: number
          status?: Database["public"]["Enums"]["ride_status"] | null
          total_price?: number | null
          updated_at?: string
          user_id: string
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string
          distance_km?: number | null
          drop_lat?: number
          drop_lng?: number
          drop_location?: string
          duration_minutes?: number | null
          female_only?: boolean | null
          has_ac?: boolean | null
          id?: string
          luggage_allowed?: boolean | null
          music_allowed?: boolean | null
          pickup_flexibility?: string | null
          pickup_lat?: number
          pickup_lng?: number
          pickup_location?: string
          price_per_km?: number
          ride_date?: string
          ride_time?: string
          route_polyline?: string | null
          route_type?: string | null
          seats_available?: number
          status?: Database["public"]["Enums"]["ride_status"] | null
          total_price?: number | null
          updated_at?: string
          user_id?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rides_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          category: Database["public"]["Enums"]["vehicle_category"]
          created_at: string
          front_image_url: string | null
          has_ac: boolean | null
          id: string
          insurance_url: string | null
          is_verified: boolean | null
          model: string | null
          name: string
          number: string
          pollution_url: string | null
          rc_book_url: string | null
          rear_image_url: string | null
          seats: number | null
          side_image_url: string | null
          updated_at: string
          user_id: string
          vehicle_type: Database["public"]["Enums"]["vehicle_type"]
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Insert: {
          category: Database["public"]["Enums"]["vehicle_category"]
          created_at?: string
          front_image_url?: string | null
          has_ac?: boolean | null
          id?: string
          insurance_url?: string | null
          is_verified?: boolean | null
          model?: string | null
          name: string
          number: string
          pollution_url?: string | null
          rc_book_url?: string | null
          rear_image_url?: string | null
          seats?: number | null
          side_image_url?: string | null
          updated_at?: string
          user_id: string
          vehicle_type: Database["public"]["Enums"]["vehicle_type"]
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Update: {
          category?: Database["public"]["Enums"]["vehicle_category"]
          created_at?: string
          front_image_url?: string | null
          has_ac?: boolean | null
          id?: string
          insurance_url?: string | null
          is_verified?: boolean | null
          model?: string | null
          name?: string
          number?: string
          pollution_url?: string | null
          rc_book_url?: string | null
          rear_image_url?: string | null
          seats?: number | null
          side_image_url?: string | null
          updated_at?: string
          user_id?: string
          vehicle_type?: Database["public"]["Enums"]["vehicle_type"]
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      booking_status:
        | "pending"
        | "confirmed"
        | "rejected"
        | "completed"
        | "cancelled"
      ride_status:
        | "pending"
        | "verified"
        | "published"
        | "completed"
        | "cancelled"
      vehicle_category:
        | "car"
        | "bike"
        | "auto"
        | "taxi"
        | "suv"
        | "van"
        | "mini_bus"
        | "luxury"
        | "ev"
        | "other"
      vehicle_type: "private" | "commercial" | "other"
      verification_status: "pending" | "verified" | "rejected"
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
      booking_status: [
        "pending",
        "confirmed",
        "rejected",
        "completed",
        "cancelled",
      ],
      ride_status: [
        "pending",
        "verified",
        "published",
        "completed",
        "cancelled",
      ],
      vehicle_category: [
        "car",
        "bike",
        "auto",
        "taxi",
        "suv",
        "van",
        "mini_bus",
        "luxury",
        "ev",
        "other",
      ],
      vehicle_type: ["private", "commercial", "other"],
      verification_status: ["pending", "verified", "rejected"],
    },
  },
} as const
