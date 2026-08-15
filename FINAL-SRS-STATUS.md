# Neuro Commerce — Final SRS Status

This status file distinguishes implemented functionality from credential-dependent external integrations.

## Implemented in the current codebase
- Next.js responsive storefront
- Customer registration/login with JWT
- Role-based Admin / Customer / Delivery Agent access
- Catalog, products, variants and attributes
- 12-digit variant barcode field and generation logic already present in catalog flow
- Inventory reservation, consumption, adjustment and movement history
- Cart, checkout and order lifecycle
- Saved delivery addresses, Bangladesh area selection and GPS coordinates
- Shipping-zone quote and admin shipping rules
- COD, partial/full-online payment modes and separate payment status
- Admin payment status control
- Internal rider assignment, tracking number, navigation, COD collection and failure flow
- Customer order tracking, cancellation, reviews, wishlist, notifications and return requests
- Promotions/coupons
- Admin dashboard
- Reports overview and CSV order export
- Health endpoint
- SEO baseline: metadata, sitemap, robots, 404/error/loading states
- Provider contracts/readiness page for payment and courier integrations
- Swagger/OpenAPI endpoint after Final Phase F installation

## Credential-dependent / not falsely marked complete
The SRS requires configured gateway and courier integrations. These cannot be truthfully completed without provider credentials and sandbox/production approval.

### Payment providers
- SSLCommerz — adapter boundary/readiness; credentials required
- bKash — adapter boundary/readiness; credentials required
- Nagad — adapter boundary/readiness; credentials required

Required rule: never mark an order paid from frontend success alone. Verify the provider callback/server response.

### Courier providers
- Pathao Courier — adapter boundary/readiness; credentials required
- Steadfast — adapter boundary/readiness; credentials required
- RedX — adapter boundary/readiness; credentials required

The built-in internal rider workflow remains fully usable without an external courier.

## Still broader than the current implementation
These SRS items are product-level extensions and should be treated as future scope unless specifically required for the assignment:
- Google/Facebook OAuth credentials and account linking
- Full CMS/homepage builder/theme editor
- Provider-specific settlement/reconciliation automation
- Dynamic tax engine
- Full invoice PDF/print subsystem
- Scheduled campaign engine
- Production observability/APM and centralized log shipping
- Automated DB backup infrastructure
- Cloud deployment configuration for a selected provider

## Production rules
- Keep `.env` out of Git.
- Use a strong JWT secret.
- Set `NODE_ENV=production`.
- Set `DB_SYNC=false` in production.
- Configure `CORS_ORIGINS` explicitly.
- Use HTTPS.
- Use migrations before deployment.
- Rotate the PostgreSQL password that was exposed during development.
