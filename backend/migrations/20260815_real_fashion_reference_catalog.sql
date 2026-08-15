-- Neuro Commerce REAL REFERENCE FASHION CATALOG
-- Public catalog metadata sourced from official Ecstasy product/category pages on 2026-08-15.
-- Official images are referenced by URL; image files are NOT redistributed in this package.
BEGIN;

-- Hide the previous synthetic demo catalog.
UPDATE products p SET status='INACTIVE', updated_at=NOW()
WHERE brand_id=(SELECT id FROM brands WHERE slug='neuro-fashion');
UPDATE product_variants v SET active=FALSE, updated_at=NOW()
WHERE product_id IN (SELECT id FROM products WHERE brand_id=(SELECT id FROM brands WHERE slug='neuro-fashion'));

-- Ensure Men/Women + required subcategories exist.
DO $$
DECLARE pref text;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug='men') THEN
    SELECT lpad(g::text,2,'0') INTO pref FROM generate_series(10,99) g
    WHERE NOT EXISTS(SELECT 1 FROM categories WHERE barcode_prefix=lpad(g::text,2,'0')) ORDER BY g LIMIT 1;
    INSERT INTO categories(id,name,name_bn,slug,barcode_prefix,description,description_bn,parent_id,sort_order,featured_in_nav,active,next_barcode_serial,created_at,updated_at)
    VALUES(gen_random_uuid(),'Men','পুরুষ','men',pref,'Men fashion','পুরুষদের ফ্যাশন',NULL,10,TRUE,TRUE,1,NOW(),NOW());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug='women') THEN
    SELECT lpad(g::text,2,'0') INTO pref FROM generate_series(10,99) g
    WHERE NOT EXISTS(SELECT 1 FROM categories WHERE barcode_prefix=lpad(g::text,2,'0')) ORDER BY g LIMIT 1;
    INSERT INTO categories(id,name,name_bn,slug,barcode_prefix,description,description_bn,parent_id,sort_order,featured_in_nav,active,next_barcode_serial,created_at,updated_at)
    VALUES(gen_random_uuid(),'Women','নারী','women',pref,'Women fashion','নারীদের ফ্যাশন',NULL,20,TRUE,TRUE,1,NOW(),NOW());
  END IF;
END $$;

CREATE TEMP TABLE nc_real_categories(gender_slug text,slug text,name text,name_bn text,sort_order int) ON COMMIT DROP;
INSERT INTO nc_real_categories VALUES
('men','men-shirts','Shirts','শার্ট',10),
('men','men-t-shirts','T-Shirts','টি-শার্ট',20),
('women','women-tops','Tops','টপস',30);

DO $$
DECLARE r record; pref text;
BEGIN
  FOR r IN SELECT * FROM nc_real_categories LOOP
    IF NOT EXISTS(SELECT 1 FROM categories WHERE slug=r.slug) THEN
      SELECT lpad(g::text,2,'0') INTO pref FROM generate_series(10,99) g
      WHERE NOT EXISTS(SELECT 1 FROM categories WHERE barcode_prefix=lpad(g::text,2,'0')) ORDER BY g LIMIT 1;
      INSERT INTO categories(id,name,name_bn,slug,barcode_prefix,description,description_bn,parent_id,sort_order,featured_in_nav,active,next_barcode_serial,created_at,updated_at)
      VALUES(gen_random_uuid(),r.name,r.name_bn,r.slug,pref,'Current fashion reference catalog','বর্তমান ফ্যাশন রেফারেন্স ক্যাটালগ',
      (SELECT id FROM categories WHERE slug=r.gender_slug),r.sort_order,FALSE,TRUE,1,NOW(),NOW());
    END IF;
  END LOOP;
END $$;

INSERT INTO brands(id,name,slug,logo_url,description,active,created_at,updated_at)
SELECT gen_random_uuid(),'ECSTASY','ecstasy-reference',NULL,
'Reference catalog using current public ECSTASY product metadata and official image URLs.',TRUE,NOW(),NOW()
WHERE NOT EXISTS(SELECT 1 FROM brands WHERE slug='ecstasy-reference');

CREATE TEMP TABLE nc_real_products(
 slug text,name text,name_bn text,gender text,category_slug text,price numeric,color text,
 sizes text[],image_url text,source_url text,description text
) ON COMMIT DROP;

INSERT INTO nc_real_products VALUES ('ecstasy-zarzain-shirt-burgundy','ZARZAIN Shirt - Burgundy','জারজাইন শার্ট - বারগান্ডি','men','men-shirts',2288,'Burgundy',ARRAY['M','L'],'https://ecstasybd.com/all-images/product/Product-Image-1786522868.jpg','https://ecstasybd.com/?page=product-details&pid=7426','Silk shirt with a pointed collar, draped neckline detail, full sleeves and a relaxed curved hem.');
INSERT INTO nc_real_products VALUES ('ecstasy-casual-shirt-ivory','Casual Shirt - Ivory','ক্যাজুয়াল শার্ট - আইভরি','men','men-shirts',2624,'Ivory',ARRAY['S','M','L','XL'],'https://ecstasybd.com/all-images/product/Product-Image-1786520748.jpg','https://ecstasybd.com/?page=product-list&sid=4','Mixed-cotton casual shirt with a relaxed summer silhouette.');
INSERT INTO nc_real_products VALUES ('ecstasy-casual-shirt-stone','Casual Shirt - Stone','ক্যাজুয়াল শার্ট - স্টোন','men','men-shirts',2574,'Stone',ARRAY['S','M','L','XL'],'https://ecstasybd.com/all-images/product/Product-Image-1786520384.jpg','https://ecstasybd.com/?page=product-list&sid=4','Mixed-cotton casual shirt designed for everyday wear and easy layering.');
INSERT INTO nc_real_products VALUES ('ecstasy-casual-shirt-light-blue','Casual Shirt - Light Blue','ক্যাজুয়াল শার্ট - লাইট ব্লু','men','men-shirts',2574,'Light Blue',ARRAY['S','M','L','XL'],'https://ecstasybd.com/all-images/product/Product-Image-1786520042.jpg','https://ecstasybd.com/?page=product-list&sid=4','Short-sleeve casual shirt with clean summer styling.');
INSERT INTO nc_real_products VALUES ('ecstasy-printed-casual-shirt-maroon','Printed Casual Shirt - Maroon','প্রিন্টেড ক্যাজুয়াল শার্ট - মেরুন','men','men-shirts',2648,'Maroon',ARRAY['S','M','L','XL'],'https://ecstasybd.com/all-images/product/Product-Image-1785228892.jpg','https://ecstasybd.com/?page=product-list&sid=4','Statement printed casual shirt with short sleeves and a relaxed fit.');
INSERT INTO nc_real_products VALUES ('ecstasy-printed-casual-shirt-earth','Printed Casual Shirt - Earth Print','প্রিন্টেড ক্যাজুয়াল শার্ট - আর্থ প্রিন্ট','men','men-shirts',2054,'Earth Print',ARRAY['S','M','L','XL'],'https://ecstasybd.com/all-images/product/Product-Image-1785228814.jpg','https://ecstasybd.com/?page=product-list&sid=4','Printed short-sleeve shirt with an expressive all-over pattern.');
INSERT INTO nc_real_products VALUES ('ecstasy-premium-casual-shirt-black','Premium Casual Shirt - Black','প্রিমিয়াম ক্যাজুয়াল শার্ট - ব্ল্যাক','men','men-shirts',3588,'Black',ARRAY['S','M','L','XL'],'https://ecstasybd.com/all-images/product/Product-Image-1785149587.jpg','https://ecstasybd.com/','Premium black long-sleeve casual shirt with a clean contemporary finish.');
INSERT INTO nc_real_products VALUES ('ecstasy-tanjim-premium-tshirt-sand','TANJIM Premium T-Shirt - Sand','তানজিম প্রিমিয়াম টি-শার্ট - স্যান্ড','men','men-t-shirts',3828,'Sand',ARRAY['M','L','XL','2XL'],'https://ecstasybd.com/all-images/product/Product-Image-1786434758.jpg','https://ecstasybd.com/?page=product-list&sid=19','Premium relaxed T-shirt designed for elevated everyday styling.');
INSERT INTO nc_real_products VALUES ('ecstasy-tanjim-premium-tshirt-mustard','TANJIM Premium T-Shirt - Mustard','তানজিম প্রিমিয়াম টি-শার্ট - মাস্টার্ড','men','men-t-shirts',3828,'Mustard',ARRAY['M','L','XL','2XL'],'https://ecstasybd.com/all-images/product/Product-Image-1786433565.jpg','https://ecstasybd.com/?page=product-list&sid=19','Premium crew-neck T-shirt with a relaxed silhouette.');
INSERT INTO nc_real_products VALUES ('ecstasy-tanjim-premium-tshirt-red','TANJIM Premium T-Shirt - Red','তানজিম প্রিমিয়াম টি-শার্ট - রেড','men','men-t-shirts',3927,'Red',ARRAY['M','L','XL','2XL'],'https://ecstasybd.com/all-images/product/Product-Image-1786363926.jpg','https://ecstasybd.com/?page=product-list&sid=19','Premium T-shirt with a clean round neck and relaxed everyday fit.');
INSERT INTO nc_real_products VALUES ('ecstasy-tanjim-tshirt-indigo','TANJIM T-Shirt - Indigo','তানজিম টি-শার্ট - ইন্ডিগো','men','men-t-shirts',2079,'Indigo',ARRAY['S','M','L','XL'],'https://ecstasybd.com/all-images/product/Product-Image-1786353050.jpg','https://ecstasybd.com/?page=product-list&sid=19','Cotton-blend T-shirt with stretch, breathability and a straight relaxed cut.');
INSERT INTO nc_real_products VALUES ('ecstasy-tanjim-tshirt-aqua','TANJIM T-Shirt - Aqua','তানজিম টি-শার্ট - অ্যাকুয়া','men','men-t-shirts',2079,'Aqua',ARRAY['S','M','L','XL'],'https://ecstasybd.com/all-images/product/Product-Image-1786353223.jpg','https://ecstasybd.com/?page=product-list&sid=19','Soft cotton-blend T-shirt for casual and smart-casual wear.');
INSERT INTO nc_real_products VALUES ('ecstasy-tanjim-panel-tshirt-black','TANJIM Panel T-Shirt - Black','তানজিম প্যানেল টি-শার্ট - ব্ল্যাক','men','men-t-shirts',2079,'Black',ARRAY['S','M','L','XL'],'https://ecstasybd.com/all-images/product/Product-Image-1786353022.jpg','https://ecstasybd.com/?page=product-list&sid=19','Contrast-panel T-shirt with contemporary streetwear styling.');
INSERT INTO nc_real_products VALUES ('ecstasy-zarzain-top-hot-pink','ZARZAIN Top - Hot Pink','জারজাইন টপ - হট পিঙ্ক','women','women-tops',2057,'Hot Pink',ARRAY['S','M','L'],'https://ecstasybd.com/all-images/product/Product-Image-1786777552.jpg','https://ecstasybd.com/?cid=77&page=products','Cotton top with gathered round neckline, balloon sleeves and a relaxed flowy silhouette.');
INSERT INTO nc_real_products VALUES ('ecstasy-zarzain-top-burgundy','ZARZAIN Top - Burgundy','জারজাইন টপ - বারগান্ডি','women','women-tops',2288,'Burgundy',ARRAY['S','M','L'],'https://ecstasybd.com/all-images/product/Product-Image-1786707885.jpg','https://ecstasybd.com/?cid=77&page=products','Relaxed cotton top with a tie-waist detail and flared hem.');
INSERT INTO nc_real_products VALUES ('ecstasy-zarzain-top-teal','ZARZAIN Top - Teal Blue','জারজাইন টপ - টিল ব্লু','women','women-tops',2068,'Teal Blue',ARRAY['S','M','L'],'https://ecstasybd.com/all-images/product/Product-Image-1786537047.jpg','https://ecstasybd.com/?cid=77&page=products','Cotton peplum top with pointed collar, button front and puff sleeves.');
INSERT INTO nc_real_products VALUES ('ecstasy-zarzain-top-teal-shirt','ZARZAIN Shirt Top - Teal','জারজাইন শার্ট টপ - টিল','women','women-tops',1947,'Teal',ARRAY['S','M','L'],'https://ecstasybd.com/all-images/product/Product-Image-1786536714.jpg','https://ecstasybd.com/?cid=77&page=products','Polished collared top with structured puff sleeves and a shaped waist.');
INSERT INTO nc_real_products VALUES ('ecstasy-zarzain-crop-top-yellow','ZARZAIN Crop Top - Yellow','জারজাইন ক্রপ টপ - ইয়েলো','women','women-tops',1947,'Yellow',ARRAY['M','L'],'https://ecstasybd.com/all-images/product/Product-Image-1782722470.jpg','https://ecstasybd.com/?cid=77&page=products','Cotton off-shoulder crop top with statement buttons and bishop sleeves.');
INSERT INTO nc_real_products VALUES ('ecstasy-zarzain-crop-top-black','ZARZAIN Crop Top - Black','জারজাইন ক্রপ টপ - ব্ল্যাক','women','women-tops',2816,'Black',ARRAY['S','M','L'],'https://ecstasybd.com/all-images/product/Product-Image-1782722467.jpg','https://ecstasybd.com/?cid=77&page=products','Black off-shoulder crop top with statement button detailing.');
INSERT INTO nc_real_products VALUES ('ecstasy-zarzain-denim-top-navy','ZARZAIN Embroidered Denim Top - Navy','জারজাইন এমব্রয়ডার্ড ডেনিম টপ - নেভি','women','women-tops',2156,'Navy',ARRAY['XL'],'https://ecstasybd.com/all-images/product/Product-Image-1779537709.jpg','https://ecstasybd.com/?cid=77&page=products','Relaxed denim top with tie neckline and delicate floral embroidery.');
INSERT INTO nc_real_products VALUES ('ecstasy-zarzain-top-soft-pink','ZARZAIN Relaxed Top - Soft Pink','জারজাইন রিল্যাক্সড টপ - সফট পিঙ্ক','women','women-tops',2178,'Soft Pink',ARRAY['M','L','XL'],'https://ecstasybd.com/all-images/product/Product-Image-1767856234.jpg','https://ecstasybd.com/?cid=77&page=products','Soft georgette top with a relaxed silhouette and elbow-length sleeves.');
INSERT INTO nc_real_products VALUES ('ecstasy-zarzain-top-offwhite','ZARZAIN Relaxed Top - Off White','জারজাইন রিল্যাক্সড টপ - অফ হোয়াইট','women','women-tops',2178,'Off White',ARRAY['S','M','L'],'https://ecstasybd.com/all-images/product/Product-Image-1767854953.jpg','https://ecstasybd.com/?cid=77&page=products','Relaxed velvet-look top with elbow sleeves and a clean neckline.');
INSERT INTO nc_real_products VALUES ('ecstasy-zarzain-top-blue','ZARZAIN Relaxed Top - Blue','জারজাইন রিল্যাক্সড টপ - ব্লু','women','women-tops',2178,'Blue',ARRAY['S','L'],'https://ecstasybd.com/all-images/product/Product-Image-1767767870.jpg','https://ecstasybd.com/?cid=77&page=products','Relaxed blue top with elbow-length sleeves and a fluid easy fit.');

INSERT INTO products(
 id,name,name_bn,slug,category_id,brand_id,description,description_bn,
 short_description,short_description_bn,primary_image_url,media,status,featured,created_at,updated_at
)
SELECT gen_random_uuid(),r.name,r.name_bn,r.slug,c.id,b.id,
       r.description || ' Source: ' || r.source_url,
       'অফিশিয়াল অনলাইন ক্যাটালগ থেকে নেওয়া রেফারেন্স প্রোডাক্ট।',
       'Official catalog reference • Real product photo • Current listed price',
       'অফিশিয়াল ক্যাটালগ রেফারেন্স • আসল প্রোডাক্ট ছবি • বর্তমান তালিকাভুক্ত মূল্য',
       r.image_url,
       jsonb_build_array(
         jsonb_build_object('type','image','url',r.image_url,'alt',r.name),
         jsonb_build_object('type','source','url',r.source_url,'label','Official source')
       ),
       'ACTIVE',TRUE,NOW(),NOW()
FROM nc_real_products r
JOIN categories c ON c.slug=r.category_slug
JOIN brands b ON b.slug='ecstasy-reference'
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name,name_bn=EXCLUDED.name_bn,category_id=EXCLUDED.category_id,
  brand_id=EXCLUDED.brand_id,description=EXCLUDED.description,description_bn=EXCLUDED.description_bn,
  short_description=EXCLUDED.short_description,short_description_bn=EXCLUDED.short_description_bn,
  primary_image_url=EXCLUDED.primary_image_url,media=EXCLUDED.media,status='ACTIVE',featured=TRUE,updated_at=NOW();

DO $$
DECLARE r record; p_id uuid; c_id uuid; pref text; serial_no int; firstten text; checksum_sum int; checksum text; bc text; i int;
        w_id uuid; v_id uuid; size_val text; sku_val text; code_val text; stock_val int;
BEGIN
  SELECT id INTO w_id FROM warehouses WHERE code='MAIN' LIMIT 1;
  IF w_id IS NULL THEN
    INSERT INTO warehouses(id,name,code,address,active,created_at,updated_at)
    VALUES(gen_random_uuid(),'Main Warehouse','MAIN','Primary stock location',TRUE,NOW(),NOW())
    RETURNING id INTO w_id;
  END IF;

  FOR r IN SELECT * FROM nc_real_products LOOP
    SELECT p.id,p.category_id INTO p_id,c_id FROM products p WHERE p.slug=r.slug;
    FOREACH size_val IN ARRAY r.sizes LOOP
      sku_val := 'REAL-' || upper(substr(md5(r.slug),1,6)) || '-' || regexp_replace(upper(size_val),'[^A-Z0-9]','','g');
      code_val := substr(md5(r.slug||size_val),1,4);

      SELECT id INTO v_id FROM product_variants WHERE sku=sku_val;
      IF v_id IS NULL THEN
        SELECT barcode_prefix,next_barcode_serial INTO pref,serial_no FROM categories WHERE id=c_id FOR UPDATE;
        firstten := pref || lpad((abs(hashtext(code_val)) % 10000)::text,4,'0') || lpad(serial_no::text,4,'0');
        checksum_sum := 0;
        FOR i IN 1..10 LOOP
          checksum_sum := checksum_sum + substr(firstten,i,1)::int * CASE WHEN mod(i-1,2)=0 THEN 3 ELSE 7 END;
        END LOOP;
        checksum := lpad(mod(checksum_sum,100)::text,2,'0');
        bc := firstten || checksum;
        INSERT INTO product_variants(
          id,product_id,sku,barcode,variant_code,attributes,price,sale_price,cost_price,weight,image_url,active,created_at,updated_at
        ) VALUES(
          gen_random_uuid(),p_id,sku_val,bc,code_val,
          jsonb_build_object('Size',size_val,'Color',r.color),
          r.price,NULL,round(r.price*0.58,2),0.35,r.image_url,TRUE,NOW(),NOW()
        ) RETURNING id INTO v_id;
        UPDATE categories SET next_barcode_serial=serial_no+1,updated_at=NOW() WHERE id=c_id;
      ELSE
        UPDATE product_variants SET price=r.price,sale_price=NULL,image_url=r.image_url,active=TRUE,updated_at=NOW()
        WHERE id=v_id;
      END IF;

      stock_val := 8 + (abs(hashtext(r.slug||size_val)) % 15);
      INSERT INTO inventory(id,warehouse_id,variant_id,stock_on_hand,reserved,reorder_level,created_at,updated_at)
      VALUES(gen_random_uuid(),w_id,v_id,stock_val,0,5,NOW(),NOW())
      ON CONFLICT (warehouse_id,variant_id)
      DO UPDATE SET stock_on_hand=EXCLUDED.stock_on_hand,reserved=LEAST(inventory.reserved,EXCLUDED.stock_on_hand),reorder_level=5,updated_at=NOW();
    END LOOP;
  END LOOP;
END $$;

COMMIT;
