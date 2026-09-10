#!/bin/sh
set -e
mkdir -p /var/cache/nginx/decanato
export HOST=127.0.0.1
export PORT=4321
export NODE_ENV=production
node /app/apps/web/dist/server/entry.mjs &
exec nginx -g 'daemon off;'
