'use client';
import { FormEvent,useEffect,useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminShell from '@/components/admin-shell';
import { api } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';

export default function PromotionsPage(){
  const r=useRouter();
  const [items,setItems]=useState<any[]>([]);
  const [msg,setMsg]=useState('');
  const [f,setF]=useState({
    code:'',name:'',type:'PERCENT',value:'10',minOrder:'0',maxDiscount:'',
    startsAt:'',endsAt:'',usageLimit:'',active:true,featured:false
  });

  async function load(){setItems((await api.get('/promotions')).data)}
  useEffect(()=>{const u=getStoredUser();if(!u||u.role!=='ADMIN'){r.replace('/login');return;}load()},[r]);

  async function submit(e:FormEvent){
    e.preventDefault();
    try{
      await api.post('/promotions',{
        ...f,
        value:Number(f.value),
        minOrder:Number(f.minOrder||0),
        maxDiscount:f.maxDiscount?Number(f.maxDiscount):undefined,
        usageLimit:f.usageLimit?Number(f.usageLimit):undefined,
        startsAt:f.startsAt||undefined,
        endsAt:f.endsAt||undefined
      });
      setMsg('Promotion created.');
      setF({code:'',name:'',type:'PERCENT',value:'10',minOrder:'0',maxDiscount:'',startsAt:'',endsAt:'',usageLimit:'',active:true,featured:false});
      await load();
    }catch(e:any){setMsg(e?.response?.data?.message||'Could not create promotion.')}
  }

  async function toggle(id:string){await api.patch(`/promotions/${id}/toggle`);await load()}

  return <AdminShell>
    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Growth</p>
    <h1 className="mt-2 text-4xl font-black">Promotions & coupons</h1>

    {msg&&<p className="mt-5 rounded-2xl border bg-white p-4 text-sm font-semibold">{msg}</p>}

    <form onSubmit={submit} className="mt-6 rounded-3xl border bg-white p-6">
      <div className="grid gap-3 md:grid-cols-3">
        <input className="rounded-xl border p-3" placeholder="Coupon code" required value={f.code} onChange={e=>setF({...f,code:e.target.value})}/>
        <input className="rounded-xl border p-3" placeholder="Campaign name" required value={f.name} onChange={e=>setF({...f,name:e.target.value})}/>
        <select className="rounded-xl border p-3" value={f.type} onChange={e=>setF({...f,type:e.target.value})}>
          <option value="PERCENT">Percent</option><option value="FIXED">Fixed amount</option>
        </select>
        <input type="number" min="0" step="0.01" className="rounded-xl border p-3" placeholder="Value" required value={f.value} onChange={e=>setF({...f,value:e.target.value})}/>
        <input type="number" min="0" step="0.01" className="rounded-xl border p-3" placeholder="Min order" value={f.minOrder} onChange={e=>setF({...f,minOrder:e.target.value})}/>
        <input type="number" min="0" step="0.01" className="rounded-xl border p-3" placeholder="Max discount" value={f.maxDiscount} onChange={e=>setF({...f,maxDiscount:e.target.value})}/>
        <input type="datetime-local" className="rounded-xl border p-3" value={f.startsAt} onChange={e=>setF({...f,startsAt:e.target.value})}/>
        <input type="datetime-local" className="rounded-xl border p-3" value={f.endsAt} onChange={e=>setF({...f,endsAt:e.target.value})}/>
        <input type="number" min="1" className="rounded-xl border p-3" placeholder="Usage limit" value={f.usageLimit} onChange={e=>setF({...f,usageLimit:e.target.value})}/>
      </div>
      <div className="mt-4 flex flex-wrap gap-5">
        <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={f.active} onChange={e=>setF({...f,active:e.target.checked})}/> Active</label>
        <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={f.featured} onChange={e=>setF({...f,featured:e.target.checked})}/> Show on homepage</label>
      </div>
      <button className="mt-5 rounded-xl bg-slate-950 px-5 py-3 font-bold text-white">Create promotion</button>
    </form>

    <section className="mt-6 grid gap-4 lg:grid-cols-2">
      {items.map(x=><div key={x.id} className="rounded-3xl border bg-white p-6">
        <div className="flex justify-between gap-4">
          <div><p className="text-xs font-bold text-slate-400">{x.code}</p><h2 className="mt-1 text-xl font-black">{x.name}</h2></div>
          <button onClick={()=>toggle(x.id)} className={`rounded-xl px-4 py-2 text-sm font-bold ${x.active?'bg-slate-950 text-white':'border'}`}>{x.active?'ACTIVE':'INACTIVE'}</button>
        </div>
        <p className="mt-4 text-3xl font-black">{x.type==='PERCENT'?`${x.value}%`:`BDT ${x.value}`}</p>
        <p className="mt-2 text-sm text-slate-500">Used {x.usedCount}{x.usageLimit?` / ${x.usageLimit}`:''} | Minimum BDT {x.minOrder}</p>
      </div>)}
    </section>
  </AdminShell>
}
