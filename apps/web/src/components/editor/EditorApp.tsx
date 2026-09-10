import { useCallback, useEffect, useRef, useState } from 'react';
import FaceBlurStudio from './FaceBlurStudio';
import GalleryEditor from './GalleryEditor';

type User = { nombre: string; rol: string; nivel: number; parroquias: string[] };
type Pendiente = { clave: string; valor_borrador: unknown; valor_publicado: unknown; updated_at: string };

export default function EditorApp({ usuario, rutaPublica }: { usuario: User; rutaPublica: string; decanato?: string }) {
  const [pendientes, setPendientes] = useState<Pendiente[]>([]);
  const [estado, setEstado] = useState('Listo');
  const [conflicto, setConflicto] = useState<{ clave: string; actual: unknown; valor: unknown } | null>(null);
  const [subir, setSubir] = useState(false);
  const timers = useRef<Record<string, number>>({});
  const updated = useRef<Record<string, string>>({});
  const puedePublicar = usuario.nivel >= 40;
  const puedeAdmin = usuario.nivel >= 60;

  const recargar = useCallback(async () => {
    const r = await fetch('/api/contenido/pendientes');
    if (!r.ok) return;
    const data = await r.json();
    setPendientes(data.pendientes ?? []);
    for (const p of data.pendientes ?? []) updated.current[p.clave] = p.updated_at;
  }, []);

  useEffect(() => { recargar(); }, [recargar]);

  useEffect(() => {
    const ping = setInterval(() => fetch('/api/auth/refresh', { method: 'POST' }), 10 * 60 * 1000);
    return () => clearInterval(ping);
  }, []);

  const guardar = useCallback(async (clave: string, valor: unknown) => {
    setEstado('Guardando…');
    const r = await fetch(`/api/contenido/${encodeURIComponent(clave)}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ valor, updated_at: updated.current[clave] }),
    });
    if (r.status === 409) {
      const data = await r.json();
      setConflicto({ clave, actual: data.actual, valor });
      setEstado('Conflicto: alguien más editó esto');
      return;
    }
    if (!r.ok) {
      setEstado('No se guardó. Revisa la conexión.');
      return;
    }
    const data = await r.json();
    updated.current[clave] = data.updated_at;
    setEstado(`Guardado ${new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`);
    recargar();
  }, [recargar]);

  useEffect(() => {
    const nodos = [...document.querySelectorAll<HTMLElement>('[data-clave]')];
    const limpiar: Array<() => void> = [];

    for (const el of nodos) {
      const clave = el.dataset.clave!;
      if (!puedeCliente(usuario, clave)) continue;
      const path = el.dataset.path;
      const esLista = el.dataset.lista === '1';
      el.tabIndex = 0;
      el.setAttribute('role', 'textbox');

      const leer = () => {
        if (esLista) {
          return [...el.querySelectorAll('li, [data-item]')].map((li) => li.textContent?.trim() ?? '').filter(Boolean);
        }
        const texto = (el.innerText || '').replace(/\n$/, '');
        if (path) return { ...(typeof el.dataset.base === 'string' ? JSON.parse(el.dataset.base) : {}), [path]: texto };
        return texto;
      };

      const programar = () => {
        window.clearTimeout(timers.current[clave]);
        timers.current[clave] = window.setTimeout(() => guardar(clave, leer()), 3000);
      };

      const onFocus = () => {
        if (esLista) return;
        el.contentEditable = 'plaintext-only';
      };
      const onBlur = () => {
        if (esLista) return;
        el.contentEditable = 'false';
        window.clearTimeout(timers.current[clave]);
        guardar(clave, leer());
      };
      const onInput = () => programar();
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && !esLista) { e.preventDefault(); el.blur(); }
        if (e.key === 'Escape') { el.blur(); }
      };

      el.addEventListener('focus', onFocus);
      el.addEventListener('blur', onBlur);
      el.addEventListener('input', onInput);
      el.addEventListener('keydown', onKey);
      limpiar.push(() => {
        el.removeEventListener('focus', onFocus);
        el.removeEventListener('blur', onBlur);
        el.removeEventListener('input', onInput);
        el.removeEventListener('keydown', onKey);
      });
    }

    const before = (e: BeforeUnloadEvent) => {
      if (estado === 'Guardando…') { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', before);
    return () => { limpiar.forEach((f) => f()); window.removeEventListener('beforeunload', before); };
  }, [guardar, estado, usuario]);

  async function publicar() {
    if (!confirm(`Vas a publicar ${pendientes.length} cambio(s). ¿Seguro?`)) return;
    setEstado('Publicando…');
    const r = await fetch('/api/publicar', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    });
    const data = await r.json();
    if (!r.ok) { setEstado(data.error || data.detalle?.join(' ') || 'No se publicó'); return; }
    setEstado(`Publicado. ${data.publicados.length} cambio(s).`);
    recargar();
  }

  async function descartar() {
    if (!confirm('Se tira el borrador y vuelve lo que está en el sitio.')) return;
    const r = await fetch('/api/descartar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
    if (!r.ok) { setEstado('No se pudo descartar'); return; }
    location.reload();
  }

  async function salir() {
    await fetch('/api/auth/logout', { method: 'POST' });
    location.href = rutaPublica || '/';
  }

  const comedor = rutaPublica.match(/^\/comedores\/([^/]+)/)?.[1];

  return (
    <>
      <div className="editor-barra" role="region" aria-label="Barra de edición">
        <strong>{usuario.nombre}</strong>
        <span className="opacity-80">{usuario.rol}</span>
        <span className="ml-2">{pendientes.length ? `Borrador: ${pendientes.length} cambio(s)` : 'Todo publicado'}</span>
        <span className="ml-auto opacity-90" aria-live="polite">{estado}</span>
        {puedePublicar && (
          <button type="button" className="rounded-full bg-oro-500 px-3 py-1 font-semibold text-verde-900" onClick={publicar} disabled={!pendientes.length}>
            Publicar
          </button>
        )}
        {puedePublicar && (
          <button type="button" className="rounded-full border border-crema/40 px-3 py-1" onClick={descartar} disabled={!pendientes.length}>
            Descartar borrador
          </button>
        )}
        {comedor && puedePublicar && (
          <button type="button" className="rounded-full border border-crema/40 px-3 py-1" onClick={() => setSubir(true)}>
            Subir foto
          </button>
        )}
        {puedeAdmin && <a className="underline" href="/editar/usuarios">Usuarios</a>}
        {puedeAdmin && <a className="underline" href="/editar/historial">Historial</a>}
        <a className="underline" href={rutaPublica}>Ver pública</a>
        <button type="button" className="underline" onClick={salir}>Salir</button>
      </div>

      {conflicto && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-tinta/50 p-6" role="dialog" aria-labelledby="conf-titulo">
          <div className="max-w-lg rounded-xl2 bg-crema p-6 text-tinta">
            <h2 id="conf-titulo" className="font-serif text-xl font-semibold">Alguien más editó esto</h2>
            <p className="mt-3 text-sm">No se pisó tu texto. Puedes ver lo que hay ahora o dejar el tuyo.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" className="rounded-full bg-verde-700 px-4 py-2 text-crema" onClick={() => { location.reload(); }}>
                Ver lo que hay ahora
              </button>
              <button
                type="button"
                className="rounded-full border border-verde-700 px-4 py-2"
                onClick={async () => {
                  delete updated.current[conflicto.clave];
                  await guardar(conflicto.clave, conflicto.valor);
                  setConflicto(null);
                }}
              >
                Sobrescribir
              </button>
            </div>
          </div>
        </div>
      )}

      {comedor && <GalleryEditor comedor={comedor} puedeEditar={puedePublicar} onSubir={() => setSubir(true)} />}
      {subir && comedor && (
        <FaceBlurStudio
          comedor={comedor}
          onCerrar={() => setSubir(false)}
          onListo={() => { setSubir(false); location.reload(); }}
        />
      )}
    </>
  );
}

const COMEDOR_PARROQUIA: Record<string, string> = {
  'casa-san-vicente': 'dulce-nombre-de-jesus',
  'san-bernardo': 'san-bernardo',
  'el-tepeyac': 'el-tepeyac',
};

function puedeCliente(u: User, clave: string) {
  if (u.nivel < 40) return false;
  if (u.nivel >= 60) return true;
  const p = clave.split('.');
  if (p[0] === 'parroquia' && p[1]) return u.parroquias.includes(p[1]);
  if (p[0] === 'comedor' && p[1]) {
    const parroquia = COMEDOR_PARROQUIA[p[1]];
    return Boolean(parroquia && u.parroquias.includes(parroquia));
  }
  return false;
}
