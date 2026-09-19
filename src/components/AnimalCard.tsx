import { useQueryClient } from '@tanstack/react-query';
import { AnimalReport, statusLabel, statusColor } from '../data/mock';
import type { NavigateFn } from '../types/navigation';
import { getReport } from '../lib/api';

interface AnimalCardProps {
  animal: AnimalReport;
  navigate: NavigateFn;
}

export default function AnimalCard({
  animal,
  navigate,
}: AnimalCardProps) {
  const queryClient = useQueryClient();

  const emoji =
    animal.type === 'perro'
      ? '🐕'
      : animal.type === 'gato'
        ? '🐈'
        : '🐾';

  const isAdoption =
    animal.status === 'en_adopcion' ||
    animal.status === 'adoptado';

  const sexLabel =
    animal.sex === 'macho'
      ? 'Macho'
      : animal.sex === 'hembra'
        ? 'Hembra'
        : null;

  const prefetchReport = () => {
    queryClient.prefetchQuery({
      queryKey: ['report', animal.id],
      queryFn: () => getReport(animal.id),
      staleTime: 5 * 60 * 1000,
    });
  };

  return (
    <div
      onMouseEnter={prefetchReport}
      onTouchStart={prefetchReport}
      className="bg-white rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group flex flex-col"
    >
      {/* Imagen */}
      <div className="aspect-[4/3] overflow-hidden bg-warm shrink-0 relative">
        {animal.imageUrl ? (
          <img
            src={animal.imageUrl}
            alt={`${animal.name}${animal.breed ? ` - ${animal.breed}` : ''}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            decoding="async"
            width="400"
            height="300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">
            {emoji}
          </div>
        )}

        {/* Badge especial para adopción */}
        {isAdoption && (
          <div className="absolute top-3 right-3">
            <span
              className={`text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm ${
                statusColor[animal.status]
              }`}
            >
              {statusLabel[animal.status]}
            </span>
          </div>
        )}
      </div>

      {/* Información */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-display font-semibold text-dark text-xl leading-tight">
            {animal.name}
          </h3>

          {!isAdoption && (
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 whitespace-nowrap ${
                statusColor[animal.status]
              }`}
            >
              {statusLabel[animal.status]}
            </span>
          )}
        </div>

        {/* Datos especiales de adopción */}
        {isAdoption ? (
          <>
            <p className="text-sm text-warm-mid mb-3">
              {emoji}{' '}
              {animal.breed || (
                animal.type === 'perro'
                  ? 'Perro'
                  : animal.type === 'gato'
                    ? 'Gato'
                    : 'Otro'
              )}
            </p>

            {(sexLabel || animal.age) && (
              <div className="flex flex-wrap gap-2 mb-3">
                {sexLabel && (
                  <span className="px-2.5 py-1 bg-warm rounded-full text-xs font-medium text-dark">
                    {sexLabel}
                  </span>
                )}

                {animal.age && (
                  <span className="px-2.5 py-1 bg-warm rounded-full text-xs font-medium text-dark">
                    {animal.age}
                  </span>
                )}

                {animal.size && (
                  <span className="px-2.5 py-1 bg-warm rounded-full text-xs font-medium text-dark">
                    {animal.size}
                  </span>
                )}
              </div>
            )}

            <p className="text-sm text-warm-mid mb-3 flex items-center gap-1">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="shrink-0"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>

              {animal.zone}
            </p>
          </>
        ) : (
          <>
            <p className="text-sm text-warm-mid mb-1">
              {emoji} {animal.breed}
            </p>

            <p className="text-sm text-warm-mid mb-3 flex items-center gap-1">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="shrink-0"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>

              {animal.zone} · {animal.date}
            </p>
          </>
        )}

        <p className="text-sm text-dark/60 line-clamp-2 mb-4 flex-1">
          {animal.description}
        </p>

        <button
          type="button"
          onMouseEnter={prefetchReport}
          onFocus={prefetchReport}
          onTouchStart={prefetchReport}
          onClick={() =>
            navigate('detail', animal.id)
          }
          className="w-full py-2.5 bg-terra text-white text-sm font-semibold rounded-xl hover:bg-terra-dark transition-colors"
        >
          {animal.status === 'en_adopcion'
            ? 'Conocer más'
            : animal.status === 'adoptado'
              ? 'Ver historia'
              : 'Ver reporte'}
        </button>
      </div>
    </div>
  );
}