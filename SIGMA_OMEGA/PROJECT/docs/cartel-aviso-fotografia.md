# Cartel de aviso de fotografía y video

Se imprime en hoja carta y se pega **en la entrada de cada comedor, visible antes de
que la persona entre**. Acompaña al difuminado de rostros; no lo sustituye.

---

## 1. El cartel ya está hecho

No hace falta generarlo: está listo para imprimir, con el logo real y el QR real.

| Archivo | Qué es |
|---|---|
| `docs/cartel/cartel-aviso-CARTA.pdf` | **Este es el que se manda a imprimir.** Carta 8.5×11 in |
| `docs/cartel/cartel-aviso-CARTA-300dpi.png` | Mismo cartel, 2550×3300 px a 300 dpi |
| `docs/cartel/cartel.fuente.html` | El fuente. Se edita el texto y se vuelve a renderizar |
| `docs/cartel/qr-aviso-privacidad.png` | El QR solo, 2280×2280 px |
| `docs/cartel/logo-decanato.png` | El escudo del decanato, 1254×1254 px con transparencia |

### Los dos enlaces que pediste

**A dónde apunta el QR** — este es el destino exacto, ya codificado en el PNG:
```
https://pastoralsocialdecanatodulcenombre.org/aviso-de-privacidad
```
Verificado: el QR decodifica correctamente desde el cartel renderizado a 300 dpi
y también a 400 px, o sea que escanea aunque se imprima chico.

**Dónde vive el logo dentro del repo** — ruta y URL pública una vez desplegado:
```
repo:  src/assets/decanato/logo-claro.webp        (512×512, el que usa el sitio)
repo:  SIGMA_OMEGA/PROJECT/docs/cartel/logo-decanato.png   (1254×1254, para imprenta)
web:   https://pastoralsocialdecanatodulcenombre.org/apple-touch-icon.png   (180×180)
```
Para imprenta usa el PNG de 1254 px. El `.webp` del sitio está optimizado para
pantalla y no conviene ampliarlo.

### Volver a generarlo si cambia el texto
```bash
# editar SIGMA_OMEGA/PROJECT/docs/cartel/cartel.fuente.html
npx playwright screenshot --viewport-size=850,1100 --scale=3 \
  SIGMA_OMEGA/PROJECT/docs/cartel/cartel.fuente.html cartel.png
```
El HTML usa las mismas fuentes del sitio (Source Serif 4 e Inter, incluidas en la
misma carpeta), así que el cartel y la página se ven de la misma familia.

---

## 2. Si prefieres que lo genere una IA de imagen

El texto largo en español lo deforman todos los generadores: salen acentos mal,
palabras inventadas y la eñe rota. Por eso el cartel de arriba está hecho con HTML.

Si aun así quieres una versión con otra estética, **genera sólo el fondo** y
compón encima el texto, el logo y el QR en Canva. Prompt para el fondo:

```
Fondo de cartel institucional vertical, formato carta (proporción 8.5:11), para
una parroquia católica. Calidad de imprenta, 300 dpi.

Superficie: crema cálido muy claro (#FCF9F2), limpia, sin textura ruidosa ni ruido
de papel exagerado.

Marco: filete doble delgado en dorado (#DEAB33) a 12 mm del borde — una línea de
3 px por fuera y una de 1 px por dentro, separadas 7 px. Esquinas con un ornamento
clásico muy discreto, estilo papelería eclesiástica formal. Nada recargado.

Banda superior: rectángulo horizontal en verde profundo (#04551F) que ocupa el 18%
superior del área interior del marco, de borde a borde del marco, con una línea
dorada de 3 px en su borde inferior. En el centro de esa banda, un círculo VACÍO
de 142 px de diámetro con un aro dorado sutil: ahí se pegará después el escudo del
decanato. Deja ese círculo completamente limpio.

Zona inferior: a 216 px del borde inferior interior, una línea horizontal fina
dorada que cruza de margen a margen. Debajo, a la izquierda, un cuadrado VACÍO de
168 px con borde dorado de 2 px sobre blanco: ahí se pegará el código QR. Déjalo
en blanco liso.

El resto del cartel: superficie crema completamente vacía, sin texto de ningún tipo,
sin marcas de agua, sin iconos de cámara, sin ilustraciones.

Paleta estricta: verde #04551F, dorado #DEAB33, crema #FCF9F2.
Sin sombras duras. Estética de documento oficial impreso, digna y serena.
```

Luego, en Canva o Illustrator:
1. Pega `logo-decanato.png` centrado en el círculo de la banda verde.
2. Pega `qr-aviso-privacidad.png` en el cuadrado blanco. **Mínimo 3×3 cm impreso.**
3. Escribe el texto de la sección 3 en vivo. No lo dejes generar por la IA.

---

## 3. Texto exacto del cartel

> ### AVISO DE FOTOGRAFÍA Y VIDEO
>
> En este comedor se realizan fotografías y videos de manera ocasional, con fines de
> comunicación y difusión de la obra de la Pastoral Social.
>
> Las fotografías pueden incluir de manera incidental a personas que se encuentren
> dentro de las instalaciones. **Antes de publicarlas difuminamos los rostros de las
> personas atendidas.**
>
> **Si no desea aparecer en fotografías o videos, dígalo a nuestro personal al
> ingresar.** No afecta en nada el servicio que recibe.
>
> También puede pedir en cualquier momento que retiremos una fotografía publicada en
> la que aparezca de manera identificable.
>
> **Aviso de privacidad completo** → `pastoralsocialdecanatodulcenombre.org/aviso-de-privacidad`
>
> Pastoral Social · Decanato Dulce Nombre de Jesús · Arquidiócesis de Guadalajara

---

## 4. Al imprimir

- Carta, a color, papel de 120 g o más.
- Laminado o en mica: va en la entrada, aguanta sol y manos.
- Uno por comedor: Casa San Vicente, San Bernardo y El Tepeyac.
- **Antes de pegarlo, escanea el QR con un celular** y confirma que abre el aviso.
  Si el sitio todavía no está publicado, el QR va a dar 404: pégalo hasta después
  del deploy.

---

## 5. Regla interna para quien toma las fotos

No se imprime en el cartel. Es para el equipo del comedor.

| Situación | ¿Se puede? |
|---|---|
| Foto panorámica del comedor con gente | Sí |
| Persona que aparece al fondo | Sí |
| Varias personas comiendo, ninguna es el centro | Sí |
| Acercamiento a una persona | No |
| Foto de una persona claramente identificable para publicidad | Sólo con su autorización |
| Menores identificables | Evitar, salvo autorización de quien ejerce la patria potestad |

Si alguien dice que no quiere aparecer: se registra internamente y se le excluye de
las siguientes fotos. Si después identifica una foto publicada donde sale
identificable y pide que se retire, **se retira**.
