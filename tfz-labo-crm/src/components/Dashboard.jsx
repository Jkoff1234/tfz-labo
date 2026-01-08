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

      <div className="md:col-span-2 mt-4 bg-red-50 rounded-lg p-4 border border-red-300">
        <h3 className="text-sm text-red-500 mb-2">Vendite ultimi 6 mesi</h3>
        <div className="h-48">
          <Line data={data} options={{responsive:true, maintainAspectRatio:false, plugins:{legend:{labels:{color:'#dc2626'}}}, scales:{x:{ticks:{color:'#dc2626'}}, y:{ticks:{color:'#dc2626'}}}}} />
        </div>
      </div>
    </div>
  )
}
