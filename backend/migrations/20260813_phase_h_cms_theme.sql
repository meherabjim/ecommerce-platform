-- ============================================================
-- SRS CORE C
-- CMS + HOMEPAGE BUILDER + THEME + GLOBAL SETTINGS
-- ============================================================

CREATE TABLE IF NOT EXISTS store_settings (
  id UUID PRIMARY KEY,
  key VARCHAR(120) NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  group_name VARCHAR(80) NOT NULL DEFAULT 'GENERAL',
  description VARCHAR(255) NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_store_settings_group
  ON store_settings(group_name);

CREATE TABLE IF NOT EXISTS homepage_sections (
  id UUID PRIMARY KEY,
  type VARCHAR(80) NOT NULL,
  title VARCHAR(180) NULL,
  subtitle VARCHAR(300) NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  schedule_from TIMESTAMPTZ NULL,
  schedule_to TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_homepage_sections_order
  ON homepage_sections(sort_order);

CREATE INDEX IF NOT EXISTS idx_homepage_sections_enabled
  ON homepage_sections(enabled);

CREATE TABLE IF NOT EXISTS content_blocks (
  id UUID PRIMARY KEY,
  kind VARCHAR(80) NOT NULL,
  title VARCHAR(180) NOT NULL,
  subtitle VARCHAR(300) NULL,
  body TEXT NULL,
  image_url TEXT NULL,
  link_label VARCHAR(100) NULL,
  link_url TEXT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_blocks_kind
  ON content_blocks(kind);

CREATE INDEX IF NOT EXISTS idx_content_blocks_active
  ON content_blocks(active);

CREATE TABLE IF NOT EXISTS cms_pages (
  id UUID PRIMARY KEY,
  slug VARCHAR(160) NOT NULL UNIQUE,
  title VARCHAR(220) NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
  meta_title VARCHAR(220) NULL,
  meta_description VARCHAR(320) NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cms_pages_status
  ON cms_pages(status);

-- ------------------------------------------------------------
-- DEFAULT STORE SETTINGS
-- ------------------------------------------------------------

INSERT INTO store_settings (id,key,value,group_name,description)
VALUES
  (gen_random_uuid(),'store.identity',
   '{"storeName":"Neuro Commerce","tagline":"Premium retail","logoUrl":"","faviconUrl":""}'::jsonb,
   'BRANDING','Store identity'),
  (gen_random_uuid(),'store.theme',
   '{"primary":"#020617","surface":"#ffffff","background":"#f5f6f8","accent":"#10b981","fontFamily":"Inter, Arial, sans-serif","radius":"24px"}'::jsonb,
   'BRANDING','Theme tokens'),
  (gen_random_uuid(),'store.contact',
   '{"email":"support@neurocommerce.local","phone":"","address":"","facebook":"","instagram":"","youtube":""}'::jsonb,
   'BUSINESS','Business contact and social links'),
  (gen_random_uuid(),'store.commerce',
   '{"currency":"BDT","currencySymbol":"BDT","language":"en","freeShippingMessage":"Fast local delivery · Secure checkout · Easy returns"}'::jsonb,
   'BUSINESS','Commerce defaults'),
  (gen_random_uuid(),'store.seo',
   '{"siteTitle":"Neuro Commerce","siteDescription":"Modern ecommerce platform with live inventory, secure checkout and delivery tracking.","keywords":"ecommerce, online shopping, Bangladesh"}'::jsonb,
   'SEO','Global SEO settings')
ON CONFLICT (key) DO NOTHING;

-- ------------------------------------------------------------
-- DEFAULT HOMEPAGE SECTIONS
-- ------------------------------------------------------------

INSERT INTO homepage_sections
(id,type,title,subtitle,enabled,sort_order,config)
SELECT gen_random_uuid(),'HERO','Everything you need, in one modern store.',
'Discover products, save favorites, checkout securely, track delivery and manage returns from one connected account.',
TRUE,10,
'{"eyebrow":"LIVE INVENTORY","primaryCtaLabel":"Shop now","primaryCtaUrl":"/shop","secondaryCtaLabel":"Track an order","secondaryCtaUrl":"/account"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM homepage_sections WHERE type='HERO');

INSERT INTO homepage_sections
(id,type,title,subtitle,enabled,sort_order,config)
SELECT gen_random_uuid(),'TRUST_STRIP','Why shop with us',NULL,TRUE,20,
'{"items":[{"title":"Fast delivery","subtitle":"Zone-based shipping"},{"title":"Secure shopping","subtitle":"Protected account flow"},{"title":"Easy returns","subtitle":"Track return status"},{"title":"Live stock","subtitle":"Variant-level availability"}]}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM homepage_sections WHERE type='TRUST_STRIP');

INSERT INTO homepage_sections
(id,type,title,subtitle,enabled,sort_order,config)
SELECT gen_random_uuid(),'CATEGORIES','Shop by category','Browse faster',TRUE,30,
'{"limit":8}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM homepage_sections WHERE type='CATEGORIES');

INSERT INTO homepage_sections
(id,type,title,subtitle,enabled,sort_order,config)
SELECT gen_random_uuid(),'PROMOTIONS','Limited offers',NULL,TRUE,40,
'{"limit":2}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM homepage_sections WHERE type='PROMOTIONS');

INSERT INTO homepage_sections
(id,type,title,subtitle,enabled,sort_order,config)
SELECT gen_random_uuid(),'FEATURED_PRODUCTS','Featured products','Curated for you',TRUE,50,
'{"limit":8}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM homepage_sections WHERE type='FEATURED_PRODUCTS');

INSERT INTO homepage_sections
(id,type,title,subtitle,enabled,sort_order,config)
SELECT gen_random_uuid(),'TESTIMONIALS','What customers say',NULL,TRUE,60,
'{"limit":3}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM homepage_sections WHERE type='TESTIMONIALS');

INSERT INTO homepage_sections
(id,type,title,subtitle,enabled,sort_order,config)
SELECT gen_random_uuid(),'FAQ','Frequently asked questions',NULL,TRUE,70,
'{"limit":6}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM homepage_sections WHERE type='FAQ');

-- ------------------------------------------------------------
-- DEFAULT CONTENT
-- ------------------------------------------------------------

INSERT INTO content_blocks
(id,kind,title,subtitle,body,active,sort_order,metadata)
SELECT gen_random_uuid(),'TESTIMONIAL','A smooth shopping experience',
'Verified customer',
'Ordering, delivery tracking and account management all felt simple.',
TRUE,10,'{"rating":5}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM content_blocks WHERE kind='TESTIMONIAL');

INSERT INTO content_blocks
(id,kind,title,body,active,sort_order,metadata)
SELECT gen_random_uuid(),'FAQ','How can I track my order?',
'Sign in to your account and open the order to see the fulfillment and delivery timeline.',
TRUE,10,'{}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM content_blocks WHERE kind='FAQ');

INSERT INTO content_blocks
(id,kind,title,body,active,sort_order,metadata)
SELECT gen_random_uuid(),'FAQ','Can I save more than one delivery address?',
'Yes. You can save Home or Office addresses and optionally attach an exact GPS location.',
TRUE,20,'{}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM content_blocks WHERE kind='FAQ' AND title LIKE 'Can I save%');

INSERT INTO cms_pages
(id,slug,title,body,status,meta_title,meta_description,sort_order,published_at)
SELECT gen_random_uuid(),'about','About Neuro Commerce',
'Neuro Commerce is a configurable ecommerce platform built for modern retail operations.',
'PUBLISHED','About Neuro Commerce','Learn about Neuro Commerce.',10,NOW()
WHERE NOT EXISTS (SELECT 1 FROM cms_pages WHERE slug='about');

INSERT INTO cms_pages
(id,slug,title,body,status,meta_title,meta_description,sort_order,published_at)
SELECT gen_random_uuid(),'privacy','Privacy Policy',
'Update this page from the Admin CMS before production deployment.',
'PUBLISHED','Privacy Policy','Privacy information for Neuro Commerce.',20,NOW()
WHERE NOT EXISTS (SELECT 1 FROM cms_pages WHERE slug='privacy');

INSERT INTO cms_pages
(id,slug,title,body,status,meta_title,meta_description,sort_order,published_at)
SELECT gen_random_uuid(),'terms','Terms & Conditions',
'Update this page from the Admin CMS before production deployment.',
'PUBLISHED','Terms & Conditions','Terms and conditions for Neuro Commerce.',30,NOW()
WHERE NOT EXISTS (SELECT 1 FROM cms_pages WHERE slug='terms');
