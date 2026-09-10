# ── build ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY apps/web ./apps/web
COPY SIGMA_OMEGA/CORE/dev/scripts ./SIGMA_OMEGA/CORE/dev/scripts
RUN npm run build

# ── runtime: node detrás de nginx (micro-cache + CSP) ─────────────────
FROM node:22-alpine
RUN apk add --no-cache nginx wget \
    && mkdir -p /var/cache/nginx/decanato /run/nginx
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/apps/web/dist ./apps/web/dist
COPY nginx-ssr.conf /etc/nginx/http.d/decanato.conf
COPY docker/start-ssr.sh /app/start-ssr.sh
RUN chmod +x /app/start-ssr.sh \
    && rm -f /etc/nginx/http.d/default.conf
ENV HOST=127.0.0.1
ENV PORT=4321
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1/health || exit 1
CMD ["/app/start-ssr.sh"]
