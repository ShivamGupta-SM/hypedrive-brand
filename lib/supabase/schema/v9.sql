BEGIN;

-- ====================================================================
-- Hypedrive Platform • Fresh Install (Production-Ready, Neatly Organized)
-- One-shot: extensions → enums → functions (table-independent)
-- → tables → functions (table-dependent) → triggers → indexes → RLS
-- → storage → cron → seed
-- ====================================================================

-- =========================
-- 00 • EXTENSIONS
-- =========================
CREATE EXTENSION IF NOT EXISTS pgcrypto;        -- gen_random_uuid(), digest()
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";     -- uuid_generate_v4()
CREATE EXTENSION IF NOT EXISTS citext;          -- case-insensitive text
CREATE EXTENSION IF NOT EXISTS pg_trgm;         -- text search ops (GIN trigram)
CREATE EXTENSION IF NOT EXISTS pg_cron;         -- cron scheduler

-- =========================
-- 01 • ENUM TYPES
-- =========================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'approval_status') THEN
    CREATE TYPE approval_status AS ENUM ('pending','approved','rejected','banned');
  END IF;

  -- Lifecycle-only: single source of truth for campaign state
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'campaign_status') THEN
    CREATE TYPE campaign_status AS ENUM ('draft','active','expired','completed','cancelled');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'coupon_status') THEN
    CREATE TYPE coupon_status AS ENUM ('active','inactive','expired');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'coupon_type') THEN
    CREATE TYPE coupon_type AS ENUM ('fixed','percentage');
  END IF;

  -- Enrollment status is single source of truth (keeps 'invoiced'; boolean removed)
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enrollment_status') THEN
    CREATE TYPE enrollment_status AS ENUM ('pending','submitted','approved','rejected','withdrawn','invoiced','paid','expired');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invoice_status') THEN
    CREATE TYPE invoice_status AS ENUM ('draft','sent','overdue','paid','void','unpaid','partially_paid','viewed');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE payment_status AS ENUM ('pending','successful','failed','refunded','cancelled');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payout_status') THEN
    CREATE TYPE payout_status AS ENUM ('draft','queued','pending','processing','processed','rejected','cancelled','reversed','failed');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_status') THEN
    CREATE TYPE notification_status AS ENUM ('unread','read');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_context') THEN
    CREATE TYPE notification_context AS ENUM ('enrollment','campaign','invoice','payout','review');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'deliverable_status') THEN
    CREATE TYPE deliverable_status AS ENUM ('active','inactive','deprecated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'platform_status') THEN
    CREATE TYPE platform_status AS ENUM ('active','inactive','maintenance');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'redemption_status') THEN
    CREATE TYPE redemption_status AS ENUM ('redeemed','expired','cancelled');
  END IF;
END$$;

-- =========================
-- 02 • FUNCTIONS (TABLE-INDEPENDENT)
-- =========================

-- Product image array validator
CREATE OR REPLACE FUNCTION validate_product_images()
RETURNS TRIGGER AS $$
DECLARE
  u TEXT;
  n INT := COALESCE(array_length(NEW.product_images,1),0);
BEGIN
  IF n = 0 THEN RAISE EXCEPTION 'product_images must contain at least one URL'; END IF;
  IF n > 10 THEN RAISE EXCEPTION 'product_images cannot contain more than 10 URLs'; END IF;

  FOREACH u IN ARRAY NEW.product_images LOOP
    IF u IS NULL OR u !~* '^https?://(?:[\w-]+\.)+[\w-]+(?:/[\w\-./?%&=]*)?\.(jpg|jpeg|png|webp|gif|avif)$' THEN
      RAISE EXCEPTION 'Invalid product image URL: %', u;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Extract auth metadata (Supabase)
CREATE OR REPLACE FUNCTION extract_auth_metadata(user_metadata JSONB)
RETURNS TABLE(display_name TEXT, avatar_url TEXT, provider TEXT, email_verified BOOLEAN)
LANGUAGE SQL IMMUTABLE AS $$
  SELECT
    COALESCE(user_metadata->>'full_name', user_metadata->>'name', user_metadata->>'display_name'),
    COALESCE(user_metadata->>'avatar_url', user_metadata->>'picture'),
    user_metadata->>'provider',
    COALESCE((user_metadata->>'email_verified')::boolean, false);
$$;

-- Status transition validators
CREATE OR REPLACE FUNCTION validate_enrollment_status_transition(
  old_status enrollment_status, new_status enrollment_status
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN CASE
    WHEN old_status IS NULL       THEN new_status = 'pending'
    WHEN old_status = 'pending'   THEN new_status IN ('submitted','withdrawn','expired')
    WHEN old_status = 'submitted' THEN new_status IN ('approved','rejected')
    WHEN old_status = 'approved'  THEN new_status IN ('invoiced')
    WHEN old_status = 'invoiced'  THEN new_status IN ('paid')
    WHEN old_status = 'paid'      THEN FALSE
    WHEN old_status = 'rejected'  THEN new_status IN ('pending')
    WHEN old_status = 'withdrawn' THEN new_status IN ('pending')
    WHEN old_status = 'expired'   THEN FALSE
    ELSE FALSE
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION validate_campaign_status_transition(
  old_status campaign_status, new_status campaign_status
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN CASE
    WHEN old_status IS NULL  THEN new_status = 'draft'
    WHEN old_status = 'draft' THEN new_status IN ('active','cancelled')
    WHEN old_status = 'active' THEN new_status IN ('completed','expired','cancelled')
    WHEN old_status IN ('completed','expired','cancelled') THEN FALSE
    ELSE FALSE
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION validate_invoice_status_transition(
  old_status invoice_status, new_status invoice_status
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN CASE
    WHEN old_status IS NULL   THEN new_status='draft'
    WHEN old_status='draft'   THEN new_status IN ('sent','void')
    WHEN old_status='sent'    THEN new_status IN ('viewed','overdue','partially_paid','paid','void')
    WHEN old_status='viewed'  THEN new_status IN ('overdue','partially_paid','paid')
    WHEN old_status='overdue' THEN new_status IN ('partially_paid','paid','void')
    WHEN old_status='unpaid'  THEN new_status IN ('partially_paid','paid','void')
    WHEN old_status IN ('paid','void') THEN FALSE
    ELSE FALSE
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- updated_at helper
CREATE OR REPLACE FUNCTION _touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

-- =========================
-- 03 • TABLES
-- =========================

-- users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email CITEXT NOT NULL UNIQUE CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  banned BOOLEAN DEFAULT FALSE,
  ban_reason TEXT,
  ban_expires TIMESTAMPTZ
);
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- admins
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name  VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  role VARCHAR(50) NOT NULL,
  profile_picture TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_admin_phone_basic CHECK (phone_number ~ '^\+?[0-9\s\-\(\)]{10,20}$'),
  CONSTRAINT check_admin_role_valid CHECK (role IN ('super_admin','admin','manager','analyst','support','content_moderator')),
  CONSTRAINT check_admin_profile_picture_format CHECK (
    profile_picture IS NULL OR profile_picture ~* '^https?://.+\.(jpg|jpeg|png|webp|gif)$'
  )
);
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- shoppers
CREATE TABLE IF NOT EXISTS shoppers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name  VARCHAR(100) NOT NULL,
  dob DATE NOT NULL,
  phone_number VARCHAR(20),
  address TEXT, city VARCHAR(100), state VARCHAR(100), postal_code VARCHAR(10),
  profile_picture TEXT, country VARCHAR(2),
  kyc_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_shopper_age_valid CHECK (
    dob <= CURRENT_DATE - INTERVAL '18 years' AND dob >= CURRENT_DATE - INTERVAL '100 years'
  ),
  CONSTRAINT check_shopper_phone_basic CHECK (
    phone_number IS NULL OR phone_number ~ '^\+?[0-9\s\-\(\)]{10,20}$'
  ),
  CONSTRAINT check_shopper_postal_code_basic CHECK (postal_code IS NULL OR postal_code ~ '^[0-9]{5,10}$'),
  CONSTRAINT check_shopper_profile_picture_format CHECK (profile_picture IS NULL OR profile_picture ~* '^https?://.+\.(jpg|jpeg|png|webp|gif)$'),
  CONSTRAINT check_shopper_country_code_valid CHECK (country IS NULL OR country ~* '^[A-Z]{2}$')
);
ALTER TABLE shoppers ENABLE ROW LEVEL SECURITY;

-- brands
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  brand_name VARCHAR(255) NOT NULL,
  brand_logo_url TEXT,
  description TEXT,
  website TEXT,
  social_media JSONB,
  gst_number VARCHAR(15) UNIQUE NOT NULL,
  gst_verified BOOLEAN NOT NULL DEFAULT TRUE,
  contact_person VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  tds_rate DECIMAL(5,2) NOT NULL DEFAULT 10.00,
  approval_status approval_status NOT NULL DEFAULT 'pending',
  address TEXT, city VARCHAR(100), state VARCHAR(100), country VARCHAR(2), postal_code VARCHAR(10),
  is_complete BOOLEAN DEFAULT FALSE,
  slug TEXT,
  approved_by UUID REFERENCES admins(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT ck_brand_gstin_format CHECK (gst_number ~* '^[0-9A-Z]{15}$')
);
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

-- product_categories
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon TEXT, logo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  CONSTRAINT check_category_icon_basic CHECK (icon IS NULL OR icon LIKE 'http%'),
  CONSTRAINT check_category_logo_basic CHECK (logo IS NULL OR logo LIKE 'http%')
);
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

-- platforms
CREATE TABLE IF NOT EXISTS platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  type VARCHAR(50) NOT NULL,
  website_url TEXT,
  logo TEXT,
  icon TEXT,
  status platform_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  CONSTRAINT check_platform_type_valid CHECK (type IN ('marketplace','social','ecommerce','delivery','grocery','fashion','electronics','beauty','food','other')),
  CONSTRAINT check_platform_website_basic CHECK (website_url IS NULL OR website_url LIKE 'http%'),
  CONSTRAINT check_platform_logo_basic CHECK (logo IS NULL OR logo LIKE 'http%'),
  CONSTRAINT check_platform_icon_basic CHECK (icon IS NULL OR icon LIKE 'http%')
);
ALTER TABLE platforms ENABLE ROW LEVEL SECURITY;

-- products
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  category_id UUID REFERENCES product_categories(id),
  platform_id UUID REFERENCES platforms(id),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(12,2) NOT NULL,
  product_link TEXT NOT NULL,
  sku TEXT NOT NULL,
  product_images TEXT[] NOT NULL,
  slug TEXT UNIQUE,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  CONSTRAINT check_product_price_positive CHECK (price > 0),
  CONSTRAINT check_product_link_format CHECK (product_link ~* '^https?://(?:[\w-]+\.)+[\w-]+(?:/[\w\-./?%&=]*)*$'),
  CONSTRAINT check_product_sku_format  CHECK (sku ~* '^[A-Z0-9_-]{3,50}$'),
  CONSTRAINT check_product_slug_format CHECK (slug IS NULL OR slug ~* '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- campaigns
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date   TIMESTAMPTZ NOT NULL,
  rebate_percentage DECIMAL(5,2) NOT NULL,
  platform_fee_percent DECIMAL(5,2) NOT NULL,
  bonus_amount DECIMAL(10,2) DEFAULT 0,
  deduction_amount DECIMAL(10,2) DEFAULT 0,
  max_enrollments SMALLINT NOT NULL,
  status campaign_status NOT NULL DEFAULT 'draft',
  approval_status approval_status NOT NULL DEFAULT 'pending',
  approved_by UUID REFERENCES admins(id),
  approved_at TIMESTAMPTZ,
  product_id UUID REFERENCES products(id),
  slug TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_platform_fee_range CHECK (platform_fee_percent >= 0 AND platform_fee_percent <= 100),
  CONSTRAINT check_campaign_dates_logical CHECK (end_date > start_date),
  CONSTRAINT check_campaign_enrollments_positive CHECK (max_enrollments > 0),
  CONSTRAINT check_campaign_slug_format CHECK (slug IS NULL OR slug ~* '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- coupons
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  created_by UUID NOT NULL REFERENCES admins(id),
  coupon_type coupon_type NOT NULL DEFAULT 'percentage',
  discount_percentage DECIMAL(5,2),
  bonus_amount DECIMAL(10,2),
  usage_limit INTEGER,
  one_time_use BOOLEAN DEFAULT FALSE,
  specific_campaign_id UUID REFERENCES campaigns(id),
  status coupon_status NOT NULL DEFAULT 'active',
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  times_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_coupon_code_format CHECK (code ~* '^[A-Z0-9]{6,20}$'),
  CONSTRAINT check_coupon_discount_type_consistency CHECK (
    (coupon_type='percentage' AND discount_percentage IS NOT NULL AND bonus_amount IS NULL) OR
    (coupon_type='fixed'      AND bonus_amount IS NOT NULL           AND discount_percentage IS NULL)
  ),
  CONSTRAINT check_coupon_percentage_valid CHECK (discount_percentage IS NULL OR (discount_percentage > 0 AND discount_percentage <= 100)),
  CONSTRAINT check_coupon_usage_logical CHECK (usage_limit IS NULL OR usage_limit > 0),
  CONSTRAINT check_coupon_times_used_valid CHECK (times_used >= 0),
  CONSTRAINT check_coupon_dates_logical CHECK (valid_until > valid_from)
);
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- deliverables (collapsed; no deliverable_types)
CREATE TABLE IF NOT EXISTS deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  platform_id UUID REFERENCES platforms(id),
  category TEXT NOT NULL,
  require_link BOOLEAN DEFAULT TRUE,
  require_screenshot BOOLEAN DEFAULT TRUE,
  status deliverable_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, platform_id)
);
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS campaign_deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  deliverable_id UUID NOT NULL REFERENCES deliverables(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  is_required BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, deliverable_id)
);
ALTER TABLE campaign_deliverables ENABLE ROW LEVEL SECURITY;

-- enrollments (locked rates; removed is_invoiced)
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  shopper_id  UUID NOT NULL REFERENCES shoppers(id)  ON DELETE CASCADE,
  order_id TEXT NOT NULL,
  order_value DECIMAL(12,2) NOT NULL,
  locked_rebate_percentage DECIMAL(5,2) NOT NULL,
  locked_platform_fee_percent DECIMAL(5,2) NOT NULL,
  base_rebate_amount DECIMAL(12,2) NOT NULL,
  bonus_amount DECIMAL(12,2) DEFAULT 0,
  deduction_amount DECIMAL(12,2) DEFAULT 0,
  coupon_adjustment DECIMAL(12,2) DEFAULT 0,
  final_rebate_amount DECIMAL(12,2),
  platform_profit DECIMAL(12,2),
  purchase_date TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  status enrollment_status NOT NULL DEFAULT 'pending',
  approval_remarks TEXT,
  coupon_id UUID REFERENCES coupons(id),
  order_screenshot_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, shopper_id, order_id),
  CONSTRAINT ck_locked_rates_range CHECK (
    locked_rebate_percentage >= 0 AND locked_rebate_percentage <= 100 AND
    locked_platform_fee_percent >= 0 AND locked_platform_fee_percent <= 100
  )
);
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- deliverable_submissions
CREATE TABLE IF NOT EXISTS deliverable_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  campaign_deliverable_id UUID NOT NULL REFERENCES campaign_deliverables(id) ON DELETE CASCADE,
  proof_link TEXT,
  proof_screenshot TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(enrollment_id, campaign_deliverable_id)
);
ALTER TABLE deliverable_submissions ENABLE ROW LEVEL SECURITY;

-- invoices
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL UNIQUE,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  due_date TIMESTAMPTZ NOT NULL,
  subtotal DECIMAL(14,2) NOT NULL,
  gst_amount DECIMAL(14,2) NOT NULL,
  tds_percentage DECIMAL(5,2) NOT NULL,
  tds_amount DECIMAL(14,2) NOT NULL,
  total_amount DECIMAL(14,2) NOT NULL,
  amount_paid DECIMAL(14,2) DEFAULT 0,
  status invoice_status NOT NULL DEFAULT 'draft',
  payout_processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- invoice_items
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES enrollments(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL,
  line_total DECIMAL(14,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(invoice_id, enrollment_id)
);
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  razorpay_payment_id TEXT NOT NULL UNIQUE,
  razorpay_va_id TEXT NOT NULL,
  utr_reference TEXT NOT NULL UNIQUE,
  transaction_source TEXT NOT NULL,
  amount DECIMAL(14,2) NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  received_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- invoice_payments
CREATE TABLE IF NOT EXISTS invoice_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  applied_amount DECIMAL(14,2) NOT NULL,
  remaining_amount DECIMAL(14,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(invoice_id, payment_id)
);
ALTER TABLE invoice_payments ENABLE ROW LEVEL SECURITY;

-- payout methods / payouts
CREATE TABLE IF NOT EXISTS payout_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopper_id UUID NOT NULL REFERENCES shoppers(id) ON DELETE CASCADE,
  payment_method TEXT NOT NULL,
  account_holder_name TEXT,
  account_number TEXT,
  bank_name TEXT,
  ifsc_code TEXT,
  upi_id TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(shopper_id, payment_method, account_number, upi_id)
);
ALTER TABLE payout_methods ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  shopper_id UUID NOT NULL REFERENCES shoppers(id),
  payout_method_id UUID REFERENCES payout_methods(id),
  amount DECIMAL(14,2) NOT NULL,
  razorpay_payout_id TEXT NOT NULL UNIQUE,
  payout_status payout_status DEFAULT 'queued',
  retry_count INTEGER DEFAULT 0,
  last_retry_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  failure_reason TEXT,
  utr TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(enrollment_id)
);
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

-- notifications / prefs
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  email BOOLEAN DEFAULT TRUE,
  whatsapp BOOLEAN DEFAULT TRUE,
  in_app BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type notification_context NOT NULL,
  status notification_status NOT NULL DEFAULT 'unread',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Coupon redemptions
CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  enrollment_id UUID REFERENCES enrollments(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status redemption_status NOT NULL DEFAULT 'redeemed',
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(coupon_id, user_id)
);
ALTER TABLE coupon_redemptions ENABLE ROW LEVEL SECURITY;

-- =========================
-- 03.5 • FUNCTIONS (TABLE-DEPENDENT)
-- =========================

-- Admin helper (needs admins)
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM admins a
    WHERE a.user_id = auth.uid()
      AND a.role IN ('super_admin','admin','manager')
  );
$$;

-- Brand/campaign actor helpers (need brands/campaigns)
CREATE OR REPLACE FUNCTION is_brand_actor_optimized(p_brand_id UUID, p_allowed_roles TEXT[] DEFAULT NULL)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (SELECT 1 FROM brands b WHERE b.id = p_brand_id AND b.user_id = auth.uid());
$$;

CREATE OR REPLACE FUNCTION is_campaign_actor(p_campaign_id UUID, p_allowed_roles TEXT[] DEFAULT NULL)
RETURNS BOOLEAN LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE v_brand UUID;
BEGIN
  SELECT brand_id INTO v_brand FROM campaigns WHERE id = p_campaign_id;
  IF v_brand IS NULL THEN RETURN FALSE; END IF;
  RETURN is_brand_actor_optimized(v_brand, p_allowed_roles);
END;
$$;

-- Claims helper (needs users/shoppers/brands/admins)
CREATE OR REPLACE FUNCTION get_custom_claims(user_id UUID)
RETURNS JSONB LANGUAGE SQL STABLE SECURITY DEFINER AS $$
  WITH flags AS (
    SELECT
      (SELECT EXISTS(SELECT 1 FROM admins   a WHERE a.user_id = u.id)) AS is_admin,
      (SELECT EXISTS(SELECT 1 FROM brands   b WHERE b.user_id = u.id)) AS is_brand,
      (SELECT EXISTS(SELECT 1 FROM shoppers s WHERE s.user_id = u.id)) AS is_shopper
    FROM users u WHERE u.id = get_custom_claims.user_id
  )
  SELECT jsonb_build_object(
    'user_role',
      CASE
        WHEN (SELECT is_admin  FROM flags) THEN 'admin'
        WHEN (SELECT is_brand  FROM flags) THEN 'brand'
        WHEN (SELECT is_shopper FROM flags) THEN 'shopper'
        ELSE 'guest'
      END,
    'brands',
      COALESCE((
        SELECT jsonb_agg(jsonb_build_object('brand_id',b.id,'role','owner','brand_name',b.brand_name))
        FROM brands b WHERE b.user_id = get_custom_claims.user_id
      ), '[]'::jsonb),
    'is_admin', (SELECT is_admin FROM flags),
    'is_shopper', (SELECT is_shopper FROM flags),
    'profile_complete',
      COALESCE(
        (SELECT s.first_name IS NOT NULL FROM shoppers s WHERE s.user_id = get_custom_claims.user_id),
        (SELECT b.is_complete         FROM brands   b WHERE b.user_id = get_custom_claims.user_id),
        TRUE
      ),
    'verification_status', jsonb_build_object(
      'email_verified', (SELECT email_verified FROM users WHERE id = get_custom_claims.user_id),
      'phone_verified', COALESCE(
        (SELECT s.phone_number IS NOT NULL FROM shoppers s WHERE s.user_id = get_custom_claims.user_id), false
      ) OR COALESCE(
        (SELECT b.phone_number IS NOT NULL FROM brands b WHERE b.user_id = get_custom_claims.user_id), false
      ),
      'kyc_verified', COALESCE(
        (SELECT s.kyc_verified FROM shoppers s WHERE s.user_id = get_custom_claims.user_id), false
      ) OR COALESCE(
        (SELECT b.approval_status = 'approved' FROM brands b WHERE b.user_id = get_custom_claims.user_id), false
      )
    )
  );
$$;

-- Users sync from auth (needs users)
CREATE OR REPLACE FUNCTION sync_user_from_auth_enhanced()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE r RECORD;
BEGIN
  SELECT * INTO r FROM extract_auth_metadata(NEW.raw_user_meta_data);
  INSERT INTO users AS u (id,name,email,email_verified,image,created_at,updated_at)
  VALUES (
    NEW.id,
    COALESCE(r.display_name, split_part(NEW.email,'@',1)),
    NEW.email,
    NEW.email_confirmed_at IS NOT NULL,
    r.avatar_url,
    COALESCE(NEW.created_at,NOW()),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    name = COALESCE(EXCLUDED.name,u.name),
    email = EXCLUDED.email,
    email_verified = EXCLUDED.email_verified,
    image = COALESCE(EXCLUDED.image,u.image),
    updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Business rule (needs brands) — used by campaign trigger
CREATE OR REPLACE FUNCTION enforce_campaign_business_rules()
RETURNS TRIGGER AS $$
DECLARE b RECORD;
BEGIN
  SELECT approval_status, is_complete, gst_verified, gst_number, brand_name
  INTO b FROM brands WHERE id = NEW.brand_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Brand % not found', NEW.brand_id;
  END IF;

  IF b.gst_verified IS DISTINCT FROM TRUE OR b.gst_number IS NULL THEN
    RAISE EXCEPTION 'Brand % must have GST verified and GST number', b.brand_name;
  END IF;

  IF b.approval_status <> 'approved' THEN
    RAISE EXCEPTION 'Brand % is not approved. Campaigns allowed only for approved brands', b.brand_name;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-expire (needs campaigns)
CREATE OR REPLACE FUNCTION auto_expire_campaigns()
RETURNS INTEGER LANGUAGE plpgsql AS $$
DECLARE n INT;
BEGIN
  UPDATE campaigns SET status='expired', updated_at=NOW()
  WHERE status='active' AND end_date < CURRENT_DATE;
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END;
$$;

-- =========================
-- 04 • TRIGGER WRAPPERS & TRIGGERS
-- =========================

-- Transition wrappers
CREATE OR REPLACE FUNCTION trg_campaign_status_transition()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NOT validate_campaign_status_transition(OLD.status, NEW.status) THEN
    RAISE EXCEPTION 'Invalid campaign status transition: % → %', OLD.status, NEW.status;
  END IF;
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION trg_enrollment_status_transition()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NOT validate_enrollment_status_transition(OLD.status, NEW.status) THEN
    RAISE EXCEPTION 'Invalid enrollment status transition: % → %', OLD.status, NEW.status;
  END IF;
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION trg_invoice_status_transition()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NOT validate_invoice_status_transition(OLD.status, NEW.status) THEN
    RAISE EXCEPTION 'Invalid invoice status transition: % → %', OLD.status, NEW.status;
  END IF;
  RETURN NEW;
END; $$;

-- Apply transition triggers
CREATE TRIGGER check_campaign_status_transition_trigger
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION trg_campaign_status_transition();

CREATE TRIGGER check_enrollment_status_transition_trigger
  BEFORE UPDATE ON enrollments
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION trg_enrollment_status_transition();

CREATE TRIGGER check_invoice_status_transition_trigger
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION trg_invoice_status_transition();

-- Product images validator trigger
CREATE TRIGGER validate_product_images_trigger
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION validate_product_images();

-- Enforce brand business rules for campaigns
CREATE TRIGGER enforce_campaign_business_rules_trigger
  BEFORE INSERT OR UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION enforce_campaign_business_rules();

-- updated_at triggers (one per table)
DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'users','admins','shoppers','brands','products','campaigns','enrollments',
    'invoices','invoice_items','payments','invoice_payments','payouts',
    'payout_methods','notifications','notification_preferences',
    'product_categories','platforms','deliverables','campaign_deliverables',
    'deliverable_submissions','coupons','coupon_redemptions'
  ]) LOOP
    EXECUTE format('CREATE TRIGGER set_%s_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION _touch_updated_at();', t, t);
  END LOOP;
END$$;

-- Supabase auth sync triggers (auth schema must exist)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION sync_user_from_auth_enhanced();

CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION sync_user_from_auth_enhanced();

-- Invoice numbering via SEQUENCE (race-free)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relkind='S' AND relname='invoice_number_seq') THEN
    CREATE SEQUENCE invoice_number_seq;
  END IF;
END$$;

CREATE OR REPLACE FUNCTION generate_invoice_number_seq()
RETURNS TRIGGER AS $$
DECLARE nxt BIGINT; prefix TEXT := 'HD';
BEGIN
  IF NEW.invoice_number IS NULL THEN
    SELECT nextval('invoice_number_seq') INTO nxt;
    NEW.invoice_number := prefix || LPAD(nxt::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_invoice_number_trigger
  BEFORE INSERT ON invoices
  FOR EACH ROW EXECUTE FUNCTION generate_invoice_number_seq();

-- =========================
-- 05 • INDEXES
-- =========================

-- users
CREATE INDEX IF NOT EXISTS idx_users_email        ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at   ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_banned_true  ON users(banned) WHERE banned = true;

-- brands
CREATE INDEX IF NOT EXISTS idx_brands_user_id           ON brands(user_id);
CREATE INDEX IF NOT EXISTS idx_brands_approval_status   ON brands(approval_status);
CREATE INDEX IF NOT EXISTS idx_brands_created_at        ON brands(created_at);
CREATE INDEX IF NOT EXISTS idx_brands_approved_by       ON brands(approved_by);
CREATE INDEX IF NOT EXISTS idx_brands_social_media_gin  ON brands USING GIN(social_media);
CREATE INDEX IF NOT EXISTS idx_brands_name_search       ON brands USING GIN (to_tsvector('english', brand_name));

-- shoppers/admins
CREATE INDEX IF NOT EXISTS idx_shoppers_user_id ON shoppers(user_id);
CREATE INDEX IF NOT EXISTS idx_admins_user_id   ON admins(user_id);

-- products
CREATE INDEX IF NOT EXISTS idx_products_brand_id       ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id    ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_platform_id    ON products(platform_id);
CREATE INDEX IF NOT EXISTS idx_products_created_by     ON products(created_by);
CREATE INDEX IF NOT EXISTS idx_products_updated_by     ON products(updated_by);
CREATE INDEX IF NOT EXISTS idx_products_created_at     ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_products_name_search    ON products USING GIN (to_tsvector('english', name));

-- campaigns
CREATE INDEX IF NOT EXISTS idx_campaigns_brand_id        ON campaigns(brand_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_product_id      ON campaigns(product_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_approved_by     ON campaigns(approved_by);
CREATE INDEX IF NOT EXISTS idx_campaigns_status          ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_approval_status ON campaigns(approval_status);
CREATE INDEX IF NOT EXISTS idx_campaigns_start_date      ON campaigns(start_date);
CREATE INDEX IF NOT EXISTS idx_campaigns_end_date        ON campaigns(end_date);
CREATE INDEX IF NOT EXISTS idx_campaigns_title_search    ON campaigns USING GIN (to_tsvector('english', title));

-- enrollments
CREATE INDEX IF NOT EXISTS idx_enrollments_campaign_id             ON enrollments(campaign_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_shopper_id              ON enrollments(shopper_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status                  ON enrollments(status);
CREATE INDEX IF NOT EXISTS idx_enrollments_coupon_id               ON enrollments(coupon_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_created_at              ON enrollments(created_at);
CREATE INDEX IF NOT EXISTS idx_enrollments_purchase_date           ON enrollments(purchase_date);
CREATE INDEX IF NOT EXISTS idx_enrollments_shopper_status_created  ON enrollments(shopper_id, status, created_at);
CREATE INDEX IF NOT EXISTS idx_enrollments_campaign_purchase_date  ON enrollments(campaign_id, purchase_date) WHERE purchase_date IS NOT NULL;

-- invoices / items
CREATE INDEX IF NOT EXISTS idx_invoices_brand_id        ON invoices(brand_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status          ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date        ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at      ON invoices(created_at);
CREATE INDEX IF NOT EXISTS idx_invoices_unpaid_due_date ON invoices(due_date, brand_id) WHERE status IN ('sent','overdue');
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_enrollment ON invoice_items(invoice_id, enrollment_id);

-- payments
CREATE INDEX IF NOT EXISTS idx_payments_brand_id    ON payments(brand_id);
CREATE INDEX IF NOT EXISTS idx_payments_status      ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_received_at ON payments(received_at);

-- payouts
CREATE INDEX IF NOT EXISTS idx_payouts_shopper_id     ON payouts(shopper_id);
CREATE INDEX IF NOT EXISTS idx_payouts_payout_status  ON payouts(payout_status);
CREATE INDEX IF NOT EXISTS idx_payouts_created_at     ON payouts(created_at);

-- notifications / prefs
CREATE INDEX IF NOT EXISTS idx_notifications_user_id     ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status      ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at  ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_type        ON notifications(type);

-- coupons / redemptions
CREATE INDEX IF NOT EXISTS idx_coupons_status               ON coupons(status);
CREATE INDEX IF NOT EXISTS idx_coupons_created_by           ON coupons(created_by);
CREATE INDEX IF NOT EXISTS idx_coupons_valid_from           ON coupons(valid_from);
CREATE INDEX IF NOT EXISTS idx_coupons_valid_until          ON coupons(valid_until);
CREATE INDEX IF NOT EXISTS idx_coupons_specific_campaign_id ON coupons(specific_campaign_id);
-- Removed problematic index with NOW() function - not immutable
-- CREATE INDEX IF NOT EXISTS idx_coupons_active_valid
--   ON coupons(code, specific_campaign_id)
--   WHERE status = 'active' AND valid_until > NOW();

CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_coupon_id ON coupon_redemptions(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_user_id   ON coupon_redemptions(user_id);

-- =========================
-- 05.1 • UNIQUE / CONSTRAINT TWEAKS
-- =========================
ALTER TABLE brands
  ADD CONSTRAINT uq_brands_slug UNIQUE(slug);

-- =========================
-- 06 • RLS POLICIES
-- =========================

-- users
CREATE POLICY "Users can view own profile"   ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin full access bypass on users" ON users
  FOR ALL USING (auth.role() = 'service_role' OR is_admin_user()) WITH CHECK (auth.role() = 'service_role' OR is_admin_user());

-- admins
CREATE POLICY "Admin view all admins"   ON admins FOR SELECT USING (is_admin_user());
CREATE POLICY "Admin manage all admins" ON admins FOR ALL USING (auth.role()='service_role' OR is_admin_user()) WITH CHECK (auth.role()='service_role' OR is_admin_user());

-- brands
CREATE POLICY "Brand owners can view own brands"   ON brands FOR SELECT USING (is_brand_actor_optimized(brands.id));
CREATE POLICY "Brand owners can update own brands" ON brands FOR UPDATE USING (is_brand_actor_optimized(brands.id)) WITH CHECK (is_brand_actor_optimized(brands.id));
CREATE POLICY "Admin full access on brands" ON brands FOR ALL USING (auth.role()='service_role' OR is_admin_user()) WITH CHECK (auth.role()='service_role' OR is_admin_user());

-- shoppers
CREATE POLICY "Shoppers can view own profile"   ON shoppers FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Shoppers can update own profile" ON shoppers FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admin full access on shoppers"   ON shoppers FOR ALL USING (auth.role()='service_role' OR is_admin_user()) WITH CHECK (auth.role()='service_role' OR is_admin_user());

-- products (public read)
CREATE POLICY "Public read products"            ON products FOR SELECT USING (true);
CREATE POLICY "Brand owners manage products"    ON products FOR ALL USING (is_brand_actor_optimized(brand_id)) WITH CHECK (is_brand_actor_optimized(brand_id));
CREATE POLICY "Admin full access on products"   ON products FOR ALL USING (auth.role()='service_role' OR is_admin_user()) WITH CHECK (auth.role()='service_role' OR is_admin_user());

-- platforms (public read active)
CREATE POLICY "Public read platforms"  ON platforms FOR SELECT USING (status='active');
CREATE POLICY "Admin manage platforms" ON platforms FOR ALL USING (auth.role()='service_role' OR is_admin_user()) WITH CHECK (auth.role()='service_role' OR is_admin_user());

-- campaigns (public read active+approved)
CREATE POLICY "Public read active campaigns" ON campaigns FOR SELECT USING (status='active' AND approval_status='approved');
CREATE POLICY "Brand owners manage campaigns" ON campaigns FOR ALL USING (is_brand_actor_optimized(brand_id)) WITH CHECK (is_brand_actor_optimized(brand_id));
CREATE POLICY "Admin full access on campaigns" ON campaigns FOR ALL USING (auth.role()='service_role' OR is_admin_user()) WITH CHECK (auth.role()='service_role' OR is_admin_user());

-- coupons
CREATE POLICY "Brand owners view coupons" ON coupons FOR SELECT USING (
  specific_campaign_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM campaigns c WHERE c.id = coupons.specific_campaign_id AND is_brand_actor_optimized(c.brand_id)
  )
  OR is_admin_user() OR auth.role()='service_role'
);
CREATE POLICY "Brand owners manage coupons" ON coupons FOR ALL USING (
  specific_campaign_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM campaigns c WHERE c.id = coupons.specific_campaign_id AND is_brand_actor_optimized(c.brand_id)
  )
  OR is_admin_user() OR auth.role()='service_role'
) WITH CHECK (
  specific_campaign_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM campaigns c WHERE c.id = coupons.specific_campaign_id AND is_brand_actor_optimized(c.brand_id)
  )
  OR is_admin_user() OR auth.role()='service_role'
);

-- deliverables / campaign_deliverables
CREATE POLICY "Public read deliverables" ON deliverables FOR SELECT USING (status='active');
CREATE POLICY "Admin manage deliverables" ON deliverables FOR ALL USING (auth.role()='service_role' OR is_admin_user()) WITH CHECK (auth.role()='service_role' OR is_admin_user());

CREATE POLICY "Brand owners view campaign deliverables" ON campaign_deliverables FOR SELECT USING (
  EXISTS (SELECT 1 FROM campaigns c WHERE c.id = campaign_deliverables.campaign_id AND is_brand_actor_optimized(c.brand_id))
);
CREATE POLICY "Brand owners manage campaign deliverables" ON campaign_deliverables FOR ALL USING (
  EXISTS (SELECT 1 FROM campaigns c WHERE c.id = campaign_deliverables.campaign_id AND is_brand_actor_optimized(c.brand_id))
) WITH CHECK (
  EXISTS (SELECT 1 FROM campaigns c WHERE c.id = campaign_deliverables.campaign_id AND is_brand_actor_optimized(c.brand_id))
);
CREATE POLICY "Admin full access on campaign deliverables" ON campaign_deliverables
  FOR ALL USING (auth.role()='service_role' OR is_admin_user()) WITH CHECK (auth.role()='service_role' OR is_admin_user());

-- enrollments & submissions
CREATE POLICY "Shoppers view own enrollments" ON enrollments FOR SELECT USING (
  shopper_id IN (SELECT id FROM shoppers WHERE user_id = auth.uid())
);
CREATE POLICY "Shoppers manage own enrollments" ON enrollments FOR ALL USING (
  shopper_id IN (SELECT id FROM shoppers WHERE user_id = auth.uid())
) WITH CHECK (
  shopper_id IN (SELECT id FROM shoppers WHERE user_id = auth.uid())
);
CREATE POLICY "Brand owners view campaign enrollments" ON enrollments FOR SELECT USING (
  campaign_id IN (SELECT id FROM campaigns WHERE is_brand_actor_optimized(brand_id))
);
CREATE POLICY "Admin full access on enrollments" ON enrollments
  FOR ALL USING (auth.role()='service_role' OR is_admin_user()) WITH CHECK (auth.role()='service_role' OR is_admin_user());

CREATE POLICY "Shoppers view own submissions" ON deliverable_submissions FOR SELECT USING (
  enrollment_id IN (SELECT id FROM enrollments WHERE shopper_id IN (SELECT id FROM shoppers WHERE user_id = auth.uid()))
);
CREATE POLICY "Shoppers manage own submissions" ON deliverable_submissions FOR ALL USING (
  enrollment_id IN (SELECT id FROM enrollments WHERE shopper_id IN (SELECT id FROM shoppers WHERE user_id = auth.uid()))
) WITH CHECK (
  enrollment_id IN (SELECT id FROM enrollments WHERE shopper_id IN (SELECT id FROM shoppers WHERE user_id = auth.uid()))
);
CREATE POLICY "Brand owners view campaign submissions" ON deliverable_submissions FOR SELECT USING (
  enrollment_id IN (
    SELECT e.id FROM enrollments e JOIN campaigns c ON c.id = e.campaign_id
    WHERE is_brand_actor_optimized(c.brand_id)
  )
);
CREATE POLICY "Admin full access on submissions" ON deliverable_submissions
  FOR ALL USING (auth.role()='service_role' OR is_admin_user()) WITH CHECK (auth.role()='service_role' OR is_admin_user());

-- invoices / items
CREATE POLICY "Brand owners view invoices"  ON invoices FOR SELECT USING (is_brand_actor_optimized(brand_id));
CREATE POLICY "Brand owners manage invoices" ON invoices FOR ALL USING (is_brand_actor_optimized(brand_id)) WITH CHECK (is_brand_actor_optimized(brand_id));
CREATE POLICY "Admin full access on invoices" ON invoices FOR ALL USING (auth.role()='service_role' OR is_admin_user()) WITH CHECK (auth.role()='service_role' OR is_admin_user());

CREATE POLICY "Brand owners view invoice items" ON invoice_items FOR SELECT USING (
  invoice_id IN (SELECT id FROM invoices WHERE is_brand_actor_optimized(brand_id))
);
CREATE POLICY "Brand owners manage invoice items" ON invoice_items FOR ALL USING (
  invoice_id IN (SELECT id FROM invoices WHERE is_brand_actor_optimized(brand_id))
) WITH CHECK (
  invoice_id IN (SELECT id FROM invoices WHERE is_brand_actor_optimized(brand_id))
);
CREATE POLICY "Admin full access on invoice items" ON invoice_items
  FOR ALL USING (auth.role()='service_role' OR is_admin_user()) WITH CHECK (auth.role()='service_role' OR is_admin_user());

-- payments
CREATE POLICY "Brand owners view payments"  ON payments FOR SELECT USING (is_brand_actor_optimized(brand_id));
CREATE POLICY "Brand owners manage payments" ON payments FOR ALL USING (is_brand_actor_optimized(brand_id)) WITH CHECK (is_brand_actor_optimized(brand_id));
CREATE POLICY "Admin full access on payments" ON payments FOR ALL USING (auth.role()='service_role' OR is_admin_user()) WITH CHECK (auth.role()='service_role' OR is_admin_user());

-- payouts (WRITE locked to admin/system; shoppers only SELECT own)
CREATE POLICY "Shoppers view own payouts" ON payouts FOR SELECT USING (
  shopper_id IN (SELECT id FROM shoppers WHERE user_id = auth.uid())
);
CREATE POLICY "System/admin manage payouts" ON payouts FOR ALL
  USING (auth.role()='service_role' OR is_admin_user())
  WITH CHECK (auth.role()='service_role' OR is_admin_user());

-- notifications / prefs
CREATE POLICY "Users view own notifications"   ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users manage own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admin full access on notifications" ON notifications FOR ALL USING (auth.role()='service_role' OR is_admin_user()) WITH CHECK (auth.role()='service_role' OR is_admin_user());

CREATE POLICY "Users view own prefs"   ON notification_preferences FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users manage own prefs" ON notification_preferences FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admin full access on prefs" ON notification_preferences FOR ALL USING (auth.role()='service_role' OR is_admin_user()) WITH CHECK (auth.role()='service_role' OR is_admin_user());

-- coupons redemptions
CREATE POLICY "Users read own coupon redemptions" ON coupon_redemptions
  FOR SELECT USING (user_id = auth.uid() OR is_admin_user());
CREATE POLICY "Admin manage coupon redemptions" ON coupon_redemptions
  FOR ALL USING (auth.role()='service_role' OR is_admin_user())
  WITH CHECK (auth.role()='service_role' OR is_admin_user());

-- =========================
-- 07 • STORAGE (Buckets + Policies) — only if Supabase storage exists
-- =========================
DO $storage$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'storage') THEN
    -- Skip RLS enabling if not owner (already enabled by default in Supabase)
    -- EXECUTE 'ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY';

    -- Buckets
    EXECUTE $b$
      INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
      VALUES
        ('brand-logos',     'brand-logos',     true,  5242880,  ARRAY['image/png','image/jpeg','image/webp']),
        ('product-images',  'product-images',  true,  10485760, ARRAY['image/png','image/jpeg','image/webp','image/avif','image/gif']),
        ('deliverables',    'deliverables',    false, 52428800, ARRAY['image/*','video/*','application/pdf','text/plain']),
        ('purchase-proofs', 'purchase-proofs', false, 52428800, ARRAY['image/*','application/pdf']),
        ('profile-pictures','profile-pictures',true,  5242880,  ARRAY['image/png','image/jpeg','image/webp'])
      ON CONFLICT (id) DO NOTHING;
    $b$;

    -- Public reads (drop if exists, then create)
    EXECUTE $p1$DROP POLICY IF EXISTS "Public read brand-logos" ON storage.objects$p1$;
    EXECUTE $p1b$CREATE POLICY "Public read brand-logos"
              ON storage.objects FOR SELECT
              USING (bucket_id = 'brand-logos')$p1b$;

    EXECUTE $p2$DROP POLICY IF EXISTS "Public read product-images" ON storage.objects$p2$;
    EXECUTE $p2b$CREATE POLICY "Public read product-images"
              ON storage.objects FOR SELECT
              USING (bucket_id = 'product-images')$p2b$;

    EXECUTE $p3$DROP POLICY IF EXISTS "Public read profile-pictures" ON storage.objects$p3$;
    EXECUTE $p3b$CREATE POLICY "Public read profile-pictures"
              ON storage.objects FOR SELECT
              USING (bucket_id = 'profile-pictures')$p3b$;

    -- Owner/Admin RW — profile pictures (prefix user-id/)
    EXECUTE $p4$DROP POLICY IF EXISTS "Owner RW profile-pictures" ON storage.objects$p4$;
    EXECUTE $p4b$CREATE POLICY "Owner RW profile-pictures"
              ON storage.objects
              FOR ALL
              USING (
                bucket_id = 'profile-pictures' AND (owner = auth.uid() OR is_admin_user())
              )
              WITH CHECK (
                bucket_id = 'profile-pictures'
                AND (owner = auth.uid() OR is_admin_user())
                AND (position(auth.uid()::text || '/' in (name::text)) = 1 OR is_admin_user())
              )$p4b$;

    -- Private reads for restricted buckets
    EXECUTE $p5$DROP POLICY IF EXISTS "Private read deliverables" ON storage.objects$p5$;
    EXECUTE $p5b$CREATE POLICY "Private read deliverables"
              ON storage.objects FOR SELECT
              USING (bucket_id = 'deliverables' AND (owner = auth.uid() OR is_admin_user()))$p5b$;

    EXECUTE $p6$DROP POLICY IF EXISTS "Private read purchase-proofs" ON storage.objects$p6$;
    EXECUTE $p6b$CREATE POLICY "Private read purchase-proofs"
              ON storage.objects FOR SELECT
              USING (bucket_id = 'purchase-proofs' AND (owner = auth.uid() OR is_admin_user()))$p6b$;

    -- Authenticated uploads to public buckets
    EXECUTE $p7$DROP POLICY IF EXISTS "Auth upload public buckets" ON storage.objects$p7$;
    EXECUTE $p7b$CREATE POLICY "Auth upload public buckets"
              ON storage.objects FOR INSERT
              WITH CHECK (
                (bucket_id IN ('brand-logos','product-images')) AND
                (owner = auth.uid())
              )$p7b$;
  END IF;
END$storage$;

-- =========================
-- 08 • CRON (Nightly auto-expire at 02:00)
-- =========================
DO $cron$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    -- unschedule if exists
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'auto-expire-campaigns-nightly') THEN
      PERFORM cron.unschedule(jobid) FROM cron.job WHERE jobname = 'auto-expire-campaigns-nightly';
    END IF;

    -- schedule fresh
    PERFORM cron.schedule(
      job_name := 'auto-expire-campaigns-nightly',
      schedule := '0 2 * * *',
      command  := 'SELECT public.auto_expire_campaigns();'
    );
  END IF;
END$cron$;

-- =========================
-- 09 • SEED (minimal, idempotent)
-- =========================

-- System user (for created_by) + super_admin (users.role removed)
WITH seed_user AS (
  INSERT INTO users (id, name, email, email_verified, image)
  VALUES ('11111111-1111-1111-1111-111111111111', 'System', 'system@hypedrive.local', TRUE, NULL)
  ON CONFLICT (id) DO NOTHING
  RETURNING id
), ensure_user AS (
  SELECT '11111111-1111-1111-1111-111111111111'::uuid AS id
  UNION ALL
  SELECT id FROM seed_user
), seed_admin AS (
  INSERT INTO admins (user_id, first_name, last_name, phone_number, role)
  SELECT id, 'System','Admin','0000000000','super_admin' FROM ensure_user
  ON CONFLICT (user_id) DO NOTHING
  RETURNING user_id
)
SELECT 1;

-- Product categories
INSERT INTO product_categories (name, description, created_by)
VALUES
  ('Electronics','Electronic devices and gadgets','11111111-1111-1111-1111-111111111111'),
  ('Fashion','Clothing, accessories, and fashion items','11111111-1111-1111-1111-111111111111'),
  ('Beauty','Cosmetics, skincare, and beauty products','11111111-1111-1111-1111-111111111111'),
  ('Home & Garden','Home improvement and gardening products','11111111-1111-1111-1111-111111111111'),
  ('Sports & Fitness','Sports equipment and fitness products','11111111-1111-1111-1111-111111111111'),
  ('Books & Media','Books, movies, music, and digital media','11111111-1111-1111-1111-111111111111'),
  ('Food & Beverages','Food items and beverages','11111111-1111-1111-1111-111111111111'),
  ('Health & Wellness','Health supplements and wellness products','11111111-1111-1111-1111-111111111111')
ON CONFLICT (name) DO NOTHING;

-- Platforms (owned by system user)
INSERT INTO platforms (name, description, type, website_url, status, created_by)
VALUES
  ('Amazon','Amazon marketplace','marketplace','https://amazon.in','active','11111111-1111-1111-1111-111111111111'),
  ('Flipkart','Flipkart marketplace','marketplace','https://flipkart.com','active','11111111-1111-1111-1111-111111111111'),
  ('Myntra','Fashion and lifestyle marketplace','marketplace','https://myntra.com','active','11111111-1111-1111-1111-111111111111'),
  ('Nykaa','Beauty and wellness marketplace','marketplace','https://nykaa.com','active','11111111-1111-1111-1111-111111111111'),
  ('BigBasket','Online grocery marketplace','marketplace','https://bigbasket.com','active','11111111-1111-1111-1111-111111111111')
ON CONFLICT (name) DO NOTHING;

-- Deliverables (platform-agnostic allowed)
INSERT INTO deliverables (name, platform_id, category, require_link, require_screenshot, status)
VALUES
  ('Product Review',   NULL, 'review', TRUE,  FALSE, 'active'),
  ('Social Media Post',NULL, 'social', TRUE,  TRUE,  'active'),
  ('Video Review',     NULL, 'video',  TRUE,  FALSE, 'active'),
  ('Photo Submission', NULL, 'photo',  FALSE, TRUE,  'active')
ON CONFLICT (name, platform_id) DO NOTHING;

COMMIT;