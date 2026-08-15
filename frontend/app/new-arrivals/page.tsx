'use client';

import { useEffect,useMemo,useState } from 'react';
import { ArrowRight, Clock3, Sparkles, Star, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/navbar';
import StoreFooter from '@/components/store-footer';
import StoreProductCard from '@/components/store-product-card';
import QuickViewModal from '@/components/quick-view-modal';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n';

export default function NewArrivalsPage(){
  const {language}=useI18n();
  const [products,setProducts]=useState<any[]>([]);
  const [quickView,setQuickView]=useState<any>(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');

  useEffect(()=>{
    api.get('/catalog/public/products')
      .then(r=>setProducts(Array.isArray(r.data)?r.data:[]))
      .catch((e:any)=>setError(e?.response?.data?.message||(language==='bn'?'নতুন পণ্য লোড করা যায়নি':'New arrivals could not be loaded')))
      .finally(()=>setLoading(false));
  },[language]);

  const newest=useMemo(()=>[...products]
    .filter((p:any)=>p.status==='ACTIVE')
    .sort((a:any,b:any)=>new Date(b.createdAt||0).getTime()-new Date(a.createdAt||0).getTime()),[products]);

  const hero=newest[0];
  const heroImage=hero?.primaryImageUrl
    || hero?.media?.find((m:any)=>m.type==='image')?.url
    || hero?.variants?.find((v:any)=>v.imageUrl)?.imageUrl;

  return <main className="retail-canvas">
    <Navbar/>

    <section className="border-b border-[#41627f] bg-[#172b42]">
      <div className="mx-auto max-w-7xl px-5 py-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-[#4c6f8f] bg-gradient-to-r from-[#1d4ed8] via-[#0369a1] to-[#0f766e] shadow-2xl">
          {heroImage&&<img src={heroImage} alt="" className="absolute right-0 top-0 h-full w-[48%] object-cover object-top opacity-35"/>}
          <div className="absolute inset-0 bg-gradient-to-r from-[#10243a]/95 via-[#173b61]/85 to-transparent"/>
          <div className="relative z-10 max-w-2xl p-7 sm:p-10">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#facc15] px-3 py-2 text-[10px] font-black uppercase tracking-[.16em] text-[#172033]">
              <Sparkles size={13}/>{language==='bn'?'একদম নতুন':'Just landed'}
            </span>
            <h1 className="mt-5 text-4xl font-black tracking-[-.04em] text-white sm:text-5xl">
              {language==='bn'?'নতুন যা এসেছে, সবার আগে দেখুন':'Fresh arrivals, before everyone else'}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-sky-100">
              {language==='bn'?'সর্বশেষ যোগ হওয়া ফ্যাশন পণ্যগুলো নতুন থেকে পুরোনো ক্রমে সাজানো।':'A dedicated edit of the newest products added to Neuro Commerce, ordered newest first.'}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#new-arrivals-grid" className="inline-flex items-center gap-2 rounded-full bg-[#f97316] px-5 py-3 text-sm font-black text-white hover:bg-[#ea580c]">
                {language==='bn'?'নতুন পণ্য দেখুন':'Explore new arrivals'}<ArrowRight size={16}/>
              </a>
              <Link href="/shop" className="inline-flex items-center gap-2 rounded-full border border-sky-300/50 bg-white/10 px-5 py-3 text-sm font-black text-white backdrop-blur hover:bg-white/15">
                {language==='bn'?'সব পণ্য':'Shop all'}
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="cf-blue rounded-2xl border border-blue-300/40 p-4">
            <Clock3 size={18}/><p className="mt-3 text-xs font-black uppercase tracking-[.14em]">Newest first</p>
            <p className="mt-1 text-xs text-white/80">{newest.length} active products</p>
          </div>
          <div className="cf-sky rounded-2xl border border-sky-300/40 p-4">
            <TrendingUp size={18}/><p className="mt-3 text-xs font-black uppercase tracking-[.14em]">Fresh edit</p>
            <p className="mt-1 text-xs text-white/80">Recently added catalogue items</p>
          </div>
          <div className="cf-green rounded-2xl border border-green-300/40 p-4">
            <Star size={18}/><p className="mt-3 text-xs font-black uppercase tracking-[.14em]">Live stock</p>
            <p className="mt-1 text-xs text-white/80">Current variants and availability</p>
          </div>
        </div>
      </div>
    </section>

    <section id="new-arrivals-grid" className="mx-auto max-w-7xl px-5 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[.18em] text-sky-300">{language==='bn'?'নতুন কালেকশন':'Fresh collection'}</p>
          <h2 className="mt-2 text-3xl font-black text-white">{language==='bn'?'সর্বশেষ পণ্য':'Latest products'}</h2>
        </div>
        <Link href="/shop" className="rounded-full bg-[#facc15] px-4 py-2.5 text-xs font-black text-[#172033]">
          {language==='bn'?'পূর্ণ শপ খুলুন':'Open full shop'} →
        </Link>
      </div>

      {error&&<div className="mt-6 rounded-2xl border border-rose-400/30 bg-rose-950/30 p-4 text-sm font-bold text-rose-200">{error}</div>}
      {loading
        ? <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{Array.from({length:8}).map((_,i)=><div key={i} className="h-[430px] animate-pulse rounded-[1.75rem] bg-[#28435f]"/>)}</div>
        : newest.length
          ? <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{newest.map((p:any)=><StoreProductCard key={p.id} product={p} language={language} onQuickView={setQuickView}/>)}</div>
          : <div className="mt-7 rounded-[1.75rem] border border-dashed border-[#4b6b89] bg-[#203753] p-12 text-center text-slate-300">{language==='bn'?'কোনো নতুন পণ্য পাওয়া যায়নি':'No new arrivals found.'}</div>
      }
    </section>

    {quickView&&<QuickViewModal product={quickView} onClose={()=>setQuickView(null)}/>}
    <StoreFooter/>
  </main>
}
