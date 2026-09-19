import { useState } from 'react';
import type { Page, NavigateFn } from '../types/navigation';

interface NavbarProps {
  page: Page;
  navigate: NavigateFn;
  loggedIn: boolean;
}

function PawIcon({
  size = 24,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="currentColor"
      className={className}
    >
      <ellipse cx="16" cy="22" rx="5.5" ry="4" />
      <circle cx="6.5" cy="17" r="3" />
      <circle cx="25.5" cy="17" r="3" />
      <circle cx="10" cy="11" r="3" />
      <circle cx="22" cy="11" r="3" />
    </svg>
  );
}

const navLinks: {
  label: string;
  page: Page;
}[] = [
  {
    label: 'Inicio',
    page: 'home',
  },
  {
    label: 'Reportes',
    page: 'reports',
  },
  {
    label: 'Adoptar',
    page: 'adoptar',
  },
  {
    label: 'Mapa',
    page: 'map',
  },
  {
    label: 'Maltrato Animal',
    page: 'maltrato',
  },
];

export { PawIcon };

export default function Navbar({
  page,
  navigate,
  loggedIn,
}: NavbarProps) {
  const [menuOpen, setMenuOpen] =
    useState(false);

  const handleNavigate = (
    targetPage: Page
  ) => {
    navigate(targetPage);
    setMenuOpen(false);
  };

  const handleHowItWorksClick = () => {
    const scrollToHowItWorks = () => {
      const section =
        document.getElementById(
          'como-funciona'
        );

      if (section) {
        section.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    };

    if (page === 'home') {
      scrollToHowItWorks();
      return;
    }

    navigate('home');

    window.setTimeout(
      scrollToHowItWorks,
      50
    );
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            type="button"
            onClick={() =>
              handleNavigate('home')
            }
            className="flex items-center gap-2.5 text-terra"
            aria-label="Ir al inicio"
          >
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
          </button>

          {/* Navegación escritorio */}
          <div className="hidden md:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <button
                type="button"
                key={link.page}
                onClick={() =>
                  navigate(link.page)
                }
                className={`px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  page === link.page
                    ? 'text-terra bg-terra/10'
                    : 'text-warm-mid hover:text-dark hover:bg-warm'
                }`}
              >
                {link.label}
              </button>
            ))}

            <button
              type="button"
              onClick={
                handleHowItWorksClick
              }
              className="px-3 lg:px-4 py-2 rounded-lg text-sm font-medium text-warm-mid hover:text-dark hover:bg-warm transition-colors"
            >
              Cómo ayudar
            </button>
          </div>

          {/* Acciones escritorio */}
          <div className="hidden md:flex items-center gap-3">
            {loggedIn ? (
              <button
                type="button"
                onClick={() =>
                  navigate('profile')
                }
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium text-dark hover:border-terra hover:text-terra transition-colors"
              >
                Mi perfil
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  navigate('login')
                }
                className="px-4 py-2 text-sm font-medium text-dark hover:text-terra transition-colors"
              >
                Ingresar
              </button>
            )}

            <button
              type="button"
              onClick={() =>
                navigate('create')
              }
              className="px-4 py-3 bg-terra text-white text-sm font-semibold rounded-xl hover:bg-terra-dark transition-colors flex items-center gap-2"
            >
              <span>+</span>
              Reportar animal
            </button>
          </div>

          {/* Botón menú móvil */}
          <button
            type="button"
            onClick={() =>
              setMenuOpen(
                (current) => !current
              )
            }
            className="md:hidden p-2 rounded-lg text-dark hover:bg-warm transition-colors"
            aria-label={
              menuOpen
                ? 'Cerrar menú'
                : 'Abrir menú'
            }
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            )}
          </button>
        </div>

        {/* Menú móvil */}
        {menuOpen && (
          <div
            className="md:hidden pb-4 border-t border-border mt-0"
            style={{
              height:
                'calc(100vh - 64px)',
              overflowY: 'auto',
            }}
          >
            <div className="pt-3 space-y-0.5">
              {navLinks.map((link) => (
                <button
                  type="button"
                  key={link.page}
                  onClick={() =>
                    handleNavigate(
                      link.page
                    )
                  }
                  className={`block w-full text-left px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    page === link.page
                      ? 'text-terra bg-terra/10'
                      : 'text-dark hover:bg-warm'
                  }`}
                >
                  {link.label}
                </button>
              ))}

              <button
                type="button"
                onClick={() => {
                  handleHowItWorksClick();
                  setMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-3 text-sm font-medium text-dark hover:bg-warm rounded-lg transition-colors"
              >
                Cómo ayudar
              </button>
            </div>

            <div className="mt-3 pt-3 border-t border-border flex gap-3 px-1">
              {loggedIn ? (
                <button
                  type="button"
                  onClick={() =>
                    handleNavigate(
                      'profile'
                    )
                  }
                  className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium text-dark hover:border-terra hover:text-terra transition-colors"
                >
                  Mi perfil
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    handleNavigate(
                      'login'
                    )
                  }
                  className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium text-dark hover:border-terra hover:text-terra transition-colors"
                >
                  Ingresar
                </button>
              )}

              <button
                type="button"
                onClick={() =>
                  handleNavigate(
                    'create'
                  )
                }
                className="flex-1 py-2.5 bg-terra text-white rounded-xl text-sm font-semibold hover:bg-terra-dark transition-colors"
              >
                + Reportar
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}