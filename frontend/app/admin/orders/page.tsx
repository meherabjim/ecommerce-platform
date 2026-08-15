'use client';

import { useEffect,useMemo,useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ChevronRight, PackageCheck, Search, Truck, WalletCards } from 'lucide-react';
import AdminShell from '@/components/admin-shell';
import { api } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';

const transitions:Record<string,string[]>={
  PENDING:['CONFIRMED','CANCELLED'],
  CONFIRMED:['PROCESSING','CANCELLED'],
  PROCESSING:['PACKED','CANCELLED'],
  PACKED:['READY_FOR_PICKUP','CANCELLED'],
  READY_FOR_PICKUP:['SHIPPED','CANCELLED'],
  SHIPPED:[],
  IN_TRANSIT:[],
  OUT_FOR_DELIVERY:[],
  DELIVERY_FAILED:['CANCELLED'],
  DELIVERED:[],
  CANCELLED:[],
};
const pretty=(x:string)=>String(x||'').replaceAll('_',' ');
const tone=(s:string)=>s==='DELIVERED'?'bg-emerald-50 text-emerald-700':s==='CANCELLED'?'bg-rose-50 text-rose-700':s==='DELIVERY_FAILED'?'bg-amber-50 text-amber-700':'bg-blue-50 text-blue-700';

export default function AdminOrders(){
  const router=useRouter();
  const [orders,setOrders]=useState<any[]>([]);
  const [query,setQuery]=useState('');
  const [filter,setFilter]=useState('');
  const [attention,setAttention]=useState('');
  const [message,setMessage]=useState('');

  async function load(){setOrders((await api.get('/admin/orders')).data||[])}
  useEffect(()=>{const u=getStoredUser();if(!u||!['SUPER_ADMIN','ADMIN','ORDER_MANAGER','CUSTOMER_SUPPORT','FINANCE'].includes(String(u.role).toUpperCase())){router.replace('/admin?denied=1');return}load()},[router]);

  async function update(order:any,status:string){
    let note=`Status changed to ${status} by operations`;
    if(status==='CANCELLED'){
      const reason=prompt('Cancellation reason');
      if(!reason||reason.trim().length<3)return;
      note=reason.trim();
    }
    try{
      await api.patch(`/admin/orders/${order.id}/status`,{status,note});
      setMessage(`Order moved to ${pretty(status)}.`);await load();
    }catch(e:any){setMessage(e?.response?.data?.message||'Update failed.')}
  }

  const visible=useMemo(()=>orders.filter((o:any)=>{
    const hay=`${o.orderNumber} ${o.customerName} ${o.phone} ${o.city} ${o.area||''} ${o.trackingNumber||''}`.toLowerCase();
    const q=hay.includes(query.toLowerCase());
    const s=!filter||o.status===filter;
    const a=!attention||
      (attention==='PAYMENT'&&o.paymentMode==='FULL_ONLINE'&&o.paymentStatus!=='PAID')||
      (attention==='UNASSIGNED'&&!o.deliveryAgentId&&!['DELIVERED','CANCELLED'].includes(o.status))||
      (attention==='READY'&&['PACKED','READY_FOR_PICKUP'].includes(o.status))||
      (attention==='FAILED'&&o.status==='DELIVERY_FAILED');
    return q&&s&&a;
  }),[orders,query,filter,attention]);

  const stats=useMemo(()=>({
    active:orders.filter(o=>!['DELIVERED','CANCELLED'].includes(o.status)).length,
    payment:orders.filter(o=>o.paymentMode==='FULL_ONLINE'&&o.paymentStatus!=='PAID'&&!['CANCELLED'].includes(o.status)).length,
    ready:orders.filter(o=>['PACKED','READY_FOR_PICKUP'].includes(o.status)).length,
    failed:orders.filter(o=>o.status==='DELIVERY_FAILED').length,
  }),[orders]);

  return <AdminShell>
    <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end"><div><p className="text-xs font-black uppercase tracking-[.18em] text-blue-600">Fulfillment control</p><h1 className="mt-2 text-4xl font-black">Orders</h1><p className="mt-2 text-sm text-slate-500">Process payment-safe orders, hand off delivery and resolve exceptions.</p></div><div className="grid gap-3 sm:grid-cols-3"><label className="flex items-center gap-2 rounded-xl border bg-white px-4"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Order / customer..." className="w-full py-3 outline-none"/></label><select value={filter} onChange={e=>setFilter(e.target.value)} className="rounded-xl border bg-white px-4 py-3 text-sm font-bold"><option value="">All statuses</option>{Object.keys(transitions).map(s=><option key={s}>{s}</option>)}</select><select value={attention} onChange={e=>setAttention(e.target.value)} className="rounded-xl border bg-white px-4 py-3 text-sm font-bold"><option value="">All work queues</option><option value="PAYMENT">Payment attention</option><option value="READY">Ready to hand off</option><option value="UNASSIGNED">Unassigned delivery</option><option value="FAILED">Delivery failed</option></select></div></div>

    <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {[[PackageCheck,'Active orders',stats.active],[WalletCards,'Payment attention',stats.payment],[Truck,'Ready for delivery',stats.ready],[AlertTriangle,'Delivery exceptions',stats.failed]].map(([Icon,label,value]:any)=><button key={label} onClick={()=>setAttention(label==='Payment attention'?'PAYMENT':label==='Ready for delivery'?'READY':label==='Delivery exceptions'?'FAILED':'')} className="rounded-2xl border bg-white p-5 text-left"><span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600"><Icon size={17}/></span><p className="mt-4 text-3xl font-black">{value}</p><p className="text-sm text-slate-500">{label}</p></button>)}
    </section>

    {message&&<p className="mt-5 rounded-2xl border bg-white p-4 text-sm font-semibold">{message}</p>}

    <section className="mt-6 space-y-3">{visible.map((o:any)=><article key={o.id} className="overflow-hidden rounded-[1.5rem] border bg-white transition hover:shadow-md">
      <div className="grid gap-5 p-5 md:grid-cols-[1.3fr_.8fr_.6fr_auto] md:items-center"><div><div className="flex flex-wrap items-center gap-2"><p className="text-lg font-black">{o.orderNumber}</p><span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${tone(o.status)}`}>{pretty(o.status)}</span></div><p className="mt-1 text-sm text-slate-500">{o.customerName} · {o.phone}</p><p className="mt-1 text-xs text-slate-400">{[o.area,o.district||o.city].filter(Boolean).join(', ')}{o.deliveryAgent?.name?` · Rider: ${o.deliveryAgent.name}`:''}</p></div><div><p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Payment</p><p className="mt-1 text-sm font-black">{o.paymentMode} / {pretty(o.paymentStatus)}</p>{o.paymentMode==='FULL_ONLINE'&&o.paymentStatus!=='PAID'&&<p className="mt-1 text-[10px] font-black text-amber-600">VERIFY BEFORE PROCESSING</p>}</div><div><p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total</p><p className="mt-1 text-xl font-black">BDT {o.total}</p></div><Link href={`/admin/orders/${o.id}`} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1464f4] px-4 text-sm font-black text-white">Details <ChevronRight size={15}/></Link></div>
      {(transitions[o.status]||[]).length>0&&<div className="flex flex-wrap items-center gap-2 border-t bg-slate-50 px-5 py-3"><span className="mr-1 text-[10px] font-black uppercase tracking-wider text-slate-400">Safe actions</span>{(transitions[o.status]||[]).map(s=><button key={s} onClick={()=>update(o,s)} className={`rounded-lg border px-3 py-2 text-[11px] font-black ${s==='CANCELLED'?'border-rose-200 bg-white text-rose-600':'bg-white hover:border-blue-500'}`}>{pretty(s)}</button>)}</div>}
    </article>)}</section>
    {!visible.length&&<div className="mt-6 rounded-3xl border border-dashed bg-white p-14 text-center text-slate-500">No matching orders.</div>}
  </AdminShell>
}
