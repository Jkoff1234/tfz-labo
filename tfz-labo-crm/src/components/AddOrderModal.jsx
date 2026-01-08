import React, {useState} from 'react'
import dayjs from 'dayjs'
import { supabase } from '../lib/supabase'

export default function AddOrderModal(){
  const [open,setOpen] = useState(false)
  const [form,setForm] = useState({client:'',contact:'',plan:6,start:dayjs().format('YYYY-MM-DD'),price:9.99,device:'Smart TV',mac:'',m3u:'',lines:'Salotto'})

  function update(k,v){ setForm(f=>({...f,[k]:v})) }
  function calcEnd(){ return dayjs(form.start).add(form.plan,'month').subtract(1,'day').format('YYYY-MM-DD') }

  return (
    <div>
      <button onClick={()=>setOpen(true)} className="px-3 py-2 bg-red-600 text-white rounded text-sm">Nuovo Ordine</button>
      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="w-[720px] bg-white p-6 rounded border border-red-300">
            <h3 className="text-lg mb-4 text-red-700">Aggiungi Nuovo Ordine</h3>
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
                <button onClick={()=>setOpen(false)} className="px-3 py-2 border border-red-300 rounded text-red-600">Annulla</button>
                <button onClick={async ()=>{
                  try{
                    // find existing client by name
                    const { data: existingClient, error: findErr } = await supabase
                      .from('clients')
                      .select('id')
                      .eq('name', form.client)
                      .maybeSingle()
                    if(findErr) throw findErr

                    let clientId = existingClient?.id
                    if(!clientId){
                      const { data: newClient, error: insertClientErr } = await supabase
                        .from('clients')
                        .insert({ name: form.client, contact: form.contact })
                        .select('id')
                        .maybeSingle()
                      if(insertClientErr) throw insertClientErr
                      clientId = newClient.id
                    }

                    const end_date = dayjs(form.start).add(form.plan,'month').subtract(1,'day').format('YYYY-MM-DD')
                    const { data: newSub, error: insertSubErr } = await supabase
                      .from('subscriptions')
                      .insert({ client_id: clientId, plan_months: form.plan, device: form.device, mac: form.mac, m3u: form.m3u, start_date: form.start, end_date, price: form.price, notes: '' })
                      .select('id')
                      .maybeSingle()
                    if(insertSubErr) throw insertSubErr

                    const linesArr = (form.lines || '').split(',').map(s=>s.trim()).filter(Boolean)
                    if(linesArr.length){
                      const rows = linesArr.map(name=>({ subscription_id: newSub.id, name }))
                      const { error: linesErr } = await supabase.from('lines').insert(rows)
                      if(linesErr) throw linesErr
                    }

                    window.dispatchEvent(new Event('data-updated'))
                    setOpen(false)
                  }catch(err){
                    console.error(err)
                    alert('Errore salvataggio: '+(err.message||JSON.stringify(err)))
                  }
                }} className="px-3 py-2 bg-red-600 text-white rounded">Salva</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
