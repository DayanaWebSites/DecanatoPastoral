# Pastoral Social · Decanato Dulce Nombre de Jesús

Sitio web de la Pastoral Social del Decanato Dulce Nombre de Jesús, Arquidiócesis de
Guadalajara. Da a conocer los tres comedores asistenciales del decanato para sumar
voluntarios y bienhechores, y para canalizar a quien necesita comer.

## Stack
Astro 5 estático · TailwindCSS 4 · TypeScript strict · deploy en Coolify.
Cero JavaScript enviado al cliente. Fuentes self-hosted, sin peticiones a terceros.

Gobernado por el módulo SIGMA_OMEGA `by-type-sitio-web-astro` y el `adr-001-astro-sobre-next`.

## Comandos
```bash
npm install
npm run dev       # desarrollo en :4321
npm run build     # build estático a apps/web/dist/
npm run preview   # sirve apps/web/dist/
npm run check     # tipos y content collections
npm run verify    # auditoría del Shot (requiere build previo)
```

## Dónde vive el contenido
Todo lo que el decanato puede querer cambiar está en JSON, nunca dentro de un componente:

```
apps/web/src/content/comedores/*.json    3 comedores
apps/web/src/content/parroquias/*.json   13 parroquias
apps/web/src/data/decanato.json          decano, encargado, contacto
apps/web/src/data/textos.json            todos los textos institucionales
apps/web/src/content.config.ts           esquemas Zod — el contrato de datos
```

Una parroquia sin información se marca `"estado": "en_construccion"` y la UI lo muestra
así. Cuando llegue el dato, se cambia a `"publicada"`.

## Fotografías
Las fotos de los comedores se publican con **el rostro de las personas atendidas
difuminado**. Los originales sin procesar viven en `_source/`, que está en `.gitignore`
y nunca se comitea.

Para procesar fotos nuevas: `SIGMA_OMEGA/PROJECT/scripts/README.md`.

## Estructura SIGMA_OMEGA
```
SIGMA_OMEGA/
├── DIRECTIVES/            EurekaDesign materializado (lo instala SE-01)
└── PROJECT/
    ├── docs/
    ├── scripts/           difuminado de rostros
    └── plans/
        ├── active/        Shot en curso
        └── complete/      Shots cerrados y auditados
```

El Shot vigente es `SG-DECANATO-01-pastoral-social-Composer2Max`.
Se ejecuta desde `.cursor/plans/`, se documenta en `SIGMA_OMEGA/PROJECT/plans/active/`.
