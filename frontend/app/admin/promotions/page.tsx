'use client';
import { FormEvent,useEffect,useState } from 'react';
import { useRouter } from 'next/navigation';
import { BadgePercent,Clock3,Flame,Gift,RefreshCw } from 'lucide-react';
import AdminShell from '@/components/admin-shell';
import { api } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';

const staff=new Set(['SUPER_ADMIN','ADMIN','MARKETING_MANAGER']);
export default function PromotionsPage(){
 const r=useRouter(); const [items,setItems]=useState<any[]>([]); const [msg,setMsg]=useState('');
 const [f,setF]=useState({code:'',name:'',type:'PERCENT',campaignType:'COUPON',value:'10',minOrder:'0',maxDiscount:'',startsAt:'',endsAt:'',usageLimit:'',perUserLimit:'1',firstOrderOnly:false,active:true,featured:false});
 async function load(){setItems((await api.get('/promotions')).data||[])}
 useEffect(()=>{const u=getStoredUser();if(!u||!staff.has(u.role)){r.replace('/login');return}load()},[r]);
 async function submit(e:FormEvent){e.preventDefault();try{await api.post('/promotions',{...f,value:Number(f.value),minOrder:Number(f.minOrder||0),maxDiscount:f.maxDiscount?Number(f.maxDiscount):undefined,usageLimit:f.usageLimit?Number(f.usageLimit):undefined,perUserLimit:Number(f.perUserLimit||1),startsAt:f.startsAt||undefined,endsAt:f.endsAt||undefined});setMsg('Campaign created successfully.');await load()}catch(e:any){setMsg(e?.response?.data?.message||'Could not create campaign.')}}
 async function toggle(id:string){await api.patch(`/promotions/${id}/toggle`);await load()}
 return <AdminShell>
  <div className="flex flex-col gap-2"><p className="text-xs font-black uppercase tracking-[.18em] text-slate-400">Growth engine</p><h1 className="text-4xl font-black">Campaigns & Promotions</h1><p className="text-sm text-slate-500">Coupons, scheduled flash sales, first-order offers, global and per-customer usage limits.</p></div>
  {msg&&<p className="mt-5 rounded-2xl border bg-white p-4 text-sm font-semibold">{msg}</p>}
  <form onSubmit={submit} className="mt-6 rounded-[1.7rem] border bg-white p-6">
   <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
    <input className="rounded-xl border p-3" placeholder="Campaign code" required value={f.code} onChange={e=>setF({...f,code:e.target.value.toUpperCase()})}/>
    <input className="rounded-xl border p-3" placeholder="Campaign name" required value={f.name} onChange={e=>setF({...f,name:e.target.value})}/>
    <select className="rounded-xl border p-3" value={f.campaignType} onChange={e=>setF({...f,campaignType:e.target.value,firstOrderOnly:e.target.value==='FIRST_ORDER'})}><option value="COUPON">Coupon</option><option value="FLASH_SALE">Flash sale</option><option value="FIRST_ORDER">First order</option></select>
    <select className="rounded-xl border p-3" value={f.type} onChange={e=>setF({...f,type:e.target.value})}><option value="PERCENT">Percent</option><option value="FIXED">Fixed amount</option></select>
    <input type="number" min="0" step=".01" className="rounded-xl border p-3" placeholder="Discount value" value={f.value} onChange={e=>setF({...f,value:e.target.value})}/>
    <input type="number" min="0" className="rounded-xl border p-3" placeholder="Minimum order" value={f.minOrder} onChange={e=>setF({...f,minOrder:e.target.value})}/>
    <input type="number" min="0" className="rounded-xl border p-3" placeholder="Maximum discount" value={f.maxDiscount} onChange={e=>setF({...f,maxDiscount:e.target.value})}/>
    <input type="number" min="1" className="rounded-xl border p-3" placeholder="Global usage limit" value={f.usageLimit} onChange={e=>setF({...f,usageLimit:e.target.value})}/>
    <input type="number" min="1" className="rounded-xl border p-3" placeholder="Per customer limit" value={f.perUserLimit} onChange={e=>setF({...f,perUserLimit:e.target.value})}/>
    <label className="text-xs font-black text-slate-500">Starts at<input type="datetime-local" className="mt-1 w-full rounded-xl border p-3 text-slate-900" value={f.startsAt} onChange={e=>setF({...f,startsAt:e.target.value})}/></label>
    <label className="text-xs font-black text-slate-500">Ends at<input type="datetime-local" className="mt-1 w-full rounded-xl border p-3 text-slate-900" value={f.endsAt} onChange={e=>setF({...f,endsAt:e.target.value})}/></label>
   </div>
   <div className="mt-4 flex flex-wrap gap-5 text-sm font-bold"><label><input type="checkbox" checked={f.active} onChange={e=>setF({...f,active:e.target.checked})}/> Active</label><label><input type="checkbox" checked={f.featured} onChange={e=>setF({...f,featured:e.target.checked})}/> Featured</label><label><input type="checkbox" checked={f.firstOrderOnly} onChange={e=>setF({...f,firstOrderOnly:e.target.checked})}/> First order only</label></div>
   <button className="mt-5 rounded-xl bg-[#1464f4] px-5 py-3 font-black text-white">Create campaign</button>
  </form>
  <section className="mt-6 grid gap-4 xl:grid-cols-2">{items.map(x=><article key={x.id} className="rounded-[1.6rem] border bg-white p-6">
   <div className="flex justify-between gap-4"><div><div className="flex items-center gap-2"><span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black">{x.campaignType||'COUPON'}</span>{x.featured&&<span className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-black text-amber-700">FEATURED</span>}</div><p className="mt-3 text-xs font-black text-slate-400">{x.code}</p><h2 className="text-xl font-black">{x.name}</h2></div><button onClick={()=>toggle(x.id)} className={`h-fit rounded-xl px-4 py-2 text-xs font-black ${x.active?'bg-[#1464f4] text-white':'border'}`}>{x.active?'ACTIVE':'INACTIVE'}</button></div>
   <p className="mt-4 text-3xl font-black">{x.type==='PERCENT'?`${x.value}%`:`BDT ${x.value}`}</p>
   <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-500"><p>Used <b>{x.usedCount}</b>{x.usageLimit?` / ${x.usageLimit}`:''}</p><p>Per customer <b>{x.perUserLimit||1}</b></p><p>Minimum <b>BDT {x.minOrder}</b></p><p>{x.firstOrderOnly?'First order only':'All eligible customers'}</p></div>
  </article>)}</section>
 </AdminShell>
}
