-- Remove old AI/demo fashion product from storefront without deleting historical data.
BEGIN;

DO $$
DECLARE cnt integer;
BEGIN
  SELECT COUNT(*) INTO cnt
  FROM products
  WHERE lower(name)=lower('Men''s Essential Crew Neck T-Shirt')
     OR slug='mens-essential-crew-neck-t-shirt';

  IF cnt > 1 THEN
    RAISE EXCEPTION 'Safety stop: more than one matching AI demo product found (%).', cnt;
  END IF;

  UPDATE product_variants
  SET active=FALSE, updated_at=NOW()
  WHERE product_id IN (
    SELECT id FROM products
    WHERE lower(name)=lower('Men''s Essential Crew Neck T-Shirt')
       OR slug='mens-essential-crew-neck-t-shirt'
  );

  UPDATE products
  SET status='INACTIVE', featured=FALSE, updated_at=NOW()
  WHERE lower(name)=lower('Men''s Essential Crew Neck T-Shirt')
     OR slug='mens-essential-crew-neck-t-shirt';
END $$;

COMMIT;
