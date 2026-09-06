export type AnimalStatus = 'perdido' | 'encontrado' | 'en_calle' | 'ayudado' | 'rescatado';
export type AnimalType = 'perro' | 'gato' | 'otro';
export type Page = 'home' | 'reports' | 'map' | 'create' | 'detail' | 'login' | 'register' | 'profile' | 'admin';
export type NavigateFn = (page: Page, id?: string) => void;

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
  contact: string;
  phone: string;
  email: string;
  imageUrl: string;
  images: string[];
  lat: number;
  lng: number;
}

export const statusLabel: Record<AnimalStatus, string> = {
  perdido: 'Perdido',
  encontrado: 'Encontrado',
  en_calle: 'En situación de calle',
  ayudado: 'Ayudado',
  rescatado: 'Rescatado',
};

export const statusColor: Record<AnimalStatus, string> = {
  perdido: 'bg-red-50 text-red-700 border border-red-200',
  encontrado: 'bg-blue-50 text-blue-700 border border-blue-200',
  en_calle: 'bg-amber-50 text-amber-700 border border-amber-200',
  ayudado: 'bg-green-50 text-green-700 border border-green-200',
  rescatado: 'bg-violet-50 text-violet-700 border border-violet-200',
};

export const statusDot: Record<AnimalStatus, string> = {
  perdido: '#EF4444',
  encontrado: '#3B82F6',
  en_calle: '#F59E0B',
  ayudado: '#22C55E',
  rescatado: '#8B5CF6',
};

/**
 * Compatibilidad temporal: MapPage.tsx y Home.tsx todavía importan `reports`
 * desde acá. Se deja vacío (ya no hay datos demo) para no romper el build.
 * Lo ideal es migrar esas dos pantallas a `listReports()` de `lib/api.ts`,
 * igual que ya se hizo en Reports.tsx y ReportDetail.tsx.
 */
export const reports: AnimalReport[] = [];
Si