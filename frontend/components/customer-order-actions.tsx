'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, RefreshCcw, ShoppingCart, XCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n';

export default function CustomerOrderActions({order,onChanged}:{order:any;onChanged:()=>Promise<void>|void}){
  const router=useRouter();
  const search=useSearchParams();
  const {language}=useI18n();
  const [reason,setReason]=useState('');
  const [cancelOpen,setCancelOpen]=useState(false);
  const [busy,setBusy]=useState('');
  const [message,setMessage]=useState('');
  const canCancel=['CONFIRMED','PROCESSING'].includes(order.status);
  const showReorder=['DELIVERED','CANCELLED'].includes(order.status);

  async function cancel(){
    if(reason.trim().length<3){
      setMessage(language==='bn'?'বাতিল করার কারণ লিখুন।':'Please enter a cancellation reason.');
      return;
    }
    setBusy('cancel');setMessage('');
    try{
      await api.post(`/me/orders/${order.id}/cancel`,{reason:reason.trim()});
      setCancelOpen(false);setReason('');
      setMessage(language==='bn'?'অর্ডার বাতিল হয়েছে।':'Order cancelled.');
      await onChanged();
    }catch(e:any){
      setMessage(e?.response?.data?.message||'Cancellation failed.');
    }finally{setBusy('')}
  }

  async function reorder(){
    setBusy('reorder');setMessage('');
    try{
      const r=await api.post(`/me/orders/${order.id}/reorder`);
      window.dispatchEvent(new CustomEvent('cart-updated'));
      const skipped=r.data?.skipped?.length||0;
      if(skipped){
        setMessage(language==='bn'?`${skipped}টি অনুপলব্ধ আইটেম বাদ দিয়ে বাকিগুলো কার্টে যোগ হয়েছে।`:`Available items added. ${skipped} unavailable item(s) were skipped.`);
      }else{
        router.push('/cart');
      }
    }catch(e:any){setMessage(e?.response?.data?.message||'Could not reorder.')}
    finally{setBusy('')}
  }

  return <section className="mt-5 space-y-4">
    {search.get('placed')==='1'&&<div className="flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-800"><CheckCircle2 className="shrink-0"/><div><p className="font-black">{language==='bn'?'অর্ডার সফল হয়েছে':'Order placed successfully'}</p><p className="mt-1 text-sm">{language==='bn'?'আপনার অর্ডার কনফার্ম হয়েছে। স্ট্যাটাস পরিবর্তন হলে এখানেই দেখতে পাবেন।':'Your order is confirmed. You can follow every fulfillment update here.'}</p></div></div>}

    {order.status==='CANCELLED'&&<div className="rounded-2xl border border-rose-100 bg-rose-50 p-5"><p className="font-black text-rose-700">{language==='bn'?'অর্ডার বাতিল হয়েছে':'Order cancelled'}</p>{order.cancellationReason&&<p className="mt-2 text-sm text-rose-700">{language==='bn'?'কারণ':'Reason'}: {order.cancellationReason}</p>}</div>}

    <div className="flex flex-wrap gap-2">
      {canCancel&&<button onClick={()=>setCancelOpen(v=>!v)} className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm font-black text-rose-600"><XCircle size={16}/>{language==='bn'?'অর্ডার বাতিল করুন':'Cancel order'}</button>}
      {showReorder&&<button disabled={busy==='reorder'} onClick={reorder} className="inline-flex items-center gap-2 rounded-xl bg-[#f36b21] px-4 py-3 text-sm font-black text-white disabled:opacity-50"><ShoppingCart size={16}/>{busy==='reorder'?(language==='bn'?'যোগ হচ্ছে...':'Adding...'):(language==='bn'?'আবার অর্ডার করুন':'Buy again')}</button>}
      <button onClick={()=>router.push(`/account/orders/${order.id}/invoice`)} className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-3 text-sm font-black"><RefreshCcw size={16}/>{language==='bn'?'ইনভয়েস':'Invoice'}</button>
    </div>

    {cancelOpen&&<div className="max-w-2xl rounded-2xl border border-rose-100 bg-white p-5 shadow-sm"><p className="font-black">{language==='bn'?'কেন বাতিল করছেন?':'Why are you cancelling?'}</p><p className="mt-1 text-xs text-slate-500">{language==='bn'?'এই তথ্য অর্ডার ইতিহাসে সংরক্ষিত থাকবে।':'This reason will be stored with the order history.'}</p><textarea value={reason} onChange={e=>setReason(e.target.value)} maxLength={300} placeholder={language==='bn'?'বাতিল করার কারণ...':'Cancellation reason...'} className="mt-4 min-h-24 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none"/><div className="mt-3 flex gap-2"><button disabled={busy==='cancel'} onClick={cancel} className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-black text-white disabled:opacity-50">{busy==='cancel'?(language==='bn'?'বাতিল হচ্ছে...':'Cancelling...'):(language==='bn'?'নিশ্চিত করুন':'Confirm cancellation')}</button><button onClick={()=>setCancelOpen(false)} className="rounded-xl border px-4 py-2.5 text-sm font-black">{language==='bn'?'ফিরে যান':'Keep order'}</button></div></div>}

    {message&&<p className="rounded-xl bg-blue-50 p-3 text-sm font-semibold text-blue-700">{message}</p>}
  </section>
}
