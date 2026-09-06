import { useEffect, useState } from 'react';
import { statusLabel, statusColor, NavigateFn } from '../data/mock';
import { getReport, listReports, AnimalReport } from '../lib/api';
import Footer from '../components/Footer';

export default function ReportDetail({ id, navigate }: { id: string | null; navigate: NavigateFn }) {
  const [animal, setAnimal] = useState<AnimalReport | null>(null);
  const [related, setRelated] = useState<AnimalReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imgIdx, setImgIdx] = useState(0);
  const [showContact, setShowContact] = useState(false);

  useEffect(() => {
    if (!id) {
      setError('Reporte no encontrado.');
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    setError(null);
    setImgIdx(0);
    getReport(id)
      .then(async (data) => {
        if (!active) return;
        setAnimal(data);
        try {
          const { items } = await listReports({ zone: data.zone, pageSize: 4 });
          if (active) setRelated(items.filter((r) => r.id !== data.id).slice(0, 3));
        } catch {
          // Si fallan los relacionados no bloqueamos el resto de la pantalla.
        }
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'No se pudo cargar el reporte.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="bg-cream min-h-full flex items-center justify-center py-24 text-warm-mid">
        Cargando reporte...
      </div>
    );
  }

  if (error || !animal) {
    return (
      <div className="bg-cream min-h-full flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-red-600">{error ?? 'Reporte no encontrado.'}</p>
        <button onClick={() => navigate('reports')} className="text-terra font-medium hover:underline">
          Volver a reportes
        </button>
      </div>
    );
  }

  const emoji = animal.type === 'perro' ? '🐕' : animal.type === 'gato' ? '🐈' : '🐾';

  return (
    <div className="bg-cream min-h-full">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <button
          onClick={() => navigate('reports')}
          className="inline-flex items-center gap-1.5 text-sm text-warm-mid hover:text-terra transition-colors mb-8"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Volver a reportes
        </button>

        <div className="grid lg:grid-cols-5 gap-10">
          {/* Left: images + info */}
          <div className="lg:col-span-3 space-y-6">
            {/* Main image */}
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-warm">
              {(animal.images[imgIdx] || animal.imageUrl) ? (
                <img
                  src={animal.images[imgIdx] || animal.imageUrl}
                  alt={animal.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl">{emoji}</div>
              )}
            </div>
            {animal.images.length > 1 && (
              <div className="flex gap-2">
                {animal.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`w-20 h-16 rounded-xl overflow-hidden border-2 transition-colors ${i === imgIdx ? 'border-terra' : 'border-transparent'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 border border-border">
              <h3 className="font-display text-xl font-semibold text-dark mb-3">Descripción</h3>
              <p className="text-dark/70 leading-relaxed">{animal.description || 'Sin descripción adicional.'}</p>
            </div>

            {/* Characteristics */}
            <div className="bg-white rounded-2xl p-6 border border-border">
              <h3 className="font-display text-xl font-semibold text-dark mb-4">Características</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Especie', value: `${emoji} ${animal.type === 'perro' ? 'Perro' : animal.type === 'gato' ? 'Gato' : 'Otro'}` },
                  { label: 'Raza', value: animal.breed || '—' },
                  { label: 'Color', value: animal.color || '—' },
                  { label: 'Tamaño', value: animal.size || '—' },
                  { label: 'Zona', value: animal.zone },
                  { label: 'Fecha', value: animal.date },
                ].map((item) => (
                  <div key={item.label} className="bg-warm rounded-xl p-4">
                    <p className="text-xs text-warm-mid font-medium mb-1">{item.label}</p>
                    <p className="text-sm font-medium text-dark">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* "Viste a este animal?" */}
            <div className="bg-terra/8 border border-terra/20 rounded-2xl p-6">
              <h3 className="font-display text-xl font-semibold text-dark mb-2">¿Viste a este animal?</h3>
              <p className="text-dark/70 text-sm mb-4">Si tenés información sobre la ubicación o el paradero de {animal.name}, contactá directamente a quien hizo el reporte. Tu información puede hacer una gran diferencia.</p>
              <button
                onClick={() => setShowContact(true)}
                className="px-5 py-2.5 bg-terra text-white text-sm font-semibold rounded-xl hover:bg-terra-dark transition-colors"
              >
                Tengo información
              </button>
            </div>
          </div>

          {/* Right: sidebar */}
          <div className="lg:col-span-2 space-y-5">
            {/* Status card */}
            <div className="bg-white rounded-2xl p-6 border border-border">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h1 className="font-display text-3xl font-semibold text-dark mb-1">{animal.name}</h1>
                  <p className="text-warm-mid text-sm">{animal.breed || '—'}</p>
                </div>
                <span className={`text-xs font-medium px-3 py-1.5 rounded-full shrink-0 ${statusColor[animal.status]}`}>
                  {statusLabel[animal.status]}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-warm-mid mb-6">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                </svg>
                {animal.zone} · Reportado el {animal.date}
              </div>
              <div className="space-y-2.5">
                <button
                  onClick={() => setShowContact(!showContact)}
                  className="w-full py-3 bg-terra text-white font-semibold rounded-xl hover:bg-terra-dark transition-colors"
                >
                  Quiero ayudar
                </button>
                <button
                  onClick={() => setShowContact(!showContact)}
                  className="w-full py-3 border-2 border-border text-dark font-semibold rounded-xl hover:border-terra hover:text-terra transition-colors"
                >
                  Contactar
                </button>
                <button className="w-full py-3 border border-border text-warm-mid rounded-xl text-sm hover:border-terra hover:text-terra transition-colors flex items-center justify-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                  Compartir reporte
                </button>
              </div>
            </div>

            {/* Contact info */}
            {showContact && (
              <div className="bg-white rounded-2xl p-6 border border-terra/30">
                <h3 className="font-display text-lg font-semibold text-dark mb-4">Información de contacto</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-terra/10 flex items-center justify-center shrink-0">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C4503A" strokeWidth="2" strokeLinecap="round">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-warm-mid">Nombre</p>
                      <p className="text-sm font-medium text-dark">{animal.contact}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-terra/10 flex items-center justify-center shrink-0">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C4503A" strokeWidth="2" strokeLinecap="round">
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.81 19.79 19.79 0 01.07 2.18 2 2 0 012.05 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.16 6.16l1.28-1.28a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-warm-mid">Teléfono</p>
                      <p className="text-sm font-medium text-dark">{animal.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-terra/10 flex items-center justify-center shrink-0">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C4503A" strokeWidth="2" strokeLinecap="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-warm-mid">Email</p>
                      <p className="text-sm font-medium text-dark">{animal.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Map */}
            <div className="bg-white rounded-2xl p-5 border border-border">
              <h3 className="font-display text-lg font-semibold text-dark mb-3">Ubicación aproximada</h3>
              {(animal.lat !== 0 || animal.lng !== 0) ? (
                <div className="rounded-xl overflow-hidden border border-border">
                  <iframe
                    title="Ubicación del reporte"
                    width="100%"
                    height="160"
                    style={{ border: 0 }}
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${animal.lng - 0.01}%2C${animal.lat - 0.01}%2C${animal.lng + 0.01}%2C${animal.lat + 0.01}&layer=mapnik&marker=${animal.lat}%2C${animal.lng}`}
                  />
                  <p className="text-xs text-warm-mid px-3 py-2 bg-warm">{animal.zone}</p>
                </div>
              ) : (
                <div className="h-40 rounded-xl border-2 border-dashed border-border flex items-center justify-center text-center p-4">
                  <p className="text-sm text-warm-mid">Este reporte no tiene una ubicación exacta guardada. Zona: {animal.zone}</p>
                </div>
              )}
              <button onClick={() => navigate('map')} className="mt-3 w-full py-2 text-xs text-terra font-medium hover:underline">
                Ver en mapa completo →
              </button>
            </div>
          </div>
        </div>

        {/* Related reports */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-2xl font-semibold text-dark mb-6">Reportes relacionados</h2>
            <div className="grid sm:grid-cols-3 gap-5">
              {related.map((r) => (
                <button
                  key={r.id}
                  onClick={() => { navigate('detail', r.id); window.scrollTo(0, 0); }}
                  className="bg-white rounded-2xl overflow-hidden border border-border hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-left group"
                >
                  <div className="aspect-[16/9] overflow-hidden bg-warm">
                    <img src={r.imageUrl} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-display font-semibold text-dark">{r.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[r.status]}`}>{statusLabel[r.status]}</span>
                    </div>
                    <p className="text-xs text-warm-mid">{r.zone} · {r.date}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer navigate={navigate} />
    </div>
  );
}