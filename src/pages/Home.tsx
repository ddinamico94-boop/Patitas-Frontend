import { useEffect, useRef, useState } from 'react';
import type { NavigateFn } from '../types/navigation';
import { listReports, AnimalReport } from '../lib/api';
import AnimalCard from '../components/AnimalCard';
import Footer from '../components/Footer';
import orejitasLogo from '../assets/logo-orejitas-callejeras.jpg';
import icon from '../imagenes/favicon.svg';
import SEO from '../components/SEO';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:4000';

const steps = [
  {
    n: '01',
    title: 'Reportá',
    desc: 'Completá el formulario con la información del animal: fotos, zona, descripción y tus datos de contacto.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
  {
    n: '02',
    title: 'La comunidad ayuda',
    desc: 'Cientos de vecinos en Tucumán ven el reporte, comparten y aportan información sobre el animal.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    n: '03',
    title: 'Encontramos una solución',
    desc: 'El animal regresa a casa, es adoptado o recibe la atención veterinaria que necesita.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
];

const INSTAGRAM_URL =
  'https://www.instagram.com/orejitascallejeras_/';

const PROJECT_NAME = 'Orejitas Callejeras';

const PROJECT_IMAGE = orejitasLogo;

const PROJECT_DESCRIPTION = [
  'Detrás de cada animal en la calle hay una historia, una mirada que pide ayuda y una vida que merece una oportunidad.',
  'Orejitas Callejeras trabaja para rescatar, cuidar y dar visibilidad a animales que se encuentran en situación de calle, acompañándolos en el camino hacia una vida mejor y un hogar responsable.',
  'Desde Patitas Tucumán nos unimos a esta misión para amplificar sus historias, facilitar la difusión de los casos y conectar a quienes necesitan ayuda con quienes están dispuestos a brindarla.',
  'Porque cuando nos unimos, una pequeña ayuda puede cambiar una vida.',
];

function InstagramIcon({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LocationIcon({
  className = 'w-5 h-5',
}: {
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1116 0z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function ClockIcon({
  className = 'w-5 h-5',
}: {
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function CalendarIcon({
  className = 'w-5 h-5',
}: {
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function InfoIcon({
  className = 'w-5 h-5',
}: {
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10v6M12 7h.01" />
    </svg>
  );
}

function NavigationIcon({
  className = 'w-4 h-4',
}: {
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 3L10 14" />
      <path d="M21 3l-7 18-4-7-7-4z" />
    </svg>
  );
}

interface HomeStats {
  total: number;
  perdidos: number;
  encontrados: number;
  ayudados: number;
}

interface QuirofanoMovil {
  id: string;
  nombre: string;
  direccion: string;
  barrio?: string | null;
  lat: number;
  lng: number;
  fechaInicio: string;
  fechaFin: string;
  horario?: string | null;
  informacion?: string | null;
  activo: boolean;
}

/*
 * Marcador personalizado.
 *
 * No usa marker-icon.png ni marker-shadow.png de Leaflet.
 * El pin se genera directamente con HTML/SVG para evitar
 * problemas de rutas o imágenes rotas.
 */
const quirofanoMarkerIcon = L.divIcon({
  className: 'quirofano-marker-container',
  html: `
    <div
      style="
        width: 48px;
        height: 48px;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        filter: drop-shadow(0 4px 5px rgba(0,0,0,0.28));
      "
    >
      <div
        style="
          width: 42px;
          height: 42px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          background: #c96b4b;
          border: 3px solid #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
        "
      >
        <svg
          width="23"
          height="23"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          style="transform: rotate(45deg);"
        >
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <path d="M7 6l2-3h6l2 3" />
          <circle cx="8" cy="18.5" r="2" />
          <circle cx="16" cy="18.5" r="2" />
          <path d="M3 11h18" />
        </svg>
      </div>
    </div>
  `,
  iconSize: [48, 48],
  iconAnchor: [24, 48],
  popupAnchor: [0, -48],
});

function QuirofanoPublicMap({
  lat,
  lng,
  direccion,
}: {
  lat: number;
  lng: number;
  direccion: string;
}) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) {
      return;
    }

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: 16,
      zoomControl: true,
      scrollWheelZoom: false,
    });

    mapRef.current = map;

    L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }
    ).addTo(map);

    /*
     * IMPORTANTE:
     * Usamos el icono personalizado en lugar del marcador
     * predeterminado de Leaflet.
     */
    const marker = L.marker([lat, lng], {
      icon: quirofanoMarkerIcon,
    }).addTo(map);

    marker.bindPopup(
      `<strong>Quirófano Móvil</strong><br>${direccion}`
    );

    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [lat, lng, direccion]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-full min-h-[320px] relative z-0"
    />
  );
}

function formatDate(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function Home({
  navigate,
  disableSEO = false,
}: {
  navigate: NavigateFn;
  disableSEO?: boolean;
}) {
  const [recent, setRecent] = useState<AnimalReport[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  const [stats, setStats] = useState<HomeStats | null>(null);

  const [
    showProjectDescription,
    setShowProjectDescription,
  ] = useState(false);

  const [quirofano, setQuirofano] =
    useState<QuirofanoMovil[]>([]);

  const [loadingQuirofano, setLoadingQuirofano] =
    useState(true);

  useEffect(() => {
    let active = true;

    listReports({ pageSize: 4 })
      .then((data) => {
        if (active) {
          setRecent(data.items);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) {
          setLoadingRecent(false);
        }
      });

    Promise.all([
      listReports({ pageSize: 1 }),
      listReports({
        pageSize: 1,
        status: 'perdido',
      }),
      listReports({
        pageSize: 1,
        status: 'encontrado',
      }),
      listReports({
        pageSize: 1,
        status: 'ayudado',
      }),
      listReports({
        pageSize: 1,
        status: 'rescatado',
      }),
    ])
      .then(
        ([
          all,
          perdidos,
          encontrados,
          ayudados,
          rescatados,
        ]) => {
          if (!active) return;

          setStats({
            total: all.total,
            perdidos: perdidos.total,
            encontrados: encontrados.total,
            ayudados:
              ayudados.total +
              rescatados.total,
          });
        }
      )
      .catch(() => {
        if (active) {
          setStats(null);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadQuirofano() {
      try {
        setLoadingQuirofano(true);

        const response = await fetch(
          `${API_BASE_URL}/api/quirofano`
        );

        if (!response.ok) {
          throw new Error(
            'No se pudo consultar el quirófano móvil.'
          );
        }

        const data = await response.json();

        if (!active) return;

        const items = Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
            ? data.items
            : [];

        setQuirofano(items);
      } catch (error) {
        console.error(error);

        if (active) {
          setQuirofano([]);
        }
      } finally {
        if (active) {
          setLoadingQuirofano(false);
        }
      }
    }

    loadQuirofano();

    return () => {
      active = false;
    };
  }, []);

  const statTiles = [
    {
      value: stats?.total,
      label: 'Animales reportados',
    },
    {
      value: stats?.perdidos,
      label: 'Perdidos',
    },
    {
      value: stats?.encontrados,
      label: 'Encontrados',
    },
    {
      value: stats?.ayudados,
      label: 'Ayudados o rescatados',
    },
  ];

  return (
    <div className="bg-cream min-h-full">
      {!disableSEO && (
  <SEO
    title="Patitas Tucumán | Animales perdidos y encontrados"
    description="Plataforma comunitaria para reportar y encontrar animales perdidos, encontrados, rescatados o en situación de calle en Tucumán."
    path="/"
  />
)}

      <section className="bg-cream pt-2 pb-0 overflow-hidden sm:pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="py-8 lg:py-16">
              <div className="inline-flex items-center gap-2 text-terra text-sm font-medium mb-6 px-3.5 py-1.5 bg-terra/10 rounded-full">
                <img
                  src={icon}
                  alt="Patitas Tucumán"
                  className="w-6 h-6"
                />
                Comunidad de Tucumán
              </div>

              <h1 className="font-display text-5xl lg:text-6xl xl:text-7xl font-semibold text-dark leading-[1.05] mb-6">
                Ayudemos a que
                <br />
                <span className="text-terra">
                  vuelvan a casa
                </span>
              </h1>

              <p className="text-lg text-warm-mid leading-relaxed mb-8 max-w-lg">
                Reportá animales perdidos,
                encontrados o en situación de
                calle. Entre todos podemos
                ayudarlos a encontrar un hogar y
                reencontrarse con sus familias.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate('create')}
                  className="px-7 py-3.5 bg-terra text-white font-semibold rounded-xl hover:bg-terra-dark transition-colors text-base"
                >
                  Reportar un animal
                </button>

                <button
                  onClick={() => navigate('reports')}
                  className="px-7 py-3.5 border-2 border-border text-dark font-semibold rounded-xl hover:border-terra hover:text-terra transition-colors text-base"
                >
                  Ver reportes
                </button>
              </div>
            </div>

            <div className="relative h-72 sm:h-96 lg:h-[540px] rounded-3xl overflow-hidden bg-warm">
              <img
                src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=900&h=700&fit=crop&auto=format"
                alt="Perro y gato juntos"
                className="w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-dark/30 via-transparent to-transparent" />

              <div className="absolute bottom-5 left-5 right-5 flex gap-3">
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg">
                  <p className="text-xs text-warm-mid font-medium mb-0.5">
                    Reportes totales
                  </p>

                  <p className="font-display text-2xl font-bold text-dark">
                    {stats?.total ?? '—'}
                  </p>
                </div>

                <div className="bg-terra text-white rounded-2xl px-4 py-3 shadow-lg">
                  <p className="text-xs text-white/80 font-medium mb-0.5">
                    Ayudados o rescatados
                  </p>

                  <p className="font-display text-2xl font-bold">
                    {stats?.ayudados ?? '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statTiles.map((s) => (
              <div
                key={s.label}
                className="bg-white rounded-2xl p-6 border border-border text-center"
              >
                <div className="font-display text-3xl font-semibold text-dark mb-1">
                  {s.value ?? '—'}
                </div>

                <div className="text-sm text-warm-mid">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="como-funciona"
        className="py-16 bg-warm scroll-mt-24"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl font-semibold text-dark mb-4">
              ¿Cómo ayudar?
            </h2>

            <p className="text-warm-mid text-lg max-w-xl mx-auto">
              Un proceso simple para que más
              animales reciban la ayuda que
              necesitan.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div
                key={step.n}
                className="relative"
              >
                <div className="bg-white rounded-2xl p-8 border border-border h-full">
                  <div className="w-14 h-14 rounded-2xl bg-terra/10 text-terra flex items-center justify-center mb-6">
                    {step.icon}
                  </div>

                  <div className="font-display text-5xl font-semibold text-terra/20 mb-4 leading-none">
                    {step.n}
                  </div>

                  <h3 className="font-display text-xl font-semibold text-dark mb-3">
                    {step.title}
                  </h3>

                  <p className="text-warm-mid text-sm leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <div className="inline-flex items-center gap-2 text-terra text-sm font-semibold mb-4 px-3.5 py-1.5 bg-terra/10 rounded-full">
                <InstagramIcon className="w-4 h-4" />
                Sumate y ayudá desde Instagram
              </div>

              <p className="text-warm-mid leading-relaxed mb-3">
                Hay muchas formas de ayudar.
                También podés conocer y acompañar
                a quienes trabajan día a día por
                los animales de Tucumán.
              </p>

              <p className="text-warm-mid leading-relaxed">
                Patitas Tucumán trabaja junto a
                proyectos y personas que comparten
                el compromiso de ayudar y proteger
                a los animales de nuestra provincia.
              </p>
            </div>

            <div className="max-w-2xl mx-auto">
              <div className="group bg-white rounded-3xl border border-border p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 hover:border-terra/40 hover:shadow-lg transition-all duration-300">
                <div className="relative shrink-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-cream border border-border">
                    <img
                      src={PROJECT_IMAGE}
                      alt={PROJECT_NAME}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af] flex items-center justify-center shadow-md ring-2 ring-white">
                    <InstagramIcon className="w-4 h-4 text-white" />
                  </div>
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-display text-lg font-semibold text-dark mb-3">
                    {PROJECT_NAME}
                  </h3>

                  <div className="mb-5">
                    <div
                      className={`text-sm text-warm-mid leading-relaxed space-y-3 ${
                        !showProjectDescription
                          ? 'max-h-[4.8rem] overflow-hidden relative'
                          : ''
                      }`}
                    >
                      {PROJECT_DESCRIPTION.map(
                        (paragraph, index) => (
                          <p key={index}>
                            {paragraph}
                          </p>
                        )
                      )}

                      {!showProjectDescription && (
                        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setShowProjectDescription(
                          (previous) => !previous
                        )
                      }
                      className="mt-3 text-terra font-semibold text-sm hover:underline inline-flex items-center gap-1"
                    >
                      {showProjectDescription
                        ? 'Ocultar descripción'
                        : 'Leer descripción'}

                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`transition-transform duration-200 ${
                          showProjectDescription
                            ? 'rotate-180'
                            : ''
                        }`}
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                  </div>

                  <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm bg-gradient-to-r from-[#f58529] via-[#dd2a7b] to-[#8134af] hover:opacity-90 transition-opacity"
                  >
                    <InstagramIcon className="w-4 h-4" />
                    Ver Instagram
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="quirofano-movil"
        className="py-16 bg-cream scroll-mt-24 relative z-0"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-display text-4xl font-semibold text-dark mb-4">
              Quirófano Móvil
            </h2>

            <p className="text-warm-mid text-lg max-w-2xl mx-auto">
              Consultá dónde se encuentra el
              quirófano móvil y conocé las fechas,
              horarios y condiciones para las
              castraciones gratuitas.
            </p>
          </div>

          {loadingQuirofano ? (
            <div className="bg-white border border-border rounded-3xl p-10 text-center relative z-0">
              <p className="text-warm-mid">
                Cargando información del quirófano móvil...
              </p>
            </div>
          ) : quirofano.length === 0 ? (
            <div className="bg-white border border-border rounded-3xl p-10 text-center relative z-0">
              <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-terra/10 text-terra flex items-center justify-center">
                <InfoIcon className="w-7 h-7" />
              </div>

              <h3 className="font-display text-2xl font-semibold text-dark mb-3">
                No hay un operativo activo
              </h3>

              <p className="text-warm-mid max-w-xl mx-auto">
                En este momento no hay una ubicación
                de quirófano móvil publicada.
                Volvé a consultar próximamente.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {quirofano.map((item) => (
                <article
                  key={item.id}
                  className="bg-white rounded-3xl border border-border overflow-hidden shadow-sm relative z-0"
                >
                  <div className="grid lg:grid-cols-2">
                    <div className="min-h-[320px] lg:min-h-[500px] relative z-0 overflow-hidden">
                      <QuirofanoPublicMap
                        lat={item.lat}
                        lng={item.lng}
                        direccion={item.direccion}
                      />
                    </div>

                    <div className="p-7 sm:p-9 lg:p-10 relative z-0">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-terra/10 text-terra text-sm font-semibold mb-5">
                        <span className="w-2 h-2 rounded-full bg-terra" />
                        Operativo activo
                      </div>

                      <h3 className="font-display text-3xl font-semibold text-dark mb-6">
                        {item.nombre || 'Quirófano Móvil'}
                      </h3>

                      <div className="space-y-5">
                        <div className="flex gap-3">
                          <div className="w-10 h-10 rounded-xl bg-terra/10 text-terra flex items-center justify-center shrink-0">
                            <LocationIcon />
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-dark mb-1">
                              Ubicación
                            </p>

                            <p className="text-sm text-warm-mid">
                              {item.direccion}
                            </p>

                            {item.barrio && (
                              <p className="text-sm text-warm-mid mt-1">
                                Barrio: {item.barrio}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <div className="w-10 h-10 rounded-xl bg-terra/10 text-terra flex items-center justify-center shrink-0">
                            <CalendarIcon />
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-dark mb-1">
                              Fechas
                            </p>

                            <p className="text-sm text-warm-mid">
                              Desde {formatDate(item.fechaInicio)}
                            </p>

                            <p className="text-sm text-warm-mid">
                              Hasta {formatDate(item.fechaFin)}
                            </p>
                          </div>
                        </div>

                        {item.horario && (
                          <div className="flex gap-3">
                            <div className="w-10 h-10 rounded-xl bg-terra/10 text-terra flex items-center justify-center shrink-0">
                              <ClockIcon />
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-dark mb-1">
                                Horario
                              </p>

                              <p className="text-sm text-warm-mid">
                                {item.horario}
                              </p>
                            </div>
                          </div>
                        )}

                        {item.informacion && (
                          <div className="flex gap-3">
                            <div className="w-10 h-10 rounded-xl bg-terra/10 text-terra flex items-center justify-center shrink-0">
                              <InfoIcon />
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-dark mb-1">
                                Información
                              </p>

                              <p className="text-sm text-warm-mid leading-relaxed">
                                {item.informacion}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-8 pt-6 border-t border-border">
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-terra text-white font-semibold rounded-xl hover:bg-terra-dark transition-colors"
                        >
                          <NavigationIcon />
                          Cómo llegar
                        </a>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-display text-4xl font-semibold text-dark mb-2">
                Reportes recientes
              </h2>

              <p className="text-warm-mid">
                Animales que necesitan tu ayuda ahora mismo.
              </p>
            </div>

            <button
              onClick={() => navigate('reports')}
              className="hidden sm:flex items-center gap-1.5 text-terra font-semibold text-sm hover:underline"
            >
              Ver todos

              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {loadingRecent ? (
            <p className="text-warm-mid text-center py-10">
              Cargando reportes...
            </p>
          ) : recent.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {recent.map((animal) => (
                <AnimalCard
                  key={animal.id}
                  animal={animal}
                  navigate={navigate}
                />
              ))}
            </div>
          ) : (
            <p className="text-warm-mid text-center py-10">
              Todavía no hay reportes publicados.
            </p>
          )}

          <div className="mt-8 text-center sm:hidden">
            <button
              onClick={() => navigate('reports')}
              className="px-6 py-3 border-2 border-border rounded-xl text-sm font-semibold text-dark hover:border-terra hover:text-terra transition-colors"
            >
              Ver todos los reportes
            </button>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-terra rounded-3xl p-10 lg:p-16 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <img
                src={icon}
                alt=""
                className="absolute -top-10 -right-10 w-64 h-64 opacity-20 rotate-12 brightness-0 invert"
              />

              <img
                src={icon}
                alt=""
                className="absolute -bottom-12 -left-8 w-48 h-48 opacity-20 -rotate-12 brightness-0 invert"
              />

              <img
                src={icon}
                alt=""
                className="absolute top-5 left-5 w-28 h-28 opacity-10 rotate-12 brightness-0 invert"
              />
            </div>

            <div className="relative">
              <h2 className="font-display text-4xl lg:text-5xl font-semibold mb-4">
                ¿Viste un animal que necesita ayuda?
              </h2>

              <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                Tu reporte puede ser el comienzo
                de una historia con final feliz.
                Solo lleva unos minutos.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => navigate('create')}
                  className="px-8 py-3.5 bg-white text-terra font-semibold rounded-xl hover:bg-cream transition-colors text-base"
                >
                  Reportar un animal
                </button>

                <button
                  onClick={() => navigate('map')}
                  className="px-8 py-3.5 border-2 border-white/40 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors text-base"
                >
                  Ver el mapa
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer navigate={navigate} />
    </div>
  );
}