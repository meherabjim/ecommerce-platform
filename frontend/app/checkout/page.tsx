'use client';
import { FormEvent,useEffect,useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar';
import { api } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';

export default function CheckoutPage(){
  const r=useRouter(),[cart,setCart]=useState<any>(null),[err,setErr]=useState(''),[busy,setBusy]=useState(false);
  const [f,setF]=useState({
    customerName:'',phone:'',email:'',addressLine:'',city:'Dhaka',postalCode:'',
    notes:'',paymentMode:'COD',couponCode:''
  });

  useEffect(()=>{
    const u=getStoredUser();
    if(!u){r.replace('/login');return;}
    setF(x=>({...x,customerName:u.name,email:u.email}));
    api.get('/cart').then(x=>{if(!x.data.items.length)r.replace('/cart');else setCart(x.data)})
  },[r]);

  async function submit(e:FormEvent){
    e.preventDefault();setBusy(true);setErr('');
    try{
      const x=await api.post('/checkout',f);
      r.push(`/account/orders/${x.data.id}`)
    }catch(e:any){
      const m=e?.response?.data?.message;
      setErr(Array.isArray(m)?m.join(', '):m||'Checkout failed.')
    }finally{setBusy(false)}
  }

  if(!cart)return <main className="grid min-h-screen place-items-center">Preparing checkout...</main>;
  const shipping=cart.subtotal>=3000?0:120;

  return <main className="min-h-screen bg-[#f7f7f5] text-slate-950">
    <Navbar/>
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="text-4xl font-black">Checkout</h1>
      <form onSubmit={submit} className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="rounded-3xl border bg-white p-6">
          <h2 className="text-xl font-black">Delivery information</h2>
          {err&&<p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{err}</p>}
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {[
              ['customerName','Full name'],['phone','Phone'],['email','Email'],
              ['city','City'],['postalCode','Postal code']
            ].map(([k,l])=><label key={k} className="text-sm font-bold">{l}
              <input className="mt-2 w-full rounded-xl border p-3 font-normal text-slate-950"
                value={(f as any)[k]} onChange={e=>setF({...f,[k]:e.target.value})}
                required={!['email','postalCode'].includes(k)}/>
            </label>)}
          </div>
          <label className="mt-4 block text-sm font-bold">Full address
            <textarea className="mt-2 min-h-24 w-full rounded-xl border p-3 font-normal text-slate-950"
              value={f.addressLine} onChange={e=>setF({...f,addressLine:e.target.value})} required/>
          </label>
          <label className="mt-4 block text-sm font-bold">Order note
            <textarea className="mt-2 min-h-20 w-full rounded-xl border p-3 font-normal text-slate-950"
              value={f.notes} onChange={e=>setF({...f,notes:e.target.value})}/>
          </label>

          <h2 className="mt-7 text-xl font-black">Coupon</h2>
          <input className="mt-3 w-full rounded-xl border p-3 uppercase" placeholder="Enter coupon code"
            value={f.couponCode} onChange={e=>setF({...f,couponCode:e.target.value.toUpperCase()})}/>

          <h2 className="mt-7 text-xl font-black">Payment</h2>
          <div className="mt-3 space-y-2">
            {[['COD','Cash on delivery'],['FULL_ONLINE','Online payment (gateway-ready)'],['PARTIAL','Partial payment (gateway-ready)']]
              .map(([v,l])=><label key={v} className="flex items-center gap-3 rounded-xl border p-4">
                <input type="radio" name="payment" value={v} checked={f.paymentMode===v}
                  onChange={e=>setF({...f,paymentMode:e.target.value})}/>
                <span className="font-semibold">{l}</span>
              </label>)}
          </div>
        </section>

        <aside className="h-fit rounded-3xl bg-slate-950 p-6 text-white">
          <h2 className="text-xl font-black">Order summary</h2>
          <div className="mt-5 space-y-3 text-sm">
            {cart.items.map((x:any)=><div key={x.id} className="flex justify-between gap-3">
              <span>{x.productName} x {x.quantity}</span><span>BDT {x.lineTotal}</span>
            </div>)}
          </div>
          <div className="mt-5 border-t border-white/10 pt-4 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>BDT {cart.subtotal}</span></div>
            <div className="mt-2 flex justify-between"><span>Shipping</span><span>BDT {shipping}</span></div>
            <p className="mt-3 text-xs text-white/50">Coupon discount is validated when you place the order.</p>
          </div>
          <button disabled={busy} className="mt-6 w-full rounded-xl bg-white py-3.5 font-bold text-slate-950 disabled:opacity-50">
            {busy?'Placing order...':'Place order'}
          </button>
        </aside>
      </form>
    </div>
  </main>
}
