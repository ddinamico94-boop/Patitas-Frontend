import { io, Socket } from 'socket.io-client';
import { getSession } from './api';

// URL raíz del backend (sin /api), ej: http://localhost:4000
const API_URL = import.meta.env.VITE_API_URL;

let socket: Socket | null = null;

// Conversaciones a las que el cliente está actualmente suscripto.
// Se usa para volver a unirse automáticamente después de una reconexión
// (el servidor pierde la membresía de la room cuando el socket se desconecta).
const joinedConversations = new Set<string>();

function joinConversation(conversationId: string) {
  if (!socket) return;
  socket.emit('conversation:join', conversationId, (res: { ok: boolean; error?: string }) => {
    if (!res.ok) {
      console.error('No se pudo unir a la conversación:', res.error);
    }
  });
}

/**
 * Devuelve un socket conectado y autenticado con el JWT propio de la app
 * (el mismo que usás para las llamadas HTTP). Si el token cambia (por
 * ejemplo, tras un nuevo login), reconecta con el token actualizado.
 */
function getSocket(): Socket {
  const session = getSession();
  const token = session?.token ?? null;

  if (!socket) {
    socket = io(API_URL, {
      auth: { token },
      withCredentials: true,
    });

    // Cada vez que el socket se conecta (incluidas las reconexiones tras
    // un corte de red o un reinicio del servidor), el backend ya no tiene
    // memoria de qué rooms tenía unidas este socket. Nos volvemos a unir
    // a todas las conversaciones activas para no perder mensajes en vivo.
    socket.on('connect', () => {
      joinedConversations.forEach((id) => joinConversation(id));
    });

    return socket;
  }

  const currentAuth = socket.auth as { token: string | null };
  if (currentAuth.token !== token) {
    socket.auth = { token };
    socket.disconnect().connect();
  }
  return socket;
}

export interface RealtimeMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

/**
 * Se une a una conversación puntual y escucha sus mensajes nuevos en vivo.
 * El backend valida que el usuario autenticado sea reporter o helper de
 * esa conversación antes de dejarlo unirse (ver conversation:join en socket.js),
 * así que dos personas nunca ven la conversación de otras.
 * Misma firma que antes: devuelve una función para desuscribirse.
 */
export function subscribeToMessages(
  conversationId: string,
  onNewMessage: (message: RealtimeMessage) => void
): () => void {
  const s = getSocket();

  joinedConversations.add(conversationId);
  joinConversation(conversationId);

  const handler = (message: RealtimeMessage) => {
    if (message.conversationId === conversationId) {
      onNewMessage(message);
    }
  };

  s.on('message:new', handler);

  return () => {
    s.off('message:new', handler);
    s.emit('conversation:leave', conversationId);
    joinedConversations.delete(conversationId);
  };
}