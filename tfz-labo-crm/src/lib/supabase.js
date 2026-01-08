import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(url, key)

// Test connessione (opzionale)
export const testConnection = async () => {
  try {
    console.log('🔍 Test connessione Supabase...');

    const { data, error } = await supabase
      .from('clients')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Errore connessione Supabase:', error.message);
      return false;
    }

    console.log('✅ Connessione Supabase OK');
    return true;
  } catch (error) {
    console.error('❌ Errore test connessione:', error.message);
    return false;
  }
};

export default supabase
