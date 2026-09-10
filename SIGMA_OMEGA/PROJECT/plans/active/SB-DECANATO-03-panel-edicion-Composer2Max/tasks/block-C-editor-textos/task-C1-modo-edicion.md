# C1 · Modo edición

Approach B de `panel-edit`: se navega el sitio y se hace clic sobre el texto.
No un formulario aparte.

## Cómo funciona
`/editar/<ruta>` renderiza **los mismos componentes** de la ruta pública, con el
contenido del borrador si existe, más la capa de edición encima.

- Barra superior fija: quién eres, "Borrador sin publicar" o "Todo publicado",
  botones **Publicar** y **Descartar borrador**, y salir.
- Cada bloque editable se resalta al pasar el mouse con un contorno dorado y un
  lápiz chico. Clic → se vuelve editable en el lugar.
- Texto simple: `contentEditable` con `plaintext-only`. Sin sorpresas de formato al
  pegar desde Word, que es exactamente lo que Angie va a hacer.
- Listas (servicios, cómo ayudar, jornada): agregar, editar y **reordenar
  arrastrando**. Cada renglón con su handle.
- Si el usuario no tiene permiso sobre ese bloque, no se resalta ni se puede clicar.

## Lo que NO va en la v1
- Rich text con negritas y colores. Si más adelante hace falta, se agrega con
  sanitización server-side (DOMPurify) según el guardrail 6. Hoy: texto plano.
- Editar el diseño, mover secciones o cambiar colores. Eso es otro Shot.

## Accesibilidad del editor
Navegable con teclado: Tab entre bloques, Enter para editar, Esc para cancelar.
Angie no necesariamente usa mouse con soltura.

## Cierre
Un usuario con rol ADMIN entra a `/editar/comedores/san-bernardo`, cambia el
resumen, y ve el cambio reflejado ahí mismo sin recargar.
