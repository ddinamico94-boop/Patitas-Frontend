import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import SEO from '../components/SEO';

import type {
  AnimalReport,
  AnimalStatus,
} from '../data/mock';

import { statusLabel } from '../data/mock';
import type { NavigateFn } from '../types/navigation';

import { listReports } from '../lib/api';

import AnimalCard from '../components/AnimalCard';
import Footer from '../components/Footer';

const filters: { label: string; value: AnimalStatus | 'todos' }[] = [
  { label: 'Todos', value: 'todos' },
  { label: 'Perdidos', value: 'perdido' },
  { label: 'Encontrados', value: 'encontrado' },
  { label: 'En situación de calle', value: 'en_calle' },
  { label: 'Ayudados', value: 'ayudado' },
  { label: 'Rescatados', value: 'rescatado' },
];

const zones = [
  'Todas las zonas',
  'Centro',
  'Yerba Buena',
  'Las Talitas',
  'Villa 9 de Julio',
  'Lomas de Tafí',
  'El Manantial',
  'Alberdi',
  'Ranchillos',
  'Muñecas',
  'San Cayetano',
];

const species = [
  'Todas las especies',
  'Perros',
  'Gatos',
  'Otros',
];

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border bg-white overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-warm" />

      <div className="p-4 space-y-2">
        <div className="h-4 bg-warm rounded w-3/4" />
        <div className="h-3 bg-warm rounded w-1/2" />
        <div className="h-3 bg-warm rounded w-full" />
      </div>
    </div>
  );
}

export default function Reports({
  navigate,
}: {
  navigate: NavigateFn;
}) {
  const [activeFilter, setActiveFilter] =
    useState<AnimalStatus | 'todos'>('todos');

  const [search, setSearch] = useState('');
  const [zone, setZone] = useState('Todas las zonas');
  const [specie, setSpecie] = useState('Todas las especies');

  /*
   * TanStack Query guarda los reportes en caché.
   *
   * Si el usuario entra a otra página y vuelve,
   * no hacemos otra petición innecesaria al backend.
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

    // Durante 5 minutos consideramos que los datos siguen siendo recientes.
    staleTime: 5 * 60 * 1000,

    // Conservamos la caché durante 30 minutos.
    gcTime: 30 * 60 * 1000,

    // No queremos pedir todo nuevamente cada vez
    // que el usuario vuelve a la pestaña del navegador.
    refetchOnWindowFocus: false,

    retry: 1,
  });

  const reports: AnimalReport[] = data?.items ?? [];

  const filtered = reports.filter((r) => {
    const matchStatus =
      activeFilter === 'todos' ||
      r.status === activeFilter;

    const q = search.trim().toLowerCase();

    const matchSearch =
      !q ||
      r.name.toLowerCase().includes(q) ||
      r.zone.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.breed.toLowerCase().includes(q);

    const matchZone =
      zone === 'Todas las zonas' ||
      r.zone.toLowerCase().includes(zone.toLowerCase());

    const matchSpecie =
      specie === 'Todas las especies' ||
      (specie === 'Perros' && r.type === 'perro') ||
      (specie === 'Gatos' && r.type === 'gato') ||
      (specie === 'Otros' && r.type === 'otro');

    return (
      matchStatus &&
      matchSearch &&
      matchZone &&
      matchSpecie
    );
  });

  return (
    <div className="bg-cream min-h-full">
      <SEO
        title="Reportes de animales perdidos y encontrados | Patitas Tucumán"
        description="Consultá reportes de perros y gatos perdidos, encontrados, rescatados o en situación de calle en Tucumán."
        path="/reportes"
      />
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="font-display text-4xl lg:text-5xl font-semibold text-dark mb-3">
            Animales que necesitan ayuda
          </h1>

          <p className="text-warm-mid text-lg max-w-2xl">
            La comunidad de Tucumán reporta animales perdidos,
            encontrados o en situación de calle. Podés ser quien
            cambie una historia.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros por estado */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors border ${
                activeFilter === f.value
                  ? 'bg-terra text-white border-terra'
                  : 'bg-white text-dark border-border hover:border-terra hover:text-terra'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Buscador + filtros */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="flex-1 relative">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-mid"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>

            <input
              type="text"
              placeholder="Buscar por nombre, zona o descripción..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm text-dark placeholder:text-warm-mid focus:outline-none focus:border-terra transition-colors"
            />
          </div>

          <select
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            className="px-4 py-2.5 bg-white border border-border rounded-xl text-sm text-dark focus:outline-none focus:border-terra transition-colors cursor-pointer"
          >
            {zones.map((z) => (
              <option key={z}>{z}</option>
            ))}
          </select>

          <select
            value={specie}
            onChange={(e) => setSpecie(e.target.value)}
            className="px-4 py-2.5 bg-white border border-border rounded-xl text-sm text-dark focus:outline-none focus:border-terra transition-colors cursor-pointer"
          >
            {species.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Cantidad de resultados */}
        {!isLoading && !isError && (
          <p className="text-sm text-warm-mid mb-6">
            {filtered.length}{' '}
            {filtered.length === 1
              ? 'reporte encontrado'
              : 'reportes encontrados'}

            {activeFilter !== 'todos' &&
              ` · ${statusLabel[activeFilter]}`}
          </p>
        )}

        {/* Reportes */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-20 text-red-600">
            {error instanceof Error
              ? error.message
              : 'No se pudieron cargar los reportes.'}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((animal) => (
              <AnimalCard
                key={animal.id}
                animal={animal}
                navigate={navigate}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🐾</div>

            <h3 className="font-display text-2xl font-semibold text-dark mb-2">
              Sin resultados
            </h3>

            <p className="text-warm-mid mb-6">
              No encontramos reportes con esos filtros. Intentá con
              otros criterios.
            </p>

            <button
              onClick={() => {
                setSearch('');
                setActiveFilter('todos');
                setZone('Todas las zonas');
                setSpecie('Todas las especies');
              }}
              className="px-5 py-2.5 bg-terra text-white rounded-xl text-sm font-semibold hover:bg-terra-dark transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      <Footer navigate={navigate} />
    </div>
  );
}