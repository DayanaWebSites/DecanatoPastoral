#!/usr/bin/env node
/**
 * Auditoría del Shot SG-DECANATO-01.
 * Verifica lo que no se puede dar por sentado. Sale con código 1 si algo falla.
 * Uso: npm run verify   (requiere haber corrido `npm run build` antes)
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const raiz = process.cwd();
const web = join(raiz, 'apps/web');
const fallos = [];
const avisos = [];
const oks = [];

const ok = (m) => oks.push(m);
const falla = (m) => fallos.push(m);
const avisa = (m) => avisos.push(m);

// ── 0. Layout lock (SS-FLOTA-03e) ─────────────────────────────────────
if (!existsSync(web)) falla('Falta apps/web/. El sitio NO vive en la raíz.');
for (const sucio of ['src', 'public', 'astro.config.mjs', 'CHANGELOG.md', 'scripts']) {
  if (existsSync(join(raiz, sucio))) {
    falla(`Suciedad en raíz: ${sucio}. Producto = apps/web/. Changelog = SIGMA_OMEGA/PROJECT/. Scripts = SIGMA_OMEGA/CORE/.`);
  }
}
if (existsSync(web)) ok('Layout: producto en apps/web, raíz sin src/public/astro.config.');

const listar = (dir, ext) => {
  const out = [];
  const walk = (d) => {
    if (!existsSync(d)) return;
    for (const f of readdirSync(d)) {
      const p = join(d, f);
      if (statSync(p).isDirectory()) walk(p);
      else if (!ext || f.endsWith(ext)) out.push(p);
    }
  };
  walk(dir);
  return out;
};

// ── 1. El build existe y tiene las páginas esperadas ────────────────────
const dist = join(web, 'dist');
if (!existsSync(dist)) {
  falla('No existe apps/web/dist/. Corre `npm run build` antes de auditar.');
} else {
  const paginas = listar(dist, '.html');
  if (paginas.length < 23) falla(`Sólo ${paginas.length} páginas en dist/, se esperaban al menos 23.`);
  else ok(`${paginas.length} páginas generadas.`);

  // ── 2. Cero JavaScript enviado al cliente ─────────────────────────────
  const js = listar(dist, '.js');
  if (js.length > 0) falla(`Se están enviando ${js.length} archivos .js al cliente. El estándar de este proyecto es 0. Revisa si alguna isla se coló: ${js.slice(0, 3).join(', ')}`);
  else ok('0 archivos JavaScript enviados al cliente.');

  // ── 3. Nada se carga desde terceros ───────────────────────────────────
  const home = readFileSync(join(dist, 'index.html'), 'utf8');
  const externos = [...home.matchAll(/(?:src|href)="(https?:\/\/[^"]+)"/g)]
    .map((m) => m[1])
    .filter((u) => !u.includes('pastoralsocialdecanatodulcenombre.org') && !u.includes('schema.org'));
  if (externos.length) falla(`La home carga recursos de terceros: ${externos.join(', ')}`);
  else ok('Cero recursos de terceros en la home.');

  // ── 4. SEO mínimo por página ──────────────────────────────────────────
  const titulos = new Set();
  for (const p of paginas) {
    if (p.endsWith('404.html')) continue;
    const h = readFileSync(p, 'utf8');
    const rel = p.replace(raiz + '/', '');
    const t = h.match(/<title>([^<]+)<\/title>/)?.[1];
    const d = h.match(/<meta name="description" content="([^"]+)"/)?.[1];
    if (!t) falla(`${rel}: sin <title>.`);
    else if (titulos.has(t)) falla(`${rel}: <title> duplicado ("${t}").`);
    else titulos.add(t);
    if (!d) falla(`${rel}: sin meta description.`);
    else if (d.length < 60) avisa(`${rel}: description de ${d.length} caracteres, corta para buscadores.`);
    if (!h.includes('rel="canonical"')) falla(`${rel}: sin canonical.`);
    const h1 = (h.match(/<h1[\s>]/g) ?? []).length;
    if (h1 !== 1) falla(`${rel}: tiene ${h1} elementos <h1>, debe haber exactamente 1.`);
  }
  if (!fallos.length) ok('SEO base correcto en todas las páginas.');

  // ── 5. Ninguna imagen sin alt ─────────────────────────────────────────
  let sinAlt = 0;
  for (const p of paginas) {
    const h = readFileSync(p, 'utf8');
    // Astro serializa alt="" como `alt` a secas: ambas formas son válidas y cuentan como decorativa.
    for (const img of h.match(/<img\b[^>]*>/g) ?? []) if (!/\salt(?:=|[\s>/])/.test(img)) sinAlt++;
  }
  if (sinAlt) falla(`${sinAlt} imágenes sin atributo alt.`);
  else ok('Todas las imágenes llevan alt.');

  // ── 6. Sitemap y robots ───────────────────────────────────────────────
  if (!existsSync(join(dist, 'sitemap-index.xml'))) falla('Falta sitemap-index.xml.');
  else ok('Sitemap generado.');
  if (!existsSync(join(dist, 'robots.txt'))) falla('Falta robots.txt.');
  else ok('robots.txt presente.');

  // ── 7. Imagen OG ──────────────────────────────────────────────────────
  if (!existsSync(join(dist, 'og.jpg'))) avisa('Falta public/og.jpg. El sitio va a circular por WhatsApp: la tarjeta se ve pobre sin ella (task-03).');
  else ok('Imagen OG presente.');
}

// ── 8. Contenido: nada hardcodeado fuera de content/ y data/ ────────────
const datosDelDecanato = [
  ['Pbro. Juan Pablo', 'nombre del decano'],
  ['Pbro. José David', 'nombre del encargado de pastoral social'],
  ['Jesús Ortiz 2411', 'dirección de El Tepeyac'],
  ['Plan de San Luis 1616', 'dirección de San Bernardo'],
  ['Jesús 778', 'dirección de Casa San Vicente'],
];
for (const archivo of listar(join(web, 'src'), '.astro')) {
  const c = readFileSync(archivo, 'utf8');
  for (const [aguja, que] of datosDelDecanato) {
    if (c.includes(aguja)) {
      falla(`${archivo.replace(raiz + '/', '')} tiene hardcodeado el ${que}. Debe venir de apps/web/src/content/ o apps/web/src/data/ (ADR-001, directiva 1).`);
    }
  }
}
if (!fallos.some((f) => f.includes('hardcodeado'))) ok('Ningún dato editable del decanato está hardcodeado en un .astro.');

// ── 9. Toda collection tiene esquema Zod ───────────────────────────────
const config = join(web, 'src/content.config.ts');
if (!existsSync(config)) falla('Falta apps/web/src/content.config.ts.');
else {
  const c = readFileSync(config, 'utf8');
  for (const col of ['comedores', 'parroquias']) {
    if (!new RegExp(`const ${col} = defineCollection`).test(c)) falla(`La collection "${col}" no está definida.`);
  }
  const defs = (c.match(/defineCollection\(/g) ?? []).length;
  const schemas = (c.match(/schema:/g) ?? []).length;
  if (defs !== schemas) falla(`${defs} collections pero ${schemas} esquemas. Toda collection lleva Zod.`);
  else ok('Todas las collections llevan esquema Zod.');
}

// ── 10. Los originales sin difuminar no se comitean ────────────────────
const gitignore = existsSync(join(raiz, '.gitignore')) ? readFileSync(join(raiz, '.gitignore'), 'utf8') : '';
if (!gitignore.includes('_source/')) falla('.gitignore no ignora _source/. Ahí viven las fotos SIN difuminar: no pueden llegar al repo.');
else ok('_source/ ignorado: los originales sin difuminar no se comitean.');
if (existsSync(join(raiz, '_source'))) {
  try {
    const { execSync } = await import('node:child_process');
    const tracked = execSync('git ls-files _source/', { cwd: raiz }).toString().trim();
    if (tracked) falla(`Hay archivos de _source/ versionados en git: ${tracked.split('\n').length}. Son originales sin difuminar.`);
  } catch { /* repo sin git, se ignora */ }
}

// ── 11. Datos pendientes del cliente (aviso, no fallo) ─────────────────
const decanato = JSON.parse(readFileSync(join(web, 'src/data/decanato.json'), 'utf8'));
if (!decanato.contacto?.correo) avisa('apps/web/src/data/decanato.json sin correo. El aviso de privacidad lo necesita para los derechos ARCO (task-02).');
const parroquias = listar(join(web, 'src/content/parroquias'), '.json');
const enObra = parroquias.filter((p) => JSON.parse(readFileSync(p, 'utf8')).estado === 'en_construccion');
if (enObra.length) avisa(`${enObra.length} de ${parroquias.length} parroquias siguen en construcción (task-02).`);
const sinImagen = parroquias.filter((p) => !JSON.parse(readFileSync(p, 'utf8')).imagen);
if (sinImagen.length) avisa(`${sinImagen.length} parroquia(s) sin imagen: ${sinImagen.map((p) => p.split('/').pop()).join(', ')}`);

// ── 12. Cascada SE aplicada ────────────────────────────────────────────
for (const [ruta, que] of [
  ['.cursor/rules', 'las Cursor rules de SE-01'],
  ['.cursor/agents', 'los agentes de SE-02'],
  ['SIGMA_OMEGA/DIRECTIVES/eureka-design', 'EurekaDesign materializado (SE-01)'],
]) {
  if (!existsSync(join(raiz, ruta))) avisa(`Falta ${ruta}: no se han aplicado ${que}.`);
  else ok(`${ruta} presente.`);
}

// ── Reporte ────────────────────────────────────────────────────────────
const c = { v: '\x1b[32m', r: '\x1b[31m', a: '\x1b[33m', g: '\x1b[90m', x: '\x1b[0m' };
console.log(`\n${c.g}── Auditoría SG-DECANATO-01 ──${c.x}\n`);
for (const m of oks) console.log(`  ${c.v}✓${c.x} ${m}`);
if (avisos.length) {
  console.log(`\n${c.a}Avisos (no bloquean el cierre):${c.x}`);
  for (const m of avisos) console.log(`  ${c.a}!${c.x} ${m}`);
}
if (fallos.length) {
  console.log(`\n${c.r}Fallos (bloquean el cierre):${c.x}`);
  for (const m of fallos) console.log(`  ${c.r}✗${c.x} ${m}`);
  console.log(`\n${c.r}HALT — ${fallos.length} verificación(es) fallida(s). Corrige y vuelve a auditar.${c.x}\n`);
  process.exit(1);
}
console.log(`\n${c.v}Auditoría superada.${c.x} ${avisos.length} aviso(s) pendiente(s).\n`);
