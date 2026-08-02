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
      announcements: {
        Row: {
          created_at: string
          ends_at: string | null
          id: string
          link_href: string | null
          message: string
          starts_at: string | null
          status: Database["public"]["Enums"]["entity_status"]
          updated_at: string
          website_id: string
        }
        Insert: {
          created_at?: string
          ends_at?: string | null
          id?: string
          link_href?: string | null
          message: string
          starts_at?: string | null
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
          website_id: string
        }
        Update: {
          created_at?: string
          ends_at?: string | null
          id?: string
          link_href?: string | null
          message?: string
          starts_at?: string | null
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
          website_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "websites"
            referencedColumns: ["id"]
          },
        ]
      }
      attraction_api_error_logs: {
        Row: {
          attraction_order_id: string | null
          correlation_id: string
          created_at: string
          endpoint: string
          error_code: string | null
          error_message: string | null
          http_status: number | null
          id: string
        }
        Insert: {
          attraction_order_id?: string | null
          correlation_id: string
          created_at?: string
          endpoint: string
          error_code?: string | null
          error_message?: string | null
          http_status?: number | null
          id?: string
        }
        Update: {
          attraction_order_id?: string | null
          correlation_id?: string
          created_at?: string
          endpoint?: string
          error_code?: string | null
          error_message?: string | null
          http_status?: number | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attraction_api_error_logs_attraction_order_id_fkey"
            columns: ["attraction_order_id"]
            isOneToOne: false
            referencedRelation: "attraction_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      attraction_categories: {
        Row: {
          created_at: string
          icon_key: string
          id: string
          slug: string
          sort_order: number
          updated_at: string
          website_id: string
        }
        Insert: {
          created_at?: string
          icon_key: string
          id?: string
          slug: string
          sort_order?: number
          updated_at?: string
          website_id: string
        }
        Update: {
          created_at?: string
          icon_key?: string
          id?: string
          slug?: string
          sort_order?: number
          updated_at?: string
          website_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attraction_categories_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "websites"
            referencedColumns: ["id"]
          },
        ]
      }
      attraction_category_translations: {
        Row: {
          attraction_category_id: string
          id: string
          locale: string
          name: string
        }
        Insert: {
          attraction_category_id: string
          id?: string
          locale: string
          name: string
        }
        Update: {
          attraction_category_id?: string
          id?: string
          locale?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "attraction_category_translations_attraction_category_id_fkey"
            columns: ["attraction_category_id"]
            isOneToOne: false
            referencedRelation: "attraction_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attraction_category_translations_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["code"]
          },
        ]
      }
      attraction_cross_sells: {
        Row: {
          attraction_product_id: string
          created_at: string
          id: string
          label: string
          related_url: string
          sort_order: number
        }
        Insert: {
          attraction_product_id: string
          created_at?: string
          id?: string
          label: string
          related_url: string
          sort_order?: number
        }
        Update: {
          attraction_product_id?: string
          created_at?: string
          id?: string
          label?: string
          related_url?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "attraction_cross_sells_attraction_product_id_fkey"
            columns: ["attraction_product_id"]
            isOneToOne: false
            referencedRelation: "attraction_products"
            referencedColumns: ["id"]
          },
        ]
      }
      attraction_faqs: {
        Row: {
          answer: string
          attraction_product_id: string
          created_at: string
          id: string
          locale: string
          question: string
          sort_order: number
        }
        Insert: {
          answer: string
          attraction_product_id: string
          created_at?: string
          id?: string
          locale: string
          question: string
          sort_order?: number
        }
        Update: {
          answer?: string
          attraction_product_id?: string
          created_at?: string
          id?: string
          locale?: string
          question?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "attraction_faqs_attraction_product_id_fkey"
            columns: ["attraction_product_id"]
            isOneToOne: false
            referencedRelation: "attraction_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attraction_faqs_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["code"]
          },
        ]
      }
      attraction_order_items: {
        Row: {
          attraction_order_id: string
          attraction_product_id: string
          created_at: string
          id: string
          provider_variant_id: string
          quantity: number
          ticket_holder_name: string | null
          unit_price: number
          usage_date: string
        }
        Insert: {
          attraction_order_id: string
          attraction_product_id: string
          created_at?: string
          id?: string
          provider_variant_id: string
          quantity: number
          ticket_holder_name?: string | null
          unit_price: number
          usage_date: string
        }
        Update: {
          attraction_order_id?: string
          attraction_product_id?: string
          created_at?: string
          id?: string
          provider_variant_id?: string
          quantity?: number
          ticket_holder_name?: string | null
          unit_price?: number
          usage_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "attraction_order_items_attraction_order_id_fkey"
            columns: ["attraction_order_id"]
            isOneToOne: false
            referencedRelation: "attraction_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attraction_order_items_attraction_product_id_fkey"
            columns: ["attraction_product_id"]
            isOneToOne: false
            referencedRelation: "attraction_products"
            referencedColumns: ["id"]
          },
        ]
      }
      attraction_orders: {
        Row: {
          created_at: string
          created_by: string | null
          currency: string
          customer_email: string
          customer_name: string
          customer_phone: string
          id: string
          idempotency_key: string
          note: string | null
          order_code: string
          payment_status: string | null
          provider_code: string
          provider_order_id: string | null
          request_snapshot: Json | null
          response_reference: Json | null
          status: Database["public"]["Enums"]["attraction_order_status"]
          total_amount: number
          updated_at: string
          website_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_email: string
          customer_name: string
          customer_phone: string
          id?: string
          idempotency_key: string
          note?: string | null
          order_code: string
          payment_status?: string | null
          provider_code?: string
          provider_order_id?: string | null
          request_snapshot?: Json | null
          response_reference?: Json | null
          status?: Database["public"]["Enums"]["attraction_order_status"]
          total_amount: number
          updated_at?: string
          website_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          id?: string
          idempotency_key?: string
          note?: string | null
          order_code?: string
          payment_status?: string | null
          provider_code?: string
          provider_order_id?: string | null
          request_snapshot?: Json | null
          response_reference?: Json | null
          status?: Database["public"]["Enums"]["attraction_order_status"]
          total_amount?: number
          updated_at?: string
          website_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attraction_orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attraction_orders_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "websites"
            referencedColumns: ["id"]
          },
        ]
      }
      attraction_product_categories: {
        Row: {
          attraction_category_id: string
          attraction_product_id: string
        }
        Insert: {
          attraction_category_id: string
          attraction_product_id: string
        }
        Update: {
          attraction_category_id?: string
          attraction_product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attraction_product_categories_attraction_category_id_fkey"
            columns: ["attraction_category_id"]
            isOneToOne: false
            referencedRelation: "attraction_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attraction_product_categories_attraction_product_id_fkey"
            columns: ["attraction_product_id"]
            isOneToOne: false
            referencedRelation: "attraction_products"
            referencedColumns: ["id"]
          },
        ]
      }
      attraction_product_translations: {
        Row: {
          attraction_product_id: string
          cancellation_policy: string | null
          created_at: string
          description: string | null
          id: string
          locale: string
          meta_description: string | null
          meta_title: string | null
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          attraction_product_id: string
          cancellation_policy?: string | null
          created_at?: string
          description?: string | null
          id?: string
          locale: string
          meta_description?: string | null
          meta_title?: string | null
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          attraction_product_id?: string
          cancellation_policy?: string | null
          created_at?: string
          description?: string | null
          id?: string
          locale?: string
          meta_description?: string | null
          meta_title?: string | null
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attraction_product_translations_attraction_product_id_fkey"
            columns: ["attraction_product_id"]
            isOneToOne: false
            referencedRelation: "attraction_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attraction_product_translations_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["code"]
          },
        ]
      }
      attraction_products: {
        Row: {
          attraction_venue_id: string
          created_at: string
          currency: string
          deleted_at: string | null
          gallery_images: Json
          id: string
          image_alt: string
          image_url: string
          is_featured: boolean
          price_from: number | null
          product_type_id: string
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["entity_status"]
          updated_at: string
          website_id: string
        }
        Insert: {
          attraction_venue_id: string
          created_at?: string
          currency?: string
          deleted_at?: string | null
          gallery_images?: Json
          id?: string
          image_alt: string
          image_url: string
          is_featured?: boolean
          price_from?: number | null
          product_type_id: string
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
          website_id: string
        }
        Update: {
          attraction_venue_id?: string
          created_at?: string
          currency?: string
          deleted_at?: string | null
          gallery_images?: Json
          id?: string
          image_alt?: string
          image_url?: string
          is_featured?: boolean
          price_from?: number | null
          product_type_id?: string
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
          website_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attraction_products_attraction_venue_id_fkey"
            columns: ["attraction_venue_id"]
            isOneToOne: false
            referencedRelation: "attraction_venues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attraction_products_product_type_id_fkey"
            columns: ["product_type_id"]
            isOneToOne: false
            referencedRelation: "product_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attraction_products_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "websites"
            referencedColumns: ["id"]
          },
        ]
      }
      attraction_provider_refs: {
        Row: {
          attraction_product_id: string | null
          attraction_venue_id: string | null
          created_at: string
          id: string
          last_synced_at: string | null
          provider_code: string
          provider_product_id: string | null
          provider_variant_id: string | null
          provider_venue_id: string | null
          raw_snapshot: Json | null
          updated_at: string
        }
        Insert: {
          attraction_product_id?: string | null
          attraction_venue_id?: string | null
          created_at?: string
          id?: string
          last_synced_at?: string | null
          provider_code?: string
          provider_product_id?: string | null
          provider_variant_id?: string | null
          provider_venue_id?: string | null
          raw_snapshot?: Json | null
          updated_at?: string
        }
        Update: {
          attraction_product_id?: string | null
          attraction_venue_id?: string | null
          created_at?: string
          id?: string
          last_synced_at?: string | null
          provider_code?: string
          provider_product_id?: string | null
          provider_variant_id?: string | null
          provider_venue_id?: string | null
          raw_snapshot?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attraction_provider_refs_attraction_product_id_fkey"
            columns: ["attraction_product_id"]
            isOneToOne: false
            referencedRelation: "attraction_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attraction_provider_refs_attraction_venue_id_fkey"
            columns: ["attraction_venue_id"]
            isOneToOne: false
            referencedRelation: "attraction_venues"
            referencedColumns: ["id"]
          },
        ]
      }
      attraction_sync_logs: {
        Row: {
          attraction_product_id: string | null
          attraction_venue_id: string | null
          created_at: string
          error_message: string | null
          id: string
          status: string
          sync_type: string
          triggered_by: string | null
        }
        Insert: {
          attraction_product_id?: string | null
          attraction_venue_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          status: string
          sync_type: string
          triggered_by?: string | null
        }
        Update: {
          attraction_product_id?: string | null
          attraction_venue_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          status?: string
          sync_type?: string
          triggered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attraction_sync_logs_attraction_product_id_fkey"
            columns: ["attraction_product_id"]
            isOneToOne: false
            referencedRelation: "attraction_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attraction_sync_logs_attraction_venue_id_fkey"
            columns: ["attraction_venue_id"]
            isOneToOne: false
            referencedRelation: "attraction_venues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attraction_sync_logs_triggered_by_fkey"
            columns: ["triggered_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      attraction_venue_translations: {
        Row: {
          attraction_venue_id: string
          created_at: string
          description: string | null
          highlights: Json
          id: string
          locale: string
          name: string
          policy: string | null
          summary: string | null
          updated_at: string
          usage_guide: string | null
        }
        Insert: {
          attraction_venue_id: string
          created_at?: string
          description?: string | null
          highlights?: Json
          id?: string
          locale: string
          name: string
          policy?: string | null
          summary?: string | null
          updated_at?: string
          usage_guide?: string | null
        }
        Update: {
          attraction_venue_id?: string
          created_at?: string
          description?: string | null
          highlights?: Json
          id?: string
          locale?: string
          name?: string
          policy?: string | null
          summary?: string | null
          updated_at?: string
          usage_guide?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attraction_venue_translations_attraction_venue_id_fkey"
            columns: ["attraction_venue_id"]
            isOneToOne: false
            referencedRelation: "attraction_venues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attraction_venue_translations_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["code"]
          },
        ]
      }
      attraction_venues: {
        Row: {
          created_at: string
          deleted_at: string | null
          destination_id: string
          id: string
          image_alt: string
          image_url: string
          is_featured: boolean
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["entity_status"]
          updated_at: string
          website_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          destination_id: string
          id?: string
          image_alt: string
          image_url: string
          is_featured?: boolean
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
          website_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          destination_id?: string
          id?: string
          image_alt?: string
          image_url?: string
          is_featured?: boolean
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
          website_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attraction_venues_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attraction_venues_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "websites"
            referencedColumns: ["id"]
          },
        ]
      }
      attraction_vouchers: {
        Row: {
          attraction_order_id: string
          created_at: string
          download_url: string | null
          hash_code: string | null
          id: string
          issued_at: string | null
          provider_voucher_id: string
        }
        Insert: {
          attraction_order_id: string
          created_at?: string
          download_url?: string | null
          hash_code?: string | null
          id?: string
          issued_at?: string | null
          provider_voucher_id: string
        }
        Update: {
          attraction_order_id?: string
          created_at?: string
          download_url?: string | null
          hash_code?: string | null
          id?: string
          issued_at?: string | null
          provider_voucher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attraction_vouchers_attraction_order_id_fkey"
            columns: ["attraction_order_id"]
            isOneToOne: false
            referencedRelation: "attraction_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log_changes: {
        Row: {
          audit_log_id: string
          created_at: string
          field_name: string
          id: string
          new_value: Json | null
          previous_value: Json | null
        }
        Insert: {
          audit_log_id: string
          created_at?: string
          field_name: string
          id?: string
          new_value?: Json | null
          previous_value?: Json | null
        }
        Update: {
          audit_log_id?: string
          created_at?: string
          field_name?: string
          id?: string
          new_value?: Json | null
          previous_value?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_changes_audit_log_id_fkey"
            columns: ["audit_log_id"]
            isOneToOne: false
            referencedRelation: "audit_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown
          organization_id: string | null
          reason: string | null
          request_id: string | null
          source: string
          success: boolean
          user_agent: string | null
          website_id: string | null
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown
          organization_id?: string | null
          reason?: string | null
          request_id?: string | null
          source?: string
          success?: boolean
          user_agent?: string | null
          website_id?: string | null
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown
          organization_id?: string | null
          reason?: string | null
          request_id?: string | null
          source?: string
          success?: boolean
          user_agent?: string | null
          website_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "websites"
            referencedColumns: ["id"]
          },
        ]
      }
      brands: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          display_name: string
          id: string
          logo_media_id: string | null
          name: string
          organization_id: string
          slug: string
          status: Database["public"]["Enums"]["entity_status"]
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_name: string
          id?: string
          logo_media_id?: string | null
          name: string
          organization_id: string
          slug: string
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_name?: string
          id?: string
          logo_media_id?: string | null
          name?: string
          organization_id?: string
          slug?: string
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brands_logo_media_id_fkey"
            columns: ["logo_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brands_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      business_units: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          name: string
          organization_id: string
          status: Database["public"]["Enums"]["entity_status"]
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          organization_id: string
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_units_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          created_at: string
          id: string
          name: string
          province_id: string
          status: Database["public"]["Enums"]["entity_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          province_id: string
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          province_id?: string
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cities_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_block_definitions: {
        Row: {
          config_schema: Json
          created_at: string
          id: string
          key: string
          name: string
          status: Database["public"]["Enums"]["entity_status"]
          updated_at: string
        }
        Insert: {
          config_schema?: Json
          created_at?: string
          id?: string
          key: string
          name: string
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Update: {
          config_schema?: Json
          created_at?: string
          id?: string
          key?: string
          name?: string
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Relationships: []
      }
      cms_blocks: {
        Row: {
          block_definition_id: string
          config: Json
          created_at: string
          id: string
          position: number
          section_id: string
          updated_at: string
        }
        Insert: {
          block_definition_id: string
          config?: Json
          created_at?: string
          id?: string
          position: number
          section_id: string
          updated_at?: string
        }
        Update: {
          block_definition_id?: string
          config?: Json
          created_at?: string
          id?: string
          position?: number
          section_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cms_blocks_block_definition_id_fkey"
            columns: ["block_definition_id"]
            isOneToOne: false
            referencedRelation: "cms_block_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cms_blocks_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "cms_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_page_versions: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_current: boolean
          page_id: string
          published_at: string | null
          published_by: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          scheduled_publish_at: string | null
          seo_metadata_id: string | null
          status: Database["public"]["Enums"]["cms_lifecycle_status"]
          title: string
          updated_at: string
          updated_by: string | null
          version_number: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_current?: boolean
          page_id: string
          published_at?: string | null
          published_by?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          scheduled_publish_at?: string | null
          seo_metadata_id?: string | null
          status?: Database["public"]["Enums"]["cms_lifecycle_status"]
          title: string
          updated_at?: string
          updated_by?: string | null
          version_number: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_current?: boolean
          page_id?: string
          published_at?: string | null
          published_by?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          scheduled_publish_at?: string | null
          seo_metadata_id?: string | null
          status?: Database["public"]["Enums"]["cms_lifecycle_status"]
          title?: string
          updated_at?: string
          updated_by?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "cms_page_versions_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "cms_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cms_page_versions_seo_metadata_id_fkey"
            columns: ["seo_metadata_id"]
            isOneToOne: false
            referencedRelation: "seo_metadata"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_pages: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          locale: string
          page_type: Database["public"]["Enums"]["cms_page_type"]
          slug: string
          updated_at: string
          updated_by: string | null
          website_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          locale: string
          page_type: Database["public"]["Enums"]["cms_page_type"]
          slug: string
          updated_at?: string
          updated_by?: string | null
          website_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          locale?: string
          page_type?: Database["public"]["Enums"]["cms_page_type"]
          slug?: string
          updated_at?: string
          updated_by?: string | null
          website_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cms_pages_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "cms_pages_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "websites"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_sections: {
        Row: {
          created_at: string
          id: string
          page_version_id: string
          position: number
          section_key: string
        }
        Insert: {
          created_at?: string
          id?: string
          page_version_id: string
          position: number
          section_key: string
        }
        Update: {
          created_at?: string
          id?: string
          page_version_id?: string
          position?: number
          section_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "cms_sections_page_version_id_fkey"
            columns: ["page_version_id"]
            isOneToOne: false
            referencedRelation: "cms_page_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      countries: {
        Row: {
          code: string
          created_at: string
          default_currency_code: string | null
          name: string
          native_name: string | null
          region: string | null
          status: Database["public"]["Enums"]["entity_status"]
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          default_currency_code?: string | null
          name: string
          native_name?: string | null
          region?: string | null
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          default_currency_code?: string | null
          name?: string
          native_name?: string | null
          region?: string | null
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "countries_default_currency_code_fkey"
            columns: ["default_currency_code"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
        ]
      }
      currencies: {
        Row: {
          code: string
          created_at: string
          decimal_digits: number
          name: string
          status: Database["public"]["Enums"]["entity_status"]
          symbol: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          decimal_digits?: number
          name: string
          status?: Database["public"]["Enums"]["entity_status"]
          symbol: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          decimal_digits?: number
          name?: string
          status?: Database["public"]["Enums"]["entity_status"]
          symbol?: string
          updated_at?: string
        }
        Relationships: []
      }
      customer_types: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
          status: Database["public"]["Enums"]["entity_status"]
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Relationships: []
      }
      departments: {
        Row: {
          business_unit_id: string | null
          code: string
          created_at: string
          id: string
          name: string
          office_id: string | null
          organization_id: string
          parent_department_id: string | null
          status: Database["public"]["Enums"]["entity_status"]
          updated_at: string
        }
        Insert: {
          business_unit_id?: string | null
          code: string
          created_at?: string
          id?: string
          name: string
          office_id?: string | null
          organization_id: string
          parent_department_id?: string | null
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Update: {
          business_unit_id?: string | null
          code?: string
          created_at?: string
          id?: string
          name?: string
          office_id?: string | null
          organization_id?: string
          parent_department_id?: string | null
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departments_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departments_parent_department_id_fkey"
            columns: ["parent_department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      destination_translations: {
        Row: {
          created_at: string
          description: string | null
          destination_id: string
          id: string
          locale: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          destination_id: string
          id?: string
          locale: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          destination_id?: string
          id?: string
          locale?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "destination_translations_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "destination_translations_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["code"]
          },
        ]
      }
      destinations: {
        Row: {
          country_code: string | null
          created_at: string
          deleted_at: string | null
          destination_type: Database["public"]["Enums"]["destination_type"]
          id: string
          is_featured: boolean
          latitude: number | null
          longitude: number | null
          media_asset_id: string | null
          parent_destination_id: string | null
          status: Database["public"]["Enums"]["entity_status"]
          updated_at: string
        }
        Insert: {
          country_code?: string | null
          created_at?: string
          deleted_at?: string | null
          destination_type: Database["public"]["Enums"]["destination_type"]
          id?: string
          is_featured?: boolean
          latitude?: number | null
          longitude?: number | null
          media_asset_id?: string | null
          parent_destination_id?: string | null
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Update: {
          country_code?: string | null
          created_at?: string
          deleted_at?: string | null
          destination_type?: Database["public"]["Enums"]["destination_type"]
          id?: string
          is_featured?: boolean
          latitude?: number | null
          longitude?: number | null
          media_asset_id?: string | null
          parent_destination_id?: string | null
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "destinations_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "destinations_media_asset_id_fkey"
            columns: ["media_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "destinations_parent_destination_id_fkey"
            columns: ["parent_destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_profiles: {
        Row: {
          created_at: string
          department_id: string | null
          employee_code: string | null
          hire_date: string | null
          id: string
          manager_id: string | null
          office_id: string | null
          position_id: string | null
          status: Database["public"]["Enums"]["entity_status"]
          updated_at: string
          user_profile_id: string
        }
        Insert: {
          created_at?: string
          department_id?: string | null
          employee_code?: string | null
          hire_date?: string | null
          id?: string
          manager_id?: string | null
          office_id?: string | null
          position_id?: string | null
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
          user_profile_id: string
        }
        Update: {
          created_at?: string
          department_id?: string | null
          employee_code?: string | null
          hire_date?: string | null
          id?: string
          manager_id?: string | null
          office_id?: string | null
          position_id?: string | null
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
          user_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_profiles_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employee_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_profiles_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_profiles_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_profiles_user_profile_id_fkey"
            columns: ["user_profile_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      faq_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          position: number
          slug: string
          status: Database["public"]["Enums"]["entity_status"]
          updated_at: string
          website_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          position?: number
          slug: string
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
          website_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          position?: number
          slug?: string
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
          website_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "faq_categories_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "websites"
            referencedColumns: ["id"]
          },
        ]
      }
      faqs: {
        Row: {
          answer: string
          created_at: string
          faq_category_id: string
          id: string
          locale: string
          position: number
          question: string
          status: Database["public"]["Enums"]["entity_status"]
          updated_at: string
          website_id: string
        }
        Insert: {
          answer: string
          created_at?: string
          faq_category_id: string
          id?: string
          locale: string
          position?: number
          question: string
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
          website_id: string
        }
        Update: {
          answer?: string
          created_at?: string
          faq_category_id?: string
          id?: string
          locale?: string
          position?: number
          question?: string
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
          website_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "faqs_faq_category_id_fkey"
            columns: ["faq_category_id"]
            isOneToOne: false
            referencedRelation: "faq_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faqs_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "faqs_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "websites"
            referencedColumns: ["id"]
          },
        ]
      }
      form_submissions: {
        Row: {
          anonymous_session_id: string | null
          consent_marketing: boolean
          consent_privacy: boolean
          created_at: string
          email: string | null
          form_id: string
          full_name: string
          id: string
          idempotency_key: string | null
          organization_id: string
          payload: Json
          phone: string
          processed_at: string | null
          referrer: string | null
          source_page_id: string | null
          source_url: string | null
          status: Database["public"]["Enums"]["form_submission_status"]
          submission_type: string
          submitted_at: string
          updated_at: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          website_id: string
        }
        Insert: {
          anonymous_session_id?: string | null
          consent_marketing?: boolean
          consent_privacy?: boolean
          created_at?: string
          email?: string | null
          form_id: string
          full_name: string
          id?: string
          idempotency_key?: string | null
          organization_id: string
          payload?: Json
          phone: string
          processed_at?: string | null
          referrer?: string | null
          source_page_id?: string | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["form_submission_status"]
          submission_type: string
          submitted_at?: string
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          website_id: string
        }
        Update: {
          anonymous_session_id?: string | null
          consent_marketing?: boolean
          consent_privacy?: boolean
          created_at?: string
          email?: string | null
          form_id?: string
          full_name?: string
          id?: string
          idempotency_key?: string | null
          organization_id?: string
          payload?: Json
          phone?: string
          processed_at?: string | null
          referrer?: string | null
          source_page_id?: string | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["form_submission_status"]
          submission_type?: string
          submitted_at?: string
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          website_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_submissions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_submissions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_submissions_source_page_id_fkey"
            columns: ["source_page_id"]
            isOneToOne: false
            referencedRelation: "cms_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_submissions_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "websites"
            referencedColumns: ["id"]
          },
        ]
      }
      forms: {
        Row: {
          created_at: string
          id: string
          key: string
          name: string
          status: Database["public"]["Enums"]["entity_status"]
          updated_at: string
          website_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          name: string
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
          website_id: string
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          name?: string
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
          website_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forms_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "websites"
            referencedColumns: ["id"]
          },
        ]
      }
      languages: {
        Row: {
          code: string
          created_at: string
          name: string
          native_name: string
          status: Database["public"]["Enums"]["entity_status"]
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          name: string
          native_name: string
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          name?: string
          native_name?: string
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Relationships: []
      }
      media_assets: {
        Row: {
          alt_text: string | null
          caption: string | null
          copyright_info: string | null
          created_at: string
          credit: string | null
          deleted_at: string | null
          duration_seconds: number | null
          file_size_bytes: number
          folder_id: string | null
          height: number | null
          id: string
          license_status: string | null
          mime_type: string
          original_filename: string
          source: string | null
          storage_path: string
          updated_at: string
          uploaded_by: string | null
          visibility: Database["public"]["Enums"]["media_visibility"]
          website_id: string | null
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          caption?: string | null
          copyright_info?: string | null
          created_at?: string
          credit?: string | null
          deleted_at?: string | null
          duration_seconds?: number | null
          file_size_bytes: number
          folder_id?: string | null
          height?: number | null
          id?: string
          license_status?: string | null
          mime_type: string
          original_filename: string
          source?: string | null
          storage_path: string
          updated_at?: string
          uploaded_by?: string | null
          visibility?: Database["public"]["Enums"]["media_visibility"]
          website_id?: string | null
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          caption?: string | null
          copyright_info?: string | null
          created_at?: string
          credit?: string | null
          deleted_at?: string | null
          duration_seconds?: number | null
          file_size_bytes?: number
          folder_id?: string | null
          height?: number | null
          id?: string
          license_status?: string | null
          mime_type?: string
          original_filename?: string
          source?: string | null
          storage_path?: string
          updated_at?: string
          uploaded_by?: string | null
          visibility?: Database["public"]["Enums"]["media_visibility"]
          website_id?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_assets_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "media_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_assets_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "websites"
            referencedColumns: ["id"]
          },
        ]
      }
      media_folders: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
          parent_folder_id: string | null
          updated_at: string
          website_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          parent_folder_id?: string | null
          updated_at?: string
          website_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          parent_folder_id?: string | null
          updated_at?: string
          website_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_folders_parent_folder_id_fkey"
            columns: ["parent_folder_id"]
            isOneToOne: false
            referencedRelation: "media_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_folders_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "websites"
            referencedColumns: ["id"]
          },
        ]
      }
      navigation_items: {
        Row: {
          cms_page_id: string | null
          created_at: string
          id: string
          is_external: boolean
          label: string
          menu_id: string
          open_in_new_tab: boolean
          parent_item_id: string | null
          position: number
          status: Database["public"]["Enums"]["entity_status"]
          updated_at: string
          url: string | null
        }
        Insert: {
          cms_page_id?: string | null
          created_at?: string
          id?: string
          is_external?: boolean
          label: string
          menu_id: string
          open_in_new_tab?: boolean
          parent_item_id?: string | null
          position?: number
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
          url?: string | null
        }
        Update: {
          cms_page_id?: string | null
          created_at?: string
          id?: string
          is_external?: boolean
          label?: string
          menu_id?: string
          open_in_new_tab?: boolean
          parent_item_id?: string | null
          position?: number
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "navigation_items_cms_page_id_fkey"
            columns: ["cms_page_id"]
            isOneToOne: false
            referencedRelation: "cms_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "navigation_items_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "navigation_menus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "navigation_items_parent_item_id_fkey"
            columns: ["parent_item_id"]
            isOneToOne: false
            referencedRelation: "navigation_items"
            referencedColumns: ["id"]
          },
        ]
      }
      navigation_menus: {
        Row: {
          created_at: string
          id: string
          key: Database["public"]["Enums"]["navigation_menu_key"]
          locale: string
          status: Database["public"]["Enums"]["entity_status"]
          updated_at: string
          website_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          key: Database["public"]["Enums"]["navigation_menu_key"]
          locale: string
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
          website_id: string
        }
        Update: {
          created_at?: string
          id?: string
          key?: Database["public"]["Enums"]["navigation_menu_key"]
          locale?: string
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
          website_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "navigation_menus_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "navigation_menus_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "websites"
            referencedColumns: ["id"]
          },
        ]
      }
      news_article_categories: {
        Row: {
          category_id: string
          created_at: string
          page_id: string
        }
        Insert: {
          category_id: string
          created_at?: string
          page_id: string
        }
        Update: {
          category_id?: string
          created_at?: string
          page_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_article_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "news_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_article_categories_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: true
            referencedRelation: "cms_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      news_categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          updated_at: string
          website_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
          website_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
          website_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_categories_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "websites"
            referencedColumns: ["id"]
          },
        ]
      }
      offices: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          country_code: string | null
          created_at: string
          id: string
          is_headquarters: boolean
          name: string
          organization_id: string
          phone: string | null
          status: Database["public"]["Enums"]["entity_status"]
          updated_at: string
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          country_code?: string | null
          created_at?: string
          id?: string
          is_headquarters?: boolean
          name: string
          organization_id: string
          phone?: string | null
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          country_code?: string | null
          created_at?: string
          id?: string
          is_headquarters?: boolean
          name?: string
          organization_id?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "offices_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "offices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          business_registration_number: string | null
          city: string | null
          country_code: string | null
          created_at: string
          created_by: string | null
          default_currency_code: string
          default_language_code: string
          default_timezone: string
          display_name: string
          email: string | null
          id: string
          legal_name: string
          phone: string | null
          status: Database["public"]["Enums"]["entity_status"]
          tax_code: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          business_registration_number?: string | null
          city?: string | null
          country_code?: string | null
          created_at?: string
          created_by?: string | null
          default_currency_code: string
          default_language_code: string
          default_timezone?: string
          display_name: string
          email?: string | null
          id?: string
          legal_name: string
          phone?: string | null
          status?: Database["public"]["Enums"]["entity_status"]
          tax_code?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          business_registration_number?: string | null
          city?: string | null
          country_code?: string | null
          created_at?: string
          created_by?: string | null
          default_currency_code?: string
          default_language_code?: string
          default_timezone?: string
          display_name?: string
          email?: string | null
          id?: string
          legal_name?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["entity_status"]
          tax_code?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "organizations_default_currency_code_fkey"
            columns: ["default_currency_code"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "organizations_default_language_code_fkey"
            columns: ["default_language_code"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["code"]
          },
        ]
      }
      permissions: {
        Row: {
          action: string
          created_at: string
          description: string | null
          id: string
          key: string
          module: string
        }
        Insert: {
          action: string
          created_at?: string
          description?: string | null
          id?: string
          key: string
          module: string
        }
        Update: {
          action?: string
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          module?: string
        }
        Relationships: []
      }
      positions: {
        Row: {
          created_at: string
          department_id: string
          id: string
          level: number | null
          status: Database["public"]["Enums"]["entity_status"]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          department_id: string
          id?: string
          level?: number | null
          status?: Database["public"]["Enums"]["entity_status"]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          department_id?: string
          id?: string
          level?: number | null
          status?: Database["public"]["Enums"]["entity_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "positions_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      product_types: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
          status: Database["public"]["Enums"]["entity_status"]
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Relationships: []
      }
      provinces: {
        Row: {
          code: string
          country_code: string
          created_at: string
          id: string
          name: string
          status: Database["public"]["Enums"]["entity_status"]
          updated_at: string
        }
        Insert: {
          code: string
          country_code: string
          created_at?: string
          id?: string
          name: string
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Update: {
          code?: string
          country_code?: string
          created_at?: string
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "provinces_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["code"]
          },
        ]
      }
      redirect_rules: {
        Row: {
          created_at: string
          destination_url: string
          hit_count: number
          id: string
          locale: string | null
          redirect_kind: Database["public"]["Enums"]["redirect_kind"]
          source_path: string
          status: Database["public"]["Enums"]["entity_status"]
          updated_at: string
          website_id: string
        }
        Insert: {
          created_at?: string
          destination_url: string
          hit_count?: number
          id?: string
          locale?: string | null
          redirect_kind?: Database["public"]["Enums"]["redirect_kind"]
          source_path: string
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
          website_id: string
        }
        Update: {
          created_at?: string
          destination_url?: string
          hit_count?: number
          id?: string
          locale?: string | null
          redirect_kind?: Database["public"]["Enums"]["redirect_kind"]
          source_path?: string
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
          website_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "redirect_rules_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "redirect_rules_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "websites"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string
          id: string
          permission_id: string
          role_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          permission_id: string
          role_id: string
        }
        Update: {
          created_at?: string
          id?: string
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      role_scopes: {
        Row: {
          created_at: string
          id: string
          scope_level: Database["public"]["Enums"]["permission_scope_level"]
          scope_resource_id: string | null
          user_role_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          scope_level: Database["public"]["Enums"]["permission_scope_level"]
          scope_resource_id?: string | null
          user_role_id: string
        }
        Update: {
          created_at?: string
          id?: string
          scope_level?: Database["public"]["Enums"]["permission_scope_level"]
          scope_resource_id?: string | null
          user_role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_scopes_user_role_id_fkey"
            columns: ["user_role_id"]
            isOneToOne: false
            referencedRelation: "user_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_system: boolean
          key: string
          name: string
          status: Database["public"]["Enums"]["entity_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          key: string
          name: string
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          key?: string
          name?: string
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Relationships: []
      }
      security_events: {
        Row: {
          actor_user_id: string | null
          created_at: string
          event_type: string
          id: string
          ip_address: unknown
          metadata: Json
          user_agent: string | null
        }
        Insert: {
          actor_user_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          ip_address?: unknown
          metadata?: Json
          user_agent?: string | null
        }
        Update: {
          actor_user_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          ip_address?: unknown
          metadata?: Json
          user_agent?: string | null
        }
        Relationships: []
      }
      seo_metadata: {
        Row: {
          breadcrumb_config: Json
          canonical_url: string | null
          created_at: string
          entity_id: string
          entity_type: string
          featured_image_media_id: string | null
          hreflang_group_id: string | null
          id: string
          is_followed: boolean
          is_indexed: boolean
          locale: string
          meta_description: string | null
          og_description: string | null
          og_image_media_id: string | null
          og_title: string | null
          slug: string
          structured_data: Json
          title: string
          twitter_card_type: string | null
          updated_at: string
          website_id: string
        }
        Insert: {
          breadcrumb_config?: Json
          canonical_url?: string | null
          created_at?: string
          entity_id: string
          entity_type: string
          featured_image_media_id?: string | null
          hreflang_group_id?: string | null
          id?: string
          is_followed?: boolean
          is_indexed?: boolean
          locale: string
          meta_description?: string | null
          og_description?: string | null
          og_image_media_id?: string | null
          og_title?: string | null
          slug: string
          structured_data?: Json
          title: string
          twitter_card_type?: string | null
          updated_at?: string
          website_id: string
        }
        Update: {
          breadcrumb_config?: Json
          canonical_url?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          featured_image_media_id?: string | null
          hreflang_group_id?: string | null
          id?: string
          is_followed?: boolean
          is_indexed?: boolean
          locale?: string
          meta_description?: string | null
          og_description?: string | null
          og_image_media_id?: string | null
          og_title?: string | null
          slug?: string
          structured_data?: Json
          title?: string
          twitter_card_type?: string | null
          updated_at?: string
          website_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seo_metadata_featured_image_media_id_fkey"
            columns: ["featured_image_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seo_metadata_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "seo_metadata_og_image_media_id_fkey"
            columns: ["og_image_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seo_metadata_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "websites"
            referencedColumns: ["id"]
          },
        ]
      }
      setting_definitions: {
        Row: {
          created_at: string
          default_value: Json
          description: string
          id: string
          is_secret: boolean
          key: string
          namespace: string
          updated_at: string
          value_type: Database["public"]["Enums"]["setting_value_type"]
          visibility: Database["public"]["Enums"]["setting_visibility"]
        }
        Insert: {
          created_at?: string
          default_value?: Json
          description: string
          id?: string
          is_secret?: boolean
          key: string
          namespace: string
          updated_at?: string
          value_type: Database["public"]["Enums"]["setting_value_type"]
          visibility?: Database["public"]["Enums"]["setting_visibility"]
        }
        Update: {
          created_at?: string
          default_value?: Json
          description?: string
          id?: string
          is_secret?: boolean
          key?: string
          namespace?: string
          updated_at?: string
          value_type?: Database["public"]["Enums"]["setting_value_type"]
          visibility?: Database["public"]["Enums"]["setting_visibility"]
        }
        Relationships: []
      }
      setting_values: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          scope_level: Database["public"]["Enums"]["settings_scope_level"]
          scope_resource_id: string | null
          setting_definition_id: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          scope_level: Database["public"]["Enums"]["settings_scope_level"]
          scope_resource_id?: string | null
          setting_definition_id: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          scope_level?: Database["public"]["Enums"]["settings_scope_level"]
          scope_resource_id?: string | null
          setting_definition_id?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "setting_values_setting_definition_id_fkey"
            columns: ["setting_definition_id"]
            isOneToOne: false
            referencedRelation: "setting_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      slug_history: {
        Row: {
          changed_at: string
          changed_by: string | null
          entity_id: string
          entity_type: string
          id: string
          old_locale: string
          old_slug: string
          website_id: string
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          entity_id: string
          entity_type: string
          id?: string
          old_locale: string
          old_slug: string
          website_id: string
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          old_locale?: string
          old_slug?: string
          website_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "slug_history_old_locale_fkey"
            columns: ["old_locale"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "slug_history_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "websites"
            referencedColumns: ["id"]
          },
        ]
      }
      user_organization_memberships: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          status: Database["public"]["Enums"]["entity_status"]
          user_profile_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          status?: Database["public"]["Enums"]["entity_status"]
          user_profile_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          status?: Database["public"]["Enums"]["entity_status"]
          user_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_organization_memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_organization_memberships_user_profile_id_fkey"
            columns: ["user_profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          account_status: Database["public"]["Enums"]["account_status"]
          avatar_media_id: string | null
          created_at: string
          deleted_at: string | null
          display_name: string
          id: string
          last_login_at: string | null
          locale: string
          timezone: string
          updated_at: string
        }
        Insert: {
          account_status?: Database["public"]["Enums"]["account_status"]
          avatar_media_id?: string | null
          created_at?: string
          deleted_at?: string | null
          display_name: string
          id: string
          last_login_at?: string | null
          locale?: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          account_status?: Database["public"]["Enums"]["account_status"]
          avatar_media_id?: string | null
          created_at?: string
          deleted_at?: string | null
          display_name?: string
          id?: string
          last_login_at?: string | null
          locale?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_avatar_media_id_fkey"
            columns: ["avatar_media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profiles_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["code"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          role_id: string
          user_profile_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          role_id: string
          user_profile_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          role_id?: string
          user_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_profile_id_fkey"
            columns: ["user_profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_website_access: {
        Row: {
          created_at: string
          id: string
          status: Database["public"]["Enums"]["entity_status"]
          user_profile_id: string
          website_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["entity_status"]
          user_profile_id: string
          website_id: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["entity_status"]
          user_profile_id?: string
          website_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_website_access_user_profile_id_fkey"
            columns: ["user_profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_website_access_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "websites"
            referencedColumns: ["id"]
          },
        ]
      }
      websites: {
        Row: {
          analytics_settings_ref: Json
          brand_id: string
          contact_settings_ref: Json
          created_at: string
          created_by: string | null
          default_currency_code: string
          default_locale: string
          deleted_at: string | null
          domain: string
          id: string
          name: string
          seo_defaults: Json
          status: Database["public"]["Enums"]["website_status"]
          subdomain: string | null
          theme_key: string
          updated_at: string
          updated_by: string | null
          website_type: Database["public"]["Enums"]["website_type"]
        }
        Insert: {
          analytics_settings_ref?: Json
          brand_id: string
          contact_settings_ref?: Json
          created_at?: string
          created_by?: string | null
          default_currency_code: string
          default_locale: string
          deleted_at?: string | null
          domain: string
          id?: string
          name: string
          seo_defaults?: Json
          status?: Database["public"]["Enums"]["website_status"]
          subdomain?: string | null
          theme_key?: string
          updated_at?: string
          updated_by?: string | null
          website_type?: Database["public"]["Enums"]["website_type"]
        }
        Update: {
          analytics_settings_ref?: Json
          brand_id?: string
          contact_settings_ref?: Json
          created_at?: string
          created_by?: string | null
          default_currency_code?: string
          default_locale?: string
          deleted_at?: string | null
          domain?: string
          id?: string
          name?: string
          seo_defaults?: Json
          status?: Database["public"]["Enums"]["website_status"]
          subdomain?: string | null
          theme_key?: string
          updated_at?: string
          updated_by?: string | null
          website_type?: Database["public"]["Enums"]["website_type"]
        }
        Relationships: [
          {
            foreignKeyName: "websites_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "websites_default_currency_code_fkey"
            columns: ["default_currency_code"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "websites_default_locale_fkey"
            columns: ["default_locale"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["code"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auth_has_permission: {
        Args: { permission_key: string }
        Returns: boolean
      }
      auth_user_organization_ids: { Args: never; Returns: string[] }
      auth_user_website_ids: { Args: never; Returns: string[] }
    }
    Enums: {
      account_status:
        | "INVITED"
        | "ACTIVE"
        | "SUSPENDED"
        | "DISABLED"
        | "TERMINATED"
      attraction_order_status:
        | "INITIATED"
        | "PENDING_PAYMENT"
        | "CONFIRMED"
        | "FAILED"
        | "CANCELLED"
        | "VOUCHER_ISSUED"
      cms_lifecycle_status:
        | "DRAFT"
        | "IN_REVIEW"
        | "APPROVED"
        | "SCHEDULED"
        | "PUBLISHED"
        | "ARCHIVED"
      cms_page_type:
        | "HOME"
        | "SERVICE_HUB"
        | "LANDING_PAGE"
        | "STATIC_PAGE"
        | "PROGRAM_INSPIRATION"
        | "ARTICLE_INDEX"
        | "PRODUCT_INDEX"
        | "CONTACT"
        | "POLICY"
        | "CUSTOM"
      destination_type:
        | "COUNTRY"
        | "REGION"
        | "PROVINCE_CITY"
        | "DESTINATION"
        | "ATTRACTION"
      entity_status: "ACTIVE" | "INACTIVE" | "ARCHIVED"
      form_submission_status:
        | "NEW"
        | "VALIDATED"
        | "PROCESSED"
        | "REJECTED"
        | "SPAM"
      media_visibility: "PUBLIC" | "PRIVATE"
      navigation_menu_key:
        | "HEADER"
        | "FOOTER"
        | "MOBILE"
        | "SERVICE"
        | "LEGAL"
        | "SOCIAL"
        | "ANNOUNCEMENT_BAR"
      permission_scope_level:
        | "ORGANIZATION"
        | "BRAND"
        | "WEBSITE"
        | "BUSINESS_UNIT"
        | "OWN"
        | "ASSIGNED"
        | "ALL"
      redirect_kind: "301" | "302"
      setting_value_type: "STRING" | "NUMBER" | "BOOLEAN" | "JSON"
      setting_visibility: "PUBLIC" | "INTERNAL"
      settings_scope_level:
        | "GLOBAL"
        | "ORGANIZATION"
        | "BRAND"
        | "WEBSITE"
        | "USER"
      website_status: "ACTIVE" | "PLANNED" | "INACTIVE" | "ARCHIVED"
      website_type: "MAIN_SITE" | "SERVICE_APP" | "PARTNER_PORTAL" | "INTERNAL"
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
      account_status: [
        "INVITED",
        "ACTIVE",
        "SUSPENDED",
        "DISABLED",
        "TERMINATED",
      ],
      attraction_order_status: [
        "INITIATED",
        "PENDING_PAYMENT",
        "CONFIRMED",
        "FAILED",
        "CANCELLED",
        "VOUCHER_ISSUED",
      ],
      cms_lifecycle_status: [
        "DRAFT",
        "IN_REVIEW",
        "APPROVED",
        "SCHEDULED",
        "PUBLISHED",
        "ARCHIVED",
      ],
      cms_page_type: [
        "HOME",
        "SERVICE_HUB",
        "LANDING_PAGE",
        "STATIC_PAGE",
        "PROGRAM_INSPIRATION",
        "ARTICLE_INDEX",
        "PRODUCT_INDEX",
        "CONTACT",
        "POLICY",
        "CUSTOM",
      ],
      destination_type: [
        "COUNTRY",
        "REGION",
        "PROVINCE_CITY",
        "DESTINATION",
        "ATTRACTION",
      ],
      entity_status: ["ACTIVE", "INACTIVE", "ARCHIVED"],
      form_submission_status: [
        "NEW",
        "VALIDATED",
        "PROCESSED",
        "REJECTED",
        "SPAM",
      ],
      media_visibility: ["PUBLIC", "PRIVATE"],
      navigation_menu_key: [
        "HEADER",
        "FOOTER",
        "MOBILE",
        "SERVICE",
        "LEGAL",
        "SOCIAL",
        "ANNOUNCEMENT_BAR",
      ],
      permission_scope_level: [
        "ORGANIZATION",
        "BRAND",
        "WEBSITE",
        "BUSINESS_UNIT",
        "OWN",
        "ASSIGNED",
        "ALL",
      ],
      redirect_kind: ["301", "302"],
      setting_value_type: ["STRING", "NUMBER", "BOOLEAN", "JSON"],
      setting_visibility: ["PUBLIC", "INTERNAL"],
      settings_scope_level: [
        "GLOBAL",
        "ORGANIZATION",
        "BRAND",
        "WEBSITE",
        "USER",
      ],
      website_status: ["ACTIVE", "PLANNED", "INACTIVE", "ARCHIVED"],
      website_type: ["MAIN_SITE", "SERVICE_APP", "PARTNER_PORTAL", "INTERNAL"],
    },
  },
} as const
