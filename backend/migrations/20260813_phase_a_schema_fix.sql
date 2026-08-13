-- ============================================================
-- NEURO COMMERCE PHASE A SCHEMA FIX
-- Safe for existing database/data
-- ============================================================

-- ------------------------------------------------------------
-- 1. User role
-- ------------------------------------------------------------

DO $$
BEGIN
  ALTER TYPE "enum_users_role"
    ADD VALUE IF NOT EXISTS 'DELIVERY_AGENT';
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;


-- ------------------------------------------------------------
-- 2. Order statuses
-- ------------------------------------------------------------

DO $$
BEGIN
  ALTER TYPE "enum_orders_status"
    ADD VALUE IF NOT EXISTS 'READY_FOR_PICKUP';

  ALTER TYPE "enum_orders_status"
    ADD VALUE IF NOT EXISTS 'IN_TRANSIT';

  ALTER TYPE "enum_orders_status"
    ADD VALUE IF NOT EXISTS 'OUT_FOR_DELIVERY';

  ALTER TYPE "enum_orders_status"
    ADD VALUE IF NOT EXISTS 'DELIVERY_FAILED';
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;


-- ------------------------------------------------------------
-- 3. New order delivery/location columns
-- ------------------------------------------------------------

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS division VARCHAR(80);

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS district VARCHAR(100);

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS area VARCHAR(120);

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS landmark VARCHAR(160);

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS address_label VARCHAR(30);

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS delivery_agent_id UUID;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(80);

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS delivery_failure_reason VARCHAR(300);

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS cod_collected NUMERIC(12,2);


-- ------------------------------------------------------------
-- 4. Helpful indexes
-- ------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_orders_delivery_agent_id
  ON orders(delivery_agent_id);

CREATE INDEX IF NOT EXISTS idx_orders_tracking_number
  ON orders(tracking_number);

CREATE INDEX IF NOT EXISTS idx_orders_status
  ON orders(status);


-- ------------------------------------------------------------
-- 5. Address indexes
-- ------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_addresses_user_id
  ON addresses(user_id);

CREATE INDEX IF NOT EXISTS idx_addresses_user_default
  ON addresses(user_id, is_default);


-- ------------------------------------------------------------
-- 6. Verification output
-- ------------------------------------------------------------

SELECT
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'orders'
  AND column_name IN (
    'division',
    'district',
    'area',
    'landmark',
    'address_label',
    'delivery_agent_id',
    'tracking_number',
    'delivery_failure_reason',
    'cod_collected'
  )
ORDER BY column_name;
