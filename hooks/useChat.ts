import { useCallback, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { fetchMessages, sendMessage } from '@/lib/api';
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

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!matchId || !isSupabaseConfigured) return;
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
        () => load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, load]);

  const send = async (body: string) => {
    if (!matchId) return { error: 'Kein Match' };
    const { message, error } = await sendMessage(matchId, senderId, body, isFemale);
    if (message) setMessages((prev) => [...prev, message]);
    return { error };
  };

  const visible = messages.slice(-2);
  const blurred = messages.slice(0, -2);

  return { messages, visible, blurred, loading, send, reload: load };
}
