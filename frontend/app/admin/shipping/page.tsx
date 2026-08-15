'use client';

import { FormEvent,useEffect,useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminShell from '@/components/admin-shell';
import { api } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';

const empty={district:'Dhaka',area:'',charge:'80',freeShippingThreshold:'3000',active:true,deliveryMode:'INTERNAL',preferredProvider:'',internalServiceable:true};

export default function AdminShippingPage(){
  const router=useRouter();
  const [items,setItems]=useState<any[]>([]);
  const [form,setForm]=useState<any>(empty);
  const [editing,setEditing]=useState<string|null>(null);
  const [message,setMessage]=useState('');

  async function load(){const r=await api.get('/admin/shipping-zones');setItems(r.data||[])}

  useEffect(()=>{
    const u=getStoredUser();
    if(!u||!['SUPER_ADMIN','ADMIN','ORDER_MANAGER'].includes(u.role)){router.replace('/login');return}
    load();
  },[router]);

  function edit(x:any){
    setEditing(x.id);setForm({
      district:x.district,area:x.area||'',charge:String(x.charge),
      freeShippingThreshold:String(x.freeShippingThreshold),active:x.active,
      deliveryMode:x.deliveryMode||'AUTO',
      preferredProvider:x.preferredProvider||'',
      internalServiceable:Boolean(x.internalServiceable),
    });window.scrollTo({top:0,behavior:'smooth'});
  }

  function reset(){setEditing(null);setForm({...empty})}

  async function submit(e:FormEvent){
    e.preventDefault();setMessage('');
    const payload={
      district:form.district.trim(),area:form.area.trim()||undefined,
      charge:Number(form.charge),freeShippingThreshold:Number(form.freeShippingThreshold),
      active:Boolean(form.active),deliveryMode:form.deliveryMode,
      preferredProvider:form.preferredProvider||undefined,
      internalServiceable:Boolean(form.internalServiceable),
    };
    try{
      if(editing)await api.patch(`/admin/shipping-zones/${editing}`,payload);
      else await api.post('/admin/shipping-zones',payload);
      setMessage(editing?'Shipping policy updated.':'Shipping policy created.');
      reset();await load();
    }catch(e:any){setMessage(e?.response?.data?.message||'Could not save shipping policy.')}
  }

  async function remove(id:string){
    if(!confirm('Delete this shipping rule?'))return;
    await api.delete(`/admin/shipping-zones/${id}`);await load();
  }

  return <AdminShell>
    <div><p className="text-xs font-black uppercase tracking-[.18em] text-slate-400">Hybrid fulfillment</p><h1 className="mt-2 text-4xl font-black">Shipping & delivery policy</h1><p className="mt-2 text-slate-500">Choose where your own riders deliver and where external courier is preferred.</p></div>
    {message&&<p className="mt-5 rounded-2xl border bg-white p-4 text-sm font-semibold">{message}</p>}

    <form onSubmit={submit} className="mt-6 rounded-[1.5rem] border bg-white p-6">
      <div className="flex justify-between gap-4"><h2 className="text-xl font-black">{editing?'Edit policy':'Add policy'}</h2>{editing&&<button type="button" onClick={reset} className="text-sm font-bold underline">Cancel</button>}</div>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="text-sm font-bold">District<input required value={form.district} onChange={e=>setForm({...form,district:e.target.value})} className="mt-2 w-full rounded-xl border p-3 font-normal"/></label>
        <label className="text-sm font-bold">Area (optional)<input value={form.area} onChange={e=>setForm({...form,area:e.target.value})} className="mt-2 w-full rounded-xl border p-3 font-normal"/></label>
        <label className="text-sm font-bold">Delivery charge<input type="number" min="0" required value={form.charge} onChange={e=>setForm({...form,charge:e.target.value})} className="mt-2 w-full rounded-xl border p-3 font-normal"/></label>
        <label className="text-sm font-bold">Free shipping from<input type="number" min="0" required value={form.freeShippingThreshold} onChange={e=>setForm({...form,freeShippingThreshold:e.target.value})} className="mt-2 w-full rounded-xl border p-3 font-normal"/></label>
        <label className="text-sm font-bold">Delivery mode<select value={form.deliveryMode} onChange={e=>setForm({...form,deliveryMode:e.target.value})} className="mt-2 w-full rounded-xl border bg-white p-3 font-normal"><option>AUTO</option><option>INTERNAL</option><option>EXTERNAL</option></select></label>
        <label className="text-sm font-bold">Preferred courier<select value={form.preferredProvider} onChange={e=>setForm({...form,preferredProvider:e.target.value})} className="mt-2 w-full rounded-xl border bg-white p-3 font-normal"><option value="">No preference</option><option>PATHAO</option><option>STEADFAST</option><option>REDX</option></select></label>
        <label className="flex items-center gap-3 pt-8 text-sm font-bold"><input type="checkbox" checked={form.internalServiceable} onChange={e=>setForm({...form,internalServiceable:e.target.checked})}/>Own rider can serve this zone</label>
        <label className="flex items-center gap-3 pt-8 text-sm font-bold"><input type="checkbox" checked={form.active} onChange={e=>setForm({...form,active:e.target.checked})}/>Active</label>
      </div>
      <button className="mt-5 rounded-xl bg-[#1464f4] px-5 py-3 text-sm font-black text-white">{editing?'Save changes':'Create policy'}</button>
    </form>

    <section className="mt-6 overflow-x-auto rounded-[1.5rem] border bg-white">
      <table className="w-full min-w-[980px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-400"><tr><th className="px-5 py-4">Zone</th><th>Charge</th><th>Free from</th><th>Mode</th><th>Preferred</th><th>Own rider</th><th>Status</th><th>Actions</th></tr></thead><tbody className="divide-y">{items.map(x=><tr key={x.id}><td className="px-5 py-4 font-black">{x.district}{x.area?` · ${x.area}`:''}</td><td>BDT {x.charge}</td><td>BDT {x.freeShippingThreshold}</td><td>{x.deliveryMode||'AUTO'}</td><td>{x.preferredProvider||'—'}</td><td>{x.internalServiceable?'YES':'NO'}</td><td>{x.active?'ACTIVE':'OFF'}</td><td><div className="flex gap-2"><button onClick={()=>edit(x)} className="rounded-lg border px-3 py-2 text-xs font-black">Edit</button><button onClick={()=>remove(x.id)} className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-black text-rose-600">Delete</button></div></td></tr>)}</tbody></table>
    </section>
  </AdminShell>
}
