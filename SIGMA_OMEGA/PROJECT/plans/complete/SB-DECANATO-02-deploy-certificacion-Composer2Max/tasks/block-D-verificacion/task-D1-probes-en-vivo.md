# D1 · Probes en vivo

Contra el dominio público. **No contra localhost.** Un build verde no prueba
que el sitio funcione para la señora que lo abre desde la calle.

## El auditor de este Shot
```bash
node SIGMA_OMEGA/PROJECT/plans/active/SB-DECANATO-02-deploy-certificacion-Composer2Max/verifications/verify-produccion.mjs https://pastoralsocialdecanatodulcenombre.org
```
Revisa las 23 rutas, cabeceras, CSP, 404, sitemap, robots, TTFB, y que no se
sirva ni un archivo `.js`. Si falla, HALT.

## Además, a mano
1. **Abrir el sitio desde un celular real**, con datos móviles, no WiFi.
   Es el escenario del público real.
2. **Pegar el enlace en WhatsApp** y confirmar que la tarjeta muestra la imagen
   OG, el título y la descripción. Es por donde va a circular.
3. Probar el menú móvil (`<details>`) en iOS y en Android.
4. Recorrer las 3 fichas de comedor y 3 parroquias al azar.
5. Enviar el formulario de `/ayudar`: si el endpoint no existe todavía, confirmar
   que el aviso lo dice y que no rompe la página.

## Cierre
Salida del auditor en verde. Captura de la tarjeta de WhatsApp. Captura del
sitio en un celular real.
