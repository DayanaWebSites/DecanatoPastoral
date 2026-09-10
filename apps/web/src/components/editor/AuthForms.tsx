import { useState } from 'react';
import { authCampo, authCta, authLabel } from './auth-ui';

export function RecuperarForm() {
  const [msg, setMsg] = useState('');
  const [cargando, setCargando] = useState(false);
  return (
    <form
      className="mt-8 space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        setCargando(true);
        const correo = new FormData(e.currentTarget).get('correo');
        try {
          const r = await fetch('/api/auth/forgot', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ correo }),
          });
          const data = await r.json();
          setMsg(data.devUrl ? `En local: ${data.devUrl}` : (data.mensaje || 'Si hay cuenta, ya salió el correo.'));
        } finally {
          setCargando(false);
        }
      }}
    >
      <label className={authLabel} htmlFor="correo-rec">
        Correo
        <input
          id="correo-rec"
          name="correo"
          type="email"
          inputMode="email"
          required
          autoComplete="username"
          className={`${authCampo} mt-1.5`}
        />
      </label>
      <button className={authCta} type="submit" disabled={cargando}>
        {cargando ? 'Enviando…' : 'Enviar enlace'}
      </button>
      {msg && <p className="text-sm text-verde-800" role="status">{msg}</p>}
    </form>
  );
}

export function NuevaClaveForm({ token, obligatorio }: { token: string; obligatorio: boolean }) {
  const [err, setErr] = useState('');
  const [cargando, setCargando] = useState(false);
  return (
    <form
      className="mt-8 space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        setErr('');
        setCargando(true);
        const fd = new FormData(e.currentTarget);
        const url = token ? '/api/auth/reset' : '/api/auth/cambiar-password';
        const body = token
          ? { token, password: fd.get('nueva') }
          : { actual: fd.get('actual'), nueva: fd.get('nueva') };
        try {
          const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
          const data = await r.json();
          if (!r.ok) { setErr(data.error || 'No se pudo guardar.'); return; }
          location.href = '/editar';
        } catch {
          setErr('No se pudo guardar. Intenta de nuevo.');
        } finally {
          setCargando(false);
        }
      }}
    >
      {obligatorio && !token && (
        <label className={authLabel} htmlFor="actual">
          Contraseña actual
          <input id="actual" name="actual" type="password" required autoComplete="current-password" className={`${authCampo} mt-1.5`} />
        </label>
      )}
      <label className={authLabel} htmlFor="nueva">
        Nueva contraseña
        <input id="nueva" name="nueva" type="password" required minLength={10} autoComplete="new-password" className={`${authCampo} mt-1.5`} />
      </label>
      {err && <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2.5 text-sm text-red-900" role="alert">{err}</p>}
      <button className={authCta} type="submit" disabled={cargando}>
        {cargando ? 'Guardando…' : 'Guardar'}
      </button>
    </form>
  );
}
