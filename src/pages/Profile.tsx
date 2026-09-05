import { useState } from 'react';
import { reports, statusLabel, statusColor, NavigateFn } from '../data/mock';
import AnimalCard from '../components/AnimalCard';
import { User } from '../lib/api';

const tabs = ['Mis reportes', 'Favoritos', 'Historial', 'Configuración'];

const myReports = reports.slice(0, 4);

function IconClipboard() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="4" width="12" height="16" rx="2" />
      <path d="M9 4V3a1 1 0 011-1h4a1 1 0 011 1v1" />
      <line x1="9" y1="10" x2="15" y2="10" />
      <line x1="9" y1="14" x2="15" y2="14" />
    </svg>
  );
}

function IconActive() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12l2.5 2.5L16 9" />
    </svg>
  );
}

function IconHeart() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20s-7-4.35-9.5-9C1 7.5 3 4 6.5 4c2 0 3.3 1 4.2 2.2C11.6 5 12.9 4 14.9 4 18.4 4 20.4 7.5 19 11 16.5 15.65 12 20 12 20z" />
    </svg>
  );
}

function IconComment() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.5 8.5 0 01-8.5 8.5c-1.4 0-2.7-.3-3.9-.9L3 20l1-5.5a8.5 8.5 0 118.5-8.5 8.5 8.5 0 018.5 8.5z" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

const profileStats = [
  { label: 'Mis reportes', value: '4', Icon: IconClipboard },
  { label: 'Reportes activos', value: '2', Icon: IconActive },
  { label: 'Animales ayudados', value: '1', Icon: IconHeart },
];

const activityLog = [
  { Icon: IconClipboard, text: 'Publicaste el reporte de Luna', time: '28 ago 2026', color: 'bg-blue-50 text-blue-700' },
  { Icon: IconHeart, text: 'Marcaste a Simba como favorito', time: '2 sep 2026', color: 'bg-red-50 text-red-700' },
  { Icon: IconComment, text: 'Comentaste en el reporte de Rocky', time: '31 ago 2026', color: 'bg-green-50 text-green-700' },
  { Icon: IconClipboard, text: 'Publicaste el reporte de Max', time: '3 sep 2026', color: 'bg-blue-50 text-blue-700' },
  { Icon: IconCheck, text: 'Marcaste a Bella como ayudada', time: '20 ago 2026', color: 'bg-violet-50 text-violet-700' },
];

export default function Profile({
  navigate,
  user,
  onLogout,
}: {
  navigate: NavigateFn;
  user: User | null;
  onLogout: () => void;
}) {
  const [activeTab, setActiveTab] = useState(0);

  const displayName = user?.name || 'Usuario';
  const displayEmail = user?.email || '';

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
            <button className="sm:ml-auto px-4 py-2.5 border border-border rounded-xl text-sm font-medium text-dark hover:border-terra hover:text-terra transition-colors">
              Editar perfil
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-8">
            {profileStats.map((s) => (
              <div key={s.label} className="bg-warm rounded-2xl p-5 text-center">
                <div className="flex justify-center mb-2 text-terra">
                  <s.Icon />
                </div>
                <div className="font-display text-3xl font-bold text-dark mb-0.5">{s.value}</div>
                <div className="text-xs text-warm-mid">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-1 border-b border-border mb-8">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === i
                  ? 'text-terra border-terra'
                  : 'text-warm-mid border-transparent hover:text-dark'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-semibold text-dark">Mis reportes</h2>
              <button onClick={() => navigate('create')} className="px-4 py-2 bg-terra text-white text-sm font-semibold rounded-xl hover:bg-terra-dark transition-colors">
                Nuevo reporte
              </button>
            </div>
            <div className="space-y-3">
              {myReports.map((animal) => (
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
          </div>
        )}

        {activeTab === 1 && (
          <div>
            <h2 className="font-display text-2xl font-semibold text-dark mb-6">Favoritos</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {reports.slice(4, 7).map((animal) => (
                <AnimalCard key={animal.id} animal={animal} navigate={navigate} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 2 && (
          <div>
            <h2 className="font-display text-2xl font-semibold text-dark mb-6">Historial de actividad</h2>
            <div className="space-y-3">
              {activityLog.map((item, i) => (
                <div key={i} className="bg-white rounded-xl border border-border p-4 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.color}`}>
                    <item.Icon />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-dark">{item.text}</p>
                    <p className="text-xs text-warm-mid">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 3 && (
          <div>
            <h2 className="font-display text-2xl font-semibold text-dark mb-6">Configuración</h2>
            <div className="bg-white rounded-2xl border border-border overflow-hidden">
              {[
                { label: 'Notificaciones por email', desc: 'Recibir alertas de nuevos reportes en tu zona' },
                { label: 'Notificaciones push', desc: 'Activar notificaciones del navegador' },
                { label: 'Perfil público', desc: 'Mostrar mi nombre en los reportes' },
                { label: 'Compartir ubicación', desc: 'Permitir mostrar reportes cercanos a tu zona' },
              ].map((item, i, arr) => (
                <div key={item.label} className={`flex items-center justify-between p-5 ${i < arr.length - 1 ? 'border-b border-border' : ''}`}>
                  <div>
                    <p className="text-sm font-medium text-dark">{item.label}</p>
                    <p className="text-xs text-warm-mid">{item.desc}</p>
                  </div>
                  <button className="w-12 h-6 rounded-full relative transition-colors bg-terra">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm transition-all" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <button onClick={onLogout} className="px-4 py-2.5 text-sm font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors">
                Cerrar sesión
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}