# CRM IPTV - Guida alle Funzionalità CRUD

## 🎯 Funzionalità Implementate

### 1. **Modali per Gestione Clienti**
- **Aggiungi Cliente**: Clicca "➕ Aggiungi Cliente" nella sezione "Lista Clienti"
- **Modifica Cliente**: Clicca "Modifica" nella tabella clienti
- **Elimina Cliente**: Clicca "Elimina" nella tabella clienti (con conferma)

**Campi Cliente:**
- Nome Completo (obbligatorio)
- WhatsApp (per notifiche automatiche)
- Note (opzionali)
- Stato (Attivo/Inattivo)

### 2. **Modali per Gestione Abbonamenti**
- **Aggiungi Abbonamento**: Clicca "➕ Nuovo Abbonamento" nella sezione "Abbonamenti & Linee"
- **Modifica Abbonamento**: Clicca "Modifica" nella tabella abbonamenti
- **Elimina Abbonamento**: Clicca "Elimina" nella tabella abbonamenti (con conferma)

**Campi Abbonamento:**
- Seleziona Cliente (dropdown popolato dinamicamente)
- Username IPTV (obbligatorio)
- Password IPTV (opzionale)
- Prezzo (€) (per calcoli MRR)
- Data Inizio (obbligatoria, default: oggi)
- Data Scadenza (obbligatoria, default: oggi + 1 mese)

### 3. **Dashboard KPI**
La dashboard ora calcola automaticamente:
- **Utenti Attivi**: Clienti con status = 'active'
- **MRR (Monthly Recurring Revenue)**: Somma prezzi abbonamenti attivi e non trial
- **In Scadenza**: Abbonamenti che scadono nelle prossime 48 ore
- **Ticket Aperti**: Conteggio ticket con status 'open'

## 🔧 Architettura del Codice

### File Principali:
- `src/lib/crmController.js`: Logica di business e interazioni Supabase
- `src/lib/crmLogic.js`: Funzioni UI e popolamento tabelle
- `src/main-integration.js`: Gestione sezioni e modali
- `index.html`: HTML delle modali e CSS

### Funzioni Controller:
```javascript
// CRUD Clienti
saveClient(formData, clientId?) // Insert/Update cliente
loadClientForEdit(clientId) // Carica dati per modifica

// CRUD Abbonamenti
saveSubscription(formData, subscriptionId?) // Insert/Update abbonamento
loadSubscriptionForEdit(subscriptionId) // Carica dati per modifica

// Eliminazione
deleteItem(table, id) // Elimina con conferma

// Utility
loadClientsForDropdown() // Lista clienti per select
```

## 🎨 Design delle Modali

- **Sfondo**: Overlay scuro con blur
- **Stile**: Gradiente moderno, bordi arrotondati
- **Animazioni**: Scale e fade transitions
- **Responsive**: Adattabile a schermi mobili

## 🚀 Come Testare

1. **Avvia il server**: `npm run dev`
2. **Naviga**: Usa il menu laterale
3. **Aggiungi dati**: Usa i pulsanti "➕" nelle sezioni
4. **Modifica**: Clicca "Modifica" nelle tabelle
5. **Elimina**: Clicca "Elimina" (con conferma)

## 📊 Prossimi Passi

- [ ] Implementare timeline eventi
- [ ] Aggiungere filtri di ricerca avanzati
- [ ] Implementare esportazione dati
- [ ] Aggiungere notifiche push
- [ ] Migliorare validazione form

## 🐛 Troubleshooting

- **Modali non si aprono**: Verifica che `crmController.js` sia importato
- **Dati non si salvano**: Controlla connessione Supabase e permessi RLS
- **Errori console**: Verifica che tutte le funzioni siano esportate correttamente

---

**Nota**: Assicurati che il database Supabase abbia le tabelle `clients`, `subscriptions`, `tickets` e `timeline_events` con la struttura corretta.</content>
<parameter name="filePath">c:\Users\JakamyOFF\Desktop\CRM TFZ\tfz-labo-crm\CRUD_GUIDE.md