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
      admin_users: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean | null
          last_login: string | null
          name: string
          password_hash: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          name: string
          password_hash: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          name?: string
          password_hash?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
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
      car_chats: {
        Row: {
          car_id: string
          created_at: string
          id: string
          message: string
          receiver_id: string
          sender_id: string
        }
        Insert: {
          car_id: string
          created_at?: string
          id?: string
          message: string
          receiver_id: string
          sender_id: string
        }
        Update: {
          car_id?: string
          created_at?: string
          id?: string
          message?: string
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "car_chats_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "pre_owned_cars"
            referencedColumns: ["id"]
          },
        ]
      }
      car_images: {
        Row: {
          car_id: string
          created_at: string
          id: string
          image_type: string
          image_url: string
        }
        Insert: {
          car_id: string
          created_at?: string
          id?: string
          image_type: string
          image_url: string
        }
        Update: {
          car_id?: string
          created_at?: string
          id?: string
          image_type?: string
          image_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "car_images_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "pre_owned_cars"
            referencedColumns: ["id"]
          },
        ]
      }
      car_interests: {
        Row: {
          buyer_id: string
          buyer_name: string
          buyer_phone: string
          car_id: string
          created_at: string
          id: string
          message: string | null
          preferred_call_time: string | null
          seller_viewed: boolean | null
          status: string | null
        }
        Insert: {
          buyer_id: string
          buyer_name: string
          buyer_phone: string
          car_id: string
          created_at?: string
          id?: string
          message?: string | null
          preferred_call_time?: string | null
          seller_viewed?: boolean | null
          status?: string | null
        }
        Update: {
          buyer_id?: string
          buyer_name?: string
          buyer_phone?: string
          car_id?: string
          created_at?: string
          id?: string
          message?: string | null
          preferred_call_time?: string | null
          seller_viewed?: boolean | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "car_interests_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "pre_owned_cars"
            referencedColumns: ["id"]
          },
        ]
      }
      car_reports: {
        Row: {
          car_id: string
          created_at: string
          details: string | null
          id: string
          reason: string
          reporter_id: string
        }
        Insert: {
          car_id: string
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          reporter_id: string
        }
        Update: {
          car_id?: string
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          reporter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "car_reports_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "pre_owned_cars"
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
      pre_owned_cars: {
        Row: {
          body_type: string | null
          brand: string
          color: string | null
          created_at: string
          description: string | null
          expected_price: number
          fuel_type: string
          id: string
          insurance_valid_till: string | null
          km_driven: number
          location: string
          location_lat: number | null
          location_lng: number | null
          model: string
          ownership: string
          rejection_reason: string | null
          service_history_available: boolean | null
          status: string | null
          transmission: string
          updated_at: string
          user_id: string
          variant: string | null
          verification_status: string | null
          year_of_purchase: number
        }
        Insert: {
          body_type?: string | null
          brand: string
          color?: string | null
          created_at?: string
          description?: string | null
          expected_price: number
          fuel_type: string
          id?: string
          insurance_valid_till?: string | null
          km_driven: number
          location: string
          location_lat?: number | null
          location_lng?: number | null
          model: string
          ownership: string
          rejection_reason?: string | null
          service_history_available?: boolean | null
          status?: string | null
          transmission: string
          updated_at?: string
          user_id: string
          variant?: string | null
          verification_status?: string | null
          year_of_purchase: number
        }
        Update: {
          body_type?: string | null
          brand?: string
          color?: string | null
          created_at?: string
          description?: string | null
          expected_price?: number
          fuel_type?: string
          id?: string
          insurance_valid_till?: string | null
          km_driven?: number
          location?: string
          location_lat?: number | null
          location_lng?: number | null
          model?: string
          ownership?: string
          rejection_reason?: string | null
          service_history_available?: boolean | null
          status?: string | null
          transmission?: string
          updated_at?: string
          user_id?: string
          variant?: string | null
          verification_status?: string | null
          year_of_purchase?: number
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
          is_verified: boolean | null
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
          is_verified?: boolean | null
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
          is_verified?: boolean | null
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
          rejection_reason: string | null
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
          verification_status: string | null
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
          rejection_reason?: string | null
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
          verification_status?: string | null
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
          rejection_reason?: string | null
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
          verification_status?: string | null
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
      user_verifications: {
        Row: {
          created_at: string
          date_of_birth: string
          full_name: string
          id: string
          id_back_url: string
          id_front_url: string
          id_type: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          selfie_video_url: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date_of_birth: string
          full_name: string
          id?: string
          id_back_url: string
          id_front_url: string
          id_type: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          selfie_video_url: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date_of_birth?: string
          full_name?: string
          id?: string
          id_back_url?: string
          id_front_url?: string
          id_type?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          selfie_video_url?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      create_admin_user: {
        Args: {
          _email: string
          _name: string
          _password: string
          _role?: Database["public"]["Enums"]["app_role"]
        }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_user_verified: { Args: { _user_id: string }; Returns: boolean }
      verify_admin_password: {
        Args: { _email: string; _password: string }
        Returns: {
          email: string
          id: string
          is_active: boolean
          name: string
          role: string
        }[]
      }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "moderator"
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
      app_role: ["super_admin", "admin", "moderator"],
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
