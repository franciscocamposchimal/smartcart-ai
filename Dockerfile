# ─────────────────────────────────────────────
# Stage 1: Build Frontend (React/Vite PWA)
# ─────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /build/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
# Build frontend (requires VITE_ env vars at build time if needed)
RUN npm run build

# ─────────────────────────────────────────────
# Stage 2: Build Backend (NestJS)
# ─────────────────────────────────────────────
FROM node:20-alpine AS backend-builder

WORKDIR /build/backend

COPY backend/package*.json ./
RUN npm ci

COPY backend/ ./
RUN npm run build

# ─────────────────────────────────────────────
# Stage 3: Production image
# ─────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Copy compiled backend
COPY --from=backend-builder /build/backend/dist ./dist
COPY --from=backend-builder /build/backend/node_modules ./node_modules
COPY --from=backend-builder /build/backend/package.json ./

# Copy built frontend
COPY --from=frontend-builder /build/frontend/dist ./frontend/dist

ENV NODE_ENV=production
ENV FRONTEND_DIST_PATH=./frontend/dist
ENV PORT=3000

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/api || exit 1

CMD ["node", "dist/main"]
