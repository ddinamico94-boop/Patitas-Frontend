/**
 * Almacenamiento de "Organismos y contactos" para la sección Maltrato Animal.
 *
 * Por ahora no existe un endpoint de backend para esto, así que se guarda en
 * localStorage (mismo navegador/dispositivo). La forma de los datos ya está
 * pensada para poder migrarla a una API real (`GET/POST/PUT/DELETE /api/organismos`)
 * el día que exista, sin tener que cambiar los componentes que la consumen.
 *
 * IMPORTANTE: los datos de semilla (seedOrganismos) son únicamente los que
 * fueron confirmados explícitamente. No se inventan teléfonos, direcciones,
 * correos ni enlaces.
 */

export type OrganismoType = 'policial' | 'ambiental' | 'municipal' | 'provincial' | 'otro';

export interface Organismo {
  id: string;
  name: string;
  type: OrganismoType;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  officialUrl?: string;
  mapsUrl?: string;
  active: boolean;
  order: number;
  lastVerified?: string; // formato DD/MM/AAAA
  source?: string; // fuente oficial de donde se obtuvo el dato
}

const STORAGE_KEY = 'patitas_organismos_v1';

const seedOrganismos: Organismo[] = [
  {
    id: 'policia-911',
    name: 'Policía de Tucumán — Emergencias',
    type: 'policial',
    description: 'Emergencias policiales. No es una línea exclusiva de maltrato animal.',
    phone: '911',
    active: true,
    order: 1,
  },
  {
    id: 'policia-101',
    name: 'Policía de Tucumán',
    type: 'policial',
    description: 'Canal telefónico de emergencia policial publicado por la Policía de Tucumán.',
    phone: '101',
    active: true,
    order: 2,
  },
  {
    id: 'emergencia-ambiental',
    name: 'Emergencia Ambiental',
    type: 'ambiental',
    description: 'Línea de emergencia ambiental. No es una línea exclusiva de maltrato animal.',
    phone: '105',
    active: true,
    order: 3,
  },
  {
    id: 'poblacion-animal',
    name: 'Dirección de Población Animal — Municipalidad de San Miguel de Tucumán',
    type: 'municipal',
    email: 'poblacionanimal@smt.gob.ar',
    address: 'Av. Francisco de Aguirre 1550, San Miguel de Tucumán',
    active: true,
    order: 4,
  },
  {
    id: 'ciam',
    name: 'Centro Integral Animal Municipal (CIAM)',
    type: 'municipal',
    address: 'Av. Francisco de Aguirre 1465–1573, San Miguel de Tucumán',
    active: true,
    order: 5,
    // Sin horarios de atención: no fueron confirmados con una fuente oficial.
  },
  {
    id: 'tucuman-mascotas',
    name: 'Tucumán Mascotas',
    type: 'provincial',
    description: 'Programa provincial relacionado con la tenencia responsable y el cuidado de animales.',
    // officialUrl sin cargar: completar desde el panel de administración
    // una vez confirmado el sitio oficial correspondiente.
    active: true,
    order: 6,
  },
];

function readAll(): Organismo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seedOrganismos));
      return seedOrganismos;
    }
    return JSON.parse(raw) as Organismo[];
  } catch {
    return seedOrganismos;
  }
}

function writeAll(list: Organismo[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function getOrganismos(): Organismo[] {
  return readAll();
}

export function getActiveOrganismos(): Organismo[] {
  return readAll()
    .filter((o) => o.active)
    .sort((a, b) => a.order - b.order);
}

export function upsertOrganismo(organismo: Organismo): Organismo[] {
  const list = readAll();
  const idx = list.findIndex((o) => o.id === organismo.id);
  if (idx >= 0) {
    list[idx] = organismo;
  } else {
    list.push(organismo);
  }
  writeAll(list);
  return list;
}

export function deleteOrganismo(id: string): Organismo[] {
  const list = readAll().filter((o) => o.id !== id);
  writeAll(list);
  return list;
}

export function toggleOrganismoActive(id: string): Organismo[] {
  const list = readAll().map((o) => (o.id === id ? { ...o, active: !o.active } : o));
  writeAll(list);
  return list;
}