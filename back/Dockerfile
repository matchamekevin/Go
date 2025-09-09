FROM node:20-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
# Install all dependencies (dev inclus pour build TS)
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /usr/src/app

# Copie uniquement package.json et lock
COPY --from=builder /usr/src/app/package*.json ./

# Installe juste les deps de prod
RUN npm ci --only=production

# Copie le build
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 7000
CMD ["node", "dist/server.js"]
