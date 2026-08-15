'use client';

import { useEffect,useMemo,useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Minus, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import Navbar from '@/components/navbar';
import StoreFooter from '@/components/store-footer';
import { api } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';
import { openAuthModal } from '@/lib/customer-auth';
import { getGuestCart, removeGuestCartItem, updateGuestCartItem } from '@/lib/guest-cart';
import { useI18n } from '@/lib/i18n';

export default function CartPage(){
  const router=useRouter();const {language}=useI18n();
  const [cart,setCart]=useState<any>(null),[guest,setGuest]=useState<any[]>([]),[isGuest,setIsGuest]=useState(false),[error,setError]=useState('');

  async function load(){const user=getStoredUser();if(!user){setIsGuest(true);setGuest(getGuestCart());setCart({items:[]});return}try{const r=await api.get('/cart');setCart(r.data);setIsGuest(false)}catch(e:any){setError(e?.response?.data?.message||'Could not load cart.')}}
  useEffect(()=>{load()},[]);

  async function updateQuantity(id:string,quantity:number){if(isGuest){setGuest(updateGuestCartItem(id,quantity));return}try{const r=await api.patch(`/cart/items/${id}`,{quantity});setCart(r.data);window.dispatchEvent(new CustomEvent('cart-updated'));setError('')}catch(e:any){setError(e?.response?.data?.message||'Could not update quantity.')}}
  async function removeItem(id:string){if(isGuest){setGuest(removeGuestCartItem(id));return}const r=await api.delete(`/cart/items/${id}`);setCart(r.data);window.dispatchEvent(new CustomEvent('cart-updated'))}

  const items=isGuest?guest:(cart?.items||[]);
  const subtotal=useMemo(()=>isGuest?guest.reduce((sum,x)=>sum+Number(x.unitPrice)*Number(x.quantity),0):Number(cart?.subtotal||0),[guest,isGuest,cart]);
  if(!cart)return <main className="grid min-h-screen place-items-center bg-slate-50 font-bold">{language==='bn'?'কার্ট লোড হচ্ছে...':'Loading cart...'}</main>;

  return <main className="customer-canvas customer-v3"><Navbar/>
    <section className="mx-auto max-w-7xl px-5 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.18em] text-slate-400">{language==='bn'?(isGuest?'গেস্ট কার্ট':'শপিং ব্যাগ'):'Shopping bag'}</p><h1 className="mt-2 text-4xl font-black tracking-tight">{language==='bn'?'আপনার কার্ট':'Your cart'}</h1><p className="mt-2 text-sm text-slate-500">{items.length} {language==='bn'?'টি পণ্য চেকআউটের জন্য প্রস্তুত।':`item${items.length===1?'':'s'} ready for checkout.`}</p></div><Link href="/shop" className="text-sm font-black">{language==='bn'?'কেনাকাটা চালিয়ে যান':'Continue shopping'} →</Link></div>
      {error&&<p className="mt-5 rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</p>}
      {isGuest&&items.length>0&&<div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm font-semibold text-blue-800">{language==='bn'?'আপনি লগইন ছাড়াই কার্ট ব্যবহার করছেন। চেকআউটের সময় লগইন করলে এই পণ্যগুলো আপনার অ্যাকাউন্টের কার্টে যোগ হবে।':'You are using a guest cart. Sign in at checkout and these items will be merged into your account cart.'}</div>}
      <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="space-y-3">{items.map((item:any)=>{const id=isGuest?item.variantId:item.id;const name=language==='bn'?(item.productNameBn||item.productName):item.productName;return <article key={id} className="customer-panel overflow-hidden p-5 transition hover:-translate-y-0.5 hover:shadow-xl"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center"><div className="flex min-w-0 gap-4">{item.imageUrl&&<img src={item.imageUrl} alt={name} className="h-24 w-24 rounded-xl object-cover"/>}<div><Link href={`/shop/${item.slug}`} className="text-lg font-black hover:underline">{name}</Link><p className="mt-1 text-xs font-semibold text-slate-400">{Object.values(item.attributes||{}).join(' / ')}{Object.values(item.attributes||{}).length?' · ':''}{item.sku}</p><p className="mt-3 text-lg font-black">{language==='bn'?'৳':'BDT '}{item.unitPrice}</p></div></div><div className="flex flex-wrap items-center gap-3"><div className="flex h-11 items-center rounded-xl border border-slate-200 bg-slate-50"><button disabled={item.quantity<=1} onClick={()=>updateQuantity(id,item.quantity-1)} className="grid h-11 w-11 place-items-center disabled:opacity-30"><Minus size={15}/></button><span className="w-9 text-center text-sm font-black">{item.quantity}</span><button onClick={()=>updateQuantity(id,item.quantity+1)} className="grid h-11 w-11 place-items-center"><Plus size={15}/></button></div><button onClick={()=>removeItem(id)} className="grid h-11 w-11 place-items-center rounded-xl border border-rose-200 text-rose-600"><Trash2 size={16}/></button></div></div></article>})}
          {!items.length&&<div className="rounded-3xl border border-dashed border-slate-300 bg-white p-14 text-center"><p className="text-xl font-black">{language==='bn'?'আপনার কার্ট খালি':'Your cart is empty'}</p><p className="mt-2 text-sm text-slate-500">{language==='bn'?'অর্ডার শুরু করতে একটি পণ্য যোগ করুন।':'Add a product to begin your order.'}</p><Link href="/shop" className="mt-5 inline-flex rounded-xl bg-[#1464f4] px-5 py-3 text-sm font-black text-white">{language==='bn'?'পণ্য দেখুন':'Browse products'}</Link></div>}
        </section>
        <aside className="customer-gradient h-fit rounded-[1.75rem] p-6 text-white premium-shadow lg:sticky lg:top-32"><p className="text-xs font-black uppercase tracking-[.16em] text-white/60">{language==='bn'?'অর্ডারের সারসংক্ষেপ':'Order summary'}</p><div className="mt-5 flex items-end justify-between"><span className="text-sm text-white/75">{language==='bn'?'সাবটোটাল':'Subtotal'}</span><span className="text-3xl font-black">{language==='bn'?'৳':'BDT '}{subtotal}</span></div><div className="mt-5 space-y-3 border-t border-white/20 pt-5 text-sm text-white/75"><div className="flex justify-between"><span>{language==='bn'?'ডেলিভারি চার্জ':'Shipping'}</span><span>{language==='bn'?'চেকআউটে হিসাব হবে':'Calculated at checkout'}</span></div><div className="flex justify-between"><span>{language==='bn'?'কুপন':'Coupon'}</span><span>{language==='bn'?'চেকআউটে প্রয়োগ করুন':'Apply at checkout'}</span></div></div><div className="mt-5 flex gap-3 rounded-2xl bg-white/10 p-4"><ShieldCheck size={18} className="shrink-0"/><p className="text-xs leading-5 text-white/80">{language==='bn'?'নিরাপদ চেকআউট, ডেলিভারি জোন এবং অর্ডার ট্র্যাকিং।':'Secure checkout with live delivery zones and order tracking.'}</p></div><button onClick={()=>{if(!items.length){router.push('/shop');return}if(isGuest){openAuthModal('login','/checkout');return}router.push('/checkout')}} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-black text-slate-950">{items.length?(language==='bn'?'চেকআউটে যান':'Proceed to checkout'):(language==='bn'?'এখনই শপ করুন':'Shop now')} <ArrowRight size={16}/></button></aside>
      </div>
    </section><StoreFooter/>
  </main>
}
