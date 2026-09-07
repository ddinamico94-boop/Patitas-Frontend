import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getSession } from './api';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  // Le pasamos el mismo JWT que ya usa el resto de la app (viene de tu propio
  // login), para que Supabase sepa qué usuario es y aplique las reglas de
  // seguridad (RLS) que solo dejan ver conversaciones propias.
  const session = getSession();
  if (session) {
    client.realtime.setAuth(session.token);
  }
  return client;
}

export interface RealtimeMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export function subscribeToMessages(
  conversationId: string,
  onNewMessage: (message: RealtimeMessage) => void
): () => void {
  const supabase = getClient();

  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversationId=eq.${conversationId}`,
      },
      (payload) => {
        const row = payload.new as {
          id: string;
          conversationId: string;
          senderId: string;
          content: string;
          createdAt: string;
        };
        onNewMessage(row);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}