'use client';

import { useEffect,useMemo,useState } from 'react';
import { useRouter } from 'next/navigation';
import { Banknote, CheckCircle2, LogOut, MapPinned, Navigation, Phone, Truck } from 'lucide-react';
import { api } from '@/lib/api';
import { clearAuth,getStoredUser } from '@/lib/auth';

const nextStatus:Record<string,string[]> = {
  PACKED:['READY_FOR_PICKUP'],
  READY_FOR_PICKUP:['SHIPPED'],
  SHIPPED:['IN_TRANSIT','OUT_FOR_DELIVERY'],
  IN_TRANSIT:['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY:['DELIVERED','DELIVERY_FAILED'],
  DELIVERY_FAILED:['OUT_FOR_DELIVERY'],
};
const nice=(v:string)=>String(v||'').replaceAll('_',' ').toLowerCase().replace(/\b\w/g,x=>x.toUpperCase());

export default function DeliveryDashboard(){
  const router=useRouter();
  const [orders,setOrders]=useState<any[]>([]),[message,setMessage]=useState('');
  const user=getStoredUser();
  async function load(){setOrders((await api.get('/delivery/orders')).data||[])}
  useEffect(()=>{const current=getStoredUser();if(!current||current.role!=='DELIVERY_AGENT'){router.replace('/login');return}load()},[router]);

  async function update(id:string,status:string,paymentMode:string,total:string){
    let failureReason:string|undefined,codCollected:number|undefined;
    if(status==='DELIVERY_FAILED'){failureReason=prompt('Why did the delivery fail?')||undefined;if(!failureReason)return}
    if(status==='DELIVERED'&&paymentMode==='COD'){
      const value=prompt(`COD collected amount. Expected BDT ${total}`,total);
      if(value===null||value.trim()==='')return;
      codCollected=Number(value);if(Number.isNaN(codCollected)){alert('Enter a valid amount.');return}
    }
    try{await api.patch(`/delivery/orders/${id}/status`,{status,failureReason,codCollected,note:`Updated by delivery agent to ${status}`});setMessage(`Order moved to ${nice(status)}.`);await load()}
    catch(e:any){setMessage(e?.response?.data?.message||'Update failed.')}
  }

  const metrics=useMemo(()=>({
    assigned:orders.length,
    out:orders.filter(o=>['IN_TRANSIT','OUT_FOR_DELIVERY'].includes(o.status)).length,
    cod:orders.filter(o=>o.paymentMode==='COD'&&o.status!=='DELIVERED').reduce((s,o)=>s+Number(o.total||0),0)
  }),[orders]);

  return <main className="min-h-screen bg-[#f5f6f8] text-slate-950">
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#1464f4] text-white"><Truck size={18}/></span><div><p className="font-black">Neuro Delivery</p><p className="text-[10px] font-bold uppercase tracking-[.15em] text-slate-400">{user?.name}</p></div></div>
        <button onClick={()=>{clearAuth();router.replace('/login')}} className="flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-xs font-black text-rose-600"><LogOut size={15}/>Sign out</button>
      </div>
    </header>

    <div className="mx-auto max-w-6xl px-5 py-8">
      <p className="text-xs font-black uppercase tracking-[.18em] text-slate-400">Rider workspace</p><h1 className="mt-2 text-4xl font-black">My deliveries</h1><p className="mt-2 text-sm text-slate-500">Navigate, call customers, collect COD and update delivery status.</p>

      <section className="mt-6 grid gap-3 sm:grid-cols-3">
        {[[MapPinned,'Assigned',metrics.assigned],[Navigation,'On the road',metrics.out],[Banknote,'COD outstanding',`BDT ${metrics.cod}`]].map(([Icon,label,value]:any)=><div key={label} className="rounded-2xl border border-slate-200 bg-white p-5"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#1464f4] text-white"><Icon size={17}/></span><p className="mt-4 text-2xl font-black">{value}</p><p className="mt-1 text-sm text-slate-500">{label}</p></div>)}
      </section>

      {message&&<p className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold">{message}</p>}

      <section className="mt-6 space-y-4">
        {orders.map((o:any)=>{
          const hasGPS=o.deliveryLatitude!==null&&o.deliveryLatitude!==undefined&&o.deliveryLongitude!==null&&o.deliveryLongitude!==undefined;
          const actions=nextStatus[o.status]||[];
          return <article key={o.id} className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
            <div className="grid gap-5 p-5 lg:grid-cols-[1fr_300px]">
              <div>
                <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-[#1464f4] px-3 py-1 text-[10px] font-black uppercase text-white">{nice(o.status)}</span>{o.paymentMode==='COD'&&<span className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-black text-amber-700">COD · BDT {o.total}</span>}</div>
                <p className="mt-4 text-xl font-black">{o.orderNumber}</p>{o.trackingNumber&&<p className="mt-1 text-xs text-slate-400">Tracking {o.trackingNumber}</p>}
                <div className="mt-4 rounded-2xl bg-slate-50 p-4"><p className="font-black">{o.customerName}</p><p className="mt-1 text-sm text-slate-500">{o.phone}</p><p className="mt-3 text-sm">{o.addressLine}</p><p className="mt-1 text-xs text-slate-400">{[o.area,o.district||o.city,o.division].filter(Boolean).join(', ')}</p>{o.landmark&&<p className="mt-1 text-xs text-slate-400">Landmark: {o.landmark}</p>}</div>
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  <a href={`tel:${o.phone}`} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-black"><Phone size={16}/>Call</a>
                  {hasGPS&&<a href={`https://www.google.com/maps/dir/?api=1&destination=${o.deliveryLatitude},${o.deliveryLongitude}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-black text-white"><Navigation size={16}/>Navigate</a>}
                  {hasGPS&&<a href={`https://www.google.com/maps?q=${o.deliveryLatitude},${o.deliveryLongitude}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-black"><MapPinned size={16}/>Map</a>}
                </div>
                {o.deliveryFailureReason&&<p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">Last failure: {o.deliveryFailureReason}</p>}
              </div>

              <aside className="h-fit rounded-2xl bg-[#1464f4] p-5 text-white">
                <p className="text-xs font-black uppercase tracking-[.15em] text-white/40">Next action</p>
                <div className="mt-4 space-y-2">{actions.map(status=><button key={status} onClick={()=>update(o.id,status,o.paymentMode,o.total)} className={`w-full rounded-xl px-4 py-3 text-sm font-black ${status==='DELIVERED'?'bg-emerald-500 text-white':status==='DELIVERY_FAILED'?'border border-rose-400/40 bg-rose-500/10 text-rose-200':'bg-white text-slate-950'}`}>{status==='DELIVERED'&&<CheckCircle2 size={15} className="mr-2 inline"/>}{nice(status)}</button>)}</div>
                {!actions.length&&<p className="mt-4 text-sm text-white/45">No further rider action available.</p>}
                {o.codCollected!==null&&o.codCollected!==undefined&&<div className="mt-4 rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-300">COD collected <b>BDT {o.codCollected}</b></div>}
              </aside>
            </div>
          </article>
        })}
        {!orders.length&&<div className="rounded-3xl border border-dashed border-slate-300 bg-white p-14 text-center text-slate-500">No deliveries assigned.</div>}
      </section>
    </div>
  </main>
}
