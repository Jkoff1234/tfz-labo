// supabaseClient.js
// Configurazione client Supabase per CRM IPTV

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Placeholder per le credenziali - da sostituire con i valori reali
const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE';

// Verifica che le credenziali siano configurate
if (SUPABASE_URL === 'YOUR_SUPABASE_URL_HERE' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY_HERE') {
  console.error('❌ ERRORE: Configura SUPABASE_URL e SUPABASE_ANON_KEY in supabaseClient.js');
}

// Inizializzazione del client Supabase
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test connessione (opzionale)
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('clients').select('count').limit(1);
    if (error) throw error;
    console.log('✅ Connessione Supabase OK');
    return true;
  } catch (error) {
    console.error('❌ Errore connessione Supabase:', error.message);
    return false;
  }
};