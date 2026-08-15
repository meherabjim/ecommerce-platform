'use client';

import { FormEvent,useEffect,useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, ChevronLeft, CreditCard, MapPin, PackageCheck, ShieldCheck, Sparkles, Tag, Truck, WalletCards } from 'lucide-react';
import Navbar from '@/components/navbar';
import LocationPicker from '@/components/location-picker';
import CompactLocationSelector from '@/components/compact-location-selector';
import StoreFooter from '@/components/store-footer';
import { api } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';
import { authRedirectUrl } from '@/lib/customer-auth';
import { useI18n } from '@/lib/i18n';

export default function CheckoutPage(){
  const router=useRouter();
  const {language}=useI18n();
  const [cart,setCart]=useState<any>(null),[addresses,setAddresses]=useState<any[]>([]),[selected,setSelected]=useState(''),[manual,setManual]=useState(false),[saveAddress,setSaveAddress]=useState(true),[error,setError]=useState(''),[busy,setBusy]=useState(false),[shippingQuote,setShippingQuote]=useState<any>({charge:120});
  const [form,setForm]=useState<any>({customerName:'',phone:'',email:'',addressLine:'',city:'',division:'',district:'',area:'',landmark:'',postalCode:'',addressLabel:'HOME',latitude:null,longitude:null,locationSource:'NONE',notes:'',paymentMode:'COD',couponCode:''});

  function applyAddress(a:any){setForm((x:any)=>({...x,customerName:a.recipientName,phone:a.phone,addressLine:a.addressLine,city:a.district,division:a.division,district:a.district,area:a.area,landmark:a.landmark||'',postalCode:a.postalCode||'',addressLabel:a.type,latitude:a.latitude===null?null:Number(a.latitude),longitude:a.longitude===null?null:Number(a.longitude),locationSource:a.locationSource||'NONE'}))}
  function useSavedAddress(a:any){setSelected(a.id);applyAddress(a);setManual(false)}
  function useNewAddress(){const u=getStoredUser();setSelected('');setManual(true);setForm((x:any)=>({...x,customerName:u?.name||'',phone:u?.phone||'',addressLine:'',city:'',division:'',district:'',area:'',landmark:'',postalCode:'',addressLabel:'HOME',latitude:null,longitude:null,locationSource:'NONE'}))}
  const [couponBusy,setCouponBusy]=useState(false),[couponError,setCouponError]=useState(''),[couponPreview,setCouponPreview]=useState<any>(null);


  useEffect(()=>{
    const u=getStoredUser();if(!u){router.replace(authRedirectUrl(window.location.pathname));return}
    setForm((x:any)=>({...x,customerName:u.name,phone:u.phone||'',email:u.email}));
    Promise.all([api.get('/cart'),api.get('/users/me/addresses')]).then(([c,a])=>{
      if(!c.data.items.length){router.replace('/cart');return}
      setCart(c.data);const raw=a.data||[];const seen=new Set<string>();const list=raw.filter((x:any)=>{const k=[x.recipientName,x.phone,x.type,x.division,x.district,x.area,x.addressLine].map((v:any)=>String(v||'').trim().toLowerCase()).join('|');if(seen.has(k))return false;seen.add(k);return true});setAddresses(list);const d=list.find((x:any)=>x.isDefault);
      if(d){setSelected(d.id);applyAddress(d);setManual(false)}else setManual(true)
    }).catch(()=>setError('Could not prepare checkout.'))
  },[router]);

  useEffect(()=>{
    if(!cart||!form.district)return;
    api.get('/shipping/quote',{params:{district:form.district,area:form.area||'',subtotal:cart.subtotal}})
      .then(r=>setShippingQuote(r.data))
      .catch(()=>setShippingQuote({charge:cart.subtotal>=3000?0:120}))
  },[cart,form.district,form.area]);

  async function previewCoupon(){
    const code=String(form.couponCode||'').trim().toUpperCase();
    setCouponError('');
    setCouponPreview(null);
    if(!code){setCouponError(language==='bn'?'কুপন কোড লিখুন':'Enter a coupon code');return}
    setCouponBusy(true);
    try{
      const r=await api.post('/promotions/preview',{code,subtotal:Number(cart?.subtotal||0)});
      setCouponPreview(r.data);
    }catch(err:any){
      const m=err?.response?.data?.message;
      setCouponError(Array.isArray(m)?m.join(', '):m||(language==='bn'?'কুপনটি প্রযোজ্য নয়':'Coupon is not applicable'));
    }finally{setCouponBusy(false)}
  }

  async function submit(e:FormEvent){
    e.preventDefault();setBusy(true);setError('');
    try{
      let addressId=selected||undefined;
      if(manual&&saveAddress){
        const saved=await api.post('/users/me/addresses',{recipientName:form.customerName,phone:form.phone,type:'HOME',division:form.division,district:form.district,area:form.area,addressLine:form.addressLine,landmark:form.landmark||undefined,postalCode:form.postalCode||undefined,latitude:form.latitude??undefined,longitude:form.longitude??undefined,locationSource:form.locationSource,isDefault:addresses.length===0});
        addressId=saved.data.id;
      }
      const r=await api.post('/checkout',{...form,city:form.district,addressId});
      router.push(`/account/orders/${r.data.id}?placed=1`);
    }catch(err:any){const m=err?.response?.data?.message;setError(Array.isArray(m)?m.join(', '):m||'Checkout failed.')}
    finally{setBusy(false)}
  }

  if(!cart)return <main className="grid min-h-screen place-items-center bg-[#10243a] font-bold text-slate-100">Preparing checkout...</main>;
  const shipping=Number(shippingQuote?.charge??120);
  const previewDiscount=Number(couponPreview?.discount||0);
  const estimated=Math.max(0,Number(cart.subtotal)+shipping-previewDiscount);

  return <main className="customer-canvas customer-v3 checkout-one-screen">
    <Navbar/>
    <section className="mx-auto max-w-7xl px-5 py-2.5 sm:py-3">
      <div className="checkout-hero">
        <div className="relative z-10 flex flex-wrap items-end justify-between gap-5">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-300/30 bg-sky-400/10 px-3 py-2 text-[10px] font-black uppercase tracking-[.16em] text-sky-200"><ShieldCheck size={14}/> Secure checkout</span>
            <h1 className="mt-2 text-3xl font-black tracking-[-.04em] sm:text-4xl">{language==='bn'?'অর্ডার সম্পন্ন করুন':'Complete your order'}</h1>
            <p className="mt-1.5 max-w-2xl text-xs leading-5 text-slate-300">{language==='bn'?'ডেলিভারি, পেমেন্ট ও অর্ডারের তথ্য যাচাই করুন।':'Review delivery, payment and order details before placing your order.'}</p>
          </div>
          <Link href="/cart" className="inline-flex items-center gap-2 rounded-xl border border-[#4b6b89] bg-[#203753] px-3.5 py-2.5 text-xs font-black text-sky-200 transition hover:bg-[#294866]"><ChevronLeft size={16}/>{language==='bn'?'কার্টে ফিরুন':'Back to cart'}</Link>
        </div>
        <div className="relative z-10 mt-2.5 grid gap-2 sm:grid-cols-3">
          <div className="checkout-progress-card checkout-progress-blue"><span>1</span><div><p>Delivery</p><small>Address</small></div></div>
          <div className="checkout-progress-card checkout-progress-violet"><span>2</span><div><p>Payment</p><small>Method</small></div></div>
          <div className="checkout-progress-card checkout-progress-orange"><span>3</span><div><p>Review</p><small>Pay</small></div></div>
        </div>
      </div>
      {error&&<p className="mt-5 rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</p>}

      <form onSubmit={submit} className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_410px]">
        <section className="space-y-3">
          <div className="customer-panel p-4 sm:p-5">
            <div className="flex items-start gap-4"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#1464f4] to-[#7048ff] text-white shadow-md shadow-blue-100"><MapPin size={18}/></span><div><p className="text-xs font-black uppercase tracking-[.15em] text-slate-400">Step 1</p><h2 className="mt-0.5 text-lg font-black">{language==='bn'?'ডেলিভারি ঠিকানা':'Delivery address'}</h2><p className="mt-0.5 text-xs text-slate-400">{language==='bn'?'সেভ করা ঠিকানা বেছে নিন অথবা নতুন ঠিকানা দিন।':'Choose a saved address or enter a new delivery point.'}</p></div></div>

            {addresses.length>0&&<div className="checkout-address-grid mt-3 grid gap-3 md:grid-cols-2">{addresses.map((a:any)=><button type="button" key={a.id} onClick={()=>useSavedAddress(a)} className={`relative rounded-xl border p-3 text-left transition ${!manual&&selected===a.id?'border-sky-400 bg-[#173f70] ring-1 ring-sky-400/40':'border-[#4b6b89] bg-[#203753] hover:border-sky-500 hover:bg-[#28435f]'}`}>
              {!manual&&selected===a.id&&<span className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-[#1464f4] text-white"><Check size={13}/></span>}
              <div className="flex flex-wrap gap-2"><span className="rounded-full bg-[#294866] px-2 py-1 text-[10px] font-black text-slate-200">{a.type}</span>{a.isDefault&&<span className="rounded-full bg-[#166534] px-2 py-1 text-[10px] font-black text-green-200">DEFAULT</span>}{a.latitude&&a.longitude&&<span className="rounded-full bg-[#164e63] px-2 py-1 text-[10px] font-black text-sky-200">GPS</span>}</div>
              <p className="mt-2 font-black">{a.recipientName}</p><p className="text-xs text-slate-500">{a.phone}</p><p className="mt-2 text-sm">{a.addressLine}</p><p className="mt-1 text-xs text-slate-400">{[a.area,a.district].filter(Boolean).join(', ')}</p>
            </button>)}</div>}
            <button type="button" onClick={useNewAddress} className="mt-3 inline-flex rounded-xl border border-sky-400/40 bg-[#164e63] px-4 py-2.5 text-sm font-black text-sky-200 transition hover:bg-[#0e7490] hover:text-white">+ Use a different address</button>

            {manual&&<div className="mt-5 border-t border-slate-200 pt-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-black">Full name<input required value={form.customerName} onChange={e=>setForm({...form,customerName:e.target.value})} className="focus-ring mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 font-normal outline-none"/></label>
                <label className="text-sm font-black">Phone<input required value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} className="focus-ring mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 font-normal outline-none"/></label>
                <div className="sm:col-span-2"><CompactLocationSelector division={form.division} district={form.district} area={form.area} postalCode={form.postalCode} onChange={(x:any)=>setForm({...form,...x,city:x.district})}/></div>
                <label className="text-sm font-black sm:col-span-2">Full address<textarea required value={form.addressLine} onChange={e=>setForm({...form,addressLine:e.target.value})} placeholder="House, road, block, floor..." className="focus-ring mt-2 min-h-24 w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 font-normal outline-none"/></label>
                <label className="text-sm font-black sm:col-span-2">Landmark <span className="font-normal text-slate-400">(optional)</span><input value={form.landmark} onChange={e=>setForm({...form,landmark:e.target.value})} className="focus-ring mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 font-normal outline-none"/></label>
                <div className="sm:col-span-2"><LocationPicker latitude={form.latitude} longitude={form.longitude} locationSource={form.locationSource} onChange={(latitude,longitude,locationSource)=>setForm({...form,latitude,longitude,locationSource})}/></div>
              </div>
              <label className="mt-4 flex items-center gap-3 rounded-xl border border-[#4b6b89] bg-[#203753] p-4 text-sm font-black text-slate-100"><input type="checkbox" checked={saveAddress} onChange={e=>setSaveAddress(e.target.checked)}/>Save this address to my account</label>
            </div>}
          </div>

          <div className="customer-panel checkout-payment-panel p-3.5 sm:p-4">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#1464f4] to-[#7048ff] text-white"><WalletCards size={17}/></span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div><p className="text-[10px] font-black uppercase tracking-[.15em] text-slate-400">Step 2</p><h2 className="text-base font-black">{language==='bn'?'পেমেন্ট':'Payment'}</h2></div>
                  <p className="text-[11px] text-slate-400">{language==='bn'?'পেমেন্ট পদ্ধতি বেছে নিন':'Choose payment method'}</p>
                </div>
              </div>
            </div>
            <div className="mt-2.5 grid gap-2 md:grid-cols-3">
              {[['COD','Cash on delivery','Pay on arrival'],['FULL_ONLINE','Online payment','Gateway ready'],['PARTIAL','Partial payment','Pay part now']].map(([v,l,s])=><label key={v} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 ${form.paymentMode===v?'border-sky-400 bg-[#173f70] ring-1 ring-sky-400/30':'border-[#4b6b89] bg-[#203753] hover:bg-[#28435f]'}`}><input type="radio" name="payment" value={v} checked={form.paymentMode===v} onChange={e=>setForm({...form,paymentMode:e.target.value})}/><div className="min-w-0"><p className="truncate text-sm font-black">{l}</p><p className="mt-0.5 truncate text-[11px] text-slate-400">{s}</p></div></label>)}
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-[#4b6b89] bg-[#10243a] px-3 py-2.5">
              <PackageCheck size={14} className="shrink-0 text-sky-300"/>
              <input value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder={language==='bn'?'অর্ডার নোট (ঐচ্ছিক)':'Optional order note'} className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-slate-500"/>
            </div>
          </div>
        </section>

        <aside className="checkout-summary h-fit overflow-hidden rounded-[2rem] border border-[#4b6b89] text-white shadow-2xl shadow-black/25 xl:sticky xl:top-28">
          <div className="checkout-summary-head !p-4">
            <div className="flex items-center justify-between gap-3">
              <div><p className="text-[10px] font-black uppercase tracking-[.18em] text-sky-200">Order summary</p><h2 className="mt-0.5 text-lg font-black">Review & pay</h2></div>
              <span className="grid h-9 w-9 place-items-center rounded-2xl bg-[#2563eb] text-white shadow-lg"><CreditCard size={19}/></span>
            </div>
          </div>

          <div className="p-4">
            <div className="space-y-1.5">{cart.items.map((x:any)=><div key={x.id} className="rounded-xl border border-[#3e5d7a] bg-[#1b344f] p-3">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0"><p className="truncate text-sm font-black text-white">{x.productName}</p><p className="mt-1 text-[11px] font-bold text-slate-400">Quantity {x.quantity}</p></div>
                <span className="shrink-0 text-sm font-black text-sky-200">BDT {x.lineTotal}</span>
              </div>
            </div>)}</div>

            <div className="mt-3 rounded-xl border border-[#3e5d7a] bg-[#172d45] p-3">
              <div className="flex justify-between text-sm text-slate-300"><span>Subtotal</span><span className="font-black text-white">BDT {cart.subtotal}</span></div>
              <div className="mt-2 flex justify-between text-xs text-slate-300"><span>Shipping</span><span className="font-black text-white">{shipping===0?'FREE':`BDT ${shipping}`}</span></div>
              {previewDiscount>0&&<div className="mt-3 flex justify-between text-sm text-green-300"><span>Coupon discount</span><span className="font-black">- BDT {previewDiscount.toFixed(2)}</span></div>}
              <div className="mt-2.5 flex items-end justify-between border-t border-[#3e5d7a] pt-2.5">
                <div><p className="text-[10px] font-black uppercase tracking-[.14em] text-slate-400">{previewDiscount>0?'Payable total':'Estimated total'}</p><p className="mt-1 text-xs text-slate-400">Including delivery charge</p></div>
                <span className="text-xl font-black tracking-tight text-white">BDT {estimated.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-yellow-400/30 bg-gradient-to-br from-[#493314] to-[#352913] p-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.13em] text-yellow-200"><Tag size={14}/>{language==='bn'?'প্রোমো কোড':'Have a promo code?'}</div>
              <p className="mt-1 text-[11px] leading-5 text-yellow-100/60">{language==='bn'?'কোড থাকলে দিন':'Apply a code if you have one'}</p>
              <div className="mt-2 flex gap-2">
                <input value={form.couponCode} onChange={e=>{setForm({...form,couponCode:e.target.value.toUpperCase()});setCouponPreview(null);setCouponError('')}} placeholder={language==='bn'?'কোড লিখুন':'ENTER CODE'} className="min-w-0 flex-1 rounded-xl border border-yellow-400/30 bg-[#10243a] px-3 py-2.5 text-xs font-black uppercase text-white outline-none placeholder:text-slate-500 focus:border-yellow-300"/>
                <button type="button" onClick={previewCoupon} disabled={couponBusy} className="rounded-xl bg-[#facc15] px-4 py-3 text-xs font-black text-[#172033] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#fde047] disabled:opacity-50">{couponBusy?(language==='bn'?'যাচাই...':'Checking...'):(language==='bn'?'প্রয়োগ':'Apply')}</button>
              </div>
              {couponError&&<p className="mt-2 text-xs font-bold text-rose-300">{couponError}</p>}
              {couponPreview?.promotion&&<div className="mt-3 rounded-xl border border-green-400/30 bg-green-500/10 p-3 text-xs font-bold text-green-300"><span className="inline-flex items-center gap-2"><Sparkles size={13}/> {couponPreview.promotion.code} applied</span><span className="mt-1 block">You save BDT {Number(couponPreview.discount||0).toFixed(2)}</span></div>}
            </div>

            {shippingQuote?.freeShippingThreshold&&shipping>0&&<div className="mt-3 flex items-center gap-2 rounded-xl border border-sky-400/15 bg-[#164e63]/50 px-3 py-2"><Truck size={18} className="shrink-0 text-sky-300"/><p className="text-[10px] leading-4 text-sky-100/75">Free shipping starts at BDT {shippingQuote.freeShippingThreshold} for this zone.</p></div>}
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-green-400/15 bg-[#164e36]/45 px-3 py-2"><ShieldCheck size={18} className="shrink-0 text-green-300"/><p className="text-[10px] leading-4 text-green-100/75">Your delivery address and payment choice are securely recorded with the order.</p></div>

            <button disabled={busy||(!selected&&!manual)} className="mt-3 w-full rounded-xl bg-gradient-to-r from-[#f97316] to-[#fb923c] py-3 text-sm font-black text-white shadow-xl shadow-orange-950/25 transition hover:-translate-y-0.5 hover:from-[#ea580c] hover:to-[#f97316] disabled:translate-y-0 disabled:opacity-40">{busy?'Placing order...':'Place order securely'}</button>
            <div className="mt-2 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400"><ShieldCheck size={12}/> Secure checkout · Protected account</div>
          </div>
        </aside>
      </form>
    </section>
    <StoreFooter/>
  </main>
}
