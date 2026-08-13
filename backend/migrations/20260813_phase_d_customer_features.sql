CREATE TABLE IF NOT EXISTS wishlists (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id,product_id)
);

CREATE TABLE IF NOT EXISTS shipping_zones (
  id UUID PRIMARY KEY,
  district VARCHAR(100) NOT NULL,
  area VARCHAR(120),
  charge NUMERIC(12,2) NOT NULL,
  free_shipping_threshold NUMERIC(12,2) NOT NULL DEFAULT 3000,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

DO $$ BEGIN
  CREATE TYPE enum_notifications_type AS ENUM (
    'ORDER',
    'PAYMENT',
    'DELIVERY',
    'RETURN',
    'SYSTEM'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  type enum_notifications_type NOT NULL DEFAULT 'SYSTEM',
  title VARCHAR(180) NOT NULL,
  message VARCHAR(500) NOT NULL,
  reference_id UUID,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

DO $$ BEGIN
  CREATE TYPE enum_return_requests_status AS ENUM (
    'REQUESTED',
    'APPROVED',
    'REJECTED',
    'RECEIVED',
    'REFUNDED'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS return_requests (
  id UUID PRIMARY KEY,
  order_id UUID NOT NULL,
  user_id UUID NOT NULL,
  reason VARCHAR(500) NOT NULL,
  status enum_return_requests_status NOT NULL DEFAULT 'REQUESTED',
  admin_note VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user
ON notifications(user_id);

CREATE INDEX IF NOT EXISTS idx_returns_user
ON return_requests(user_id);

CREATE INDEX IF NOT EXISTS idx_returns_order
ON return_requests(order_id);

CREATE INDEX IF NOT EXISTS idx_shipping_zone
ON shipping_zones(district,area);
