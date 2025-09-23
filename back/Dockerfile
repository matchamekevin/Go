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

# Copier les scripts d'initialisation avec chemins absolus
COPY --from=builder /usr/src/app/init-sotral.sh /usr/src/app/init-sotral.sh
COPY --from=builder /usr/src/app/init-sotral-manual.sh /usr/src/app/init-sotral-manual.sh
COPY --from=builder /usr/src/app/diagnose-sotral.sh /usr/src/app/diagnose-sotral.sh
COPY --from=builder /usr/src/app/insert-stops.sh /usr/src/app/insert-stops.sh
COPY --from=builder /usr/src/app/src/schema /usr/src/app/src/schema

# Rendre le script exécutable et vérifier
RUN chmod +x /usr/src/app/*.sh && \
    ls -la /usr/src/app/*.sh && \
    echo "Scripts disponibles:" && \
    find /usr/src/app -name "*.sh" -type f -executable

# Healthcheck interne (utilise fetch natif Node 20, sans curl)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD node -e "fetch('http://localhost:7000/health').then(r=>process.exit(r.status===200?0:1)).catch(()=>process.exit(1))"

EXPOSE 7000

# Démarrage direct sans script shell (plus fiable)
CMD ["node", "dist/server.js"]
