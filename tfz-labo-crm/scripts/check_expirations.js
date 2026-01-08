const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

// Configurazione Supabase dalle variabili d'ambiente
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Variabili d\'ambiente Supabase non configurate');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function sendWhatsappMock(phone, message) {
  // Funzione mock per invio WhatsApp - per ora stampa a console
  console.log(`[MOCK WHATSAPP] Inviando a ${phone}: ${message}`);
  return true; // Simula successo
}

async function logEvent(clientId, eventType, description) {
  try {
    const { error } = await supabase
      .from('timeline_events')
      .insert({
        client_id: clientId,
        event_type: eventType,
        description: description,
        created_at: new Date().toISOString()
      });

    if (error) throw error;
    console.log(`Evento loggato per client ${clientId}: ${description}`);
  } catch (error) {
    console.error(`Errore logging evento: ${error.message}`);
  }
}

async function checkExpiringSubscriptions() {
  try {
    const today = new Date();
    const twoDaysFromNow = new Date(today);
    twoDaysFromNow.setDate(today.getDate() + 2);
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);

    // Query per abbonamenti attivi che scadono tra 2 o 7 giorni
    const { data: expiringSubs, error } = await supabase
      .from('subscriptions')
      .select(`
        id,
        client_id,
        end_date,
        mac,
        clients!inner (
          name,
          contact
        )
      `)
      .gte('end_date', today.toISOString().split('T')[0])
      .or(`end_date.eq.${twoDaysFromNow.toISOString().split('T')[0]},end_date.eq.${sevenDaysFromNow.toISOString().split('T')[0]}`);

    if (error) throw error;

    console.log(`Trovati ${expiringSubs.length} abbonamenti in scadenza`);

    for (const sub of expiringSubs) {
      try {
        const endDate = new Date(sub.end_date);
        const daysUntil = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

        let alertType, description;
        if (daysUntil === 2) {
          alertType = "48h";
          description = "Inviato avviso automatico scadenza -48h";
        } else if (daysUntil === 7) {
          alertType = "7 giorni";
          description = "Inviato avviso automatico scadenza -7 giorni";
        } else {
          continue;
        }

        // Genera messaggio personalizzato
        const message = `Ciao ${sub.clients.name}, il tuo abbonamento IPTV (${sub.mac}) scade il ${endDate.toLocaleDateString('it-IT')}. Clicca qui per rinnovare.`;

        // Simula invio WhatsApp
        const success = sendWhatsappMock(sub.clients.contact, message);

        if (success) {
          // Logga l'evento
          await logEvent(sub.client_id, 'alert_sent', description);
        }

      } catch (error) {
        console.error(`Errore elaborazione abbonamento ${sub.id}: ${error.message}`);
        continue;
      }
    }

  } catch (error) {
    console.error(`Errore generale: ${error.message}`);
  }
}

async function main() {
  console.log('Avvio controllo scadenze IPTV...');
  await checkExpiringSubscriptions();
  console.log('Controllo completato.');
}

main();