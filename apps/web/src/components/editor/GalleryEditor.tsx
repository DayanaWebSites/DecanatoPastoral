import { useEffect, useRef, useState } from 'react';

type Img = { id: string; alt: string; orden: number; cdn_url: string | null; archivo_local: string | null; publicada: boolean };

export default function GalleryEditor({
  comedor, puedeEditar, onSubir,
}: { comedor: string; puedeEditar: boolean; onSubir?: () => void }) {
  const [fotos, setFotos] = useState<Img[]>([]);
  const drag = useRef<number | null>(null);

  async function cargar() {
    const r = await fetch(`/api/imagenes?comedor=${encodeURIComponent(comedor)}`);
    if (!r.ok) return;
    const data = await r.json();
    setFotos(data.imagenes ?? []);
  }
  useEffect(() => { cargar(); }, [comedor]);

  async function guardarOrden(next: Img[]) {
    setFotos(next);
    await fetch('/api/imagenes', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        comedor,
        orden: next.map((f, i) => ({ id: f.id, orden: i })),
      }),
    });
  }

  function mover(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= fotos.length) return;
    const next = [...fotos];
    const tmp = next[i];
    next[i] = next[j];
    next[j] = tmp;
    guardarOrden(next);
  }

  function soltarEn(destino: number) {
    const origen = drag.current;
    drag.current = null;
    if (origen == null || origen === destino) return;
    const next = [...fotos];
    const [item] = next.splice(origen, 1);
    next.splice(destino, 0, item);
    guardarOrden(next);
  }

  async function borrar(id: string, publicada: boolean) {
    const ok = confirm(publicada ? 'Esta foto está en el sitio. ¿La quitas?' : '¿Eliminar esta foto?');
    if (!ok) return;
    await fetch(`/api/imagenes/${id}`, { method: 'DELETE' });
    cargar();
  }

  return (
    <section className="contenedor pb-8" aria-label="Ordenar fotos">
      <h2 className="font-serif text-xl font-semibold text-verde-900">Fotos de este comedor</h2>
      <p className="mt-1 text-sm text-grafito">
        Arrastra el asa o usa las flechas. Máximo 12. La única forma de agregar es el difuminado.
      </p>
      {puedeEditar && fotos.length < 12 && (
        <button type="button" className="mt-3 rounded-full border border-verde-700 px-4 py-2 text-sm" onClick={onSubir}>
          Agregar foto (pasa por el difuminado)
        </button>
      )}
      {fotos.length >= 12 && (
        <p className="mt-3 text-sm text-verde-900">Este comedor ya tiene 12 fotos. Quita una antes de subir otra.</p>
      )}
      <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {fotos.map((f, i) => (
          <li
            key={f.id}
            className="rounded-xl2 border border-arena bg-white p-3"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => soltarEn(i)}
          >
            {f.cdn_url && <img src={f.cdn_url} alt={f.alt} className="aspect-[4/3] w-full rounded-lg object-cover" />}
            {!f.cdn_url && f.archivo_local && <p className="text-xs text-grafito">{f.archivo_local}</p>}
            <p className="mt-2 text-xs">{f.alt}</p>
            {puedeEditar && (
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="cursor-grab rounded border px-2 py-1 text-xs"
                  draggable
                  onDragStart={() => { drag.current = i; }}
                  aria-label="Arrastrar para reordenar"
                >
                  ⋮⋮
                </button>
                <button type="button" className="rounded border px-2 py-1 text-xs" onClick={() => mover(i, -1)} aria-label="Subir">↑</button>
                <button type="button" className="rounded border px-2 py-1 text-xs" onClick={() => mover(i, 1)} aria-label="Bajar">↓</button>
                <button type="button" className="rounded border px-2 py-1 text-xs text-red-800" onClick={() => borrar(f.id, f.publicada)}>Quitar</button>
              </div>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
