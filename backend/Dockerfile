FROM node:20-alpine AS builder

WORKDIR /app

# Copy backend
COPY backend/package*.json ./backend/
RUN cd backend && npm ci

COPY backend/ ./backend/
RUN cd backend && npm run build

# Copy frontend build (built separately or in CI)
COPY frontend/dist ./frontend/dist

FROM node:20-alpine AS production

WORKDIR /app

COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/frontend/dist ./frontend/dist

ENV NODE_ENV=production
ENV FRONTEND_DIST_PATH=./frontend/dist

EXPOSE 3000

CMD ["node", "dist/main"]
