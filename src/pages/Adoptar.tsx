import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import type { AnimalReport, AnimalType } from '../data/mock';
import type { NavigateFn } from '../types/navigation';

import { listReports } from '../lib/api';

import AnimalCard from '../components/AnimalCard';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

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

type SpeciesFilter = 'todos' | AnimalType;
type SexFilter = 'todos' | 'macho' | 'hembra';
type SizeFilter = 'todos' | 'pequeno' | 'mediano' | 'grande';

/* =========================================================
   SVG - SALVÁS UNA VIDA
   ========================================================= */

function SaveLifeIcon() {
  return (
    <svg
      viewBox="0 0 120 120"
      className="w-24 h-24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="60" cy="60" r="52" fill="#FCEDEA" />

      {/* Oreja izquierda */}
      <path
        d="M39 48C28 39 24 50 29 62C32 69 38 70 43 65"
        fill="#B8754A"
        stroke="#6B3F2A"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Oreja derecha */}
      <path
        d="M76 47C87 39 92 50 87 62C84 68 78 69 74 64"
        fill="#B8754A"
        stroke="#6B3F2A"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Cabeza */}
      <path
        d="M39 51C41 37 50 31 60 31C72 31 80 39 81 52V65C81 78 72 87 60 87C48 87 39 78 39 65V51Z"
        fill="#FFF8EF"
        stroke="#6B3F2A"
        strokeWidth="3"
      />

      {/* Mancha */}
      <path
        d="M43 46C46 37 52 33 59 32C54 42 55 50 58 57C51 57 46 53 43 46Z"
        fill="#D89A62"
      />

      {/* Ojos */}
      <path
        d="M49 59C51 56 54 56 56 59"
        stroke="#3B2921"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <path
        d="M65 59C67 56 70 56 72 59"
        stroke="#3B2921"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Nariz */}
      <path
        d="M57 65C59 63 63 63 65 65C64 69 58 69 57 65Z"
        fill="#3B2921"
      />

      {/* Sonrisa */}
      <path
        d="M61 68V71M61 71C57 75 53 73 52 71M61 71C65 75 69 73 70 71"
        stroke="#3B2921"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Corazón */}
      <path
        d="M91 35C87 28 76 30 76 39C76 48 91 57 91 57C91 57 106 48 106 39C106 30 95 28 91 35Z"
        fill="#E76D5B"
        stroke="#C4503A"
        strokeWidth="2"
      />

      {/* Detalles corazón */}
      <path
        d="M101 27L105 22"
        stroke="#E88768"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <path
        d="M108 35H114"
        stroke="#E88768"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* =========================================================
   SVG - GANÁS UN COMPAÑERO
   ========================================================= */

function CompanionIcon() {
  return (
    <svg
      viewBox="0 0 120 120"
      className="w-24 h-24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="60" cy="60" r="52" fill="#FFF3E7" />

      {/* Casa */}
      <path
        d="M29 55V88H87V55L58 31L29 55Z"
        fill="#FFF8EF"
        stroke="#6B3F2A"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* Techo */}
      <path
        d="M21 58L58 26L95 58"
        stroke="#E66D58"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M21 58L58 26L95 58"
        stroke="#6B3F2A"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Chimenea */}
      <path
        d="M35 42V28H45V34"
        fill="#D98A59"
        stroke="#6B3F2A"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* Puerta */}
      <path
        d="M49 88V69C49 63 53 59 58 59C63 59 67 63 67 69V88"
        fill="#B8754A"
        stroke="#6B3F2A"
        strokeWidth="3"
      />

      <circle cx="54" cy="74" r="2" fill="#6B3F2A" />

      {/* Corazón de la casa */}
      <path
        d="M58 44C54 38 45 40 45 47C45 54 58 62 58 62C58 62 71 54 71 47C71 40 62 38 58 44Z"
        fill="#E76D5B"
      />

      {/* Gatito */}
      <path
        d="M76 68L80 58L86 64L93 60L95 70"
        fill="#E6A363"
        stroke="#6B3F2A"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      <circle
        cx="86"
        cy="72"
        r="12"
        fill="#FFF5E9"
        stroke="#6B3F2A"
        strokeWidth="2.5"
      />

      {/* Ojos gato */}
      <circle cx="82" cy="71" r="1.5" fill="#3B2921" />
      <circle cx="90" cy="71" r="1.5" fill="#3B2921" />

      {/* Nariz */}
      <path
        d="M84.5 75L86 76L87.5 75"
        stroke="#3B2921"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* Boca */}
      <path
        d="M86 76C84 79 82 78 81 77M86 76C88 79 90 78 91 77"
        stroke="#3B2921"
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      {/* Bigotes */}
      <path
        d="M78 75L72 73M78 78L72 79M94 75L100 73M94 78L100 79"
        stroke="#6B3F2A"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Cuerpo */}
      <path
        d="M80 83C80 91 78 96 75 99H96C93 94 92 88 92 82"
        fill="#FFF5E9"
        stroke="#6B3F2A"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Cola */}
      <path
        d="M94 88C103 87 105 80 102 76"
        stroke="#D99050"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* =========================================================
   SVG - AYUDÁS A LA COMUNIDAD
   ========================================================= */

function CommunityIcon() {
  return (
    <svg
      viewBox="0 0 120 120"
      className="w-24 h-24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="60" cy="60" r="52" fill="#F1F3E9" />

      {/* Planeta */}
      <circle
        cx="60"
        cy="47"
        r="29"
        fill="#A9D7D4"
        stroke="#4C6254"
        strokeWidth="3"
      />

      {/* Continente izquierdo */}
      <path
        d="M43 24C48 29 49 34 45 38C41 42 44 47 49 48C55 49 55 55 51 59C48 62 48 68 51 73"
        stroke="#5D9173"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* Continente derecho */}
      <path
        d="M70 21C67 27 69 32 75 34C82 36 82 42 78 46C73 51 77 56 84 58"
        stroke="#5D9173"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* Patita */}
      <path
        d="M48 96C48 83 53 72 60 72C67 72 72 83 72 96"
        fill="#FFF9F2"
        stroke="#6B3F2A"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Dedos */}
      <circle cx="47" cy="70" r="5" fill="#E88768" />
      <circle cx="57" cy="64" r="5" fill="#E88768" />
      <circle cx="68" cy="66" r="5" fill="#E88768" />
      <circle cx="76" cy="73" r="5" fill="#E88768" />

      {/* Almohadilla */}
      <path
        d="M52 83C54 76 65 76 68 83C71 90 65 94 60 94C55 94 49 90 52 83Z"
        fill="#E88768"
      />

      {/* Hoja izquierda */}
      <path
        d="M31 76C20 70 16 79 23 88C28 94 35 95 39 94C38 87 36 80 31 76Z"
        fill="#72A27F"
        stroke="#4C6254"
        strokeWidth="2.5"
      />

      <path
        d="M25 80L37 91"
        stroke="#4C6254"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Hoja derecha */}
      <path
        d="M89 76C100 70 104 79 97 88C92 94 85 95 81 94C82 87 84 80 89 76Z"
        fill="#72A27F"
        stroke="#4C6254"
        strokeWidth="2.5"
      />

      <path
        d="M95 80L83 91"
        stroke="#4C6254"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Rayitas decorativas */}
      <path
        d="M20 52L13 49"
        stroke="#E6A363"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <path
        d="M100 52L107 49"
        stroke="#E6A363"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* =========================================================
   SKELETON
   ========================================================= */

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border bg-white overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-warm" />

      <div className="p-5 space-y-3">
        <div className="h-5 bg-warm rounded w-2/3" />
        <div className="h-3 bg-warm rounded w-1/2" />

        <div className="flex gap-2">
          <div className="h-6 bg-warm rounded-full w-16" />
          <div className="h-6 bg-warm rounded-full w-20" />
        </div>

        <div className="h-3 bg-warm rounded w-3/4" />
        <div className="h-10 bg-warm rounded-xl w-full mt-4" />
      </div>
    </div>
  );
}

/* =========================================================
   PÁGINA ADOPTAR
   ========================================================= */

export default function Adoptar({
  navigate,
}: {
  navigate: NavigateFn;
}) {
  const [search, setSearch] = useState('');
  const [zone, setZone] = useState('Todas las zonas');
  const [species, setSpecies] =
    useState<SpeciesFilter>('todos');
  const [sex, setSex] =
    useState<SexFilter>('todos');
  const [size, setSize] =
    useState<SizeFilter>('todos');

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['reports', 'adoption'],

    queryFn: () =>
      listReports({
        status: 'en_adopcion',
        pageSize: 50,
      }),

    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const reports: AnimalReport[] =
    data?.items ?? [];

  const filtered = useMemo(() => {
    return reports.filter((animal) => {
      if (animal.status !== 'en_adopcion') {
        return false;
      }

      const query = search.trim().toLowerCase();

      const matchSearch =
        !query ||
        animal.name.toLowerCase().includes(query) ||
        animal.zone.toLowerCase().includes(query) ||
        animal.description.toLowerCase().includes(query) ||
        animal.breed.toLowerCase().includes(query);

      const matchZone =
        zone === 'Todas las zonas' ||
        animal.zone
          .toLowerCase()
          .includes(zone.toLowerCase());

      const matchSpecies =
        species === 'todos' ||
        animal.type === species;

      const matchSex =
        sex === 'todos' ||
        animal.sex === sex;

      const normalizedSize =
        animal.size?.toLowerCase() ?? '';

      const matchSize =
        size === 'todos' ||
        (size === 'pequeno' &&
          (normalizedSize.includes('pequeño') ||
            normalizedSize.includes('pequeno'))) ||
        (size === 'mediano' &&
          normalizedSize.includes('mediano')) ||
        (size === 'grande' &&
          normalizedSize.includes('grande'));

      return (
        matchSearch &&
        matchZone &&
        matchSpecies &&
        matchSex &&
        matchSize
      );
    });
  }, [
    reports,
    search,
    zone,
    species,
    sex,
    size,
  ]);

  const clearFilters = () => {
    setSearch('');
    setZone('Todas las zonas');
    setSpecies('todos');
    setSex('todos');
    setSize('todos');
  };

  const scrollToAnimals = () => {
    document
      .getElementById('animales-en-adopcion')
      ?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
  };

  return (
    <div className="bg-cream min-h-full">
      <SEO
        title="Animales en adopción | Patitas Tucumán"
        description="Conocé perros, gatos y otros animales que buscan una familia en Tucumán. Adoptá y ayudá a cambiar una vida."
        path="/adoptar"
      />

      {/* =====================================================
          HERO
          ===================================================== */}

      <section className="bg-white border-b border-border overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-terra/10 text-terra rounded-full text-sm font-semibold mb-5">
                <span>🐾</span>
                <span>Un hogar cambia todo</span>
              </div>

              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-semibold text-dark leading-[1.05] mb-6">
                Adoptá,
                <br />

                <span className="text-terra">
                  no compres
                </span>
              </h1>

              <p className="text-warm-mid text-lg sm:text-xl leading-relaxed max-w-xl mb-8">
                Dales una segunda oportunidad.
                Conocé animales que están buscando
                una familia y un hogar definitivo
                en Tucumán.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={scrollToAnimals}
                  className="px-6 py-3.5 bg-terra text-white rounded-xl font-semibold hover:bg-terra-dark transition-colors shadow-sm"
                >
                  Ver animales
                </button>

                <button
                  type="button"
                  onClick={() => navigate('create')}
                  className="px-6 py-3.5 bg-white text-dark border-2 border-border rounded-xl font-semibold hover:border-terra hover:text-terra transition-colors"
                >
                  Publicar en adopción
                </button>
              </div>
            </div>

            {/* Tarjeta visual */}
            <div className="hidden lg:block">
              <div className="relative max-w-md ml-auto">
                <div className="absolute -top-8 -left-8 w-28 h-28 bg-terra/10 rounded-full" />
                <div className="absolute -bottom-10 -right-8 w-36 h-36 bg-warm rounded-full" />

                <div className="relative bg-cream border border-border rounded-[2rem] p-8 shadow-sm">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="aspect-square bg-white border border-border rounded-3xl flex items-center justify-center rotate-[-3deg]">
                      <SaveLifeIcon />
                    </div>

                    <div className="aspect-square bg-white border border-border rounded-3xl flex items-center justify-center rotate-[3deg]">
                      <CompanionIcon />
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="font-display text-2xl font-semibold text-dark mb-2">
                      Tu próximo compañero puede estar acá
                    </p>

                    <p className="text-sm text-warm-mid">
                      Conocelo, contactá a quien lo cuida y
                      dale una nueva oportunidad.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          ANIMALES EN ADOPCIÓN
          ===================================================== */}

      <section
        id="animales-en-adopcion"
        className="scroll-mt-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-dark mb-2">
              Buscan una familia
            </h2>

            <p className="text-warm-mid">
              Conocé los animales que actualmente están
              esperando un hogar.
            </p>
          </div>

          {/* Filtro especie */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
            <button
              type="button"
              onClick={() => setSpecies('todos')}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors border ${
                species === 'todos'
                  ? 'bg-terra text-white border-terra'
                  : 'bg-white text-dark border-border hover:border-terra hover:text-terra'
              }`}
            >
              Todos
            </button>

            <button
              type="button"
              onClick={() => setSpecies('perro')}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors border ${
                species === 'perro'
                  ? 'bg-terra text-white border-terra'
                  : 'bg-white text-dark border-border hover:border-terra hover:text-terra'
              }`}
            >
               Perros
            </button>

            <button
              type="button"
              onClick={() => setSpecies('gato')}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors border ${
                species === 'gato'
                  ? 'bg-terra text-white border-terra'
                  : 'bg-white text-dark border-border hover:border-terra hover:text-terra'
              }`}
            >
               Gatos
            </button>

            <button
              type="button"
              onClick={() => setSpecies('otro')}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors border ${
                species === 'otro'
                  ? 'bg-terra text-white border-terra'
                  : 'bg-white text-dark border-border hover:border-terra hover:text-terra'
              }`}
            >
               Otros
            </button>
          </div>

          {/* Buscador y filtros */}
          <div className="bg-white border border-border rounded-2xl p-4 sm:p-5 mb-8 shadow-sm">
            <div className="flex flex-col lg:flex-row gap-3">
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
                  placeholder="Buscar por nombre, raza, zona..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm text-dark placeholder:text-warm-mid focus:outline-none focus:border-terra transition-colors"
                />
              </div>

              {/* Zona */}
              <select
                value={zone}
                onChange={(e) =>
                  setZone(e.target.value)
                }
                aria-label="Filtrar por zona"
                className="px-4 py-2.5 bg-white border border-border rounded-xl text-sm text-dark focus:outline-none focus:border-terra transition-colors cursor-pointer"
              >
                {zones.map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>

              {/* Sexo */}
              <select
                value={sex}
                onChange={(e) =>
                  setSex(
                    e.target.value as SexFilter
                  )
                }
                aria-label="Filtrar por sexo"
                className="px-4 py-2.5 bg-white border border-border rounded-xl text-sm text-dark focus:outline-none focus:border-terra transition-colors cursor-pointer"
              >
                <option value="todos">
                  Todos los sexos
                </option>

                <option value="macho">
                  Macho
                </option>

                <option value="hembra">
                  Hembra
                </option>
              </select>

              {/* Tamaño */}
              <select
                value={size}
                onChange={(e) =>
                  setSize(
                    e.target.value as SizeFilter
                  )
                }
                aria-label="Filtrar por tamaño"
                className="px-4 py-2.5 bg-white border border-border rounded-xl text-sm text-dark focus:outline-none focus:border-terra transition-colors cursor-pointer"
              >
                <option value="todos">
                  Todos los tamaños
                </option>

                <option value="pequeno">
                  Pequeño
                </option>

                <option value="mediano">
                  Mediano
                </option>

                <option value="grande">
                  Grande
                </option>
              </select>
            </div>
          </div>

          {/* Cantidad */}
          {!isLoading && !isError && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <p className="text-sm text-warm-mid">
                <span className="font-semibold text-dark">
                  {filtered.length}
                </span>{' '}
                {filtered.length === 1
                  ? 'animal buscando una familia'
                  : 'animales buscando una familia'}
              </p>

              {(search ||
                zone !== 'Todas las zonas' ||
                species !== 'todos' ||
                sex !== 'todos' ||
                size !== 'todos') && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-sm text-terra font-medium hover:text-terra-dark transition-colors self-start sm:self-auto"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          )}

          {/* Resultados */}
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({
                length: 8,
              }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : isError ? (
            <div className="bg-white border border-border rounded-2xl text-center py-16 px-6">
              <div className="text-5xl mb-4">
                🐾
              </div>

              <h3 className="font-display text-2xl font-semibold text-dark mb-2">
                No pudimos cargar las adopciones
              </h3>

              <p className="text-red-600 text-sm">
                {error instanceof Error
                  ? error.message
                  : 'No se pudieron cargar los animales en adopción.'}
              </p>
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
            <div className="bg-white border border-border rounded-2xl text-center py-16 px-6">
              <div className="text-6xl mb-4">
                🐾
              </div>

              <h3 className="font-display text-2xl font-semibold text-dark mb-2">
                No encontramos animales
              </h3>

              <p className="text-warm-mid max-w-md mx-auto mb-6">
                No hay animales en adopción que coincidan
                con los filtros seleccionados.
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="px-5 py-2.5 bg-terra text-white rounded-xl text-sm font-semibold hover:bg-terra-dark transition-colors"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          BENEFICIOS - SVG
          ===================================================== */}

      <section className="bg-white border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-dark mb-3">
              Adoptar cambia dos vidas
            </h2>

            <p className="text-warm-mid max-w-xl mx-auto">
              Una adopción responsable le da una nueva
              oportunidad a un animal y suma un compañero
              a tu familia.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {/* Salvás una vida */}
            <div className="bg-cream border border-border rounded-3xl p-7 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="flex justify-center mb-5">
                <SaveLifeIcon />
              </div>

              <h3 className="font-display text-xl font-semibold text-dark mb-2">
                Salvás una vida
              </h3>

              <p className="text-sm text-warm-mid leading-relaxed">
                Le das una segunda oportunidad a un animal
                que necesita un hogar.
              </p>
            </div>

            {/* Ganás un compañero */}
            <div className="bg-cream border border-border rounded-3xl p-7 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="flex justify-center mb-5">
                <CompanionIcon />
              </div>

              <h3 className="font-display text-xl font-semibold text-dark mb-2">
                Ganás un compañero
              </h3>

              <p className="text-sm text-warm-mid leading-relaxed">
                Construís un vínculo con un animal que puede
                acompañarte durante muchos años.
              </p>
            </div>

            {/* Ayudás a la comunidad */}
            <div className="bg-cream border border-border rounded-3xl p-7 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="flex justify-center mb-5">
                <CommunityIcon />
              </div>

              <h3 className="font-display text-xl font-semibold text-dark mb-2">
                Ayudás a la comunidad
              </h3>

              <p className="text-sm text-warm-mid leading-relaxed">
                Cada adopción abre espacio y posibilidades
                para que otros animales también puedan
                recibir ayuda.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CTA PUBLICAR
          ===================================================== */}

      <section className="bg-cream">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="bg-terra rounded-3xl px-6 sm:px-10 py-10 sm:py-12 text-center shadow-sm">
            

            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-white mb-3">
              ¿Tenés un animal que busca hogar?
            </h2>

            <p className="text-white/80 max-w-xl mx-auto mb-7">
              Publicalo en Patitas Tucumán para que personas
              interesadas puedan conocerlo y ponerse en
              contacto con vos.
            </p>

            <button
              type="button"
              onClick={() => navigate('create')}
              className="px-6 py-3 bg-white text-terra rounded-xl font-semibold hover:bg-cream transition-colors"
            >
              Publicar en adopción
            </button>
          </div>
        </div>
      </section>

      <Footer navigate={navigate} />
    </div>
  );
}