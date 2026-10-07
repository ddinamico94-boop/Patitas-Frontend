import { useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import { statusLabel } from '../data/mock';
import type { NavigateFn } from '../types/navigation';
import SEO from '../components/SEO';
import { getSession } from '../lib/api';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

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

type AdminStats = {
  kpis: {
    total: number;
    pending: number;
    helped: number;
    rescued: number;
    users: number;
  };
  byStatus: {
    status: string;
    count: number;
  }[];
  byMonth: {
    month: string;
    reports: number;
  }[];
  byZone: {
    zone: string;
    count: number;
  }[];
};

type AdminUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  createdAt: string;
  _count: {
    reports: number;
  };
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

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short',
  }).format(parsed);
}

function formatDateTime(date: string) {
  if (!date) return '-';

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(parsed);
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

function getAuthHeaders(): Record<string, string> {
  const session = getSession();

  if (!session?.token) {
    return {};
  }

  return {
    Authorization: `Bearer ${session.token}`,
  };
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
  const markerRef = useRef<L.Marker | null>(null);

  const defaultLat = -26.8083;
  const defaultLng = -65.2176;

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) {
      return;
    }

    const initialLat = Number(lat) || defaultLat;
    const initialLng = Number(lng) || defaultLng;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 13,
    });

    L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 19,
        attribution:
          '&copy; OpenStreetMap contributors',
      }
    ).addTo(map);

    map.on('click', (event) => {
      const newLat = event.latlng.lat;
      const newLng = event.latlng.lng;

      onChange(
        newLat.toFixed(6),
        newLng.toFixed(6)
      );
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

    if (
      !Number.isFinite(currentLat) ||
      !Number.isFinite(currentLng)
    ) {
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

    const position: L.LatLngExpression = [
      currentLat,
      currentLng,
    ];

    if (!markerRef.current) {
      markerRef.current = L.marker(position, {
        icon: new L.Icon.Default(),
      }).addTo(map);

      markerRef.current.bindPopup(
        'Ubicación del Quirófano Móvil'
      );
    } else {
      markerRef.current.setLatLng(position);
    }

    map.setView(
      position,
      Math.max(map.getZoom(), 14)
    );
  }, [lat, lng]);

  return (
    <div className="space-y-2">
      <div
        ref={mapContainerRef}
        className="w-full h-80 rounded-2xl overflow-hidden border border-border"
      />

      <p className="text-xs text-warm-mid">
        Hacé clic en el mapa para seleccionar la ubicación del quirófano.
      </p>

      {lat && lng && (
        <div className="text-xs bg-warm rounded-lg px-3 py-2 text-dark">
          <strong>Ubicación seleccionada:</strong>{' '}
          {lat}, {lng}
        </div>
      )}
    </div>
  );
}

export default function Admin({
  navigate,
}: {
  navigate: NavigateFn;
}) {
  const [activeSection, setActiveSection] =
    useState('dashboard');

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [stats, setStats] =
    useState<AdminStats | null>(null);

  const [loadingStats, setLoadingStats] =
    useState(true);

  const [statsError, setStatsError] =
    useState('');

  const [users, setUsers] =
    useState<AdminUser[]>([]);

  const [loadingUsers, setLoadingUsers] =
    useState(false);

  const [usersError, setUsersError] =
    useState('');

  const [quirofanos, setQuirofanos] =
    useState<QuirofanoMovil[]>([]);

  const [loadingQuirofanos, setLoadingQuirofanos] =
    useState(false);

  const [savingQuirofano, setSavingQuirofano] =
    useState(false);

  const [quirofanoError, setQuirofanoError] =
    useState('');

  const [quirofanoSuccess, setQuirofanoSuccess] =
    useState('');

  const [
    showQuirofanoForm,
    setShowQuirofanoForm,
  ] = useState(false);

  const [
    editingQuirofanoId,
    setEditingQuirofanoId,
  ] = useState<string | null>(null);

  const [form, setForm] =
    useState<QuirofanoForm>(emptyForm);

  const [socketConnected, setSocketConnected] =
    useState(false);

  const socketRef =
    useRef<Socket | null>(null);

  useEffect(() => {
    const session = getSession();

    if (!session?.token) {
      return;
    }

    const socket = io(API_BASE_URL, {
      auth: {
        token: session.token,
      },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log(
        'Socket.IO Admin conectado'
      );

      setSocketConnected(true);
    });

    socket.on('disconnect', () => {
      console.log(
        'Socket.IO Admin desconectado'
      );

      setSocketConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error(
        'Error Socket.IO Admin:',
        error.message
      );

      setSocketConnected(false);
    });

    socket.on(
      'quirofano:created',
      (quirofano: QuirofanoMovil) => {
        setQuirofanos((current) => {
          const exists = current.some(
            (item) =>
              item.id === quirofano.id
          );

          if (exists) {
            return current.map((item) =>
              item.id === quirofano.id
                ? quirofano
                : item
            );
          }

          return [
            ...current,
            quirofano,
          ].sort(
            (a, b) =>
              new Date(
                a.fechaInicio
              ).getTime() -
              new Date(
                b.fechaInicio
              ).getTime()
          );
        });
      }
    );

    socket.on(
      'quirofano:updated',
      (quirofano: QuirofanoMovil) => {
        setQuirofanos((current) =>
          current.map((item) =>
            item.id === quirofano.id
              ? quirofano
              : item
          )
        );
      }
    );

    socket.on(
      'quirofano:deleted',
      ({
        id,
      }: {
        id: string;
      }) => {
        setQuirofanos((current) =>
          current.filter(
            (item) => item.id !== id
          )
        );
      }
    );

    socket.on(
      'admin:stats-updated',
      () => {
        loadStats();
      }
    );

    socket.on(
      'report:created',
      () => {
        loadStats();
      }
    );

    socket.on(
      'report:updated',
      () => {
        loadStats();
      }
    );

    socket.on(
      'report:deleted',
      () => {
        loadStats();
      }
    );

    socket.on(
      'user:created',
      () => {
        loadStats();

        if (activeSection === 'users') {
          loadUsers();
        }
      }
    );

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  async function loadStats() {
    try {
      setStatsError('');

      const response = await fetch(
        `${API_BASE_URL}/api/admin/stats`,
        {
          headers: {
            ...getAuthHeaders(),
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            'No se pudieron obtener las estadísticas.'
        );
      }

      setStats(data);
    } catch (error) {
      console.error(error);

      setStatsError(
        error instanceof Error
          ? error.message
          : 'No se pudieron obtener las estadísticas.'
      );
    } finally {
      setLoadingStats(false);
    }
  }

  useEffect(() => {
    loadStats();
  }, []);

  async function loadUsers() {
    try {
      setLoadingUsers(true);
      setUsersError('');

      const response = await fetch(
        `${API_BASE_URL}/api/admin/users`,
        {
          headers: {
            ...getAuthHeaders(),
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            'No se pudieron obtener los usuarios.'
        );
      }

      setUsers(
        Array.isArray(data?.items)
          ? data.items
          : []
      );
    } catch (error) {
      console.error(error);

      setUsersError(
        error instanceof Error
          ? error.message
          : 'No se pudieron obtener los usuarios.'
      );
    } finally {
      setLoadingUsers(false);
    }
  }

  useEffect(() => {
    if (activeSection === 'users') {
      loadUsers();
    }
  }, [activeSection]);

  async function loadQuirofanos() {
    try {
      setLoadingQuirofanos(true);
      setQuirofanoError('');

      const response = await fetch(
        `${API_BASE_URL}/api/quirofano`
      );

      if (!response.ok) {
        const data =
          await response
            .json()
            .catch(() => ({}));

        throw new Error(
          data?.error ||
            'No se pudieron obtener los quirófanos móviles.'
        );
      }

      const data =
        await response.json();

      setQuirofanos(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(error);

      setQuirofanoError(
        error instanceof Error
          ? error.message
          : 'No se pudieron cargar los quirófanos móviles. Verificá que el backend esté funcionando.'
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

  function editQuirofano(
    quirofano: QuirofanoMovil
  ) {
    setForm({
      nombre:
        quirofano.nombre ||
        'Quirófano Móvil',
      direccion:
        quirofano.direccion || '',
      barrio:
        quirofano.barrio || '',
      lat: String(quirofano.lat),
      lng: String(quirofano.lng),
      fechaInicio:
        getDateInputValue(
          quirofano.fechaInicio
        ),
      fechaFin:
        getDateInputValue(
          quirofano.fechaFin
        ),
      horario:
        quirofano.horario || '',
      informacion:
        quirofano.informacion || '',
      activo:
        quirofano.activo,
    });

    setEditingQuirofanoId(
      quirofano.id
    );

    setShowQuirofanoForm(true);
    setQuirofanoError('');
    setQuirofanoSuccess('');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  async function saveQuirofano(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setQuirofanoError('');
    setQuirofanoSuccess('');

    if (!getSession()?.token) {
      setQuirofanoError(
        'Tu sesión de administrador no está disponible. Volvé a iniciar sesión.'
      );
      return;
    }

    if (!form.direccion.trim()) {
      setQuirofanoError(
        'La dirección es obligatoria.'
      );
      return;
    }

    if (!form.lat || !form.lng) {
      setQuirofanoError(
        'La latitud y longitud son obligatorias.'
      );
      return;
    }

    if (
      !form.fechaInicio ||
      !form.fechaFin
    ) {
      setQuirofanoError(
        'Las fechas de inicio y finalización son obligatorias.'
      );
      return;
    }

    const lat = Number(form.lat);
    const lng = Number(form.lng);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng)
    ) {
      setQuirofanoError(
        'La latitud y longitud deben ser números válidos.'
      );
      return;
    }

    if (lat < -90 || lat > 90) {
      setQuirofanoError(
        'La latitud debe estar entre -90 y 90.'
      );
      return;
    }

    if (
      lng < -180 ||
      lng > 180
    ) {
      setQuirofanoError(
        'La longitud debe estar entre -180 y 180.'
      );
      return;
    }

    if (
      form.fechaFin <
      form.fechaInicio
    ) {
      setQuirofanoError(
        'La fecha de finalización no puede ser anterior a la fecha de inicio.'
      );
      return;
    }

    try {
      setSavingQuirofano(true);

      const payload = {
        nombre:
          form.nombre.trim() ||
          'Quirófano Móvil',

        direccion:
          form.direccion.trim(),

        barrio:
          form.barrio.trim() ||
          null,

        lat,
        lng,

        fechaInicio:
          `${form.fechaInicio}T00:00:00.000Z`,

        fechaFin:
          `${form.fechaFin}T23:59:59.000Z`,

        horario:
          form.horario.trim() ||
          null,

        informacion:
          form.informacion.trim() ||
          null,

        activo:
          form.activo,
      };

      const url =
        editingQuirofanoId
          ? `${API_BASE_URL}/api/quirofano/${editingQuirofanoId}`
          : `${API_BASE_URL}/api/quirofano`;

      const response =
        await fetch(url, {
          method:
            editingQuirofanoId
              ? 'PUT'
              : 'POST',

          headers: {
            'Content-Type':
              'application/json',
            ...getAuthHeaders(),
          },

          body:
            JSON.stringify(
              payload
            ),
        });

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.error ||
            'No se pudo guardar el quirófano móvil.'
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

  async function toggleQuirofano(
    quirofano: QuirofanoMovil
  ) {
    try {
      setQuirofanoError('');
      setQuirofanoSuccess('');

      const response =
        await fetch(
          `${API_BASE_URL}/api/quirofano/${quirofano.id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type':
                'application/json',
              ...getAuthHeaders(),
            },
            body: JSON.stringify({
              activo:
                !quirofano.activo,
            }),
          }
        );

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.error ||
            'No se pudo cambiar el estado.'
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

  async function deleteQuirofano(
    quirofano: QuirofanoMovil
  ) {
    const confirmar =
      window.confirm(
        `¿Seguro que querés eliminar "${quirofano.nombre}"?\n\nEsta acción no se puede deshacer.`
      );

    if (!confirmar) {
      return;
    }

    try {
      setQuirofanoError('');
      setQuirofanoSuccess('');

      const response =
        await fetch(
          `${API_BASE_URL}/api/quirofano/${quirofano.id}`,
          {
            method: 'DELETE',
            headers: {
              ...getAuthHeaders(),
            },
          }
        );

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.error ||
            'No se pudo eliminar el quirófano móvil.'
        );
      }

      setQuirofanoSuccess(
        'Quirófano móvil eliminado correctamente.'
      );

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
    const kpis = stats?.kpis ?? {
      total: 0,
      pending: 0,
      helped: 0,
      rescued: 0,
      users: 0,
    };

    const monthlyData =
      stats?.byMonth ?? [];

    const zoneData =
      stats?.byZone ?? [];

    const maxMonth =
      monthlyData.length > 0
        ? Math.max(
            ...monthlyData.map(
              (item) =>
                item.reports
            )
          )
        : 1;

    const maxZone =
      zoneData.length > 0
        ? Math.max(
            ...zoneData.map(
              (item) =>
                item.count
            )
          )
        : 1;

    const statusData =
      stats?.byStatus ?? [];

    const statusTotal =
      statusData.reduce(
        (sum, item) =>
          sum + item.count,
        0
      );

    return (
      <div className="p-6 space-y-6">
        {statsError && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            {statsError}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-warm-mid">
              Datos en tiempo real
            </p>

            <p className="text-sm font-medium text-dark mt-1">
              {socketConnected
                ? 'Conectado'
                : 'Conectando...'}
            </p>
          </div>

          <button
            type="button"
            onClick={loadStats}
            disabled={loadingStats}
            className="text-xs text-terra font-medium hover:underline disabled:opacity-50"
          >
            {loadingStats
              ? 'Actualizando...'
              : 'Actualizar datos'}
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Total reportes',
              value: kpis.total,
              icon: '📋',
            },
            {
              label: 'Reportes pendientes',
              value: kpis.pending,
              icon: '⏳',
            },
            {
              label: 'Animales ayudados',
              value: kpis.helped,
              icon: '❤️',
            },
            {
              label: 'Rescatados',
              value: kpis.rescued,
              icon: '🏠',
            },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white rounded-2xl p-5 border border-border"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">
                  {item.icon}
                </span>
              </div>

              <p className="font-display text-3xl font-semibold text-dark mb-1">
                {loadingStats
                  ? '...'
                  : item.value.toLocaleString(
                      'es-AR'
                    )}
              </p>

              <p className="text-xs text-warm-mid">
                {item.label}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold text-dark">
                Usuarios registrados
              </h3>

              <p className="text-xs text-warm-mid mt-1">
                Cantidad actual en PostgreSQL
              </p>
            </div>

            <p className="font-display text-3xl font-semibold text-dark">
              {loadingStats
                ? '...'
                : kpis.users.toLocaleString(
                    'es-AR'
                  )}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-6 border border-border">
            <h3 className="font-display text-lg font-semibold text-dark mb-5">
              Reportes por mes
            </h3>

            {monthlyData.length === 0 ? (
              <p className="text-sm text-warm-mid">
                Todavía no hay datos suficientes.
              </p>
            ) : (
              <div className="flex items-end gap-2 h-36">
                {monthlyData.map(
                  (item) => (
                    <div
                      key={item.month}
                      className="flex-1 flex flex-col items-center gap-1.5"
                    >
                      <span className="text-xs text-warm-mid font-medium">
                        {item.reports}
                      </span>

                      <div
                        className="w-full rounded-t-lg bg-terra/80"
                        style={{
                          height: `${
                            (item.reports /
                              maxMonth) *
                            90
                          }%`,
                        }}
                      />

                      <span className="text-xs text-warm-mid">
                        {item.month}
                      </span>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 border border-border">
            <h3 className="font-display text-lg font-semibold text-dark mb-5">
              Reportes por zona
            </h3>

            {zoneData.length === 0 ? (
              <p className="text-sm text-warm-mid">
                Todavía no hay datos.
              </p>
            ) : (
              <div className="space-y-3">
                {zoneData.map(
                  (item) => (
                    <div
                      key={item.zone}
                    >
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-dark font-medium">
                          {item.zone}
                        </span>

                        <span className="text-warm-mid">
                          {item.count}
                        </span>
                      </div>

                      <div className="h-2 bg-warm rounded-full overflow-hidden">
                        <div
                          className="h-full bg-terra rounded-full"
                          style={{
                            width: `${
                              (item.count /
                                maxZone) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-border">
          <h3 className="font-display text-lg font-semibold text-dark mb-5">
            Estado de los reportes
          </h3>

          {statusData.length === 0 ? (
            <p className="text-sm text-warm-mid">
              Todavía no hay reportes registrados.
            </p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {statusData.map(
                (item) => {
                  const percentage =
                    statusTotal > 0
                      ? Math.round(
                          (item.count /
                            statusTotal) *
                            100
                        )
                      : 0;

                  return (
                    <div
                      key={item.status}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-dark">
                          {statusLabel[
                            item.status as keyof typeof statusLabel
                          ] ||
                            item.status}
                        </span>

                        <span className="text-xs text-warm-mid">
                          {item.count} (
                          {percentage}%)
                        </span>
                      </div>

                      <div className="h-2 bg-warm rounded-full overflow-hidden">
                        <div
                          className="h-full bg-terra rounded-full"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-border">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display text-lg font-semibold text-dark">
                Reportes
              </h3>

              <p className="text-xs text-warm-mid mt-1">
                El total mostrado arriba se obtiene directamente de PostgreSQL.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setActiveSection(
                  'reports'
                )
              }
              className="text-xs text-terra font-medium hover:underline"
            >
              Ver administración
            </button>
          </div>

          <div className="text-sm text-warm-mid">
            Para evitar mostrar información ficticia, los reportes recientes se incorporarán desde la API real en la sección Reportes.
          </div>
        </div>
      </div>
    );
  }

  function renderUsers() {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold text-dark">
              Usuarios
            </h2>

            <p className="text-sm text-warm-mid mt-1">
              Usuarios registrados actualmente en el sistema.
            </p>
          </div>

          <button
            type="button"
            onClick={loadUsers}
            disabled={loadingUsers}
            className="text-xs text-terra font-medium hover:underline disabled:opacity-50"
          >
            {loadingUsers
              ? 'Actualizando...'
              : 'Actualizar'}
          </button>
        </div>

        {usersError && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            {usersError}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          {loadingUsers ? (
            <div className="p-10 text-center text-sm text-warm-mid">
              Cargando usuarios...
            </div>
          ) : users.length === 0 ? (
            <div className="p-10 text-center text-sm text-warm-mid">
              No hay usuarios registrados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-5 py-3 text-xs text-warm-mid font-medium">
                      Usuario
                    </th>

                    <th className="text-left px-5 py-3 text-xs text-warm-mid font-medium">
                      Email
                    </th>

                    <th className="text-left px-5 py-3 text-xs text-warm-mid font-medium">
                      Teléfono
                    </th>

                    <th className="text-left px-5 py-3 text-xs text-warm-mid font-medium">
                      Rol
                    </th>

                    <th className="text-left px-5 py-3 text-xs text-warm-mid font-medium">
                      Reportes
                    </th>

                    <th className="text-left px-5 py-3 text-xs text-warm-mid font-medium">
                      Registro
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border">
                  {users.map(
                    (user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-warm/30"
                      >
                        <td className="px-5 py-4">
                          <p className="font-medium text-dark">
                            {user.name}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-warm-mid">
                          {user.email}
                        </td>

                        <td className="px-5 py-4 text-warm-mid">
                          {user.phone ||
                            '-'}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              user.role ===
                              'ADMIN'
                                ? 'bg-terra/10 text-terra'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-dark font-medium">
                          {
                            user._count
                              .reports
                          }
                        </td>

                        <td className="px-5 py-4 text-warm-mid text-xs">
                          {formatDateTime(
                            user.createdAt
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
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
              Administrá las ubicaciones donde se realizan castraciones gratuitas.
            </p>
          </div>

          <button
            onClick={
              openNewQuirofanoForm
            }
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-terra text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <span className="text-lg">
              +
            </span>

            Agregar ubicación
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              socketConnected
                ? 'bg-green-500'
                : 'bg-amber-500'
            }`}
          />

          <span className="text-warm-mid">
            {socketConnected
              ? 'Actualización en tiempo real activa'
              : 'Conectando actualización en tiempo real...'}
          </span>
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
            onSubmit={
              saveQuirofano
            }
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
                onClick={
                  resetQuirofanoForm
                }
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
                    setForm(
                      (
                        current
                      ) => ({
                        ...current,
                        nombre:
                          e.target
                            .value,
                      })
                    )
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
                    setForm(
                      (
                        current
                      ) => ({
                        ...current,
                        barrio:
                          e.target
                            .value,
                      })
                    )
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
                  setForm(
                    (current) => ({
                      ...current,
                      direccion:
                        e.target
                          .value,
                    })
                  )
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
                onChange={(
                  newLat,
                  newLng
                ) => {
                  setForm(
                    (current) => ({
                      ...current,
                      lat: newLat,
                      lng: newLng,
                    })
                  );
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
                      setForm(
                        (
                          current
                        ) => ({
                          ...current,
                          lat: e.target
                            .value,
                        })
                      )
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
                      setForm(
                        (
                          current
                        ) => ({
                          ...current,
                          lng: e.target
                            .value,
                        })
                      )
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
                  value={
                    form.fechaInicio
                  }
                  onChange={(e) =>
                    setForm(
                      (
                        current
                      ) => ({
                        ...current,
                        fechaInicio:
                          e.target
                            .value,
                      })
                    )
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
                  value={
                    form.fechaFin
                  }
                  onChange={(e) =>
                    setForm(
                      (
                        current
                      ) => ({
                        ...current,
                        fechaFin:
                          e.target
                            .value,
                      })
                    )
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
                    setForm(
                      (
                        current
                      ) => ({
                        ...current,
                        horario:
                          e.target
                            .value,
                      })
                    )
                  }
                  placeholder="Ej. 08:00 a 13:00"
                  className="w-full rounded-xl border border-border px-3.5 py-2.5 text-sm outline-none focus:border-terra"
                />
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input
                  id="quirofano-activo"
                  type="checkbox"
                  checked={
                    form.activo
                  }
                  onChange={(e) =>
                    setForm(
                      (
                        current
                      ) => ({
                        ...current,
                        activo:
                          e.target
                            .checked,
                      })
                    )
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
                value={
                  form.informacion
                }
                onChange={(e) =>
                  setForm(
                    (
                      current
                    ) => ({
                      ...current,
                      informacion:
                        e.target
                          .value,
                    })
                  )
                }
                placeholder="Información para los vecinos..."
                rows={4}
                className="w-full rounded-xl border border-border px-3.5 py-2.5 text-sm outline-none focus:border-terra resize-y"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-2">
              <button
                type="button"
                onClick={
                  resetQuirofanoForm
                }
                className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-dark hover:bg-warm transition-colors"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={
                  savingQuirofano
                }
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
              onClick={
                loadQuirofanos
              }
              disabled={
                loadingQuirofanos
              }
              className="text-xs text-terra font-medium hover:underline disabled:opacity-50"
            >
              {loadingQuirofanos
                ? 'Actualizando...'
                : 'Actualizar'}
            </button>
          </div>

          {loadingQuirofanos ? (
            <div className="p-10 text-center text-sm text-warm-mid">
              Cargando ubicaciones...
            </div>
          ) : quirofanos.length ===
            0 ? (
            <div className="p-10 text-center">
              <h4 className="font-display text-lg font-semibold text-dark">
                No hay ubicaciones cargadas
              </h4>

              <p className="text-sm text-warm-mid mt-1 mb-5">
                Agregá la primera ubicación del quirófano móvil.
              </p>

              <button
                onClick={
                  openNewQuirofanoForm
                }
                className="px-4 py-2.5 rounded-xl bg-terra text-white text-sm font-medium hover:opacity-90"
              >
                + Agregar ubicación
              </button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {quirofanos.map(
                (quirofano) => (
                  <div
                    key={
                      quirofano.id
                    }
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
                              {
                                quirofano.nombre
                              }
                            </h4>

                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                quirofano.activo
                                  ? 'bg-green-50 text-green-700'
                                  : 'bg-gray-100 text-gray-500'
                              }`}
                            >
                              {quirofano.activo
                                ? 'Activo'
                                : 'Inactivo'}
                            </span>
                          </div>

                          <p className="text-sm text-dark mt-1">
                            {quirofano.direccion}
                          </p>

                          {quirofano.barrio && (
                            <p className="text-xs text-warm-mid mt-1">
                              {quirofano.barrio}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-warm-mid">
                            <span>
                              {formatDate(
                                quirofano.fechaInicio
                              )}{' '}
                              →{' '}
                              {formatDate(
                                quirofano.fechaFin
                              )}
                            </span>

                            {quirofano.horario && (
                              <span>
                                {quirofano.horario}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-warm-mid mt-2">
                            {quirofano.lat},{' '}
                            {quirofano.lng}
                          </p>

                          {quirofano.informacion && (
                            <p className="text-sm text-warm-mid mt-3 max-w-2xl">
                              {
                                quirofano.informacion
                              }
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 lg:justify-end">
                        <button
                          type="button"
                          onClick={() =>
                            editQuirofano(
                              quirofano
                            )
                          }
                          className="px-3 py-2 rounded-lg border border-border text-xs font-medium text-dark hover:bg-warm transition-colors"
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            toggleQuirofano(
                              quirofano
                            )
                          }
                          className="px-3 py-2 rounded-lg border border-border text-xs font-medium text-dark hover:bg-warm transition-colors"
                        >
                          {quirofano.activo
                            ? 'Desactivar'
                            : 'Activar'}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteQuirofano(
                              quirofano
                            )
                          }
                          className="px-3 py-2 rounded-lg border border-red-200 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderPlaceholder(
    title: string,
    description: string
  ) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-2xl border border-border p-10 text-center">
          <h2 className="font-display text-2xl font-semibold text-dark">
            {title}
          </h2>

          <p className="text-sm text-warm-mid mt-2">
            {description}
          </p>
        </div>
      </div>
    );
  }

  function renderActiveSection() {
    switch (activeSection) {
      case 'quirofano':
        return renderQuirofano();

      case 'users':
        return renderUsers();

      case 'reports':
        return renderPlaceholder(
          'Reportes',
          'La administración de reportes se conectará a los datos reales de PostgreSQL.'
        );

      case 'map':
        return renderPlaceholder(
          'Mapa',
          'El mapa general continuará disponible desde esta sección.'
        );

      case 'stats':
        return renderPlaceholder(
          'Estadísticas',
          'Las estadísticas reales del sistema ya están conectadas al dashboard.'
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
      style={{
        height:
          'calc(100vh - 64px)',
      }}
    >
      <SEO
        title="Administración | Patitas Tucumán"
        description="Panel de administración de Patitas Tucumán."
        path="/admin"
        noIndex
      />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-dark/40 z-20 lg:hidden"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      <div
        className={`${
          sidebarOpen
            ? 'translate-x-0'
            : '-translate-x-full'
        } lg:translate-x-0 fixed lg:relative z-30 h-full w-64 bg-dark text-white flex flex-col transition-transform duration-300 shrink-0`}
      >
        <div className="p-5 border-b border-white/10">
          <p className="text-xs text-white/50 uppercase tracking-widest font-medium">
            Panel Admin
          </p>

          <p className="font-display text-lg font-semibold mt-1">
            Patitas Tucumán
          </p>

          <div className="flex items-center gap-2 mt-3">
            <span
              className={`w-2 h-2 rounded-full ${
                socketConnected
                  ? 'bg-green-400'
                  : 'bg-amber-400'
              }`}
            />

            <span className="text-xs text-white/50">
              {socketConnected
                ? 'Tiempo real conectado'
                : 'Conectando...'}
            </span>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {sidebarItems.map(
            (item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(
                    item.id
                  );

                  setSidebarOpen(
                    false
                  );
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  activeSection ===
                  item.id
                    ? 'bg-white/15 text-white'
                    : 'text-white/60 hover:bg-white/8 hover:text-white'
                }`}
              >
                <span className="text-base">
                  {item.icon}
                </span>

                {item.label}
              </button>
            )
          )}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={() =>
              navigate('home')
            }
            className="w-full py-2.5 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/8 transition-colors"
          >
            ← Volver al sitio
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="bg-white border-b border-border sticky top-0 z-10">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  setSidebarOpen(
                    true
                  )
                }
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
                  {activeSection ===
                  'quirofano'
                    ? 'Gestión del Quirófano Móvil'
                    : activeSection ===
                        'users'
                      ? 'Usuarios'
                      : 'Resumen de Patitas Tucumán'}
                </h1>

                <p className="text-xs text-warm-mid">
                  {activeSection ===
                  'quirofano'
                    ? 'Ubicaciones y jornadas de castraciones'
                    : activeSection ===
                        'users'
                      ? 'Usuarios registrados en el sistema'
                      : 'Panel de administración'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`hidden sm:flex items-center gap-2 text-xs ${
                  socketConnected
                    ? 'text-green-700'
                    : 'text-amber-700'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    socketConnected
                      ? 'bg-green-500'
                      : 'bg-amber-500'
                  }`}
                />

                {socketConnected
                  ? 'En vivo'
                  : 'Conectando'}
              </div>

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