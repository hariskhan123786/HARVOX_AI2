import { supabase } from './supabase.js';

let isConnected = false;

export const connectDB = async () => {
  try {
    // Perform a simple check to verify we can contact Supabase
    const { data, error } = await supabase.from('system_settings').select('id').limit(1);
    if (error) throw error;
    isConnected = true;
    console.log('[Supabase DB] Connection check successful.');
  } catch (err) {
    console.error('[Supabase DB] Warning: Connection check failed:', err.message);
    // Keep it true if we just have network lag, or let it retry, but do not exit
    isConnected = false;
  }
};

export const getDBHealth = () => {
  return {
    status: isConnected ? 'ok' : 'degraded',
    state: isConnected ? 'connected' : 'disconnected',
    details: {
      readyState: isConnected ? 1 : 0,
      poolSize: 10,
      host: process.env.SUPABASE_URL || 'unknown',
      dbName: 'Supabase PostgreSQL',
    }
  };
};
