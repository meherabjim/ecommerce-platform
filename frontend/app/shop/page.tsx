'use client';

import { useEffect,useMemo,useState } from 'react';
import { Search, SlidersHorizontal, Sparkles, Tag, X } from 'lucide-react';
import Navbar from '@/components/navbar';
import StoreFooter from '@/components/store-footer';
import QuickViewModal from '@/components/quick-view-modal';
import StoreProductCard from '@/components/store-product-card';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { localizedCategoryName, localizedProductName } from '@/lib/localized';

export default function ShopPage(){
  const {language}=useI18n();
  const [products,setProducts]=useState<any[]>([]);
  const [categories,setCategories]=useState<any[]>([]);
  const [brands,setBrands]=useState<any[]>([]);
  const [query,setQuery]=useState('');
  const [categoryId,setCategoryId]=useState('');
  const [brandId,setBrandId]=useState('');
  const [sort,setSort]=useState('featured');
  const [stockOnly,setStockOnly]=useState(false);
  const [minPrice,setMinPrice]=useState('');
  const [maxPrice,setMaxPrice]=useState('');
  const [quickView,setQuickView]=useState<any>(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [reloadKey,setReloadKey]=useState(0);

  useEffect(()=>{
    setLoading(true);
    setError('');
    const params=new URLSearchParams(window.location.search);
    setQuery(params.get('q')||'');
    setCategoryId(params.get('category')||'');
    if(params.get('sort')==='new')setSort('new');
    if(params.get('offers')==='1')setSort('offers');
    Promise.allSettled([
      api.get('/catalog/public/products'),
      api.get('/catalog/public/categories'),
      api.get('/catalog/public/brands')
    ]).then(([p,c,b])=>{
      if(p.status==='fulfilled') setProducts(Array.isArray(p.value.data)?p.value.data:[]);
      else setError(language==='bn'?'পণ্য লোড করা যায়নি':'Products could not be loaded');
      if(c.status==='fulfilled') setCategories(Array.isArray(c.value.data)?c.value.data:[]);
      if(b.status==='fulfilled') setBrands(Array.isArray(b.value.data)?b.value.data:[]);
    }).finally(()=>setLoading(false));
  },[language,reloadKey]);

  const filtered=useMemo(()=>{
    const min=minPrice===''?null:Number(minPrice);
    const max=maxPrice===''?null:Number(maxPrice);
    const list=products.filter((p:any)=>{
      const q=query.trim().toLowerCase();
      const variants=Array.isArray(p.variants)?p.variants:[];
      const hasOffer=variants.some((v:any)=>v.salePrice!==null&&v.salePrice!==undefined&&Number(v.salePrice)<Number(v.price));
      if(sort==='offers'&&!hasOffer)return false;
      const search=!q||[p.name,p.nameBn,p.shortDescription,p.shortDescriptionBn,p.description,p.descriptionBn,p.brand?.name,p.category?.name,p.category?.nameBn]
        .filter(Boolean).join(' ').toLowerCase().includes(q);
      const prices=variants.map((v:any)=>Number(v.salePrice||v.price||0)).filter((x:number)=>Number.isFinite(x));
      const price=prices.length?Math.min(...prices):0;
      const inStock=variants.some((v:any)=>Number(v.stock||0)>0);
      const selectedIds=categoryId?[categoryId,...categories.filter((c:any)=>c.parentId===categoryId).map((c:any)=>c.id)]:[];
      return search&&(!categoryId||selectedIds.includes(p.categoryId))&&(!brandId||p.brandId===brandId)&&(!stockOnly||inStock)&&(min===null||price>=min)&&(max===null||price<=max);
    });
    return [...list].sort((a:any,b:any)=>{
      const av=Number(a.variants?.[0]?.salePrice||a.variants?.[0]?.price||0);
      const bv=Number(b.variants?.[0]?.salePrice||b.variants?.[0]?.price||0);
      if(sort==='price-low')return av-bv;
      if(sort==='price-high')return bv-av;
      if(sort==='name')return localizedProductName(language,a).localeCompare(localizedProductName(language,b),language==='bn'?'bn':'en');
      if(sort==='featured')return Number(Boolean(b.featured))-Number(Boolean(a.featured));
      if(sort==='new')return new Date(b.createdAt||0).getTime()-new Date(a.createdAt||0).getTime();
      if(sort==='offers'){
        const discount=(p:any)=>Math.max(0,...(p.variants||[]).map((v:any)=>v.salePrice!==null&&v.salePrice!==undefined&&Number(v.price)>0?1-Number(v.salePrice)/Number(v.price):0));
        return discount(b)-discount(a);
      }
      return 0;
    });
  },[products,categories,query,categoryId,brandId,stockOnly,minPrice,maxPrice,sort,language]);

  const roots=categories.filter((c:any)=>!c.parentId);
  const men=roots.find((c:any)=>String(c.slug).toLowerCase()==='men');
  const women=roots.find((c:any)=>String(c.slug).toLowerCase()==='women');

  function reset(){
    setQuery('');setCategoryId('');setBrandId('');setStockOnly(false);setMinPrice('');setMaxPrice('');setSort('featured');
  }

  return <main className="retail-canvas">
    <Navbar/>

    <section className="border-b border-[#426583] bg-[#19314a]">
      <div className="mx-auto max-w-7xl px-5 py-5">
        <div className="relative overflow-hidden rounded-[1.6rem] bg-gradient-to-r from-[#0d3470] via-[#1464f4] to-[#6f50ee] px-5 py-5 text-white shadow-lg sm:px-7">
          <div className="absolute -right-10 -top-16 h-44 w-44 rounded-full bg-cyan-300/20 blur-3xl"/>
          <div className="absolute -bottom-16 left-1/3 h-36 w-36 rounded-full bg-orange-400/25 blur-3xl"/>

          <div className="relative flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1.5 text-[9px] font-black uppercase tracking-[.16em]">
                  <Sparkles size={12}/>{language==='bn'?'ফ্যাশন শপ':'Fashion shop'}
                </span>
                <span className="rounded-full bg-white/12 px-3 py-1.5 text-[9px] font-black uppercase tracking-[.12em]">
                  {products.length} {language==='bn'?'পণ্য':'products'}
                </span>
              </div>

              <h1 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">
                {language==='bn'?'আপনার পছন্দের স্টাইল খুঁজুন':'Find your next favourite style'}
              </h1>
              <p className="mt-1.5 text-xs leading-5 text-blue-50/85 sm:text-sm">
                {language==='bn'?'Men, Women, brand, price ও live stock দিয়ে দ্রুত পণ্য খুঁজুন।':'Search Men & Women fashion by category, brand, price and live stock.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {men&&<button onClick={()=>setCategoryId(men.id)} className="rounded-xl bg-[#38bdf8] px-4 py-2.5 text-xs font-black text-[#10243a] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#7dd3fc]">
                {language==='bn'?'Men':'Shop Men'}
              </button>}
              {women&&<button onClick={()=>setCategoryId(women.id)} className="rounded-xl bg-[#ff7a1a] px-4 py-2.5 text-xs font-black text-white shadow-sm transition hover:-translate-y-0.5">
                {language==='bn'?'Women':'Shop Women'}
              </button>}
              <button onClick={()=>{setCategoryId('');setSort('offers')}} className="rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-xs font-black text-white backdrop-blur transition hover:bg-white/20">
                <Tag size={13} className="mr-1.5 inline"/>{language==='bn'?'অফার':'Offers'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-5 py-5">
      <div className="sticky top-[154px] z-30 rounded-2xl border border-[#4b6b89] bg-[#203753]/95 p-3 shadow-xl shadow-black/20 backdrop-blur-xl">
        <div className="grid gap-3 lg:grid-cols-[1.2fr_180px_180px_180px_auto]">
          <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4">
            <Search size={17} className="text-slate-400"/>
            <input value={query} onChange={e=>setQuery(e.target.value)} placeholder={language==='bn'?'পণ্য, ব্র্যান্ড বা ক্যাটাগরি খুঁজুন...':'Search product, brand or category...'} className="w-full bg-transparent py-3 text-sm outline-none"/>
            {query&&<button onClick={()=>setQuery('')}><X size={16}/></button>}
          </label>

          <select value={categoryId} onChange={e=>setCategoryId(e.target.value)} className="rounded-xl border border-[#4b6b89] bg-[#10243a] px-4 py-3 text-sm font-semibold text-white">
            <option value="">{language==='bn'?'সব ক্যাটাগরি':'All categories'}</option>
            {roots.map((root:any)=><optgroup key={root.id} label={localizedCategoryName(language,root)}>
              <option value={root.id}>{localizedCategoryName(language,root)}</option>
              {categories.filter((c:any)=>c.parentId===root.id).map((c:any)=><option key={c.id} value={c.id}>— {localizedCategoryName(language,c)}</option>)}
            </optgroup>)}
          </select>

          <select value={brandId} onChange={e=>setBrandId(e.target.value)} className="rounded-xl border border-[#4b6b89] bg-[#10243a] px-4 py-3 text-sm font-semibold text-white">
            <option value="">{language==='bn'?'সব ব্র্যান্ড':'All brands'}</option>
            {brands.map((b:any)=><option key={b.id} value={b.id}>{b.name}</option>)}
          </select>

          <select value={sort} onChange={e=>setSort(e.target.value)} className="rounded-xl border border-[#4b6b89] bg-[#10243a] px-4 py-3 text-sm font-semibold text-white">
            <option value="featured">{language==='bn'?'ফিচার্ড আগে':'Featured first'}</option>
            <option value="price-low">{language==='bn'?'দাম: কম থেকে বেশি':'Price: low to high'}</option>
            <option value="price-high">{language==='bn'?'দাম: বেশি থেকে কম':'Price: high to low'}</option>
            <option value="name">{language==='bn'?'নাম':'Name'}</option>
            <option value="new">{language==='bn'?'নতুন আগে':'Newest'}</option>
            <option value="offers">{language==='bn'?'অফার আগে':'Offers first'}</option>
          </select>

          <button onClick={reset} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#facc15] bg-[#493314] px-4 py-3 text-sm font-black text-yellow-200 transition hover:bg-[#5f4518] hover:text-yellow-100">
            <SlidersHorizontal size={16}/>{language==='bn'?'রিসেট':'Reset'}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
          <div className="flex flex-wrap items-center gap-2">
            <input type="number" min="0" value={minPrice} onChange={e=>setMinPrice(e.target.value)} placeholder={language==='bn'?'সর্বনিম্ন দাম':'Min price'} className="w-32 rounded-xl border border-[#4b6b89] bg-[#10243a] px-3 py-2 text-sm text-white"/>
            <span className="text-slate-300">—</span>
            <input type="number" min="0" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)} placeholder={language==='bn'?'সর্বোচ্চ দাম':'Max price'} className="w-32 rounded-xl border border-[#4b6b89] bg-[#10243a] px-3 py-2 text-sm text-white"/>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#4b6b89] bg-[#294866] px-3 py-2 text-sm font-bold text-white"><input type="checkbox" checked={stockOnly} onChange={e=>setStockOnly(e.target.checked)} className="accent-blue-600"/>{language==='bn'?'শুধু স্টকে আছে':'In stock only'}</label>
          </div>
          <p className="rounded-full bg-[#164e63] px-3 py-1.5 text-xs font-black text-sky-200">{filtered.length} {language==='bn'?'টি পণ্য':'products'}</p>
        </div>
      </div>

      {error&&<div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm font-bold text-rose-700">{error}</div>}

      {loading
        ? <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{Array.from({length:8}).map((_,i)=><div key={i} className="h-[470px] animate-pulse rounded-2xl bg-slate-200/60"/>)}</div>
        : <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p:any)=><StoreProductCard key={p.id} product={p} language={language} onQuickView={setQuickView}/>)}
          </div>
      }

      {!loading&&filtered.length===0&&<div className="mt-10 rounded-3xl border border-dashed border-[#4b6b89] bg-[#203753] p-14 text-center text-white">
        <p className="text-lg font-black">{sort==='offers'?(language==='bn'?'এখন কোনো সক্রিয় অফার নেই':'No active offers right now'):(language==='bn'?'কোনো পণ্য পাওয়া যায়নি':'No products found')}</p>
        <p className="mt-2 text-sm text-slate-500">{language==='bn'?'অন্য কিছু খুঁজুন অথবা ফিল্টার রিসেট করুন।':'Try another search or reset the filters.'}</p>
        <button onClick={reset} className="mt-5 rounded-xl bg-[#1464f4] px-5 py-3 text-sm font-black text-white">{language==='bn'?'সব পণ্য দেখুন':'Show all products'}</button>
      </div>}
    </section>

    <StoreFooter/>
    {quickView&&<QuickViewModal product={quickView} onClose={()=>setQuickView(null)}/>}
  </main>
}
