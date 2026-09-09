# A1 · Auditoría local completa

`npm run verify` cubre lo estructural. Esta task cubre lo que el auditor no ve.

## Verificar a mano
1. **Contenido real, no de relleno.** Recorre las 23 páginas en `npm run preview`.
   Ninguna debe tener texto de plantilla ni un dato inventado del decanato.
2. **Las 3 fichas de comedor** muestran dirección, horario y cifras correctas
   contra `src/content/comedores/*.json`.
3. **Las 13 parroquias** existen y las 10 sin datos dicen "Información en construcción".
4. **Las 12 fotos**: abre cada una a tamaño completo y confirma que **ningún rostro
   de persona atendida quedó identificable**. Si encuentras uno, HALT: se reprocesa
   con `SIGMA_OMEGA/PROJECT/scripts/difuminar-rostros.py` antes de seguir.
5. **Enlaces internos**: ninguno a 404. Revisa header, footer y CTAs.
6. **El formulario de /ayudar** sigue mostrando el aviso de "no está conectado".
   Si ya se conectó en el SG-01 task-01, ese aviso debe haber desaparecido.

## Construir la imagen y probarla en local
```bash
docker build -t decanato:local .
docker run --rm -d -p 8080:80 --name decanato-test decanato:local
curl -I http://localhost:8080/                 # 200
curl -I http://localhost:8080/comedores        # 200, NO 404
curl -I http://localhost:8080/comedores/san-bernardo
curl -s http://localhost:8080/health           # ok
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/no-existe   # 404
curl -sI http://localhost:8080/ | grep -i content-security-policy
docker stop decanato-test
```

Si `/comedores` da 404, el `try_files` del `nginx.conf` está mal. Es el fallo
más probable de esta task: Astro genera carpetas, no archivos sueltos.

## Cierre
Salida de los `curl` pegada. Las 12 fotos revisadas una por una.
