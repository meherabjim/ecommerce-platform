-- ============================================================
-- SRS CORE D + E
-- PAYMENT LEDGER + REFUNDS + DUE COLLECTION
-- COURIER SHIPMENTS + TRACKING + COD RECONCILIATION
-- ============================================================

CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(60) NOT NULL DEFAULT 'MANUAL',
  type VARCHAR(40) NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'PENDING',
  amount NUMERIC(12,2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'BDT',
  external_reference VARCHAR(180) NULL,
  idempotency_key VARCHAR(180) NULL UNIQUE,
  payment_method VARCHAR(80) NULL,
  provider_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  verified_at TIMESTAMPTZ NULL,
  failed_reason VARCHAR(500) NULL,
  created_by UUID NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_order
  ON payment_transactions(order_id);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_user
  ON payment_transactions(user_id);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_status
  ON payment_transactions(status);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_external_reference
  ON payment_transactions(external_reference);

CREATE TABLE IF NOT EXISTS refunds (
  id UUID PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  payment_transaction_id UUID NULL REFERENCES payment_transactions(id) ON DELETE SET NULL,
  amount NUMERIC(12,2) NOT NULL,
  reason VARCHAR(500) NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'REQUESTED',
  provider_reference VARCHAR(180) NULL,
  processed_by UUID NULL REFERENCES users(id) ON DELETE SET NULL,
  processed_at TIMESTAMPTZ NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refunds_order
  ON refunds(order_id);

CREATE INDEX IF NOT EXISTS idx_refunds_status
  ON refunds(status);

CREATE TABLE IF NOT EXISTS payment_webhook_events (
  id UUID PRIMARY KEY,
  provider VARCHAR(60) NOT NULL,
  event_key VARCHAR(220) NOT NULL UNIQUE,
  signature_valid BOOLEAN NOT NULL DEFAULT FALSE,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  processed BOOLEAN NOT NULL DEFAULT FALSE,
  processed_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_webhook_processed
  ON payment_webhook_events(processed);

CREATE TABLE IF NOT EXISTS courier_shipments (
  id UUID PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  provider VARCHAR(60) NOT NULL DEFAULT 'INTERNAL',
  status VARCHAR(60) NOT NULL DEFAULT 'DRAFT',
  consignment_id VARCHAR(180) NULL,
  tracking_code VARCHAR(180) NULL,
  tracking_url TEXT NULL,
  cod_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  delivery_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
  recipient_name VARCHAR(180) NOT NULL,
  phone VARCHAR(40) NOT NULL,
  delivery_address TEXT NOT NULL,
  district VARCHAR(120) NULL,
  area VARCHAR(160) NULL,
  provider_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID NULL REFERENCES users(id) ON DELETE SET NULL,
  shipped_at TIMESTAMPTZ NULL,
  delivered_at TIMESTAMPTZ NULL,
  failed_at TIMESTAMPTZ NULL,
  failure_reason VARCHAR(500) NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_courier_shipments_consignment
  ON courier_shipments(provider, consignment_id)
  WHERE consignment_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_courier_shipments_order
  ON courier_shipments(order_id);

CREATE INDEX IF NOT EXISTS idx_courier_shipments_status
  ON courier_shipments(status);

CREATE TABLE IF NOT EXISTS shipment_events (
  id UUID PRIMARY KEY,
  shipment_id UUID NOT NULL REFERENCES courier_shipments(id) ON DELETE CASCADE,
  provider_status VARCHAR(120) NOT NULL,
  normalized_status VARCHAR(60) NOT NULL,
  note VARCHAR(500) NULL,
  event_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shipment_events_shipment
  ON shipment_events(shipment_id, event_time DESC);

CREATE TABLE IF NOT EXISTS courier_webhook_events (
  id UUID PRIMARY KEY,
  provider VARCHAR(60) NOT NULL,
  event_key VARCHAR(220) NOT NULL UNIQUE,
  signature_valid BOOLEAN NOT NULL DEFAULT FALSE,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  processed BOOLEAN NOT NULL DEFAULT FALSE,
  processed_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cod_reconciliations (
  id UUID PRIMARY KEY,
  shipment_id UUID NOT NULL REFERENCES courier_shipments(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  expected_amount NUMERIC(12,2) NOT NULL,
  collected_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  settled_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  status VARCHAR(40) NOT NULL DEFAULT 'PENDING',
  settlement_reference VARCHAR(180) NULL,
  settled_at TIMESTAMPTZ NULL,
  note VARCHAR(500) NULL,
  created_by UUID NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_cod_reconciliation_shipment
  ON cod_reconciliations(shipment_id);

CREATE INDEX IF NOT EXISTS idx_cod_reconciliation_status
  ON cod_reconciliations(status);
