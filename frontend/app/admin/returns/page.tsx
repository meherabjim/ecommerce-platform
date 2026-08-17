'use client';

import { useEffect,useMemo,useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Clock3, PackageCheck, RotateCcw, Search, XCircle } from 'lucide-react';
import AdminShell from '@/components/admin-shell';
import { api } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';

const pretty=(x:string)=>String(x||'').replaceAll('_',' ');
const tone=(s:string)=>s==='REFUNDED'?'bg-emerald-50 text-emerald-700':s==='REJECTED'?'bg-rose-50 text-rose-700':s==='RECEIVED'?'bg-blue-50 text-blue-700':'bg-amber-50 text-amber-700';

export default function AdminReturns(){
  const router=useRouter();const [items,setItems]=useState<any[]>([]);const [message,setMessage]=useState('');const [query,setQuery]=useState('');const [filter,setFilter]=useState('');
  async function load(){setItems((await api.get('/admin/returns')).data||[])}
  useEffect(()=>{const user=getStoredUser();if(!user||!['SUPER_ADMIN','ADMIN','ORDER_MANAGER','CUSTOMER_SUPPORT'].includes(String(user.role).toUpperCase())){router.replace('/admin?denied=1');return}load()},[router]);

  async function update(item:any,status:string){
    let promptText=status==='REJECTED'?'Rejection reason':status==='REFUNDED'?'Refund / finance reference or note':'Operational note (optional)';
    const adminNote=prompt(promptText)||undefined;
    if(status==='REJECTED'&&!adminNote){setMessage('A rejection reason is required.');return}
    try{await api.patch(`/admin/returns/${item.id}`,{status,adminNote});setMessage(`Return moved to ${pretty(status)}.`);await load()}catch(e:any){setMessage(e?.response?.data?.message||'Update failed.')}
  }

  const visible=useMemo(()=>items.filter(x=>`${x.order?.orderNumber||x.orderId} ${x.order?.customerName||''} ${x.reason} ${x.status}`.toLowerCase().includes(query.toLowerCase())&&(!filter||x.status===filter)),[items,query,filter]);
  const counts=useMemo(()=>Object.fromEntries(['REQUESTED','APPROVED','RECEIVED','REFUNDED','REJECTED'].map(s=>[s,items.filter(x=>x.status===s).length])),[items]);

  return <AdminShell>
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.18em] text-blue-600">After-sales operations</p><h1 className="mt-2 text-3xl font-black">Returns & refunds</h1><p className="mt-2 text-sm text-slate-500">Review requests, receive returned goods and hand refunds to Finance with a clear audit trail.</p></div><Link href="/admin/finance" className="rounded-xl bg-[#1464f4] px-4 py-3 text-sm font-black text-white">Open Finance</Link></div>
    <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{[['REQUESTED',Clock3],['APPROVED',CheckCircle2],['RECEIVED',PackageCheck],['REFUNDED',RotateCcw],['REJECTED',XCircle]].map(([s,I]:any)=><button key={s} onClick={()=>setFilter(filter===s?'':s)} className={`rounded-2xl border p-5 text-left ${filter===s?'border-blue-400 bg-blue-50':'bg-white'}`}><I size={18} className="text-[#1464f4]"/><p className="mt-4 text-3xl font-black">{counts[s]||0}</p><p className="text-xs font-black uppercase text-slate-400">{pretty(s)}</p></button>)}</section>
    {message&&<p className="mt-5 rounded-xl border bg-white p-4 text-sm font-semibold">{message}</p>}
    <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_220px]"><label className="flex items-center gap-2 rounded-xl border bg-white px-4"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Order / customer / reason..." className="w-full py-3 outline-none"/></label><select value={filter} onChange={e=>setFilter(e.target.value)} className="rounded-xl border bg-white px-4 py-3 text-sm font-bold"><option value="">All statuses</option>{['REQUESTED','APPROVED','REJECTED','RECEIVED','REFUNDED'].map(x=><option key={x}>{x}</option>)}</select></div>
    <section className="mt-6 space-y-4">{visible.map((item:any)=><article key={item.id} className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm"><div className="flex flex-wrap justify-between gap-4"><div><p className="text-lg font-black">{item.order?.orderNumber||item.orderId}</p><p className="mt-1 text-sm text-slate-500">{item.order?.customerName||'Customer'}</p><p className="mt-4 max-w-3xl text-sm leading-6">{item.reason}</p>{item.adminNote&&<p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs"><b>Latest note:</b> {item.adminNote}</p>}</div><span className={`h-fit rounded-full px-3 py-2 text-[10px] font-black uppercase ${tone(item.status)}`}>{pretty(item.status)}</span></div><div className="mt-5 flex flex-wrap gap-2">{item.status==='REQUESTED'&&<><button onClick={()=>update(item,'APPROVED')} className="rounded-xl bg-[#1464f4] px-4 py-2.5 text-xs font-black text-white">Approve</button><button onClick={()=>update(item,'REJECTED')} className="rounded-xl border border-rose-200 px-4 py-2.5 text-xs font-black text-rose-600">Reject</button></>}{item.status==='APPROVED'&&<button onClick={()=>update(item,'RECEIVED')} className="rounded-xl bg-[#1464f4] px-4 py-2.5 text-xs font-black text-white">Mark received</button>}{item.status==='RECEIVED'&&<><Link href="/admin/finance" className="rounded-xl border px-4 py-2.5 text-xs font-black">Create refund in Finance</Link><button onClick={()=>update(item,'REFUNDED')} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white">Confirm refunded</button></>}</div></article>)}</section>
    {!visible.length&&<div className="mt-6 rounded-3xl border border-dashed bg-white p-14 text-center text-slate-500">No matching return requests.</div>}
  </AdminShell>
}
