# Neuro Commerce

Full-stack e-commerce platform.

## Stack

Frontend:
- Next.js
- React
- TypeScript
- Tailwind CSS
- Ant Design

Backend:
- Node.js
- NestJS
- TypeScript
- PostgreSQL
- Sequelize

## Features

- Customer registration and login
- Admin authentication
- Product/category/brand management
- Product variants
- SKU and barcode
- Inventory and stock movements
- Cart
- Checkout
- Coupons/promotions
- Customer order history
- Admin order management
- Order status tracking
- Customer management
- Delivered-order product reviews
- Admin review moderation

## Order Flow

CONFIRMED -> PROCESSING -> PACKED -> SHIPPED -> DELIVERED

## Review Flow

DELIVERED -> REVIEW -> PENDING -> ADMIN APPROVAL -> PUBLIC REVIEW

## Run Backend

cd backend
npm install
npm run start:dev

## Run Frontend

cd frontend
npm install
npm run dev

Frontend:
http://localhost:3000

Backend:
http://localhost:5000/api

## Production Build

Backend:
npm run build

Frontend:
npm run build
