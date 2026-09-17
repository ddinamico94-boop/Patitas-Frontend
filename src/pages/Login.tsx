import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';

import type { NavigateFn } from '../types/navigation';

import {
  loginWithEmail,
  loginWithGoogle,
  saveSession,
  forgotPassword,
  verifyResetCode,
  resetPassword,
} from '../lib/api';

import SEO from '../components/SEO';

type ResetStep = 'login' | 'email' | 'code' | 'password' | 'success';

export default function Login({
  navigate,
  onLogin,
}: {
  navigate: NavigateFn;
  onLogin: () => void;
}) {
  // =====================================================
  // LOGIN
  // =====================================================

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const [loginLoading, setLoginLoading] =
    useState(false);

  const [loginError, setLoginError] =
    useState<string | null>(null);

  const [googleLoading, setGoogleLoading] =
    useState(false);

  const [googleError, setGoogleError] =
    useState<string | null>(null);

  // =====================================================
  // RECUPERACIÓN DE CONTRASEÑA
  // =====================================================

  const [resetStep, setResetStep] =
    useState<ResetStep>('login');

  const [resetEmail, setResetEmail] =
    useState('');

  const [resetCode, setResetCode] =
    useState('');

  const [newPassword, setNewPassword] =
    useState('');

  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [resetLoading, setResetLoading] =
    useState(false);

  const [resetError, setResetError] =
    useState<string | null>(null);

  // =====================================================
  // LOGIN CON EMAIL
  // =====================================================

  const handleEmailLogin = async () => {
    if (!email.trim()) {
      setLoginError('Ingresá tu email.');
      return;
    }

    if (!password) {
      setLoginError('Ingresá tu contraseña.');
      return;
    }

    setLoginLoading(true);
    setLoginError(null);
    setGoogleError(null);

    try {
      const auth = await loginWithEmail(
        email.trim(),
        password
      );

      saveSession(auth);
      onLogin();
    } catch (err) {
      setLoginError(
        err instanceof Error
          ? err.message
          : 'No se pudo iniciar sesión.'
      );
    } finally {
      setLoginLoading(false);
    }
  };

  // =====================================================
  // LOGIN CON GOOGLE
  // =====================================================

  const handleGoogleSuccess = async (
    credential: string | undefined
  ) => {
    if (!credential) {
      setGoogleError(
        'No se recibió el token de Google.'
      );
      return;
    }

    setGoogleLoading(true);
    setGoogleError(null);
    setLoginError(null);

    try {
      const auth =
        await loginWithGoogle(credential);

      saveSession(auth);
      onLogin();
    } catch (err) {
      setGoogleError(
        err instanceof Error
          ? err.message
          : 'Error al iniciar sesión con Google.'
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  // =====================================================
  // SOLICITAR CÓDIGO
  // =====================================================

  const handleForgotPassword = async () => {
    const cleanEmail = resetEmail
      .trim()
      .toLowerCase();

    if (!cleanEmail) {
      setResetError('Ingresá tu email.');
      return;
    }

    setResetLoading(true);
    setResetError(null);

    try {
      await forgotPassword(cleanEmail);

      setResetEmail(cleanEmail);
      setResetCode('');
      setResetStep('code');
    } catch (err) {
      setResetError(
        err instanceof Error
          ? err.message
          : 'No pudimos enviar el código.'
      );
    } finally {
      setResetLoading(false);
    }
  };

  // =====================================================
  // VERIFICAR CÓDIGO
  // =====================================================

  const handleVerifyCode = async () => {
    const cleanCode =
      resetCode.replace(/\D/g, '');

    if (cleanCode.length !== 6) {
      setResetError(
        'Ingresá el código de 6 dígitos.'
      );
      return;
    }

    setResetLoading(true);
    setResetError(null);

    try {
      await verifyResetCode(
        resetEmail,
        cleanCode
      );

      setResetCode(cleanCode);
      setResetStep('password');
    } catch (err) {
      setResetError(
        err instanceof Error
          ? err.message
          : 'El código es inválido o expiró.'
      );
    } finally {
      setResetLoading(false);
    }
  };

  // =====================================================
  // CAMBIAR CONTRASEÑA
  // =====================================================

  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      setResetError(
        'La contraseña debe tener al menos 6 caracteres.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError(
        'Las contraseñas no coinciden.'
      );
      return;
    }

    setResetLoading(true);
    setResetError(null);

    try {
      await resetPassword(
        resetEmail,
        resetCode,
        newPassword
      );

      setPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setResetStep('success');
    } catch (err) {
      setResetError(
        err instanceof Error
          ? err.message
          : 'No pudimos cambiar la contraseña.'
      );
    } finally {
      setResetLoading(false);
    }
  };

  // =====================================================
  // VOLVER AL LOGIN
  // =====================================================

  const returnToLogin = () => {
    setResetStep('login');

    setResetError(null);
    setResetCode('');
    setNewPassword('');
    setConfirmPassword('');

    if (resetEmail) {
      setEmail(resetEmail);
    }
  };

  // =====================================================
  // ENTER LOGIN
  // =====================================================

  const handleLoginKeyDown = (
    event: React.KeyboardEvent
  ) => {
    if (
      event.key === 'Enter' &&
      !loginLoading
    ) {
      handleEmailLogin();
    }
  };

  // =====================================================
  // ENTER RECUPERACIÓN
  // =====================================================

  const handleResetKeyDown = (
    event: React.KeyboardEvent
  ) => {
    if (
      event.key !== 'Enter' ||
      resetLoading
    ) {
      return;
    }

    if (resetStep === 'email') {
      handleForgotPassword();
    }

    if (resetStep === 'code') {
      handleVerifyCode();
    }

    if (resetStep === 'password') {
      handleResetPassword();
    }
  };

  // =====================================================
  // TÍTULOS
  // =====================================================

  const getTitle = () => {
    switch (resetStep) {
      case 'email':
        return 'Recuperá tu contraseña';

      case 'code':
        return 'Ingresá el código';

      case 'password':
        return 'Creá una nueva contraseña';

      case 'success':
        return 'Contraseña actualizada';

      default:
        return 'Bienvenido de nuevo';
    }
  };

  const getDescription = () => {
    switch (resetStep) {
      case 'email':
        return 'Ingresá el email asociado a tu cuenta.';

      case 'code':
        return `Te enviamos un código de 6 dígitos a ${resetEmail}.`;

      case 'password':
        return 'Elegí una nueva contraseña para tu cuenta.';

      case 'success':
        return 'Ya podés iniciar sesión con tu nueva contraseña.';

      default:
        return 'Ingresá a tu cuenta para reportar y gestionar animales.';
    }
  };

  // =====================================================
  // COMPONENTE OJO
  // =====================================================

  const EyeIcon = ({
    visible,
  }: {
    visible: boolean;
  }) => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      {visible ? (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />

          <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />

          <line
            x1="1"
            y1="1"
            x2="23"
            y2="23"
          />
        </>
      ) : (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />

          <circle
            cx="12"
            cy="12"
            r="3"
          />
        </>
      )}
    </svg>
  );

  return (
    <div className="min-h-screen bg-cream flex lg:flex-row flex-col">
      <SEO
        title="Iniciar sesión | Patitas Tucumán"
        description="Iniciá sesión en Patitas Tucumán."
        path="/login"
        noIndex
      />

      {/* =================================================
          PANEL IZQUIERDO
      ================================================= */}

      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1546377791-2e01b4449bf0?w=900&h=1000&fit=crop&auto=format"
          alt="Perro y gato juntos"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-tr from-dark/80 via-dark/40 to-transparent" />

        <div className="relative z-10 flex flex-col justify-between p-12 text-white h-full">
          <button
            type="button"
            onClick={() => navigate('home')}
            className="flex items-center gap-2.5"
          >
            <span className="text-xl">
              <span
                style={{
                  fontFamily:
                    'var(--font-script)',
                }}
              >
                Patitas
              </span>

              <span className="font-display font-semibold">
                {' '}
                Tucumán
              </span>
            </span>
          </button>

          <div>
            <p className="font-display text-4xl font-semibold leading-tight mb-4">
              "Cada reporte
              <br />
              puede cambiar
              <br />
              una historia."
            </p>
          </div>
        </div>
      </div>

      {/* =================================================
          PANEL DERECHO
      ================================================= */}

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-md">

          {/* LOGO MOBILE */}

          <div className="lg:hidden flex items-center gap-2.5 text-terra mb-8">
            <span className="text-xl text-dark">
              <span
                style={{
                  fontFamily:
                    'var(--font-script)',
                }}
              >
                Patitas
              </span>

              <span className="font-display font-semibold text-terra">
                {' '}
                Tucumán
              </span>
            </span>
          </div>

          <h1 className="font-display text-3xl font-semibold text-dark mb-2">
            {getTitle()}
          </h1>

          <p className="text-warm-mid mb-8">
            {getDescription()}
          </p>

          {/* =================================================
              LOGIN NORMAL
          ================================================= */}

          {resetStep === 'login' && (
            <>
              <div
                className="space-y-4"
                onKeyDown={handleLoginKeyDown}
              >
                {/* EMAIL */}

                <div>
                  <label className="text-sm font-medium text-dark mb-1.5 block">
                    Email
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);

                      if (loginError) {
                        setLoginError(null);
                      }
                    }}
                    placeholder="tu@email.com"
                    autoComplete="email"
                    disabled={loginLoading}
                    className="w-full px-4 py-3 border border-border rounded-xl text-sm text-dark focus:outline-none focus:border-terra transition-colors bg-white disabled:opacity-60"
                  />
                </div>

                {/* CONTRASEÑA */}

                <div>
                  <label className="text-sm font-medium text-dark mb-1.5 block">
                    Contraseña
                  </label>

                  <div className="relative">
                    <input
                      type={
                        showPass
                          ? 'text'
                          : 'password'
                      }
                      value={password}
                      onChange={(e) => {
                        setPassword(
                          e.target.value
                        );

                        if (loginError) {
                          setLoginError(null);
                        }
                      }}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      disabled={loginLoading}
                      className="w-full px-4 py-3 border border-border rounded-xl text-sm text-dark focus:outline-none focus:border-terra transition-colors bg-white pr-12 disabled:opacity-60"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPass(!showPass)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-warm-mid hover:text-dark"
                      aria-label={
                        showPass
                          ? 'Ocultar contraseña'
                          : 'Mostrar contraseña'
                      }
                    >
                      <EyeIcon
                        visible={showPass}
                      />
                    </button>
                  </div>
                </div>

                {/* OLVIDÉ CONTRASEÑA */}

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(
                        email.trim()
                      );

                      setResetError(null);
                      setLoginError(null);
                      setGoogleError(null);

                      setResetStep('email');
                    }}
                    className="text-xs text-terra hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              </div>

              {/* ERROR LOGIN */}

              {loginError && (
                <div className="mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600">
                    {loginError}
                  </p>
                </div>
              )}

              {/* ERROR GOOGLE */}

              {googleError && (
                <div className="mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600">
                    {googleError}
                  </p>
                </div>
              )}

              {/* BOTONES */}

              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  onClick={handleEmailLogin}
                  disabled={loginLoading}
                  className="w-full py-3.5 bg-terra text-white font-semibold rounded-xl hover:bg-terra-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loginLoading
                    ? 'Ingresando...'
                    : 'Ingresar'}
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-border" />

                  <span className="text-xs text-warm-mid">
                    o continuá con
                  </span>

                  <div className="flex-1 h-px bg-border" />
                </div>

                <div className="flex justify-center w-full">
                  <GoogleLogin
                    onSuccess={(
                      credentialResponse
                    ) =>
                      handleGoogleSuccess(
                        credentialResponse
                          .credential
                      )
                    }
                    onError={() =>
                      setGoogleError(
                        'No se pudo iniciar sesión con Google.'
                      )
                    }
                    text="continue_with"
                    shape="pill"
                    width="100%"
                  />
                </div>

                {googleLoading && (
                  <p className="text-center text-xs text-warm-mid">
                    Ingresando con Google...
                  </p>
                )}
              </div>

              {/* REGISTRO */}

              <p className="text-center text-sm text-warm-mid mt-8">
                ¿No tenés cuenta?{' '}

                <button
                  type="button"
                  onClick={() =>
                    navigate('register')
                  }
                  className="text-terra font-semibold hover:underline"
                >
                  Registrate
                </button>
              </p>
            </>
          )}

          {/* =================================================
              PASO 1 - EMAIL
          ================================================= */}

          {resetStep === 'email' && (
            <div onKeyDown={handleResetKeyDown}>
              <label className="text-sm font-medium text-dark mb-1.5 block">
                Email
              </label>

              <input
                type="email"
                value={resetEmail}
                onChange={(e) => {
                  setResetEmail(
                    e.target.value
                  );

                  setResetError(null);
                }}
                placeholder="tu@email.com"
                autoComplete="email"
                autoFocus
                disabled={resetLoading}
                className="w-full px-4 py-3 border border-border rounded-xl text-sm text-dark focus:outline-none focus:border-terra transition-colors bg-white disabled:opacity-60"
              />

              {resetError && (
                <div className="mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600">
                    {resetError}
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={
                  handleForgotPassword
                }
                disabled={resetLoading}
                className="w-full mt-6 py-3.5 bg-terra text-white font-semibold rounded-xl hover:bg-terra-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {resetLoading
                  ? 'Enviando...'
                  : 'Enviar código'}
              </button>

              <button
                type="button"
                onClick={returnToLogin}
                disabled={resetLoading}
                className="w-full mt-3 py-2 text-sm text-warm-mid hover:text-terra transition-colors"
              >
                ← Volver a iniciar sesión
              </button>
            </div>
          )}

          {/* =================================================
              PASO 2 - CÓDIGO
          ================================================= */}

          {resetStep === 'code' && (
            <div onKeyDown={handleResetKeyDown}>
              <label className="text-sm font-medium text-dark mb-1.5 block">
                Código de recuperación
              </label>

              <input
                type="text"
                inputMode="numeric"
                value={resetCode}
                onChange={(e) => {
                  const value =
                    e.target.value
                      .replace(/\D/g, '')
                      .slice(0, 6);

                  setResetCode(value);
                  setResetError(null);
                }}
                placeholder="000000"
                autoComplete="one-time-code"
                autoFocus
                disabled={resetLoading}
                maxLength={6}
                className="w-full px-4 py-3 border border-border rounded-xl text-center text-2xl tracking-[0.4em] font-semibold text-dark focus:outline-none focus:border-terra transition-colors bg-white disabled:opacity-60"
              />

              {resetError && (
                <div className="mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600">
                    {resetError}
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={handleVerifyCode}
                disabled={
                  resetLoading ||
                  resetCode.length !== 6
                }
                className="w-full mt-6 py-3.5 bg-terra text-white font-semibold rounded-xl hover:bg-terra-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {resetLoading
                  ? 'Verificando...'
                  : 'Verificar código'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setResetError(null);
                  setResetStep('email');
                }}
                disabled={resetLoading}
                className="w-full mt-3 py-2 text-sm text-warm-mid hover:text-terra transition-colors"
              >
                ← Cambiar email
              </button>
            </div>
          )}

          {/* =================================================
              PASO 3 - NUEVA CONTRASEÑA
          ================================================= */}

          {resetStep === 'password' && (
            <div
              className="space-y-4"
              onKeyDown={handleResetKeyDown}
            >
              <div>
                <label className="text-sm font-medium text-dark mb-1.5 block">
                  Nueva contraseña
                </label>

                <div className="relative">
                  <input
                    type={
                      showNewPassword
                        ? 'text'
                        : 'password'
                    }
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(
                        e.target.value
                      );

                      setResetError(null);
                    }}
                    placeholder="Mínimo 6 caracteres"
                    autoComplete="new-password"
                    autoFocus
                    disabled={resetLoading}
                    className="w-full px-4 py-3 border border-border rounded-xl text-sm text-dark focus:outline-none focus:border-terra transition-colors bg-white pr-12 disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowNewPassword(
                        !showNewPassword
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-warm-mid hover:text-dark"
                  >
                    <EyeIcon
                      visible={
                        showNewPassword
                      }
                    />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-dark mb-1.5 block">
                  Confirmar contraseña
                </label>

                <input
                  type={
                    showNewPassword
                      ? 'text'
                      : 'password'
                  }
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(
                      e.target.value
                    );

                    setResetError(null);
                  }}
                  placeholder="Repetí la contraseña"
                  autoComplete="new-password"
                  disabled={resetLoading}
                  className="w-full px-4 py-3 border border-border rounded-xl text-sm text-dark focus:outline-none focus:border-terra transition-colors bg-white disabled:opacity-60"
                />
              </div>

              {resetError && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600">
                    {resetError}
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={
                  handleResetPassword
                }
                disabled={resetLoading}
                className="w-full py-3.5 bg-terra text-white font-semibold rounded-xl hover:bg-terra-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {resetLoading
                  ? 'Guardando...'
                  : 'Cambiar contraseña'}
              </button>
            </div>
          )}

          {/* =================================================
              PASO 4 - ÉXITO
          ================================================= */}

          {resetStep === 'success' && (
            <div>
              <div className="bg-white border border-border rounded-2xl p-6 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-green-50 flex items-center justify-center">
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-green-600"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>

                <p className="text-sm text-warm-mid">
                  Tu contraseña fue cambiada
                  correctamente.
                </p>
              </div>

              <button
                type="button"
                onClick={returnToLogin}
                className="w-full mt-6 py-3.5 bg-terra text-white font-semibold rounded-xl hover:bg-terra-dark transition-colors"
              >
                Iniciar sesión
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}