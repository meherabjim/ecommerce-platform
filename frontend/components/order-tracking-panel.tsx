'use client';

import { Check, Circle, MapPin, Phone, Truck } from 'lucide-react';

const lifecycle=['CONFIRMED','PROCESSING','PACKED','READY_FOR_PICKUP','SHIPPED','IN_TRANSIT','OUT_FOR_DELIVERY','DELIVERED'];
const nice=(value:string)=>String(value||'').replaceAll('_',' ').toLowerCase().replace(/\b\w/g,v=>v.toUpperCase());

export default function OrderTrackingPanel({order}:{order:any}){
  if(!order)return null;

  const currentIndex=lifecycle.indexOf(order.status);
  const address=[order.addressLine,order.area,order.district||order.city,order.division].filter(Boolean).join(', ');
  const hasGPS=order.deliveryLatitude!=null&&order.deliveryLongitude!=null;
  const failed=order.status==='DELIVERY_FAILED';
  const cancelled=order.status==='CANCELLED';

  return (
    <section className="mt-5 overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-[#1464f4]"><Truck size={18}/></span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.14em] text-slate-400">Delivery tracking</p>
            <h2 className="mt-1 text-xl font-black">{nice(order.status)}</h2>
          </div>
        </div>
        {order.trackingNumber&&<div className="rounded-xl bg-slate-50 px-4 py-2 text-right"><p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Tracking ID</p><p className="mt-1 text-xs font-black">{order.trackingNumber}</p></div>}
      </div>

      <div className="p-5 sm:p-6">
        {!cancelled&&!failed&&(
          <div className="overflow-x-auto pb-2">
            <div className="flex min-w-[760px] items-start">
              {lifecycle.map((status,index)=>{
                const complete=currentIndex>=index;
                const current=currentIndex===index;
                return <div key={status} className="relative flex flex-1 flex-col items-center">
                  {index>0&&<div className={`absolute right-1/2 top-[15px] h-[3px] w-full ${complete?'bg-[#1464f4]':'bg-slate-200'}`}/>}
                  <div className={`relative z-10 grid h-8 w-8 place-items-center rounded-full border-2 ${complete?'border-[#1464f4] bg-[#1464f4] text-white':'border-slate-200 bg-white text-slate-300'} ${current?'ring-4 ring-blue-100':''}`}>
                    {complete?<Check size={14}/>:<Circle size={11}/>}
                  </div>
                  <p className={`mt-2 max-w-[90px] text-center text-[10px] font-black leading-tight ${current?'text-[#1464f4]':'text-slate-500'}`}>{nice(status)}</p>
                </div>
              })}
            </div>
          </div>
        )}

        {failed&&<div className="rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700"><b>Delivery attempt failed.</b>{order.deliveryFailureReason&&<span> {order.deliveryFailureReason}</span>}</div>}
        {cancelled&&<div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-600">This order was cancelled.</div>}

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-slate-400"><MapPin size={15}/><p className="text-[10px] font-black uppercase tracking-[.14em]">Delivery address</p></div>
            <p className="mt-3 font-black">{order.customerName}</p>
            <p className="mt-1 text-sm text-slate-600">{order.phone}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{address}</p>
            {hasGPS&&<a href={`https://www.google.com/maps?q=${order.deliveryLatitude},${order.deliveryLongitude}`} target="_blank" rel="noreferrer" className="mt-3 inline-flex rounded-lg border bg-white px-3 py-2 text-xs font-black text-[#1464f4]">View map</a>}
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-slate-400"><Truck size={15}/><p className="text-[10px] font-black uppercase tracking-[.14em]">Delivery agent</p></div>
            {order.deliveryAgent?<>
              <p className="mt-3 font-black">{order.deliveryAgent.name}</p>
              <p className="mt-1 text-sm text-slate-600">{order.deliveryAgent.phone||'Phone not available'}</p>
              {order.deliveryAgent.phone&&<a href={`tel:${order.deliveryAgent.phone}`} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#1464f4] px-3 py-2 text-xs font-black text-white"><Phone size={13}/>Call rider</a>}
            </>:<p className="mt-3 text-sm text-slate-500">A delivery agent will appear here after assignment.</p>}

            <div className="mt-4 border-t border-slate-200 pt-3 text-xs">
              <div className="flex justify-between gap-3"><span className="text-slate-500">Payment</span><b>{nice(order.paymentStatus)}</b></div>
              {order.codAmount!==undefined&&Number(order.codAmount)>0&&<div className="mt-2 flex justify-between gap-3"><span className="text-slate-500">COD amount</span><b>BDT {Number(order.codAmount).toLocaleString()}</b></div>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
