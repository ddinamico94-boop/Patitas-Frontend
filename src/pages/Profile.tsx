import { useEffect, useState } from 'react';
import { statusLabel, statusColor, AnimalReport } from '../data/mock';
import type { NavigateFn } from '../types/navigation';
import { User, myReports } from '../lib/api';

export default function Profile({
  navigate,
  user,
  onLogout,
}: {
  navigate: NavigateFn;
  user: User | null;
  onLogout: () => void;
}) {
  const [myReportsList, setMyReportsList] = useState<AnimalReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [reportsError, setReportsError] = useState<string | null>(null);

  const displayName = user?.name || 'Usuario';
  const displayEmail = user?.email || '';

  useEffect(() => {
    let alive = true;
    myReports()
      .then((items) => {
        if (alive) setMyReportsList(items);
      })
      .catch((err) => {
        if (alive) setReportsError(err instanceof Error ? err.message : 'No se pudieron cargar tus reportes.');
      })
      .finally(() => {
        if (alive) setLoadingReports(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="bg-cream min-h-full">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-terra/15 flex items-center justify-center shrink-0 overflow-hidden text-terra">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" />
                </svg>
              )}
            </div>
            <div>
              <h1 className="font-display text-3xl font-semibold text-dark mb-1">
                {displayName}
              </h1>
              <p className="text-warm-mid">{displayEmail}</p>
            </div>
            <div className="sm:ml-auto flex gap-3">
              <button
                onClick={onLogout}
                className="px-4 py-2.5 text-sm font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-semibold text-dark">Mis reportes</h2>
          <button onClick={() => navigate('create')} className="px-4 py-2 bg-terra text-white text-sm font-semibold rounded-xl hover:bg-terra-dark transition-colors">
            Nuevo reporte
          </button>
        </div>

        {loadingReports ? (
          <p className="text-sm text-warm-mid">Cargando...</p>
        ) : reportsError ? (
          <p className="text-sm text-red-600">{reportsError}</p>
        ) : myReportsList.length === 0 ? (
          <p className="text-sm text-warm-mid">Todavía no publicaste ningún reporte.</p>
        ) : (
          <div className="space-y-3">
            {myReportsList.map((animal) => (
              <div key={animal.id} className="bg-white rounded-2xl border border-border p-4 flex items-center gap-4 hover:shadow-sm transition-shadow group">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-warm shrink-0">
                  <img src={animal.imageUrl} alt={animal.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-dark">{animal.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[animal.status]}`}>
                      {statusLabel[animal.status]}
                    </span>
                  </div>
                  <p className="text-sm text-warm-mid truncate">{animal.zone} · {animal.date}</p>
                  <p className="text-xs text-warm-mid truncate">{animal.breed}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => navigate('detail', animal.id)}
                    className="px-3 py-1.5 text-xs font-medium text-terra border border-terra/30 rounded-lg hover:bg-terra/5 transition-colors"
                  >
                    Ver
                  </button>
                  <button className="px-3 py-1.5 text-xs font-medium text-warm-mid border border-border rounded-lg hover:border-dark hover:text-dark transition-colors">
                    Editar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}