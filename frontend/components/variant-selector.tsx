'use client';

import { useMemo } from 'react';

function norm(v:any){return String(v??'').trim()}

export default function VariantSelector({variants,value,onChange,language='en'}:{variants:any[];value:any;onChange:(v:any)=>void;language?:'en'|'bn'}){
  const keys=useMemo(()=>{
    const all=new Set<string>();
    for(const v of variants||[]) Object.keys(v.attributes||{}).forEach(k=>all.add(k));
    return [...all];
  },[variants]);

  const selected=value?.attributes||{};
  if(keys.length===0)return <div className="mt-3 flex flex-wrap gap-2">{(variants||[]).map(v=><button key={v.id} type="button" onClick={()=>onChange(v)} className={`rounded-xl border px-4 py-3 text-sm font-black ${value?.id===v.id?'border-[#1464f4] bg-[#1464f4] text-white':'border-slate-200 bg-white'}`}>{v.sku}</button>)}</div>;

  function choose(key:string,opt:string){
    const target={...selected,[key]:opt};
    const exact=(variants||[]).find(v=>Object.entries(target).every(([k,val])=>norm(v.attributes?.[k])===norm(val)));
    if(exact){onChange(exact);return}
    const compatible=(variants||[]).find(v=>norm(v.attributes?.[key])===opt);
    if(compatible)onChange(compatible);
  }

  return <div className="space-y-5">
    {keys.map(key=>{
      const options=[...new Set((variants||[]).map(v=>norm(v.attributes?.[key])).filter(Boolean))];
      return <div key={key}><div className="flex items-center justify-between"><p className="text-sm font-black">{key}</p><p className="text-xs font-semibold text-slate-400">{selected[key]||''}</p></div><div className="mt-2 flex flex-wrap gap-2">{options.map(opt=>{
        const candidate=(variants||[]).find(v=>norm(v.attributes?.[key])===opt);
        const sold=candidate&&Number(candidate.stock||0)<=0;
        return <button key={opt} type="button" onClick={()=>choose(key,opt)} className={`relative rounded-xl border px-4 py-2.5 text-sm font-black ${norm(selected[key])===opt?'border-[#1464f4] bg-blue-50 text-[#1464f4]':'border-slate-200 bg-white text-slate-700'} ${sold?'opacity-45':''}`}>{opt}{sold&&<span className="absolute inset-x-1 top-1/2 h-px rotate-[-12deg] bg-slate-400"/>}</button>
      })}</div></div>
    })}
  </div>
}
