import { getSession } from './auth';
import type { AnimalReport, AnimalStatus, AnimalType } from '../data/mock';

const API_URL = import.meta.env.VITE_API_URL;

// ==== Forma que devuelve el backend (Prisma) ====
interface ApiImage {
  url: string;
  order: number;
}

export interface ApiReport {
  id: string;
  name: string;
  type: AnimalType;
  status: AnimalStatus;
  zone: string;
  address?: string | null;
  description?: string | null;
  breed?: string | null;
  color?: string | null;
  size?: string | null;
  contactName: string;
  phone: string;
  email: string;
  mapLat?: number | null;
  mapLng?: number | null;
  images: ApiImage[];
  createdAt: string;
  userId?: string | null;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Adapta la forma del backend a la que ya usan las pantallas (ReportDetail, AnimalCard, MapPage, etc.)
// para no tener que reescribir componentes que no vimos.
function adaptReport(r: ApiReport): AnimalReport {
  const sortedImages = [...r.images].sort((a, b) => a.order - b.order).map((i) => i.url);
  return {
    id: r.id,
    name: r.name,
    type: r.type,
    status: r.status,
    zone: r.zone,
    date: formatDate(r.createdAt),
    description: r.description ?? '',
    breed: r.breed ?? '',
    color: r.color ?? '',
    size: r.size ?? '',
    contact: r.contactName,
    phone: r.phone,
    email: r.email,
    imageUrl: sortedImages[0] ?? '',
    images: sortedImages,
    lat: r.mapLat ?? 0,
    lng: r.mapLng ?? 0,
  };
}

function authHeaders(): Record<string, string> {
  const session = getSession();
  return session ? { Authorization: `Bearer ${session.token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Ocurrió un error al comunicarse con el servidor.');
  }
  return res.json();
}

export interface ListReportsParams {
  status?: AnimalStatus;
  type?: AnimalType;
  zone?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export async function listReports(
  params: ListReportsParams = {}
): Promise<{ items: AnimalReport[]; total: number }> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') query.set(k, String(v));
  });

  const res = await fetch(`${API_URL}/api/reports?${query.toString()}`, {
    headers: { ...authHeaders() },
  });
  const data = await handleResponse<{ items: ApiReport[]; total: number }>(res);
  return { items: data.items.map(adaptReport), total: data.total };
}

export async function getReport(id: string): Promise<AnimalReport> {
  const res = await fetch(`${API_URL}/api/reports/${id}`, {
    headers: { ...authHeaders() },
  });
  const data = await handleResponse<{ report: ApiReport }>(res);
  return adaptReport(data.report);
}

export async function myReports(): Promise<AnimalReport[]> {
  const res = await fetch(`${API_URL}/api/reports/mine`, {
    headers: { ...authHeaders() },
  });
  const data = await handleResponse<{ items: ApiReport[] }>(res);
  return data.items.map(adaptReport);
}

export interface CreateReportInput {
  name: string;
  type: AnimalType;
  status: AnimalStatus;
  zone: string;
  address?: string;
  description?: string;
  breed?: string;
  color?: string;
  size?: string;
  contactName: string;
  phone: string;
  email: string;
  mapLat?: number;
  mapLng?: number;
  images: string[]; // URLs ya subidas
}

export async function createReport(input: CreateReportInput): Promise<AnimalReport> {
  const res = await fetch(`${API_URL}/api/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(input),
  });
  const data = await handleResponse<{ report: ApiReport }>(res);
  return adaptReport(data.report);
}

/**
 * Sube una imagen y devuelve su URL pública.
 *
 * ⚠️ AJUSTAR SI HACE FALTA: asumido acá que existe POST /api/uploads,
 * recibiendo form-data con el campo "file", y que responde { url: string }.
 * Si tu uploads.routes.js usa otro path, otro campo, u otra forma de respuesta,
 * solo hay que tocar esta función.
 */
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_URL}/api/uploads`, {
    method: 'POST',
    headers: { ...authHeaders() }, // sin Content-Type: el browser arma el boundary del form-data
    body: formData,
  });
  const data = await handleResponse<{ url: string }>(res);
  return data.url;
}

export async function uploadImages(files: File[]): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    urls.push(await uploadImage(file));
  }
  return urls;
}