# RACÈLIA Backend API

Express + MongoDB backend aligned with the RACÈLIA handbag storefront frontend.

## Setup

```bash
cd "Racélia backend"
npm install
# Configure .env (MONGO_URI, secretKey, Cloudinary keys)
npm run seed   # optional — loads catalog, blogs, web pics, style looks, reviews
npm run dev
```

Default port: **5000**

## API routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/health` | — | Health check |
| GET | `/product` | — | All products (frontend catalog shape) |
| GET | `/product/:slug` | — | Single product by slug (`mini-flap-bag`, etc.) |
| POST/PATCH/DELETE | `/product/...` | Admin | Manage catalog |
| GET | `/blog/public` | — | Published blogs |
| GET | `/blog/public/:slug` | — | Published blog by slug |
| GET/POST/PATCH/DELETE | `/blog/admin/...` | Admin | Manage blogs |
| POST | `/order` | — | Place order (EUR, wilaya/commune) |
| GET | `/order/config` | — | Delivery fee & online discount |
| GET/PATCH/DELETE | `/order/...` | Admin | Manage orders |
| GET | `/webpic` | — | Homepage section images by device |
| GET/POST/PATCH/DELETE | `/webpic/...` | Admin | Manage web pics |
| GET | `/style/storefront` | — | #RACÈLIASTYLE grid looks |
| GET/POST/PATCH/DELETE | `/style/...` | Admin | Manage style looks |
| GET | `/review/published` | — | Published reviews |
| POST | `/review` | — | Submit review |
| GET/PATCH/DELETE | `/review/...` | Admin | Moderate reviews |
| POST | `/user/register` | — | Register client |
| POST | `/user/login` | — | Login (returns JWT + user) |
| GET | `/user/getcurrentuser` | User | Current profile |

## Product shape (matches frontend `productCatalog.js`)

Responses use `id` (slug), `name`, `tag`, `price`, `stockNote`, `sections`, `coverImage`, `cardImages`, `closerLookImages`, `closerLookMain`, `colors`, `materials`, `size`, `filters`, etc.

## Order config

- Delivery fee: **€20**
- Online payment discount: **5%**
- Statuses: `processing`, `on_way`, `delivered`, `cancelled`

## Legacy routes

`/hero` mirrors `/webpic` for backward compatibility.
