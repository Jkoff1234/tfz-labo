# Integrazione Supabase per CRM IPTV

Questa cartella contiene i moduli JavaScript per integrare Supabase con un frontend HTML/JS vanilla per il CRM IPTV.

## 📁 Struttura File

```
src/lib/
├── supabaseClient.js    # Configurazione client Supabase
├── crmLogic.js         # Logica di business (CRUD operations)
└── main-integration.js # Gestione navigazione e UI
```

## 🚀 Come Usare

### 1. Configurazione HTML

Aggiungi questi script al tuo file HTML (dopo il body):

```html
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CRM IPTV</title>
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 dark:bg-gray-900 min-h-screen">
    <!-- Menu Laterale -->
    <nav class="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg">
        <div class="p-4">
            <h2 class="text-xl font-bold text-gray-800 dark:text-white">CRM IPTV</h2>
        </div>
        <ul class="space-y-2 p-4">
            <li><a href="#" data-section="dashboard" class="block p-3 rounded hover:bg-gray-100 dark:hover:bg-gray-700">📊 Dashboard</a></li>
            <li><a href="#" data-section="clients-list" class="block p-3 rounded hover:bg-gray-100 dark:hover:bg-gray-700">👥 Lista Clienti</a></li>
            <li><a href="#" data-section="add-client" class="block p-3 rounded hover:bg-gray-100 dark:hover:bg-gray-700">➕ Aggiungi Cliente</a></li>
            <li><a href="#" data-section="subscriptions" class="block p-3 rounded hover:bg-gray-100 dark:hover:bg-gray-700">📺 Abbonamenti</a></li>
            <!-- Altri menu items -->
        </ul>
    </nav>

    <!-- Contenuto Principale -->
    <main class="ml-64 p-6">
        <div id="main-content">
            <!-- Il contenuto verrà caricato dinamicamente -->
        </div>
    </main>

    <!-- Container per notifiche -->
    <div id="notification-container" class="fixed top-4 right-4 z-50 space-y-2"></div>

    <!-- Script moduli -->
    <script type="module" src="src/main-integration.js"></script>
</body>
</html>
```

### 2. Configurazione Supabase

Modifica `src/lib/supabaseClient.js`:

```javascript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';
```

### 3. Avvio Applicazione

L'applicazione si avvia automaticamente quando carichi la pagina. Il file `main-integration.js` gestisce:

- ✅ Connessione a Supabase
- ✅ Caricamento dati iniziali
- ✅ Navigazione SPA
- ✅ Gestione form
- ✅ Notifiche utente

## 🔧 API Funzioni

### Clienti

```javascript
import { fetchClients, createNewClient } from './lib/crmLogic.js';

// Carica tutti i clienti
const clients = await fetchClients();

// Crea nuovo cliente
const newClient = await createNewClient({
  name: 'Mario Rossi',
  contact: 'mario@email.com'
});
```

### Abbonamenti

```javascript
import { fetchSubscriptions } from './lib/crmLogic.js';

// Carica tutti gli abbonamenti
const subscriptions = await fetchSubscriptions();
```

### Dashboard

```javascript
import { loadDashboardStats } from './lib/crmLogic.js';

// Carica statistiche
const stats = await loadDashboardStats();
// stats: { totalClients, activeSubscriptions, expiringSubscriptions }
```

## 🎨 Caratteristiche UI

- **Dark Mode Support**: Classi Tailwind per tema scuro
- **Responsive**: Layout adattivo per mobile/desktop
- **Loading States**: Indicatori di caricamento
- **Error Handling**: Notifiche toast per errori/successi
- **SPA Navigation**: Navigazione senza ricaricare la pagina

## 🔒 Sicurezza

- **Row Level Security**: Le query rispettano le policy RLS di Supabase
- **Input Sanitization**: Dati puliti prima dell'invio
- **Error Boundaries**: Gestione errori senza crash dell'app

## 🚀 Deploy

Per deployare su Netlify:

1. **Build**: `npm run build`
2. **Deploy**: Carica la cartella `dist/` su Netlify
3. **Environment Variables**: Configura `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`

## 📝 Note di Sviluppo

- I moduli usano ES6 modules - assicurati che il server supporti `type="module"`
- Le date sono formattate in italiano (DD/MM/YYYY)
- Gli abbonamenti in scadenza sono evidenziati in rosso
- Le notifiche si auto-rimuovono dopo 5 secondi

## 🐛 Troubleshooting

**Errore "Module not found"**: Assicurati che i path dei file siano corretti

**Errore connessione Supabase**: Verifica URL e chiave API

**Dati non si aggiornano**: Controlla la console per errori e assicurati che RLS sia configurato correttamente

---

Questo sistema fornisce una base solida per un CRM dinamico connesso a Supabase! 🎉