'use client';
import { useEffect,useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/navbar';
import { api } from '@/lib/api';

export default function Home(){
  const [products,setProducts]=useState<any[]>([]);
  const [promos,setPromos]=useState<any[]>([]);

  useEffect(()=>{
    Promise.all([
      api.get('/catalog/public/products'),
      api.get('/promotions/public/featured')
    ]).then(([p,c])=>{setProducts(p.data);setPromos(c.data)})
  },[]);

  const featured=products.filter(x=>x.featured).slice(0,4);
  const shown=featured.length?featured:products.slice(0,4);

  return <main className="min-h-screen bg-[#f7f7f5] text-slate-950">
    <Navbar/>
    <section className="mx-auto max-w-7xl px-5 py-16">
      <div className="rounded-[2.5rem] bg-slate-950 px-7 py-16 text-white md:px-12">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">Neuro Commerce</p>
        <h1 className="mt-4 max-w-3xl text-5xl font-black leading-tight md:text-7xl">A complete shopping experience, built end to end.</h1>
        <p className="mt-5 max-w-2xl text-lg text-white/60">Browse live catalog inventory, secure your cart, checkout and track fulfillment.</p>
        <Link href="/shop" className="mt-8 inline-block rounded-xl bg-white px-6 py-3.5 font-bold text-slate-950">Shop products</Link>
      </div>

      {promos.length>0&&<section className="mt-8 grid gap-4 md:grid-cols-2">
        {promos.slice(0,2).map(x=><div key={x.id} className="rounded-3xl border bg-white p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Featured offer</p>
          <h2 className="mt-2 text-2xl font-black">{x.name}</h2>
          <p className="mt-3 text-lg font-bold">Use code <span className="rounded-lg bg-slate-100 px-2 py-1 font-mono">{x.code}</span></p>
          <p className="mt-2 text-sm text-slate-500">{x.type==='PERCENT'?`${x.value}% off`:`BDT ${x.value} off`} | Minimum BDT {x.minOrder}</p>
        </div>)}
      </section>}

      <section className="mt-14">
        <div className="flex items-end justify-between">
          <div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Merchandising</p><h2 className="mt-2 text-3xl font-black">Featured products</h2></div>
          <Link href="/shop" className="text-sm font-bold underline">View all</Link>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {shown.map(p=>{
            const v=p.variants?.[0];
            const image=v?.imageUrl||p.primaryImageUrl;
            return <Link key={p.id} href={`/shop/${p.slug}`} className="overflow-hidden rounded-3xl border bg-white">
              {image?<img src={image} alt={p.name} className="aspect-[4/3] w-full object-cover"/>:<div className="grid aspect-[4/3] place-items-center bg-slate-100 text-5xl font-black text-slate-300">{p.name.slice(0,1)}</div>}
              <div className="p-5"><p className="text-xs font-bold uppercase text-slate-400">{p.category?.name}</p><h3 className="mt-1 font-black">{p.name}</h3><p className="mt-4 text-lg font-black">{v?`BDT ${v.salePrice||v.price}`:'View options'}</p></div>
            </Link>
          })}
        </div>
      </section>
    </section>
  </main>
}
