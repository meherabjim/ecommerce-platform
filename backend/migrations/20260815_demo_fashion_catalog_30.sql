-- Neuro Commerce demo fashion catalog: 30 products, local media, variants and opening inventory
-- Safe to re-run: product/category/brand slugs and variant SKUs are idempotent.
BEGIN;

CREATE TEMP TABLE IF NOT EXISTS nc_demo_categories(
  gender_slug text, slug text, name text, name_bn text, sort_order int
) ON COMMIT DROP;
TRUNCATE nc_demo_categories;

INSERT INTO nc_demo_categories VALUES ('men','men-hoodies','Hoodies','হুডি',10);
INSERT INTO nc_demo_categories VALUES ('men','men-jackets','Jackets','জ্যাকেট',20);
INSERT INTO nc_demo_categories VALUES ('men','men-jeans','Jeans','জিন্স',30);
INSERT INTO nc_demo_categories VALUES ('men','men-panjabi','Panjabi','পাঞ্জাবি',40);
INSERT INTO nc_demo_categories VALUES ('men','men-polo-shirts','Polo Shirts','পোলো শার্ট',50);
INSERT INTO nc_demo_categories VALUES ('men','men-shirts','Shirts','শার্ট',60);
INSERT INTO nc_demo_categories VALUES ('men','men-sweatshirts','Sweatshirts','সোয়েটশার্ট',70);
INSERT INTO nc_demo_categories VALUES ('men','men-t-shirts','T-Shirts','টি-শার্ট',80);
INSERT INTO nc_demo_categories VALUES ('men','men-trousers','Trousers','ট্রাউজার',90);
INSERT INTO nc_demo_categories VALUES ('women','women-abaya','Abaya','আবায়া',100);
INSERT INTO nc_demo_categories VALUES ('women','women-co-ord-sets','Co-ord Sets','কো-অর্ড সেট',110);
INSERT INTO nc_demo_categories VALUES ('women','women-jeans','Jeans','জিন্স',120);
INSERT INTO nc_demo_categories VALUES ('women','women-kameez','Kameez','কামিজ',130);
INSERT INTO nc_demo_categories VALUES ('women','women-kurti','Kurti','কুর্তি',140);
INSERT INTO nc_demo_categories VALUES ('women','women-outerwear','Outerwear','আউটারওয়্যার',150);
INSERT INTO nc_demo_categories VALUES ('women','women-saree','Saree','শাড়ি',160);
INSERT INTO nc_demo_categories VALUES ('women','women-three-piece','Three Piece','থ্রি-পিস',170);
INSERT INTO nc_demo_categories VALUES ('women','women-tops','Tops','টপস',180);
INSERT INTO nc_demo_categories VALUES ('women','women-trousers','Trousers','ট্রাউজার',190);

DO $$
DECLARE r record; pref text;
BEGIN
  -- Parent categories.
  FOR r IN SELECT * FROM (VALUES
    ('men','Men','পুরুষ','Fashion for men',10),
    ('women','Women','নারী','Fashion for women',20)
  ) AS t(slug,name,name_bn,description,sort_order)
  LOOP
    IF NOT EXISTS (SELECT 1 FROM categories WHERE slug=r.slug) THEN
      SELECT lpad(g::text,2,'0') INTO pref
      FROM generate_series(10,99) g
      WHERE NOT EXISTS (SELECT 1 FROM categories WHERE barcode_prefix=lpad(g::text,2,'0'))
      ORDER BY g LIMIT 1;
      IF pref IS NULL THEN RAISE EXCEPTION 'No free 2-digit category barcode prefix remains'; END IF;
      INSERT INTO categories(id,name,name_bn,slug,barcode_prefix,description,description_bn,parent_id,sort_order,featured_in_nav,active,next_barcode_serial,created_at,updated_at)
      VALUES(gen_random_uuid(),r.name,r.name_bn,r.slug,pref,r.description,
        CASE WHEN r.slug='men' THEN 'পুরুষদের ফ্যাশন' ELSE 'নারীদের ফ্যাশন' END,
        NULL,r.sort_order,TRUE,TRUE,1,NOW(),NOW());
    END IF;
  END LOOP;

  -- Subcategories.
  FOR r IN SELECT * FROM nc_demo_categories ORDER BY sort_order
  LOOP
    IF NOT EXISTS (SELECT 1 FROM categories WHERE slug=r.slug) THEN
      SELECT lpad(g::text,2,'0') INTO pref
      FROM generate_series(10,99) g
      WHERE NOT EXISTS (SELECT 1 FROM categories WHERE barcode_prefix=lpad(g::text,2,'0'))
      ORDER BY g LIMIT 1;
      IF pref IS NULL THEN RAISE EXCEPTION 'No free 2-digit category barcode prefix remains'; END IF;
      INSERT INTO categories(id,name,name_bn,slug,barcode_prefix,description,description_bn,parent_id,sort_order,featured_in_nav,active,next_barcode_serial,created_at,updated_at)
      VALUES(gen_random_uuid(),r.name,r.name_bn,r.slug,pref,
        'Neuro Fashion curated demo collection','নিউরো ফ্যাশন ডেমো কালেকশন',
        (SELECT id FROM categories WHERE slug=r.gender_slug),r.sort_order,FALSE,TRUE,1,NOW(),NOW());
    END IF;
  END LOOP;
END $$;

INSERT INTO brands(id,name,slug,logo_url,description,active,created_at,updated_at)
SELECT gen_random_uuid(),'Neuro Fashion','neuro-fashion','/demo-products/neuro-fashion-logo.jpg',
       'Neuro Commerce in-house demo fashion label.',TRUE,NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM brands WHERE slug='neuro-fashion');

CREATE TEMP TABLE IF NOT EXISTS nc_demo_products(
 slug text, name text, name_bn text, gender text, subcategory_slug text,
 price numeric, sale_price numeric, color text, featured boolean
) ON COMMIT DROP;
TRUNCATE nc_demo_products;

INSERT INTO nc_demo_products VALUES ('men-essential-crew-neck-tshirt','Men''s Essential Crew Neck T-Shirt','পুরুষদের এসেনশিয়াল ক্রু নেক টি-শার্ট','men','men-t-shirts',890,749,'Black',TRUE);
INSERT INTO nc_demo_products VALUES ('men-premium-polo-shirt','Men''s Premium Pique Polo Shirt','পুরুষদের প্রিমিয়াম পিকে পোলো শার্ট','men','men-polo-shirts',1290,1090,'Navy',TRUE);
INSERT INTO nc_demo_products VALUES ('men-oxford-formal-shirt','Men''s Oxford Formal Shirt','পুরুষদের অক্সফোর্ড ফরমাল শার্ট','men','men-shirts',1690,1449,'Sky Blue',TRUE);
INSERT INTO nc_demo_products VALUES ('men-casual-check-shirt','Men''s Casual Check Shirt','পুরুষদের ক্যাজুয়াল চেক শার্ট','men','men-shirts',1490,1249,'Maroon',TRUE);
INSERT INTO nc_demo_products VALUES ('men-slim-fit-jeans','Men''s Slim Fit Stretch Jeans','পুরুষদের স্লিম ফিট স্ট্রেচ জিন্স','men','men-jeans',1990,1690,'Indigo',TRUE);
INSERT INTO nc_demo_products VALUES ('men-cotton-chino','Men''s Everyday Cotton Chino','পুরুষদের এভরিডে কটন চিনো','men','men-trousers',1790,1490,'Khaki',TRUE);
INSERT INTO nc_demo_products VALUES ('men-classic-panjabi','Men''s Classic Cotton Panjabi','পুরুষদের ক্লাসিক কটন পাঞ্জাবি','men','men-panjabi',1890,1590,'Off White',TRUE);
INSERT INTO nc_demo_products VALUES ('men-embroidered-panjabi','Men''s Embroidered Festive Panjabi','পুরুষদের এমব্রয়ডারি ফেস্টিভ পাঞ্জাবি','men','men-panjabi',2490,2190,'Bottle Green',TRUE);
INSERT INTO nc_demo_products VALUES ('men-zip-hoodie','Men''s Urban Zip Hoodie','পুরুষদের আরবান জিপ হুডি','men','men-hoodies',2190,1890,'Charcoal',TRUE);
INSERT INTO nc_demo_products VALUES ('men-sweatshirt','Men''s Minimal Sweatshirt','পুরুষদের মিনিমাল সোয়েটশার্ট','men','men-sweatshirts',1690,1390,'Olive',TRUE);
INSERT INTO nc_demo_products VALUES ('men-linen-shirt','Men''s Relaxed Linen Shirt','পুরুষদের রিল্যাক্সড লিনেন শার্ট','men','men-shirts',1890,1590,'Beige',TRUE);
INSERT INTO nc_demo_products VALUES ('men-denim-jacket','Men''s Classic Denim Jacket','পুরুষদের ক্লাসিক ডেনিম জ্যাকেট','men','men-jackets',2990,2590,'Blue',TRUE);
INSERT INTO nc_demo_products VALUES ('men-cargo-pants','Men''s Utility Cargo Pants','পুরুষদের ইউটিলিটি কার্গো প্যান্ট','men','men-trousers',2290,1990,'Black',FALSE);
INSERT INTO nc_demo_products VALUES ('men-performance-tshirt','Men''s Performance Dry-Fit T-Shirt','পুরুষদের পারফরম্যান্স ড্রাই-ফিট টি-শার্ট','men','men-t-shirts',1090,899,'Royal Blue',FALSE);
INSERT INTO nc_demo_products VALUES ('men-waffle-polo','Men''s Textured Waffle Polo','পুরুষদের টেক্সচার্ড ওয়াফল পোলো','men','men-polo-shirts',1590,1349,'Cream',FALSE);
INSERT INTO nc_demo_products VALUES ('women-everyday-kurti','Women''s Everyday Cotton Kurti','নারীদের এভরিডে কটন কুর্তি','women','women-kurti',1490,1249,'Teal',FALSE);
INSERT INTO nc_demo_products VALUES ('women-embroidered-kurti','Women''s Embroidered Long Kurti','নারীদের এমব্রয়ডারি লং কুর্তি','women','women-kurti',1990,1690,'Rust',FALSE);
INSERT INTO nc_demo_products VALUES ('women-three-piece-floral','Women''s Floral Three Piece Set','নারীদের ফ্লোরাল থ্রি-পিস সেট','women','women-three-piece',2890,2490,'Pink',FALSE);
INSERT INTO nc_demo_products VALUES ('women-three-piece-printed','Women''s Printed Lawn Three Piece','নারীদের প্রিন্টেড লন থ্রি-পিস','women','women-three-piece',2590,2190,'Mint',FALSE);
INSERT INTO nc_demo_products VALUES ('women-soft-cotton-saree','Women''s Soft Cotton Saree','নারীদের সফট কটন শাড়ি','women','women-saree',2390,1990,'Mustard',FALSE);
INSERT INTO nc_demo_products VALUES ('women-jamdani-inspired-saree','Women''s Jamdani Inspired Saree','নারীদের জামদানি অনুপ্রাণিত শাড়ি','women','women-saree',3990,3490,'Red',FALSE);
INSERT INTO nc_demo_products VALUES ('women-casual-top','Women''s Relaxed Casual Top','নারীদের রিল্যাক্সড ক্যাজুয়াল টপ','women','women-tops',1290,1090,'Lavender',FALSE);
INSERT INTO nc_demo_products VALUES ('women-ribbed-top','Women''s Ribbed Everyday Top','নারীদের রিবড এভরিডে টপ','women','women-tops',1190,949,'Black',FALSE);
INSERT INTO nc_demo_products VALUES ('women-wide-leg-trouser','Women''s Wide Leg Trouser','নারীদের ওয়াইড লেগ ট্রাউজার','women','women-trousers',1690,1390,'Beige',FALSE);
INSERT INTO nc_demo_products VALUES ('women-denim-jeans','Women''s High Rise Straight Jeans','নারীদের হাই রাইজ স্ট্রেইট জিন্স','women','women-jeans',2090,1790,'Blue',FALSE);
INSERT INTO nc_demo_products VALUES ('women-modest-abaya','Women''s Minimal Everyday Abaya','নারীদের মিনিমাল এভরিডে আবায়া','women','women-abaya',2790,2390,'Black',FALSE);
INSERT INTO nc_demo_products VALUES ('women-long-cardigan','Women''s Longline Knit Cardigan','নারীদের লংলাইন নিট কার্ডিগান','women','women-outerwear',2290,1990,'Mocha',FALSE);
INSERT INTO nc_demo_products VALUES ('women-coord-set','Women''s Relaxed Co-ord Set','নারীদের রিল্যাক্সড কো-অর্ড সেট','women','women-co-ord-sets',2690,2290,'Sage',FALSE);
INSERT INTO nc_demo_products VALUES ('women-party-kameez','Women''s Festive Party Kameez','নারীদের ফেস্টিভ পার্টি কামিজ','women','women-kameez',3190,2790,'Wine',FALSE);
INSERT INTO nc_demo_products VALUES ('women-linen-shirt','Women''s Oversized Linen Shirt','নারীদের ওভারসাইজড লিনেন শার্ট','women','women-tops',1790,1490,'White',FALSE);

INSERT INTO products(
 id,name,name_bn,slug,category_id,brand_id,description,description_bn,
 short_description,short_description_bn,primary_image_url,media,status,featured,created_at,updated_at
)
SELECT gen_random_uuid(),d.name,d.name_bn,d.slug,c.id,b.id,
       'Comfortable, versatile fashion selected for everyday wear. Demo product content for Neuro Commerce.',
       'দৈনন্দিন ব্যবহারের জন্য আরামদায়ক ও স্টাইলিশ ফ্যাশন। Neuro Commerce ডেমো প্রোডাক্ট।',
       'Modern fit  -  Local stock  -  Easy returns',
       'মডার্ন ফিট  -  লোকাল স্টক  -  সহজ রিটার্ন',
       '/demo-products/'||d.slug||'.jpg',
       jsonb_build_array(
         jsonb_build_object('type','image','url','/demo-products/'||d.slug||'.jpg','alt',d.name),
         jsonb_build_object('type','video','url','/demo-products/'||d.slug||'.mp4','poster','/demo-products/'||d.slug||'.jpg')
       ),
       'ACTIVE',d.featured,NOW(),NOW()
FROM nc_demo_products d
JOIN categories c ON c.slug=d.subcategory_slug
JOIN brands b ON b.slug='neuro-fashion'
ON CONFLICT (slug) DO NOTHING;

CREATE TEMP TABLE IF NOT EXISTS nc_demo_variants(
 product_slug text, sku text, variant_code text, size_value text, color_value text,
 price numeric, sale_price numeric, cost_price numeric, opening_stock int, image_url text
) ON COMMIT DROP;
TRUNCATE nc_demo_variants;

INSERT INTO nc_demo_variants VALUES ('men-essential-crew-neck-tshirt','NF-01-S-1','0011','S','Black',890,749,434.42,16,'/demo-products/men-essential-crew-neck-tshirt.jpg');
INSERT INTO nc_demo_variants VALUES ('men-essential-crew-neck-tshirt','NF-01-M-2','0012','M','Black',890,749,434.42,19,'/demo-products/men-essential-crew-neck-tshirt.jpg');
INSERT INTO nc_demo_variants VALUES ('men-essential-crew-neck-tshirt','NF-01-L-3','0013','L','Black',890,749,434.42,22,'/demo-products/men-essential-crew-neck-tshirt.jpg');
INSERT INTO nc_demo_variants VALUES ('men-premium-polo-shirt','NF-02-M-1','0021','M','Navy',1290,1090,632.2,17,'/demo-products/men-premium-polo-shirt.jpg');
INSERT INTO nc_demo_variants VALUES ('men-premium-polo-shirt','NF-02-L-2','0022','L','Navy',1290,1090,632.2,20,'/demo-products/men-premium-polo-shirt.jpg');
INSERT INTO nc_demo_variants VALUES ('men-premium-polo-shirt','NF-02-XL-3','0023','XL','Navy',1290,1090,632.2,23,'/demo-products/men-premium-polo-shirt.jpg');
INSERT INTO nc_demo_variants VALUES ('men-oxford-formal-shirt','NF-03-M-1','0031','M','Sky Blue',1690,1449,840.42,18,'/demo-products/men-oxford-formal-shirt.jpg');
INSERT INTO nc_demo_variants VALUES ('men-oxford-formal-shirt','NF-03-L-2','0032','L','Sky Blue',1690,1449,840.42,21,'/demo-products/men-oxford-formal-shirt.jpg');
INSERT INTO nc_demo_variants VALUES ('men-oxford-formal-shirt','NF-03-XL-3','0033','XL','Sky Blue',1690,1449,840.42,24,'/demo-products/men-oxford-formal-shirt.jpg');
INSERT INTO nc_demo_variants VALUES ('men-casual-check-shirt','NF-04-M-1','0041','M','Maroon',1490,1249,724.42,19,'/demo-products/men-casual-check-shirt.jpg');
INSERT INTO nc_demo_variants VALUES ('men-casual-check-shirt','NF-04-L-2','0042','L','Maroon',1490,1249,724.42,22,'/demo-products/men-casual-check-shirt.jpg');
INSERT INTO nc_demo_variants VALUES ('men-casual-check-shirt','NF-04-XL-3','0043','XL','Maroon',1490,1249,724.42,25,'/demo-products/men-casual-check-shirt.jpg');
INSERT INTO nc_demo_variants VALUES ('men-slim-fit-jeans','NF-05-30-1','0051','30','Indigo',1990,1690,980.2,20,'/demo-products/men-slim-fit-jeans.jpg');
INSERT INTO nc_demo_variants VALUES ('men-slim-fit-jeans','NF-05-32-2','0052','32','Indigo',1990,1690,980.2,23,'/demo-products/men-slim-fit-jeans.jpg');
INSERT INTO nc_demo_variants VALUES ('men-slim-fit-jeans','NF-05-34-3','0053','34','Indigo',1990,1690,980.2,26,'/demo-products/men-slim-fit-jeans.jpg');
INSERT INTO nc_demo_variants VALUES ('men-cotton-chino','NF-06-30-1','0061','30','Khaki',1790,1490,864.2,21,'/demo-products/men-cotton-chino.jpg');
INSERT INTO nc_demo_variants VALUES ('men-cotton-chino','NF-06-32-2','0062','32','Khaki',1790,1490,864.2,24,'/demo-products/men-cotton-chino.jpg');
INSERT INTO nc_demo_variants VALUES ('men-cotton-chino','NF-06-34-3','0063','34','Khaki',1790,1490,864.2,27,'/demo-products/men-cotton-chino.jpg');
INSERT INTO nc_demo_variants VALUES ('men-classic-panjabi','NF-07-M-1','0071','M','Off White',1890,1590,922.2,22,'/demo-products/men-classic-panjabi.jpg');
INSERT INTO nc_demo_variants VALUES ('men-classic-panjabi','NF-07-L-2','0072','L','Off White',1890,1590,922.2,25,'/demo-products/men-classic-panjabi.jpg');
INSERT INTO nc_demo_variants VALUES ('men-classic-panjabi','NF-07-XL-3','0073','XL','Off White',1890,1590,922.2,28,'/demo-products/men-classic-panjabi.jpg');
INSERT INTO nc_demo_variants VALUES ('men-embroidered-panjabi','NF-08-M-1','0081','M','Bottle Green',2490,2190,1270.2,23,'/demo-products/men-embroidered-panjabi.jpg');
INSERT INTO nc_demo_variants VALUES ('men-embroidered-panjabi','NF-08-L-2','0082','L','Bottle Green',2490,2190,1270.2,26,'/demo-products/men-embroidered-panjabi.jpg');
INSERT INTO nc_demo_variants VALUES ('men-embroidered-panjabi','NF-08-XL-3','0083','XL','Bottle Green',2490,2190,1270.2,12,'/demo-products/men-embroidered-panjabi.jpg');
INSERT INTO nc_demo_variants VALUES ('men-zip-hoodie','NF-09-M-1','0091','M','Charcoal',2190,1890,1096.2,24,'/demo-products/men-zip-hoodie.jpg');
INSERT INTO nc_demo_variants VALUES ('men-zip-hoodie','NF-09-L-2','0092','L','Charcoal',2190,1890,1096.2,27,'/demo-products/men-zip-hoodie.jpg');
INSERT INTO nc_demo_variants VALUES ('men-zip-hoodie','NF-09-XL-3','0093','XL','Charcoal',2190,1890,1096.2,13,'/demo-products/men-zip-hoodie.jpg');
INSERT INTO nc_demo_variants VALUES ('men-sweatshirt','NF-10-M-1','0101','M','Olive',1690,1390,806.2,25,'/demo-products/men-sweatshirt.jpg');
INSERT INTO nc_demo_variants VALUES ('men-sweatshirt','NF-10-L-2','0102','L','Olive',1690,1390,806.2,28,'/demo-products/men-sweatshirt.jpg');
INSERT INTO nc_demo_variants VALUES ('men-sweatshirt','NF-10-XL-3','0103','XL','Olive',1690,1390,806.2,14,'/demo-products/men-sweatshirt.jpg');
INSERT INTO nc_demo_variants VALUES ('men-linen-shirt','NF-11-M-1','0111','M','Beige',1890,1590,922.2,26,'/demo-products/men-linen-shirt.jpg');
INSERT INTO nc_demo_variants VALUES ('men-linen-shirt','NF-11-L-2','0112','L','Beige',1890,1590,922.2,12,'/demo-products/men-linen-shirt.jpg');
INSERT INTO nc_demo_variants VALUES ('men-linen-shirt','NF-11-XL-3','0113','XL','Beige',1890,1590,922.2,15,'/demo-products/men-linen-shirt.jpg');
INSERT INTO nc_demo_variants VALUES ('men-denim-jacket','NF-12-M-1','0121','M','Blue',2990,2590,1502.2,27,'/demo-products/men-denim-jacket.jpg');
INSERT INTO nc_demo_variants VALUES ('men-denim-jacket','NF-12-L-2','0122','L','Blue',2990,2590,1502.2,13,'/demo-products/men-denim-jacket.jpg');
INSERT INTO nc_demo_variants VALUES ('men-denim-jacket','NF-12-XL-3','0123','XL','Blue',2990,2590,1502.2,16,'/demo-products/men-denim-jacket.jpg');
INSERT INTO nc_demo_variants VALUES ('men-cargo-pants','NF-13-30-1','0131','30','Black',2290,1990,1154.2,28,'/demo-products/men-cargo-pants.jpg');
INSERT INTO nc_demo_variants VALUES ('men-cargo-pants','NF-13-32-2','0132','32','Black',2290,1990,1154.2,14,'/demo-products/men-cargo-pants.jpg');
INSERT INTO nc_demo_variants VALUES ('men-cargo-pants','NF-13-34-3','0133','34','Black',2290,1990,1154.2,17,'/demo-products/men-cargo-pants.jpg');
INSERT INTO nc_demo_variants VALUES ('men-performance-tshirt','NF-14-S-1','0141','S','Royal Blue',1090,899,521.42,12,'/demo-products/men-performance-tshirt.jpg');
INSERT INTO nc_demo_variants VALUES ('men-performance-tshirt','NF-14-M-2','0142','M','Royal Blue',1090,899,521.42,15,'/demo-products/men-performance-tshirt.jpg');
INSERT INTO nc_demo_variants VALUES ('men-performance-tshirt','NF-14-L-3','0143','L','Royal Blue',1090,899,521.42,18,'/demo-products/men-performance-tshirt.jpg');
INSERT INTO nc_demo_variants VALUES ('men-waffle-polo','NF-15-M-1','0151','M','Cream',1590,1349,782.42,13,'/demo-products/men-waffle-polo.jpg');
INSERT INTO nc_demo_variants VALUES ('men-waffle-polo','NF-15-L-2','0152','L','Cream',1590,1349,782.42,16,'/demo-products/men-waffle-polo.jpg');
INSERT INTO nc_demo_variants VALUES ('men-waffle-polo','NF-15-XL-3','0153','XL','Cream',1590,1349,782.42,19,'/demo-products/men-waffle-polo.jpg');
INSERT INTO nc_demo_variants VALUES ('women-everyday-kurti','NF-16-S-1','0161','S','Teal',1490,1249,724.42,14,'/demo-products/women-everyday-kurti.jpg');
INSERT INTO nc_demo_variants VALUES ('women-everyday-kurti','NF-16-M-2','0162','M','Teal',1490,1249,724.42,17,'/demo-products/women-everyday-kurti.jpg');
INSERT INTO nc_demo_variants VALUES ('women-everyday-kurti','NF-16-L-3','0163','L','Teal',1490,1249,724.42,20,'/demo-products/women-everyday-kurti.jpg');
INSERT INTO nc_demo_variants VALUES ('women-embroidered-kurti','NF-17-S-1','0171','S','Rust',1990,1690,980.2,15,'/demo-products/women-embroidered-kurti.jpg');
INSERT INTO nc_demo_variants VALUES ('women-embroidered-kurti','NF-17-M-2','0172','M','Rust',1990,1690,980.2,18,'/demo-products/women-embroidered-kurti.jpg');
INSERT INTO nc_demo_variants VALUES ('women-embroidered-kurti','NF-17-L-3','0173','L','Rust',1990,1690,980.2,21,'/demo-products/women-embroidered-kurti.jpg');
INSERT INTO nc_demo_variants VALUES ('women-three-piece-floral','NF-18-S-1','0181','S','Pink',2890,2490,1444.2,16,'/demo-products/women-three-piece-floral.jpg');
INSERT INTO nc_demo_variants VALUES ('women-three-piece-floral','NF-18-M-2','0182','M','Pink',2890,2490,1444.2,19,'/demo-products/women-three-piece-floral.jpg');
INSERT INTO nc_demo_variants VALUES ('women-three-piece-floral','NF-18-L-3','0183','L','Pink',2890,2490,1444.2,22,'/demo-products/women-three-piece-floral.jpg');
INSERT INTO nc_demo_variants VALUES ('women-three-piece-printed','NF-19-S-1','0191','S','Mint',2590,2190,1270.2,17,'/demo-products/women-three-piece-printed.jpg');
INSERT INTO nc_demo_variants VALUES ('women-three-piece-printed','NF-19-M-2','0192','M','Mint',2590,2190,1270.2,20,'/demo-products/women-three-piece-printed.jpg');
INSERT INTO nc_demo_variants VALUES ('women-three-piece-printed','NF-19-L-3','0193','L','Mint',2590,2190,1270.2,23,'/demo-products/women-three-piece-printed.jpg');
INSERT INTO nc_demo_variants VALUES ('women-soft-cotton-saree','NF-20-FREE-1','0201','Free','Mustard',2390,1990,1154.2,18,'/demo-products/women-soft-cotton-saree.jpg');
INSERT INTO nc_demo_variants VALUES ('women-jamdani-inspired-saree','NF-21-FREE-1','0211','Free','Red',3990,3490,2024.2,19,'/demo-products/women-jamdani-inspired-saree.jpg');
INSERT INTO nc_demo_variants VALUES ('women-casual-top','NF-22-S-1','0221','S','Lavender',1290,1090,632.2,20,'/demo-products/women-casual-top.jpg');
INSERT INTO nc_demo_variants VALUES ('women-casual-top','NF-22-M-2','0222','M','Lavender',1290,1090,632.2,23,'/demo-products/women-casual-top.jpg');
INSERT INTO nc_demo_variants VALUES ('women-casual-top','NF-22-L-3','0223','L','Lavender',1290,1090,632.2,26,'/demo-products/women-casual-top.jpg');
INSERT INTO nc_demo_variants VALUES ('women-ribbed-top','NF-23-S-1','0231','S','Black',1190,949,550.42,21,'/demo-products/women-ribbed-top.jpg');
INSERT INTO nc_demo_variants VALUES ('women-ribbed-top','NF-23-M-2','0232','M','Black',1190,949,550.42,24,'/demo-products/women-ribbed-top.jpg');
INSERT INTO nc_demo_variants VALUES ('women-ribbed-top','NF-23-L-3','0233','L','Black',1190,949,550.42,27,'/demo-products/women-ribbed-top.jpg');
INSERT INTO nc_demo_variants VALUES ('women-wide-leg-trouser','NF-24-28-1','0241','28','Beige',1690,1390,806.2,22,'/demo-products/women-wide-leg-trouser.jpg');
INSERT INTO nc_demo_variants VALUES ('women-wide-leg-trouser','NF-24-30-2','0242','30','Beige',1690,1390,806.2,25,'/demo-products/women-wide-leg-trouser.jpg');
INSERT INTO nc_demo_variants VALUES ('women-wide-leg-trouser','NF-24-32-3','0243','32','Beige',1690,1390,806.2,28,'/demo-products/women-wide-leg-trouser.jpg');
INSERT INTO nc_demo_variants VALUES ('women-denim-jeans','NF-25-28-1','0251','28','Blue',2090,1790,1038.2,23,'/demo-products/women-denim-jeans.jpg');
INSERT INTO nc_demo_variants VALUES ('women-denim-jeans','NF-25-30-2','0252','30','Blue',2090,1790,1038.2,26,'/demo-products/women-denim-jeans.jpg');
INSERT INTO nc_demo_variants VALUES ('women-denim-jeans','NF-25-32-3','0253','32','Blue',2090,1790,1038.2,12,'/demo-products/women-denim-jeans.jpg');
INSERT INTO nc_demo_variants VALUES ('women-modest-abaya','NF-26-52-1','0261','52','Black',2790,2390,1386.2,24,'/demo-products/women-modest-abaya.jpg');
INSERT INTO nc_demo_variants VALUES ('women-modest-abaya','NF-26-54-2','0262','54','Black',2790,2390,1386.2,27,'/demo-products/women-modest-abaya.jpg');
INSERT INTO nc_demo_variants VALUES ('women-modest-abaya','NF-26-56-3','0263','56','Black',2790,2390,1386.2,13,'/demo-products/women-modest-abaya.jpg');
INSERT INTO nc_demo_variants VALUES ('women-long-cardigan','NF-27-S-1','0271','S','Mocha',2290,1990,1154.2,25,'/demo-products/women-long-cardigan.jpg');
INSERT INTO nc_demo_variants VALUES ('women-long-cardigan','NF-27-M-2','0272','M','Mocha',2290,1990,1154.2,28,'/demo-products/women-long-cardigan.jpg');
INSERT INTO nc_demo_variants VALUES ('women-long-cardigan','NF-27-L-3','0273','L','Mocha',2290,1990,1154.2,14,'/demo-products/women-long-cardigan.jpg');
INSERT INTO nc_demo_variants VALUES ('women-coord-set','NF-28-S-1','0281','S','Sage',2690,2290,1328.2,26,'/demo-products/women-coord-set.jpg');
INSERT INTO nc_demo_variants VALUES ('women-coord-set','NF-28-M-2','0282','M','Sage',2690,2290,1328.2,12,'/demo-products/women-coord-set.jpg');
INSERT INTO nc_demo_variants VALUES ('women-coord-set','NF-28-L-3','0283','L','Sage',2690,2290,1328.2,15,'/demo-products/women-coord-set.jpg');
INSERT INTO nc_demo_variants VALUES ('women-party-kameez','NF-29-S-1','0291','S','Wine',3190,2790,1618.2,27,'/demo-products/women-party-kameez.jpg');
INSERT INTO nc_demo_variants VALUES ('women-party-kameez','NF-29-M-2','0292','M','Wine',3190,2790,1618.2,13,'/demo-products/women-party-kameez.jpg');
INSERT INTO nc_demo_variants VALUES ('women-party-kameez','NF-29-L-3','0293','L','Wine',3190,2790,1618.2,16,'/demo-products/women-party-kameez.jpg');
INSERT INTO nc_demo_variants VALUES ('women-linen-shirt','NF-30-S-1','0301','S','White',1790,1490,864.2,28,'/demo-products/women-linen-shirt.jpg');
INSERT INTO nc_demo_variants VALUES ('women-linen-shirt','NF-30-M-2','0302','M','White',1790,1490,864.2,14,'/demo-products/women-linen-shirt.jpg');
INSERT INTO nc_demo_variants VALUES ('women-linen-shirt','NF-30-L-3','0303','L','White',1790,1490,864.2,17,'/demo-products/women-linen-shirt.jpg');

DO $$
DECLARE r record; p_id uuid; c_id uuid; pref text; serial_no int; firstten text; checksum_sum int; checksum text; bc text; i int; w_id uuid; v_id uuid;
BEGIN
  SELECT id INTO w_id FROM warehouses WHERE code='MAIN' LIMIT 1;
  IF w_id IS NULL THEN
    INSERT INTO warehouses(id,name,code,address,active,created_at,updated_at)
    VALUES(gen_random_uuid(),'Main Warehouse','MAIN','Primary stock location',TRUE,NOW(),NOW())
    RETURNING id INTO w_id;
  END IF;

  FOR r IN SELECT * FROM nc_demo_variants LOOP
    SELECT p.id,p.category_id INTO p_id,c_id FROM products p WHERE p.slug=r.product_slug;
    IF p_id IS NULL THEN RAISE EXCEPTION 'Seed product missing: %',r.product_slug; END IF;

    SELECT id INTO v_id FROM product_variants WHERE sku=r.sku;
    IF v_id IS NULL THEN
      SELECT barcode_prefix,next_barcode_serial INTO pref,serial_no FROM categories WHERE id=c_id FOR UPDATE;
      IF serial_no > 9999 THEN RAISE EXCEPTION 'Category barcode serial exhausted for %',r.product_slug; END IF;
      firstten := pref || lpad(regexp_replace(r.variant_code,'\D','','g'),4,'0') || lpad(serial_no::text,4,'0');
      checksum_sum := 0;
      FOR i IN 1..10 LOOP
        checksum_sum := checksum_sum + substr(firstten,i,1)::int * CASE WHEN mod(i-1,2)=0 THEN 3 ELSE 7 END;
      END LOOP;
      checksum := lpad(mod(checksum_sum,100)::text,2,'0');
      bc := firstten || checksum;

      INSERT INTO product_variants(
        id,product_id,sku,barcode,variant_code,attributes,price,sale_price,cost_price,weight,image_url,active,created_at,updated_at
      ) VALUES(
        gen_random_uuid(),p_id,r.sku,bc,r.variant_code,
        jsonb_build_object('Size',r.size_value,'Color',r.color_value),
        r.price,r.sale_price,r.cost_price,0.350,r.image_url,TRUE,NOW(),NOW()
      ) RETURNING id INTO v_id;
      UPDATE categories SET next_barcode_serial=serial_no+1,updated_at=NOW() WHERE id=c_id;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM inventory WHERE warehouse_id=w_id AND variant_id=v_id) THEN
      INSERT INTO inventory(id,warehouse_id,variant_id,stock_on_hand,reserved,reorder_level,created_at,updated_at)
      VALUES(gen_random_uuid(),w_id,v_id,r.opening_stock,0,5,NOW(),NOW());
      INSERT INTO inventory_movements(id,warehouse_id,variant_id,type,quantity,balance_after,note,created_at,updated_at)
      VALUES(gen_random_uuid(),w_id,v_id,'OPENING',r.opening_stock,r.opening_stock,'Demo fashion opening stock',NOW(),NOW());
    END IF;
  END LOOP;
END $$;

COMMIT;
