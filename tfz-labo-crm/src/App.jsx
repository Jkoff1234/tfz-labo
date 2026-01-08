import React from 'react'
import Dashboard from './components/Dashboard'
import OrdersTable from './components/OrdersTable'
import AddOrderModal from './components/AddOrderModal'
import ImportCSV from './components/ImportCSV'

export default function App(){
  console.log('App component rendered')
  console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Not set')
  console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not set')

  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    return (
      <div className="min-h-screen bg-white text-red-600 font-sans p-6">
        <h1 className="text-xl font-bold text-red-700">Errore Configurazione</h1>
        <p>Variabili d'ambiente Supabase non impostate. Controlla le impostazioni Netlify.</p>
        <p>URL: {import.meta.env.VITE_SUPABASE_URL || 'Non impostato'}</p>
        <p>Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Impostata' : 'Non impostata'}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-red-600 font-sans">
      <header className="p-4 border-b border-red-300 flex items-center justify-between">
        <h1 className="text-xl font-bold text-red-700">TFZ Labo CRM</h1>
        <nav className="text-sm text-red-500">Dashboard • Ordini • Importa</nav>
      </header>

      <main className="p-6 space-y-6">
        <Dashboard />
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Gestione Ordini</h2>
            <div className="flex gap-2">
              <AddOrderModal />
              <ImportCSV />
            </div>
          </div>
          <OrdersTable />
        </section>
      </main>
    </div>
  )
}
