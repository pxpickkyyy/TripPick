import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://nuipjeulbavcqjuutmqc.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_UIe349GDMsv49mCKXkg-Dw_OKWig8OP';

const metaEnv =
  typeof import.meta !== 'undefined'
    ? (import.meta as unknown as { env?: Record<string, string | undefined> }).env
    : null;

const supabaseUrl =
  metaEnv?.VITE_SUPABASE_URL ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
  DEFAULT_SUPABASE_URL;

const supabaseAnonKey =
  metaEnv?.VITE_SUPABASE_ANON_KEY ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
  DEFAULT_SUPABASE_ANON_KEY;

let supabaseInstance: SupabaseClient | null = null;

const isValidUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && isValidUrl(supabaseUrl) && !supabaseUrl.includes('placeholder')
);

if (isSupabaseConfigured) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 20,
        },
      },
    });
  } catch (err) {
    console.warn('TripPick: Supabase initialization error, falling back to local mode:', err);
  }
}

if (!supabaseInstance) {
  // Safe mock client proxy for zero-config local testing and offline demos
  const createMockProxy = (): unknown => {
    const mockTarget = () => {};
    mockTarget.then = (onFulfilled?: (value: { data: null; error: null }) => void) => {
      return Promise.resolve({ data: null, error: null }).then(onFulfilled);
    };
    return new Proxy(mockTarget, {
      get: (_target: unknown, prop: string | symbol) => {
        if (prop === 'then') return mockTarget.then;
        if (prop === 'removeChannel') return () => {};
        if (prop === 'channel') {
          return () => ({
            on: () => ({ on: () => ({ subscribe: () => ({}) }) }),
            subscribe: () => ({}),
            send: () => Promise.resolve()
          });
        }
        return createMockProxy();
      },
      apply: () => createMockProxy()
    });
  };
  supabaseInstance = createMockProxy() as SupabaseClient;
}

export const supabase = supabaseInstance;
