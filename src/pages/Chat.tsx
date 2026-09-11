import { useEffect, useRef, useState } from 'react';
import type { NavigateFn } from '../types/navigation';
import {
  listMyConversations,
  getConversation,
  listMessages,
  sendMessage,
  markConversationRead,
  ConversationSummary,
  ChatMessage,
} from '../lib/api';
import { subscribeToMessages, subscribeToConversationUpdates } from '../lib/realtime';

export default function Chat({
  navigate,
  conversationId,
  currentUserId,
}: {
  navigate: NavigateFn;
  conversationId: string | null;
  currentUserId: string;
}) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [active, setActive] = useState<ConversationSummary | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(true);

  // Lista de conversaciones (sidebar)
  useEffect(() => {
    let alive = true;
    listMyConversations()
      .then((items) => {
        if (alive) setConversations(items);
      })
      .catch(() => {
        // si falla, dejamos la lista vacía en vez de romper la pantalla
      })
      .finally(() => {
        if (alive) setLoadingList(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  // Novedades en vivo de TODAS las conversaciones (tengas o no cada una abierta):
  // actualiza último mensaje y contador de no leídos en la lista, tipo WhatsApp.
  useEffect(() => {
    const unsubscribe = subscribeToConversationUpdates(({ conversationId: updatedId, message }) => {
      setConversations((prev) => {
        const next = prev.map((c) => {
          if (c.id !== updatedId) return c;

          // Si es la conversación que tengo abierta ahora mismo, la considero
          // leída al toque (y se lo avisamos al backend); si no, sumo 1 al contador.
          const isOpenNow = updatedId === conversationId;
          if (isOpenNow) {
            markConversationRead(updatedId).catch(() => {
              // si falla, no rompemos la UI: en la próxima apertura se reintenta
            });
          }

          return {
            ...c,
            lastMessage: { content: message.content, createdAt: message.createdAt, senderId: message.senderId },
            updatedAt: message.createdAt,
            unreadCount: isOpenNow ? 0 : c.unreadCount + 1,
          };
        });

        // Más reciente primero, como en cualquier lista de chats
        return [...next].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      });
    });

    return unsubscribe;
    // Ojo: no depende de `conversations` a propósito (evita recrear la suscripción
    // por cada mensaje); usa el valor más reciente de conversationId por closure.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  // Conversación activa + sus mensajes + suscripción en vivo
  useEffect(() => {
    if (!conversationId) {
      setActive(null);
      setMessages([]);
      return;
    }
    let alive = true;
    setLoadingMessages(true);
    setError(null);

    Promise.all([getConversation(conversationId), listMessages(conversationId)])
      .then(([conv, msgs]) => {
        if (!alive) return;
        setActive(conv);
        setMessages(msgs);
      })
      .catch((err) => {
        if (alive) setError(err instanceof Error ? err.message : 'No se pudo abrir la conversación.');
      })
      .finally(() => {
        if (alive) setLoadingMessages(false);
      });

    // Al abrir el chat, lo marcamos como leído y bajamos su contador en la lista.
    markConversationRead(conversationId).catch(() => {
      // no bloqueante: si falla, el contador puede quedar desactualizado hasta reintentar
    });
    setConversations((prev) => prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c)));

    const unsubscribe = subscribeToMessages(conversationId, (msg) => {
      setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
    });

    return () => {
      alive = false;
      unsubscribe();
    };
  }, [conversationId]);

  useEffect(() => {
  if (!shouldAutoScrollRef.current) return;

  bottomRef.current?.scrollIntoView({
    behavior: 'smooth',
  });
}, [messages]);

  const handleSend = async () => {
    if (!conversationId || !draft.trim() || sending) return;
    setSending(true);
    setError(null);
    try {
      const msg = await sendMessage(conversationId, draft.trim());
      setDraft('');
      setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar el mensaje.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-cream" style={{ height: 'calc(100vh - 64px)' }}>
      <div className="h-full flex flex-col lg:flex-row">
        {/* Lista de conversaciones: apilada arriba en mobile, al costado en desktop */}
        <div className="w-full lg:w-80 max-h-[35vh] lg:max-h-none bg-white border-b lg:border-b-0 lg:border-r border-border flex flex-col shrink-0">
          <div className="p-4 border-b border-border">
            <h2 className="font-display text-lg font-semibold text-dark">Mis conversaciones</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingList ? (
              <p className="text-sm text-warm-mid p-4">Cargando...</p>
            ) : conversations.length === 0 ? (
              <p className="text-sm text-warm-mid p-4">Todavía no tenés conversaciones.</p>
            ) : (
              conversations.map((c) => {
                const other = c.reporter.id === currentUserId ? c.helper : c.reporter;
                const hasUnread = c.unreadCount > 0;
                return (
                  <button
                    key={c.id}
                    onClick={() => navigate('chat', c.id)}
                    className={`w-full text-left p-4 border-b border-border hover:bg-warm transition-colors flex gap-3 items-start ${
                      active?.id === c.id ? 'bg-warm' : ''
                    }`}
                  >
                    <div className="w-11 h-11 rounded-xl overflow-hidden bg-cream shrink-0">
                      {c.report.imageUrl ? (
                        <img src={c.report.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm truncate ${hasUnread ? 'font-bold text-dark' : 'font-semibold text-dark'}`}>
                        {c.report.name} · {other.name}
                      </p>
                      <p className={`text-xs truncate ${hasUnread ? 'text-dark font-medium' : 'text-warm-mid'}`}>
                        {c.lastMessage?.content ?? 'Sin mensajes todavía'}
                      </p>
                    </div>
                    {hasUnread && (
                      <span className="shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-terra text-white text-[11px] font-bold flex items-center justify-center">
                        {c.unreadCount > 99 ? '99+' : c.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Conversación activa */}
        <div className="flex-1 flex flex-col min-h-[300px]">
          {!conversationId || !active ? (
            <div className="flex-1 flex items-center justify-center text-warm-mid text-sm p-6 text-center">
              {loadingMessages ? 'Cargando...' : 'Elegí una conversación de la lista para empezar a chatear.'}
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-border bg-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-cream shrink-0">
                  {active.report.imageUrl ? (
                    <img src={active.report.imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-dark text-sm truncate">{active.report.name}</p>
                  <p className="text-xs text-warm-mid truncate">
                    con {active.reporter.id === currentUserId ? active.helper.name : active.reporter.name}
                  </p>
                </div>
                <button
                  onClick={() => navigate('detail', active.report.id)}
                  className="ml-auto text-xs text-terra font-medium hover:underline shrink-0"
                >
                  Ver reporte
                </button>
              </div>

              <div
  ref={messagesContainerRef}
  onScroll={() => {
    const container = messagesContainerRef.current;

    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight -
      container.scrollTop -
      container.clientHeight;

    shouldAutoScrollRef.current =
      distanceFromBottom < 100;
  }}
  className="flex-1 overflow-y-auto p-4 space-y-2"
>
  {messages.length === 0 && (
    <p className="text-center text-xs text-warm-mid py-6">
      Todavía no hay mensajes. ¡Mandá el primero!
    </p>
  )}

  {messages.map((m) => {
    const mine = m.senderId === currentUserId;

    return (
      <div
        key={m.id}
        className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
      >
        <div
          className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
            mine
              ? 'bg-terra text-white rounded-br-sm'
              : 'bg-white border border-border text-dark rounded-bl-sm'
          }`}
        >
          {m.content}
        </div>
      </div>
    );
  })}

  <div ref={bottomRef} />
</div>

              {error && <p className="text-xs text-red-600 px-4 pb-1">{error}</p>}

              <div className="p-3 border-t border-border bg-white flex gap-2">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !sending) handleSend();
                  }}
                  placeholder="Escribí un mensaje..."
                  className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-terra"
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !draft.trim()}
                  className="px-5 py-2.5 bg-terra text-white rounded-xl text-sm font-semibold disabled:opacity-40"
                >
                  Enviar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}