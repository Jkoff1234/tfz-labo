# Script Controllo Scadenze IPTV

Questo script Node.js controlla automaticamente le scadenze degli abbonamenti IPTV e invia notifiche WhatsApp simulate.

## Installazione

1. Installa le dipendenze:
```bash
npm install @supabase/supabase-js dotenv
```

2. Assicurati che le variabili d'ambiente siano configurate (stesso .env del progetto principale):
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Esecuzione

### Test manuale:
```bash
node check_expirations.js
```

### Cron Job (Linux/Mac):
Aggiungi al crontab per esecuzione quotidiana alle 9:00:
```bash
0 9 * * * /usr/bin/node /path/to/check_expirations.js
```

### Task Scheduler (Windows):
1. Apri Task Scheduler
2. Crea nuova task
3. Trigger: Daily at 9:00 AM
4. Action: Start a program
   - Program: node.exe
   - Arguments: check_expirations.js
   - Start in: path/to/scripts/folder

## Logica

- Controlla abbonamenti attivi che scadono tra 2 o 7 giorni
- Invia messaggio WhatsApp mock (stampa a console)
- Registra evento in `timeline_events`
- Gestisce errori per singolo cliente senza bloccare tutto

## Note

- Per produzione, sostituire `sendWhatsappMock()` con API WhatsApp reale
- Usa le stesse credenziali Supabase del frontend
- Adattato per lo schema DB esistente: clients.name, clients.contact, subscriptions.mac
- Filtra abbonamenti con end_date futura (considerati attivi)