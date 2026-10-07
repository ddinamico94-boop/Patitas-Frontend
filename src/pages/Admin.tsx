import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { reports, statusLabel, statusColor } from '../data/mock';
import type { NavigateFn } from '../types/navigation';
import SEO from '../components/SEO';

type QuirofanoMovil = {
  id: string;
  nombre: string;
  direccion: string;
  barrio: string | null;
  lat: number;
  lng: number;
  fechaInicio: string;
  fechaFin: string;
  horario: string | null;
  informacion: string | null;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
};

type QuirofanoForm = {
  nombre: string;
  direccion: string;
  barrio: string;
  lat: string;
  lng: string;
  fechaInicio: string;
  fechaFin: string;
  horario: string;
  informacion: string;
  activo: boolean;
};

const sidebarItems = [
  { icon: '📊', label: 'Dashboard', id: 'dashboard' },
  { icon: '📋', label: 'Reportes', id: 'reports' },
  { icon: '👥', label: 'Usuarios', id: 'users' },
  { icon: '🗺️', label: 'Mapa', id: 'map' },
  { icon: '🚐', label: 'Quirófano Móvil', id: 'quirofano' },
  { icon: '📈', label: 'Estadísticas', id: 'stats' },
  { icon: '⚙️', label: 'Configuración', id: 'config' },
];

const kpis = [
  { label: 'Total reportes', value: '1.247', change: '+12%', up: true, icon: '📋' },
  { label: 'Reportes pendientes', value: '89', change: '+5', up: false, icon: '⏳' },
  { label: 'Animales ayudados', value: '643', change: '+23%', up: true, icon: '❤️' },
  { label: 'Rescatados', value: '312', change: '+8%', up: true, icon: '🏠' },
];

const monthlyData = [
  { month: 'Mar', reports: 45 },
  { month: 'Abr', reports: 62 },
  { month: 'May', reports: 78 },
  { month: 'Jun', reports: 55 },
  { month: 'Jul', reports: 90 },
  { month: 'Ago', reports: 110 },
  { month: 'Sep', reports: 89 },
];

const zoneData = [
  { zone: 'Yerba Buena', count: 234 },
  { zone: 'Centro', count: 198 },
  { zone: 'Las Talitas', count: 156 },
  { zone: 'El Manantial', count: 122 },
  { zone: 'Villa 9 de Julio', count: 98 },
];

const maxMonth = Math.max(...monthlyData.map((d) => d.reports));
const maxZone = Math.max(...zoneData.map((d) => d.count));

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:4000';

const emptyForm: QuirofanoForm = {
  nombre: 'Quirófano Móvil',
  direccion: '',
  barrio: '',
  lat: '',
  lng: '',
  fechaInicio: '',
  fechaFin: '',
  horario: '',
  informacion: '',
  activo: true,
};

function formatDate(date: string) {
  if (!date) return '-';

  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short',
  }).format(new Date(date));
}

function getDateInputValue(date: string) {
  if (!date) return '';

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function QuirofanoMapPicker({
  lat,
  lng,
  onChange,
}: {
  lat: string;
  lng: string;
  onChange: (lat: string, lng: string) => void;
}) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.CircleMarker | null>(null);

  const defaultLat = -26.8083;
  const defaultLng = -65.2176;

 useEffect(() => {
  if (!mapContainerRef.current || mapRef.current) return;

  const initialLat = Number(lat) || defaultLat;
  const initialLng = Number(lng) || defaultLng;

  const map = L.map(mapContainerRef.current, {
    center: [initialLat, initialLng],
    zoom: 13,
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map);

  map.on('click', (event) => {
    const newLat = event.latlng.lat;
    const newLng = event.latlng.lng;

    onChange(newLat.toFixed(6), newLng.toFixed(6));
  });

  mapRef.current = map;

  setTimeout(() => {
    map.invalidateSize();
  }, 300);

  return () => {
    map.remove();
    mapRef.current = null;
    markerRef.current = null;
  };
}, []);

  useEffect(() => {
    const map = mapRef.current;

    if (!map) return;

    const currentLat = Number(lat);
    const currentLng = Number(lng);

    if (!Number.isFinite(currentLat) || !Number.isFinite(currentLng)) {
      return;
    }

    if (
      currentLat < -90 ||
      currentLat > 90 ||
      currentLng < -180 ||
      currentLng > 180
    ) {
      return;
    }

    const position: L.LatLngExpression = [currentLat, currentLng];

    if (!markerRef.current) {
      markerRef.current = L.circleMarker(position, {
        radius: 9,
        weight: 3,
        fillOpacity: 0.8,
      }).addTo(map);
    } else {
      markerRef.current.setLatLng(position);
    }

    map.setView(position, Math.max(map.getZoom(), 14));
  }, [lat, lng]);

  return (
    <div className="space-y-2">
      <div
        ref={mapContainerRef}
        className="w-full h-80 rounded-2xl overflow-hidden border border-border"
      />

      <p className="text-xs text-warm-mid">
        📍 Hacé clic en el mapa para seleccionar la ubicación del quirófano.
      </p>

      {lat && lng && (
        <div className="text-xs bg-warm rounded-lg px-3 py-2 text-dark">
          <strong>Ubicación seleccionada:</strong> {lat}, {lng}
        </div>
      )}
    </div>
  );
}

export default function Admin({ navigate }: { navigate: NavigateFn }) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [quirofanos, setQuirofanos] = useState<QuirofanoMovil[]>([]);
  const [loadingQuirofanos, setLoadingQuirofanos] = useState(false);
  const [savingQuirofano, setSavingQuirofano] = useState(false);
  const [quirofanoError, setQuirofanoError] = useState('');
  const [quirofanoSuccess, setQuirofanoSuccess] = useState('');

  const [showQuirofanoForm, setShowQuirofanoForm] = useState(false);
  const [editingQuirofanoId, setEditingQuirofanoId] = useState<string | null>(null);

  const [form, setForm] = useState<QuirofanoForm>(emptyForm);

  const recentReports = reports.slice(0, 6);

  async function loadQuirofanos() {
    try {
      setLoadingQuirofanos(true);
      setQuirofanoError('');

      const response = await fetch(`${API_BASE_URL}/api/quirofano`);

      if (!response.ok) {
        throw new Error('No se pudieron obtener los quirófanos móviles.');
      }

      const data = await response.json();

      setQuirofanos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);

      setQuirofanoError(
        'No se pudieron cargar los quirófanos móviles. Verificá que el backend esté funcionando.'
      );
    } finally {
      setLoadingQuirofanos(false);
    }
  }

  useEffect(() => {
    if (activeSection === 'quirofano') {
      loadQuirofanos();
    }
  }, [activeSection]);

  function resetQuirofanoForm() {
    setForm(emptyForm);
    setEditingQuirofanoId(null);
    setShowQuirofanoForm(false);
    setQuirofanoError('');
    setQuirofanoSuccess('');
  }

  function openNewQuirofanoForm() {
    setForm(emptyForm);
    setEditingQuirofanoId(null);
    setShowQuirofanoForm(true);
    setQuirofanoError('');
    setQuirofanoSuccess('');
  }

  function editQuirofano(quirofano: QuirofanoMovil) {
    setForm({
      nombre: quirofano.nombre || 'Quirófano Móvil',
      direccion: quirofano.direccion || '',
      barrio: quirofano.barrio || '',
      lat: String(quirofano.lat),
      lng: String(quirofano.lng),
      fechaInicio: getDateInputValue(quirofano.fechaInicio),
      fechaFin: getDateInputValue(quirofano.fechaFin),
      horario: quirofano.horario || '',
      informacion: quirofano.informacion || '',
      activo: quirofano.activo,
    });

    setEditingQuirofanoId(quirofano.id);
    setShowQuirofanoForm(true);
    setQuirofanoError('');
    setQuirofanoSuccess('');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  async function saveQuirofano(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setQuirofanoError('');
    setQuirofanoSuccess('');

    if (!form.direccion.trim()) {
      setQuirofanoError('La dirección es obligatoria.');
      return;
    }

    if (!form.lat || !form.lng) {
      setQuirofanoError('La latitud y longitud son obligatorias.');
      return;
    }

    if (!form.fechaInicio || !form.fechaFin) {
      setQuirofanoError('Las fechas de inicio y finalización son obligatorias.');
      return;
    }

    const lat = Number(form.lat);
    const lng = Number(form.lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      setQuirofanoError('La latitud y longitud deben ser números válidos.');
      return;
    }

    if (lat < -90 || lat > 90) {
      setQuirofanoError('La latitud debe estar entre -90 y 90.');
      return;
    }

    if (lng < -180 || lng > 180) {
      setQuirofanoError('La longitud debe estar entre -180 y 180.');
      return;
    }

    if (form.fechaFin < form.fechaInicio) {
      setQuirofanoError(
        'La fecha de finalización no puede ser anterior a la fecha de inicio.'
      );
      return;
    }

    try {
      setSavingQuirofano(true);

      const payload = {
        nombre: form.nombre.trim() || 'Quirófano Móvil',
        direccion: form.direccion.trim(),
        barrio: form.barrio.trim() || null,
        lat,
        lng,
        fechaInicio: `${form.fechaInicio}T00:00:00.000Z`,
        fechaFin: `${form.fechaFin}T23:59:59.000Z`,
        horario: form.horario.trim() || null,
        informacion: form.informacion.trim() || null,
        activo: form.activo,
      };

      const url = editingQuirofanoId
        ? `${API_BASE_URL}/api/quirofano/${editingQuirofanoId}`
        : `${API_BASE_URL}/api/quirofano`;

      const response = await fetch(url, {
        method: editingQuirofanoId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || 'No se pudo guardar el quirófano móvil.'
        );
      }

      setQuirofanoSuccess(
        editingQuirofanoId
          ? 'Quirófano móvil actualizado correctamente.'
          : 'Quirófano móvil creado correctamente.'
      );

      setShowQuirofanoForm(false);
      setEditingQuirofanoId(null);
      setForm(emptyForm);

      await loadQuirofanos();
    } catch (error) {
      console.error(error);

      setQuirofanoError(
        error instanceof Error
          ? error.message
          : 'No se pudo guardar el quirófano móvil.'
      );
    } finally {
      setSavingQuirofano(false);
    }
  }

  async function toggleQuirofano(quirofano: QuirofanoMovil) {
    try {
      setQuirofanoError('');
      setQuirofanoSuccess('');

      const response = await fetch(
        `${API_BASE_URL}/api/quirofano/${quirofano.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            activo: !quirofano.activo,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || 'No se pudo cambiar el estado.'
        );
      }

      setQuirofanoSuccess(
        !quirofano.activo
          ? 'Quirófano móvil activado.'
          : 'Quirófano móvil desactivado.'
      );

      await loadQuirofanos();
    } catch (error) {
      console.error(error);

      setQuirofanoError(
        error instanceof Error
          ? error.message
          : 'No se pudo cambiar el estado.'
      );
    }
  }

  async function deleteQuirofano(quirofano: QuirofanoMovil) {
    const confirmar = window.confirm(
      `¿Seguro que querés eliminar "${quirofano.nombre}"?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmar) return;

    try {
      setQuirofanoError('');
      setQuirofanoSuccess('');

      const response = await fetch(
        `${API_BASE_URL}/api/quirofano/${quirofano.id}`,
        {
          method: 'DELETE',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || 'No se pudo eliminar el quirófano móvil.'
        );
      }

      setQuirofanoSuccess('Quirófano móvil eliminado correctamente.');

      await loadQuirofanos();
    } catch (error) {
      console.error(error);

      setQuirofanoError(
        error instanceof Error
          ? error.message
          : 'No se pudo eliminar el quirófano móvil.'
      );
    }
  }

  function renderDashboard() {
    return (
      <div className="p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((k) => (
            <div
              key={k.label}
              className="bg-white rounded-2xl p-5 border border-border"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{k.icon}</span>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    k.up
                      ? 'bg-green-50 text-green-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {k.change}
                </span>
              </div>

              <p className="font-display text-3xl font-semibold text-dark mb-1">
                {k.value}
              </p>

              <p className="text-xs text-warm-mid">{k.label}</p>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-6 border border-border">
            <h3 className="font-display text-lg font-semibold text-dark mb-5">
              Reportes por mes
            </h3>

            <div className="flex items-end gap-2 h-36">
              {monthlyData.map((d) => (
                <div
                  key={d.month}
                  className="flex-1 flex flex-col items-center gap-1.5"
                >
                  <span className="text-xs text-warm-mid font-medium">
                    {d.reports}
                  </span>

                  <div
                    className="w-full rounded-t-lg bg-terra/80 hover:bg-terra transition-colors cursor-pointer"
                    style={{
                      height: `${(d.reports / maxMonth) * 90}%`,
                    }}
                  />

                  <span className="text-xs text-warm-mid">{d.month}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-border">
            <h3 className="font-display text-lg font-semibold text-dark mb-5">
              Reportes por zona
            </h3>

            <div className="space-y-3">
              {zoneData.map((d) => (
                <div key={d.zone}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-dark font-medium">{d.zone}</span>
                    <span className="text-warm-mid">{d.count}</span>
                  </div>

                  <div className="h-2 bg-warm rounded-full overflow-hidden">
                    <div
                      className="h-full bg-terra rounded-full transition-all duration-500"
                      style={{
                        width: `${(d.count / maxZone) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Status donut */}
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-6 border border-border">
            <h3 className="font-display text-lg font-semibold text-dark mb-4">
              Estado de animales
            </h3>

            <div className="space-y-3">
              {[
                { label: 'Perdidos', value: 38, color: '#EF4444' },
                { label: 'Encontrados', value: 22, color: '#3B82F6' },
                {
                  label: 'En situación de calle',
                  value: 18,
                  color: '#F59E0B',
                },
                { label: 'Ayudados', value: 14, color: '#22C55E' },
                { label: 'Rescatados', value: 8, color: '#8B5CF6' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: item.color }}
                  />

                  <div className="flex-1">
                    <div className="h-1.5 bg-warm rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${item.value}%`,
                          background: item.color,
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-warm-mid">
                      {item.label}
                    </span>

                    <span className="text-xs font-semibold text-dark">
                      {item.value}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-border">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-lg font-semibold text-dark">
                Reportes recientes
              </h3>

              <button className="text-xs text-terra font-medium hover:underline">
                Ver todos
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-xs text-warm-mid font-medium pb-3">
                      Animal
                    </th>
                    <th className="text-left py-2 text-xs text-warm-mid font-medium pb-3">
                      Zona
                    </th>
                    <th className="text-left py-2 text-xs text-warm-mid font-medium pb-3">
                      Estado
                    </th>
                    <th className="text-left py-2 text-xs text-warm-mid font-medium pb-3">
                      Fecha
                    </th>
                    <th className="text-right py-2 text-xs text-warm-mid font-medium pb-3">
                      Acción
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border">
                  {recentReports.map((r) => (
                    <tr
                      key={r.id}
                      className="hover:bg-warm/50 transition-colors"
                    >
                      <td className="py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg overflow-hidden bg-warm shrink-0">
                            <img
                              src={r.imageUrl}
                              alt={r.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div>
                            <p className="font-medium text-dark text-xs">
                              {r.name}
                            </p>
                            <p className="text-warm-mid text-xs">
                              {r.breed}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 text-xs text-warm-mid">
                        {r.zone}
                      </td>

                      <td className="py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${statusColor[r.status]}`}
                        >
                          {statusLabel[r.status]}
                        </span>
                      </td>

                      <td className="py-3 text-xs text-warm-mid">
                        {r.date}
                      </td>

                      <td className="py-3 text-right">
                        <button
                          onClick={() => navigate('detail', r.id)}
                          className="text-xs text-terra font-medium hover:underline"
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderQuirofano() {
    return (
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold text-dark">
              Quirófano Móvil
            </h2>

            <p className="text-sm text-warm-mid mt-1">
              Administrá las ubicaciones donde se realizan castraciones
              gratuitas.
            </p>
          </div>

          <button
            onClick={openNewQuirofanoForm}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-terra text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <span className="text-lg">+</span>
            Agregar ubicación
          </button>
        </div>

        {quirofanoError && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            {quirofanoError}
          </div>
        )}

        {quirofanoSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
            {quirofanoSuccess}
          </div>
        )}

        {showQuirofanoForm && (
          <form
            onSubmit={saveQuirofano}
            className="bg-white rounded-2xl border border-border p-6 space-y-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-semibold text-dark">
                  {editingQuirofanoId
                    ? 'Editar ubicación'
                    : 'Nueva ubicación'}
                </h3>

                <p className="text-xs text-warm-mid mt-1">
                  Completá los datos de la jornada del quirófano móvil.
                </p>
              </div>

              <button
                type="button"
                onClick={resetQuirofanoForm}
                className="text-sm text-warm-mid hover:text-dark"
              >
                Cancelar
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-dark mb-1.5">
                  Nombre
                </label>

                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      nombre: e.target.value,
                    }))
                  }
                  placeholder="Quirófano Móvil"
                  className="w-full rounded-xl border border-border px-3.5 py-2.5 text-sm outline-none focus:border-terra"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-dark mb-1.5">
                  Barrio
                </label>

                <input
                  type="text"
                  value={form.barrio}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      barrio: e.target.value,
                    }))
                  }
                  placeholder="Ej. Centro"
                  className="w-full rounded-xl border border-border px-3.5 py-2.5 text-sm outline-none focus:border-terra"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-dark mb-1.5">
                Dirección *
              </label>

              <input
                type="text"
                required
                value={form.direccion}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    direccion: e.target.value,
                  }))
                }
                placeholder="Ej. San Martín 1234"
                className="w-full rounded-xl border border-border px-3.5 py-2.5 text-sm outline-none focus:border-terra"
              />
            </div>

            <div>
              <div className="mb-2">
                <h4 className="text-sm font-semibold text-dark">
                  Ubicación en el mapa
                </h4>

                <p className="text-xs text-warm-mid mt-1">
                  Seleccioná directamente en el mapa dónde estará el quirófano móvil.
                </p>
              </div>

              <QuirofanoMapPicker
                lat={form.lat}
                lng={form.lng}
                onChange={(newLat, newLng) => {
                  setForm((current) => ({
                    ...current,
                    lat: newLat,
                    lng: newLng,
                  }));
                }}
              />

              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-medium text-dark mb-1.5">
                    Latitud
                  </label>

                  <input
                    type="number"
                    step="any"
                    value={form.lat}
                    onChange={(e) =>
                      setForm((current) => ({
                        ...current,
                        lat: e.target.value,
                      }))
                    }
                    placeholder="-26.8083"
                    className="w-full rounded-xl border border-border px-3.5 py-2.5 text-sm outline-none focus:border-terra"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-dark mb-1.5">
                    Longitud
                  </label>

                  <input
                    type="number"
                    step="any"
                    value={form.lng}
                    onChange={(e) =>
                      setForm((current) => ({
                        ...current,
                        lng: e.target.value,
                      }))
                    }
                    placeholder="-65.2176"
                    className="w-full rounded-xl border border-border px-3.5 py-2.5 text-sm outline-none focus:border-terra"
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-dark mb-1.5">
                  Fecha de inicio *
                </label>

                <input
                  type="date"
                  required
                  value={form.fechaInicio}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      fechaInicio: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-border px-3.5 py-2.5 text-sm outline-none focus:border-terra"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-dark mb-1.5">
                  Fecha de finalización *
                </label>

                <input
                  type="date"
                  required
                  value={form.fechaFin}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      fechaFin: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-border px-3.5 py-2.5 text-sm outline-none focus:border-terra"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-dark mb-1.5">
                  Horario
                </label>

                <input
                  type="text"
                  value={form.horario}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      horario: e.target.value,
                    }))
                  }
                  placeholder="Ej. 08:00 a 13:00"
                  className="w-full rounded-xl border border-border px-3.5 py-2.5 text-sm outline-none focus:border-terra"
                />
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input
                  id="quirofano-activo"
                  type="checkbox"
                  checked={form.activo}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      activo: e.target.checked,
                    }))
                  }
                  className="w-4 h-4"
                />

                <label
                  htmlFor="quirofano-activo"
                  className="text-sm text-dark"
                >
                  Mostrar como ubicación activa
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-dark mb-1.5">
                Información
              </label>

              <textarea
                value={form.informacion}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    informacion: e.target.value,
                  }))
                }
                placeholder="Información para los vecinos..."
                rows={4}
                className="w-full rounded-xl border border-border px-3.5 py-2.5 text-sm outline-none focus:border-terra resize-y"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-2">
              <button
                type="button"
                onClick={resetQuirofanoForm}
                className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-dark hover:bg-warm transition-colors"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={savingQuirofano}
                className="px-5 py-2.5 rounded-xl bg-terra text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {savingQuirofano
                  ? 'Guardando...'
                  : editingQuirofanoId
                    ? 'Guardar cambios'
                    : 'Crear ubicación'}
              </button>
            </div>
          </form>
        )}

        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold text-dark">
                Ubicaciones cargadas
              </h3>

              <p className="text-xs text-warm-mid mt-1">
                {quirofanos.length}{' '}
                {quirofanos.length === 1
                  ? 'ubicación registrada'
                  : 'ubicaciones registradas'}
              </p>
            </div>

            <button
              type="button"
              onClick={loadQuirofanos}
              disabled={loadingQuirofanos}
              className="text-xs text-terra font-medium hover:underline disabled:opacity-50"
            >
              {loadingQuirofanos ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>

          {loadingQuirofanos ? (
            <div className="p-10 text-center text-sm text-warm-mid">
              Cargando ubicaciones...
            </div>
          ) : quirofanos.length === 0 ? (
            <div className="p-10 text-center">
              <div className="text-4xl mb-3">🚐</div>

              <h4 className="font-display text-lg font-semibold text-dark">
                No hay ubicaciones cargadas
              </h4>

              <p className="text-sm text-warm-mid mt-1 mb-5">
                Agregá la primera ubicación del quirófano móvil.
              </p>

              <button
                onClick={openNewQuirofanoForm}
                className="px-4 py-2.5 rounded-xl bg-terra text-white text-sm font-medium hover:opacity-90"
              >
                + Agregar ubicación
              </button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {quirofanos.map((quirofano) => (
                <div
                  key={quirofano.id}
                  className="p-5 hover:bg-warm/30 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-terra/10 flex items-center justify-center text-2xl shrink-0">
                        🚐
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-display text-lg font-semibold text-dark">
                            {quirofano.nombre}
                          </h4>

                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              quirofano.activo
                                ? 'bg-green-50 text-green-700'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {quirofano.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>

                        <p className="text-sm text-dark mt-1">
                          📍 {quirofano.direccion}
                        </p>

                        {quirofano.barrio && (
                          <p className="text-xs text-warm-mid mt-1">
                            🏘️ {quirofano.barrio}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-warm-mid">
                          <span>
                            📅 {formatDate(quirofano.fechaInicio)} →{' '}
                            {formatDate(quirofano.fechaFin)}
                          </span>

                          {quirofano.horario && (
                            <span>🕐 {quirofano.horario}</span>
                          )}
                        </div>

                        <p className="text-xs text-warm-mid mt-2">
                          🗺️ {quirofano.lat}, {quirofano.lng}
                        </p>

                        {quirofano.informacion && (
                          <p className="text-sm text-warm-mid mt-3 max-w-2xl">
                            {quirofano.informacion}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      <button
                        type="button"
                        onClick={() => editQuirofano(quirofano)}
                        className="px-3 py-2 rounded-lg border border-border text-xs font-medium text-dark hover:bg-warm transition-colors"
                      >
                        ✏️ Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleQuirofano(quirofano)}
                        className="px-3 py-2 rounded-lg border border-border text-xs font-medium text-dark hover:bg-warm transition-colors"
                      >
                        {quirofano.activo
                          ? '⏸️ Desactivar'
                          : '▶️ Activar'}
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteQuirofano(quirofano)}
                        className="px-3 py-2 rounded-lg border border-red-200 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    );
  }

  function renderPlaceholder(title: string, description: string) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-2xl border border-border p-10 text-center">
          <h2 className="font-display text-2xl font-semibold text-dark">
            {title}
          </h2>

          <p className="text-sm text-warm-mid mt-2">{description}</p>
        </div>
      </div>
    );
  }

  function renderActiveSection() {
    switch (activeSection) {
      case 'quirofano':
        return renderQuirofano();

      case 'reports':
        return renderPlaceholder(
          'Reportes',
          'La administración de reportes continuará disponible desde esta sección.'
        );

      case 'users':
        return renderPlaceholder(
          'Usuarios',
          'La administración de usuarios continuará disponible desde esta sección.'
        );

      case 'map':
        return renderPlaceholder(
          'Mapa',
          'El mapa general continuará disponible desde esta sección.'
        );

      case 'stats':
        return renderPlaceholder(
          'Estadísticas',
          'Las estadísticas continuarán disponibles desde esta sección.'
        );

      case 'config':
        return renderPlaceholder(
          'Configuración',
          'La configuración continuará disponible desde esta sección.'
        );

      case 'dashboard':
      default:
        return renderDashboard();
    }
  }

  return (
    <div
      className="bg-cream min-h-full flex"
      style={{ height: 'calc(100vh - 64px)' }}
    >
      <SEO
        title="Administración | Patitas Tucumán"
        description="Panel de administración de Patitas Tucumán."
        path="/admin"
        noIndex
      />

      {/* Sidebar overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-dark/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:relative z-30 h-full w-64 bg-dark text-white flex flex-col transition-transform duration-300 shrink-0`}
      >
        <div className="p-5 border-b border-white/10">
          <p className="text-xs text-white/50 uppercase tracking-widest font-medium">
            Panel Admin
          </p>

          <p className="font-display text-lg font-semibold mt-1">
            Patitas Tucumán
          </p>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeSection === item.id
                  ? 'bg-white/15 text-white'
                  : 'text-white/60 hover:bg-white/8 hover:text-white'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => navigate('home')}
            className="w-full py-2.5 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/8 transition-colors"
          >
            ← Volver al sitio
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div className="bg-white border-b border-border sticky top-0 z-10">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-1.5 rounded-lg text-dark hover:bg-warm transition-colors"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M3 12h18M3 6h18M3 18h18" />
                </svg>
              </button>

              <div>
                <h1 className="font-display text-xl font-semibold text-dark">
                  {activeSection === 'quirofano'
                    ? 'Gestión del Quirófano Móvil'
                    : 'Resumen de Patitas Tucumán'}
                </h1>

                <p className="text-xs text-warm-mid">
                  {activeSection === 'quirofano'
                    ? 'Ubicaciones y jornadas de castraciones'
                    : 'Panel de administración'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-terra/15 text-terra flex items-center justify-center text-sm font-bold">
                A
              </div>
            </div>
          </div>
        </div>

        {renderActiveSection()}
      </div>
    </div>
  );
}