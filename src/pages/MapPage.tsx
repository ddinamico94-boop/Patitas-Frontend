import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { statusLabel, statusColor, statusDot, AnimalStatus, NavigateFn } from '../data/mock';
import { listReports, AnimalReport } from '../lib/api';

const filterOptions: { label: string; value: AnimalStatus | 'todos' }[] = [
  { label: 'Todos', value: 'todos' },
  { label: 'Perdidos', value: 'perdido' },
  { label: 'Encontrados', value: 'encontrado' },
  { label: 'En calle', value: 'en_calle' },
  { label: 'Rescatados', value: 'rescatado' },
];

// Centro aproximado de San Miguel de Tucumán
const TUCUMAN_CENTER: [number, number] = [-26.8241, -65.2226];

function makeIcon(color: string) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width: 28px; height: 28px; border-radius: 9999px;
      background: ${color}; border: 2px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.35);
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
}

function FlyToSelected({ animal }: { animal: AnimalReport | null }) {
  const map = useMap();
  if (animal) {
    map.flyTo([animal.lat, animal.lng], 14, { duration: 0.6 });
  }
  return null;
}

export default function MapPage({ navigate }: { navigate: NavigateFn }) {
  const [allReports, setAllReports] = useState<AnimalReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AnimalReport | null>(null);
  const [activeFilter, setActiveFilter] = useState<AnimalStatus | 'todos'>('todos');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    listReports({ pageSize: 50 })
      .then((data) => {
        if (active) setAllReports(data.items);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'No se pudieron cargar los reportes.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // Solo se pueden ubicar en el mapa los reportes que tienen coordenadas reales
  // (el usuario tocó "Usar mi ubicación actual" al crearlos). El resto no aparece.
  const withCoords = allReports.filter((r) => r.lat !== 0 || r.lng !== 0);
  const visible = withCoords.filter((r) => activeFilter === 'todos' || r.status === activeFilter);

  return (
    <div className="bg-cream" style={{ height: 'calc(100vh - 64px)' }}>
      <div className="h-full flex">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 absolute lg:relative z-30 h-full w-80 bg-white border-r border-border flex flex-col transition-transform duration-300`}>
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-lg font-semibold text-dark">Mapa de reportes</h2>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-warm-mid">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-warm-mid mb-3">Explorá los reportes de animales en Tucumán.</p>
            <div className="flex gap-1.5 flex-wrap">
              {filterOptions.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setActiveFilter(f.value)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border ${
                    activeFilter === f.value
                      ? 'bg-terra text-white border-terra'
                      : 'bg-white text-dark border-border hover:border-terra hover:text-terra'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <p className="text-sm text-warm-mid p-4">Cargando reportes...</p>
            ) : error ? (
              <p className="text-sm text-red-600 p-4">{error}</p>
            ) : visible.length === 0 ? (
              <p className="text-sm text-warm-mid p-4">
                No hay reportes con ubicación para mostrar. Para que un reporte aparezca acá, hay que crearlo usando "Usar mi ubicación actual".
              </p>
            ) : (
              visible.map((animal) => (
                <button
                  key={animal.id}
                  onClick={() => setSelected(animal)}
                  className={`w-full text-left p-4 border-b border-border hover:bg-warm transition-colors flex gap-3 items-start ${selected?.id === animal.id ? 'bg-warm' : ''}`}
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-cream shrink-0">
                    {animal.imageUrl ? (
                      <img src={animal.imageUrl} alt={animal.name} className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="font-semibold text-dark text-sm truncate">{animal.name}</span>
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: statusDot[animal.status] }} />
                    </div>
                    <p className="text-xs text-warm-mid">{statusLabel[animal.status]}</p>
                    <p className="text-xs text-warm-mid truncate">{animal.zone}</p>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="p-4 border-t border-border">
            <div className="grid grid-cols-2 gap-2 text-xs text-warm-mid">
              {(['perdido', 'encontrado', 'en_calle', 'rescatado'] as AnimalStatus[]).map((s) => (
                <div key={s} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: statusDot[s] }} />
                  {statusLabel[s]}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Map area */}
        <div className="flex-1 relative">
          {/* Mobile sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden absolute top-4 left-4 z-[1000] bg-white shadow-lg rounded-xl px-3 py-2 text-sm font-medium text-dark flex items-center gap-2 border border-border"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
            Ver lista
          </button>

          {/* Count badge */}
          <div className="absolute top-4 right-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 text-xs font-medium text-dark border border-border shadow">
            {visible.length} reportes activos
          </div>

          <MapContainer
            center={TUCUMAN_CENTER}
            zoom={12}
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FlyToSelected animal={selected} />

            {visible.map((animal) => (
              <Marker
                key={animal.id}
                position={[animal.lat, animal.lng]}
                icon={makeIcon(statusDot[animal.status])}
                eventHandlers={{ click: () => setSelected(animal) }}
              >
                <Popup>
                  <div style={{ width: 200 }}>
                    {animal.imageUrl && (
                      <img
                        src={animal.imageUrl}
                        alt={animal.name}
                        style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }}
                      />
                    )}
                    <strong>{animal.name}</strong>
                    <div style={{ fontSize: 12, color: '#6b6259', margin: '4px 0' }}>
                      {statusLabel[animal.status]} · {animal.zone}
                    </div>
                    <button
                      onClick={() => navigate('detail', animal.id)}
                      style={{
                        width: '100%', padding: '6px 0', background: '#C05B3A', color: 'white',
                        border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      Ver reporte
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}