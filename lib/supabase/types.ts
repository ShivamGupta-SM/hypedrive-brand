export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string | null
          first_name: string
          id: string
          last_name: string
          phone_number: string
          profile_picture: string | null
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          first_name: string
          id?: string
          last_name: string
          phone_number: string
          profile_picture?: string | null
          role: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          first_name?: string
          id?: string
          last_name?: string
          phone_number?: string
          profile_picture?: string | null
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      brands: {
        Row: {
          address: string | null
          approval_status: Database["public"]["Enums"]["approval_status"]
          approved_by: string | null
          brand_logo_url: string | null
          brand_name: string
          city: string | null
          contact_person: string
          country: string | null
          created_at: string | null
          description: string | null
          gst_number: string
          gst_verified: boolean
          id: string
          is_complete: boolean | null
          phone_number: string
          postal_code: string | null
          slug: string | null
          social_media: Json | null
          state: string | null
          tds_rate: number
          updated_at: string | null
          user_id: string
          website: string | null
        }
        Insert: {
          address?: string | null
          approval_status?: Database["public"]["Enums"]["approval_status"]
          approved_by?: string | null
          brand_logo_url?: string | null
          brand_name: string
          city?: string | null
          contact_person: string
          country?: string | null
          created_at?: string | null
          description?: string | null
          gst_number: string
          gst_verified?: boolean
          id?: string
          is_complete?: boolean | null
          phone_number: string
          postal_code?: string | null
          slug?: string | null
          social_media?: Json | null
          state?: string | null
          tds_rate?: number
          updated_at?: string | null
          user_id: string
          website?: string | null
        }
        Update: {
          address?: string | null
          approval_status?: Database["public"]["Enums"]["approval_status"]
          approved_by?: string | null
          brand_logo_url?: string | null
          brand_name?: string
          city?: string | null
          contact_person?: string
          country?: string | null
          created_at?: string | null
          description?: string | null
          gst_number?: string
          gst_verified?: boolean
          id?: string
          is_complete?: boolean | null
          phone_number?: string
          postal_code?: string | null
          slug?: string | null
          social_media?: Json | null
          state?: string | null
          tds_rate?: number
          updated_at?: string | null
          user_id?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brands_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brands_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_deliverables: {
        Row: {
          campaign_id: string
          created_at: string | null
          deliverable_id: string
          id: string
          is_required: boolean | null
          quantity: number
          updated_at: string | null
        }
        Insert: {
          campaign_id: string
          created_at?: string | null
          deliverable_id: string
          id?: string
          is_required?: boolean | null
          quantity?: number
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string
          created_at?: string | null
          deliverable_id?: string
          id?: string
          is_required?: boolean | null
          quantity?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_deliverables_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_deliverables_deliverable_id_fkey"
            columns: ["deliverable_id"]
            isOneToOne: false
            referencedRelation: "deliverables"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          approval_status: Database["public"]["Enums"]["approval_status"]
          approved_at: string | null
          approved_by: string | null
          bonus_amount: number | null
          brand_id: string
          created_at: string | null
          deduction_amount: number | null
          description: string | null
          end_date: string
          id: string
          max_enrollments: number
          platform_fee_percent: number
          product_id: string | null
          rebate_percentage: number
          slug: string | null
          start_date: string
          status: Database["public"]["Enums"]["campaign_status"]
          title: string
          updated_at: string | null
        }
        Insert: {
          approval_status?: Database["public"]["Enums"]["approval_status"]
          approved_at?: string | null
          approved_by?: string | null
          bonus_amount?: number | null
          brand_id: string
          created_at?: string | null
          deduction_amount?: number | null
          description?: string | null
          end_date: string
          id?: string
          max_enrollments: number
          platform_fee_percent: number
          product_id?: string | null
          rebate_percentage: number
          slug?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["campaign_status"]
          title: string
          updated_at?: string | null
        }
        Update: {
          approval_status?: Database["public"]["Enums"]["approval_status"]
          approved_at?: string | null
          approved_by?: string | null
          bonus_amount?: number | null
          brand_id?: string
          created_at?: string | null
          deduction_amount?: number | null
          description?: string | null
          end_date?: string
          id?: string
          max_enrollments?: number
          platform_fee_percent?: number
          product_id?: string | null
          rebate_percentage?: number
          slug?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["campaign_status"]
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      coupon_redemptions: {
        Row: {
          coupon_id: string
          created_at: string | null
          enrollment_id: string | null
          id: string
          redeemed_at: string | null
          status: Database["public"]["Enums"]["redemption_status"]
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          coupon_id: string
          created_at?: string | null
          enrollment_id?: string | null
          id?: string
          redeemed_at?: string | null
          status?: Database["public"]["Enums"]["redemption_status"]
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          coupon_id?: string
          created_at?: string | null
          enrollment_id?: string | null
          id?: string
          redeemed_at?: string | null
          status?: Database["public"]["Enums"]["redemption_status"]
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coupon_redemptions_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_redemptions_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_redemptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          bonus_amount: number | null
          code: string
          coupon_type: Database["public"]["Enums"]["coupon_type"]
          created_at: string | null
          created_by: string
          discount_percentage: number | null
          id: string
          one_time_use: boolean | null
          specific_campaign_id: string | null
          status: Database["public"]["Enums"]["coupon_status"]
          times_used: number | null
          updated_at: string | null
          usage_limit: number | null
          valid_from: string
          valid_until: string
        }
        Insert: {
          bonus_amount?: number | null
          code: string
          coupon_type?: Database["public"]["Enums"]["coupon_type"]
          created_at?: string | null
          created_by: string
          discount_percentage?: number | null
          id?: string
          one_time_use?: boolean | null
          specific_campaign_id?: string | null
          status?: Database["public"]["Enums"]["coupon_status"]
          times_used?: number | null
          updated_at?: string | null
          usage_limit?: number | null
          valid_from: string
          valid_until: string
        }
        Update: {
          bonus_amount?: number | null
          code?: string
          coupon_type?: Database["public"]["Enums"]["coupon_type"]
          created_at?: string | null
          created_by?: string
          discount_percentage?: number | null
          id?: string
          one_time_use?: boolean | null
          specific_campaign_id?: string | null
          status?: Database["public"]["Enums"]["coupon_status"]
          times_used?: number | null
          updated_at?: string | null
          usage_limit?: number | null
          valid_from?: string
          valid_until?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupons_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupons_specific_campaign_id_fkey"
            columns: ["specific_campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      deliverable_submissions: {
        Row: {
          campaign_deliverable_id: string
          created_at: string | null
          enrollment_id: string
          id: string
          proof_link: string | null
          proof_screenshot: string | null
          updated_at: string | null
        }
        Insert: {
          campaign_deliverable_id: string
          created_at?: string | null
          enrollment_id: string
          id?: string
          proof_link?: string | null
          proof_screenshot?: string | null
          updated_at?: string | null
        }
        Update: {
          campaign_deliverable_id?: string
          created_at?: string | null
          enrollment_id?: string
          id?: string
          proof_link?: string | null
          proof_screenshot?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deliverable_submissions_campaign_deliverable_id_fkey"
            columns: ["campaign_deliverable_id"]
            isOneToOne: false
            referencedRelation: "campaign_deliverables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliverable_submissions_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      deliverables: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          name: string
          status: Database["public"]["Enums"]["deliverable_status"]
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          name: string
          status?: Database["public"]["Enums"]["deliverable_status"]
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["deliverable_status"]
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deliverables_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliverables_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          campaign_id: string
          coupon_id: string | null
          created_at: string | null
          id: string
          order_id: string | null
          purchase_amount: number | null
          purchase_proof: string | null
          shopper_id: string
          status: Database["public"]["Enums"]["enrollment_status"]
          updated_at: string | null
        }
        Insert: {
          campaign_id: string
          coupon_id?: string | null
          created_at?: string | null
          id?: string
          order_id?: string | null
          purchase_amount?: number | null
          purchase_proof?: string | null
          shopper_id: string
          status?: Database["public"]["Enums"]["enrollment_status"]
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string
          coupon_id?: string | null
          created_at?: string | null
          id?: string
          order_id?: string | null
          purchase_amount?: number | null
          purchase_proof?: string | null
          shopper_id?: string
          status?: Database["public"]["Enums"]["enrollment_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_shopper_id_fkey"
            columns: ["shopper_id"]
            isOneToOne: false
            referencedRelation: "shoppers"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          amount: number
          created_at: string | null
          enrollment_id: string
          id: string
          invoice_id: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          enrollment_id: string
          id?: string
          invoice_id: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          enrollment_id?: string
          id?: string
          invoice_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          invoice_id: string
          payment_id: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          invoice_id: string
          payment_id: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          invoice_id?: string
          payment_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_payments_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          brand_id: string
          created_at: string | null
          due_date: string
          gst_amount: number
          id: string
          invoice_date: string
          invoice_number: string
          notes: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          subtotal: number
          tds_amount: number
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          brand_id: string
          created_at?: string | null
          due_date: string
          gst_amount?: number
          id?: string
          invoice_date: string
          invoice_number: string
          notes?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal: number
          tds_amount?: number
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          brand_id?: string
          created_at?: string | null
          due_date?: string
          gst_amount?: number
          id?: string
          invoice_date?: string
          invoice_number?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          tds_amount?: number
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string | null
          email_notifications: boolean | null
          id: string
          push_notifications: boolean | null
          sms_notifications: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          push_notifications?: boolean | null
          sms_notifications?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          push_notifications?: boolean | null
          sms_notifications?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          status: Database["public"]["Enums"]["notification_status"]
          title: string
          type: Database["public"]["Enums"]["notification_context"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          status?: Database["public"]["Enums"]["notification_status"]
          title: string
          type: Database["public"]["Enums"]["notification_context"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          status?: Database["public"]["Enums"]["notification_status"]
          title?: string
          type?: Database["public"]["Enums"]["notification_context"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payout_methods: {
        Row: {
          account_details: Json
          created_at: string | null
          id: string
          is_default: boolean | null
          method_type: string
          shopper_id: string
          updated_at: string | null
        }
        Insert: {
          account_details: Json
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          method_type: string
          shopper_id: string
          updated_at?: string | null
        }
        Update: {
          account_details?: Json
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          method_type?: string
          shopper_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payout_methods_shopper_id_fkey"
            columns: ["shopper_id"]
            isOneToOne: false
            referencedRelation: "shoppers"
            referencedColumns: ["id"]
          },
        ]
      }
      payouts: {
        Row: {
          amount: number
          created_at: string | null
          enrollment_id: string
          id: string
          payout_method_id: string | null
          processed_at: string | null
          shopper_id: string
          status: Database["public"]["Enums"]["payout_status"]
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          enrollment_id: string
          id?: string
          payout_method_id?: string | null
          processed_at?: string | null
          shopper_id: string
          status?: Database["public"]["Enums"]["payout_status"]
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          enrollment_id?: string
          id?: string
          payout_method_id?: string | null
          processed_at?: string | null
          shopper_id?: string
          status?: Database["public"]["Enums"]["payout_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payouts_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payouts_payout_method_id_fkey"
            columns: ["payout_method_id"]
            isOneToOne: false
            referencedRelation: "payout_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payouts_shopper_id_fkey"
            columns: ["shopper_id"]
            isOneToOne: false
            referencedRelation: "shoppers"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          gateway_payment_id: string | null
          gateway_response: Json | null
          id: string
          payment_method: string | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          gateway_payment_id?: string | null
          gateway_response?: Json | null
          id?: string
          payment_method?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          gateway_payment_id?: string | null
          gateway_response?: Json | null
          id?: string
          payment_method?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      platforms: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          icon: string | null
          id: string
          logo: string | null
          name: string
          status: Database["public"]["Enums"]["platform_status"]
          type: string
          updated_at: string | null
          updated_by: string | null
          website_url: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          icon?: string | null
          id?: string
          logo?: string | null
          name: string
          status?: Database["public"]["Enums"]["platform_status"]
          type: string
          updated_at?: string | null
          updated_by?: string | null
          website_url?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          icon?: string | null
          id?: string
          logo?: string | null
          name?: string
          status?: Database["public"]["Enums"]["platform_status"]
          type?: string
          updated_at?: string | null
          updated_by?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "platforms_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platforms_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          icon: string | null
          id: string
          logo: string | null
          name: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          icon?: string | null
          id?: string
          logo?: string | null
          name: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          icon?: string | null
          id?: string
          logo?: string | null
          name?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_categories_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand_id: string
          category_id: string | null
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          name: string
          platform_id: string | null
          price: number
          product_images: string[]
          product_link: string
          sku: string
          slug: string | null
          updated_at: string | null
          updated_by: string | null
          views: number | null
        }
        Insert: {
          brand_id: string
          category_id?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          name: string
          platform_id?: string | null
          price: number
          product_images: string[]
          product_link: string
          sku: string
          slug?: string | null
          updated_at?: string | null
          updated_by?: string | null
          views?: number | null
        }
        Update: {
          brand_id?: string
          category_id?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          platform_id?: string | null
          price?: number
          product_images?: string[]
          product_link?: string
          sku?: string
          slug?: string | null
          updated_at?: string | null
          updated_by?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "platforms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      shoppers: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string | null
          dob: string
          first_name: string
          id: string
          kyc_verified: boolean
          last_name: string
          phone_number: string | null
          postal_code: string | null
          profile_picture: string | null
          state: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          dob: string
          first_name: string
          id?: string
          kyc_verified?: boolean
          last_name: string
          phone_number?: string | null
          postal_code?: string | null
          profile_picture?: string | null
          state?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          dob?: string
          first_name?: string
          id?: string
          kyc_verified?: boolean
          last_name?: string
          phone_number?: string | null
          postal_code?: string | null
          profile_picture?: string | null
          state?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shoppers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          ban_expires: string | null
          ban_reason: string | null
          banned: boolean
          created_at: string | null
          email: string
          email_verified: boolean
          id: string
          image: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          ban_expires?: string | null
          ban_reason?: string | null
          banned?: boolean
          created_at?: string | null
          email: string
          email_verified?: boolean
          id?: string
          image?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          ban_expires?: string | null
          ban_reason?: string | null
          banned?: boolean
          created_at?: string | null
          email?: string
          email_verified?: boolean
          id?: string
          image?: string | null
          name?: string
          updated_at?: string | null
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
      approval_status: "pending" | "approved" | "rejected" | "banned"
      campaign_status: "draft" | "active" | "expired" | "completed" | "cancelled"
      coupon_status: "active" | "inactive" | "expired"
      coupon_type: "fixed" | "percentage"
      deliverable_status: "active" | "inactive" | "deprecated"
      enrollment_status: "pending" | "submitted" | "approved" | "rejected" | "withdrawn" | "invoiced" | "paid" | "expired"
      invoice_status: "draft" | "sent" | "overdue" | "paid" | "void" | "unpaid" | "partially_paid" | "viewed"
      notification_context: "enrollment" | "campaign" | "invoice" | "payout" | "review"
      notification_status: "unread" | "read"
      payment_status: "pending" | "successful" | "failed" | "refunded" | "cancelled"
      payout_status: "draft" | "queued" | "pending" | "processing" | "processed" | "rejected" | "cancelled" | "reversed" | "failed"
      platform_status: "active" | "inactive" | "maintenance"
      redemption_status: "redeemed" | "expired" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// =========================
// ENUM TYPES (for backward compatibility)
// =========================
export type ApprovalStatus = Database["public"]["Enums"]["approval_status"]
export type CampaignStatus = Database["public"]["Enums"]["campaign_status"]
export type CouponStatus = Database["public"]["Enums"]["coupon_status"]
export type CouponType = Database["public"]["Enums"]["coupon_type"]
export type EnrollmentStatus = Database["public"]["Enums"]["enrollment_status"]
export type InvoiceStatus = Database["public"]["Enums"]["invoice_status"]
export type PaymentStatus = Database["public"]["Enums"]["payment_status"]
export type PayoutStatus = Database["public"]["Enums"]["payout_status"]
export type NotificationStatus = Database["public"]["Enums"]["notification_status"]
export type NotificationContext = Database["public"]["Enums"]["notification_context"]
export type DeliverableStatus = Database["public"]["Enums"]["deliverable_status"]
export type PlatformStatus = Database["public"]["Enums"]["platform_status"]
export type RedemptionStatus = Database["public"]["Enums"]["redemption_status"]

// =========================
// TABLE TYPES
// =========================
export type User = Database['public']['Tables']['users']['Row']
export type Admin = Database['public']['Tables']['admins']['Row']
export type Shopper = Database['public']['Tables']['shoppers']['Row']
export type Brand = Database['public']['Tables']['brands']['Row']
export type ProductCategory = Database['public']['Tables']['product_categories']['Row']
export type Platform = Database['public']['Tables']['platforms']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type Campaign = Database['public']['Tables']['campaigns']['Row']
export type Coupon = Database['public']['Tables']['coupons']['Row']
export type Deliverable = Database['public']['Tables']['deliverables']['Row']
export type CampaignDeliverable = Database['public']['Tables']['campaign_deliverables']['Row']
export type Enrollment = Database['public']['Tables']['enrollments']['Row']
export type DeliverableSubmission = Database['public']['Tables']['deliverable_submissions']['Row']
export type Invoice = Database['public']['Tables']['invoices']['Row']
export type InvoiceItem = Database['public']['Tables']['invoice_items']['Row']
export type Payment = Database['public']['Tables']['payments']['Row']
export type InvoicePayment = Database['public']['Tables']['invoice_payments']['Row']
export type PayoutMethod = Database['public']['Tables']['payout_methods']['Row']
export type Payout = Database['public']['Tables']['payouts']['Row']
export type NotificationPreference = Database['public']['Tables']['notification_preferences']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type CouponRedemption = Database['public']['Tables']['coupon_redemptions']['Row']

// =========================
// INSERT TYPES
// =========================
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type AdminInsert = Database['public']['Tables']['admins']['Insert']
export type ShopperInsert = Database['public']['Tables']['shoppers']['Insert']
export type BrandInsert = Database['public']['Tables']['brands']['Insert']
export type ProductCategoryInsert = Database['public']['Tables']['product_categories']['Insert']
export type PlatformInsert = Database['public']['Tables']['platforms']['Insert']
export type ProductInsert = Database['public']['Tables']['products']['Insert']
export type CampaignInsert = Database['public']['Tables']['campaigns']['Insert']
export type CouponInsert = Database['public']['Tables']['coupons']['Insert']
export type DeliverableInsert = Database['public']['Tables']['deliverables']['Insert']
export type CampaignDeliverableInsert = Database['public']['Tables']['campaign_deliverables']['Insert']
export type EnrollmentInsert = Database['public']['Tables']['enrollments']['Insert']
export type DeliverableSubmissionInsert = Database['public']['Tables']['deliverable_submissions']['Insert']
export type InvoiceInsert = Database['public']['Tables']['invoices']['Insert']
export type InvoiceItemInsert = Database['public']['Tables']['invoice_items']['Insert']
export type PaymentInsert = Database['public']['Tables']['payments']['Insert']
export type InvoicePaymentInsert = Database['public']['Tables']['invoice_payments']['Insert']
export type PayoutMethodInsert = Database['public']['Tables']['payout_methods']['Insert']
export type PayoutInsert = Database['public']['Tables']['payouts']['Insert']
export type NotificationPreferenceInsert = Database['public']['Tables']['notification_preferences']['Insert']
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert']
export type CouponRedemptionInsert = Database['public']['Tables']['coupon_redemptions']['Insert']

// =========================
// UPDATE TYPES
// =========================
export type UserUpdate = Database['public']['Tables']['users']['Update']
export type AdminUpdate = Database['public']['Tables']['admins']['Update']
export type ShopperUpdate = Database['public']['Tables']['shoppers']['Update']
export type BrandUpdate = Database['public']['Tables']['brands']['Update']
export type ProductCategoryUpdate = Database['public']['Tables']['product_categories']['Update']
export type PlatformUpdate = Database['public']['Tables']['platforms']['Update']
export type ProductUpdate = Database['public']['Tables']['products']['Update']
export type CampaignUpdate = Database['public']['Tables']['campaigns']['Update']
export type CouponUpdate = Database['public']['Tables']['coupons']['Update']
export type DeliverableUpdate = Database['public']['Tables']['deliverables']['Update']
export type CampaignDeliverableUpdate = Database['public']['Tables']['campaign_deliverables']['Update']
export type EnrollmentUpdate = Database['public']['Tables']['enrollments']['Update']
export type DeliverableSubmissionUpdate = Database['public']['Tables']['deliverable_submissions']['Update']
export type InvoiceUpdate = Database['public']['Tables']['invoices']['Update']
export type InvoiceItemUpdate = Database['public']['Tables']['invoice_items']['Update']
export type PaymentUpdate = Database['public']['Tables']['payments']['Update']
export type InvoicePaymentUpdate = Database['public']['Tables']['invoice_payments']['Update']
export type PayoutMethodUpdate = Database['public']['Tables']['payout_methods']['Update']
export type PayoutUpdate = Database['public']['Tables']['payouts']['Update']
export type NotificationPreferenceUpdate = Database['public']['Tables']['notification_preferences']['Update']
export type NotificationUpdate = Database['public']['Tables']['notifications']['Update']
export type CouponRedemptionUpdate = Database['public']['Tables']['coupon_redemptions']['Update']

// =========================
// EXTENDED TYPES WITH RELATIONSHIPS
// =========================
export interface BrandWithUser extends Brand {
  user: User
}

export interface CampaignWithBrand extends Campaign {
  brand: Brand
  product?: Product
}

export interface CampaignWithDetails extends Campaign {
  brand: Brand
  product?: Product
  campaign_deliverables: (CampaignDeliverable & {
    deliverable: Deliverable
  })[]
}

export interface EnrollmentWithDetails extends Enrollment {
  campaign: CampaignWithBrand
  shopper: Shopper & { user: User }
  coupon?: Coupon
  deliverable_submissions: (DeliverableSubmission & {
    campaign_deliverable: CampaignDeliverable & {
      deliverable: Deliverable
    }
  })[]
}

export interface InvoiceWithDetails extends Invoice {
  brand: Brand
  invoice_items: (InvoiceItem & {
    enrollment: EnrollmentWithDetails
  })[]
  invoice_payments: (InvoicePayment & {
    payment: Payment
  })[]
}

export interface ProductWithDetails extends Product {
  brand: Brand
  category?: ProductCategory
  platform?: Platform
}

export interface PayoutWithDetails extends Payout {
  enrollment: EnrollmentWithDetails
  shopper: Shopper & { user: User }
  payout_method?: PayoutMethod
}

// =========================
// API RESPONSE TYPES
// =========================
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  success: boolean
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// =========================
// AUTH TYPES
// =========================
export interface CustomClaims {
  user_role: 'admin' | 'brand' | 'shopper' | 'guest'
  brands: Array<{
    brand_id: string
    role: 'owner'
    brand_name: string
  }>
  is_admin: boolean
  is_shopper: boolean
  profile_complete: boolean
  verification_status: {
    email_verified: boolean
    phone_verified: boolean
    kyc_verified: boolean
    gst_verified?: boolean
  }
}

export interface AuthUser {
  id: string
  email: string
  user_metadata: {
    full_name?: string
    avatar_url?: string
    provider?: string
  }
  app_metadata: {
    provider?: string
    providers?: string[]
  }
  created_at: string
  updated_at: string
  email_confirmed_at?: string
  phone_confirmed_at?: string
  confirmed_at?: string
  last_sign_in_at?: string
  role?: string
  custom_claims?: CustomClaims
}