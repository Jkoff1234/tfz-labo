// crmLogic.js
// Logica di business per CRM IPTV con Supabase

import { supabase } from './supabase.js';

// ====================
// GESTIONE CLIENTI
// ====================

/**
 * Recupera tutti i clienti e popola la tabella HTML
 */
export const fetchClients = async () => {
  try {
    console.log('📥 Caricamento clienti...');

    const { data: clients, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    console.log(`✅ Caricati ${clients.length} clienti`);

    // Popola la tabella HTML
    populateClientsTable(clients);

    return clients;
  } catch (error) {
    console.error('❌ Errore caricamento clienti:', error.message);
    showNotification('Errore caricamento clienti: ' + error.message, 'error');
    return [];
  }
};

/**
 * Popola la tabella HTML con i dati dei clienti
 */
const populateClientsTable = (clients) => {
  const tableBody = document.querySelector('#clients-table tbody');
  if (!tableBody) {
    console.warn('⚠️ Tabella clienti non trovata (#clients-table tbody)');
    return;
  }

  tableBody.innerHTML = ''; // Svuota tabella esistente

  if (clients.length === 0) {
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = `
      <td colspan="4" class="text-center py-8 text-gray-500">
        <div class="flex flex-col items-center">
          <svg class="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
          <p>Nessun cliente trovato</p>
          <p class="text-sm">Aggiungi il primo cliente usando il pulsante "Aggiungi Nuovo"</p>
        </div>
      </td>
    `;
    tableBody.appendChild(emptyRow);
    return;
  }

  clients.forEach(client => {
    const row = document.createElement('tr');
    row.className = 'hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors';

    const createdDate = new Date(client.created_at).toLocaleDateString('it-IT');

    row.innerHTML = `
      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-900">
        ${client.full_name}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
        ${formatContactInfo(client)}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
        ${createdDate}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3 edit-client-btn"
                data-client-id="${client.id}">
          Modifica
        </button>
        <button class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 delete-client-btn"
                data-client-id="${client.id}">
          Elimina
        </button>
      </td>
    `;

    tableBody.appendChild(row);
  });

  // Aggiungi event listeners per i pulsanti
  attachClientButtonListeners();
};

/**
 * Attacca gli event listeners ai pulsanti della tabella clienti
 */
export const attachClientButtonListeners = () => {
  // Event listeners per i pulsanti modifica
  document.querySelectorAll('.edit-client-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const clientId = e.target.getAttribute('data-client-id');
      if (clientId) {
        // Qui dovresti aprire il modal di modifica cliente
        console.log('Modifica cliente:', clientId);
        // Per ora, ricarica la lista clienti
        fetchClients();
      }
    });
  });

  // Event listeners per i pulsanti elimina
  document.querySelectorAll('.delete-client-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const clientId = e.target.getAttribute('data-client-id');
      if (clientId && confirm('Sei sicuro di voler eliminare questo cliente?')) {
        deleteClient(clientId);
      }
    });
  });
};

/**
 * Formatta le informazioni di contatto del cliente
 */
const formatContactInfo = (client) => {
  const contacts = [];
  if (client.email) contacts.push(`📧 ${client.email}`);
  if (client.phone_whatsapp) contacts.push(`📱 ${client.phone_whatsapp}`);

  return contacts.length > 0 ? contacts.join('<br>') : '<span class="text-gray-400">Non specificato</span>';
};

/**
 * Crea un nuovo cliente
 */
export const createNewClient = async (clientData) => {
  try {
    console.log('📝 Creazione nuovo cliente...', clientData);

    const { data, error } = await supabase
      .from('clients')
      .insert([clientData])
      .select();

    if (error) throw error;

    console.log('✅ Cliente creato:', data[0]);
    showNotification(`Cliente "${clientData.full_name}" creato con successo!`, 'success');

    // Ricarica la lista clienti
    await fetchClients();

    return data[0];
  } catch (error) {
    console.error('❌ Errore creazione cliente:', error.message);
    showNotification('Errore creazione cliente: ' + error.message, 'error');
    throw error;
  }
};

/**
 * Elimina un cliente
 */
export const deleteClient = async (clientId) => {
  if (!confirm('Sei sicuro di voler eliminare questo cliente? Questa azione non può essere annullata.')) {
    return;
  }

  try {
    console.log('🗑️ Eliminazione cliente...', clientId);

    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', clientId);

    if (error) throw error;

    console.log('✅ Cliente eliminato');
    showNotification('Cliente eliminato con successo!', 'success');

    // Ricarica la lista clienti
    await fetchClients();
  } catch (error) {
    console.error('❌ Errore eliminazione cliente:', error.message);
    showNotification('Errore eliminazione cliente: ' + error.message, 'error');
  }
};

// ====================
// GESTIONE ABBONAMENTI
// ====================

/**
 * Recupera tutti gli abbonamenti con evidenziazione scadenze
 */
export const fetchSubscriptions = async () => {
  try {
    console.log('📥 Caricamento abbonamenti...');

    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        clients (
          full_name
        )
      `)
      .order('end_date', { ascending: false });

    if (error) throw error;

    console.log(`✅ Caricati ${subscriptions.length} abbonamenti`);

    // Popola la tabella HTML
    populateSubscriptionsTable(subscriptions);

    return subscriptions;
  } catch (error) {
    console.error('❌ Errore caricamento abbonamenti:', error.message);
    showNotification('Errore caricamento abbonamenti: ' + error.message, 'error');
    return [];
  }
};

/**
 * Recupera tutti i tickets con informazioni cliente
 */
export const fetchTickets = async () => {
  try {
    console.log('🎫 Caricamento tickets...');

    const { data: tickets, error } = await supabase
      .from('tickets')
      .select(`
        *,
        clients (
          full_name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    console.log(`✅ Caricati ${tickets.length} tickets`);

    // Popola la tabella HTML
    populateTicketsTable(tickets);

    return tickets;
  } catch (error) {
    console.error('❌ Errore caricamento tickets:', error.message);
    showNotification('Errore caricamento tickets: ' + error.message, 'error');
    throw error;
  }
};

/**
 * Popola la tabella HTML degli abbonamenti con evidenziazione scadenze
 */
const populateSubscriptionsTable = (subscriptions) => {
  const tableBody = document.querySelector('#subscriptions-table tbody');
  if (!tableBody) {
    console.warn('⚠️ Tabella abbonamenti non trovata (#subscriptions-table tbody)');
    return;
  }

  tableBody.innerHTML = ''; // Svuota tabella esistente

  if (subscriptions.length === 0) {
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = `
      <td colspan="6" class="text-center py-8 text-gray-500">
        <div class="flex flex-col items-center">
          <svg class="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <p>Nessun abbonamento trovato</p>
          <p class="text-sm">Gli abbonamenti appariranno qui quando verranno creati</p>
        </div>
      </td>
    `;
    tableBody.appendChild(emptyRow);
    return;
  }

  const now = new Date();
  const twoDaysFromNow = new Date(now.getTime() + (2 * 24 * 60 * 60 * 1000));

  subscriptions.forEach(sub => {
    const endDate = new Date(sub.end_date);
    const isExpiringSoon = endDate <= twoDaysFromNow && endDate >= now;
    const isExpired = endDate < now;

    let statusClass = 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
    let statusText = 'Attivo';

    if (!sub.active) {
      statusClass = 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-300';
      statusText = 'Sospeso';
    } else if (isExpired) {
      statusClass = 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      statusText = 'Scaduto';
    } else if (isExpiringSoon) {
      statusClass = 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      statusText = 'In Scadenza';
    }

    const row = document.createElement('tr');
    row.className = `${isExpiringSoon || isExpired ? 'bg-red-50 dark:bg-red-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700'} transition-colors`;

    const startDateFormatted = new Date(sub.start_date).toLocaleDateString('it-IT');
    const endDateFormatted = endDate.toLocaleDateString('it-IT');

    row.innerHTML = `
      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-900">
        ${sub.clients?.full_name || 'Cliente non trovato'}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
        ${sub.username_iptv}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
        ${sub.package_name || '-'}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
        ${startDateFormatted}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
        ${endDateFormatted}
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusClass}">
          ${statusText}
        </span>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3 edit-subscription-btn"
                data-subscription-id="${sub.id}">
          Modifica
        </button>
        <button class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 delete-subscription-btn"
                data-subscription-id="${sub.id}">
          Elimina
        </button>
      </td>
    `;

    tableBody.appendChild(row);
  });

  // Aggiungi event listeners per i pulsanti
  attachSubscriptionButtonListeners();
};

/**
 * Popola la tabella HTML dei tickets
 */
const populateTicketsTable = (tickets) => {
  const tableBody = document.querySelector('#tickets-table tbody');
  if (!tableBody) {
    console.warn('⚠️ Tabella tickets non trovata (#tickets-table tbody)');
    return;
  }

  tableBody.innerHTML = ''; // Svuota tabella esistente

  if (tickets.length === 0) {
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = `
      <td colspan="6" class="text-center py-8 text-gray-500">
        <div class="flex flex-col items-center">
          <svg class="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 9.192L12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z"></path>
          </svg>
          <p>Nessun ticket trovato</p>
          <p class="text-sm">I ticket di supporto appariranno qui quando verranno creati</p>
        </div>
      </td>
    `;
    tableBody.appendChild(emptyRow);
    return;
  }

  tickets.forEach(ticket => {
    const createdDate = new Date(ticket.created_at).toLocaleDateString('it-IT');

    // Classi per priorità
    let priorityClass = 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-300';
    if (ticket.priority === 'high') priorityClass = 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300';
    if (ticket.priority === 'urgent') priorityClass = 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';

    // Classi per stato
    let statusClass = 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
    if (ticket.status === 'in_progress') statusClass = 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
    if (ticket.status === 'resolved') statusClass = 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';

    const row = document.createElement('tr');
    row.className = 'hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors';

    row.innerHTML = `
      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-900">
        ${ticket.clients?.full_name || 'Cliente non trovato'}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
        ${ticket.subject}
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${priorityClass}">
          ${ticket.priority === 'low' ? 'Bassa' : ticket.priority === 'medium' ? 'Media' : ticket.priority === 'high' ? 'Alta' : 'Urgente'}
        </span>
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusClass}">
          ${ticket.status === 'open' ? 'Aperto' : ticket.status === 'in_progress' ? 'In Lavorazione' : 'Risolto'}
        </span>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
        ${createdDate}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3 edit-ticket-btn"
                data-ticket-id="${ticket.id}">
          Modifica
        </button>
        <button class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 delete-ticket-btn"
                data-ticket-id="${ticket.id}">
          Elimina
        </button>
      </td>
    `;

    tableBody.appendChild(row);
  });

  // Aggiungi event listeners per i pulsanti
  attachTicketButtonListeners();
};

// ====================
// DASHBOARD STATISTICHE
// ====================

/**
 * Carica le statistiche per la dashboard
 */
export const loadDashboardStats = async () => {
  try {
    console.log('📊 Caricamento statistiche dashboard...');

    const now = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const twoDaysFromNow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Query parallele per performance
    const [clientsResult, activeSubsResult, expiringSubsResult] = await Promise.all([
      // Totale clienti
      supabase.from('clients').select('id', { count: 'exact', head: true }),

      // Abbonamenti attivi (end_date >= oggi)
      supabase.from('subscriptions').select('id', { count: 'exact', head: true }).gte('end_date', now),

      // Abbonamenti in scadenza (end_date <= 2 giorni da oggi E >= oggi)
      supabase.from('subscriptions').select('id', { count: 'exact', head: true })
        .gte('end_date', now)
        .lte('end_date', twoDaysFromNow)
    ]);

    if (clientsResult.error) throw clientsResult.error;
    if (activeSubsResult.error) throw activeSubsResult.error;
    if (expiringSubsResult.error) throw expiringSubsResult.error;

    const stats = {
      totalClients: clientsResult.count || 0,
      activeSubscriptions: activeSubsResult.count || 0,
      expiringSubscriptions: expiringSubsResult.count || 0
    };

    console.log('✅ Statistiche caricate:', stats);

    // Aggiorna l'UI della dashboard
    updateDashboardUI(stats);

    return stats;
  } catch (error) {
    console.error('❌ Errore caricamento statistiche:', error.message);
    showNotification('Errore caricamento statistiche: ' + error.message, 'error');
    return null;
  }
};

/**
 * Aggiorna l'interfaccia della dashboard con le statistiche
 */
const updateDashboardUI = (stats) => {
  // Aggiorna i contatori nelle card
  const totalClientsEl = document.querySelector('#total-clients');
  const activeSubsEl = document.querySelector('#active-subscriptions');
  const expiringSubsEl = document.querySelector('#expiring-subscriptions');

  if (totalClientsEl) totalClientsEl.textContent = stats.totalClients;
  if (activeSubsEl) activeSubsEl.textContent = stats.activeSubscriptions;
  if (expiringSubsEl) {
    expiringSubsEl.textContent = stats.expiringSubscriptions;
    // Evidenzia se ci sono scadenze urgenti
    if (stats.expiringSubscriptions > 0) {
      expiringSubsEl.classList.add('text-red-600', 'font-bold');
    } else {
      expiringSubsEl.classList.remove('text-red-600', 'font-bold');
    }
  }
};

// ====================
// UTILITIES
// ====================

/**
 * Mostra una notifica all'utente
 */
const showNotification = (message, type = 'info') => {
  // Crea elemento notifica se non esiste
  let notificationContainer = document.querySelector('#notification-container');
  if (!notificationContainer) {
    notificationContainer = document.createElement('div');
    notificationContainer.id = 'notification-container';
    notificationContainer.className = 'fixed top-4 right-4 z-50 space-y-2';
    document.body.appendChild(notificationContainer);
  }

  const notification = document.createElement('div');
  notification.className = `p-4 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full ${
    type === 'success' ? 'bg-green-500 text-white' :
    type === 'error' ? 'bg-red-500 text-white' :
    'bg-blue-500 text-white'
  }`;

  notification.innerHTML = `
    <div class="flex items-center">
      <span>${message}</span>
      <button class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
  `;

  notificationContainer.appendChild(notification);

  // Animazione entrata
  setTimeout(() => {
    notification.classList.remove('translate-x-full');
  }, 100);

  // Auto-rimuovi dopo 5 secondi
  setTimeout(() => {
    notification.classList.add('translate-x-full');
    setTimeout(() => notification.remove(), 300);
  }, 5000);
};

/**
 * Attacca event listeners ai pulsanti dei clienti
 */
const attachSubscriptionButtonListeners = () => {
  // Pulsanti modifica
  document.querySelectorAll('.edit-subscription-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const subscriptionId = e.target.dataset.subscriptionId;
      console.log('Modifica abbonamento:', subscriptionId);
      window.handleTableAction('edit', 'subscriptions', subscriptionId);
    });
  });

  // Pulsanti elimina
  document.querySelectorAll('.delete-subscription-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const subscriptionId = e.target.dataset.subscriptionId;
      window.handleTableAction('delete', 'subscriptions', subscriptionId);
    });
  });
};

// ====================
// INIZIALIZZAZIONE
// ====================

/**
 * Inizializza l'applicazione CRM
 */
export const initCRM = async () => {
  console.log('🚀 Inizializzazione CRM IPTV...');

  // Test connessione
  const connected = await testConnection();
  if (!connected) {
    showNotification('Impossibile connettersi al database. Controlla la configurazione.', 'error');
    return;
  }

  // Carica dati iniziali
  await loadDashboardStats();

  console.log('✅ CRM inizializzato');
};

const attachTicketButtonListeners = () => {
  // Pulsanti modifica
  document.querySelectorAll('.edit-ticket-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const ticketId = e.target.dataset.ticketId;
      console.log('Modifica ticket:', ticketId);
      window.handleTableAction('edit', 'tickets', ticketId);
    });
  });

  // Pulsanti elimina
  document.querySelectorAll('.delete-ticket-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const ticketId = e.target.dataset.ticketId;
      window.handleTableAction('delete', 'tickets', ticketId);
    });
  });
};

// Export delle funzioni principali
export default {
  initCRM,
  fetchClients,
  createNewClient,
  fetchSubscriptions,
  loadDashboardStats,
  fetchTickets,
  attachClientButtonListeners,
  deleteClient,};