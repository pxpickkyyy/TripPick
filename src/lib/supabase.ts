import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabaseInstance: SupabaseClient | null = null;

const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return url.startsWith('http://') || url.startsWith('https://');
  } catch {
    return false;
  }
};

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && isValidUrl(supabaseUrl) && !supabaseUrl.includes('placeholder')
);

if (isSupabaseConfigured) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
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
