'use client';

import { FormEvent,useEffect,useMemo,useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Boxes, History, PackagePlus } from 'lucide-react';
import AdminShell from '@/components/admin-shell';
import { api } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';

export default function InventoryPage(){
  const router=useRouter();
  const [variants,setVariants]=useState<any[]>([]),[stock,setStock]=useState<any[]>([]),[movements,setMovements]=useState<any[]>([]),[message,setMessage]=useState('');
  const [form,setForm]=useState({variantId:'',quantity:'',note:''});

  async function load(){const [a,b]=await Promise.all([api.get('/catalog/variants'),api.get('/inventory/dashboard')]);setVariants(a.data||[]);setStock(b.data?.stock||[]);setMovements(b.data?.recentMovements||[])}
  useEffect(()=>{const u=getStoredUser();if(!u||!['SUPER_ADMIN','ADMIN','INVENTORY_MANAGER'].includes(String(u.role).toUpperCase())){router.replace('/admin?denied=1');return}load()},[router]);

  async function submit(e:FormEvent){
    e.preventDefault();
    try{await api.post('/inventory/adjust',{variantId:form.variantId,quantity:Number(form.quantity),note:form.note||undefined});setForm({variantId:'',quantity:'',note:''});setMessage('Inventory adjusted successfully.');await load()}
    catch(err:any){setMessage(err?.response?.data?.message||'Adjustment failed.')}
  }

  const metrics=useMemo(()=>({
    available:stock.reduce((s,x)=>s+Number(x.available||0),0),
    reserved:stock.reduce((s,x)=>s+Number(x.reserved||0),0),
    low:stock.filter(x=>x.lowStock).length,
  }),[stock]);

  return <AdminShell>
    <div><p className="text-xs font-black uppercase tracking-[.18em] text-slate-400">Stock operations</p><h1 className="mt-2 text-4xl font-black tracking-tight">Inventory</h1><p className="mt-2 text-sm text-slate-500">Adjust variant stock and review movement history.</p></div>

    <section className="mt-6 grid gap-3 sm:grid-cols-3">
      {[[Boxes,'Available units',metrics.available],[PackagePlus,'Reserved',metrics.reserved],[AlertTriangle,'Low stock',metrics.low]].map(([Icon,label,value]:any)=><div key={label} className="rounded-2xl border border-slate-200 bg-white p-5"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#1464f4] text-white"><Icon size={17}/></span><p className="mt-4 text-3xl font-black">{value}</p><p className="mt-1 text-sm text-slate-500">{label}</p></div>)}
    </section>

    {message&&<div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold">{message}</div>}

    <section className="mt-6 grid gap-5 xl:grid-cols-[380px_1fr]">
      <form onSubmit={submit} className="h-fit rounded-[1.5rem] bg-[#1464f4] p-6 text-white shadow-xl xl:sticky xl:top-8">
        <p className="text-xs font-black uppercase tracking-[.15em] text-white/40">Manual adjustment</p><h2 className="mt-2 text-xl font-black">Adjust stock</h2>
        <label className="mt-5 block text-xs font-black text-white/55">Variant<select value={form.variantId} onChange={e=>setForm({...form,variantId:e.target.value})} required className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 p-3 text-sm text-white"><option className="text-black" value="">Choose variant</option>{variants.map(x=><option className="text-black" key={x.id} value={x.id}>{x.sku} — {x.barcode}</option>)}</select></label>
        <label className="mt-4 block text-xs font-black text-white/55">Quantity<input type="number" required value={form.quantity} onChange={e=>setForm({...form,quantity:e.target.value})} placeholder="+10 or -3" className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 p-3 text-sm text-white outline-none"/></label>
        <label className="mt-4 block text-xs font-black text-white/55">Reason<input value={form.note} onChange={e=>setForm({...form,note:e.target.value})} placeholder="Stock received, correction..." className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 p-3 text-sm text-white outline-none"/></label>
        <button className="mt-5 w-full rounded-xl bg-white px-5 py-3 text-sm font-black text-slate-950">Save adjustment</button>
      </form>

      <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white">
        <div className="border-b border-slate-100 p-5"><h2 className="text-xl font-black">Current stock</h2><p className="mt-1 text-sm text-slate-500">Variant-level availability and reservation.</p></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-400"><tr><th className="px-5 py-4">Variant</th><th>On hand</th><th>Reserved</th><th>Available</th><th>Status</th></tr></thead><tbody className="divide-y">{stock.map(x=><tr key={x.id}><td className="px-5 py-4 font-mono text-xs">{x.variantId}</td><td>{x.stockOnHand}</td><td>{x.reserved}</td><td className="font-black">{x.available}</td><td><span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${x.lowStock?'bg-amber-50 text-amber-700':'bg-emerald-50 text-emerald-700'}`}>{x.lowStock?'LOW STOCK':'HEALTHY'}</span></td></tr>)}</tbody></table></div>
      </div>
    </section>

    <section className="mt-5 rounded-[1.5rem] border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex items-center gap-3"><History size={18}/><div><h2 className="text-xl font-black">Recent movements</h2><p className="text-sm text-slate-500">Latest inventory adjustments and balances.</p></div></div>
      <div className="mt-5 space-y-2">{movements.slice(0,20).map(x=><div key={x.id} className="grid gap-2 rounded-xl bg-slate-50 p-4 text-sm md:grid-cols-4"><span className="font-black">{x.type}</span><span className={Number(x.quantity)>=0?'text-emerald-700':'text-rose-600'}>{Number(x.quantity)>0?'+':''}{x.quantity}</span><span className="font-semibold">Balance {x.balanceAfter}</span><span className="text-slate-500">{x.note||'—'}</span></div>)}</div>
    </section>
  </AdminShell>
}

