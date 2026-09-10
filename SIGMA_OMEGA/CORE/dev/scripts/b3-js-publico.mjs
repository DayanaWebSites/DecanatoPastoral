#!/usr/bin/env node
const base = (process.argv[2] || 'http://127.0.0.1:4321').replace(/\/$/, '');
const parroquias = [
  'dulce-nombre-de-jesus', 'santa-teresita-del-nino-jesus', 'san-bernardo', 'el-tepeyac',
  'jesus-nino', 'jesus-nuestra-pascua', 'la-sagrada-familia', 'nuestra-senora-del-buen-consejo',
  'oratorio-san-luis-gonzaga', 'san-ignacio-de-loyola', 'san-miguel-de-mezquitan',
  'santa-maria-goretti', 'senor-de-la-ascension',
];
const rutas = [
  '/', '/comedores', '/comedores/casa-san-vicente', '/comedores/san-bernardo', '/comedores/el-tepeyac',
  '/parroquias', ...parroquias.map((s) => '/parroquias/' + s),
  '/pastoral-social', '/ayudar', '/aviso-de-privacidad', '/gracias',
];
const fallos = [];
for (const ruta of rutas) {
  const r = await fetch(base + ruta);
  if (r.status !== 200 && !(ruta === '/gracias' && r.status === 200)) {
    if (r.status !== 200) { fallos.push(`${ruta} ${r.status}`); continue; }
  }
  const html = await r.text();
  const js = [...html.matchAll(/<script(?![^>]*type="application\/ld\+json")[^>]*>/gi)];
  if (js.length) fallos.push(`${ruta} tiene ${js.length} script(s) ejecutable(s)`);
}
if (fallos.length) {
  console.error('HALT B3\n' + fallos.map((f) => '  ✗ ' + f).join('\n'));
  process.exit(1);
}
console.log(`B3 verde. ${rutas.length} rutas públicas en 0 JS ejecutable.`);
