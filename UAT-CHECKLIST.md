# Neuro Commerce UAT Checklist

## Customer
- [ ] Register and login
- [ ] Browse/search/filter products
- [ ] Select variant and add to cart
- [ ] Update cart quantity
- [ ] Save/edit/default/delete address
- [ ] Use GPS location
- [ ] Checkout with shipping-zone quote
- [ ] Apply valid/invalid coupon
- [ ] Place COD order
- [ ] View order and tracking timeline
- [ ] Cancel eligible order
- [ ] Add/remove wishlist
- [ ] Read notifications
- [ ] Submit review after delivery
- [ ] Request return after delivery
- [ ] Logout

## Admin
- [ ] Login as admin
- [ ] Create category/brand/product/variant
- [ ] Adjust inventory
- [ ] Process order lifecycle
- [ ] Change payment status
- [ ] Assign delivery agent
- [ ] Configure shipping zone
- [ ] Moderate reviews
- [ ] Process return/refund
- [ ] View reports
- [ ] Export order CSV
- [ ] View integration readiness

## Rider
- [ ] Login as delivery agent
- [ ] See assigned orders
- [ ] Call customer
- [ ] Open navigation
- [ ] Update pickup/transit/out-for-delivery
- [ ] Record failed delivery reason
- [ ] Complete COD delivery and collected amount

## Production
- [ ] `.env` is not tracked
- [ ] JWT secret is changed
- [ ] PostgreSQL password is rotated
- [ ] DB_SYNC=false
- [ ] CORS_ORIGINS configured
- [ ] HTTPS enabled
- [ ] Swagger checked
- [ ] Health endpoint checked
