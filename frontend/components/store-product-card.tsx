'use client';

import { Heart, ShoppingBag, Star, Zap } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { api } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';
import { addGuestCartItem } from '@/lib/guest-cart';
import { localizedCategoryName, localizedProductName } from '@/lib/localized';
import { openAuthModal } from '@/lib/customer-auth';

export default function StoreProductCard({product,language='en',onQuickView}:{product:any;language?:'en'|'bn';onQuickView?:(p:any)=>void}){
  const [msg,setMsg]=useState('');
  const v=(product.variants||[]).find((x:any)=>Number(x.stock||0)>0)||product.variants?.[0];
  const image=v?.imageUrl||(Array.isArray(product.media)?product.media.find((m:any)=>m.type==='image')?.url:null)||product.primaryImageUrl;
  const name=localizedProductName(language,product);
  const price=v?Number(v.salePrice||v.price):0;
  const regular=v?Number(v.price):0;
  const discount=regular>price?Math.round((1-price/regular)*100):0;
  const totalStock=(product.variants||[]).reduce((s:number,x:any)=>s+Number(x.stock||0),0);
  const brand=product.brand?.name||'Fashion';
  const sizes=Array.from(new Set((product.variants||[]).map((x:any)=>x.attributes?.Size||x.attributes?.size).filter(Boolean))).slice(0,5);

  async function quickAdd(){
    if(!v||Number(v.stock||0)<=0){setMsg(language==='bn'?'স্টক শেষ':'Sold out');return}
    const user=getStoredUser();
    if(!user){
      addGuestCartItem({variantId:v.id,slug:product.slug,productName:product.name,productNameBn:product.nameBn,sku:v.sku,attributes:v.attributes||{},unitPrice:price,quantity:1,imageUrl:image||null});
      setMsg(language==='bn'?'কার্টে যোগ হয়েছে':'Added to cart');
      return;
    }
    try{
      await api.post('/cart/items',{variantId:v.id,quantity:1});
      window.dispatchEvent(new CustomEvent('cart-updated'));
      setMsg(language==='bn'?'কার্টে যোগ হয়েছে':'Added to cart');
    }catch(e:any){setMsg(e?.response?.data?.message||'Could not add')}
  }

  async function save(){
    if(!getStoredUser()){openAuthModal('login',`/shop/${product.slug}`);return}
    try{await api.post(`/wishlist/${product.id}`);setMsg(language==='bn'?'উইশলিস্টে সেভ হয়েছে':'Saved to wishlist')}
    catch(e:any){setMsg(e?.response?.data?.message||'Could not save')}
  }

  return <article className="group relative overflow-hidden rounded-[1.75rem] border border-[#e7e9ef] bg-white shadow-[0_14px_40px_rgba(16,24,39,.055)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_60px_rgba(16,24,39,.12)]">
    <div className="relative overflow-hidden bg-[#f4f1ec]">
      <Link href={`/shop/${product.slug}`} className="block">
        {image
          ? <img src={image} alt={name} loading="lazy" referrerPolicy="no-referrer" className="aspect-[4/5] w-full object-cover object-top transition duration-700 group-hover:scale-[1.035]"/>
          : <div className="grid aspect-[4/5] place-items-center bg-gradient-to-br from-[#fff1e8] to-[#eef5ff] text-6xl font-black text-slate-200">{name?.[0]}</div>}
      </Link>

      <div className="absolute left-3 top-3 flex max-w-[70%] flex-wrap gap-1.5">
        {product.featured&&<span className="rounded-full bg-[#101827] px-3 py-1.5 text-[9px] font-black uppercase tracking-[.12em] text-white">{language==='bn'?'নতুন':'New'}</span>}
        {discount>0&&<span className="rounded-full bg-[#ff6542] px-3 py-1.5 text-[9px] font-black text-white">SAVE {discount}%</span>}
      </div>

      <button onClick={save} aria-label="Save to wishlist" className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white/95 text-[#f7fbff] shadow-md backdrop-blur transition hover:scale-105 hover:bg-rose-50 hover:text-rose-500">
        <Heart size={17}/>
      </button>

      {onQuickView&&<button onClick={()=>onQuickView(product)} className="absolute bottom-3 left-3 right-3 translate-y-2 rounded-full bg-white/95 px-4 py-2.5 text-[11px] font-black text-[#f7fbff] opacity-0 shadow-lg backdrop-blur transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        {language==='bn'?'দ্রুত দেখুন':'Quick view'}
      </button>}
    </div>

    <div className="p-4.5 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="truncate text-[10px] font-black uppercase tracking-[.17em] text-[#2f6fed]">{brand}</p>
        <span className={`rounded-full px-2.5 py-1 text-[9px] font-black ${totalStock>0?'bg-emerald-50 text-emerald-700':'bg-rose-50 text-rose-600'}`}>
          {totalStock>0?(language==='bn'?'স্টকে আছে':'IN STOCK'):(language==='bn'?'স্টক শেষ':'SOLD OUT')}
        </span>
      </div>

      <Link href={`/shop/${product.slug}`} className="mt-2.5 block min-h-12 text-[15px] font-black leading-6 text-[#f7fbff] transition hover:text-[#7dd3fc]">{name}</Link>
      <p className="mt-1 truncate text-xs font-medium text-slate-400">{product.category?localizedCategoryName(language,product.category):''}</p>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1 text-xs">
          <Star size={13} className="fill-[#ffb347] text-[#ffb347]"/>
          <span className="font-black text-slate-800">4.8</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-400">{language==='bn'?'জনপ্রিয়':'Popular'}</span>
        </div>
        {sizes.length>0&&<span className="truncate text-[10px] font-bold text-slate-400">{sizes.join(' · ')}</span>}
      </div>

      <div className="mt-4 flex items-end justify-between gap-3 border-t border-slate-100 pt-4">
        <div>
          {v
            ? <>
                <p className="text-xl font-black tracking-tight text-[#f7fbff]">{language==='bn'?'৳':'BDT '}{price}</p>
                {regular>price&&<p className="mt-0.5 text-xs font-semibold text-slate-400 line-through">{language==='bn'?'৳':'BDT '}{regular}</p>}
              </>
            : <p className="text-sm font-bold text-slate-400">{language==='bn'?'অপশন দেখুন':'View options'}</p>}
        </div>

        <button onClick={quickAdd} disabled={!v||totalStock<=0} className="inline-flex h-11 items-center gap-2 rounded-full bg-[#f97316] px-4 text-[11px] font-black text-white transition hover:bg-[#ea580c] disabled:bg-slate-200">
          {discount>0?<Zap size={15}/>:<ShoppingBag size={15}/>}
          <span className="hidden 2xl:inline">{language==='bn'?'কার্টে':'Add'}</span>
        </button>
      </div>

      {msg&&<p className="mt-3 rounded-xl bg-[#eef5ff] px-3 py-2 text-[11px] font-bold text-[#2f6fed]">{msg}</p>}
    </div>
  </article>
}
