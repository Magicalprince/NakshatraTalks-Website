/**
 * Supabase Client - Shared with Mobile App
 *
 * Used for:
 * - Real-time subscriptions (notifications, session updates)
 * - Supabase Realtime broadcasts
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  if (!supabase) {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  }

  return supabase;
}

/**
 * Subscribe to real-time broadcasts on a channel
 */
export function subscribeToBroadcast(
  channelName: string,
  event: string,
  callback: (payload: unknown) => void
) {
  const client = getSupabaseClient();
  if (!client) return null;

  const channel = client
    .channel(channelName)
    .on('broadcast', { event }, ({ payload }) => {
      callback(payload);
    })
    .subscribe();

  return () => {
    client.removeChannel(channel);
  };
}

/**
 * Subscribe to database changes on a table
 */
export function subscribeToTable(
  table: string,
  filter: string | undefined,
  callback: (payload: unknown) => void
) {
  const client = getSupabaseClient();
  if (!client) return null;

  const channelConfig: Parameters<typeof client.channel>[1] = {
    config: { broadcast: { self: true } },
  };

  const channel = client.channel(`db-${table}`, channelConfig);

  if (filter) {
    channel.on(
      'postgres_changes' as 'system',
      { event: '*', schema: 'public', table, filter } as unknown as { event: 'system' },
      callback as () => void
    );
  } else {
    channel.on(
      'postgres_changes' as 'system',
      { event: '*', schema: 'public', table } as unknown as { event: 'system' },
      callback as () => void
    );
  }

  channel.subscribe();

  return () => {
    client.removeChannel(channel);
  };
}
