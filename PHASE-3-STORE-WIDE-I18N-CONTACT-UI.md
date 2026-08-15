# Neuro Commerce — Phase 3

## Implemented

- বাংলা / ENG remains at the very top of the storefront navbar.
- বাংলা mode now includes a global UI translation bridge for common storefront, account, checkout and admin labels. Product/customer data is not force-translated.
- Default storefront language can be configured from Admin > Settings.
- Added dynamic contact settings:
  - Business address
  - Support phone
  - Support email
  - Facebook URL
  - Messenger URL
  - WhatsApp number
  - Support hours
- Default contact fallbacks:
  - Phone: 01764305948
  - Address: Vatara, Dhaka
  - Email: meherabjim2022@gmail.com
- Added floating Messenger, WhatsApp and Call buttons across the website.
- Rebuilt footer with quick links, customer service links, address, phone, email, support hours, Facebook, Messenger and WhatsApp.
- Added payment/trust labels in footer.
- Added a second desktop navigation row: Home, Shop, New Arrivals, Offers, Track Order, About, Contact.
- Homepage hero is now a light blue/orange marketplace layout with dynamic categories at the left and dynamic product cards in the hero.
- Existing Phase 2 product image/video upload and gallery support are preserved.

## Important

Facebook and Messenger links are configurable in Admin > Settings. Until configured, the UI falls back to the public Facebook/Messenger websites rather than inventing a page ID.

Content such as product names, category names, CMS-written banners and customer-entered data is treated as business data and is not automatically machine-translated. To make those bilingual as well, a future content-locale model should store both English and Bangla values.
