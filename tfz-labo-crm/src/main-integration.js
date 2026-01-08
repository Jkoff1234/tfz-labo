// main.js
// File principale per l'integrazione Supabase con CRM IPTV
// Questo file collega la logica di business con l'interfaccia utente

import { initCRM, fetchClients, createNewClient, fetchSubscriptions, loadDashboardStats } from './lib/crmLogic.js';

// ====================
// GESTIONE NAVIGAZIONE
// ====================

/**
 * Gestisce i click sul menu laterale
 */
const setupNavigation = () => {
  const menuItems = document.querySelectorAll('[data-section]');

  menuItems.forEach(item => {
    item.addEventListener('click', async (e) => {
      e.preventDefault();

      const section = item.dataset.section;
      console.log('Navigazione verso sezione:', section);

      // Rimuovi classe attiva da tutti gli elementi
      menuItems.forEach(mi => mi.classList.remove('active'));
      // Aggiungi classe attiva all'elemento cliccato
      item.classList.add('active');

      // Carica il contenuto della sezione
      await loadSection(section);
    });
  });
};

/**
 * Carica il contenuto di una sezione specifica
 */
const loadSection = async (section) => {
  const contentArea = document.querySelector('#main-content');
  if (!contentArea) {
    console.error('Area contenuto principale non trovata (#main-content)');
    return;
  }

  // Mostra loader
  contentArea.innerHTML = `
    <div class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      <span class="ml-3 text-gray-600 dark:text-gray-300">Caricamento...</span>
    </div>
  `;

  try {
    switch (section) {
      case 'dashboard':
        await loadDashboardContent();
        break;

      case 'clients-list':
        await loadClientsContent();
        break;

      case 'add-client':
        await loadAddClientContent();
        break;

      case 'subscriptions':
        await loadSubscriptionsContent();
        break;

      case 'tickets':
        await loadTicketsContent();
        break;

      default:
        contentArea.innerHTML = `
          <div class="text-center py-12">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Sezione in Sviluppo</h2>
            <p class="text-gray-600 dark:text-gray-300">Questa sezione sarà disponibile a breve.</p>
          </div>
        `;
    }
  } catch (error) {
    console.error('Errore caricamento sezione:', error);
    contentArea.innerHTML = `
      <div class="text-center py-12">
        <div class="text-red-600 dark:text-red-400 mb-4">
          <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>
        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Errore di Caricamento</h2>
        <p class="text-gray-600 dark:text-gray-300">${error.message}</p>
      </div>
    `;
  }
};

// ====================
// CONTENUTI SEZIONI
// ====================

/**
 * Carica il contenuto della dashboard
 */
const loadDashboardContent = async () => {
  const contentArea = document.querySelector('#main-content');

  contentArea.innerHTML = `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <button onclick="loadDashboardStats()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors">
          🔄 Aggiorna
        </button>
      </div>

      <!-- Stat Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div class="flex items-center">
            <div class="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <svg class="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Totale Clienti</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white" id="total-clients">-</p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div class="flex items-center">
            <div class="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <svg class="w-6 h-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Abbonamenti Attivi</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white" id="active-subscriptions">-</p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div class="flex items-center">
            <div class="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
              <svg class="w-6 h-6 text-red-600 dark:text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">In Scadenza (48h)</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white" id="expiring-subscriptions">-</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Placeholder per grafici futuri -->
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Grafici e Analisi</h3>
        <p class="text-gray-600 dark:text-gray-300">I grafici interattivi saranno disponibili nella prossima versione.</p>
      </div>
    </div>
  `;

  // Carica le statistiche
  await loadDashboardStats();
};

/**
 * Carica il contenuto della lista clienti
 */
const loadClientsContent = async () => {
  const contentArea = document.querySelector('#main-content');

  contentArea.innerHTML = `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Lista Clienti</h1>
        <div class="flex space-x-3">
          <button onclick="fetchClients()" class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
            🔄 Aggiorna
          </button>
          <button onclick="loadSection('add-client')" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors">
            ➕ Aggiungi Cliente
          </button>
        </div>
      </div>

      <!-- Tabella Clienti -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700" id="clients-table">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Nome
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Contatto
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Data Creazione
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <!-- I dati verranno popolati dinamicamente -->
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  // Carica i clienti
  await fetchClients();
};

/**
 * Carica il contenuto del form aggiungi cliente
 */
const loadAddClientContent = async () => {
  const contentArea = document.querySelector('#main-content');

  contentArea.innerHTML = `
    <div class="max-w-2xl mx-auto space-y-6">
      <!-- Header -->
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Aggiungi Nuovo Cliente</h1>
        <p class="mt-2 text-gray-600 dark:text-gray-300">Inserisci i dati del nuovo cliente nel sistema</p>
      </div>

      <!-- Form -->
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <form id="add-client-form" class="space-y-6">
          <div>
            <label for="client-full-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nome Completo *
            </label>
            <input
              type="text"
              id="client-full-name"
              name="full_name"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              placeholder="Inserisci il nome completo del cliente"
            >
          </div>

          <div>
            <label for="client-email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email (Opzionale)
            </label>
            <input
              type="email"
              id="client-email"
              name="email"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              placeholder="cliente@email.com"
            >
          </div>

          <div>
            <label for="client-phone-whatsapp" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Telefono WhatsApp (Opzionale)
            </label>
            <input
              type="tel"
              id="client-phone-whatsapp"
              name="phone_whatsapp"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              placeholder="+39 123 456 7890"
            >
          </div>

          <div>
            <label for="client-notes" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Note (Opzionale)
            </label>
            <textarea
              id="client-notes"
              name="notes"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              placeholder="Note aggiuntive sul cliente..."
            ></textarea>
          </div>

          <div class="flex justify-end space-x-3">
            <button
              type="button"
              onclick="loadSection('clients-list')"
              class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
            >
              Aggiungi Cliente
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  // Gestisci submit del form
  const form = document.getElementById('add-client-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const clientData = {
      full_name: formData.get('full_name').trim(),
      email: formData.get('email').trim() || null,
      phone_whatsapp: formData.get('phone_whatsapp').trim() || null,
      notes: formData.get('notes').trim() || null
    };

    try {
      await createNewClient(clientData);
      form.reset();
      // Torna alla lista clienti dopo l'aggiunta
      setTimeout(() => loadSection('clients-list'), 1500);
    } catch (error) {
      // L'errore è già gestito nella funzione createNewClient
    }
  });
};

/**
 * Carica il contenuto degli abbonamenti
 */
const loadSubscriptionsContent = async () => {
  const contentArea = document.querySelector('#main-content');

  contentArea.innerHTML = `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Abbonamenti & Linee</h1>
        <div class="flex space-x-3">
          <button onclick="fetchSubscriptions()" class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
            🔄 Aggiorna
          </button>
          <button onclick="loadSection('add-subscription')" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors">
            ➕ Nuovo Abbonamento
          </button>
        </div>
      </div>

      <!-- Tabella Abbonamenti -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700" id="subscriptions-table">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Cliente
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Username IPTV
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Pacchetto
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Data Inizio
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Data Scadenza
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Stato
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <!-- I dati verranno popolati dinamicamente -->
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  // Carica gli abbonamenti
  await fetchSubscriptions();
};

/**
 * Carica il contenuto della sezione tickets
 */
const loadTicketsContent = async () => {
  const contentArea = document.querySelector('#main-content');

  contentArea.innerHTML = `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Ticket Supporto</h1>
        <div class="flex space-x-3">
          <button onclick="fetchTickets()" class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
            🔄 Aggiorna
          </button>
          <button onclick="openTicketModal()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors">
            ➕ Nuovo Ticket
          </button>
        </div>
      </div>

      <!-- Tabella Tickets -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700" id="tickets-table">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Cliente
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Oggetto
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Priorità
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Stato
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Data Creazione
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <!-- I dati verranno popolati dinamicamente -->
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  // Carica i tickets
  await fetchTickets();
};

// ====================
// INIZIALIZZAZIONE
// ====================

/**
 * Inizializza l'applicazione quando il DOM è pronto
 */
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Avvio applicazione CRM IPTV...');

  // Setup navigazione
  setupNavigation();

  // Inizializza CRM (connessione DB, dati iniziali)
  await initCRM();

  // Carica dashboard come pagina iniziale
  await loadSection('dashboard');

  console.log('✅ Applicazione CRM pronta!');
});

// ====================
// GESTIONE MODALI CRUD
// ====================

import { saveClient, saveSubscription, deleteItem, loadClientForEdit, loadSubscriptionForEdit, loadClientsForDropdown, saveTicket, loadTicketForEdit } from './lib/crmController.js';

/**
 * Apre la modale per nuovo cliente
 */
window.openClientModal = function(clientId = null) {
  const modal = document.getElementById('client-modal');
  const title = document.getElementById('client-modal-title');
  const form = document.getElementById('client-form');

  if (clientId) {
    // Modifica cliente esistente
    title.textContent = 'Modifica Cliente';
    loadClientForEdit(clientId).then(client => {
      if (client) {
        form['full_name'].value = client.full_name || '';
        form['phone_whatsapp'].value = client.phone_whatsapp || '';
        form['notes'].value = client.notes || '';
        form['status'].value = client.status || 'active';
        form.dataset.clientId = clientId;
      }
    });
  } else {
    // Nuovo cliente
    title.textContent = 'Nuovo Cliente';
    form.reset();
    delete form.dataset.clientId;
  }

  modal.classList.remove('hidden');
};

/**
 * Chiude la modale cliente
 */
window.closeClientModal = function() {
  const modal = document.getElementById('client-modal');
  modal.classList.add('hidden');
};

/**
 * Apre la modale per nuovo abbonamento
 */
window.openSubscriptionModal = function(subscriptionId = null) {
  const modal = document.getElementById('subscription-modal');
  const title = document.getElementById('subscription-modal-title');
  const form = document.getElementById('subscription-form');

  // Carica la lista clienti per il dropdown
  loadClientsForDropdown().then(clients => {
    const select = form['client_id'];
    select.innerHTML = '<option value="">Seleziona un cliente...</option>';
    clients.forEach(client => {
      const option = document.createElement('option');
      option.value = client.id;
      option.textContent = client.full_name;
      select.appendChild(option);
    });
  });

  if (subscriptionId) {
    // Modifica abbonamento esistente
    title.textContent = 'Modifica Abbonamento';
    loadSubscriptionForEdit(subscriptionId).then(sub => {
      if (sub) {
        form['client_id'].value = sub.client_id;
        form['username_iptv'].value = sub.username_iptv || '';
        form['password_iptv'].value = sub.password_iptv || '';
        form['price'].value = sub.price || '';
        form['start_date'].value = sub.start_date ? sub.start_date.split('T')[0] : '';
        form['end_date'].value = sub.end_date ? sub.end_date.split('T')[0] : '';
        form.dataset.subscriptionId = subscriptionId;
      }
    });
  } else {
    // Nuovo abbonamento
    title.textContent = 'Nuovo Abbonamento';
    form.reset();

    // Imposta date di default
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const nextMonthStr = nextMonth.toISOString().split('T')[0];

    form['start_date'].value = today;
    form['end_date'].value = nextMonthStr;

    delete form.dataset.subscriptionId;
  }

  modal.classList.remove('hidden');
};

/**
 * Chiude la modale abbonamento
 */
window.closeSubscriptionModal = function() {
  const modal = document.getElementById('subscription-modal');
  modal.classList.add('hidden');
};

/**
 * Apre la modale per nuovo ticket
 */
window.openTicketModal = function(ticketId = null) {
  const modal = document.getElementById('ticket-modal');
  const title = document.getElementById('ticket-modal-title');
  const form = document.getElementById('ticket-form');

  // Carica la lista clienti per il dropdown
  loadClientsForDropdown().then(clients => {
    const select = form['client_id'];
    select.innerHTML = '<option value="">Seleziona un cliente...</option>';
    clients.forEach(client => {
      const option = document.createElement('option');
      option.value = client.id;
      option.textContent = client.full_name;
      select.appendChild(option);
    });
  });

  if (ticketId) {
    // Modifica ticket esistente
    title.textContent = 'Modifica Ticket';
    loadTicketForEdit(ticketId).then(ticket => {
      if (ticket) {
        form['client_id'].value = ticket.client_id;
        form['subject'].value = ticket.subject || '';
        form['priority'].value = ticket.priority || 'medium';
        form['status'].value = ticket.status || 'open';
        form.dataset.ticketId = ticketId;
      }
    });
  } else {
    // Nuovo ticket
    title.textContent = 'Nuovo Ticket';
    form.reset();
    delete form.dataset.ticketId;
  }

  modal.classList.remove('hidden');
};

/**
 * Chiude la modale ticket
 */
window.closeTicketModal = function() {
  const modal = document.getElementById('ticket-modal');
  modal.classList.add('hidden');
};

/**
 * Gestisce il submit del form cliente
 */
document.addEventListener('DOMContentLoaded', () => {
  const clientForm = document.getElementById('client-form');
  if (clientForm) {
    clientForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(clientForm);
      const data = Object.fromEntries(formData);
      const clientId = clientForm.dataset.clientId;

      const success = await saveClient(data, clientId);
      if (success) {
        closeClientModal();
      }
    });
  }

  const subscriptionForm = document.getElementById('subscription-form');
  if (subscriptionForm) {
    subscriptionForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(subscriptionForm);
      const data = Object.fromEntries(formData);
      const subscriptionId = subscriptionForm.dataset.subscriptionId;

      const success = await saveSubscription(data, subscriptionId);
      if (success) {
        closeSubscriptionModal();
      }
    });
  }

  const ticketForm = document.getElementById('ticket-form');
  if (ticketForm) {
    ticketForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(ticketForm);
      const data = Object.fromEntries(formData);
      const ticketId = ticketForm.dataset.ticketId;

      const success = await saveTicket(data, ticketId);
      if (success) {
        closeTicketModal();
      }
    });
  }
});

/**
 * Gestisce i click sui pulsanti edit/delete nelle tabelle
 */
window.handleTableAction = function(action, table, id) {
  if (action === 'edit') {
    if (table === 'clients') {
      openClientModal(id);
    } else if (table === 'subscriptions') {
      openSubscriptionModal(id);
    } else if (table === 'tickets') {
      openTicketModal(id);
    }
  } else if (action === 'delete') {
    deleteItem(table, id);
  }
};

// ====================
// ESPORTAZIONI GLOBALI
// ====================

// Rendi alcune funzioni disponibili globalmente per l'uso negli event handlers HTML
window.loadSection = loadSection;
window.fetchClients = fetchClients;
window.createNewClient = createNewClient;
window.fetchSubscriptions = fetchSubscriptions;
window.loadDashboardStats = loadDashboardStats;
window.openClientModal = openClientModal;
window.openSubscriptionModal = openSubscriptionModal;
window.openTicketModal = openTicketModal;
window.fetchTickets = fetchTickets;