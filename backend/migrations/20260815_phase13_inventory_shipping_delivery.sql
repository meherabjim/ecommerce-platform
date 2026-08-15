BEGIN;
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS delivery_attempt_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_delivery_note VARCHAR(500),
  ADD COLUMN IF NOT EXISTS last_delivery_action_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_orders_delivery_operations ON orders(delivery_agent_id,status,last_delivery_action_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_low_stock ON inventory(warehouse_id,reorder_level,stock_on_hand,reserved);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_variant_created ON inventory_movements(variant_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_courier_shipments_order_status ON courier_shipments(order_id,status);
CREATE INDEX IF NOT EXISTS idx_courier_shipments_tracking_code ON courier_shipments(tracking_code) WHERE tracking_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_cod_reconciliations_order_status ON cod_reconciliations(order_id,status);
COMMIT;
