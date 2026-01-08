import { createClient } from '@supabase/supabase-js'

// Inizializzazione Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

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