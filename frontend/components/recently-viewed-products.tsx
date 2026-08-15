'use client';

import { useEffect, useState } from 'react';
import StoreProductCard from '@/components/store-product-card';
import { api } from '@/lib/api';
import { getRecentlyViewed, pruneRecentlyViewed } from '@/lib/recently-viewed';

export default function RecentlyViewedProducts({
  language='en',
  excludeId
}:{language?:'en'|'bn';excludeId?:string}){
  const [items,setItems]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    let alive=true;

    async function load(){
      try{
        const saved=getRecentlyViewed();
        if(!saved.length){
          if(alive)setItems([]);
          return;
        }

        // Use the live public catalog as source of truth.
        // If Admin deactivates/removes a product, it automatically disappears here too.
        const res=await api.get('/catalog/public/products');
        const active=Array.isArray(res.data)?res.data:[];
        const activeById=new Map(active.map((p:any)=>[p.id,p]));
        const activeIds=active.map((p:any)=>p.id);

        pruneRecentlyViewed(activeIds);

        const current=saved
          .map(x=>activeById.get(x.id))
          .filter(Boolean)
          .filter((x:any)=>x.id!==excludeId)
          .slice(0,5);

        if(alive)setItems(current);
      }catch{
        // Fail safe: do not resurrect stale cached product snapshots.
        if(alive)setItems([]);
      }finally{
        if(alive)setLoading(false);
      }
    }

    load();
    const reload=()=>load();
    window.addEventListener('recently-viewed-updated',reload);
    return ()=>{
      alive=false;
      window.removeEventListener('recently-viewed-updated',reload);
    };
  },[excludeId]);

  if(loading||items.length===0)return null;

  return <section className="mx-auto max-w-7xl px-5 py-10">
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="text-xs font-black uppercase tracking-[.16em] text-slate-400">
          {language==='bn'?'আবার দেখুন':'Continue browsing'}
        </p>
        <h2 className="mt-2 text-2xl font-black">
          {language==='bn'?'সম্প্রতি দেখা পণ্য':'Recently viewed'}
        </h2>
      </div>
    </div>

    <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {items.map((p:any)=>
        <StoreProductCard key={p.id} product={p} language={language}/>
      )}
    </div>
  </section>;
}
