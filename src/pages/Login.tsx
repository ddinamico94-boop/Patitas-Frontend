import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { NavigateFn } from '../data/mock';
import { PawIcon } from '../components/Navbar';
import { loginWithGoogle, saveSession } from '../lib/api';

export default function Login({ navigate, onLogin }: { navigate: NavigateFn; onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const handleGoogleSuccess = async (credential: string | undefined) => {
    if (!credential) {
      setGoogleError('No se recibió el token de Google.');
      return;
    }
    setGoogleLoading(true);
    setGoogleError(null);
    try {
      const auth = await loginWithGoogle(credential);
      saveSession(auth);
      onLogin();
    } catch (err) {
      setGoogleError(err instanceof Error ? err.message : 'Error al iniciar sesión con Google.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="bg-cream min-h-full flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1546377791-2e01b4449bf0?w=900&h=1000&fit=crop&auto=format"
          alt="Perro y gato juntos"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-dark/80 via-dark/40 to-transparent" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white h-full">
          <button onClick={() => navigate('home')} className="flex items-center gap-2.5">
            <PawIcon size={28} />
            <span className="font-display font-semibold text-xl">Patitas Tucumán</span>
          </button>
          <div>
            <p className="font-display text-4xl font-semibold leading-tight mb-4">
              "Cada reporte<br />puede cambiar<br />una historia."
            </p>
            <p className="text-white/70 text-sm">Más de 1.200 animales reportados en Tucumán.</p>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2.5 text-terra mb-8">
            <PawIcon size={24} />
            <span className="font-display font-semibold text-xl text-dark">Patitas <span className="text-terra">Tucumán</span></span>
          </div>
          <h1 className="font-display text-3xl font-semibold text-dark mb-2">Bienvenido de nuevo</h1>
          <p className="text-warm-mid mb-8">Ingresá a tu cuenta para reportar y gestionar animales.</p>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-dark mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full px-4 py-3 border border-border rounded-xl text-sm text-dark focus:outline-none focus:border-terra transition-colors bg-white"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-dark mb-1.5 block">Contraseña</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-border rounded-xl text-sm text-dark focus:outline-none focus:border-terra transition-colors bg-white pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-warm-mid hover:text-dark"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    {showPass
                      ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                      : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                    }
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <button className="text-xs text-terra hover:underline">¿Olvidaste tu contraseña?</button>
            </div>
          </div>

          {googleError && (
            <p className="text-sm text-red-600 mt-4">{googleError}</p>
          )}

          <div className="mt-6 space-y-3">
            <button
              onClick={onLogin}
              className="w-full py-3.5 bg-terra text-white font-semibold rounded-xl hover:bg-terra-dark transition-colors"
            >
              Ingresar
            </button>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-warm-mid">o continuá con</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={(credentialResponse) => handleGoogleSuccess(credentialResponse.credential)}
                onError={() => setGoogleError('No se pudo iniciar sesión con Google.')}
                text="continue_with"
                shape="pill"
                width="320"
              />
            </div>
            {googleLoading && (
              <p className="text-center text-xs text-warm-mid">Ingresando...</p>
            )}
          </div>

          <p className="text-center text-sm text-warm-mid mt-8">
            ¿No tenés cuenta?{' '}
            <button onClick={() => navigate('register')} className="text-terra font-semibold hover:underline">
              Registrate
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}