ALTER TABLE addresses
ADD COLUMN IF NOT EXISTS latitude NUMERIC(10,7);

ALTER TABLE addresses
ADD COLUMN IF NOT EXISTS longitude NUMERIC(10,7);

ALTER TABLE addresses
ADD COLUMN IF NOT EXISTS location_source VARCHAR(20)
NOT NULL DEFAULT 'NONE';

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS delivery_latitude NUMERIC(10,7);

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS delivery_longitude NUMERIC(10,7);

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS location_source VARCHAR(20);

CREATE INDEX IF NOT EXISTS idx_addresses_coordinates
ON addresses(latitude, longitude);

CREATE INDEX IF NOT EXISTS idx_orders_delivery_coordinates
ON orders(delivery_latitude, delivery_longitude);