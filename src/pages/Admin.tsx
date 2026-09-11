import { useState } from 'react';
import { reports, statusLabel, statusColor } from '../data/mock';
import type { NavigateFn } from '../types/navigation';
import SEO from '../components/SEO';

const sidebarItems = [
  { icon: '📊', label: 'Dashboard', id: 'dashboard' },
  { icon: '📋', label: 'Reportes', id: 'reports' },
  { icon: '👥', label: 'Usuarios', id: 'users' },
  { icon: '🗺️', label: 'Mapa', id: 'map' },
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

export default function Admin({ navigate }: { navigate: NavigateFn }) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const recentReports = reports.slice(0, 6);

  return (
    <div className="bg-cream min-h-full flex" style={{ height: 'calc(100vh - 64px)' }}>
      <SEO
  title="Administración | Patitas Tucumán"
  description="Panel de administración de Patitas Tucumán."
  path="/admin"
  noIndex
/>
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-dark/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:relative z-30 h-full w-64 bg-dark text-white flex flex-col transition-transform duration-300 shrink-0`}>
        <div className="p-5 border-b border-white/10">
          <p className="text-xs text-white/50 uppercase tracking-widest font-medium">Panel Admin</p>
          <p className="font-display text-lg font-semibold mt-1">Patitas Tucumán</p>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveSection(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeSection === item.id ? 'bg-white/15 text-white' : 'text-white/60 hover:bg-white/8 hover:text-white'
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
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded-lg text-dark hover:bg-warm transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 12h18M3 6h18M3 18h18" />
                </svg>
              </button>
              <div>
                <h1 className="font-display text-xl font-semibold text-dark">Resumen de Patitas Tucumán</h1>
                <p className="text-xs text-warm-mid">5 de septiembre de 2026</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-terra/15 text-terra flex items-center justify-center text-sm font-bold">A</div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((k) => (
              <div key={k.label} className="bg-white rounded-2xl p-5 border border-border">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{k.icon}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${k.up ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                    {k.change}
                  </span>
                </div>
                <p className="font-display text-3xl font-semibold text-dark mb-1">{k.value}</p>
                <p className="text-xs text-warm-mid">{k.label}</p>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Monthly chart */}
            <div className="bg-white rounded-2xl p-6 border border-border">
              <h3 className="font-display text-lg font-semibold text-dark mb-5">Reportes por mes</h3>
              <div className="flex items-end gap-2 h-36">
                {monthlyData.map((d) => (
                  <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5">
                    <span className="text-xs text-warm-mid font-medium">{d.reports}</span>
                    <div
                      className="w-full rounded-t-lg bg-terra/80 hover:bg-terra transition-colors cursor-pointer"
                      style={{ height: `${(d.reports / maxMonth) * 90}%` }}
                    />
                    <span className="text-xs text-warm-mid">{d.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Zone chart */}
            <div className="bg-white rounded-2xl p-6 border border-border">
              <h3 className="font-display text-lg font-semibold text-dark mb-5">Reportes por zona</h3>
              <div className="space-y-3">
                {zoneData.map((d) => (
                  <div key={d.zone}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-dark font-medium">{d.zone}</span>
                      <span className="text-warm-mid">{d.count}</span>
                    </div>
                    <div className="h-2 bg-warm rounded-full overflow-hidden">
                      <div className="h-full bg-terra rounded-full transition-all duration-500" style={{ width: `${(d.count / maxZone) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Status donut */}
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-6 border border-border">
              <h3 className="font-display text-lg font-semibold text-dark mb-4">Estado de animales</h3>
              <div className="space-y-3">
                {[
                  { label: 'Perdidos', value: 38, color: '#EF4444' },
                  { label: 'Encontrados', value: 22, color: '#3B82F6' },
                  { label: 'En situación de calle', value: 18, color: '#F59E0B' },
                  { label: 'Ayudados', value: 14, color: '#22C55E' },
                  { label: 'Rescatados', value: 8, color: '#8B5CF6' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                    <div className="flex-1">
                      <div className="h-1.5 bg-warm rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${item.value}%`, background: item.color }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-warm-mid">{item.label}</span>
                      <span className="text-xs font-semibold text-dark">{item.value}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick stats */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-border">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display text-lg font-semibold text-dark">Reportes recientes</h3>
                <button className="text-xs text-terra font-medium hover:underline">Ver todos</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-xs text-warm-mid font-medium pb-3">Animal</th>
                      <th className="text-left py-2 text-xs text-warm-mid font-medium pb-3">Zona</th>
                      <th className="text-left py-2 text-xs text-warm-mid font-medium pb-3">Estado</th>
                      <th className="text-left py-2 text-xs text-warm-mid font-medium pb-3">Fecha</th>
                      <th className="text-right py-2 text-xs text-warm-mid font-medium pb-3">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {recentReports.map((r) => (
                      <tr key={r.id} className="hover:bg-warm/50 transition-colors">
                        <td className="py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg overflow-hidden bg-warm shrink-0">
                              <img src={r.imageUrl} alt={r.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="font-medium text-dark text-xs">{r.name}</p>
                              <p className="text-warm-mid text-xs">{r.breed}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 text-xs text-warm-mid">{r.zone}</td>
                        <td className="py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[r.status]}`}>
                            {statusLabel[r.status]}
                          </span>
                        </td>
                        <td className="py-3 text-xs text-warm-mid">{r.date}</td>
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
      </div>
    </div>
  );
}
