'use client';

import { useEffect,useMemo,useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRight, Bell, ChevronRight, Clock3, Heart, MapPin,
  PackageCheck, RotateCcw, ShoppingBag, Truck, WalletCards
} from 'lucide-react';
import Navbar from '@/components/navbar';
import AccountShell from '@/components/account-shell';
import StoreFooter from '@/components/store-footer';
import OrderTrackingPanel from '@/components/order-tracking-panel';
import { api } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';
import { authRedirectUrl } from '@/lib/customer-auth';
import { useI18n } from '@/lib/i18n';

const pretty=(x:string)=>String(x||'').replaceAll('_',' ');
const money=(v:any,l:'en'|'bn')=>l==='bn'?`৳${Number(v||0).toLocaleString()}`:`BDT ${Number(v||0).toLocaleString('en-BD')}`;

export default function AccountPage(){
  const router=useRouter();
  const {language}=useI18n();
  const [user,setUser]=useState<any>(null);
  const [orders,setOrders]=useState<any[]>([]);
  const [notifications,setNotifications]=useState<any[]>([]);
  const [wishlist,setWishlist]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    const current=getStoredUser();
    if(!current){router.replace(authRedirectUrl('/account'));return}
    if(current.role!=='CUSTOMER'){router.replace(current.role==='DELIVERY_AGENT'?'/delivery':'/admin');return}
    setUser(current);

    Promise.allSettled([
      api.get('/me/orders'),
      api.get('/notifications'),
      api.get('/wishlist')
    ]).then(([o,n,w])=>{
      if(o.status==='fulfilled')setOrders(o.value.data||[]);
      if(n.status==='fulfilled')setNotifications(n.value.data||[]);
      if(w.status==='fulfilled')setWishlist(w.value.data||[]);
      setLoading(false);
    });
  },[router]);

  const stats=useMemo(()=>({
    active:orders.filter(o=>!['DELIVERED','CANCELLED'].includes(o.status)).length,
    delivered:orders.filter(o=>o.status==='DELIVERED').length,
    unread:notifications.filter(x=>!x.isRead).length,
  }),[orders,notifications]);

  const currentOrder=orders.find(o=>!['DELIVERED','CANCELLED'].includes(o.status))||orders[0]||null;
  const recent=orders.slice(0,4);

  if(!user)return null;

  const firstName=String(user.name||'').split(' ')[0]||'Customer';

  return (
    <main className="retail-canvas">
      <Navbar/>
      <AccountShell>
        <section className="relative overflow-hidden rounded-[1.6rem] border border-[#31557e] bg-gradient-to-r from-[#123a78] via-[#1554bd] to-[#2463b6] p-5 text-white shadow-[0_18px_45px_rgba(0,0,0,.20)] sm:p-6">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl"/>
          <div className="relative z-10 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[.18em] text-white/60">
                {language==='bn'?'কাস্টমার ড্যাশবোর্ড':'Customer dashboard'}
              </p>
              <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                {language==='bn'?`স্বাগতম, ${firstName}`:`Welcome back, ${firstName}.`}
              </h1>
              <p className="mt-2 text-sm text-white/70">
                {language==='bn'?'অর্ডার, ডেলিভারি, রিটার্ন ও পেমেন্ট এক জায়গা থেকে পরিচালনা করুন।':'Manage orders, delivery, returns and payments from one place.'}
              </p>
            </div>
            <Link href="/shop" className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/25 bg-white px-4 py-2.5 text-xs font-black text-[#123a78] shadow-md hover:bg-slate-100">
              <ShoppingBag size={16}/>{language==='bn'?'শপিং চালিয়ে যান':'Continue shopping'}<ArrowRight size={15}/>
            </Link>
          </div>
        </section>

        <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            [language==='bn'?'মোট অর্ডার':'Total orders',orders.length,PackageCheck,'/account/orders','bg-blue-50 text-[#1464f4]'],
            [language==='bn'?'চলমান ডেলিভারি':'Active delivery',stats.active,Truck,'/account/orders','bg-orange-50 text-[#f36b21]'],
            [language==='bn'?'উইশলিস্ট':'Wishlist',wishlist.length,Heart,'/account/wishlist','bg-rose-50 text-rose-600'],
            [language==='bn'?'অপঠিত আপডেট':'Unread updates',stats.unread,Bell,'/account/notifications','bg-violet-50 text-violet-600'],
          ].map(([label,value,Icon,href,tone]:any)=>(
            <Link key={String(label)} href={href} className="group rounded-2xl border border-[#31557e] bg-[#203f61] p-4 text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#294d72] hover:shadow-lg">
              <div className="flex items-center justify-between">
                <span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}><Icon size={17}/></span>
                <ChevronRight size={16} className="text-slate-300 transition group-hover:translate-x-0.5"/>
              </div>
              <p className="mt-4 text-2xl font-black">{loading?'—':value}</p>
              <p className="mt-1 text-xs font-semibold text-slate-300">{label}</p>
            </Link>
          ))}
        </section>

        {currentOrder&&(
          <section className="mt-5 overflow-hidden rounded-[1.75rem] border border-[#31557e] bg-[#17324f] shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#f36b21]">
                  {['DELIVERED','CANCELLED'].includes(currentOrder.status)
                    ? (language==='bn'?'সর্বশেষ অর্ডার':'Latest order')
                    : (language==='bn'?'এখন ট্র্যাক করুন':'Track now')}
                </p>
                <h2 className="mt-1 text-xl font-black">{currentOrder.orderNumber}</h2>
              </div>
              <Link href={`/account/orders/${currentOrder.id}`} className="inline-flex items-center gap-2 rounded-xl bg-[#1464f4] px-4 py-2.5 text-xs font-black text-white">
                {language==='bn'?'অর্ডার খুলুন':'Open order'}<ArrowRight size={14}/>
              </Link>
            </div>
            <div className="p-5 sm:p-6">
              <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
                <div className="space-y-3">
                  {(currentOrder.items||[]).slice(0,3).map((item:any)=>(
                    <div key={item.id} className="flex items-center gap-3 rounded-xl bg-[#203f61] p-3">
                      <div className="h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-white">
                        {item.imageUrl?<img src={item.imageUrl} alt={item.productName} className="h-full w-full object-cover"/>:<div className="grid h-full place-items-center text-slate-300"><ShoppingBag size={18}/></div>}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-black">{language==='bn'?(item.productNameBn||item.productName):item.productName}</p>
                        <p className="mt-1 text-xs text-slate-300">{item.sku||'Variant'} · Qty {item.quantity}</p>
                      </div>
                      <p className="text-sm font-black">{money(item.lineTotal,language)}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border border-[#31557e] bg-[#203f61] text-white p-5">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#1464f4] text-white"><Truck size={17}/></span>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-300">{language==='bn'?'বর্তমান অবস্থা':'Current status'}</p>
                      <p className="mt-1 text-sm font-black">{pretty(currentOrder.status)}</p>
                    </div>
                  </div>
                  <div className="mt-5 space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-slate-300">{language==='bn'?'পেমেন্ট':'Payment'}</span><b>{pretty(currentOrder.paymentStatus)}</b></div>
                    <div className="flex justify-between"><span className="text-slate-300">{language==='bn'?'মোট':'Total'}</span><b>{money(currentOrder.total,language)}</b></div>
                    {currentOrder.trackingNumber&&<div className="flex justify-between gap-3"><span className="text-slate-300">{language==='bn'?'ট্র্যাকিং':'Tracking'}</span><b className="truncate">{currentOrder.trackingNumber}</b></div>}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ['/account/addresses',MapPin,language==='bn'?'ঠিকানা':'Addresses',language==='bn'?'ডেলিভারি লোকেশন পরিচালনা করুন':'Manage delivery locations'],
            ['/account/payments',WalletCards,language==='bn'?'পেমেন্ট':'Payments',language==='bn'?'লেনদেন ও বকেয়া দেখুন':'See transactions and dues'],
            ['/account/returns',RotateCcw,language==='bn'?'রিটার্ন':'Returns',language==='bn'?'রিটার্ন ও রিফান্ড ট্র্যাক করুন':'Track returns and refunds'],
            ['/account/orders',Clock3,language==='bn'?'অর্ডার ইতিহাস':'Order history',language==='bn'?'সব অর্ডার ও ইনভয়েস':'All orders and invoices'],
          ].map(([href,Icon,title,desc]:any)=>(
            <Link key={href} href={href} className="flex items-start gap-3 rounded-2xl border border-[#31557e] bg-[#17324f] p-4 transition hover:border-blue-200 hover:shadow-md">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-[#1464f4]"><Icon size={16}/></span>
              <div className="min-w-0"><p className="text-sm font-black">{title}</p><p className="mt-1 text-xs leading-5 text-slate-300">{desc}</p></div>
            </Link>
          ))}
        </section>

        <section className="mt-5 rounded-[1.75rem] border border-[#31557e] bg-[#17324f] p-5 shadow-sm sm:p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[.16em] text-slate-300">{language==='bn'?'সাম্প্রতিক কার্যক্রম':'Recent activity'}</p>
              <h2 className="mt-2 text-2xl font-black">{language==='bn'?'সাম্প্রতিক অর্ডার':'Recent orders'}</h2>
            </div>
            <Link href="/account/orders" className="text-sm font-black text-[#1464f4]">{language==='bn'?'সব দেখুন':'View all'} →</Link>
          </div>

          <div className="mt-5 space-y-3">
            {recent.map(o=>(
              <Link key={o.id} href={`/account/orders/${o.id}`} className="group grid gap-4 rounded-2xl border border-[#31557e] bg-[#1d3b5b] p-4 transition hover:border-blue-100 hover:bg-white hover:shadow-sm md:grid-cols-[1.3fr_.8fr_.8fr_auto] md:items-center">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {(o.items||[]).slice(0,2).map((item:any)=><div key={item.id} className="h-11 w-11 overflow-hidden rounded-xl border-2 border-white bg-white">{item.imageUrl?<img src={item.imageUrl} alt="" className="h-full w-full object-cover"/>:<div className="grid h-full place-items-center text-slate-300"><PackageCheck size={15}/></div>}</div>)}
                  </div>
                  <div><p className="font-black">{o.orderNumber}</p><p className="mt-1 text-xs text-slate-300">{(o.items||[]).length} {language==='bn'?'পণ্য':'item(s)'}</p></div>
                </div>
                <div><p className="text-[10px] font-black uppercase text-slate-300">{language==='bn'?'স্ট্যাটাস':'Status'}</p><p className="mt-1 text-sm font-black">{pretty(o.status)}</p></div>
                <div><p className="text-[10px] font-black uppercase text-slate-300">{language==='bn'?'পেমেন্ট':'Payment'}</p><p className="mt-1 text-sm font-black">{pretty(o.paymentStatus)}</p></div>
                <div className="flex items-center justify-between gap-3 md:justify-end"><p className="font-black">{money(o.total,language)}</p><ChevronRight size={16} className="text-slate-300 transition group-hover:translate-x-0.5"/></div>
              </Link>
            ))}
            {!orders.length&&!loading&&(
              <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center">
                <ShoppingBag className="mx-auto text-slate-300"/>
                <p className="mt-4 font-black">{language==='bn'?'এখনও কোনো অর্ডার নেই':'No orders yet'}</p>
                <Link href="/shop" className="mt-4 inline-flex rounded-xl bg-[#1464f4] px-5 py-3 text-sm font-black text-white">{language==='bn'?'শপিং শুরু করুন':'Start shopping'}</Link>
              </div>
            )}
          </div>
        </section>
      </AccountShell>
      <StoreFooter/>
    </main>
  );
}
