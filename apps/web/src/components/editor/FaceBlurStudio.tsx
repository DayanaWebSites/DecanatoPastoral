import { useRef, useState } from 'react';

type Face = { x: number; y: number; w: number; h: number; skip: boolean };

async function sha256(buf: ArrayBuffer) {
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function padBox(f: Face, iw: number, ih: number): Face {
  const pad = 0.34;
  const cx = f.x + f.w / 2;
  const cy = f.y + f.h / 2;
  const w = Math.min(iw, f.w * (1 + pad * 2));
  const h = Math.min(ih, f.h * (1 + pad * 2));
  return { ...f, x: Math.max(0, cx - w / 2), y: Math.max(0, cy - h / 2), w, h };
}

function blurFace(ctx: CanvasRenderingContext2D, f: Face) {
  const { x, y, w, h } = f;
  const side = Math.max(w, h);
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.clip();
  const px = Math.max(6, Math.floor(side / 14));
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(ctx.canvas, x, y, w, h, x, y, w / px, h / px);
  ctx.imageSmoothingEnabled = true;
  ctx.filter = `blur(${Math.max(8, side * 0.08)}px)`;
  ctx.drawImage(ctx.canvas, x, y, w / px, h / px, x, y, w, h);
  ctx.filter = 'none';
  ctx.restore();
}

async function detectar(img: HTMLImageElement): Promise<Face[]> {
  const FD = (window as unknown as { FaceDetector?: new (o: { fastMode: boolean }) => { detect: (i: HTMLImageElement) => Promise<Array<{ boundingBox: DOMRectReadOnly }>> } }).FaceDetector;
  if (FD) {
    try {
      const det = new FD({ fastMode: false });
      const hits = await det.detect(img);
      return hits.map((h) => ({ x: h.boundingBox.x, y: h.boundingBox.y, w: h.boundingBox.width, h: h.boundingBox.height, skip: false }));
    } catch { /* sigue al fallback */ }
  }
  return [];
}

export default function FaceBlurStudio({
  comedor, parroquia, onCerrar, onListo,
}: { comedor?: string; parroquia?: string; onCerrar: () => void; onListo: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const baseRef = useRef<HTMLCanvasElement | null>(null);
  const [faces, setFaces] = useState<Face[]>([]);
  const [alt, setAlt] = useState('');
  const [msg, setMsg] = useState('Suelta una foto. No se sube hasta que la confirmes.');
  const [listo, setListo] = useState(false);
  const [sinRostros, setSinRostros] = useState(false);
  const [pintando, setPintando] = useState(false);

  function pintar(fs: Face[]) {
    const base = baseRef.current;
    const canvas = canvasRef.current;
    if (!base || !canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(base, 0, 0);
    for (const f of fs) {
      if (f.skip) continue;
      blurFace(ctx, padBox(f, canvas.width, canvas.height));
    }
  }

  async function cargar(file: File) {
    if (!file.type.startsWith('image/')) { setMsg('Eso no es una foto.'); return; }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;
    await img.decode();
    const max = 1600;
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);
    const canvas = canvasRef.current!;
    canvas.width = w; canvas.height = h;
    const base = document.createElement('canvas');
    base.width = w; base.height = h;
    base.getContext('2d')!.drawImage(img, 0, 0, w, h);
    baseRef.current = base;
    URL.revokeObjectURL(url);
    const found = await detectar(img);
    setFaces(found);
    setSinRostros(found.length === 0);
    setListo(true);
    pintar(found);
    setMsg(found.length
      ? `Se vieron ${found.length} rostro(s). El difuminado ya está aplicado. Puedes quitar el de un voluntario o pintar más.`
      : 'No se vio ningún rostro. Si hay una cara, píntala. Si no, confirma abajo.');
  }

  function onCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX - r.left) * (canvas.width / r.width);
    const y = (e.clientY - r.top) * (canvas.height / r.height);
    const hit = faces.find((f) => x >= f.x && x <= f.x + f.w && y >= f.y && y <= f.y + f.h);
    if (hit && confirm('¿Dejar este rostro sin difuminar? Sólo para voluntarios o sacerdotes.')) {
      const next = faces.map((f) => f === hit ? { ...f, skip: true } : f);
      setFaces(next);
      pintar(next);
    }
  }

  function onBrush(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!pintando) return;
    const canvas = canvasRef.current!;
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX - r.left) * (canvas.width / r.width);
    const y = (e.clientY - r.top) * (canvas.height / r.height);
    const extra: Face = { x: x - 28, y: y - 28, w: 56, h: 56, skip: false };
    const next = [...faces, extra];
    setFaces(next);
    pintar(next);
  }

  async function confirmar() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (faces.filter((f) => !f.skip).length === 0 && !sinRostros) {
      setMsg('Confirma que no aparece la cara de ninguna persona atendida.');
      return;
    }
    if (alt.trim().length < 10) { setMsg('Describe qué se ve, para quien no puede ver la imagen.'); return; }
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/webp', 0.82));
    if (!blob) return;
    const buf = await blob.arrayBuffer();
    const hash = await sha256(buf);
    const presign = await fetch('/api/imagenes/presign', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        processed: true,
        rostros: faces.filter((f) => !f.skip).length,
        sinRostrosConfirmado: faces.filter((f) => !f.skip).length === 0,
        sha256: hash,
        alt: alt.trim(),
        comedor,
        parroquia,
        contentType: 'image/webp',
      }),
    });
    const p = await presign.json();
    if (!presign.ok) { setMsg(p.error || 'No se pudo pedir la subida.'); return; }
    const put = await fetch(p.url, { method: 'PUT', headers: p.headers, body: blob });
    if (!put.ok) { setMsg('La subida falló.'); return; }
    const conf = await fetch('/api/imagenes/confirm', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ key: p.key, alt: alt.trim(), comedor, parroquia }),
    });
    if (!conf.ok) { setMsg('No se registró la foto.'); return; }
    onListo();
  }

  return (
    <div className="fixed inset-0 z-[95] grid place-items-center bg-tinta/60 p-4" role="dialog" aria-labelledby="blur-titulo">
      <div className="max-h-[94vh] w-full max-w-3xl overflow-auto rounded-xl2 bg-crema p-5 text-tinta">
        <h2 id="blur-titulo" className="font-serif text-2xl font-semibold">Difuminar y subir</h2>
        <p className="mt-2 text-sm text-grafito">{msg}</p>
        {!listo && (
          <label className="mt-6 flex cursor-pointer flex-col items-center rounded-xl2 border-2 border-dashed border-verde-700/40 p-10 text-center hover:bg-verde-50">
            <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => e.target.files?.[0] && cargar(e.target.files[0])} />
            Arrastra la foto aquí o elige un archivo. Todavía no se sube nada.
          </label>
        )}
        <canvas
          ref={canvasRef}
          className="mt-4 max-h-[50vh] w-full rounded-xl bg-arena"
          onClick={onCanvasClick}
          onMouseDown={() => setPintando(true)}
          onMouseUp={() => setPintando(false)}
          onMouseLeave={() => setPintando(false)}
          onMouseMove={onBrush}
        />
        {listo && (
          <>
            <p className="mt-3 text-xs text-grafito">Clic en un rostro para dejarlo (voluntario). Mantén pulsado y mueve para pintar zonas que el detector no vio.</p>
            {faces.filter((f) => !f.skip).length === 0 && (
              <label className="mt-4 flex items-start gap-2 text-sm">
                <input type="checkbox" checked={sinRostros} onChange={(e) => setSinRostros(e.target.checked)} />
                Confirmo que no aparece la cara de ninguna persona atendida.
              </label>
            )}
            <label className="mt-4 block text-sm">
              Describe qué se ve, para quien no puede ver la imagen.
              <input className="mt-1 w-full rounded-lg border border-arena px-3 py-2" value={alt} onChange={(e) => setAlt(e.target.value)} minLength={10} />
            </label>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" className="rounded-full bg-verde-700 px-4 py-2 text-crema" onClick={confirmar}>Confirmar y subir sólo esta versión</button>
              <button type="button" className="rounded-full border px-4 py-2" onClick={onCerrar}>Cancelar</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
