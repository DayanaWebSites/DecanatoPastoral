# B2 · Micro-cache en nginx

## Por qué es obligatorio
Sin cache, cada visita anónima le pega a Postgres. Para un sitio que cambia unas
veces al mes eso es tirar recursos y meter latencia sin ganar nada.
El módulo lo lista como anti-pattern explícito.

## Configuración
```nginx
proxy_cache_path /var/cache/nginx/decanato levels=1:2
                 keys_zone=decanato:10m max_size=200m inactive=60m use_temp_path=off;

location / {
    proxy_pass http://127.0.0.1:4321;
    proxy_cache decanato;
    proxy_cache_valid 200 10m;
    proxy_cache_use_stale error timeout updating http_500 http_502 http_503;
    proxy_cache_background_update on;
    proxy_cache_lock on;
    add_header X-Cache-Status $upstream_cache_status always;
}

# El panel NUNCA se cachea
location /editar { proxy_pass http://127.0.0.1:4321; proxy_cache off;
                   add_header X-Robots-Tag "noindex, nofollow" always; }
location /auth   { proxy_pass http://127.0.0.1:4321; proxy_cache off; }
```

`proxy_cache_use_stale` es lo que hace que, si Postgres se cae, el sitio siga
sirviendo la última versión buena en vez de mostrar un error. Para un sitio que
publica horarios de comedores, eso importa.

## Purga al publicar
El endpoint de publicar tiene que invalidar la cache de las rutas afectadas.
Con nginx open source no hay `PURGE`: se resuelve con una `cache key` que incluya
una versión de contenido (`$cookie_v` no; mejor una variable desde el upstream, o
simplemente `proxy_cache_bypass` + un contador de versión en la clave).
Elige el mecanismo y **déjalo documentado en el ADR de cierre**.

## Verificación
```bash
curl -sI https://<dominio>/ | grep -i x-cache-status   # MISS y luego HIT
curl -sI https://<dominio>/editar | grep -i x-cache-status  # ausente o BYPASS
```
Y después de publicar un cambio: la ruta afectada devuelve el contenido nuevo sin
esperar 10 minutos.

## Cierre
HIT en rutas públicas, sin cache en el panel, y purga demostrada con un cambio real.
