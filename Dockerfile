# Stage 1: Build Frontend
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_SUPABASE_URL=https://qefoxpcfjjlcswqgjqtk.supabase.co
ARG VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlZm94cGNmampsY3N3cWdqcXRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4MzIwNDAsImV4cCI6MjA5OTQwODA0MH0.GuEXoCglXlPRwnT8r9pVMiS-sc26p8jBLb1NEKtAckM
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

RUN npm run build

# Stage 2: Production Server (Node 22 built-in node:sqlite + PostgreSQL pg + Static dist)
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server.mjs ./server.mjs
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/data ./data_seed

RUN mkdir -p /app/data

EXPOSE 3000

CMD ["node", "server.mjs"]
