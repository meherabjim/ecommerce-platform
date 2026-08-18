'use client';

import { useEffect,useMemo,useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, PackageCheck, RefreshCw, ShieldCheck, Truck } from 'lucide-react';
import Navbar from '@/components/navbar';
import StoreFooter from '@/components/store-footer';
import StoreProductCard from '@/components/store-product-card';
import RecentlyViewedProducts from '@/components/recently-viewed-products';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { localizedCategoryName } from '@/lib/localized';



import ContactFloatingActions from '@/components/contact-floating-actions';
function HeroSection({
  section,cfg,language,topCats,slides,slide,heroIndex,setHeroIndex,rotationSeconds,bg,L,C,loading
}:any){
  useEffect(()=>{
    if(slides.length<=1)return;
    const timer=window.setInterval(
      ()=>setHeroIndex((i:number)=>(i+1)%slides.length),
      rotationSeconds*1000
    );
    return ()=>window.clearInterval(timer);
  },[slides.length,rotationSeconds,setHeroIndex]);

  useEffect(()=>{
    if(heroIndex>=slides.length && slides.length)setHeroIndex(0);
  },[slides.length,heroIndex,setHeroIndex]);

  const title=slide
    ? (language==='bn'?(slide.titleBn||slide.title):(slide.title||section.title))
    : L(section,'title');

  const subtitle=slide
    ? (language==='bn'?(slide.subtitleBn||slide.subtitle):(slide.subtitle||section.subtitle))
    : L(section,'subtitle');

  const eyebrow=slide
    ? (language==='bn'?(slide.eyebrowBn||slide.eyebrow):(slide.eyebrow||cfg.eyebrow))
    : C(cfg,'eyebrow','TODAY’S DEAL','আজকের অফার');

  const ctaLabel=slide
    ? (language==='bn'?(slide.ctaLabelBn||slide.ctaLabel||'এখনই শপ করুন'):(slide.ctaLabel||'Shop now'))
    : C(cfg,'primaryCtaLabel','Shop now','এখনই শপ করুন');

  const ctaUrl=slide?.ctaUrl||cfg.primaryCtaUrl||'/shop';

  function prev(){
    if(!slides.length)return;
    setHeroIndex((i:number)=>(i-1+slides.length)%slides.length);
  }
  function next(){
    if(!slides.length)return;
    setHeroIndex((i:number)=>(i+1)%slides.length);
  }

  return <section className="relative mx-auto max-w-7xl px-4 pt-4 sm:px-5 sm:pt-5 lg:pr-[64px]">
    <ContactFloatingActions />
    
    <div className="grid gap-4 lg:grid-cols-[200px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="home-category-panel hidden min-h-[340px] overflow-hidden rounded-[2rem] border border-[#4b6b89] bg-[#203753] shadow-xl shadow-black/20 lg:block">
        <div className="home-category-head bg-gradient-to-r from-[#1d4ed8] via-[#2563eb] to-[#38bdf8] px-4 py-2.5 text-xs font-black text-white">
          ☰ {language==='bn'?'সব ক্যাটাগরি':'All categories'}
        </div>

        {topCats.length
          ? topCats.slice(0,9).map((c:any)=>
              <Link
                key={c.id}
                href={`/shop?category=${c.id}`}
                className="home-category-row flex items-center justify-between border-b border-[#3e5d7a] bg-[#223f5c] px-4 py-2.5 text-xs font-bold text-slate-100 transition hover:bg-[#2c5072] hover:text-yellow-300"
              >
                <span>{localizedCategoryName(language,c)}</span>
                <span>›</span>
              </Link>
            )
          : loading
            ? <div className="space-y-2.5 p-4">
                {[1,2,3,4,5,6].map((x)=>
                  <div
                    key={x}
                    className="h-8 animate-pulse rounded-lg bg-white/10"
                  />
                )}
              </div>
            : <div className="p-5 text-xs font-semibold text-slate-400">
                {language==='bn'?'ক্যাটাগরি পাওয়া যায়নি':'Categories unavailable'}
              </div>
        }
      </aside>

      <div className="group relative min-h-[290px] lg:min-h-[320px] overflow-hidden rounded-[2rem] border border-[#4b6b89] bg-gradient-to-br from-[#173f70] via-[#203753] to-[#294866] shadow-xl shadow-black/20">
        {bg&&<>
          <img
            key={bg}
            src={bg}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#071a38]/90 via-[#123a78]/68 to-[#123a78]/18"/>
        </>}

        <div className="relative z-10 flex min-h-[290px] items-center p-5 sm:p-6 lg:min-h-[320px] lg:p-6">
          {loading ? (
            <div className="w-full max-w-[560px] animate-pulse">
              <div className="h-6 w-28 rounded-full bg-white/15" />
              <div className="mt-5 h-9 w-[82%] rounded-xl bg-white/15" />
              <div className="mt-3 h-9 w-[62%] rounded-xl bg-white/15" />
              <div className="mt-5 h-4 w-[88%] rounded bg-white/10" />
              <div className="mt-2 h-4 w-[72%] rounded bg-white/10" />
              <div className="mt-6 h-10 w-28 rounded-xl bg-white/15" />
            </div>
          ) : (
          <div className="max-w-[560px]">
            <span className={`w-fit rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[.16em] ${bg?'bg-white/15 text-white backdrop-blur':'bg-[#164e63] text-sky-200'}`}>
              {eyebrow||C(cfg,'eyebrow','TODAY’S DEAL','আজকের অফার')}
            </span>

            <h1 className={`mt-4 text-3xl font-black leading-[1.06] tracking-[-.035em] sm:text-3xl lg:text-3xl xl:text-4xl ${bg?'text-white':'text-white'}`}>
              {title}
            </h1>

            {subtitle&&<p className={`mt-4 max-w-xl text-sm leading-6 sm:text-base sm:leading-7 ${bg?'text-white/85':'text-slate-200'}`}>
              {subtitle}
            </p>}

            <div className="mt-5 flex flex-wrap gap-3 sm:mt-6">
              <Link
                href={ctaUrl}
                className="inline-flex items-center gap-2 rounded-xl bg-[#1464f4] px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-blue-950/10"
              >
                {ctaLabel}<ArrowRight size={16}/>
              </Link>

              {!slide&&cfg.secondaryCtaUrl&&
                <Link
                  href={cfg.secondaryCtaUrl}
                  className={`rounded-xl border px-4 py-2.5 text-xs font-black ${bg?'border-white/30 bg-white/10 text-white backdrop-blur':'border-sky-400/40 bg-[#203753] text-sky-200'}`}
                >
                  {C(cfg,'secondaryCtaLabel','Learn more','আরও জানুন')}
                </Link>
              }
            </div>
          </div>
          )}
        </div>

        {!loading && slides.length>1&&<>
          <button
            onClick={prev}
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-sky-300/50 bg-[#18314b]/90 text-sky-200 opacity-100 shadow-xl backdrop-blur transition hover:bg-[#2563eb] hover:text-white sm:opacity-0 sm:group-hover:opacity-100"
          >
            <ChevronLeft size={20}/>
          </button>
          <button
            onClick={next}
            aria-label="Next slide"
            className="absolute right-4 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-sky-300/50 bg-[#18314b]/90 text-sky-200 opacity-100 shadow-xl backdrop-blur transition hover:bg-[#2563eb] hover:text-white sm:opacity-0 sm:group-hover:opacity-100"
          >
            <ChevronRight size={20}/>
          </button>

          <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2 rounded-full bg-slate-950/25 px-3 py-2 backdrop-blur">
            {slides.map((x:any,i:number)=>
              <button
                key={x.id||i}
                onClick={()=>setHeroIndex(i)}
                aria-label={`Go to slide ${i+1}`}
                className={`h-2 rounded-full transition-all ${i===heroIndex%slides.length?'w-7 bg-white':'w-2 bg-white/55'}`}
              />
            )}
          </div>
        </>}
      </div>
    </div>
  </section>
}

export default function Home(){
  const {language}=useI18n();
  const [products,setProducts]=useState<any[]>([]);
  const [promos,setPromos]=useState<any[]>([]);
  const [categories,setCategories]=useState<any[]>([]);
  const [cms,setCms]=useState<any>({settings:{},sections:[],blocks:[],pages:[]});
  const [heroIndex,setHeroIndex]=useState(0);
  const [homeLoading,setHomeLoading]=useState(true);

  useEffect(()=>{
    let alive=true;

    async function loadHomepage(){
      const [p,pr,c,m]=await Promise.allSettled([
        api.get('/catalog/public/products'),
        api.get('/promotions/public/featured'),
        api.get('/catalog/public/categories'),
        api.get('/cms/public/home')
      ]);

      if(!alive)return;

      if(p.status==='fulfilled') setProducts(Array.isArray(p.value.data)?p.value.data:[]);

      if(pr.status==='fulfilled') setPromos(Array.isArray(pr.value.data)?pr.value.data:[]);

      if(c.status==='fulfilled') setCategories(Array.isArray(c.value.data)?c.value.data:[]);

      if(m.status==='fulfilled') setCms(m.value.data||{settings:{},sections:[],blocks:[],pages:[]});

      setHomeLoading(false);
    }

    loadHomepage();
    return ()=>{alive=false};
  },[]);

  const active=useMemo(()=>products.filter(p=>p.status==='ACTIVE'),[products]);
  const configuredSections=(cms.sections||[]).length?cms.sections:[
    {id:'hero',type:'HERO',title:'Everything you need, in one modern store.',subtitle:'Discover products, checkout securely and track delivery from one connected account.',config:{titleBn:'আপনার প্রয়োজনের সবকিছু, এক আধুনিক স্টোরে।',subtitleBn:'পণ্য খুঁজুন, নিরাপদে চেকআউট করুন এবং এক অ্যাকাউন্ট থেকে ডেলিভারি ট্র্যাক করুন।',primaryCtaLabel:'Shop now',primaryCtaLabelBn:'এখনই শপ করুন',primaryCtaUrl:'/shop'}},
    {id:'trust',type:'TRUST_STRIP',config:{}},
    {id:'feat',type:'FEATURED_PRODUCTS',title:'Featured products',config:{titleBn:'ফিচার্ড পণ্য',limit:8}},
  ];
  const hasProductSection=configuredSections.some((s:any)=>['FEATURED_PRODUCTS','PRODUCT_COLLECTION'].includes(s.type));
  const sections=hasProductSection?configuredSections:[
    ...configuredSections,
    {id:'auto-featured-products',type:'FEATURED_PRODUCTS',title:'Featured products',subtitle:'Popular right now',config:{titleBn:'ফিচার্ড পণ্য',subtitleBn:'এখন জনপ্রিয়',limit:8}}
  ];

  const L=(s:any,key:'title'|'subtitle')=>language==='bn'?(s.config?.[`${key}Bn`]||s[key]||''):(s[key]||'');
  const C=(cfg:any,key:string,en:string,bn:string)=>language==='bn'?(cfg?.[`${key}Bn`]||bn):(cfg?.[key]||en);
  const normalizedCategories=useMemo(
    ()=>categories.map((c:any)=>c?.dataValues||c).filter(Boolean),
    [categories]
  );
  const topCats=normalizedCategories.filter((c:any)=>!c.parentId);

  function productImage(p:any){
    if(p?.primaryImageUrl) return p.primaryImageUrl;
    const media=Array.isArray(p?.media)?p.media:[];
    return media.find((m:any)=>m?.type==='image'&&m?.url)?.url
      || p?.variants?.find((v:any)=>v?.imageUrl)?.imageUrl
      || '';
  }

  function buildHeroSlides(section:any){
    const cfg=section?.config||{};
    const manual=(Array.isArray(cfg.slides)?cfg.slides:[])
      .filter((x:any)=>x && x.enabled!==false && x.imageUrl)
      .map((x:any,i:number)=>({
        id:x.id||`manual-${i}`,
        imageUrl:x.imageUrl,
        eyebrow:x.eyebrow||cfg.eyebrow||'',
        eyebrowBn:x.eyebrowBn||cfg.eyebrowBn||'',
        title:x.title||section.title||'',
        titleBn:x.titleBn||cfg.titleBn||'',
        subtitle:x.subtitle||section.subtitle||'',
        subtitleBn:x.subtitleBn||cfg.subtitleBn||'',
        ctaLabel:x.ctaLabel||cfg.primaryCtaLabel||'Shop now',
        ctaLabelBn:x.ctaLabelBn||cfg.primaryCtaLabelBn||'এখনই শপ করুন',
        ctaUrl:x.ctaUrl||cfg.primaryCtaUrl||'/shop'
      }));

    if(manual.length) return manual;

    // Admin configured no manual slides: use newest ACTIVE product images dynamically.
    return active
      .filter((p:any)=>Boolean(productImage(p)))
      .slice(0,6)
      .map((p:any)=>({
        id:`product-${p.id}`,
        imageUrl:productImage(p),
        eyebrow:cfg.eyebrow||'NEW ARRIVAL',
        eyebrowBn:cfg.eyebrowBn||'নতুন পণ্য',
        title:p.name||section.title||'',
        titleBn:p.nameBn||p.name||cfg.titleBn||'',
        subtitle:p.shortDescription||p.description||section.subtitle||'',
        subtitleBn:p.shortDescriptionBn||p.descriptionBn||p.shortDescription||p.description||cfg.subtitleBn||'',
        ctaLabel:cfg.primaryCtaLabel||'Shop now',
        ctaLabelBn:cfg.primaryCtaLabelBn||'এখনই শপ করুন',
        ctaUrl:cfg.primaryCtaUrl||'/shop'
      }));
  }

  function productList(section:any){
    const cfg=section.config||{};
    const ids=cfg.productIds||[];
    if(ids.length){
      const map=new Map(active.map(p=>[p.id,p]));
      return ids.map((id:string)=>map.get(id)).filter(Boolean);
    }

    const source=String(cfg.source||(
      section.type==='FEATURED_PRODUCTS'?'FEATURED':'NEWEST'
    )).toUpperCase();

    if(source==='FEATURED'){
      const featured=active.filter((p:any)=>p.featured);
      return featured.length?featured:active;
    }

    if(source==='OFFERS'){
      const offered=active.filter((p:any)=>
        (p.variants||[]).some((v:any)=>
          v.salePrice!==null && v.salePrice!==undefined &&
          Number(v.salePrice)<Number(v.price)
        )
      );
      return offered;
    }

    // API is already newest-first.
    return active;
  }

  function render(section:any){
    const cfg=section.config||{};
    if(section.type==='HERO'){
      const slides=buildHeroSlides(section);
      const rotationSeconds=Math.min(12,Math.max(4,Number(cfg.rotationSeconds||5.5)));
      const slide=slides.length?slides[heroIndex%slides.length]:null;
      const bg=slide?.imageUrl||cfg.backgroundImage||cfg.imageUrl||'';

      return <HeroSection
        key={section.id}
        section={section}
        cfg={cfg}
        language={language}
        topCats={topCats}
        slides={slides}
        slide={slide}
        heroIndex={heroIndex}
        setHeroIndex={setHeroIndex}
        rotationSeconds={rotationSeconds}
        bg={bg}
        L={L}
        C={C}
        loading={homeLoading}
      />
    }

    if(section.type==='TRUST_STRIP'){
      const items=language==='bn'?[['দ্রুত ডেলিভারি','এলাকাভিত্তিক ডেলিভারি',Truck],['নিরাপদ কেনাকাটা','সুরক্ষিত অ্যাকাউন্ট',ShieldCheck],['সহজ রিটার্ন','রিটার্ন স্ট্যাটাস দেখুন',RefreshCw],['লাইভ স্টক','ভ্যারিয়েন্টভিত্তিক স্টক',PackageCheck]]:[['Fast delivery','Zone-based shipping',Truck],['Secure shopping','Protected account',ShieldCheck],['Easy returns','Track return status',RefreshCw],['Live stock','Variant availability',PackageCheck]];
      return <section key={section.id} className="retail-section"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{items.map(([a,b,I]:any,i:number)=><div key={a} className={`flex items-center gap-3 rounded-[1.2rem] border p-3.5 text-white shadow-lg shadow-black/10 ${i===0?'border-blue-400/60 bg-gradient-to-r from-[#1d4ed8] to-[#2563eb]':i===1?'border-green-400/60 bg-gradient-to-r from-[#166534] to-[#16a34a]':i===2?'border-orange-400/60 bg-gradient-to-r from-[#c2410c] to-[#f97316]':'border-violet-400/60 bg-gradient-to-r from-[#5b21b6] to-[#7c3aed]'}`}><span className="grid h-11 w-11 place-items-center rounded-full bg-black/15 text-white ring-1 ring-white/20"><I size={18}/></span><div><p className="font-black text-white">{a}</p><p className="text-xs text-white/80">{b}</p></div></div>)}</div></section>
    }
    if(section.type==='CATEGORIES'){ return null; }

    if(['FEATURED_PRODUCTS','PRODUCT_COLLECTION'].includes(section.type)){
      const list=productList(section).slice(0,Number(cfg.limit||8));
      return <section key={section.id} className="retail-section"><div className="retail-panel-soft overflow-hidden p-5 sm:p-7"><div className="flex flex-wrap items-end justify-between gap-4"><div><span className="retail-eyebrow">{L(section,'subtitle')||(language==='bn'?'আপনার জন্য':'Curated for you')}</span><h2 className="retail-heading">{L(section,'title')||(language==='bn'?'পছন্দের পণ্য':'Featured products')}</h2></div><Link href={cfg.ctaUrl||'/shop'} className="retail-btn">{C(cfg,'ctaLabel','Shop all','সব পণ্য')} <ArrowRight size={15}/></Link></div><div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{list.map((p:any)=><StoreProductCard key={p.id} product={p} language={language}/>)}</div></div></section>
    }

    if(section.type==='PROMOTIONS'&&promos.length){
      return <section key={section.id} className="retail-section"><div className="retail-dark overflow-hidden rounded-[2rem] p-6 sm:p-8"><div className="flex flex-wrap items-end justify-between gap-4"><div><span className="inline-flex rounded-full bg-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-[.18em] text-white/80">{language==='bn'?'কুপন ও অফার':'Coupons & offers'}</span><h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{L(section,'title')||(language==='bn'?'চলমান অফার':'Current offers')}</h2></div><Link href="/shop?offers=1" className="retail-btn-accent">{language==='bn'?'সব অফার দেখুন':'View all offers'} <ArrowRight size={15}/></Link></div><div className="mt-6 grid gap-4 md:grid-cols-2">{promos.slice(0,Number(cfg.limit||4)).map((x:any)=><div key={x.id} className="rounded-[1.4rem] border border-white/10 bg-white/10 p-5 backdrop-blur"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#ffb347]">{language==='bn'?'কুপন':'Coupon'} · {x.code}</p><h3 className="mt-2 text-xl font-black">{x.name}</h3><p className="mt-2 text-sm text-white/70">{x.type==='PERCENT'?`${x.value}% off`:`BDT ${x.value} off`}{Number(x.minOrder||0)>0?` · Min BDT ${Number(x.minOrder)}`:''}</p></div><span className="rounded-full bg-[#ff6542] px-3 py-2 text-xs font-black">{x.type==='PERCENT'?`${Number(x.value)}%`:`৳${Number(x.value)}`}</span></div><Link href="/shop?offers=1" className="mt-5 inline-flex items-center gap-2 text-sm font-black text-white">{language==='bn'?'এখনই কিনুন':'Shop now'} <ArrowRight size={14}/></Link></div>)}</div></div></section>
    }

    if(section.type==='BANNER'){
      const image=cfg.imageUrl||cfg.backgroundImage;
      return <section key={section.id} className="mx-auto max-w-7xl px-5 py-8"><div className="relative overflow-hidden rounded-[2rem] bg-[#123a78] text-white">{image&&<img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35"/>}<div className="relative z-10 max-w-3xl p-8 sm:p-12"><p className="text-xs font-black uppercase tracking-[.16em] text-blue-200">{C(cfg,'eyebrow','SPECIAL CAMPAIGN','বিশেষ ক্যাম্পেইন')}</p><h2 className="mt-3 text-3xl font-black sm:text-5xl">{L(section,'title')}</h2><p className="mt-4 text-white/75">{L(section,'subtitle')}</p><Link href={cfg.primaryCtaUrl||'/shop'} className="mt-6 inline-block rounded-xl bg-[#f36b21] px-5 py-3 font-black">{C(cfg,'primaryCtaLabel','Explore now','এখনই দেখুন')}</Link></div></div></section>
    }
    return null;
  }

  return <main className="retail-canvas"><Navbar/>{sections.map(render)}<RecentlyViewedProducts language={language}/><StoreFooter/></main>
}


