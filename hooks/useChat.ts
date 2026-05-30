import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  fetchMessages,
  sendMessage,
  sendMediaMessage,
  markMessageViewed,
  type SendMediaPayload,
} from '@/lib/api';
import { canUseSupabaseRealtime, teardownRealtimeChannel } from '@/lib/realtime';
import type { Message } from '@/lib/types';

export function useChat(matchId: string | null, senderId: string, isFemale: boolean) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!matchId) {
      setMessages([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const data = await fetchMessages(matchId);
    setMessages(data);
    setLoading(false);
  }, [matchId]);

  const loadRef = useRef(load);
  loadRef.current = load;

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!canUseSupabaseRealtime(matchId)) return;

    const channel = supabase
      .channel(`messages-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`,
        },
        () => {
          void loadRef.current();
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`,
        },
        () => {
          void loadRef.current();
        },
      )
      .subscribe();

    return () => {
      teardownRealtimeChannel(channel);
    };
  }, [matchId]);

  const send = async (body: string) => {
    if (!matchId) return { error: 'Kein Match' };
    const { message, error } = await sendMessage(matchId, senderId, body, isFemale);
    if (message) setMessages((prev) => [...prev, message]);
    return { error };
  };

  const sendMedia = async (payload: SendMediaPayload) => {
    if (!matchId) return { error: 'Kein Match' };
    const { message, error } = await sendMediaMessage(
      matchId,
      senderId,
      isFemale,
      payload,
    );
    if (message) setMessages((prev) => [...prev, message]);
    return { error };
  };

  const markViewed = async (messageId: string) => {
    const { error } = await markMessageViewed(messageId);
    if (!error) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, viewed_at: new Date().toISOString() } : m,
        ),
      );
    }
    return { error };
  };

  const visible = messages.slice(-2);
  const blurred = messages.slice(0, -2);

  return {
    messages,
    visible,
    blurred,
    loading,
    send,
    sendMedia,
    markViewed,
    reload: load,
  };
}
