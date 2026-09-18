import { useState } from 'react';
import type { NavigateFn } from '../types/navigation';
import { getSession } from '../lib/api';
import {
  getOrganismos,
  upsertOrganismo,
  deleteOrganismo,
  toggleOrganismoActive,
  type Organismo,
  type OrganismoType,
} from '../lib/organismos';

const typeLabel: Record<OrganismoType, string> = {
  policial: 'Policial',
  ambiental: 'Ambiental',
  municipal: 'Municipal',
  provincial: 'Provincial',
  otro: 'Otro',
};

function emptyForm(): Organismo {
  return {
    id: '',
    name: '',
    type: 'otro',
    description: '',
    phone: '',
    email: '',
    address: '',
    officialUrl: '',
    mapsUrl: '',
    active: true,
    order: 99,
    lastVerified: '',
    source: '',
  };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function AdminOrganismos({ navigate }: { navigate: NavigateFn }) {
  const session = getSession();
  const [list, setList] = useState<Organismo[]>(() => getOrganismos());
  const [editing, setEditing] = useState<Organismo | null>(null);

  // Ajustá esta condición si el rol de administrador se identifica de otra
  // forma en tu backend (por ahora asume session.user.role === 'admin').
  if (!session || session.user.role !== 'admin') {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <p className="text-warm-mid mb-4">
          Necesitás una cuenta de administrador para ver esta sección.
        </p>
        <button
          onClick={() => navigate('login')}
          className="px-5 py-2.5 bg-terra text-white rounded-xl font-semibold"
        >
          Iniciar sesión
        </button>
      </div>
    );
  }

  const refresh = () => setList(getOrganismos());

  const handleSave = (o: Organismo) => {
    if (!o.name.trim()) return;
    const toSave: Organismo = {
      ...o,
      id: o.id || slugify(o.name) || crypto.randomUUID(),
    };
    upsertOrganismo(toSave);
    refresh();
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm('¿Eliminar este organismo? Esta acción no se puede deshacer.')) return;
    deleteOrganismo(id);
    refresh();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-3xl font-semibold text-dark mb-2">
        Maltrato Animal — Organismos y contactos
      </h1>
      <p className="text-warm-mid mb-8 text-sm">
        Esta información se muestra en la sección pública "Maltrato Animal". No cargues teléfonos,
        direcciones o enlaces que no estén confirmados oficialmente.
      </p>

      <button
        onClick={() => setEditing(emptyForm())}
        className="mb-6 px-5 py-2.5 bg-terra text-white rounded-xl font-semibold text-sm hover:bg-terra-dark transition-colors"
      >
        + Agregar organismo
      </button>

      <div className="space-y-3">
        {[...list]
          .sort((a, b) => a.order - b.order)
          .map((o) => (
            <div
              key={o.id}
              className={`border rounded-xl p-4 flex items-start justify-between gap-4 ${
                o.active ? 'border-border bg-white' : 'border-border bg-warm opacity-60'
              }`}
            >
              <div>
                <p className="font-semibold text-dark text-sm">
                  {o.name} <span className="text-xs text-warm-mid">· {typeLabel[o.type]}</span>
                </p>
                <p className="text-xs text-warm-mid mt-0.5">
                  {[o.phone, o.email, o.address].filter(Boolean).join(' · ') ||
                    'Sin datos de contacto cargados'}
                </p>
                {o.lastVerified && (
                  <p className="text-[11px] text-warm-mid mt-1">
                    Última verificación: {o.lastVerified}
                    {o.source ? ` · Fuente: ${o.source}` : ''}
                  </p>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => setEditing(o)}
                  className="text-xs font-semibold text-terra hover:underline"
                >
                  Editar
                </button>
                <button
                  onClick={() => {
                    toggleOrganismoActive(o.id);
                    refresh();
                  }}
                  className="text-xs font-semibold text-warm-mid hover:underline"
                >
                  {o.active ? 'Desactivar' : 'Activar'}
                </button>
                <button
                  onClick={() => handleDelete(o.id)}
                  className="text-xs font-semibold text-red-600 hover:underline"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
      </div>

      {editing && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
          onClick={() => setEditing(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-semibold text-lg text-dark mb-4">
              {editing.id ? 'Editar organismo' : 'Nuevo organismo'}
            </h2>
            <div className="space-y-3">
              <input
                placeholder="Nombre del organismo"
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-border rounded-xl text-sm"
              />
              <select
                value={editing.type}
                onChange={(e) => setEditing({ ...editing, type: e.target.value as OrganismoType })}
                className="w-full px-3.5 py-2.5 border border-border rounded-xl text-sm"
              >
                {Object.entries(typeLabel).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
              <textarea
                placeholder="Descripción"
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                rows={2}
                className="w-full px-3.5 py-2.5 border border-border rounded-xl text-sm"
              />
              <input
                placeholder="Teléfono"
                value={editing.phone}
                onChange={(e) => setEditing({ ...editing, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-border rounded-xl text-sm"
              />
              <input
                placeholder="Correo electrónico"
                value={editing.email}
                onChange={(e) => setEditing({ ...editing, email: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-border rounded-xl text-sm"
              />
              <input
                placeholder="Dirección"
                value={editing.address}
                onChange={(e) => setEditing({ ...editing, address: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-border rounded-xl text-sm"
              />
              <input
                placeholder="URL oficial (https://...)"
                value={editing.officialUrl}
                onChange={(e) => setEditing({ ...editing, officialUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-border rounded-xl text-sm"
              />
              <input
                placeholder="URL de Google Maps"
                value={editing.mapsUrl}
                onChange={(e) => setEditing({ ...editing, mapsUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-border rounded-xl text-sm"
              />
              <input
                type="number"
                placeholder="Orden de aparición"
                value={editing.order}
                onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 border border-border rounded-xl text-sm"
              />
              <input
                placeholder="Última verificación (DD/MM/AAAA)"
                value={editing.lastVerified}
                onChange={(e) => setEditing({ ...editing, lastVerified: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-border rounded-xl text-sm"
              />
              <input
                placeholder="Fuente oficial"
                value={editing.source}
                onChange={(e) => setEditing({ ...editing, source: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-border rounded-xl text-sm"
              />
              <label className="flex items-center gap-2 text-sm text-dark">
                <input
                  type="checkbox"
                  checked={editing.active}
                  onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
                />
                Activo (visible en la sección pública)
              </label>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setEditing(null)}
                className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleSave(editing)}
                className="flex-1 py-2.5 bg-terra text-white rounded-xl text-sm font-semibold"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}