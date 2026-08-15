'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Check, Minus, Plus, ShoppingCart, X } from 'lucide-react';
import { api } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';
import { addGuestCartItem } from '@/lib/guest-cart';
import { useI18n } from '@/lib/i18n';
import { localizedCategoryName, localizedProductDescription, localizedProductName } from '@/lib/localized';

export default function QuickViewModal({product,onClose}:{product:any;onClose:()=>void}){
  const {language}=useI18n();
  const variants=Array.isArray(product?.variants)?product.variants:[];
  const [variant,setVariant]=useState<any>(variants.find((x:any)=>Number(x.stock||0)>0)||variants[0]||null);
  const [qty,setQty]=useState(1);
  const [adding,setAdding]=useState(false);
  const [message,setMessage]=useState('');

  const name=localizedProductName(language,product);
  const desc=localizedProductDescription(language,product,true)||localizedProductDescription(language,product,false);
  const image=useMemo(()=>variant?.imageUrl||(Array.isArray(product?.media)?product.media.find((m:any)=>m.type==='image')?.url:null)||product?.primaryImageUrl||'',[product,variant]);
  const price=variant?Number(variant.salePrice||variant.price||0):0;
  const regular=variant?Number(variant.price||0):0;

  async function add(){
    if(!variant||Number(variant.stock||0)<=0)return;
    setAdding(true);setMessage('');
    try{
      const user=getStoredUser();
      if(user){
        await api.post('/cart/items',{variantId:variant.id,quantity:qty});
        window.dispatchEvent(new CustomEvent('cart-updated'));
      }else{
        addGuestCartItem({
          variantId:variant.id,
          slug:product.slug,
          productName:product.name,
          productNameBn:product.nameBn,
          sku:variant.sku,
          attributes:variant.attributes||{},
          unitPrice:price,
          quantity:qty,
          imageUrl:image||null,
        });
      }
      setMessage(language==='bn'?'কার্টে যোগ হয়েছে':'Added to cart');
    }catch(e:any){setMessage(e?.response?.data?.message||e?.message||(language==='bn'?'কার্টে যোগ করা যায়নি':'Could not add to cart'));}
    finally{setAdding(false)}
  }

  return <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/45 p-3 backdrop-blur-sm sm:items-center" onMouseDown={onClose}>
    <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[1.75rem] border border-[#4b6b89] bg-[#203753] text-white shadow-2xl" onMouseDown={e=>e.stopPropagation()}>
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6"><div><p className="text-xs font-black uppercase tracking-[.16em] text-blue-600">{language==='bn'?'দ্রুত দেখুন':'Quick view'}</p><p className="mt-1 font-black text-slate-900">{name}</p></div><button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 hover:bg-slate-200"><X size={19}/></button></div>
      <div className="grid gap-6 p-5 sm:p-6 md:grid-cols-[.9fr_1.1fr]">
        <div className="overflow-hidden rounded-2xl bg-slate-100">{image?<img src={image} alt={name} className="aspect-square w-full object-cover"/>:<div className="grid aspect-square place-items-center bg-gradient-to-br from-blue-50 to-slate-100 text-8xl font-black text-blue-200">{name?.[0]}</div>}</div>
        <div>
          <p className="text-xs font-black uppercase tracking-[.14em] text-slate-400">{product?.category?localizedCategoryName(language,product.category):(language==='bn'?'পণ্য':'Product')}{product?.brand?.name?` · ${product.brand.name}`:''}</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">{name}</h2>
          {desc&&<p className="mt-3 text-sm leading-6 text-slate-500">{desc}</p>}
          {variant&&<div className="mt-5 flex items-end gap-3"><p className="text-2xl font-black text-[#1464f4]">{language==='bn'?'৳':'BDT '}{price}</p>{regular>price&&<p className="pb-1 text-sm text-slate-400 line-through">{language==='bn'?'৳':'BDT '}{regular}</p>}</div>}

          {variants.length>0&&<div className="mt-6"><p className="text-sm font-black">{language==='bn'?'ভ্যারিয়েন্ট':'Variant'}</p><div className="mt-3 flex flex-wrap gap-2">{variants.map((v:any)=><button key={v.id} onClick={()=>{setVariant(v);setQty(1);setMessage('')}} disabled={Number(v.stock||0)<=0} className={`rounded-xl border px-3 py-2 text-xs font-black ${variant?.id===v.id?'border-sky-400 bg-[#2563eb] text-white':'border-[#4b6b89] bg-[#28435f] text-slate-100'} disabled:cursor-not-allowed disabled:opacity-40`}>{Object.values(v.attributes||{}).join(' / ')||v.sku}{Number(v.stock||0)<=0?` · ${language==='bn'?'স্টক শেষ':'Sold out'}`:''}</button>)}</div></div>}

          {variant&&<div className="mt-6 flex flex-wrap items-center gap-3"><div className="flex items-center rounded-xl border border-slate-200"><button onClick={()=>setQty(q=>Math.max(1,q-1))} className="grid h-11 w-11 place-items-center"><Minus size={16}/></button><span className="min-w-10 text-center font-black">{qty}</span><button onClick={()=>setQty(q=>Math.min(Number(variant.stock||1),q+1))} className="grid h-11 w-11 place-items-center"><Plus size={16}/></button></div><button onClick={add} disabled={adding||Number(variant.stock||0)<=0} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#f36b21] px-5 font-black text-white hover:bg-[#df5d18] disabled:opacity-50"><ShoppingCart size={18}/>{adding?(language==='bn'?'যোগ হচ্ছে...':'Adding...'):(language==='bn'?'কার্টে যোগ করুন':'Add to cart')}</button></div>}
          {message&&<p className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-emerald-600"><Check size={16}/>{message}</p>}
          <Link href={`/shop/${product.slug}`} onClick={onClose} className="mt-5 inline-flex text-sm font-black text-[#1464f4] hover:underline">{language==='bn'?'সম্পূর্ণ বিস্তারিত দেখুন':'View full product details'} →</Link>
        </div>
      </div>
    </div>
  </div>
}
