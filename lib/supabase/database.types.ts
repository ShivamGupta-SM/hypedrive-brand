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
          category: string
          created_at: string | null
          id: string
          name: string
          platform_id: string | null
          require_link: boolean | null
          require_screenshot: boolean | null
          status: Database["public"]["Enums"]["deliverable_status"] | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          name: string
          platform_id?: string | null
          require_link?: boolean | null
          require_screenshot?: boolean | null
          status?: Database["public"]["Enums"]["deliverable_status"] | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          name?: string
          platform_id?: string | null
          require_link?: boolean | null
          require_screenshot?: boolean | null
          status?: Database["public"]["Enums"]["deliverable_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deliverables_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          approval_remarks: string | null
          base_rebate_amount: number
          bonus_amount: number | null
          campaign_id: string
          coupon_adjustment: number | null
          coupon_id: string | null
          created_at: string | null
          deduction_amount: number | null
          expires_at: string | null
          final_rebate_amount: number | null
          id: string
          locked_platform_fee_percent: number
          locked_rebate_percentage: number
          order_id: string
          order_screenshot_url: string | null
          order_value: number
          platform_profit: number | null
          purchase_date: string | null
          shopper_id: string
          status: Database["public"]["Enums"]["enrollment_status"]
          updated_at: string | null
        }
        Insert: {
          approval_remarks?: string | null
          base_rebate_amount: number
          bonus_amount?: number | null
          campaign_id: string
          coupon_adjustment?: number | null
          coupon_id?: string | null
          created_at?: string | null
          deduction_amount?: number | null
          expires_at?: string | null
          final_rebate_amount?: number | null
          id?: string
          locked_platform_fee_percent: number
          locked_rebate_percentage: number
          order_id: string
          order_screenshot_url?: string | null
          order_value: number
          platform_profit?: number | null
          purchase_date?: string | null
          shopper_id: string
          status?: Database["public"]["Enums"]["enrollment_status"]
          updated_at?: string | null
        }
        Update: {
          approval_remarks?: string | null
          base_rebate_amount?: number
          bonus_amount?: number | null
          campaign_id?: string
          coupon_adjustment?: number | null
          coupon_id?: string | null
          created_at?: string | null
          deduction_amount?: number | null
          expires_at?: string | null
          final_rebate_amount?: number | null
          id?: string
          locked_platform_fee_percent?: number
          locked_rebate_percentage?: number
          order_id?: string
          order_screenshot_url?: string | null
          order_value?: number
          platform_profit?: number | null
          purchase_date?: string | null
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
          created_at: string | null
          enrollment_id: string
          id: string
          invoice_id: string
          line_total: number
          quantity: number
          unit_price: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          enrollment_id: string
          id?: string
          invoice_id: string
          line_total: number
          quantity?: number
          unit_price: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          enrollment_id?: string
          id?: string
          invoice_id?: string
          line_total?: number
          quantity?: number
          unit_price?: number
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
          applied_amount: number
          created_at: string | null
          id: string
          invoice_id: string
          payment_id: string
          remaining_amount: number
          updated_at: string | null
        }
        Insert: {
          applied_amount: number
          created_at?: string | null
          id?: string
          invoice_id: string
          payment_id: string
          remaining_amount: number
          updated_at?: string | null
        }
        Update: {
          applied_amount?: number
          created_at?: string | null
          id?: string
          invoice_id?: string
          payment_id?: string
          remaining_amount?: number
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
          amount_paid: number | null
          brand_id: string
          created_at: string | null
          due_date: string
          gst_amount: number
          id: string
          invoice_number: string
          issued_at: string | null
          payout_processed: boolean | null
          status: Database["public"]["Enums"]["invoice_status"]
          subtotal: number
          tds_amount: number
          tds_percentage: number
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          amount_paid?: number | null
          brand_id: string
          created_at?: string | null
          due_date: string
          gst_amount: number
          id?: string
          invoice_number: string
          issued_at?: string | null
          payout_processed?: boolean | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal: number
          tds_amount: number
          tds_percentage: number
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          amount_paid?: number | null
          brand_id?: string
          created_at?: string | null
          due_date?: string
          gst_amount?: number
          id?: string
          invoice_number?: string
          issued_at?: string | null
          payout_processed?: boolean | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          tds_amount?: number
          tds_percentage?: number
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
          email: boolean | null
          id: string
          in_app: boolean | null
          push_notifications: boolean | null
          updated_at: string | null
          user_id: string
          whatsapp: boolean | null
        }
        Insert: {
          created_at?: string | null
          email?: boolean | null
          id?: string
          in_app?: boolean | null
          push_notifications?: boolean | null
          updated_at?: string | null
          user_id: string
          whatsapp?: boolean | null
        }
        Update: {
          created_at?: string | null
          email?: boolean | null
          id?: string
          in_app?: boolean | null
          push_notifications?: boolean | null
          updated_at?: string | null
          user_id?: string
          whatsapp?: boolean | null
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
      payments: {
        Row: {
          amount: number
          brand_id: string
          created_at: string | null
          id: string
          razorpay_payment_id: string
          razorpay_va_id: string
          received_at: string | null
          status: Database["public"]["Enums"]["payment_status"]
          transaction_source: string
          updated_at: string | null
          utr_reference: string
        }
        Insert: {
          amount: number
          brand_id: string
          created_at?: string | null
          id?: string
          razorpay_payment_id: string
          razorpay_va_id: string
          received_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_source: string
          updated_at?: string | null
          utr_reference: string
        }
        Update: {
          amount?: number
          brand_id?: string
          created_at?: string | null
          id?: string
          razorpay_payment_id?: string
          razorpay_va_id?: string
          received_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_source?: string
          updated_at?: string | null
          utr_reference?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      payout_methods: {
        Row: {
          account_holder_name: string | null
          account_number: string | null
          bank_name: string | null
          created_at: string | null
          id: string
          ifsc_code: string | null
          is_verified: boolean | null
          payment_method: string
          shopper_id: string
          updated_at: string | null
          upi_id: string | null
        }
        Insert: {
          account_holder_name?: string | null
          account_number?: string | null
          bank_name?: string | null
          created_at?: string | null
          id?: string
          ifsc_code?: string | null
          is_verified?: boolean | null
          payment_method: string
          shopper_id: string
          updated_at?: string | null
          upi_id?: string | null
        }
        Update: {
          account_holder_name?: string | null
          account_number?: string | null
          bank_name?: string | null
          created_at?: string | null
          id?: string
          ifsc_code?: string | null
          is_verified?: boolean | null
          payment_method?: string
          shopper_id?: string
          updated_at?: string | null
          upi_id?: string | null
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
          failure_reason: string | null
          id: string
          last_retry_at: string | null
          payout_method_id: string | null
          payout_status: Database["public"]["Enums"]["payout_status"] | null
          processed_at: string | null
          razorpay_payout_id: string
          retry_count: number | null
          shopper_id: string
          updated_at: string | null
          utr: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          enrollment_id: string
          failure_reason?: string | null
          id?: string
          last_retry_at?: string | null
          payout_method_id?: string | null
          payout_status?: Database["public"]["Enums"]["payout_status"] | null
          processed_at?: string | null
          razorpay_payout_id: string
          retry_count?: number | null
          shopper_id: string
          updated_at?: string | null
          utr?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          enrollment_id?: string
          failure_reason?: string | null
          id?: string
          last_retry_at?: string | null
          payout_method_id?: string | null
          payout_status?: Database["public"]["Enums"]["payout_status"] | null
          processed_at?: string | null
          razorpay_payout_id?: string
          retry_count?: number | null
          shopper_id?: string
          updated_at?: string | null
          utr?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payouts_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: true
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
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platforms_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
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
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_categories_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
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
          kyc_verified: boolean | null
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
          kyc_verified?: boolean | null
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
          kyc_verified?: boolean | null
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
          banned: boolean | null
          created_at: string
          email: string
          email_verified: boolean
          id: string
          image: string | null
          name: string
          updated_at: string
        }
        Insert: {
          ban_expires?: string | null
          ban_reason?: string | null
          banned?: boolean | null
          created_at?: string
          email: string
          email_verified?: boolean
          id?: string
          image?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          ban_expires?: string | null
          ban_reason?: string | null
          banned?: boolean | null
          created_at?: string
          email?: string
          email_verified?: boolean
          id?: string
          image?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auto_expire_campaigns: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      citext: {
        Args: { "": boolean } | { "": string } | { "": unknown }
        Returns: string
      }
      citext_hash: {
        Args: { "": string }
        Returns: number
      }
      citextin: {
        Args: { "": unknown }
        Returns: string
      }
      citextout: {
        Args: { "": string }
        Returns: unknown
      }
      citextrecv: {
        Args: { "": unknown }
        Returns: string
      }
      citextsend: {
        Args: { "": string }
        Returns: string
      }
      extract_auth_metadata: {
        Args: { user_metadata: Json }
        Returns: {
          avatar_url: string
          display_name: string
          email_verified: boolean
          provider: string
        }[]
      }
      get_custom_claims: {
        Args: { user_id: string }
        Returns: Json
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_brand_actor_optimized: {
        Args: { p_allowed_roles?: string[]; p_brand_id: string }
        Returns: boolean
      }
      is_campaign_actor: {
        Args: { p_allowed_roles?: string[]; p_campaign_id: string }
        Returns: boolean
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      validate_campaign_status_transition: {
        Args: {
          new_status: Database["public"]["Enums"]["campaign_status"]
          old_status: Database["public"]["Enums"]["campaign_status"]
        }
        Returns: boolean
      }
      validate_enrollment_status_transition: {
        Args: {
          new_status: Database["public"]["Enums"]["enrollment_status"]
          old_status: Database["public"]["Enums"]["enrollment_status"]
        }
        Returns: boolean
      }
      validate_invoice_status_transition: {
        Args: {
          new_status: Database["public"]["Enums"]["invoice_status"]
          old_status: Database["public"]["Enums"]["invoice_status"]
        }
        Returns: boolean
      }
    }
    Enums: {
      approval_status: "pending" | "approved" | "rejected" | "banned"
      campaign_status:
        | "draft"
        | "active"
        | "expired"
        | "completed"
        | "cancelled"
      coupon_status: "active" | "inactive" | "expired"
      coupon_type: "fixed" | "percentage"
      deliverable_status: "active" | "inactive" | "deprecated"
      enrollment_status:
        | "pending"
        | "submitted"
        | "approved"
        | "rejected"
        | "withdrawn"
        | "invoiced"
        | "paid"
        | "expired"
      invoice_status:
        | "draft"
        | "sent"
        | "overdue"
        | "paid"
        | "void"
        | "unpaid"
        | "partially_paid"
        | "viewed"
      notification_context:
        | "enrollment"
        | "campaign"
        | "invoice"
        | "payout"
        | "review"
      notification_status: "unread" | "read"
      payment_status:
        | "pending"
        | "successful"
        | "failed"
        | "refunded"
        | "cancelled"
      payout_status:
        | "draft"
        | "queued"
        | "pending"
        | "processing"
        | "processed"
        | "rejected"
        | "cancelled"
        | "reversed"
        | "failed"
      platform_status: "active" | "inactive" | "maintenance"
      redemption_status: "redeemed" | "expired" | "cancelled"
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
      approval_status: ["pending", "approved", "rejected", "banned"],
      campaign_status: ["draft", "active", "expired", "completed", "cancelled"],
      coupon_status: ["active", "inactive", "expired"],
      coupon_type: ["fixed", "percentage"],
      deliverable_status: ["active", "inactive", "deprecated"],
      enrollment_status: [
        "pending",
        "submitted",
        "approved",
        "rejected",
        "withdrawn",
        "invoiced",
        "paid",
        "expired",
      ],
      invoice_status: [
        "draft",
        "sent",
        "overdue",
        "paid",
        "void",
        "unpaid",
        "partially_paid",
        "viewed",
      ],
      notification_context: [
        "enrollment",
        "campaign",
        "invoice",
        "payout",
        "review",
      ],
      notification_status: ["unread", "read"],
      payment_status: [
        "pending",
        "successful",
        "failed",
        "refunded",
        "cancelled",
      ],
      payout_status: [
        "draft",
        "queued",
        "pending",
        "processing",
        "processed",
        "rejected",
        "cancelled",
        "reversed",
        "failed",
      ],
      platform_status: ["active", "inactive", "maintenance"],
      redemption_status: ["redeemed", "expired", "cancelled"],
    },
  },
} as const
