'use client';

import { FormEvent, useState } from 'react';
import { CheckCircle2, MapPin, PackageCheck, Search, Truck } from 'lucide-react';
import Navbar from '@/components/navbar';
import StoreFooter from '@/components/store-footer';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n';

const statusSteps=['CONFIRMED','PROCESSING','PACKED','READY_FOR_PICKUP','SHIPPED','IN_TRANSIT','OUT_FOR_DELIVERY','DELIVERED'];
const bnStatus:Record<string,string>={CONFIRMED:'নিশ্চিত',PROCESSING:'প্রসেসিং',PACKED:'প্যাক করা হয়েছে',READY_FOR_PICKUP:'পিকআপের জন্য প্রস্তুত',SHIPPED:'শিপড',IN_TRANSIT:'পথে আছে',OUT_FOR_DELIVERY:'ডেলিভারির পথে',DELIVERED:'ডেলিভারি সম্পন্ন',DELIVERY_FAILED:'ডেলিভারি ব্যর্থ',CANCELLED:'বাতিল'};

export default function TrackOrderPage(){
  const {language}=useI18n();
  const [orderNumber,setOrderNumber]=useState('');
  const [phone,setPhone]=useState('');
  const [result,setResult]=useState<any>(null);
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(false);

  async function submit(e:FormEvent){e.preventDefault();setError('');setResult(null);setLoading(true);try{const r=await api.get('/orders/public/track',{params:{orderNumber:orderNumber.trim(),phone:phone.trim()}});setResult(r.data)}catch(err:any){setError(err?.response?.data?.message||(language==='bn'?'অর্ডার পাওয়া যায়নি':'Order could not be found'))}finally{setLoading(false)}}
  const currentIndex=result?statusSteps.indexOf(result.status):-1;

  return <main className="customer-canvas customer-v3"><Navbar/>
    <section className="relative overflow-hidden border-b border-blue-900/10 bg-gradient-to-br from-[#0b2f68] via-[#1464f4] to-[#7048ff] text-white"><div className="relative mx-auto max-w-5xl px-5 py-14 text-center"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white/15 text-white ring-1 ring-white/20"><Truck/></div><p className="mt-5 text-xs font-black uppercase tracking-[.18em] text-blue-100">{language==='bn'?'অর্ডার ট্র্যাকিং':'Order tracking'}</p><h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">{language==='bn'?'আপনার অর্ডারের সর্বশেষ অবস্থা দেখুন':'Track your order in real time'}</h1><p className="mx-auto mt-3 max-w-2xl text-blue-50/80">{language==='bn'?'অর্ডার নম্বর এবং অর্ডারে ব্যবহৃত ফোন নম্বর দিন।':'Enter your order number and the phone number used at checkout.'}</p></div></section>
    <section className="mx-auto max-w-5xl px-5 py-8"><form onSubmit={submit} className="customer-panel grid gap-3 p-5 md:grid-cols-[1fr_1fr_auto]"><input required value={orderNumber} onChange={e=>setOrderNumber(e.target.value)} placeholder={language==='bn'?'অর্ডার নম্বর':'Order number'} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-500"/><input required value={phone} onChange={e=>setPhone(e.target.value)} placeholder={language==='bn'?'ফোন নম্বর':'Phone number'} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-500"/><button disabled={loading} className="customer-btn-primary disabled:opacity-50"><Search size={17}/>{loading?(language==='bn'?'খোঁজা হচ্ছে...':'Checking...'):(language==='bn'?'ট্র্যাক করুন':'Track order')}</button></form>
      {error&&<div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700">{error}</div>}
      {result&&<div className="mt-6 space-y-5">
        <div className="customer-panel grid gap-4 p-6 md:grid-cols-4"><div><p className="text-xs font-black uppercase text-slate-400">{language==='bn'?'অর্ডার':'Order'}</p><p className="mt-1 font-black">{result.orderNumber}</p></div><div><p className="text-xs font-black uppercase text-slate-400">{language==='bn'?'স্ট্যাটাস':'Status'}</p><p className="mt-1 font-black text-blue-600">{language==='bn'?(bnStatus[result.status]||result.status):String(result.status).replaceAll('_',' ')}</p></div><div><p className="text-xs font-black uppercase text-slate-400">{language==='bn'?'মোট':'Total'}</p><p className="mt-1 font-black">{language==='bn'?'৳':'BDT '}{result.total}</p></div><div><p className="text-xs font-black uppercase text-slate-400">{language==='bn'?'ট্র্যাকিং নম্বর':'Tracking no.'}</p><p className="mt-1 font-black">{result.trackingNumber||'—'}</p></div></div>
        <div className="customer-panel p-6"><h2 className="text-xl font-black">{language==='bn'?'ডেলিভারি অগ্রগতি':'Delivery progress'}</h2><div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{statusSteps.map((s,i)=>{const active=currentIndex>=i||result.status===s;return <div key={s} className={`rounded-2xl border p-4 ${active?'border-blue-200 bg-blue-50':'border-slate-200 bg-slate-50'}`}><div className={`grid h-9 w-9 place-items-center rounded-full ${active?'bg-[#1464f4] text-white':'bg-slate-200 text-slate-400'}`}>{active?<CheckCircle2 size={17}/>:<PackageCheck size={17}/>}</div><p className="mt-3 text-sm font-black">{language==='bn'?(bnStatus[s]||s):s.replaceAll('_',' ')}</p></div>})}</div></div>
        <div className="grid gap-5 lg:grid-cols-[1.25fr_.75fr]"><div className="customer-panel p-6"><h2 className="text-xl font-black">{language==='bn'?'অর্ডারের পণ্য':'Order items'}</h2><div className="mt-4 divide-y divide-slate-100">{(result.items||[]).map((item:any)=><div key={item.id||item.sku} className="flex items-center justify-between gap-4 py-4"><div><p className="font-black">{item.productName}</p><p className="mt-1 text-xs text-slate-400">{item.sku} · ×{item.quantity}</p></div><p className="font-black">{language==='bn'?'৳':'BDT '}{item.lineTotal}</p></div>)}</div></div><div className="customer-panel p-6"><div className="flex items-center gap-3"><MapPin className="text-blue-600"/><h2 className="text-xl font-black">{language==='bn'?'ডেলিভারি এলাকা':'Delivery area'}</h2></div><p className="mt-4 text-sm leading-6 text-slate-500">{result.area?[result.area,result.district,result.division].filter(Boolean).join(', '):[result.city,result.division].filter(Boolean).join(', ')}</p><p className="mt-5 text-xs text-slate-400">{language==='bn'?'নিরাপত্তার জন্য পূর্ণ ঠিকানা এখানে দেখানো হয় না।':'For privacy, the full delivery address is not displayed here.'}</p></div></div>
      </div>}
    </section><StoreFooter/></main>
}
