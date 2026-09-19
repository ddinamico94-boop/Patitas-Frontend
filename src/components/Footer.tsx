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

          <div className="flex items-center gap-5 flex-wrap justify-center">
            {/* Instagram */}
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

            {/* Facebook */}
            <a
              href="https://web.facebook.com/profile.php?id=61594295469948"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook de Patitas Tucumán"
              className="flex items-center gap-2 hover:text-terra transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.1 10.125 24v-8.437H7.078v-3.49h3.047V9.413c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.953h-1.514c-1.491 0-1.956.93-1.956 1.885v2.261h3.328l-.532 3.49h-2.796V24C19.612 23.1 24 18.1 24 12.073z" />
              </svg>

              <span>Patitas Tucumán</span>
            </a>

            <p>Tucumán, Argentina</p>
          </div>
        </div>
      </div>
    </footer>
  );
}