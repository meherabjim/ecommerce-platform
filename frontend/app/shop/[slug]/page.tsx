'use client';
import { useEffect,useState } from 'react';
import { useParams,useRouter } from 'next/navigation';
import Navbar from '@/components/navbar';
import { api } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';

export default function ProductDetails(){
  const params=useParams<{slug:string}>(),r=useRouter();
  const [p,setP]=useState<any>(null),[v,setV]=useState<any>(null),[qty,setQty]=useState(1),[msg,setMsg]=useState('');
  const [reviews,setReviews]=useState<any>({average:0,count:0,reviews:[]});
  useEffect(()=>{
    api.get(`/catalog/public/products/${params.slug}`).then(async x=>{
      setP(x.data);setV(x.data.variants?.[0]||null);
      setReviews((await api.get(`/reviews/public/product/${x.data.id}`)).data)
    })
  },[params.slug]);

  async function add(){
    if(!getStoredUser()){r.push('/login');return;}
    if(!v){setMsg('Please select a variant.');return;}
    if(v.stock<=0){setMsg('This item is out of stock.');return;}
    if(qty>v.stock){setMsg(`Only ${v.stock} item(s) available.`);return;}
    try{await api.post('/cart/items',{variantId:v.id,quantity:qty});setMsg('Added to cart.')}
    catch(e:any){setMsg(e?.response?.data?.message||'Could not add to cart.')}
  }

  if(!p)return <main className="grid min-h-screen place-items-center">Loading...</main>;
  const image=v?.imageUrl||p.primaryImageUrl;

  return <main className="min-h-screen bg-[#f7f7f5] text-slate-950">
    <Navbar/>
    <section className="mx-auto grid max-w-7xl gap-10 px-5 py-14 lg:grid-cols-2">
      <div className="overflow-hidden rounded-[2rem] bg-slate-200">
        {image?<img src={image} alt={p.name} className="aspect-square h-full w-full object-cover"/>:<div className="grid aspect-square place-items-center text-8xl font-black text-slate-300">{p.name.slice(0,1)}</div>}
      </div>
      <div className="flex flex-col justify-center">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{p.category?.name} {p.brand?.name?`| ${p.brand.name}`:''}</p>
        <h1 className="mt-3 text-5xl font-black">{p.name}</h1>
        <p className="mt-3 font-bold">★ {reviews.average} <span className="font-normal text-slate-500">({reviews.count} reviews)</span></p>
        <p className="mt-5 text-lg text-slate-600">{p.description||p.shortDescription}</p>

        <div className="mt-8"><p className="text-sm font-bold">Choose variant</p>
          <div className="mt-3 flex flex-wrap gap-2">{p.variants?.map((x:any)=><button key={x.id} onClick={()=>{setV(x);setQty(1);setMsg('')}} className={`rounded-xl border px-4 py-3 text-sm font-bold ${v?.id===x.id?'bg-slate-950 text-white':'bg-white'}`}>{Object.values(x.attributes||{}).join(' / ')||x.sku}</button>)}</div>
        </div>

        {v&&<div className="mt-8 rounded-3xl border bg-white p-6">
          <div className="flex justify-between"><p className="text-3xl font-black">BDT {v.salePrice||v.price}</p><p className="text-sm font-bold text-slate-600">{v.stock} in stock</p></div>
          <div className="mt-5 flex gap-3">
            <input type="number" min="1" max={Math.max(1,v.stock)} value={qty} onChange={e=>setQty(Math.min(v.stock,Math.max(1,Number(e.target.value)||1)))} className="w-24 rounded-xl border px-3"/>
            <button type="button" onClick={async()=>{try{await api.post(`/wishlist/${p.id}`);alert('Added to wishlist.')}catch(e:any){alert(e?.response?.data?.message||'Please login first.')}}} className="mb-3 w-full rounded-xl border border-slate-950 px-5 py-3 font-bold">♡ Add to wishlist</button><button onClick={add} disabled={v.stock<=0} className="flex-1 rounded-xl bg-slate-950 py-3.5 font-bold text-white disabled:opacity-40">Add to cart</button>
          </div>
          {msg&&<p className="mt-3 text-sm font-semibold">{msg}</p>}
          <p className="mt-4 font-mono text-xs text-slate-500">SKU {v.sku} | Barcode {v.barcode}</p>
        </div>}
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-5 pb-16">
      <div className="grid gap-6">
        <div className="rounded-3xl border bg-white p-6">
          <h2 className="text-2xl font-black">Customer reviews</h2>
          <div className="mt-5 space-y-4">
            {reviews.reviews.map((x:any)=><div key={x.id} className="rounded-2xl bg-slate-50 p-4"><p className="font-black">{'★'.repeat(x.rating)}{'☆'.repeat(5-x.rating)}</p><p className="mt-2 text-slate-600">{x.comment||'No comment'}</p></div>)}
            {!reviews.count&&<p className="text-slate-500">No approved reviews yet.</p>}
          </div>
        </div>
      </div>
    </section>
  </main>
}





