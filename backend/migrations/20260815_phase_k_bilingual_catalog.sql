ALTER TABLE products
  ADD COLUMN IF NOT EXISTS name_bn VARCHAR(180),
  ADD COLUMN IF NOT EXISTS short_description_bn VARCHAR(500),
  ADD COLUMN IF NOT EXISTS description_bn TEXT;

ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS name_bn VARCHAR(120),
  ADD COLUMN IF NOT EXISTS description_bn TEXT;

COMMENT ON COLUMN products.name_bn IS 'Bangla storefront product name';
COMMENT ON COLUMN products.short_description_bn IS 'Bangla storefront short description';
COMMENT ON COLUMN products.description_bn IS 'Bangla storefront full description';
COMMENT ON COLUMN categories.name_bn IS 'Bangla storefront category name';
