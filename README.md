# RACÈLIA Backend API

Express + MongoDB backend for the RACÈLIA handbag storefront. Image uploads go to **Cloudinary**; the API is ready to deploy on **Vercel**.

## Tech stack

- Node.js / Express 5
- MongoDB Atlas + Mongoose
- JWT auth (user + admin)
- Cloudinary (multer memory storage — works on Vercel)

## Local setup

```bash
cd "Racélia backend"
npm install
```

Create a `.env` file in the project root:

```env
uri="your-mongodb-atlas-connection-string"
PORT=5000
secretKey="your-jwt-secret"
CLOUDINARY_NAME="your-cloud-name"
CLOUDINARY_APIKEY="your-api-key"
CLOUDINARY_APISECRET="your-api-secret"
FRONTEND_ORIGIN="http://localhost:3000"
```

Then:

```bash
npm run seed   # optional — loads catalog, blogs, web pics, style looks, reviews
npm run dev
```

Default port: **5000**

Health check: [http://localhost:5000/health](http://localhost:5000/health)

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `uri` | Yes | MongoDB Atlas connection string |
| `secretKey` | Yes | JWT signing secret |
| `CLOUDINARY_NAME` | Yes | Cloudinary cloud name |
| `CLOUDINARY_APIKEY` | Yes | Cloudinary API key |
| `CLOUDINARY_APISECRET` | Yes | Cloudinary API secret |
| `PORT` | No | Local port (default `5000`) |
| `FRONTEND_ORIGIN` | No | Allowed CORS origin(s). Comma-separated for multiple URLs |

## Deploy on Vercel

1. Push this repo to GitHub.
2. Import the project at [vercel.com/new](https://vercel.com/new).
3. Framework preset: **Other** (no build command needed).
4. Add the same environment variables as in `.env` (except `PORT` — Vercel sets that automatically).
5. Set `FRONTEND_ORIGIN` to your live frontend URL, e.g. `https://your-store.vercel.app`.

**MongoDB Atlas:** under **Network Access**, allow **0.0.0.0/0** so Vercel serverless functions can reach the database.

After deploy, test:

```
https://your-project.vercel.app/health
```

`vercel.json` routes all requests to `index.js`.

## API routes

### Health

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/health` | — | Health check |

### Products

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/product` | — | All products (frontend catalog shape) |
| GET | `/product/:idOrSlug` | — | Single product by ID or slug |
| POST | `/product/upload-image` | Admin | Upload a product image to Cloudinary |
| POST | `/product` | Admin | Create product |
| PATCH | `/product/:idOrSlug` | Admin | Update product |
| DELETE | `/product/:idOrSlug` | Admin | Delete product |

### Blogs

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/blog/public` | — | Published blogs |
| GET | `/blog/public/:slug` | — | Published blog by slug |
| GET | `/blog/admin` | Admin | All blogs |
| POST | `/blog/admin` | Admin | Create blog |
| PATCH | `/blog/admin/:id` | Admin | Update blog |
| DELETE | `/blog/admin/:id` | Admin | Delete blog |

### Orders

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/order` | Optional | Place order (EUR, wilaya/commune) |
| GET | `/order/config` | — | Delivery fee & online discount |
| GET | `/order/mine` | User | Current user's orders |
| GET | `/order` | Admin | All orders |
| GET | `/order/:id` | Admin | Single order |
| PATCH | `/order/:id` | Admin | Update order status |
| DELETE | `/order/:id` | Admin | Delete order |

### Web pics (homepage images)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/webpic` | — | Section images grouped by device |
| GET | `/webpic/active` | — | Active web pic |
| POST | `/webpic` | Admin | Create web pic |
| PATCH | `/webpic/:id` | Admin | Update web pic |
| DELETE | `/webpic/:id` | Admin | Delete web pic |

### Style looks

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/style/storefront` | — | #RACÈLIASTYLE grid for storefront |
| GET | `/style` | Admin | All style looks |
| POST | `/style` | Admin | Add look |
| PATCH | `/style/:id` | Admin | Update look |
| DELETE | `/style/:id` | Admin | Delete look |

### Reviews

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/review/published` | — | Published reviews |
| POST | `/review` | — | Submit review |
| GET | `/review/pending` | Admin | Pending reviews |
| GET | `/review` | Admin | All reviews |
| PATCH | `/review/:id/publish` | Admin | Publish review |
| PATCH | `/review/:id` | Admin | Update review |
| DELETE | `/review/:id` | Admin | Delete review |

### Users

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/user/register` | — | Register client |
| POST | `/user/login` | — | Login (returns JWT + user) |
| GET | `/user/getcurrentuser` | User | Current profile |
| PATCH | `/user/me` | User | Update own profile (optional avatar) |
| GET | `/user` | Admin | List users |
| PATCH | `/user/:id` | User/Admin | Update user |

### Legacy

`/hero` mirrors `/webpic` for backward compatibility.

## Product shape

Responses match the frontend `productCatalog.js` format: `id` (slug), `name`, `tag`, `price`, `stockNote`, `sections`, `coverImage`, `cardImages`, `closerLookImages`, `closerLookMain`, `colors`, `colorVariants`, `materials`, `size`, `filters`, etc.

## Order config

- Delivery fee: **€20**
- Online payment discount: **5%**
- Statuses: `processing`, `on_way`, `delivered`, `cancelled`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with nodemon |
| `npm start` | Same as `dev` |
| `npm run seed` | Seed database with sample data |
