'use client';

import { FormEvent,useEffect,useMemo,useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPinned, PackageCheck, Search, Truck, WalletCards } from 'lucide-react';
import AdminShell from '@/components/admin-shell';
import { api } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';

const pretty=(v:string)=>String(v||'').replaceAll('_',' ');
const money=(v:any)=>`BDT ${Number(v||0).toLocaleString(undefined,{maximumFractionDigits:2})}`;

export default function ShipmentsPage(){
  const router=useRouter();
  const [shipments,setShipments]=useState<any[]>([]);
  const [orders,setOrders]=useState<any[]>([]);
  const [query,setQuery]=useState('');
  const [message,setMessage]=useState('');
  const [form,setForm]=useState({orderId:'',provider:'AUTO',consignmentId:'',trackingCode:'',trackingUrl:'',deliveryFee:'0'});

  async function load(){
    const [s,o]=await Promise.all([api.get('/courier/admin/shipments'),api.get('/admin/orders')]);
    setShipments(s.data||[]);setOrders(o.data||[]);
  }
  useEffect(()=>{const u=getStoredUser();if(!u||!['SUPER_ADMIN','ADMIN','ORDER_MANAGER'].includes(u.role)){router.replace('/login');return}load()},[router]);

  async function create(e:FormEvent){
    e.preventDefault();
    try{
      await api.post('/courier/admin/shipments',{...form,deliveryFee:Number(form.deliveryFee||0),consignmentId:form.consignmentId||undefined,trackingCode:form.trackingCode||undefined,trackingUrl:form.trackingUrl||undefined});
      setForm({orderId:'',provider:'AUTO',consignmentId:'',trackingCode:'',trackingUrl:'',deliveryFee:'0'});setMessage('Shipment created.');await load();
    }catch(e:any){setMessage(e?.response?.data?.message||'Shipment creation failed.')}
  }

  async function status(id:string,status:string){
    await api.patch(`/courier/admin/shipments/${id}/status`,{status,providerStatus:status,note:`Updated by admin to ${status}`});
    await load();
  }

  async function reconcile(id:string,current:any){
    const collected=prompt('Collected COD amount',String(current?.collectedAmount||0));
    if(collected===null)return;
    const settled=prompt('Settled amount to company',String(current?.settledAmount||0));
    if(settled===null)return;
    const reference=prompt('Settlement reference (optional)',current?.settlementReference||'')||undefined;
    const expected=Number(current?.expectedAmount||0);
    const settledNumber=Number(settled);
    const nextStatus=settledNumber>=expected?'SETTLED':settledNumber>0?'PARTIAL':'PENDING';
    await api.patch(`/courier/admin/shipments/${id}/reconciliation`,{collectedAmount:Number(collected),settledAmount:settledNumber,status:nextStatus,settlementReference:reference});
    await load();
  }

  const visible=useMemo(()=>shipments.filter((x:any)=>`${x.order?.orderNumber||''} ${x.shipment.provider} ${x.shipment.consignmentId||''} ${x.shipment.trackingCode||''} ${x.shipment.recipientName}`.toLowerCase().includes(query.toLowerCase())),[shipments,query]);
  const active=shipments.filter((x:any)=>!['DELIVERED','RETURNED','CANCELLED'].includes(x.shipment.status)).length;
  const codPending=shipments.filter((x:any)=>x.reconciliation&&x.reconciliation.status!=='SETTLED').reduce((s:any,x:any)=>s+Number(x.reconciliation.expectedAmount||0)-Number(x.reconciliation.settledAmount||0),0);

  return <AdminShell>
    <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end"><div><p className="text-xs font-black uppercase tracking-[.18em] text-slate-400">SRS fulfillment operations</p><h1 className="mt-2 text-4xl font-black tracking-tight">Courier shipments</h1><p className="mt-2 text-sm text-slate-500">Consignment, tracking events, external provider records and COD settlement reconciliation.</p></div><label className="flex items-center gap-2 rounded-xl border bg-white px-4"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search shipment..." className="py-3 outline-none"/></label></div>

    <section className="mt-6 grid gap-3 sm:grid-cols-3">{[[Truck,'Active shipments',active],[PackageCheck,'Total shipments',shipments.length],[WalletCards,'COD unsettled',money(codPending)]].map(([Icon,l,v]:any)=><div key={l} className="rounded-2xl border border-slate-200 bg-white p-5"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#1464f4] text-white"><Icon size={17}/></span><p className="mt-4 text-2xl font-black">{v}</p><p className="text-sm text-slate-500">{l}</p></div>)}</section>
    {message&&<p className="mt-5 rounded-xl border bg-white p-4 text-sm font-semibold">{message}</p>}

    <form onSubmit={create} className="mt-6 rounded-[1.5rem] bg-[#1464f4] p-6 text-white"><h2 className="text-xl font-black">Create shipment / consignment record</h2><div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3"><select required value={form.orderId} onChange={e=>setForm({...form,orderId:e.target.value})} className="rounded-xl border border-white/10 bg-white/10 p-3"><option className="text-black" value="">Choose order</option>{orders.filter(o=>!['CANCELLED'].includes(o.status)).map(o=><option className="text-black" key={o.id} value={o.id}>{o.orderNumber} · {o.customerName}</option>)}</select><select value={form.provider} onChange={e=>setForm({...form,provider:e.target.value})} className="rounded-xl border border-white/10 bg-white/10 p-3"><option className="text-black">AUTO</option><option className="text-black">INTERNAL</option><option className="text-black">PATHAO</option><option className="text-black">STEADFAST</option><option className="text-black">REDX</option></select><input value={form.consignmentId} onChange={e=>setForm({...form,consignmentId:e.target.value})} placeholder="Provider consignment ID" className="rounded-xl border border-white/10 bg-white/10 p-3"/><input value={form.trackingCode} onChange={e=>setForm({...form,trackingCode:e.target.value})} placeholder="Tracking code (optional)" className="rounded-xl border border-white/10 bg-white/10 p-3"/><input value={form.trackingUrl} onChange={e=>setForm({...form,trackingUrl:e.target.value})} placeholder="Tracking URL (optional)" className="rounded-xl border border-white/10 bg-white/10 p-3"/><input type="number" min="0" step="0.01" value={form.deliveryFee} onChange={e=>setForm({...form,deliveryFee:e.target.value})} placeholder="Courier fee" className="rounded-xl border border-white/10 bg-white/10 p-3"/></div><button className="mt-4 rounded-xl bg-white px-5 py-3 text-sm font-black text-slate-950">Create shipment</button></form>

    <section className="mt-6 space-y-4">{visible.map((row:any)=>{const s=row.shipment,o=row.order,r=row.reconciliation;return <article key={s.id} className="rounded-[1.5rem] border border-slate-200 bg-white p-5"><div className="grid gap-5 xl:grid-cols-[1fr_320px]"><div><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-[#1464f4] px-3 py-1 text-[10px] font-black text-white">{pretty(s.status)}</span><span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black">{s.provider}</span></div><p className="mt-4 text-xl font-black">{o?.orderNumber||s.orderId}</p><p className="mt-1 text-sm text-slate-500">{s.recipientName} · {s.phone}</p><p className="mt-3 text-sm">{s.deliveryAddress}</p><p className="mt-1 text-xs text-slate-400">{[s.area,s.district].filter(Boolean).join(', ')}</p><div className="mt-4 grid gap-2 sm:grid-cols-3"><div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] uppercase text-slate-400">Consignment</p><p className="mt-1 break-all text-xs font-black">{s.consignmentId||'—'}</p></div><div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] uppercase text-slate-400">Tracking</p><p className="mt-1 break-all text-xs font-black">{s.trackingCode||'—'}</p></div><div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] uppercase text-slate-400">COD</p><p className="mt-1 text-xs font-black">{money(s.codAmount)}</p></div></div>{row.events?.length>0&&<div className="mt-4 border-l-2 border-slate-200 pl-4">{row.events.slice(0,5).map((e:any)=><div key={e.id} className="mb-3"><p className="text-xs font-black">{pretty(e.normalizedStatus)}</p><p className="text-[10px] text-slate-400">{new Date(e.eventTime).toLocaleString()} · {e.note||e.providerStatus}</p></div>)}</div>}</div><aside className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-black uppercase tracking-[.15em] text-slate-400">Operations</p><select value={s.status} onChange={e=>status(s.id,e.target.value)} className="mt-3 w-full rounded-xl border bg-white p-3 text-sm font-black">{['CREATED','PICKUP_REQUESTED','PICKED_UP','IN_TRANSIT','OUT_FOR_DELIVERY','DELIVERED','FAILED','RETURNED','CANCELLED'].map(v=><option key={v} value={v}>{pretty(v)}</option>)}</select>{r&&<div className="mt-4 rounded-xl bg-white p-4"><p className="font-black">COD reconciliation</p><p className="mt-2 text-xs text-slate-500">Expected {money(r.expectedAmount)}</p><p className="text-xs text-slate-500">Collected {money(r.collectedAmount)}</p><p className="text-xs text-slate-500">Settled {money(r.settledAmount)}</p><p className="mt-2 text-xs font-black">{pretty(r.status)}</p><button onClick={()=>reconcile(s.id,r)} className="mt-3 w-full rounded-lg bg-[#1464f4] px-3 py-2 text-xs font-black text-white">Update settlement</button></div>}</aside></div></article>})}</section>
  </AdminShell>
}

