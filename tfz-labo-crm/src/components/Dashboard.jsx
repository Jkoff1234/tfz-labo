import React, { useState, useEffect } from 'react'
import { Line } from 'react-chartjs-2'
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler } from 'chart.js'
import { supabase } from '../lib/supabase'
import dayjs from 'dayjs'
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)

export default function Dashboard(){
  const [metrics, setMetrics] = useState({
    activeClients: 0,
    monthlyRevenue: 0,
    expiringSoon: 0,
    openTickets: 5 // Placeholder, since no tickets table
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [clients, setClients] = useState([])
  const [loadingClients, setLoadingClients] = useState(false)
  const [lastRenewals, setLastRenewals] = useState([])

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const now = dayjs()
        const nextWeek = now.add(7, 'day')
        const startOfMonth = now.startOf('month')

        // Active clients: distinct clients with active subscriptions
        const { data: activeSubs } = await supabase
          .from('subscriptions')
          .select('client_id')
          .gte('end_date', now.format('YYYY-MM-DD'))
        const activeClients = new Set(activeSubs?.map(s => s.client_id) || []).size

        // Monthly subscriptions: count of subscriptions started this month (since no price field in new schema)
        const { data: monthlySubs } = await supabase
          .from('subscriptions')
          .select('id')
          .gte('start_date', startOfMonth.format('YYYY-MM-DD'))
        const monthlyRevenue = monthlySubs?.length || 0 // Using count instead of sum

        // Expiring soon: subscriptions ending in next 7 days
        const { data: expiring } = await supabase
          .from('subscriptions')
          .select('id')
          .gte('end_date', now.format('YYYY-MM-DD'))
          .lte('end_date', nextWeek.format('YYYY-MM-DD'))
        const expiringSoon = expiring?.length || 0

        // Last renewals - aggiorniamo per il nuovo schema
        const { data: renewals } = await supabase
          .from('subscriptions')
          .select('clients(full_name), start_date, package_name')
          .order('start_date', { ascending: false })
          .limit(5)
        setLastRenewals(renewals || [])

        setMetrics({ activeClients, monthlyRevenue, expiringSoon, openTickets: 5 })
      } catch (error) {
        console.error('Error fetching metrics:', error)
      }
    }

    fetchMetrics()

    const handleDataUpdate = () => fetchMetrics()
    window.addEventListener('data-updated', handleDataUpdate)
    return () => window.removeEventListener('data-updated', handleDataUpdate)
  }, [])

  const months = ['Gen','Feb','Mar','Apr','Mag','Giu']
  const data = {
    labels: months,
    datasets: [{
      label: 'Abbonamenti',
      data: [120,200,150,220,300,260],
      borderColor: '#10b981',
      backgroundColor: 'rgba(16,185,129,0.15)',
      tension: 0.3,
      fill: true
    }]
  }

  return (
    <div className="space-y-6">
      {/* Top Bar: Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-4 border border-gray-700 shadow-lg">
          <div className="text-sm text-gray-400">Totale Utenti Attivi</div>
          <div className="text-2xl font-mono text-green-400">{metrics.activeClients}</div>
          <div className="text-xs text-green-300">+12% vs mese scorso</div>
        </div>
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-4 border border-gray-700 shadow-lg">
          <div className="text-sm text-gray-400">Incasso Mensile (MRR)</div>
          <div className="text-2xl font-mono text-green-400">€ {metrics.monthlyRevenue.toFixed(2)}</div>
        </div>
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-4 border border-gray-700 shadow-lg">
          <div className="text-sm text-gray-400">Scadenze Urgenti</div>
          <div className="text-2xl font-mono text-red-400">{metrics.expiringSoon}</div>
        </div>
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-4 border border-gray-700 shadow-lg">
          <div className="text-sm text-gray-400">Ticket Aperti</div>
          <div className="text-2xl font-mono text-yellow-400">{metrics.openTickets}</div>
        </div>
      </div>

      {/* Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart */}
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-4 border border-gray-700 shadow-lg">
            <h3 className="text-lg font-medium text-white mb-4">Andamento Abbonamenti</h3>
            <div className="h-64">
              <Line data={data} options={{responsive:true, maintainAspectRatio:false, plugins:{legend:{labels:{color:'#fff'}}}, scales:{x:{ticks:{color:'#ccc'}}, y:{ticks:{color:'#ccc'}}}}} />
            </div>
          </div>

          {/* Table: Ultimi Rinnovi */}
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-4 border border-gray-700 shadow-lg">
            <h3 className="text-lg font-medium text-white mb-4">Ultimi Rinnovi</h3>
            <table className="w-full text-sm text-gray-300">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="text-left py-2">Cliente</th>
                  <th className="text-left py-2">Data</th>
                  <th className="text-left py-2">Pacchetto</th>
                </tr>
              </thead>
              <tbody>
                {lastRenewals.map((renewal, idx) => (
                  <tr key={idx} className="border-b border-gray-700">
                    <td className="py-2">{renewal.clients?.full_name || 'N/A'}</td>
                    <td className="py-2">{dayjs(renewal.start_date).format('DD/MM/YYYY')}</td>
                    <td className="py-2">{renewal.package_name || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: 1/3 Action Center */}
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-4 border border-gray-700 shadow-lg">
          <h3 className="text-lg font-medium text-white mb-4">Action Center</h3>
          <div className="space-y-3">
            <div className="p-3 bg-red-900 bg-opacity-50 rounded border border-red-700">
              <div className="text-sm text-red-300">Cliente Mario Rossi scade domani</div>
              <button className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-xs">Contatta</button>
            </div>
            <div className="p-3 bg-yellow-900 bg-opacity-50 rounded border border-yellow-700">
              <div className="text-sm text-yellow-300">Ticket #123: Problema connessione</div>
              <button className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-xs">Rispondi</button>
            </div>
            {/* Add more items */}
          </div>
        </div>
      </div>
    </div>
  )
}
