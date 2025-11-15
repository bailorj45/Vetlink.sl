import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create mock client for when Supabase is not configured
function createMockClient() {
  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      signInWithPassword: async () => ({ 
        data: null, 
        error: { message: 'Supabase not configured. Please add environment variables to .env.local' } 
      }),
      signUp: async () => ({ 
        data: null, 
        error: { message: 'Supabase not configured. Please add environment variables to .env.local' } 
      }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({ data: [], error: null, count: 0 }),
        order: () => ({ limit: () => ({ data: [], error: null }) }),
      }),
      insert: () => ({ 
        data: null, 
        error: { message: 'Supabase not configured' } 
      }),
      update: () => ({ 
        data: null, 
        error: { message: 'Supabase not configured' } 
      }),
      delete: () => ({ 
        data: null, 
        error: { message: 'Supabase not configured' } 
      }),
    }),
    channel: () => ({
      on: () => ({
        subscribe: () => ({}),
      }),
    }),
    storage: {
      from: () => ({
        upload: async () => ({ data: null, error: { message: 'Not configured' } }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
  } as any;
}

// Lazy client creation - only create when actually accessed
let _supabaseClient: any = null;

function getSupabaseClient() {
  if (_supabaseClient) {
    return _supabaseClient;
  }

  // Check if env vars are missing
  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window !== 'undefined') {
      // Only show warning in browser
      console.warn(
        '%c⚠️ Missing Supabase Configuration',
        'color: orange; font-weight: bold; font-size: 14px;',
        '\n\nPlease create a .env.local file in your project root with:\n\n' +
        'NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co\n' +
        'NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here\n\n' +
        'The app will run in mock mode until these are configured.\n' +
        'See QUICK_START.md for detailed instructions.'
      );
    }
    _supabaseClient = createMockClient();
    return _supabaseClient;
  }

  // Try to create real client
  try {
    _supabaseClient = createClientComponentClient();
    return _supabaseClient;
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
    // Fallback to direct client
    try {
      _supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
      return _supabaseClient;
    } catch (directError) {
      console.error('Failed to create direct Supabase client:', directError);
      _supabaseClient = createMockClient();
      return _supabaseClient;
    }
  }
}

// Export getter function that creates client on demand
export const supabase = new Proxy({} as any, {
  get(_target, prop) {
    const client = getSupabaseClient();
    return client[prop];
  },
});

// Legacy export for backward compatibility
export const supabaseClient = supabase;

