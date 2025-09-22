FROM node:20-alpine AS builder
WORKDIR /usr/src/app

# Copier manifests pour cache layer npm
COPY package*.json ./
# Install deps (dev inclus pour compilation TypeScript) via lockfile
RUN npm ci

# Copier le reste du code
COPY . .

# Build TypeScript -> dist
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /usr/src/app

# Installer PostgreSQL client pour l'initialisation
RUN apk add --no-cache postgresql-client

# Définir env prod tôt
ENV NODE_ENV=production

# Copier manifests (lock assure versions déterministes)
COPY --from=builder /usr/src/app/package*.json ./

# Installer uniquement deps de prod (npm v10 supporte --omit=dev)
RUN npm ci --omit=dev

# Copier le build compilé
COPY --from=builder /usr/src/app/dist ./dist

# Copier les scripts d'initialisation
COPY --from=builder /usr/src/app/init-sotral.sh ./init-sotral.sh
COPY --from=builder /usr/src/app/init-sotral-manual.sh ./init-sotral-manual.sh
COPY --from=builder /usr/src/app/src/schema ./src/schema

# Rendre le script exécutable
RUN chmod +x ./init-sotral.sh ./init-sotral-manual.sh

# Healthcheck interne (utilise fetch natif Node 20, sans curl)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD node -e "fetch('http://localhost:7000/health').then(r=>process.exit(r.status===200?0:1)).catch(()=>process.exit(1))"

EXPOSE 7000
# Remarque Render: assure que 'Root Directory' pointe sur 'back' pour que COPY package*.json fonctionne.
CMD ["sh", "-c", "./init-sotral.sh && node dist/server.js"]
