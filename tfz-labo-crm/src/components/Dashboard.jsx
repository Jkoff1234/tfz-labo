import React from 'react'
import { Line } from 'react-chartjs-2'
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler } from 'chart.js'
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)

export default function Dashboard(){
  const months = ['-5','-4','-3','-2','-1','Now']
  const data = {
    labels: months,
    datasets: [{
      label: 'Vendite',
      data: [120,200,150,220,300,260],
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
        <div className="text-2xl font-mono text-red-700">152</div>
      </div>
      <div className="p-4 bg-red-50 rounded-lg border border-red-300">
        <div className="text-sm text-red-500">Entrate Questo Mese</div>
        <div className="text-2xl font-mono text-red-700">€ 2,340</div>
      </div>
      <div className="p-4 bg-red-50 rounded-lg border border-red-300">
        <div className="text-sm text-red-500">In Scadenza (7gg)</div>
        <div className="text-2xl font-mono text-red-700">8</div>
      </div>
      <div className="p-4 bg-red-50 rounded-lg border border-red-300">
        <div className="text-sm text-red-500">Tot. Scaduti</div>
        <div className="text-2xl font-mono text-red-700">21</div>
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
