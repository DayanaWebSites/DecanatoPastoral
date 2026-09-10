import { useEffect, useRef, useState } from 'react';
import { authCampoIcono, authCta, authLabel, authLink } from './auth-ui';

function safeNext(n: string) {
  if (!n.startsWith('/') || n.startsWith('//')) return '/editar';
  return n;
}

function IconoCorreo() {
  return (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <rect x="3.5" y="6" width="17" height="12" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m5 8.2 7 5.2 7-5.2" />
    </svg>
  );
}

function IconoCandado() {
  return (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <rect x="5.5" y="11" width="13" height="9" rx="1.8" />
      <path strokeLinecap="round" d="M8 11V8.2a4 4 0 0 1 8 0V11" />
    </svg>
  );
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
  const correoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (window.matchMedia('(pointer: fine)').matches) correoRef.current?.focus();
  }, []);

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
      <label className={authLabel} htmlFor="correo">
        Correo
        <span className="relative mt-1.5 block">
          <span className="pointer-events-none absolute inset-y-0 left-0 grid w-11 place-items-center text-verde-800">
            <IconoCorreo />
          </span>
          <input
            ref={correoRef}
            id="correo"
            name="correo"
            type="email"
            inputMode="email"
            required
            autoComplete="username"
            className={authCampoIcono}
          />
        </span>
      </label>
      <div>
        <label className={authLabel} htmlFor="password">Contraseña</label>
        <span className="relative mt-1.5 block">
          <span className="pointer-events-none absolute inset-y-0 left-0 grid w-11 place-items-center text-verde-800">
            <IconoCandado />
          </span>
          <input
            id="password"
            name="password"
            type={ver ? 'text' : 'password'}
            required
            autoComplete="current-password"
            className={`${authCampoIcono} pr-12`}
            aria-invalid={err ? true : undefined}
            aria-describedby={err ? 'login-error' : undefined}
          />
          <button
            type="button"
            tabIndex={-1}
            className="absolute inset-y-0 right-0 grid w-11 place-items-center text-verde-800 hover:text-verde-700"
            aria-label={ver ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            onClick={() => setVer((v) => !v)}
          >
            <IconoOjo abierto={ver} />
          </button>
        </span>
        <p className="mt-2">
          <a className={authLink} href="/auth/recuperar">Olvidé mi contraseña</a>
        </p>
      </div>
      {err && (
        <p id="login-error" className="rounded-md border border-red-300 bg-red-50 px-3 py-2.5 text-sm text-red-900" role="alert">
          {err}
        </p>
      )}
      <button className={authCta} type="submit" disabled={cargando}>
        {cargando ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  );
}
