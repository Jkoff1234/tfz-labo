import React, {useState} from 'react'
import Papa from 'papaparse'
import { supabase } from '../lib/supabase'
import dayjs from 'dayjs'

export default function ImportCSV(){
  const [open,setOpen]=useState(false)
  const [preview,setPreview]=useState(null)
  const [rawRows,setRawRows]=useState(null)
  const [mapping,setMapping]=useState({})
  const [importing,setImporting]=useState(false)
  const [progress,setProgress]=useState({done:0,total:0})

  function handleFile(f){
    Papa.parse(f,{
      header:true,
      complete: (res)=>{
        setRawRows(res.data)
        setPreview(res.data.slice(0,20))
        guessMapping(res.data)
      }
    })
  }

  function handleUrl(url){
    // If user pastes published CSV url
    Papa.parse(url,{
      download:true,
      header:true,
      complete: (res)=>{
        setRawRows(res.data)
        setPreview(res.data.slice(0,20))
        guessMapping(res.data)
      }
    })
  }

  function guessMapping(rows){
    const first = rows && rows[0] ? rows[0] : {}
    const keys = Object.keys(first)
    const guessed = {}
    keys.forEach(k=>{
      const key = k.toLowerCase()
      if(/name|client|cliente/.test(key)) guessed.client = k
      else if(/start|inizio|start_date/.test(key)) guessed.start = k
      else if(/end|fine|end_date/.test(key)) guessed.end = k
      else if(/plan|duration|mesi/.test(key)) guessed.plan = k
      else if(/price|prezzo|amount/.test(key)) guessed.price = k
      else if(/device|dispositivo/.test(key)) guessed.device = k
      else if(/mac/.test(key)) guessed.mac = k
      else if(/m3u|link/.test(key)) guessed.m3u = k
      else if(/line|linee|lines/.test(key)) guessed.lines = k
    })
    setMapping(guessed)
  }

  return (
    <div>
      <button onClick={()=>setOpen(true)} className="px-3 py-2 bg-red-600 text-white rounded text-sm">Importa CSV/Sheets</button>
      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="w-[900px] bg-white p-6 rounded border border-red-300">
            <h3 className="text-lg mb-4 text-red-700">Importa Dati (Google Sheets CSV o file CSV)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-red-600 text-sm">Incolla URL CSV (pubblicato)</label>
                <input placeholder="https://...csv" onBlur={e=>handleUrl(e.target.value)} className="w-full p-2 mt-1 bg-white border border-red-300 rounded text-red-600" />
                <div className="my-3 text-red-600">oppure</div>
                <input type="file" accept="text/csv" onChange={e=>handleFile(e.target.files[0])} />
              </div>
              <div>
                <div className="text-sm text-red-600 mb-2">Anteprima:</div>
                <div className="bg-red-50 rounded p-2 h-56 overflow-auto border border-red-300">
                  {preview ? (
                    <div>
                      <div className="text-xs text-red-600 mb-2">Mappatura automatica (modifica se necessario):</div>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {['client','start','end','plan','price','device','mac','m3u','lines'].map(field=> (
                          <label key={field} className="text-xs">
                            <div className="text-red-600">{field}</div>
                            <select className="w-full p-1 bg-white border border-red-300 rounded text-xs text-red-600" value={mapping[field]||''} onChange={e=>setMapping(m=>({...m,[field]:e.target.value}))}>
                              <option value=''>--</option>
                              {Object.keys(preview[0]||{}).map(k=>(<option key={k} value={k}>{k}</option>))}
                            </select>
                          </label>
                        ))}
                      </div>

                      <div className="text-xs text-red-600 mb-2">Righe (anteprima):</div>
                      <table className="text-xs w-full">
                        <thead className="text-red-600">
                          <tr>{Object.keys(preview[0]||{}).map(h=>(<th key={h} className="pr-2">{h}</th>))}</tr>
                        </thead>
                        <tbody>
                          {preview.map((r,i)=>(
                            <tr key={i} className="text-red-600"><td className="pr-2" colSpan={Object.keys(preview[0]||{}).length}>{Object.values(r||{}).join(' | ')}</td></tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (<div className="text-red-500">Nessun dato ancora</div>)}
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2 items-center">
              <div className="text-xs text-red-600">{importing ? `Importati ${progress.done}/${progress.total}` : ''}</div>
              <button onClick={()=>setOpen(false)} className="px-3 py-2 border border-red-300 rounded text-red-600">Chiudi</button>
              <button onClick={async ()=>{
                if(!rawRows || rawRows.length===0){ alert('Nessun file caricato'); return }
                if(!mapping.client){ if(!confirm('Nessuna colonna mappata su `client`. Continuare?')) return }
                setImporting(true)
                setProgress({done:0,total:rawRows.length})
                try{
                  for(let i=0;i<rawRows.length;i++){
                    const row = rawRows[i]
                    const getVal = (field)=> mapping[field] ? (row[mapping[field]]||'').toString().trim() : ''
                    const clientName = getVal('client') || 'Unknown'
                    const contact = ''
                    // find or insert client
                    const { data: existing, error: findErr } = await supabase.from('clients').select('id').eq('name', clientName).maybeSingle()
                    if(findErr) throw findErr
                    let clientId = existing?.id
                    if(!clientId){
                      const { data: newClient, error: insClientErr } = await supabase.from('clients').insert({ name: clientName, contact }).select('id').maybeSingle()
                      if(insClientErr) throw insClientErr
                      clientId = newClient.id
                    }

                    const start = getVal('start') || ''
                    const plan = Number(getVal('plan')) || 1
                    const end = getVal('end') || ''
                    const price = Number((getVal('price')||'').replace(',','.')) || 0
                    const device = getVal('device') || ''
                    const mac = getVal('mac') || ''
                    const m3u = getVal('m3u') || ''

                    const computedEnd = end || (start ? dayjs(start).add(plan,'month').subtract(1,'day').format('YYYY-MM-DD') : null)

                    const { data: newSub, error: insSubErr } = await supabase.from('subscriptions').insert({ client_id: clientId, plan_months: plan, device, mac, m3u, start_date: start||null, end_date: computedEnd||null, price, notes: '' }).select('id').maybeSingle()
                    if(insSubErr) throw insSubErr

                    const rawLines = getVal('lines')
                    if(rawLines){
                      const arr = rawLines.split(',').map(s=>s.trim()).filter(Boolean)
                      if(arr.length){
                        const rows = arr.map(name=>({ subscription_id: newSub.id, name }))
                        const { error: linesErr } = await supabase.from('lines').insert(rows)
                        if(linesErr) throw linesErr
                      }
                    }

                    setProgress(p=>({...p, done: p.done+1}))
                  }

                  window.dispatchEvent(new Event('data-updated'))
                  alert('Import completato')
                }catch(e){
                  console.error('Import error', e)
                  alert('Errore import: '+(e.message||JSON.stringify(e)))
                }finally{ setImporting(false) }
              }} className="px-3 py-2 bg-red-600 text-white rounded">Importa in DB</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
