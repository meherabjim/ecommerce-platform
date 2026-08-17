'use client';

import { FormEvent,useEffect,useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save,Settings2,Store,Truck,Search,Package,UsersRound,BellRing } from 'lucide-react';
import AdminShell from '@/components/admin-shell';
import { api } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';

type FormState={
 storeName:string;tagline:string;logoUrl:string;
 freeShippingMessage:string;supportEmail:string;supportPhone:string;
 address:string;facebookUrl:string;messengerUrl:string;whatsappNumber:string;supportHours:string;defaultLanguage:'en'|'bn';
 orderPrefix:string;defaultShippingCharge:string;freeShippingThreshold:string;
 lowStockDefault:string;guestCheckoutEnabled:boolean;
 seoTitle:string;seoDescription:string;
 footerAbout:string;footerCopyright:string;
 newsletterEnabled:boolean;reviewModeration:boolean;
 notificationOrder:boolean;notificationPayment:boolean;notificationDelivery:boolean;notificationReturn:boolean;
};

const initial:FormState={
 storeName:'E-Commerce Platform',tagline:'Premium retail',logoUrl:'',
 freeShippingMessage:'Fast local delivery · Secure checkout · Easy returns',
 supportEmail:'meherabjim2022@gmail.com',supportPhone:'01764305948',
 address:'Vatara, Dhaka',facebookUrl:'',messengerUrl:'',whatsappNumber:'01764305948',supportHours:'Every day, 10:00 AM – 10:00 PM',defaultLanguage:'en',
 orderPrefix:'NC',defaultShippingCharge:'120',
 freeShippingThreshold:'3000',lowStockDefault:'5',guestCheckoutEnabled:false,
 seoTitle:'E-Commerce Platform',seoDescription:'Modern ecommerce shopping experience.',
 footerAbout:'Secure checkout, live inventory, delivery tracking and customer support.',
 footerCopyright:'© 2026 E-Commerce Platform. All rights reserved.',
 newsletterEnabled:true,reviewModeration:true,
 notificationOrder:true,notificationPayment:true,notificationDelivery:true,notificationReturn:true,
};

export default function SettingsPage(){
 const router=useRouter();const [f,setF]=useState<FormState>(initial);const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);

 useEffect(()=>{
  const u=getStoredUser();
  if(!u||!['SUPER_ADMIN','ADMIN'].includes(u.role)){router.replace('/login');return}
  api.get('/cms/admin/settings').then(r=>{
   const map=Object.fromEntries((r.data||[]).map((x:any)=>[x.key,x.value]));
   const identity=map['store.identity']||{},commerce=map['store.commerce']||{},ops=map['store.operations']||{},seo=map['store.seo']||{},footer=map['store.footer']||{},customer=map['store.customer']||{},notifications=map['store.notifications']||{},contact=map['store.contact']||{},locale=map['store.locale']||{};
   setF({
    storeName:identity.storeName||initial.storeName,tagline:identity.tagline||initial.tagline,logoUrl:identity.logoUrl||'',
    freeShippingMessage:commerce.freeShippingMessage||initial.freeShippingMessage,supportEmail:identity.supportEmail||initial.supportEmail,supportPhone:identity.supportPhone||initial.supportPhone,
    address:contact.address||initial.address,facebookUrl:contact.facebookUrl||'',messengerUrl:contact.messengerUrl||'',whatsappNumber:contact.whatsappNumber||identity.supportPhone||initial.whatsappNumber,supportHours:contact.supportHours||initial.supportHours,defaultLanguage:locale.defaultLanguage==='bn'?'bn':'en',
    orderPrefix:ops.orderPrefix||'NC',defaultShippingCharge:String(ops.defaultShippingCharge??120),freeShippingThreshold:String(ops.freeShippingThreshold??3000),
    lowStockDefault:String(ops.lowStockDefault??5),guestCheckoutEnabled:Boolean(customer.guestCheckoutEnabled),
    seoTitle:seo.title||initial.seoTitle,seoDescription:seo.description||initial.seoDescription,
    footerAbout:footer.about||initial.footerAbout,footerCopyright:footer.copyright||initial.footerCopyright,
    newsletterEnabled:customer.newsletterEnabled??true,reviewModeration:customer.reviewModeration??true,
    notificationOrder:notifications.order??true,notificationPayment:notifications.payment??true,notificationDelivery:notifications.delivery??true,notificationReturn:notifications.return??true,
   });
  });
 },[router]);

 async function save(e:FormEvent){
  e.preventDefault();setBusy(true);setMessage('');
  const items=[
   {key:'store.identity',groupName:'BUSINESS',value:{storeName:f.storeName,tagline:f.tagline,logoUrl:f.logoUrl,supportEmail:f.supportEmail,supportPhone:f.supportPhone}},
   {key:'store.contact',groupName:'BUSINESS',value:{address:f.address,email:f.supportEmail,phone:f.supportPhone,facebookUrl:f.facebookUrl,messengerUrl:f.messengerUrl,whatsappNumber:f.whatsappNumber,supportHours:f.supportHours}},
   {key:'store.locale',groupName:'STORE',value:{defaultLanguage:f.defaultLanguage}},
   {key:'store.commerce',groupName:'STORE',value:{freeShippingMessage:f.freeShippingMessage}},
   {key:'store.operations',groupName:'ORDER',value:{orderPrefix:f.orderPrefix,defaultShippingCharge:Number(f.defaultShippingCharge||0),freeShippingThreshold:Number(f.freeShippingThreshold||0),lowStockDefault:Number(f.lowStockDefault||0)}},
   {key:'store.customer',groupName:'CUSTOMER',value:{guestCheckoutEnabled:f.guestCheckoutEnabled,newsletterEnabled:f.newsletterEnabled,reviewModeration:f.reviewModeration}},
   {key:'store.seo',groupName:'SEO',value:{title:f.seoTitle,description:f.seoDescription}},
   {key:'store.footer',groupName:'CMS',value:{about:f.footerAbout,copyright:f.footerCopyright}},
   {key:'store.notifications',groupName:'NOTIFICATIONS',value:{order:f.notificationOrder,payment:f.notificationPayment,delivery:f.notificationDelivery,return:f.notificationReturn}},
  ];
  try{await api.patch('/cms/admin/settings',{items});setMessage('Store settings saved. Reload storefront pages to see public configuration changes.')}
  catch(e:any){setMessage(e?.response?.data?.message||'Could not save settings.')}
  finally{setBusy(false)}
 }

 const box='rounded-[1.6rem] border border-slate-200 bg-white p-6';
 const input='mt-2 w-full rounded-xl border border-slate-200 p-3 font-normal';
 return <AdminShell>
  <div><p className="text-xs font-black uppercase tracking-[.18em] text-slate-400">Configuration center</p><h1 className="mt-2 text-3xl font-black">Store settings</h1><p className="mt-2 text-sm text-slate-500">Business, order, customer, SEO, footer and notification configuration in one place.</p></div>
  {message&&<p className="mt-5 rounded-xl border bg-white p-4 text-sm font-semibold">{message}</p>}
  <form onSubmit={save} className="mt-6 space-y-5">
   <section className={box}><div className="flex items-center gap-3"><Store size={19}/><h2 className="text-xl font-black">Business & storefront</h2></div><div className="mt-4 grid gap-4 md:grid-cols-2">
    <label className="text-sm font-bold">Store name<input className={input} value={f.storeName} onChange={e=>setF({...f,storeName:e.target.value})}/></label>
    <label className="text-sm font-bold">Tagline<input className={input} value={f.tagline} onChange={e=>setF({...f,tagline:e.target.value})}/></label>
    <label className="text-sm font-bold">Logo URL<input className={input} value={f.logoUrl} onChange={e=>setF({...f,logoUrl:e.target.value})}/></label>
    <label className="text-sm font-bold">Announcement<input className={input} value={f.freeShippingMessage} onChange={e=>setF({...f,freeShippingMessage:e.target.value})}/></label>
    <label className="text-sm font-bold">Support email<input className={input} value={f.supportEmail} onChange={e=>setF({...f,supportEmail:e.target.value})}/></label>
    <label className="text-sm font-bold">Support phone<input className={input} value={f.supportPhone} onChange={e=>setF({...f,supportPhone:e.target.value})}/></label>
    <label className="text-sm font-bold md:col-span-2">Business address<input className={input} value={f.address} onChange={e=>setF({...f,address:e.target.value})}/></label>
    <label className="text-sm font-bold">Facebook URL<input className={input} value={f.facebookUrl} onChange={e=>setF({...f,facebookUrl:e.target.value})} placeholder="https://facebook.com/your-page"/></label>
    <label className="text-sm font-bold">Messenger URL<input className={input} value={f.messengerUrl} onChange={e=>setF({...f,messengerUrl:e.target.value})} placeholder="https://m.me/your-page"/></label>
    <label className="text-sm font-bold">WhatsApp number<input className={input} value={f.whatsappNumber} onChange={e=>setF({...f,whatsappNumber:e.target.value})}/></label>
    <label className="text-sm font-bold">Support hours<input className={input} value={f.supportHours} onChange={e=>setF({...f,supportHours:e.target.value})}/></label>
    <label className="text-sm font-bold">Default storefront language<select className={input} value={f.defaultLanguage} onChange={e=>setF({...f,defaultLanguage:e.target.value as 'en'|'bn'})}><option value="en">English</option><option value="bn">বাংলা</option></select></label>
   </div></section>

   <section className={box}><div className="flex items-center gap-3"><Truck size={19}/><h2 className="text-xl font-black">Orders & inventory defaults</h2></div><div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <label className="text-sm font-bold">Order prefix<input className={input} value={f.orderPrefix} onChange={e=>setF({...f,orderPrefix:e.target.value})}/></label>
    <label className="text-sm font-bold">Default shipping<input type="number" className={input} value={f.defaultShippingCharge} onChange={e=>setF({...f,defaultShippingCharge:e.target.value})}/></label>
    <label className="text-sm font-bold">Free shipping threshold<input type="number" className={input} value={f.freeShippingThreshold} onChange={e=>setF({...f,freeShippingThreshold:e.target.value})}/></label>
    <label className="text-sm font-bold">Default low-stock level<input type="number" className={input} value={f.lowStockDefault} onChange={e=>setF({...f,lowStockDefault:e.target.value})}/></label>
   </div></section>

   <section className={box}><div className="flex items-center gap-3"><UsersRound size={19}/><h2 className="text-xl font-black">Customer policy</h2></div><div className="mt-4 flex flex-wrap gap-6 text-sm font-bold">
    <label><input type="checkbox" checked={f.guestCheckoutEnabled} onChange={e=>setF({...f,guestCheckoutEnabled:e.target.checked})}/> Guest checkout enabled</label>
    <label><input type="checkbox" checked={f.newsletterEnabled} onChange={e=>setF({...f,newsletterEnabled:e.target.checked})}/> Newsletter enabled</label>
    <label><input type="checkbox" checked={f.reviewModeration} onChange={e=>setF({...f,reviewModeration:e.target.checked})}/> Review moderation</label>
   </div><p className="mt-3 text-xs text-amber-700">Guest checkout is a policy flag only until the anonymous checkout backend flow is implemented; keep it disabled for the current authenticated checkout.</p></section>

   <section className={box}><div className="flex items-center gap-3"><Search size={19}/><h2 className="text-xl font-black">SEO & footer</h2></div><div className="mt-4 grid gap-4 md:grid-cols-2">
    <label className="text-sm font-bold">SEO title<input className={input} value={f.seoTitle} onChange={e=>setF({...f,seoTitle:e.target.value})}/></label>
    <label className="text-sm font-bold">SEO description<textarea className={`${input} min-h-24`} value={f.seoDescription} onChange={e=>setF({...f,seoDescription:e.target.value})}/></label>
    <label className="text-sm font-bold">Footer about<textarea className={`${input} min-h-24`} value={f.footerAbout} onChange={e=>setF({...f,footerAbout:e.target.value})}/></label>
    <label className="text-sm font-bold">Copyright<input className={input} value={f.footerCopyright} onChange={e=>setF({...f,footerCopyright:e.target.value})}/></label>
   </div></section>

   <section className={box}><div className="flex items-center gap-3"><BellRing size={19}/><h2 className="text-xl font-black">Notification event switches</h2></div><div className="mt-4 flex flex-wrap gap-6 text-sm font-bold">
    {([['notificationOrder','Order'],['notificationPayment','Payment'],['notificationDelivery','Delivery'],['notificationReturn','Return']] as const).map(([k,l])=><label key={k}><input type="checkbox" checked={f[k]} onChange={e=>setF({...f,[k]:e.target.checked})}/> {l} notifications</label>)}
   </div></section>

   <button disabled={busy} className="flex items-center gap-2 rounded-xl bg-[#1464f4] px-6 py-3.5 text-sm font-black text-white disabled:opacity-50"><Save size={16}/>{busy?'Saving...':'Save all settings'}</button>
  </form>
 </AdminShell>
}
