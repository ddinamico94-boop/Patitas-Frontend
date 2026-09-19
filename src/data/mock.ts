export type AnimalStatus =
  | 'perdido'
  | 'encontrado'
  | 'en_calle'
  | 'ayudado'
  | 'rescatado'
  | 'maltrato'
  | 'en_adopcion'
  | 'adoptado';

export type AnimalType =
  | 'perro'
  | 'gato'
  | 'otro';

export type AnimalSex =
  | 'macho'
  | 'hembra';

export interface AnimalReport {
  id: string;
  name: string;
  type: AnimalType;
  status: AnimalStatus;
  zone: string;
  date: string;
  description: string;
  breed: string;
  color: string;
  size: string;

  // Datos del animal para adopción
  sex?: AnimalSex;
  age?: string;

  contact: string;
  phone: string;
  email: string;
  imageUrl: string;
  images: string[];
  lat: number;
  lng: number;
  reporterUserId: string | null;

  // Campos específicos de reportes de tipo "Maltrato animal".
  animalCount?: number;
  mistreatmentType?: MistreatmentType;
  apparentCondition?: string;
  inDangerNow?: boolean;
  needsUrgentVet?: boolean;
  urgencyLevel?: UrgencyLevel;
  hasWitnesses?: boolean;
  witnessesInfo?: string;
}

// ======================================================
// ESTADOS
// ======================================================

export const statusLabel: Record<
  AnimalStatus,
  string
> = {
  perdido: 'Perdido',
  encontrado: 'Encontrado',
  en_calle: 'En situación de calle',
  ayudado: 'Ayudado',
  rescatado: 'Rescatado',
  maltrato: 'Maltrato animal',
  en_adopcion: 'En adopción',
  adoptado: 'Adoptado',
};

export const statusColor: Record<
  AnimalStatus,
  string
> = {
  perdido:
    'bg-red-50 text-red-700 border border-red-200',

  encontrado:
    'bg-blue-50 text-blue-700 border border-blue-200',

  en_calle:
    'bg-amber-50 text-amber-700 border border-amber-200',

  ayudado:
    'bg-green-50 text-green-700 border border-green-200',

  rescatado:
    'bg-violet-50 text-violet-700 border border-violet-200',

  maltrato:
    'bg-red-100 text-red-800 border border-red-300',

  en_adopcion:
    'bg-emerald-50 text-emerald-700 border border-emerald-200',

  adoptado:
    'bg-pink-50 text-pink-700 border border-pink-200',
};

export const statusDot: Record<
  AnimalStatus,
  string
> = {
  perdido: '#EF4444',
  encontrado: '#3B82F6',
  en_calle: '#F59E0B',
  ayudado: '#22C55E',
  rescatado: '#8B5CF6',
  maltrato: '#DC2626',

  // Adopción
  en_adopcion: '#10B981',
  adoptado: '#EC4899',
};

// ======================================================
// MALTRATO ANIMAL: TIPOS DE SITUACIÓN
// ======================================================

export type MistreatmentType =
  | 'agresion_fisica'
  | 'abandono'
  | 'falta_alimento_agua'
  | 'atado_permanente'
  | 'condiciones_insalubres'
  | 'falta_atencion_veterinaria'
  | 'animal_herido'
  | 'explotacion'
  | 'posible_envenenamiento'
  | 'otro'
  | 'no_seguro';

export const mistreatmentTypeLabel: Record<
  MistreatmentType,
  string
> = {
  agresion_fisica:
    'Agresión física',

  abandono:
    'Abandono',

  falta_alimento_agua:
    'Falta de alimento o agua',

  atado_permanente:
    'Animal permanentemente atado',

  condiciones_insalubres:
    'Condiciones insalubres',

  falta_atencion_veterinaria:
    'Falta de atención veterinaria',

  animal_herido:
    'Animal herido',

  explotacion:
    'Explotación',

  posible_envenenamiento:
    'Posible envenenamiento',

  otro:
    'Otro',

  no_seguro:
    'No estoy seguro',
};

// ======================================================
// MALTRATO ANIMAL: NIVEL DE URGENCIA
// ======================================================

export type UrgencyLevel =
  | 'urgente'
  | 'alta'
  | 'media'
  | 'informativa';

export const urgencyLabel: Record<
  UrgencyLevel,
  string
> = {
  urgente: 'Urgente',
  alta: 'Alta',
  media: 'Media',
  informativa: 'Informativa',
};

export const urgencyDescription: Record<
  UrgencyLevel,
  string
> = {
  urgente:
    'El animal está en peligro inmediato.',

  alta:
    'Existe una situación grave que requiere atención.',

  media:
    'Existe una situación preocupante pero no parece haber peligro inmediato.',

  informativa:
    'Quiero dejar registrada una situación o pedir orientación.',
};

export const urgencyColor: Record<
  UrgencyLevel,
  string
> = {
  urgente:
    'bg-red-50 text-red-700 border border-red-300',

  alta:
    'bg-orange-50 text-orange-700 border border-orange-300',

  media:
    'bg-amber-50 text-amber-700 border border-amber-300',

  informativa:
    'bg-blue-50 text-blue-700 border border-blue-300',
};

/**
 * Compatibilidad temporal:
 * MapPage.tsx y Home.tsx todavía importan `reports`
 * desde acá.
 *
 * Se deja vacío porque ya no usamos datos demo.
 */
export const reports: AnimalReport[] = [];