'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Heart, Minus, Play, Plus, ShieldCheck, ShoppingBag, Star, Truck } from 'lucide-react';
import Navbar from '@/components/navbar';
import StoreFooter from '@/components/store-footer';
import VariantSelector from '@/components/variant-selector';
import RecentlyViewedProducts from '@/components/recently-viewed-products';
import { api } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';
import { openAuthModal } from '@/lib/customer-auth';
import { addGuestCartItem } from '@/lib/guest-cart';
import { useI18n } from '@/lib/i18n';
import { localizedCategoryName, localizedProductDescription, localizedProductName } from '@/lib/localized';
import { rememberRecentlyViewed } from '@/lib/recently-viewed';

export default function ProductDetails(){
  const params=useParams<{slug:string}>();
  const {language}=useI18n();
  const [p,setP]=useState<any>(null);
  const [v,setV]=useState<any>(null);
  const [qty,setQty]=useState(1);
  const [msg,setMsg]=useState('');
  const [reviews,setReviews]=useState<any>({average:0,count:0,reviews:[]});
  const [activeMedia,setActiveMedia]=useState<any>(null);

  useEffect(()=>{
    api.get(`/catalog/public/products/${params.slug}`).then(async x=>{
      const product=x.data;
      setP(product);
      const firstVariant=product.variants?.[0]||null;
      setV(firstVariant);
      const media=Array.isArray(product.media)?product.media:[];
      const first=media[0]||(firstVariant?.imageUrl?{type:'image',url:firstVariant.imageUrl}:product.primaryImageUrl?{type:'image',url:product.primaryImageUrl}:null);
      setActiveMedia(first);
      rememberRecentlyViewed(product);
      try{setReviews((await api.get(`/reviews/public/product/${product.id}`)).data)}catch{}
    }).catch(()=>setMsg(language==='bn'?'পণ্যটি লোড করা যায়নি।':'Could not load product.'));
  },[params.slug,language]);

  const gallery=useMemo(()=>{
    if(!p)return [];
    const list=Array.isArray(p.media)?[...p.media]:[];
    if(p.primaryImageUrl&&!list.some((m:any)=>m.url===p.primaryImageUrl))list.unshift({type:'image',url:p.primaryImageUrl,alt:p.name});
    if(v?.imageUrl&&!list.some((m:any)=>m.url===v.imageUrl))list.unshift({type:'image',url:v.imageUrl,alt:p.name});
    return list;
  },[p,v]);

  async function add(){
    if(!v){setMsg(language==='bn'?'একটি ভ্যারিয়েন্ট বেছে নিন।':'Please select a variant.');return}
    if(v.stock<=0){setMsg(language==='bn'?'পণ্যটি স্টকে নেই।':'This item is out of stock.');return}
    const user=getStoredUser();
    if(!user){
      addGuestCartItem({variantId:v.id,slug:p.slug,productName:p.name,productNameBn:p.nameBn,sku:v.sku,attributes:v.attributes||{},unitPrice:Number(v.salePrice||v.price),quantity:qty,imageUrl:v.imageUrl||gallery.find((m:any)=>m.type==='image')?.url||p.primaryImageUrl});
      setMsg(language==='bn'?`${qty}টি পণ্য কার্টে যোগ হয়েছে।`:`${qty} item${qty>1?'s':''} added to cart.`);
      return;
    }
    try{await api.post('/cart/items',{variantId:v.id,quantity:qty});window.dispatchEvent(new CustomEvent('cart-updated'));setMsg(language==='bn'?'কার্টে যোগ হয়েছে।':'Added to cart successfully.')}
    catch(e:any){setMsg(e?.response?.data?.message|| (language==='bn'?'কার্টে যোগ করা যায়নি।':'Could not add to cart.'))}
  }

  async function wishlist(){
    if(!getStoredUser()){openAuthModal('login',`/shop/${p.slug}`);return}
    try{await api.post(`/wishlist/${p.id}`);setMsg(language==='bn'?'ইচ্ছেতালিকায় যোগ হয়েছে।':'Added to wishlist.')}
    catch(e:any){setMsg(e?.response?.data?.message|| (language==='bn'?'ইচ্ছেতালিকায় যোগ করা যায়নি।':'Could not add to wishlist.'))}
  }

  if(!p)return <main className="grid min-h-screen place-items-center bg-slate-50 font-bold">{language==='bn'?'পণ্য লোড হচ্ছে...':'Loading product...'}</main>;
  const price=v?Number(v.salePrice||v.price):0;
  const regular=v?Number(v.price):0;
  const name=localizedProductName(language,p);
  const description=localizedProductDescription(language,p,false)||localizedProductDescription(language,p,true);

  return <main className="customer-canvas customer-v3">
    <Navbar/>
    <section className="mx-auto max-w-7xl px-5 py-8">
      <div className="mb-5 text-xs font-semibold text-slate-400"><Link href="/shop" className="hover:text-[#1464f4]">{language==='bn'?'শপ':'Shop'}</Link> / {p.category?localizedCategoryName(language,p.category):(language==='bn'?'পণ্য':'Product')} / <span className="text-slate-600">{name}</span></div>
      <div className="grid gap-8 lg:grid-cols-[1.05fr_.95fr]">
        <div>
          <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
            {activeMedia?.type==='video'?<video src={activeMedia.url} poster={activeMedia.poster||undefined} controls className="aspect-square w-full bg-slate-950 object-contain"/>:activeMedia?.url?<img src={activeMedia.url} alt={activeMedia.alt||name} className="aspect-square w-full object-contain p-4"/>:<div className="grid aspect-square place-items-center bg-gradient-to-br from-blue-50 to-slate-100 text-9xl font-black text-blue-200">{name?.[0]}</div>}
          </div>
          {gallery.length>1&&<div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-7">{gallery.map((m:any,index:number)=><button key={`${m.url}-${index}`} onClick={()=>setActiveMedia(m)} className={`relative overflow-hidden rounded-xl border bg-white ${activeMedia?.url===m.url?'border-[#1464f4] ring-2 ring-blue-100':'border-slate-200'}`}>{m.type==='video'?<div className="grid aspect-square place-items-center bg-slate-900 text-white"><Play size={20}/></div>:<img src={m.url} alt={m.alt||name} className="aspect-square w-full object-cover"/>}</button>)}</div>}
        </div>

        <div className="lg:py-3">
          <p className="text-xs font-black uppercase tracking-[.18em] text-slate-400">{p.category?localizedCategoryName(language,p.category):(language==='bn'?'পণ্য':'Product')}{p.brand?.name?` · ${p.brand.name}`:''}</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-.03em] text-[#123a78] sm:text-5xl">{name}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-3"><span className="inline-flex items-center gap-1 text-sm font-black"><Star size={16} className="fill-amber-400 text-amber-400"/>{Number(reviews.average||0).toFixed(1)}</span><span className="text-sm text-slate-400">{reviews.count} {language==='bn'?'টি ভেরিফাইড রিভিউ':'verified reviews'}</span>{v&&<span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${v.stock>0?'bg-emerald-50 text-emerald-700':'bg-rose-50 text-rose-700'}`}>{v.stock>0?`${v.stock} ${language==='bn'?'টি স্টকে':'in stock'}`:(language==='bn'?'স্টক শেষ':'Out of stock')}</span>}</div>
          {description&&<p className="mt-6 max-w-2xl text-base leading-7 text-slate-600">{description}</p>}

          <div className="mt-7"><p className="mb-3 text-sm font-black">{language==='bn'?'অপশন বেছে নিন':'Choose options'}</p><VariantSelector variants={p.variants||[]} value={v} language={language} onChange={(x:any)=>{setV(x);setQty(1);setMsg('');if(x.imageUrl)setActiveMedia({type:'image',url:x.imageUrl,alt:name})}}/></div>

          {v&&<div className="mt-7 rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-slate-400">{language==='bn'?'মূল্য':'Price'}</p><div className="mt-1 flex items-baseline gap-3"><p className="text-3xl font-black text-[#123a78]">{language==='bn'?'৳':'BDT '}{price}</p>{regular>price&&<p className="text-sm text-slate-400 line-through">{language==='bn'?'৳':'BDT '}{regular}</p>}</div></div><p className="font-mono text-[11px] text-slate-400">SKU {v.sku}</p></div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row"><div className="flex h-12 items-center rounded-xl border border-slate-200 bg-slate-50"><button onClick={()=>setQty(Math.max(1,qty-1))} className="grid h-12 w-12 place-items-center"><Minus size={16}/></button><span className="w-10 text-center text-sm font-black">{qty}</span><button onClick={()=>setQty(Math.min(Number(v.stock||1),qty+1))} className="grid h-12 w-12 place-items-center"><Plus size={16}/></button></div><button onClick={add} disabled={v.stock<=0} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#f36b21] px-5 text-sm font-black text-white disabled:opacity-40"><ShoppingBag size={17}/>{language==='bn'?'কার্টে যোগ করুন':'Add to cart'}</button><button onClick={wishlist} className="flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-black"><Heart size={17}/>{language==='bn'?'সেভ করুন':'Save'}</button></div>{msg&&<p className="mt-3 rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800">{msg}</p>}</div>}

          <div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4"><Truck size={18} className="text-[#1464f4]"/><div><p className="text-sm font-black">{language==='bn'?'এলাকাভিত্তিক ডেলিভারি':'Zone-based delivery'}</p><p className="mt-1 text-xs text-slate-500">{language==='bn'?'চূড়ান্ত চার্জ চেকআউটে দেখানো হবে।':'Final charge shown at checkout.'}</p></div></div><div className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4"><ShieldCheck size={18} className="text-[#1464f4]"/><div><p className="text-sm font-black">{language==='bn'?'নিরাপদ কেনাকাটা':'Protected purchase'}</p><p className="mt-1 text-xs text-slate-500">{language==='bn'?'অর্ডার, ডেলিভারি ও রিটার্ন ট্র্যাক করুন।':'Track orders, delivery and returns.'}</p></div></div></div>
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-5 py-10"><div className="rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-8"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.16em] text-slate-400">{language==='bn'?'ভেরিফাইড মতামত':'Verified feedback'}</p><h2 className="mt-2 text-2xl font-black">{language==='bn'?'ক্রেতার রিভিউ':'Customer reviews'}</h2></div><p className="text-sm font-bold text-slate-500">{reviews.count} {language==='bn'?'টি রিভিউ':'reviews'}</p></div><div className="mt-6 grid gap-4 md:grid-cols-2">{reviews.reviews.map((x:any)=><article key={x.id} className="rounded-2xl bg-slate-50 p-5"><p className="text-amber-500">{'★'.repeat(x.rating)}<span className="text-slate-300">{'★'.repeat(5-x.rating)}</span></p><p className="mt-3 text-sm leading-6 text-slate-600">{x.comment||(language==='bn'?'লিখিত মন্তব্য নেই।':'No written comment.')}</p></article>)}</div>{!reviews.count&&<p className="mt-6 rounded-2xl border border-dashed p-8 text-center text-sm text-slate-500">{language==='bn'?'এখনও কোনো অনুমোদিত রিভিউ নেই।':'No approved reviews yet.'}</p>}</div></section>
    <RecentlyViewedProducts language={language} excludeId={p.id}/>
    <StoreFooter/>
  </main>
}
