'use client';

import { useEffect,useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import Navbar from '@/components/navbar';
import AccountShell from '@/components/account-shell';
import StoreFooter from '@/components/store-footer';
import { api } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';
import { authRedirectUrl } from '@/lib/customer-auth';
import { useI18n } from '@/lib/i18n';
import { localizedProductName } from '@/lib/localized';

export default function WishlistPage(){
  const router=useRouter();const {language}=useI18n();const [items,setItems]=useState<any[]>([]);const [message,setMessage]=useState('');
  async function load(){const r=await api.get('/wishlist');setItems(r.data||[])}
  useEffect(()=>{if(!getStoredUser()){router.replace(authRedirectUrl('/account/wishlist'));return}load()},[router]);
  async function remove(id:string){await api.delete(`/wishlist/${id}`);await load()}
  async function add(product:any){
    const v=(product.variants||[]).find((x:any)=>Number(x.stock||0)>0);
    if(!v){setMessage(language==='bn'?'এই পণ্যের কোনো ভ্যারিয়েন্ট স্টকে নেই।':'No variant is currently in stock.');return}
    try{await api.post('/cart/items',{variantId:v.id,quantity:1});window.dispatchEvent(new CustomEvent('cart-updated'));setMessage(language==='bn'?'কার্টে যোগ হয়েছে।':'Added to cart.')}
    catch(e:any){setMessage(e?.response?.data?.message||'Could not add to cart.')}
  }
  return <main className="customer-canvas customer-v3"><Navbar/><AccountShell>
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.18em] text-slate-400">{language==='bn'?'পরে কেনার জন্য':'Saved for later'}</p><h1 className="mt-2 text-4xl font-black">{language==='bn'?'ইচ্ছেতালিকা':'Wishlist'}</h1><p className="mt-2 text-sm text-slate-500">{items.length} {language==='bn'?'টি সেভ করা পণ্য':`saved product${items.length===1?'':'s'}`}.</p></div><Link href="/shop" className="customer-btn-primary">{language==='bn'?'আরও পণ্য দেখুন':'Explore products'}</Link></div>
    {message&&<p className="mt-5 rounded-xl bg-blue-50 p-3 text-sm font-bold text-blue-700">{message}</p>}
    <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{items.map((item:any)=>{
      const p=item.product;if(!p)return null;const v=(p.variants||[]).find((x:any)=>Number(x.stock||0)>0)||p.variants?.[0];const image=v?.imageUrl||(Array.isArray(p.media)?p.media.find((m:any)=>m.type==='image')?.url:null)||p.primaryImageUrl;const name=localizedProductName(language,p);const sold=!(p.variants||[]).some((x:any)=>Number(x.stock||0)>0);
      return <article key={item.id} className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
        <Link href={`/shop/${p.slug}`} className="block overflow-hidden bg-slate-100">{image?<img src={image} alt={name} className="aspect-[4/3] w-full object-cover"/>:<div className="grid aspect-[4/3] place-items-center text-6xl font-black text-slate-300">{name?.[0]}</div>}</Link>
        <div className="p-5"><p className="text-[10px] font-black uppercase tracking-[.15em] text-slate-400">{language==='bn'?'সেভ করা পণ্য':'Saved product'}</p><Link href={`/shop/${p.slug}`} className="mt-2 block text-lg font-black">{name}</Link>{v&&<p className="mt-2 text-lg font-black text-[#123a78]">{language==='bn'?'৳':'BDT '}{v.salePrice||v.price}</p>}
        <div className="mt-5 grid grid-cols-[1fr_auto] gap-2"><button disabled={sold} onClick={()=>add(p)} className="flex items-center justify-center gap-2 rounded-xl bg-[#f36b21] px-4 py-3 text-sm font-black text-white disabled:bg-slate-200"><ShoppingBag size={16}/>{sold?(language==='bn'?'স্টক শেষ':'Sold out'):(language==='bn'?'কার্টে যোগ করুন':'Add to cart')}</button><button onClick={()=>remove(p.id)} className="grid w-12 place-items-center rounded-xl border border-rose-200 text-rose-600"><Trash2 size={17}/></button></div></div>
      </article>
    })}</div>
    {!items.length&&<div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white p-14 text-center"><Heart className="mx-auto text-slate-300"/><p className="mt-4 text-lg font-black">{language==='bn'?'আপনার ইচ্ছেতালিকা খালি':'Your wishlist is empty'}</p><Link href="/shop" className="mt-4 inline-block rounded-xl bg-[#1464f4] px-5 py-3 text-sm font-black text-white">{language==='bn'?'পণ্য দেখুন':'Explore products'}</Link></div>}
  </AccountShell><StoreFooter/></main>
}
