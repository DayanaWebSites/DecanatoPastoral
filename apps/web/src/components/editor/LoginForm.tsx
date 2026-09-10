import { useState } from 'react';

const campo =
  'mt-1 h-11 w-full rounded-lg border border-arena bg-crema px-4 text-base text-tinta focus:border-verde-500 focus:ring-2 focus:ring-verde-500/25';

function safeNext(n: string) {
  if (!n.startsWith('/') || n.startsWith('//')) return '/editar';
  return n;
}

function IconoOjo({ abierto }: { abierto: boolean }) {
  if (abierto) {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path strokeLinecap="round" d="M3.5 12s3.5-6.5 8.5-6.5S20.5 12 20.5 12s-3.5 6.5-8.5 6.5S3.5 12 3.5 12Z" />
        <circle cx="12" cy="12" r="2.4" />
      </svg>
    );
  }
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" d="M4 12s3.5-6.5 8-6.5 8 6.5 8 6.5-3.5 6.5-8 6.5S4 12 4 12Z" />
      <path strokeLinecap="round" d="M5 19 19 5" />
    </svg>
  );
}

export default function LoginForm({ next }: { next: string }) {
  const [err, setErr] = useState('');
  const [cargando, setCargando] = useState(false);
  const [ver, setVer] = useState(false);

  return (
    <form
      className="mt-8 space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        setErr('');
        setCargando(true);
        const fd = new FormData(e.currentTarget);
        try {
          const r = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ correo: fd.get('correo'), password: fd.get('password') }),
          });
          const data = await r.json().catch(() => ({}));
          if (r.status === 503) {
            setErr('El panel se está conectando. Prueba en unos minutos.');
            return;
          }
          if (r.status === 429) {
            setErr('Demasiados intentos. Espera 15 minutos.');
            return;
          }
          if (r.status === 401) {
            setErr('Correo o contraseña incorrectos.');
            return;
          }
          if (!r.ok) {
            setErr('No se pudo entrar. Intenta de nuevo.');
            return;
          }
          location.href = data.debeCambiarPassword ? '/auth/nueva-clave?obligatorio=1' : safeNext(next);
        } catch {
          setErr('No se pudo entrar. Intenta de nuevo.');
        } finally {
          setCargando(false);
        }
      }}
    >
      <label className="block text-sm font-medium text-tinta" htmlFor="correo">
        Correo
        <input
          id="correo"
          name="correo"
          type="email"
          inputMode="email"
          required
          autoFocus
          autoComplete="username"
          className={campo}
        />
      </label>
      <label className="block text-sm font-medium text-tinta" htmlFor="password">
        Contraseña
        <span className="relative mt-1 block">
          <input
            id="password"
            name="password"
            type={ver ? 'text' : 'password'}
            required
            autoComplete="current-password"
            className={`${campo} mt-0 pr-12`}
            aria-invalid={err ? true : undefined}
            aria-describedby={err ? 'login-error' : undefined}
          />
          <button
            type="button"
            tabIndex={-1}
            className="absolute inset-y-0 right-0 grid w-11 place-items-center text-verde-700"
            aria-label={ver ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            onClick={() => setVer((v) => !v)}
          >
            <IconoOjo abierto={ver} />
          </button>
        </span>
      </label>
      {err && (
        <p id="login-error" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {err}
        </p>
      )}
      <button
        className="h-11 w-full rounded-full bg-oro-500 text-[15px] font-semibold text-verde-900 transition duration-100 hover:bg-oro-400 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
        type="submit"
        disabled={cargando}
      >
        {cargando ? 'Entrando…' : 'Entrar'}
      </button>
      <p className="text-center text-sm">
        <a className="text-verde-700 underline decoration-oro-500/60 underline-offset-4" href="/auth/recuperar">
          Olvidé mi contraseña
        </a>
      </p>
    </form>
  );
}
