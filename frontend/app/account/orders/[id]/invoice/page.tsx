'use client';
import {useEffect,useState} from 'react';
import {useParams,useRouter} from 'next/navigation';
import Link from 'next/link';
import {Download,Printer,ShoppingBag} from 'lucide-react';
import Navbar from '@/components/navbar';
import StoreFooter from '@/components/store-footer';
import {api} from '@/lib/api';
import {getStoredUser} from '@/lib/auth';
import { authRedirectUrl } from '@/lib/customer-auth';
const money=(v:any)=>`BDT ${Number(v||0).toLocaleString('en-BD',{minimumFractionDigits:2,maximumFractionDigits:2})}`;

export default function InvoicePage(){
 const {id}=useParams<{id:string}>(); const router=useRouter(); const [d,setD]=useState<any>(null); const [error,setError]=useState('');
 useEffect(()=>{if(!getStoredUser()){router.replace(authRedirectUrl(`/account/orders/${id}/invoice`));return}api.get(`/ops/invoices/${id}`).then(r=>setD(r.data)).catch((e:any)=>setError(e?.response?.data?.message||'Invoice could not be loaded.'))},[id,router]);
 if(error)return <main className="grid min-h-screen place-items-center bg-slate-50 p-5"><div className="rounded-2xl bg-white p-8 text-center shadow"><p className="font-black text-rose-600">{error}</p><Link href={`/account/orders/${id}`} className="mt-4 inline-block text-sm font-black text-blue-600">Back to order</Link></div></main>;
 if(!d)return <main className="grid min-h-screen place-items-center bg-slate-50 font-bold">Loading invoice...</main>;
 const o=d.order||{}; const items=d.items||[]; const p=d.payment||{};
 return <main className="min-h-screen bg-[#f3f6fb] text-slate-950">
   <div className="print:hidden"><Navbar/></div>
   <div className="mx-auto max-w-5xl px-4 py-8 sm:px-5">
     <div className="mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
       <Link href={`/account/orders/${id}`} className="text-sm font-black text-slate-600">← Back to order</Link>
       <div className="flex gap-2"><button onClick={()=>window.print()} className="inline-flex items-center gap-2 rounded-xl bg-[#1464f4] px-4 py-3 text-sm font-black text-white"><Printer size={16}/> Print / Save PDF</button></div>
     </div>
     <article className="mx-auto overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/50 print:max-w-none print:rounded-none print:border-0 print:shadow-none">
       <div className="bg-gradient-to-r from-[#102956] to-[#1464f4] p-7 text-white print:bg-white print:text-slate-950">
         <div className="flex flex-wrap justify-between gap-5">
           <div><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-white/15 print:border"><ShoppingBag size={20}/></span><div><p className="text-2xl font-black">E-Commerce Platform</p><p className="text-xs text-white/70 print:text-slate-500">Order invoice</p></div></div></div>
           <div className="text-right"><p className="text-xs font-black uppercase tracking-[.18em] text-white/65 print:text-slate-400">Invoice</p><h1 className="mt-1 text-2xl font-black">{d.invoiceNumber}</h1><p className="mt-1 text-xs text-white/70 print:text-slate-500">{new Date(d.issuedAt).toLocaleString()}</p></div>
         </div>
       </div>
       <div className="p-7">
         <div className="grid gap-5 border-b border-slate-200 pb-6 sm:grid-cols-3">
           <div><p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Order</p><p className="mt-2 font-black">{o.orderNumber}</p><p className="mt-1 text-xs text-slate-500">{o.status}</p></div>
           <div><p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Bill to</p><p className="mt-2 font-black">{o.customerName}</p><p className="mt-1 text-xs text-slate-500">{o.email}</p><p className="text-xs text-slate-500">{o.phone}</p></div>
           <div><p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Deliver to</p><p className="mt-2 text-sm font-semibold">{o.addressLine}</p><p className="mt-1 text-xs text-slate-500">{[o.area,o.district||o.city,o.division].filter(Boolean).join(', ')}</p>{o.landmark&&<p className="mt-1 text-xs text-slate-500">Landmark: {o.landmark}</p>}</div>
         </div>

         <div className="mt-6 overflow-x-auto">
           <table className="w-full min-w-[620px] text-left text-sm">
             <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500"><tr><th className="rounded-l-xl px-4 py-3">Item</th><th className="px-4 py-3">Variant</th><th className="px-4 py-3 text-center">Qty</th><th className="px-4 py-3 text-right">Unit</th><th className="rounded-r-xl px-4 py-3 text-right">Total</th></tr></thead>
             <tbody>{items.map((x:any)=><tr key={x.id} className="border-b border-slate-100"><td className="px-4 py-4 font-black">{x.productName}</td><td className="px-4 py-4 text-xs text-slate-500">{x.variantName||x.sku||x.variantSku||'—'}</td><td className="px-4 py-4 text-center">{x.quantity}</td><td className="px-4 py-4 text-right">{money(x.unitPrice)}</td><td className="px-4 py-4 text-right font-black">{money(x.lineTotal)}</td></tr>)}</tbody>
           </table>
         </div>

         <div className="mt-7 grid gap-6 border-t border-slate-200 pt-6 sm:grid-cols-[1fr_360px]">
           <div className="text-sm"><p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Payment & delivery</p><div className="mt-3 grid grid-cols-2 gap-2 text-xs"><span className="text-slate-500">Payment mode</span><b className="text-right">{o.paymentMode||'—'}</b><span className="text-slate-500">Payment status</span><b className="text-right">{o.paymentStatus||'—'}</b><span className="text-slate-500">Tracking</span><b className="text-right">{o.trackingNumber||'Pending'}</b></div></div>
           <div className="space-y-2 rounded-2xl bg-slate-50 p-5 text-sm">
             {o.subtotal!==undefined&&<div className="flex justify-between"><span className="text-slate-500">Subtotal</span><b>{money(o.subtotal)}</b></div>}
             {o.discount!==undefined&&Number(o.discount)>0&&<div className="flex justify-between"><span className="text-slate-500">Discount</span><b>- {money(o.discount)}</b></div>}
             {o.shippingCharge!==undefined&&<div className="flex justify-between"><span className="text-slate-500">Shipping</span><b>{money(o.shippingCharge)}</b></div>}
             <div className="flex justify-between border-t border-slate-200 pt-3 text-lg"><span className="font-black">Grand total</span><b>{money(o.total)}</b></div>
             <div className="flex justify-between text-emerald-700"><span>Net paid</span><b>{money(p.netPaid)}</b></div>
             <div className="flex justify-between text-orange-700"><span>Due</span><b>{money(p.due)}</b></div>
           </div>
         </div>
         <p className="mt-8 border-t border-dashed border-slate-200 pt-5 text-center text-[10px] text-slate-400">Thank you for shopping with E-Commerce Platform. This invoice was generated from your recorded order and payment information.</p>
       </div>
     </article>
   </div>
   <div className="print:hidden"><StoreFooter/></div>
 </main>
}
