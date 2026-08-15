'use client';

import { useEffect,useMemo,useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bell, CheckCheck, CreditCard, PackageCheck, RotateCcw, Truck } from 'lucide-react';
import Navbar from '@/components/navbar';
import StoreFooter from '@/components/store-footer';
import { api } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';
import { authRedirectUrl } from '@/lib/customer-auth';
import { useI18n } from '@/lib/i18n';

const pretty=(v:string)=>String(v||'').replaceAll('_',' ');
const icon=(type:string)=>type==='PAYMENT'?CreditCard:type==='RETURN'?RotateCcw:type==='DELIVERY'?Truck:type==='ORDER'?PackageCheck:Bell;

export default function NotificationsPage(){
  const router=useRouter();
  const {language}=useI18n();
  const [items,setItems]=useState<any[]>([]);
  const [filter,setFilter]=useState('ALL');

  async function load(){setItems((await api.get('/notifications')).data||[])}
  useEffect(()=>{if(!getStoredUser()){router.replace(authRedirectUrl(window.location.pathname));return}load()},[router]);

  async function read(id:string){await api.patch(`/notifications/${id}/read`);await load()}
  async function markAll(){await api.patch('/notifications/read-all');await load()}

  const unread=items.filter(x=>!x.isRead).length;
  const visible=useMemo(()=>filter==='ALL'?items:filter==='UNREAD'?items.filter(x=>!x.isRead):items.filter(x=>x.type===filter),[items,filter]);

  function href(x:any){
    if(!x.entityId)return null;
    if(['ORDER','PAYMENT','DELIVERY'].includes(x.type))return `/account/orders/${x.entityId}`;
    if(x.type==='RETURN')return '/account/returns';
    return null;
  }

  return <main className="customer-canvas customer-v3"><Navbar/><section className="mx-auto max-w-7xl px-5 py-8"><div className="mx-auto max-w-5xl">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-xs font-black uppercase tracking-[.18em] text-slate-400">{language==='bn'?'আপডেট সেন্টার':'Update center'}</p><h1 className="mt-2 text-4xl font-black">{language==='bn'?'নোটিফিকেশন':'Notifications'}</h1><p className="mt-2 text-sm text-slate-500">{language==='bn'?'অর্ডার, পেমেন্ট, ডেলিভারি ও রিটার্ন আপডেট।':'Order, payment, delivery and return updates.'}</p></div>
      <div className="flex items-center gap-2"><span className="rounded-full bg-[#1464f4] px-3 py-2 text-xs font-black text-white">{unread} {language==='bn'?'অপঠিত':'unread'}</span><button onClick={markAll} disabled={!unread} className="rounded-xl border border-[#4b6b89] bg-[#28435f] px-4 py-2.5 text-xs font-black text-white hover:bg-[#31516f] disabled:opacity-40">{language==='bn'?'সব পড়া হয়েছে':'Mark all read'}</button></div>
    </div>

    <div className="mt-6 flex flex-wrap gap-2">{['ALL','UNREAD','ORDER','PAYMENT','DELIVERY','RETURN'].map(v=><button key={v} onClick={()=>setFilter(v)} className={`rounded-full px-4 py-2 text-xs font-black ${filter===v?'bg-[#2563eb] text-white':'border border-[#4b6b89] bg-[#28435f] text-slate-200 hover:bg-[#31516f]'}`}>{v==='ALL'?(language==='bn'?'সব':'All'):v==='UNREAD'?(language==='bn'?'অপঠিত':'Unread'):pretty(v)}</button>)}</div>

    <section className="mt-5 space-y-3">{visible.map(x=>{const I=icon(x.type);const link=href(x);const body=<button onClick={()=>read(x.id)} className={`flex w-full gap-4 rounded-2xl border p-5 text-left transition ${x.isRead?'border-[#4b6b89] bg-[#203753]':'border-blue-400/40 bg-[#173f70]'}`}><span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${x.isRead?'bg-[#294866] text-slate-300':'bg-[#2563eb] text-white'}`}><I size={18}/></span><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><p className="font-black">{x.title}</p>{!x.isRead&&<span className="rounded-full bg-[#f36b21] px-2 py-1 text-[9px] font-black text-white">NEW</span>}</div><p className="mt-2 text-sm leading-6 text-slate-500">{x.message}</p><div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[.12em] text-slate-400"><span>{pretty(x.type)}</span>{x.createdAt&&<><span>·</span><span>{new Date(x.createdAt).toLocaleString()}</span></>}</div></div></button>;return link?<div key={x.id}>{body}<Link href={link} className="ml-16 mt-1 inline-block text-xs font-black text-[#1464f4]">{language==='bn'?'বিস্তারিত দেখুন':'View details'} →</Link></div>:<div key={x.id}>{body}</div>})}</section>
    {!visible.length&&<div className="mt-6 rounded-3xl border border-dashed border-[#4b6b89] bg-[#203753] p-14 text-center text-white"><Bell className="mx-auto text-slate-300"/><p className="mt-4 font-black">{language==='bn'?'কোনো নোটিফিকেশন নেই':'No notifications here'}</p></div>}
  </div></section><StoreFooter/></main>
}
