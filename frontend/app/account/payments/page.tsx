'use client';

import { useEffect,useMemo,useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CreditCard, Search, WalletCards } from 'lucide-react';
import Navbar from '@/components/navbar';
import AccountShell from '@/components/account-shell';
import StoreFooter from '@/components/store-footer';
import { api } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';
import { authRedirectUrl } from '@/lib/customer-auth';
import { useI18n } from '@/lib/i18n';

const money=(v:any,language:'en'|'bn')=>language==='bn'?`৳${Number(v||0).toLocaleString()}`:`BDT ${Number(v||0).toLocaleString(undefined,{maximumFractionDigits:2})}`;
const pretty=(v:string)=>String(v||'').replaceAll('_',' ');
const tone=(s:string)=>s==='VERIFIED'?'bg-emerald-50 text-emerald-700':s==='FAILED'?'bg-rose-50 text-rose-700':'bg-amber-50 text-amber-700';

export default function AccountPayments(){
  const router=useRouter();const {language}=useI18n();const [items,setItems]=useState<any[]>([]);const [query,setQuery]=useState('');
  useEffect(()=>{if(!getStoredUser()){router.replace(authRedirectUrl(window.location.pathname));return}api.get('/payments/me').then(r=>setItems(r.data||[]))},[router]);
  const visible=useMemo(()=>items.filter(x=>`${x.type} ${x.provider} ${x.paymentMethod||''} ${x.status} ${x.externalReference||''}`.toLowerCase().includes(query.toLowerCase())),[items,query]);
  const verified=items.filter(x=>x.status==='VERIFIED').reduce((s,x)=>s+Number(x.amount||0),0);
  const pending=items.filter(x=>x.status==='PENDING').reduce((s,x)=>s+Number(x.amount||0),0);

  return <main className="customer-canvas customer-v3"><Navbar/><AccountShell>
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.18em] text-slate-400">{language==='bn'?'অ্যাকাউন্ট ফাইন্যান্স':'Account finance'}</p><h1 className="mt-2 text-4xl font-black">{language==='bn'?'পেমেন্ট ইতিহাস':'Payment history'}</h1><p className="mt-2 text-sm text-slate-500">{language==='bn'?'আপনার অর্ডারের যাচাইকৃত, পেন্ডিং ও ম্যানুয়াল পেমেন্ট।':'Verified, pending and manual transactions linked to your orders.'}</p></div><Link href="/account/orders" className="rounded-xl border bg-white px-4 py-3 text-sm font-black">{language==='bn'?'আমার অর্ডার':'My orders'}</Link></div>
    <section className="mt-6 grid gap-3 sm:grid-cols-2"><div className="customer-panel p-5"><WalletCards className="text-[#1464f4]"/><p className="mt-4 text-2xl font-black">{money(verified,language)}</p><p className="text-sm text-slate-500">{language==='bn'?'যাচাইকৃত পেমেন্ট':'Verified payments'}</p></div><div className="customer-panel p-5"><CreditCard className="text-[#f36b21]"/><p className="mt-4 text-2xl font-black">{money(pending,language)}</p><p className="text-sm text-slate-500">{language==='bn'?'পেন্ডিং পেমেন্ট':'Pending payments'}</p></div></section>
    <label className="mt-5 flex max-w-xl items-center gap-2 rounded-xl border bg-white px-4"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={language==='bn'?'পেমেন্ট খুঁজুন...':'Search payment history...'} className="w-full py-3 outline-none"/></label>
    <div className="mt-5 space-y-3">{visible.map(x=><article key={x.id} className="flex flex-wrap items-center gap-4 customer-panel p-5"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#1464f4] text-white"><CreditCard size={18}/></span><div className="min-w-[220px] flex-1"><p className="font-black">{pretty(x.type)}</p><p className="mt-1 font-mono text-[10px] text-slate-400">{x.orderId}</p><p className="mt-1 text-xs text-slate-500">{x.provider} · {x.paymentMethod||'—'}{x.externalReference?` · ${x.externalReference}`:''}</p></div><div className="text-right"><p className="text-lg font-black">{money(x.amount,language)}</p><span className={`mt-1 inline-block rounded-full px-2.5 py-1 text-[10px] font-black ${tone(x.status)}`}>{pretty(x.status)}</span></div></article>)}</div>
    {!visible.length&&<div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white p-14 text-center text-slate-500">{language==='bn'?'কোনো পেমেন্ট ইতিহাস নেই।':'No payment history yet.'}</div>}
  </AccountShell><StoreFooter/></main>
}
