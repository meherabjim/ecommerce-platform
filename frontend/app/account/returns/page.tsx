'use client';

import { useEffect,useMemo,useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Clock3, PackageCheck, RotateCcw, Search, XCircle } from 'lucide-react';
import Navbar from '@/components/navbar';
import AccountShell from '@/components/account-shell';
import StoreFooter from '@/components/store-footer';
import { api } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';
import { authRedirectUrl } from '@/lib/customer-auth';
import { useI18n } from '@/lib/i18n';

const pretty=(x:string)=>String(x||'').replaceAll('_',' ');
const tone=(s:string)=>s==='REFUNDED'?'bg-emerald-50 text-emerald-700':s==='REJECTED'?'bg-rose-50 text-rose-700':s==='RECEIVED'?'bg-blue-50 text-blue-700':'bg-amber-50 text-amber-700';

export default function ReturnsPage(){
  const router=useRouter();const {language}=useI18n();const [items,setItems]=useState<any[]>([]);const [filter,setFilter]=useState('');const [query,setQuery]=useState('');
  useEffect(()=>{if(!getStoredUser()){router.replace(authRedirectUrl(window.location.pathname));return}api.get('/returns').then(r=>setItems(r.data||[]))},[router]);
  const visible=useMemo(()=>items.filter(x=>`${x.reason} ${x.status} ${x.order?.orderNumber||x.orderId||''}`.toLowerCase().includes(query.toLowerCase())&&(!filter||x.status===filter)),[items,query,filter]);
  const statusIcon=(s:string)=>s==='REFUNDED'?CheckCircle2:s==='REJECTED'?XCircle:s==='RECEIVED'?PackageCheck:Clock3;

  return <main className="customer-canvas customer-v3"><Navbar/><AccountShell>
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.18em] text-slate-400">{language==='bn'?'বিক্রয়োত্তর সেবা':'After-sales service'}</p><h1 className="mt-2 text-4xl font-black">{language==='bn'?'রিটার্ন ও রিফান্ড':'Returns & refunds'}</h1><p className="mt-2 text-sm text-slate-500">{language==='bn'?'ডেলিভারির পর রিটার্ন অনুরোধ ও রিফান্ডের অগ্রগতি দেখুন।':'Track return requests and refund progress after delivery.'}</p></div><Link href="/account/orders" className="customer-btn-primary">{language==='bn'?'ডেলিভার্ড অর্ডার দেখুন':'View delivered orders'}</Link></div>
    <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_220px]"><label className="flex items-center gap-2 rounded-xl border bg-white px-4"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={language==='bn'?'রিটার্ন খুঁজুন...':'Search returns...'} className="w-full py-3 outline-none"/></label><select value={filter} onChange={e=>setFilter(e.target.value)} className="rounded-xl border bg-white px-4 py-3 text-sm font-bold"><option value="">{language==='bn'?'সব স্ট্যাটাস':'All statuses'}</option>{['REQUESTED','APPROVED','REJECTED','RECEIVED','REFUNDED'].map(x=><option key={x}>{x}</option>)}</select></div>
    <div className="mt-6 space-y-4">{visible.map(x=>{const I=statusIcon(x.status);return <article key={x.id} className="customer-panel p-5 shadow-sm"><div className="flex flex-wrap justify-between gap-4"><div className="flex gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-blue-50 text-[#1464f4]"><I size={19}/></span><div><p className="font-black">{x.order?.orderNumber||language==='bn'?'রিটার্ন অনুরোধ':'Return request'}</p>{x.order?.orderNumber&&<p className="mt-1 text-xs text-slate-400">{language==='bn'?'অর্ডার':'Order'} {x.order.orderNumber}</p>}<p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{x.reason}</p></div></div><span className={`h-fit rounded-full px-3 py-2 text-[10px] font-black uppercase ${tone(x.status)}`}>{pretty(x.status)}</span></div>{x.adminNote&&<p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm"><b>{language==='bn'?'আপডেট':'Update'}:</b> {x.adminNote}</p>}<div className="mt-4 border-t pt-4 text-xs text-slate-400">{x.createdAt&&new Date(x.createdAt).toLocaleString()}</div></article>})}</div>
    {!visible.length&&<div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white p-14 text-center"><RotateCcw className="mx-auto text-slate-300"/><p className="mt-4 font-black">{language==='bn'?'কোনো রিটার্ন অনুরোধ নেই':'No return requests'}</p><p className="mt-2 text-sm text-slate-500">{language==='bn'?'যোগ্য ডেলিভার্ড অর্ডার থেকে রিটার্ন অনুরোধ করা যাবে।':'Eligible delivered orders can be returned from the order detail page.'}</p></div>}
  </AccountShell><StoreFooter/></main>
}
