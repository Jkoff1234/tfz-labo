import React, {useState, useEffect} from 'react'
import dayjs from 'dayjs'
import { supabase } from '../lib/supabase'
import Papa from 'papaparse'
import EditOrderModal from './EditOrderModal'

function statusFor(endDate){
  const today = dayjs()
  const end = dayjs(endDate)
  if(end.isBefore(today,'day')) return 'scaduto'
  const diff = end.diff(today,'day')
  if(diff < 5) return 'in-scadenza'
  return 'attivo'
}

export default function OrdersTable(){
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(null)

  async function fetchData(){
    setLoading(true)
    try{
      const { data, error } = await supabase
        .from('subscriptions')
        .select('id,plan_months,device,mac,m3u,start_date,end_date,price,clients(name),lines(name)')
        .order('end_date', { ascending: false })
      if(error) throw error
      const mapped = (data||[]).map(r=>({
        id: r.id,
        client: r.clients?.name || '',
        plan: r.plan_months,
        device: r.device,
        mac: r.mac,
        m3u: r.m3u,
        start: r.start_date,
        end: r.end_date,
        price: Number(r.price) || 0,
        lines: (r.lines||[]).map(l=>({ name: l.name }))
      }))
      setRows(mapped)
    }catch(e){
      console.error('Fetch subscriptions error', e)
    }finally{ setLoading(false) }
  }

  useEffect(()=>{
    fetchData()
    const onUpdate = ()=>fetchData()
    window.addEventListener('data-updated', onUpdate)
    return ()=> window.removeEventListener('data-updated', onUpdate)
  },[])

  function exportCsv(){
    if(!rows || rows.length===0){ alert('Nessun dato da esportare'); return }
    const data = rows.map(r=>({
      cliente: r.client,
      plan_mesi: r.plan,
      dispositivo: r.device,
      mac: r.mac,
      m3u: r.m3u,
      inizio: r.start,
      fine: r.end,
      prezzo: r.price,
      linee: r.lines.map(l=>l.name).join(',')
    }))
    const csv = Papa.unparse(data)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tfz-subscriptions-${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-red-50 rounded-lg border border-red-300 overflow-auto">
      <div className="p-3 flex items-center justify-end border-b border-red-300">
        <button onClick={exportCsv} className="px-3 py-1 bg-red-600 text-white rounded text-sm">Esporta CSV</button>
      </div>
      <table className="min-w-full text-sm">
        <thead className="text-red-500 text-left">
          <tr>
            <th className="px-4 py-3">Cliente</th>
            <th className="px-4 py-3">Durata</th>
            <th className="px-4 py-3">Dispositivo</th>
            <th className="px-4 py-3">MAC / M3U</th>
            <th className="px-4 py-3">Inizio</th>
            <th className="px-4 py-3">Fine</th>
            <th className="px-4 py-3">Stato</th>
            <th className="px-4 py-3">Prezzo</th>
            <th className="px-4 py-3">Azioni</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r=>{
            const st = statusFor(r.end)
            return (
              <tr key={r.id} className="border-t border-red-300">
                <td className="px-4 py-3">{r.client}
                  <div className="text-xs text-red-400">{r.lines.map(l=>l.name).join(' • ')}</div>
                </td>
                <td className="px-4 py-3">{r.plan} mesi</td>
                <td className="px-4 py-3">{r.device}</td>
                <td className="px-4 py-3">
                  <div className="font-mono text-xs">{r.mac} <button className="ml-2 text-red-500 hover:text-red-700" onClick={()=>navigator.clipboard.writeText(r.mac)}>Copia</button></div>
                  <div className="mt-1 text-xs font-mono">{r.m3u} <button className="ml-2 text-red-500 hover:text-red-700" onClick={()=>navigator.clipboard.writeText(r.m3u)}>Copia</button></div>
                </td>
                <td className="px-4 py-3">{r.start}</td>
                <td className="px-4 py-3">{r.end}</td>
                <td className="px-4 py-3">
                  {st==='attivo' && <span className="px-2 py-1 rounded-full bg-green-100 text-green-800">🟢 Attivo</span>}
                  {st==='in-scadenza' && <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">🟡 In Scadenza</span>}
                  {st==='scaduto' && <span className="px-2 py-1 rounded-full bg-red-100 text-red-800">🔴 Scaduto</span>}
                  {st==='in-scadenza' && <div className="text-xs text-red-600 mt-1">-{dayjs(r.end).diff(dayjs(),'day')} giorni alla scadenza</div>}
                </td>
                <td className="px-4 py-3">€ {r.price.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <button className="mr-2 px-2 py-1 bg-blue-600 text-white rounded text-xs" onClick={()=>setEditing(r)}>Modifica</button>
                  <button className="px-2 py-1 bg-red-600 text-white rounded text-xs" onClick={async ()=>{
                    if(confirm('Cancellare questo ordine?')){
                      try{
                        await supabase.from('subscriptions').delete().eq('id', r.id)
                        window.dispatchEvent(new Event('data-updated'))
                      }catch(e){
                        alert('Errore cancellazione: '+e.message)
                      }
                    }
                  }}>Cancella</button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {editing && <EditOrderModal order={editing} onClose={()=>setEditing(null)} />}
    </div>
  )
}
