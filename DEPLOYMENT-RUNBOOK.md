# Neuro Commerce Deployment Runbook

## Backend required environment
```env
NODE_ENV=production
PORT=5000
DB_HOST=...
DB_PORT=5432
DB_USERNAME=...
DB_PASSWORD=...
DB_DATABASE=neuro_commerce
DB_SYNC=false
JWT_SECRET=replace-with-a-long-random-secret
CORS_ORIGINS=https://your-store.example,https://www.your-store.example
```

## Frontend required environment
```env
NEXT_PUBLIC_API_URL=https://api.your-store.example/api
NEXT_PUBLIC_SITE_URL=https://your-store.example
```

## Build
```powershell
cd backend
npm ci
npm run build

cd ..\frontend
npm ci
npm run build
```

## Database
Run every migration in `backend/migrations` in order against the target database before starting production.

## Start
Use a process manager/container in production. Do not use `npm run start:dev`.

## Verification
- `GET /api/ops/health`
- Open `/api/docs`
- Register customer
- Add product to cart
- Checkout
- Process order in Admin
- Assign rider
- Complete rider delivery
- Verify customer tracking and review
- Verify CSV report export
