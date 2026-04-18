# 🛒 SmartCart AI

Tu asistente inteligente de compras — PWA instalable con IA (Gemini), escaneo de códigos de barras, historial de gastos y comparativas de tiendas.

## 📁 Estructura del Monorepo

```
smartcart-ai/
├── frontend/           # React + Vite + Tailwind (PWA instalable)
├── backend/            # NestJS API (sirve también el frontend)
├── Dockerfile          # Multi-stage build (frontend + backend juntos)
├── docker-compose.yml  # Deploy local
└── README.md
```

## 🏗️ Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Frontend** | React 18 + Vite + TailwindCSS + PWA |
| **Barcode** | `@zxing/browser` (cámara del dispositivo) |
| **Backend** | NestJS + TypeORM + Passport JWT |
| **Base de Datos** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth + JWT |
| **LLM** | Google Gemini 1.5 Flash (gratis) |
| **Deploy** | Docker (un solo contenedor) |

## ⚡ Setup Rápido

### 1. Clonar y configurar variables de entorno

```bash
git clone https://github.com/franciscocamposchimal/smartcart-ai
cd smartcart-ai
```

**Backend** — copia y edita:
```bash
cp backend/.env.example backend/.env
# Edita backend/.env con tus credenciales
```

**Frontend** — copia y edita:
```bash
cp frontend/.env.example frontend/.env
# Edita frontend/.env con tus credenciales de Supabase
```

### 2. Variables requeridas

#### `backend/.env`
```env
# Base de datos Supabase (PostgreSQL)
DB_HOST=db.tu-proyecto.supabase.co
DB_PASSWORD=tu-password-supabase

# Supabase Auth
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# JWT (usa un secreto fuerte en producción)
JWT_SECRET=mi-secreto-jwt-super-seguro

# Gemini AI
GEMINI_API_KEY=tu-api-key-de-gemini
```

#### `frontend/.env`
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

### 3. Ejecutar en desarrollo

```bash
# Terminal 1 — Backend (puerto 3000)
cd backend
npm install
npm run start:dev

# Terminal 2 — Frontend (puerto 5173 con proxy a :3000)
cd frontend
npm install
npm run dev
```

Abre: http://localhost:5173

### 4. Build y deploy con Docker

```bash
# Construir y levantar
docker compose up --build

# La app corre en http://localhost:3000
# El backend sirve también el frontend compilado
```

## 🔑 Obtener Credenciales Gratuitas

### Supabase (base de datos + auth)
1. Ve a [supabase.com](https://supabase.com) → Crear proyecto gratis
2. Ve a **Settings → API** para obtener `URL`, `anon key` y `service_role key`
3. Ve a **Settings → Database** para los datos de conexión PostgreSQL

### Google Gemini (LLM gratuito)
1. Ve a [aistudio.google.com](https://aistudio.google.com/app/apikey)
2. Crea una API key → gratis con 15 req/min

## 🌍 Ambientes (dev / qa)

```bash
# Development (local)
NODE_ENV=development  # TypeORM auto-sync activado, Swagger visible

# QA / Production
NODE_ENV=production   # Sin auto-sync, sin Swagger, CORS restringido
```

## 📱 Funcionalidades

| Feature | Descripción |
|---------|-------------|
| 📷 **Escaneo** | Lector de código de barras por cámara (`@zxing/browser`) |
| 🤖 **LLM** | Gemini identifica producto por código o imagen |
| 🛒 **Carrito** | Multi-carrito, agregar/quitar productos, guardar |
| 🧾 **Tickets** | Sube foto del ticket → Gemini extrae todos los productos |
| 📊 **Stats** | Gasto mensual, comparativa de tiendas, alertas de precio |
| 🔄 **Recurrentes** | Detecta automáticamente qué compras cada semana/mes |
| 📈 **Precios** | Historial y alertas de variaciones > 10% |
| 🏪 **Tiendas** | Ranking de tiendas por gasto y visitas |
| 🧠 **IA Insights** | Gemini analiza tus hábitos y da recomendaciones en español |
| 🔐 **Auth** | Login/registro via Supabase Auth + JWT |
| 📦 **PWA** | Instalable en Android/iOS, funciona offline |

## 🗄️ Módulos del Backend (NestJS)

```
src/
├── auth/       # Login, registro, JWT guard, decoradores
├── products/   # Lookup por barcode/imagen (LLM), historial de precios
├── cart/       # Carritos multi-estado (open/saved/completed)
├── receipts/   # Tickets con OCR inteligente (Gemini)
├── stores/     # Catálogo de tiendas
├── stats/      # Gastos, alertas, recurrentes, ranking, IA insights
├── llm/        # Servicio Google Gemini (centralizado)
└── common/     # Guards, filtros, interceptores
```

## 🧪 Tests

```bash
# Backend unit tests
cd backend && npm test

# Backend e2e tests
cd backend && npm run test:e2e

# Backend coverage
cd backend && npm run test:cov
```

## 📚 API Docs (Swagger)

Disponible en desarrollo: http://localhost:3000/api/docs

## 🚀 Deploy en Render (gratis)

1. Conecta tu repo en [render.com](https://render.com)
2. Crear **Web Service** con:
   - Build command: `docker build -t smartcart .`
   - O usa el `Dockerfile` directamente
3. Agrega las variables de entorno en el dashboard de Render
4. Un solo servicio levanta backend + frontend compilado

---

> **Nota**: Todas las integraciones (Supabase, Gemini) usan variables de entorno. Nunca hardcodees credenciales.