import React, {useState} from 'react'
import dayjs from 'dayjs'
import { supabase } from '../lib/supabase'

export default function EditOrderModal({ order, onClose }){
  const [form,setForm] = useState({
    client: order.client,
    contact: '',
    plan: order.plan,
    start: order.start,
    price: order.price,
    device: order.device,
    mac: order.mac,
    m3u: order.m3u,
    lines: order.lines.map(l=>l.name).join(',')
  })

  function update(k,v){ setForm(f=>({...f,[k]:v})) }
  function calcEnd(){ return dayjs(form.start).add(form.plan,'month').subtract(1,'day').format('YYYY-MM-DD') }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
      <div className="w-[720px] bg-white p-6 rounded border border-red-300">
        <h3 className="text-lg mb-4 text-red-700">Modifica Ordine</h3>
        <div className="grid grid-cols-2 gap-3">
          <input value={form.client} onChange={e=>update('client',e.target.value)} placeholder="Nome Cliente" className="p-2 bg-white border border-red-300 rounded text-red-600" />
          <input value={form.contact} onChange={e=>update('contact',e.target.value)} placeholder="Contatto (WhatsApp)" className="p-2 bg-white border border-red-300 rounded text-red-600" />
          <select value={form.plan} onChange={e=>update('plan',Number(e.target.value))} className="p-2 bg-white border border-red-300 rounded text-red-600">
            <option value={1}>1 Mese</option>
            <option value={3}>3 Mesi</option>
            <option value={6}>6 Mesi</option>
            <option value={12}>12 Mesi</option>
          </select>
          <select value={form.device} onChange={e=>update('device',e.target.value)} className="p-2 bg-white border border-red-300 rounded text-red-600">
            <option>Smart TV</option>
            <option>Firestick</option>
            <option>Smartphone</option>
            <option>Mag Box</option>
          </select>
          <input type="date" value={form.start} onChange={e=>update('start',e.target.value)} className="p-2 bg-white border border-red-300 rounded text-red-600" />
          <input value={form.price} onChange={e=>update('price',Number(e.target.value))} className="p-2 bg-white border border-red-300 rounded text-red-600" />
          <input value={form.mac} onChange={e=>update('mac',e.target.value)} placeholder="MAC" className="p-2 bg-white border border-red-300 rounded text-red-600 col-span-2" />
          <input value={form.m3u} onChange={e=>update('m3u',e.target.value)} placeholder="Link M3U" className="p-2 bg-white border border-red-300 rounded text-red-600 col-span-2" />
          <input value={form.lines} onChange={e=>update('lines',e.target.value)} placeholder="Linee (separate da ,)" className="p-2 bg-white border border-red-300 rounded text-red-600 col-span-2" />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div>Data fine: <span className="font-mono text-red-700">{calcEnd()}</span></div>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-3 py-2 border border-red-300 rounded text-red-600">Annulla</button>
            <button onClick={async ()=>{
              try{
                const end_date = dayjs(form.start).add(form.plan,'month').subtract(1,'day').format('YYYY-MM-DD')
                await supabase.from('subscriptions').update({
                  plan_months: form.plan,
                  device: form.device,
                  mac: form.mac,
                  m3u: form.m3u,
                  start_date: form.start,
                  end_date,
                  price: form.price
                }).eq('id', order.id)

                // Update client name if changed
                if(form.client !== order.client){
                  const { data: clientData } = await supabase.from('clients').select('id').eq('name', order.client).maybeSingle()
                  if(clientData){
                    await supabase.from('clients').update({ name: form.client, contact: form.contact }).eq('id', clientData.id)
                  }
                }

                // Update lines
                const newLines = form.lines.split(',').map(s=>s.trim()).filter(Boolean)
                await supabase.from('lines').delete().eq('subscription_id', order.id)
                if(newLines.length){
                  const rows = newLines.map(name=>({ subscription_id: order.id, name }))
                  await supabase.from('lines').insert(rows)
                }

                window.dispatchEvent(new Event('data-updated'))
                onClose()
              }catch(e){
                console.error('Update error', e)
                alert('Errore modifica: '+e.message)
              }
            }} className="px-3 py-2 bg-red-600 text-white rounded">Salva</button>
          </div>
        </div>
      </div>
    </div>
  )
}