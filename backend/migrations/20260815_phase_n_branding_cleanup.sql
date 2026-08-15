\encoding UTF8

-- ============================================================
-- PHASE N: LEGACY BRANDING CLEANUP
-- Safe data migration for databases created under the old project name.
-- Custom values that no longer match the legacy defaults are preserved.
-- ============================================================

UPDATE store_settings
SET value = jsonb_set(
      jsonb_set(value, '{storeName}', '"E-Commerce Platform"'::jsonb, true),
      '{tagline}', '"Smart shopping, made simple"'::jsonb, true
    ),
    updated_at = NOW()
WHERE key='store.identity'
  AND (
    value->>'storeName' IS NULL
    OR value->>'storeName'=''
    OR value->>'storeName'='Neuro Commerce'
  );

UPDATE store_settings
SET value = value - 'email',
    updated_at = NOW()
WHERE key='store.contact'
  AND value->>'email'='support@neurocommerce.local';

UPDATE store_settings
SET value =
      CASE
        WHEN value ? 'siteTitle'
          THEN jsonb_set(value,'{siteTitle}','"E-Commerce Platform"'::jsonb,true)
        ELSE value
      END,
    updated_at=NOW()
WHERE key='store.seo'
  AND value->>'siteTitle'='Neuro Commerce';

UPDATE store_settings
SET value =
      CASE
        WHEN value ? 'title'
          THEN jsonb_set(value,'{title}','"E-Commerce Platform"'::jsonb,true)
        ELSE value
      END,
    updated_at=NOW()
WHERE key='store.seo'
  AND value->>'title'='Neuro Commerce';

UPDATE cms_pages
SET title='About E-Commerce Platform',
    body='A configurable full-stack ecommerce platform built for modern retail operations.',
    meta_title='About E-Commerce Platform',
    meta_description='Learn about the E-Commerce Platform.',
    updated_at=NOW()
WHERE slug='about'
  AND (title ILIKE '%Neuro Commerce%' OR body ILIKE '%Neuro Commerce%' OR meta_title ILIKE '%Neuro Commerce%' OR meta_description ILIKE '%Neuro Commerce%');

UPDATE cms_pages
SET meta_description=replace(meta_description,'Neuro Commerce','the E-Commerce Platform'),
    updated_at=NOW()
WHERE meta_description ILIKE '%Neuro Commerce%';

UPDATE brands
SET name='House Fashion',
    slug='house-fashion',
    logo_url='/demo-products/fashion-store-logo.jpg',
    description='In-house demo fashion label for the ecommerce catalog.',
    updated_at=NOW()
WHERE slug='neuro-fashion' OR name='Neuro Fashion';

UPDATE products
SET description=replace(description,'Neuro Commerce','the store'),
    description_bn=replace(description_bn,'Neuro Commerce','স্টোর'),
    updated_at=NOW()
WHERE description LIKE '%Neuro Commerce%'
   OR description_bn LIKE '%Neuro Commerce%';

UPDATE categories
SET description=replace(description,'Neuro Fashion','House Fashion'),
    description_bn=replace(description_bn,'নিউরো ফ্যাশন','হাউস ফ্যাশন'),
    updated_at=NOW()
WHERE description LIKE '%Neuro Fashion%'
   OR description_bn LIKE '%নিউরো ফ্যাশন%';
