'use client';

import { useEffect,useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/navbar';
import StoreFooter from '@/components/store-footer';
import { api } from '@/lib/api';

export default function CmsPublicPage(){
  const {slug}=useParams<{slug:string}>();
  const [page,setPage]=useState<any>(null);
  const [error,setError]=useState(false);

  useEffect(()=>{
    if(!slug)return;
    api.get(`/cms/public/pages/${slug}`).then(r=>setPage(r.data)).catch(()=>setError(true));
  },[slug]);

  return <main className="customer-canvas"><Navbar/>
    <article className="mx-auto max-w-5xl px-5 py-12">
      {error?<div className="rounded-3xl border border-dashed border-rose-400/40 bg-[#203753] p-12 text-center text-white"><h1 className="text-3xl font-black">Page not found</h1></div>:
      !page?<p className="py-20 text-center font-black text-sky-200">Loading page...</p>:
      <>
        <div className="overflow-hidden rounded-[2rem] border border-[#456785] bg-gradient-to-r from-[#1d4ed8] via-[#0369a1] to-[#16a34a] p-7 text-white shadow-xl sm:p-9">
          <p className="text-xs font-black uppercase tracking-[.18em] text-sky-100">E-Commerce Platform · Information</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">{page.title}</h1>
          <p className="mt-3 text-sm text-sky-100">Clear store information, policies and customer guidance.</p>
        </div>
        <div className="mt-7 whitespace-pre-wrap rounded-[1.75rem] border border-[#4b6b89] bg-[#203753] p-6 text-sm leading-8 text-slate-100 shadow-lg sm:p-8">{page.body}</div>
      </>}
    </article>
    <StoreFooter/>
  </main>
}
