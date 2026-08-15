-- ============================================================
-- FINAL CORE H1
-- Staff RBAC + Sessions + Hybrid Delivery Policy
-- ============================================================

DO $$
BEGIN
  ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN';
  ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'CATALOG_MANAGER';
  ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'INVENTORY_MANAGER';
  ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'ORDER_MANAGER';
  ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'CUSTOMER_SUPPORT';
  ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'MARKETING_MANAGER';
  ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'FINANCE';
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

ALTER TABLE auth_tokens
  ADD COLUMN IF NOT EXISTS ip_address VARCHAR(120),
  ADD COLUMN IF NOT EXISTS user_agent TEXT,
  ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_auth_tokens_user_type_active
  ON auth_tokens(user_id,type,used_at,expires_at);

ALTER TABLE shipping_zones
  ADD COLUMN IF NOT EXISTS delivery_mode VARCHAR(30) NOT NULL DEFAULT 'AUTO',
  ADD COLUMN IF NOT EXISTS preferred_provider VARCHAR(60),
  ADD COLUMN IF NOT EXISTS internal_serviceable BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE shipping_zones
SET
  delivery_mode = CASE WHEN LOWER(district)='dhaka' THEN 'INTERNAL' ELSE 'AUTO' END,
  internal_serviceable = CASE WHEN LOWER(district)='dhaka' THEN TRUE ELSE FALSE END
WHERE delivery_mode='AUTO'
  AND preferred_provider IS NULL;

CREATE INDEX IF NOT EXISTS idx_shipping_zone_delivery_policy
  ON shipping_zones(district,area,active,delivery_mode);
