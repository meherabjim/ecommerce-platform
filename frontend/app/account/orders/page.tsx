'use client';

import { useEffect,useMemo,useState } from 'react';
import Link from 'next/link';
import { ArrowRight, PackageSearch, Search, ShoppingBag, Truck } from 'lucide-react';
import Navbar from '@/components/navbar';
import AccountShell from '@/components/account-shell';
import StoreFooter from '@/components/store-footer';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n';

const pretty=(v:string)=>String(v||'').replaceAll('_',' ');
const tone=(s:string)=>s==='DELIVERED'?'bg-emerald-50 text-emerald-700':s==='CANCELLED'?'bg-rose-50 text-rose-700':s==='DELIVERY_FAILED'?'bg-rose-50 text-rose-700':'bg-blue-50 text-[#1464f4]';
const money=(v:any,l:'en'|'bn')=>l==='bn'?`৳${Number(v||0).toLocaleString()}`:`BDT ${Number(v||0).toLocaleString('en-BD')}`;

export default function MyOrdersPage(){
  const {language}=useI18n();
  const [orders,setOrders]=useState<any[]>([]);
  const [query,setQuery]=useState('');
  const [filter,setFilter]=useState('');
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    api.get('/me/orders')
      .then(r=>setOrders(r.data||[]))
      .catch(()=>{})
      .finally(()=>setLoading(false));
  },[]);

  const visible=useMemo(()=>orders.filter(o=>{
    const hay=`${o.orderNumber} ${o.status} ${o.paymentStatus} ${(o.items||[]).map((x:any)=>x.productName).join(' ')}`.toLowerCase();
    return hay.includes(query.toLowerCase())&&(!filter||o.status===filter);
  }),[orders,query,filter]);

  const active=orders.filter(o=>!['DELIVERED','CANCELLED'].includes(o.status)).length;
  const delivered=orders.filter(o=>o.status==='DELIVERED').length;

  return <main className="customer-canvas customer-v3"><Navbar/><AccountShell>
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-xs font-black uppercase tracking-[.18em] text-slate-400">{language==='bn'?'অর্ডার ইতিহাস':'Order history'}</p>
        <h1 className="mt-2 text-3xl font-black sm:text-4xl">{language==='bn'?'আমার অর্ডার':'My orders'}</h1>
        <p className="mt-2 text-sm text-slate-500">{language==='bn'?'অর্ডার, ডেলিভারি, পেমেন্ট ও ইনভয়েস এক জায়গায়।':'Orders, delivery, payment and invoices in one place.'}</p>
      </div>
      <Link href="/shop" className="inline-flex items-center gap-2 customer-btn-primary"><ShoppingBag size={16}/>{language==='bn'?'শপিং করুন':'Shop now'}</Link>
    </div>

    <section className="mt-6 grid gap-3 sm:grid-cols-3">
      {[
        [language==='bn'?'সব অর্ডার':'All orders',orders.length],
        [language==='bn'?'চলমান':'In progress',active],
        [language==='bn'?'ডেলিভার্ড':'Delivered',delivered],
      ].map(([label,value]:any)=><div key={label} className="customer-stat"><p className="text-2xl font-black">{loading?'—':value}</p><p className="mt-1 text-xs font-semibold text-slate-500">{label}</p></div>)}
    </section>

    <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_220px]">
      <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 shadow-sm"><Search size={16} className="text-slate-400"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={language==='bn'?'অর্ডার বা পণ্য খুঁজুন...':'Search orders or products...'} className="w-full py-3.5 text-sm outline-none"/></label>
      <select value={filter} onChange={e=>setFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold shadow-sm">
        <option value="">{language==='bn'?'সব স্ট্যাটাস':'All statuses'}</option>
        {['CONFIRMED','PROCESSING','PACKED','SHIPPED','IN_TRANSIT','OUT_FOR_DELIVERY','DELIVERED','DELIVERY_FAILED','CANCELLED'].map(x=><option key={x}>{x}</option>)}
      </select>
    </div>

    <section className="mt-6 space-y-4">
      {visible.map(o=>(
        <article key={o.id} className="customer-panel overflow-hidden transition hover:-translate-y-0.5 hover:shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-black">{o.orderNumber}</p>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${tone(o.status)}`}>{pretty(o.status)}</span>
              </div>
              <p className="mt-1 text-xs text-slate-400">{o.createdAt?new Date(o.createdAt).toLocaleString():''}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-black">{money(o.total,language)}</p>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{pretty(o.paymentStatus)}</p>
            </div>
          </div>

          <div className="p-5">
            <div className="space-y-3">
              {(o.items||[]).slice(0,3).map((item:any)=>(
                <div key={item.id} className="flex items-center gap-4">
                  <div className="h-20 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                    {item.imageUrl?<img src={item.imageUrl} alt={item.productName} className="h-full w-full object-cover"/>:<div className="grid h-full place-items-center text-slate-300"><PackageSearch size={19}/></div>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={item.slug?`/shop/${item.slug}`:'#'} className="line-clamp-1 text-sm font-black hover:text-[#1464f4]">{language==='bn'?(item.productNameBn||item.productName):item.productName}</Link>
                    <p className="mt-1 text-xs text-slate-500">{item.sku||'Variant'} · Qty {item.quantity}</p>
                    {item.attributes&&Object.keys(item.attributes).length>0&&<p className="mt-1 text-[11px] text-slate-400">{Object.values(item.attributes).join(' / ')}</p>}
                  </div>
                  <p className="text-sm font-black">{money(item.lineTotal,language)}</p>
                </div>
              ))}
              {(o.items||[]).length>3&&<p className="pl-20 text-xs font-bold text-slate-400">+ {(o.items||[]).length-3} {language==='bn'?'টি আরও পণ্য':'more item(s)'}</p>}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <Truck size={15} className="text-[#1464f4]"/>
                <span>{o.trackingNumber?`${language==='bn'?'ট্র্যাকিং':'Tracking'}: ${o.trackingNumber}`:(language==='bn'?'ট্র্যাকিং প্রস্তুত হলে এখানে দেখাবে':'Tracking appears after fulfillment')}</span>
              </div>
              <Link href={`/account/orders/${o.id}`} className="inline-flex items-center gap-2 customer-btn-primary">{language==='bn'?'বিস্তারিত':'View details'}<ArrowRight size={14}/></Link>
            </div>
          </div>
        </article>
      ))}
    </section>

    {!visible.length&&!loading&&<div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white p-14 text-center"><PackageSearch className="mx-auto text-slate-300"/><p className="mt-4 text-lg font-black">{language==='bn'?'কোনো অর্ডার পাওয়া যায়নি':'No orders found'}</p><p className="mt-2 text-sm text-slate-500">{query||filter?(language==='bn'?'ফিল্টার পরিবর্তন করে দেখুন।':'Try changing your search or filter.'):(language==='bn'?'আপনার প্রথম অর্ডার করার সময় হয়েছে।':'Your first order is waiting.')}</p>{!query&&!filter&&<Link href="/shop" className="mt-4 inline-flex rounded-xl bg-[#1464f4] px-5 py-3 text-sm font-black text-white">{language==='bn'?'পণ্য দেখুন':'Explore products'}</Link>}</div>}
  </AccountShell><StoreFooter/></main>;
}
