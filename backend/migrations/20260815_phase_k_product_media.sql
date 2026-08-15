ALTER TABLE products
  ADD COLUMN IF NOT EXISTS media JSONB NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN products.media IS 'Ordered product media gallery: [{type:image|video,url,alt,poster}]';
