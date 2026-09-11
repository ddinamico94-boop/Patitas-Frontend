import { useMemo, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import L from 'leaflet';

import {
  statusLabel,
  statusDot,
  AnimalStatus,
} from '../data/mock';

import type { NavigateFn } from '../types/navigation';

import {
  listReports,
  getReport,
  AnimalReport,
} from '../lib/api';

const filterOptions: {
  label: string;
  value: AnimalStatus | 'todos';
}[] = [
  { label: 'Todos', value: 'todos' },
  { label: 'Perdidos', value: 'perdido' },
  { label: 'Encontrados', value: 'encontrado' },
  { label: 'En calle', value: 'en_calle' },
  { label: 'Rescatados', value: 'rescatado' },
];

// Centro aproximado de San Miguel de Tucumán
const TUCUMAN_CENTER: [number, number] = [-26.8241, -65.2226];

function createIcon(color: string) {
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width: 28px;
        height: 28px;
        border-radius: 9999px;
        background: ${color};
        border: 2px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.35);
      "></div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
}

/*
 * Los iconos se crean UNA sola vez.
 *
 * Antes makeIcon() se ejecutaba nuevamente
 * para cada marcador en cada render.
 */
const markerIcons: Partial<Record<AnimalStatus, L.DivIcon>> = {};

Object.entries(statusDot).forEach(([status, color]) => {
  markerIcons[status as AnimalStatus] = createIcon(color);
});

function FlyToSelected({
  animal,
}: {
  animal: AnimalReport | null;
}) {
  const map = useMap();

  if (!animal) {
    return null;
  }

  /*
   * No usamos useEffect porque Leaflet ya recibe
   * el animal seleccionado y realiza el movimiento.
   */
  map.flyTo(
    [animal.lat, animal.lng],
    14,
    {
      duration: 0.6,
    }
  );

  return null;
}

export default function MapPage({
  navigate,
}: {
  navigate: NavigateFn;
}) {
  const queryClient = useQueryClient();

  const [selected, setSelected] =
    useState<AnimalReport | null>(null);

  const [activeFilter, setActiveFilter] =
    useState<AnimalStatus | 'todos'>('todos');

  /*
   * Usamos LA MISMA queryKey que Reports.tsx.
   *
   * Si el usuario ya entró a Reportes,
   * estos datos normalmente ya existen en caché.
   *
   * Resultado:
   * Reportes -> Mapa
   * puede abrir prácticamente instantáneo.
   */
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['reports', 'all'],

    queryFn: () =>
      listReports({
        pageSize: 50,
      }),

    staleTime: 5 * 60 * 1000,

    gcTime: 30 * 60 * 1000,

    refetchOnWindowFocus: false,

    retry: 1,
  });

  const allReports = data?.items ?? [];

  /*
   * useMemo evita repetir todos los filtros
   * cada vez que cambia algo no relacionado.
   */
  const withCoords = useMemo(() => {
    return allReports.filter(
      (report) =>
        report.lat !== 0 ||
        report.lng !== 0
    );
  }, [allReports]);

  const visible = useMemo(() => {
    if (activeFilter === 'todos') {
      return withCoords;
    }

    return withCoords.filter(
      (report) =>
        report.status === activeFilter
    );
  }, [withCoords, activeFilter]);

  /*
   * Precargamos el detalle del reporte.
   *
   * Si desde el mapa el usuario toca
   * "Ver reporte", ReportDetail puede abrir
   * desde caché.
   */
  const prefetchReport = (
    reportId: string
  ) => {
    queryClient.prefetchQuery({
      queryKey: ['report', reportId],

      queryFn: () =>
        getReport(reportId),

      staleTime: 5 * 60 * 1000,
    });
  };

  return (
    <div
      className="bg-cream"
      style={{
        height: 'calc(100vh - 64px)',
      }}
    >
      <div className="h-full flex flex-col lg:flex-row">
        {/* SIDEBAR */}
        <div className="w-full lg:w-80 max-h-[45vh] lg:max-h-none bg-white border-b lg:border-b-0 lg:border-r border-border flex flex-col shrink-0">
          <div className="p-4 border-b border-border">
            <h2 className="font-display text-lg font-semibold text-dark mb-2">
              Mapa de reportes
            </h2>

            <p className="text-xs text-warm-mid mb-3">
              Explorá los reportes de animales en Tucumán.
            </p>

            <div className="flex gap-1.5 flex-wrap">
              {filterOptions.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() =>
                    setActiveFilter(filter.value)
                  }
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border ${
                    activeFilter === filter.value
                      ? 'bg-terra text-white border-terra'
                      : 'bg-white text-dark border-border hover:border-terra hover:text-terra'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* LISTA */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {Array.from({
                  length: 5,
                }).map((_, index) => (
                  <div
                    key={index}
                    className="flex gap-3 animate-pulse"
                  >
                    <div className="w-12 h-12 rounded-xl bg-warm shrink-0" />

                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-3 bg-warm rounded w-2/3" />
                      <div className="h-2.5 bg-warm rounded w-1/2" />
                      <div className="h-2.5 bg-warm rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : isError ? (
              <p className="text-sm text-red-600 p-4">
                {error instanceof Error
                  ? error.message
                  : 'No se pudieron cargar los reportes.'}
              </p>
            ) : visible.length === 0 ? (
              <p className="text-sm text-warm-mid p-4">
                No hay reportes con ubicación para mostrar.
                Para que un reporte aparezca acá, hay que
                crearlo usando "Usar mi ubicación actual".
              </p>
            ) : (
              visible.map((animal) => (
                <button
                  key={animal.id}
                  onMouseEnter={() =>
                    prefetchReport(animal.id)
                  }
                  onFocus={() =>
                    prefetchReport(animal.id)
                  }
                  onTouchStart={() =>
                    prefetchReport(animal.id)
                  }
                  onClick={() =>
                    setSelected(animal)
                  }
                  className={`w-full text-left p-4 border-b border-border hover:bg-warm transition-colors flex gap-3 items-start ${
                    selected?.id === animal.id
                      ? 'bg-warm'
                      : ''
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-cream shrink-0">
                    {animal.imageUrl ? (
                      <img
                        src={animal.imageUrl}
                        alt={animal.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                        width="48"
                        height="48"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg">
                        🐾
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="font-semibold text-dark text-sm truncate">
                        {animal.name}
                      </span>

                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{
                          background:
                            statusDot[
                              animal.status
                            ],
                        }}
                      />
                    </div>

                    <p className="text-xs text-warm-mid">
                      {
                        statusLabel[
                          animal.status
                        ]
                      }
                    </p>

                    <p className="text-xs text-warm-mid truncate">
                      {animal.zone}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* LEYENDA */}
          <div className="hidden lg:block p-4 border-t border-border">
            <div className="grid grid-cols-2 gap-2 text-xs text-warm-mid">
              {(
                [
                  'perdido',
                  'encontrado',
                  'en_calle',
                  'rescatado',
                ] as AnimalStatus[]
              ).map((status) => (
                <div
                  key={status}
                  className="flex items-center gap-1.5"
                >
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{
                      background:
                        statusDot[status],
                    }}
                  />

                  {statusLabel[status]}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MAPA */}
        <div className="flex-1 relative min-h-[250px]">
          {/* Contador */}
          <div className="absolute top-4 right-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 text-xs font-medium text-dark border border-border shadow">
            {visible.length}{' '}
            {visible.length === 1
              ? 'reporte activo'
              : 'reportes activos'}
          </div>

          <MapContainer
            center={TUCUMAN_CENTER}
            zoom={12}
            preferCanvas={true}
            style={{
              width: '100%',
              height: '100%',
            }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <FlyToSelected
              animal={selected}
            />

            {visible.map((animal) => {
              const icon =
                markerIcons[
                  animal.status
                ];

              return (
                <Marker
                  key={animal.id}
                  position={[
                    animal.lat,
                    animal.lng,
                  ]}
                  icon={icon}
                  eventHandlers={{
                    click: () => {
                      setSelected(animal);

                      prefetchReport(
                        animal.id
                      );
                    },
                  }}
                >
                  <Popup>
                    <div
                      style={{
                        width: 200,
                      }}
                    >
                      {animal.imageUrl && (
                        <img
                          src={
                            animal.imageUrl
                          }
                          alt={animal.name}
                          loading="lazy"
                          decoding="async"
                          width="200"
                          height="100"
                          style={{
                            width: '100%',
                            height: 100,
                            objectFit:
                              'cover',
                            borderRadius: 8,
                            marginBottom: 8,
                          }}
                        />
                      )}

                      <strong>
                        {animal.name}
                      </strong>

                      <div
                        style={{
                          fontSize: 12,
                          color:
                            '#6b6259',
                          margin:
                            '4px 0',
                        }}
                      >
                        {
                          statusLabel[
                            animal.status
                          ]
                        }{' '}
                        · {animal.zone}
                      </div>

                      <button
                        onMouseEnter={() =>
                          prefetchReport(
                            animal.id
                          )
                        }
                        onFocus={() =>
                          prefetchReport(
                            animal.id
                          )
                        }
                        onClick={() =>
                          navigate(
                            'detail',
                            animal.id
                          )
                        }
                        style={{
                          width: '100%',
                          padding:
                            '6px 0',
                          background:
                            '#C05B3A',
                          color:
                            'white',
                          border: 'none',
                          borderRadius: 8,
                          fontSize: 13,
                          fontWeight: 600,
                          cursor:
                            'pointer',
                        }}
                      >
                        Ver reporte
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}