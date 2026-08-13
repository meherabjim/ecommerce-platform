-- Run once against the existing PostgreSQL database before restarting the upgraded backend.
DO $$ BEGIN
  ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'DELIVERY_AGENT';
EXCEPTION WHEN undefined_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TYPE "enum_orders_status" ADD VALUE IF NOT EXISTS 'READY_FOR_PICKUP';
  ALTER TYPE "enum_orders_status" ADD VALUE IF NOT EXISTS 'IN_TRANSIT';
  ALTER TYPE "enum_orders_status" ADD VALUE IF NOT EXISTS 'OUT_FOR_DELIVERY';
  ALTER TYPE "enum_orders_status" ADD VALUE IF NOT EXISTS 'DELIVERY_FAILED';
EXCEPTION WHEN undefined_object THEN NULL; END $$;
