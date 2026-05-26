// Deploy: supabase functions deploy send-push --no-verify-jwt
// Aufruf: POST { token, title, body } oder { process_outbox: true }

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  const body = await req.json().catch(() => ({}));

  if (body.process_outbox) {
    const { data: pending, error } = await supabase
      .from('push_outbox')
      .select('id, push_token, title, body, payload')
      .is('sent_at', null)
      .order('created_at', { ascending: true })
      .limit(50);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    let sent = 0;
    for (const row of pending ?? []) {
      await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: row.push_token,
          title: row.title,
          body: row.body,
          data: row.payload ?? {},
          sound: 'default',
        }),
      });
      await supabase
        .from('push_outbox')
        .update({ sent_at: new Date().toISOString() })
        .eq('id', row.id);
      sent++;
    }

    return new Response(JSON.stringify({ ok: true, sent }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { token, title, body: pushBody } = body;
  if (!token) {
    return new Response(JSON.stringify({ error: 'no token' }), { status: 400 });
  }

  await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: token,
      title,
      body: pushBody,
      sound: 'default',
    }),
  });

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
