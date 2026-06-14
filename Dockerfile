# ---------- Stage 1: build the frontend ----------
FROM node:22-alpine AS frontend
WORKDIR /app/frontend

# Install deps (dev deps needed to build with Vite)
COPY frontend/package*.json ./
RUN npm install

# Build the React/Vite app. Same-origin API path => no CORS needed.
COPY frontend/ ./
ENV VITE_API_URL=/api
RUN npm run build

# ---------- Stage 2: backend that also serves the frontend ----------
FROM node:22-alpine AS backend
WORKDIR /app

# Install production deps only
COPY backend/package*.json ./
RUN npm install --omit=dev

# Copy backend source
COPY backend/ ./

# Copy the built frontend into ./public so Express serves it
COPY --from=frontend /app/frontend/dist ./public

ENV NODE_ENV=production
# Railway/Render inject PORT automatically; 5000 is just a local default.
EXPOSE 5000

CMD ["node", "server.js"]
