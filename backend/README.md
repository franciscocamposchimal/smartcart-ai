# SmartCart AI — Backend API

NestJS REST API for the SmartCart AI shopping assistant application.

## Features

- **Auth** — Register/Login via Supabase, JWT-protected routes
- **Products** — Barcode lookup with Google Gemini LLM, price history tracking
- **Cart** — Multi-cart management with items and totals
- **Receipts** — Save receipts with optional LLM OCR item extraction
- **Stores** — Store catalog management
- **Stats** — Spending analytics, price alerts, recurring products, AI insights
- **Swagger** — Auto-generated API docs at `/api/docs`

## Quick Start

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your credentials:
# - Supabase project URL and keys
# - JWT secret
# - Google Gemini API key
```

### 3. Run in development

```bash
npm run start:dev
```

API will be available at `http://localhost:3000/api`  
Swagger docs at `http://localhost:3000/api/docs`

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 3000) |
| `DB_HOST` | PostgreSQL host (Supabase) |
| `DB_PORT` | PostgreSQL port (default: 5432) |
| `DB_USERNAME` | Database username |
| `DB_PASSWORD` | Database password |
| `DB_DATABASE` | Database name |
| `DB_SSL` | Enable SSL (`true`/`false`) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `JWT_SECRET` | JWT signing secret |
| `JWT_EXPIRATION` | JWT expiration (default: `7d`) |
| `GEMINI_API_KEY` | Google Gemini API key |
| `GEMINI_MODEL` | Gemini model name (default: `gemini-1.5-flash`) |
| `FRONTEND_DIST_PATH` | Path to built frontend (default: `../frontend/dist`) |

## API Endpoints

### Auth
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login
- `GET /api/auth/profile` — Get current user profile 🔒

### Products
- `POST /api/products/lookup` — Lookup by barcode/image (LLM) 🔒
- `POST /api/products` — Create product manually 🔒
- `GET /api/products` — List all products 🔒
- `GET /api/products/:id` — Get product 🔒
- `GET /api/products/:id/price-history` — Price history 🔒

### Cart
- `POST /api/cart` — Create cart 🔒
- `GET /api/cart` — List user carts 🔒
- `GET /api/cart/:id` — Get cart 🔒
- `POST /api/cart/:id/items` — Add item 🔒
- `DELETE /api/cart/:id/items/:itemId` — Remove item 🔒
- `PATCH /api/cart/:id/save` — Save/finalize cart 🔒
- `DELETE /api/cart/:id` — Delete cart 🔒

### Receipts
- `POST /api/receipts` — Save receipt (with optional LLM OCR) 🔒
- `GET /api/receipts` — List receipts 🔒
- `GET /api/receipts/:id` — Get receipt 🔒
- `DELETE /api/receipts/:id` — Delete receipt 🔒

### Stores
- `POST /api/stores` — Create store 🔒
- `GET /api/stores` — List stores 🔒
- `GET /api/stores/:id` — Get store 🔒
- `PUT /api/stores/:id` — Update store 🔒
- `DELETE /api/stores/:id` — Delete store 🔒

### Stats
- `GET /api/stats/spending` — Spending by period 🔒
- `GET /api/stats/price-alerts` — Price variation alerts 🔒
- `GET /api/stats/recurring` — Recurring products 🔒
- `GET /api/stats/stores` — Store rankings 🔒
- `GET /api/stats/ai-insights` — AI-powered insights (LLM) 🔒

🔒 = Requires Bearer token

## Testing

```bash
# Unit tests
npm test

# Unit tests with coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

## Build & Production

```bash
npm run build
npm run start:prod
```

## Docker

Build from the repository root (not the backend folder):

```bash
# First build the frontend
cd frontend && npm run build && cd ..

# Then build the Docker image
docker build -f backend/Dockerfile -t smartcart-api .
docker run -p 3000:3000 --env-file backend/.env smartcart-api
```
