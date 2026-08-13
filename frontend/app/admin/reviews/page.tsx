'use client';
import { useEffect,useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminShell from '@/components/admin-shell';
import { api } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';

export default function ReviewsAdmin(){
  const r=useRouter(),[items,setItems]=useState<any[]>([]),[msg,setMsg]=useState('');
  async function load(){setItems((await api.get('/reviews')).data)}
  useEffect(()=>{const u=getStoredUser();if(!u||u.role!=='ADMIN'){r.replace('/login');return;}load()},[r]);
  async function moderate(id:string,status:string){
    try{await api.patch(`/reviews/${id}`,{status});setMsg(`Review ${status.toLowerCase()}.`);await load()}
    catch(e:any){setMsg(e?.response?.data?.message||'Update failed.')}
  }
  return <AdminShell>
    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Trust</p>
    <h1 className="mt-2 text-4xl font-black">Review moderation</h1>
    {msg&&<p className="mt-5 rounded-2xl border bg-white p-4 text-sm font-semibold">{msg}</p>}
    <section className="mt-6 space-y-4">
      {items.map(x=><div key={x.id} className="rounded-3xl border bg-white p-6">
        <div className="flex flex-wrap justify-between gap-3">
          <div><p className="text-2xl font-black">{'★'.repeat(x.rating)}{'☆'.repeat(5-x.rating)}</p><p className="mt-2 text-slate-600">{x.comment||'No comment'}</p></div>
          <span className="h-fit rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold">{x.status}</span>
        </div>
        <div className="mt-5 flex gap-2">
          <button onClick={()=>moderate(x.id,'APPROVED')} className="rounded-lg bg-slate-950 px-4 py-2 text-xs font-bold text-white">APPROVE</button>
          <button onClick={()=>moderate(x.id,'REJECTED')} className="rounded-lg border border-red-200 px-4 py-2 text-xs font-bold text-red-600">REJECT</button>
        </div>
      </div>)}
      {!items.length&&<div className="rounded-3xl border border-dashed p-12 text-center text-slate-500">No reviews yet.</div>}
    </section>
  </AdminShell>
}

