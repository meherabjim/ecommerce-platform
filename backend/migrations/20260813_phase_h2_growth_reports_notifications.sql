ALTER TABLE promotions ADD COLUMN IF NOT EXISTS campaign_type VARCHAR(30) NOT NULL DEFAULT 'COUPON';
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS per_user_limit INTEGER NOT NULL DEFAULT 1;
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS first_order_only BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS promotion_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id UUID NULL REFERENCES orders(id) ON DELETE SET NULL,
  discount NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_promo_redemption_promotion ON promotion_redemptions(promotion_id);
CREATE INDEX IF NOT EXISTS idx_promo_redemption_user ON promotion_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_promo_redemption_order ON promotion_redemptions(order_id);
