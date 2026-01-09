import { supabase } from './supabase.js'

/**
 * Salva un cliente (nuovo o modifica esistente)
 * @param {Object} formData - Dati del form cliente
 * @param {string|number} [clientId] - ID del cliente se modifica
 * @returns {Promise<boolean>} True se riuscito
 */
export async function saveClient(formData, clientId = null) {
  try {
    console.log(`${clientId ? '📝 Modifica' : '➕ Creazione'} cliente...`, formData)

    const clientData = {
      full_name: formData.full_name?.trim(),
      phone_whatsapp: formData.phone_whatsapp?.trim() || null,
      notes: formData.notes?.trim() || null,
      status: formData.status || 'active'
    }

    let result
    if (clientId) {
      // Modifica esistente
      result = await supabase
        .from('clients')
        .update(clientData)
        .eq('id', clientId)
        .select()
    } else {
      // Nuovo cliente
      result = await supabase
        .from('clients')
        .insert([clientData])
        .select()
    }

    if (result.error) throw result.error

    console.log('✅ Cliente salvato:', result.data[0])
    alert(`Cliente ${clientId ? 'modificato' : 'creato'} con successo!`)

    // Ricarica i dati
    window.dispatchEvent(new Event('data-updated'))

    return true
  } catch (error) {
    console.error('❌ Errore salvataggio cliente:', error.message)
    alert('Errore salvataggio cliente: ' + error.message)
    return false
  }
}

/**
 * Salva un abbonamento (nuovo o modifica esistente)
 * @param {Object} formData - Dati del form abbonamento
 * @param {string|number} [subscriptionId] - ID dell'abbonamento se modifica
 * @returns {Promise<boolean>} True se riuscito
 */
export async function saveSubscription(formData, subscriptionId = null) {
  try {
    console.log(`${subscriptionId ? '📝 Modifica' : '➕ Creazione'} abbonamento...`, formData)

    const subscriptionData = {
      client_id: parseInt(formData.client_id),
      username_iptv: formData.username_iptv?.trim(),
      password_iptv: formData.password_iptv?.trim() || null,
      server_url: formData.server_url?.trim() || null,
      start_date: formData.start_date,
      end_date: formData.end_date,
      package_name: formData.package_name?.trim() || null,
      price: parseFloat(formData.price) || 0,
      is_trial: formData.is_trial === 'true' || false,
      active: formData.active !== 'false' // Default true
    }

    let result
    if (subscriptionId) {
      // Modifica esistente
      result = await supabase
        .from('subscriptions')
        .update(subscriptionData)
        .eq('id', subscriptionId)
        .select()
    } else {
      // Nuovo abbonamento
      result = await supabase
        .from('subscriptions')
        .insert([subscriptionData])
        .select()
    }

    if (result.error) throw result.error

    console.log('✅ Abbonamento salvato:', result.data[0])
    alert(`Abbonamento ${subscriptionId ? 'modificato' : 'creato'} con successo!`)

    // Ricarica i dati
    window.dispatchEvent(new Event('data-updated'))

    return true
  } catch (error) {
    console.error('❌ Errore salvataggio abbonamento:', error.message)
    alert('Errore salvataggio abbonamento: ' + error.message)
    return false
  }
}

/**
 * Elimina un elemento da una tabella
 * @param {string} table - Nome della tabella ('clients' o 'subscriptions')
 * @param {string|number} id - ID dell'elemento da eliminare
 * @returns {Promise<boolean>} True se riuscito
 */
export async function deleteItem(table, id) {
  try {
    const itemType = table === 'clients' ? 'cliente' : 'abbonamento'

    // Conferma eliminazione
    const confirmed = confirm(`Sei sicuro di voler eliminare questo ${itemType}? Questa azione non può essere annullata.`)

    if (!confirmed) return false

    console.log(`🗑️ Eliminazione ${itemType} ID: ${id}`)

    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)

    if (error) throw error

    console.log(`✅ ${itemType} eliminato con successo`)
    alert(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} eliminato con successo!`)

    // Ricarica i dati
    window.dispatchEvent(new Event('data-updated'))

    return true
  } catch (error) {
    console.error(`❌ Errore eliminazione ${table}:`, error.message)
    alert(`Errore eliminazione: ${error.message}`)
    return false
  }
}

/**
 * Carica i dati di un cliente per la modifica
 * @param {string|number} clientId - ID del cliente
 * @returns {Promise<Object|null>} Dati del cliente o null se errore
 */
export async function loadClientForEdit(clientId) {
  try {
    console.log('📥 Caricamento dati cliente per modifica:', clientId)

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single()

    if (error) throw error

    console.log('✅ Dati cliente caricati:', data)
    return data
  } catch (error) {
    console.error('❌ Errore caricamento cliente:', error.message)
    alert('Errore caricamento dati cliente: ' + error.message)
    return null
  }
}

/**
 * Carica i dati di un abbonamento per la modifica
 * @param {string|number} subscriptionId - ID dell'abbonamento
 * @returns {Promise<Object|null>} Dati dell'abbonamento o null se errore
 */
export async function loadSubscriptionForEdit(subscriptionId) {
  try {
    console.log('📥 Caricamento dati abbonamento per modifica:', subscriptionId)

    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        clients (
          full_name
        )
      `)
      .eq('id', subscriptionId)
      .single()

    if (error) throw error

    console.log('✅ Dati abbonamento caricati:', data)
    return data
  } catch (error) {
    console.error('❌ Errore caricamento abbonamento:', error.message)
    alert('Errore caricamento dati abbonamento: ' + error.message)
    return null
  }
}

/**
 * Carica la lista dei clienti per il dropdown
 * @returns {Promise<Array>} Array di clienti con id e full_name
 */
export async function loadClientsForDropdown() {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('id, full_name')
      .order('full_name', { ascending: true })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('❌ Errore caricamento clienti per dropdown:', error.message)
    return []
  }
}

/**
 * Carica gli abbonamenti per il dropdown
 * @returns {Promise<Array>} Array di abbonamenti
 */
export async function loadSubscriptionsForDropdown() {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('id, username_iptv, package_name')
      .order('username_iptv', { ascending: true })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('❌ Errore caricamento abbonamenti per dropdown:', error.message)
    return []
  }
}

/**
 * Salva un ticket (nuovo o modifica esistente)
 * @param {Object} formData - Dati del form ticket
 * @param {string|number} [ticketId] - ID del ticket se modifica
 * @returns {Promise<boolean>} True se riuscito
 */
export async function saveTicket(formData, ticketId = null) {
  try {
    console.log(`${ticketId ? '📝 Modifica' : '➕ Creazione'} ticket...`, formData)

    const ticketData = {
      client_id: parseInt(formData.client_id),
      subject: formData.subject?.trim(),
      priority: formData.priority || 'medium',
      status: formData.status || 'open'
    }

    let result
    if (ticketId) {
      // Modifica esistente
      result = await supabase
        .from('tickets')
        .update(ticketData)
        .eq('id', ticketId)
        .select()
    } else {
      // Nuovo ticket
      result = await supabase
        .from('tickets')
        .insert([ticketData])
        .select()
    }

    if (result.error) throw result.error

    console.log('✅ Ticket salvato:', result.data[0])
    alert(`Ticket ${ticketId ? 'modificato' : 'creato'} con successo!`)

    // Inserisci evento nella timeline se è un nuovo ticket
    if (!ticketId) {
      const { error: timelineError } = await supabase
        .from('timeline_events')
        .insert([{
          client_id: parseInt(formData.client_id),
          event_type: 'ticket_opened',
          description: `Aperto ticket: ${formData.subject?.trim()}`
        }])

      if (timelineError) console.warn('Errore inserimento timeline:', timelineError)
    }

    // Ricarica i dati
    window.dispatchEvent(new Event('data-updated'))

    return true
  } catch (error) {
    console.error('❌ Errore salvataggio ticket:', error.message)
    alert('Errore salvataggio ticket: ' + error.message)
    return false
  }
}

/**
 * Carica i dati di un ticket per la modifica
 * @param {string|number} ticketId - ID del ticket
 * @returns {Promise<Object|null>} Dati del ticket o null se errore
 */
export async function loadTicketForEdit(ticketId) {
  try {
    console.log('📥 Caricamento dati ticket per modifica:', ticketId)

    const { data, error } = await supabase
      .from('tickets')
      .select(`
        *,
        clients (
          full_name
        )
      `)
      .eq('id', ticketId)
      .single()

    if (error) throw error

    console.log('✅ Dati ticket caricati:', data)
    return data
  } catch (error) {
    console.error('❌ Errore caricamento ticket:', error.message)
    alert('Errore caricamento dati ticket: ' + error.message)
    return null
  }
}

/**
 * Salva un ordine (nuovo o modifica esistente) - Crea automaticamente cliente e abbonamento
 * @param {Object} formData - Dati del form ordine
 * @param {string|number} [orderId] - ID dell'ordine se modifica
 * @returns {Promise<boolean>} True se riuscito
 */
export async function saveOrder(formData, orderId = null) {
  try {
    console.log(`${orderId ? '📝 Modifica' : '➕ Creazione'} ordine completo...`, formData)

    // Prima, verifica se il cliente esiste già (basato su nome e telefono)
    let clientId = null;
    const { data: existingClients } = await supabase
      .from('clients')
      .select('id')
      .eq('full_name', formData.client_name?.trim())
      .eq('phone_whatsapp', formData.client_phone?.trim())
      .limit(1);

    if (existingClients && existingClients.length > 0) {
      // Cliente esistente
      clientId = existingClients[0].id;
      console.log('👤 Cliente esistente trovato:', clientId);
    } else {
      // Crea nuovo cliente
      const clientData = {
        full_name: formData.client_name?.trim(),
        phone_whatsapp: formData.client_phone?.trim(),
        email: formData.client_email?.trim() || null,
        m3u_code: formData.m3u_code?.trim() || null,
        mac_address: formData.mac_address?.trim() || null,
        device_key: formData.device_key?.trim() || null,
        paid_amount: formData.paid_amount ? parseFloat(formData.paid_amount) : null,
        notes: formData.notes?.trim() || null,
        status: 'active'
      };

      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert([clientData])
        .select()
        .single();

      if (clientError) throw clientError;
      clientId = newClient.id;
      console.log('✅ Nuovo cliente creato:', clientId);
    }

    // Ora verifica se l'abbonamento esiste già (basato su username_iptv)
    let subscriptionId = null;
    const { data: existingSubs } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('username_iptv', formData.username_iptv?.trim())
      .limit(1);

    if (existingSubs && existingSubs.length > 0) {
      // Abbonamento esistente - aggiorna i dati
      subscriptionId = existingSubs[0].id;
      const subUpdateData = {
        client_id: clientId,
        password_iptv: formData.password_iptv || null,
        server_url: formData.server_url || null,
        package_name: formData.package_name?.trim() || null,
        price: formData.price ? parseFloat(formData.price) : null,
        start_date: formData.start_date,
        end_date: formData.end_date,
        active: true
      };

      const { error: subUpdateError } = await supabase
        .from('subscriptions')
        .update(subUpdateData)
        .eq('id', subscriptionId);

      if (subUpdateError) throw subUpdateError;
      console.log('📝 Abbonamento esistente aggiornato:', subscriptionId);
    } else {
      // Crea nuovo abbonamento
      const subData = {
        client_id: clientId,
        username_iptv: formData.username_iptv?.trim(),
        password_iptv: formData.password_iptv || null,
        server_url: formData.server_url || null,
        package_name: formData.package_name?.trim() || null,
        price: formData.price ? parseFloat(formData.price) : null,
        start_date: formData.start_date,
        end_date: formData.end_date,
        active: true
      };

      const { data: newSub, error: subError } = await supabase
        .from('subscriptions')
        .insert([subData])
        .select()
        .single();

      if (subError) throw subError;
      subscriptionId = newSub.id;
      console.log('✅ Nuovo abbonamento creato:', subscriptionId);
    }

    // Infine, crea l'ordine
    const orderData = {
      client_id: clientId,
      subscription_id: subscriptionId,
      order_date: formData.order_date,
      start_date: formData.start_date,
      end_date: formData.end_date,
      plan_name: formData.plan_name?.trim(),
      plan_duration: formData.plan_duration?.trim(),
      price: parseFloat(formData.price),
      payment_method: formData.payment_method || 'cash',
      notes: formData.notes?.trim() || null,
      status: formData.status || 'pending'
    };

    let result;
    if (orderId) {
      // Modifica esistente
      result = await supabase
        .from('orders')
        .update(orderData)
        .eq('id', orderId)
        .select();
    } else {
      // Nuovo ordine
      result = await supabase
        .from('orders')
        .insert([orderData])
        .select();
    }

    if (result.error) throw result.error;

    console.log('✅ Ordine completo salvato:', result.data[0]);
    alert(`Ordine ${orderId ? 'modificato' : 'creato'} con successo! Cliente e abbonamento ${orderId ? 'aggiornati' : 'creati automaticamente'}.`);

    // Ricarica i dati
    window.dispatchEvent(new Event('data-updated'));

    return true;
  } catch (error) {
    console.error('❌ Errore salvataggio ordine completo:', error.message);
    alert('Errore salvataggio ordine: ' + error.message);
    return false;
  }
}

/**
 * Carica i dati di un ordine per la modifica
 * @param {string|number} orderId - ID dell'ordine
 * @returns {Promise<Object|null>} Dati dell'ordine o null se errore
 */
export async function loadOrderForEdit(orderId) {
  try {
    console.log('📥 Caricamento dati ordine per modifica...', orderId)

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        clients (
          id,
          full_name,
          phone_whatsapp,
          m3u_code,
          mac_address,
          device_key
        ),
        subscriptions (
          id,
          username_iptv,
          package_name,
          server_url
        )
      `)
      .eq('id', orderId)
      .single()

    if (error) throw error

    console.log('✅ Dati ordine caricati:', data)
    return data
  } catch (error) {
    console.error('❌ Errore caricamento ordine:', error.message)
    alert('Errore caricamento dati ordine: ' + error.message)
    return null
  }
}

/**
 * Carica tutti gli ordini con i dati correlati
 * @returns {Promise<Array>} Array di ordini
 */
export async function fetchOrders() {
  try {
    console.log('📥 Caricamento ordini...')

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        clients (
          id,
          full_name,
          phone_whatsapp
        ),
        subscriptions (
          id,
          username_iptv,
          package_name
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    console.log('✅ Ordini caricati:', data?.length || 0)
    return data || []
  } catch (error) {
    console.error('❌ Errore caricamento ordini:', error.message)
    alert('Errore caricamento ordini: ' + error.message)
    return []
  }
}