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
    totalExpired: 0
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [clients, setClients] = useState([])
  const [loadingClients, setLoadingClients] = useState(false)

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

        // Monthly revenue: sum of prices for subscriptions started this month
        const { data: monthlySubs } = await supabase
          .from('subscriptions')
          .select('price')
          .gte('start_date', startOfMonth.format('YYYY-MM-DD'))
        const monthlyRevenue = monthlySubs?.reduce((sum, s) => sum + (Number(s.price) || 0), 0) || 0

        // Expiring soon: subscriptions ending in next 7 days
        const { data: expiring } = await supabase
          .from('subscriptions')
          .select('id')
          .gte('end_date', now.format('YYYY-MM-DD'))
          .lte('end_date', nextWeek.format('YYYY-MM-DD'))
        const expiringSoon = expiring?.length || 0

        // Total expired
        const { data: expired } = await supabase
          .from('subscriptions')
          .select('id')
          .lt('end_date', now.format('YYYY-MM-DD'))
        const totalExpired = expired?.length || 0

        setMetrics({ activeClients, monthlyRevenue, expiringSoon, totalExpired })
      } catch (error) {
        console.error('Error fetching metrics:', error)
      }
    }

    fetchMetrics()

    const handleDataUpdate = () => fetchMetrics()
    window.addEventListener('data-updated', handleDataUpdate)
    return () => window.removeEventListener('data-updated', handleDataUpdate)
  }, [])

  useEffect(() => {
    async function searchClients() {
      if (!searchTerm.trim()) {
        setClients([])
        return
      }
      setLoadingClients(true)
      try {
        const { data, error } = await supabase
          .from('clients')
          .select(`
            id, name, contact,
            subscriptions (
              id, plan_months, device, mac, m3u, start_date, end_date, price, notes
            )
          `)
          .ilike('name', `%${searchTerm}%`)
          .limit(10)
        if (error) throw error
        setClients(data || [])
      } catch (error) {
        console.error('Error searching clients:', error)
      } finally {
        setLoadingClients(false)
      }
    }

    const debounce = setTimeout(searchClients, 300)
    return () => clearTimeout(debounce)
  }, [searchTerm])

  const months = ['-5','-4','-3','-2','-1','Now']
  const data = {
    labels: months,
    datasets: [{
      label: 'Vendite',
      data: [120,200,150,220,300,260], // Placeholder, can be made dynamic later
      borderColor: '#dc2626',
      backgroundColor: 'rgba(220,38,38,0.15)',
      tension: 0.3,
      fill: true
    }]
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="p-4 bg-red-50 rounded-lg border border-red-300">
        <div className="text-sm text-red-500">Clienti Attivi</div>
        <div className="text-2xl font-mono text-red-700">{metrics.activeClients}</div>
      </div>
      <div className="p-4 bg-red-50 rounded-lg border border-red-300">
        <div className="text-sm text-red-500">Entrate Questo Mese</div>
        <div className="text-2xl font-mono text-red-700">€ {metrics.monthlyRevenue.toFixed(2)}</div>
      </div>
      <div className="p-4 bg-red-50 rounded-lg border border-red-300">
        <div className="text-sm text-red-500">In Scadenza (7gg)</div>
        <div className="text-2xl font-mono text-red-700">{metrics.expiringSoon}</div>
      </div>
      <div className="p-4 bg-red-50 rounded-lg border border-red-300">
        <div className="text-sm text-red-500">Tot. Scaduti</div>
        <div className="text-2xl font-mono text-red-700">{metrics.totalExpired}</div>
      </div>

      <div className="mt-4 bg-red-50 rounded-lg p-4 border border-red-300">
        <h3 className="text-sm text-red-500 mb-2">Vendite ultimi 6 mesi</h3>
        <div className="h-48">
          <Line data={data} options={{responsive:true, maintainAspectRatio:false, plugins:{legend:{labels:{color:'#dc2626'}}}, scales:{x:{ticks:{color:'#dc2626'}}, y:{ticks:{color:'#dc2626'}}}}} />
        </div>
      </div>

      <div className="mt-4 bg-red-50 rounded-lg p-4 border border-red-300">
        <h3 className="text-sm text-red-500 mb-2">Ricerca Clienti</h3>
        <input
          type="text"
          placeholder="Cerca per nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 mb-3 bg-white border border-red-300 rounded text-red-600"
        />
        <div className="h-48 overflow-auto">
          {loadingClients ? (
            <div className="text-red-500">Caricamento...</div>
          ) : clients.length === 0 ? (
            <div className="text-red-500">Nessun cliente trovato</div>
          ) : (
            clients.map(client => (
              <div key={client.id} className="mb-3 p-2 bg-white rounded border border-red-200">
                <div className="font-medium text-red-700">{client.name}</div>
                {client.contact && <div className="text-xs text-red-500">{client.contact}</div>}
                <div className="mt-1 text-xs">
                  {client.subscriptions?.length ? (
                    client.subscriptions.map(sub => (
                      <div key={sub.id} className="mb-2 p-1 bg-red-50 rounded text-red-600">
                        <div><strong>Durata:</strong> {sub.plan_months} mesi</div>
                        <div><strong>Dispositivo:</strong> {sub.device}</div>
                        <div><strong>MAC:</strong> {sub.mac}</div>
                        <div><strong>M3U:</strong> {sub.m3u}</div>
                        <div><strong>Prezzo:</strong> €{sub.price}</div>
                        <div><strong>Inizio:</strong> {dayjs(sub.start_date).format('DD/MM/YYYY')}</div>
                        <div><strong>Scadenza:</strong> {dayjs(sub.end_date).format('DD/MM/YYYY')}</div>
                        {sub.notes && <div><strong>Note:</strong> {sub.notes}</div>}
                      </div>
                    ))
                  ) : (
                    <div className="text-red-500">Nessun abbonamento</div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
