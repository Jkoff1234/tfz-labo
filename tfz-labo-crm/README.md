# TFZ Labo CRM

Mini CRM per la gestione di abbonamenti IPTV (React + Tailwind + Supabase)

## Quick start locale

1. Install dependencies

```bash
npm install
```

2. Add environment variables (`.env`) for Supabase:

- `VITE_SUPABASE_URL=https://prdcxlfhjjrupeefyicp.supabase.co`
- `VITE_SUPABASE_ANON_KEY=sb_publishable_VO25Mqo6h-v-GZZ3FstnOg_ArVciUKL`

3. Run dev server

```bash
npm run dev
```

## Deploy su Netlify

1. Push il codice su GitHub/GitLab.

2. Connetti il repo a Netlify:
   - Vai su [Netlify](https://netlify.com), accedi.
   - "New site from Git" → seleziona il repo.
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Aggiungi env vars: `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`

3. Deploy! Netlify gestisce automaticamente il build e il deploy.

Nota: il file `netlify.toml` è già configurato per SPA redirects.

## Note e integrazioni

- Il progetto usa Vite + React + Tailwind.
- La cartella `supabase/schema.sql` contiene lo schema DB consigliato.
- L'import da Google Sheets è pensato per CSV pubblicato ("File > Pubblica sul web"), la sincronizzazione live richiede automazioni esterne (n8n, Zapier).
- Per componenti UI avanzati consigliamo integrare `shadcn/ui` o `Radix` per dialog, table, ecc.

## Prossimi passi consigliati

- Migliorare la validazione del form e implementare il mapping CSV -> DB.
- Aggiungere notifiche e automazioni (email/whatsapp) per scadenze imminenti.
