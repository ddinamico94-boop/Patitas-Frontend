import type { NavigateFn } from '../types/navigation';

import icon from '../imagenes/favicon.svg';

export default function Footer({ navigate }: { navigate: NavigateFn }) {
  return (
    <footer className="bg-dark text-white/70 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <button
              onClick={() => navigate('home')}
              className="flex items-center gap-2.5 text-white mb-4"
            >
              <img
                src={icon}
                alt="Patitas Tucumán"
                className="w-8 h-8"
              />
              <span className="font-display font-semibold text-xl">
                Patitas Tucumán
              </span>
            </button>

            <p className="text-sm leading-relaxed max-w-xs">
              Plataforma comunitaria para reportar, encontrar y ayudar a
              animales perdidos, encontrados o en situación de calle en la
              provincia de Tucumán.
            </p>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-4">
              Plataforma
            </h4>

            <ul className="space-y-2.5 text-sm">
              {[
                { label: 'Ver reportes', page: 'reports' as const },
                { label: 'Mapa de reportes', page: 'map' as const },
                { label: 'Reportar animal', page: 'create' as const },
              ].map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => navigate(item.page)}
                    className="hover:text-terra transition-colors"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-4">
              Cuenta
            </h4>

            <ul className="space-y-2.5 text-sm">
              {[
                { label: 'Ingresar', page: 'login' as const },
                { label: 'Registrarse', page: 'register' as const },
                { label: 'Mi perfil', page: 'profile' as const },
              ].map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => navigate(item.page)}
                    className="hover:text-terra transition-colors"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
          <p>
            ©️ 2026 Patitas Tucumán. Hecho con ❤️ para los animales de Tucumán.
          </p>

          <div className="flex items-center gap-5">
            <a
              href="https://www.instagram.com/patitastucuman/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram de Patitas Tucumán"
              className="flex items-center gap-2 hover:text-terra transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="w-4 h-4"
              >
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle
                  cx="17.5"
                  cy="6.5"
                  r="1"
                  fill="currentColor"
                  stroke="none"
                />
              </svg>

              <span>@patitastucuman</span>
            </a>

            <p>Tucumán, Argentina</p>
          </div>
        </div>
      </div>
    </footer>
  );
}