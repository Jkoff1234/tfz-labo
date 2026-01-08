import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import OrdersTable from './components/OrdersTable'
import AddOrderModal from './components/AddOrderModal'
import ImportCSV from './components/ImportCSV'

export default function App(){
  const [activeSection, setActiveSection] = useState('dashboard')

  console.log('App component rendered')
  console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Not set')
  console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not set')

  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    return (
      <div className="min-h-screen bg-gray-900 text-red-400 font-sans p-6">
        <h1 className="text-xl font-bold text-red-500">Errore Configurazione</h1>
        <p>Variabili d'ambiente Supabase non impostate. Controlla le impostazioni Netlify.</p>
        <p>URL: {import.meta.env.VITE_SUPABASE_URL || 'Non impostato'}</p>
        <p>Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Impostata' : 'Non impostata'}</p>
      </div>
    )
  }

  const renderContent = () => {
    switch(activeSection) {
      case 'dashboard':
        return <Dashboard />
      case 'client-list':
        return <OrdersTable />
      // Aggiungere altri casi per le altre sezioni
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <div className="flex-1 ml-64"> {/* Adjust ml based on sidebar width */}
        <header className="bg-gray-800 p-4 border-b border-gray-700 flex items-center justify-between">
          <h1 className="text-xl font-bold text-blue-400">TFZ Labo CRM</h1>
          <div className="flex items-center space-x-4">
            <span>Notifiche</span>
            <span>Profilo Admin</span>
          </div>
        </header>
        <main className="p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}
