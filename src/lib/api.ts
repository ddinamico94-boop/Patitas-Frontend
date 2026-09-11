import type { AnimalReport, AnimalStatus, AnimalType } from '../data/mock';

// Nota: AnimalReport ahora incluye reporterUserId (ver data/mock.ts)

const API_URL = import.meta.env.VITE_API_URL;

// ==== Sesión / autenticación (lo que ya tenías en este archivo) ====
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  avatarUrl: string | null;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export async function loginWithGoogle(credential: string): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'No se pudo iniciar sesión con Google.');
  }

  return res.json();
}

// ==== Registro e inicio de sesión con email y contraseña ====
export interface RegisterInput {
  name: string;
  surname: string;
  email: string;
  phone: string;
  password: string;
}

export async function registerWithEmail(input: RegisterInput): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'No se pudo crear la cuenta.');
  }

  return res.json();
}

export async function loginWithEmail(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Email o contraseña incorrectos.');
  }

  return res.json();
}

export function saveSession(auth: AuthResponse) {
  localStorage.setItem('patitas_token', auth.token);
  localStorage.setItem('patitas_user', JSON.stringify(auth.user));
}

export function getSession(): AuthResponse | null {
  const token = localStorage.getItem('patitas_token');
  const userRaw = localStorage.getItem('patitas_user');

  if (!token || !userRaw) {
    return null;
  }

  try {
    const user = JSON.parse(userRaw) as User;

    return {
      token,
      user,
    };
  } catch (error) {
    console.error('Error al recuperar la sesión:', error);

    localStorage.removeItem('patitas_token');
    localStorage.removeItem('patitas_user');

    return null;
  }
}

export function clearSession() {
  localStorage.removeItem('patitas_token');
  localStorage.removeItem('patitas_user');
}

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
    reporterUserId: r.userId ?? null,
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
 * Sube hasta 10 imágenes en una sola request y devuelve sus URLs públicas.
 * Coincide con POST /api/uploads (multer .array('images', 10), requireAuth),
 * que responde { urls: string[] }.
 */
export async function uploadImages(files: File[]): Promise<string[]> {
  if (files.length === 0) return [];

  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));

  const res = await fetch(`${API_URL}/api/uploads`, {
    method: 'POST',
    headers: { ...authHeaders() }, // sin Content-Type: el browser arma el boundary del form-data
    body: formData,
  });
  const data = await handleResponse<{ urls: string[] }>(res);
  return data.urls;
}

// ==== Chat: conversaciones y mensajes ====

export interface ConversationParticipant {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface ConversationSummary {
  id: string;
  report: { id: string; name: string; status: AnimalStatus; zone: string; imageUrl: string };
  reporter: ConversationParticipant;
  helper: ConversationParticipant;
  lastMessage: { content: string; createdAt: string; senderId: string } | null;
  updatedAt: string;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

interface ApiConversation {
  id: string;
  report: { id: string; name: string; status: AnimalStatus; zone: string; images: { url: string }[] };
  reporter: ConversationParticipant;
  helper: ConversationParticipant;
  messages?: { content: string; createdAt: string; senderId: string }[];
  updatedAt: string;
  unreadCount?: number;
}

function adaptConversation(c: ApiConversation): ConversationSummary {
  return {
    id: c.id,
    report: {
      id: c.report.id,
      name: c.report.name,
      status: c.report.status,
      zone: c.report.zone,
      imageUrl: c.report.images[0]?.url ?? '',
    },
    reporter: c.reporter,
    helper: c.helper,
    lastMessage: c.messages && c.messages[0] ? c.messages[0] : null,
    updatedAt: c.updatedAt,
    unreadCount: c.unreadCount ?? 0,
  };
}

export async function createConversation(reportId: string): Promise<ConversationSummary> {
  const res = await fetch(`${API_URL}/api/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ reportId }),
  });
  const data = await handleResponse<{ conversation: ApiConversation }>(res);
  return adaptConversation(data.conversation);
}

export async function listMyConversations(): Promise<ConversationSummary[]> {
  const res = await fetch(`${API_URL}/api/conversations/mine`, { headers: { ...authHeaders() } });
  const data = await handleResponse<{ items: ApiConversation[] }>(res);
  return data.items.map(adaptConversation);
}

export async function getConversation(id: string): Promise<ConversationSummary> {
  const res = await fetch(`${API_URL}/api/conversations/${id}`, { headers: { ...authHeaders() } });
  const data = await handleResponse<{ conversation: ApiConversation }>(res);
  return adaptConversation(data.conversation);
}

export async function listMessages(conversationId: string): Promise<ChatMessage[]> {
  const res = await fetch(`${API_URL}/api/conversations/${conversationId}/messages`, {
    headers: { ...authHeaders() },
  });
  const data = await handleResponse<{ items: ChatMessage[] }>(res);
  return data.items;
}

export async function sendMessage(conversationId: string, content: string): Promise<ChatMessage> {
  const res = await fetch(`${API_URL}/api/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ content }),
  });
  const data = await handleResponse<{ message: ChatMessage }>(res);
  return data.message;
}

/** Marca la conversación como leída hasta este momento (para el usuario actual). */
export async function markConversationRead(conversationId: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/conversations/${conversationId}/read`, {
    method: 'PATCH',
    headers: { ...authHeaders() },
  });
  await handleResponse<{ ok: boolean }>(res);
}