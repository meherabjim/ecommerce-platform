'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, ChevronDown, CreditCard, Heart, LayoutDashboard, LogIn, LogOut, MapPin, Megaphone, Menu, Package, PackageSearch, RotateCcw, Search, ShieldCheck, ShoppingCart, Truck, UserPlus, UserRound, X } from 'lucide-react';
import { api } from '@/lib/api';
import { AuthUser, clearAuth, getStoredUser, isStaffRole } from '@/lib/auth';
import { useStoreConfig } from '@/components/store-config-provider';
import { Language, useI18n } from '@/lib/i18n';
import { localizedCategoryName, localizedProductName } from '@/lib/localized';
import { getGuestCart } from '@/lib/guest-cart';
import AuthModal from '@/components/auth-modal';

export default function Navbar(){
  const router=useRouter();
  const config=useStoreConfig();
  const {language,setLanguage,t}=useI18n();
  const identity=config['store.identity']||{};
  const commerce=config['store.commerce']||{};
  const [user,setUser]=useState<AuthUser|null>(null);
  const [ready,setReady]=useState(false);
  const [unread,setUnread]=useState(0);
  const [notificationItems,setNotificationItems]=useState<any[]>([]);
  const [notificationOpen,setNotificationOpen]=useState(false);
  const [open,setOpen]=useState(false);
  const [categoryOpen,setCategoryOpen]=useState(false);
  const [categories,setCategories]=useState<any[]>([]);
  const [products,setProducts]=useState<any[]>([]);
  const [featuredPromos,setFeaturedPromos]=useState<any[]>([]);
  const [query,setQuery]=useState('');
  const [searchFocused,setSearchFocused]=useState(false);
  const [cartCount,setCartCount]=useState(0);
  const [accountOpen,setAccountOpen]=useState(false);
  const [announcementIndex,setAnnouncementIndex]=useState(0);
  const [authMode,setAuthMode]=useState<'login'|'register'|null>(null);
  const [authNext,setAuthNext]=useState<string|null>(null);

  const storeName=identity.storeName||'E-Commerce Platform';
  const tagline=identity.tagline||'Smart shopping, made simple';
  const logoUrl=identity.logoUrl||'';
  const configuredAnnouncement=commerce.freeShippingMessage||'Fast delivery • Secure checkout • Easy returns';
  const announcementItems=useMemo(()=>{
    const promoMessages=featuredPromos.map((promo:any)=>{
      const value=Number(promo.value||0);
      const discount=promo.type==='PERCENT'
        ? `${value}% OFF`
        : `${language==='bn'?'৳':'BDT '}${value} OFF`;
      const minimum=Number(promo.minOrder||0)>0
        ? (language==='bn'?` • ন্যূনতম ৳${Number(promo.minOrder)}`:` • Min BDT ${Number(promo.minOrder)}`)
        : '';
      return language==='bn'
        ? `🎁 কোড ${promo.code} ব্যবহার করুন — ${discount}${minimum}`
        : `🎁 Use code ${promo.code} — ${discount}${minimum}`;
    });
    const saleProducts=products.filter((p:any)=>(p.variants||[]).some((v:any)=>v.salePrice!==null&&v.salePrice!==undefined&&Number(v.salePrice)<Number(v.price))).slice(0,3);
    const saleMessages=saleProducts.map((p:any)=>{
      const v=(p.variants||[]).find((x:any)=>x.salePrice!==null&&x.salePrice!==undefined&&Number(x.salePrice)<Number(x.price));
      const percent=v?Math.round((1-Number(v.salePrice)/Number(v.price))*100):0;
      return language==='bn'
        ? `🔥 ${localizedProductName(language,p)}-এ ${percent}% ছাড় চলছে`
        : `🔥 ${percent}% off ${localizedProductName(language,p)} — limited offer`;
    });
    const fallback=language==='bn'
      ? ['✨ নতুন Men & Women fashion এখন লাইভ','🚚 দ্রুত ডেলিভারি • নিরাপদ চেকআউট','🎁 নির্বাচিত ফ্যাশন অফার দেখতে Offers দেখুন']
      : ['✨ New Men & Women fashion is live','🚚 Fast delivery • Secure checkout','🎁 Explore selected fashion offers in Offers'];
    return promoMessages.length
      ? [...promoMessages,...saleMessages,...fallback]
      : saleMessages.length
        ? [...saleMessages,...fallback]
        : [configuredAnnouncement,...fallback];
  },[featuredPromos,products,language,configuredAnnouncement]);
  const supportPhone=identity.supportPhone||identity.phone||'';

  useEffect(()=>{
    const current=getStoredUser();
    const refreshCartCount=()=>{
      const now=getStoredUser();
      if(!now){setCartCount(getGuestCart().reduce((sum,x)=>sum+x.quantity,0));return;}
      api.get('/cart').then(r=>setCartCount(Number(r.data?.itemCount||0))).catch(()=>setCartCount(0));
    };
    refreshCartCount();
    window.addEventListener('guest-cart-updated',refreshCartCount as EventListener);
    window.addEventListener('cart-updated',refreshCartCount as EventListener);
    setUser(current);setReady(true);
    Promise.all([api.get('/catalog/public/categories'),api.get('/catalog/public/products'),api.get('/promotions/public/active')]).then(([c,p,pr])=>{
      setCategories(c.data||[]);
      setProducts(p.data||[]);
      setFeaturedPromos(pr.data||[]);
      if(current?.role==='CUSTOMER'){
        const live=Array.isArray(pr.data)?pr.data:[];
        live.slice(0,3).forEach((promo:any)=>{
          api.post('/notifications/promotion',{
            promotionId:promo.id,
            code:promo.code,
            name:promo.name,
            type:promo.type,
            value:promo.value,
            minOrder:promo.minOrder,
          }).catch(()=>{});
        });
      }
    }).catch(()=>{});
    if(current){
      api.get('/notifications').then(r=>{
        const rows=Array.isArray(r.data)?r.data:[];
        setNotificationItems(rows);
        setUnread(rows.filter((x:any)=>!x.isRead).length);
      }).catch(()=>{});
    }
    return ()=>{window.removeEventListener('guest-cart-updated',refreshCartCount as EventListener);window.removeEventListener('cart-updated',refreshCartCount as EventListener)};
  },[]);

  useEffect(()=>{
    const openAuth=(event:Event)=>{
      const detail=(event as CustomEvent<{mode?:'login'|'register';next?:string}>).detail||{};
      setAuthNext(detail.next||null);
      setAuthMode(detail.mode||'login');
    };
    window.addEventListener('neuro-auth-open',openAuth as EventListener);

    const params=new URLSearchParams(window.location.search);
    const requested=params.get('auth');
    if(requested==='login'||requested==='register'){
      setAuthMode(requested);
      setAuthNext(params.get('next'));
    }
    return ()=>window.removeEventListener('neuro-auth-open',openAuth as EventListener);
  },[]);

  useEffect(()=>{
    if(announcementItems.length<2)return;
    const timer=window.setInterval(()=>setAnnouncementIndex(i=>(i+1)%announcementItems.length),4200);
    return ()=>window.clearInterval(timer);
  },[announcementItems.length]);

  const accountHref=useMemo(()=>{
    if(!user)return '/login';
    if(isStaffRole(user.role))return '/admin';
    if(user.role==='DELIVERY_AGENT')return '/delivery';
    return '/account';
  },[user]);

  const suggestions=useMemo(()=>{
    const q=query.trim().toLowerCase();
    if(q.length<2)return [];
    return products.filter((p:any)=>[p.name,p.nameBn,p.brand?.name,p.category?.name,p.category?.nameBn].filter(Boolean).join(' ').toLowerCase().includes(q)).slice(0,6);
  },[products,query]);

  async function refreshNotifications(){
    try{
      const r=await api.get('/notifications');
      const rows=Array.isArray(r.data)?r.data:[];
      setNotificationItems(rows);
      setUnread(rows.filter((x:any)=>!x.isRead).length);
    }catch{}
  }
  async function openNotification(item:any){
    try{
      if(!item.isRead) await api.patch(`/notifications/${item.id}/read`);
    }catch{}
    setNotificationOpen(false);
    await refreshNotifications();
    if(item.referenceId){
      if(['ORDER','PAYMENT','DELIVERY'].includes(item.type)) router.push(`/account/orders/${item.referenceId}`);
      else if(item.type==='RETURN') router.push('/account/returns');
    }
  }
  async function markAllNotifications(){
    try{await api.patch('/notifications/read-all')}catch{}
    await refreshNotifications();
  }
  function logout(){clearAuth();setUser(null);setOpen(false);setAccountOpen(false);setNotificationOpen(false);setUnread(0);setNotificationItems([]);router.replace('/');router.refresh();}
  function search(e:FormEvent){e.preventDefault();const q=query.trim();router.push(q?`/shop?q=${encodeURIComponent(q)}`:'/shop');setOpen(false);}

  return <>
    <div className="sticky top-0 z-[70] border-b border-[#284a6a] bg-[#0d1b2a] text-white shadow-sm">
      <div className="mx-auto flex min-h-11 max-w-7xl items-center gap-3 px-4 sm:px-5">
        <div className="flex min-w-0 flex-1 items-center gap-2.5 overflow-hidden">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/15"><Megaphone size={14}/></span>
          <div className="min-w-0 flex-1 overflow-hidden">
            <p key={`${announcementIndex}-${language}`} className="truncate text-xs font-bold sm:text-[13px]">
              {announcementItems[announcementIndex%Math.max(announcementItems.length,1)]||configuredAnnouncement}
            </p>
          </div>
          <Link href="/shop?offers=1" className="hidden shrink-0 rounded-full bg-[#facc15] px-4 py-2 text-[11px] font-black uppercase tracking-[.08em] text-[#172033] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#fde047] md:inline">
            {language==='bn'?'অফার দেখুন':'View offers'}
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link href="/track-order" className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-black transition hover:bg-white/20">
            <Truck size={13}/><span className="hidden sm:inline">{t('track')}</span><span className="sm:hidden">{language==='bn'?'ট্র্যাক':'Track'}</span>
          </Link>
          <span className="hidden h-5 w-px bg-white/25 sm:block"/>
          <span className="hidden text-[11px] font-semibold text-white/75 sm:inline">{t('language')}:</span>
          <div className="flex rounded-lg bg-white/10 p-0.5">
            {(['bn','en'] as Language[]).map(code=><button key={code} onClick={()=>setLanguage(code)} className={`rounded-md px-2.5 py-1.5 text-[10px] font-black transition ${language===code?'bg-[#38bdf8] text-[#10243a] shadow-sm':'text-white hover:bg-[#294866]'}`}>{code==='bn'?'বাংলা':'ENG'}</button>)}
          </div>
        </div>
      </div>
    </div>

    <header className="sticky top-11 z-50 border-b border-[#456785] bg-[#18314b]/98 text-white shadow-[0_10px_26px_rgba(0,0,0,.22)] backdrop-blur-xl">
      <div className="mx-auto flex min-h-[76px] max-w-7xl items-center gap-3 px-4 sm:px-5">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          {logoUrl?<img src={logoUrl} alt={storeName} className="h-11 w-11 rounded-xl object-cover"/>:<span className="grid h-11 w-11 place-items-center rounded-full bg-[#ff9900] text-lg font-black text-[#17202b]">{storeName.charAt(0).toUpperCase()}</span>}
          <div className="hidden sm:block"><p className="text-lg font-black leading-none text-white">{storeName}</p><p className="mt-1 text-[9px] font-bold uppercase tracking-[.16em] text-sky-300">{tagline}</p></div>
        </Link>

        <div className="relative hidden lg:block">
          <button onClick={()=>setCategoryOpen(v=>!v)} className="flex h-12 items-center gap-2 rounded-full border border-[#4b6b89] bg-[#223f5c] px-5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:border-[#38bdf8] hover:text-[#7dd3fc]">{t('categories')}<ChevronDown size={15}/></button>
          {categoryOpen&&<div className="absolute left-0 top-13 w-[min(720px,90vw)] overflow-hidden rounded-2xl border border-[#4b6b89] bg-[#203753] p-4 text-white shadow-2xl"><div className="flex items-center justify-between border-b border-slate-100 pb-3"><div><p className="text-xs font-black uppercase tracking-[.14em] text-blue-600">{language==='bn'?'ক্যাটাগরি':'Categories'}</p><p className="mt-1 text-sm text-slate-500">{language==='bn'?'দ্রুত আপনার প্রয়োজনের পণ্য খুঁজুন':'Browse the catalog faster'}</p></div><Link href="/shop" onClick={()=>setCategoryOpen(false)} className="text-xs font-black text-[#1464f4]">{t('allCategories')} →</Link></div><div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{(categories.some((c:any)=>!c.parentId&&c.featuredInNav)?categories.filter((c:any)=>!c.parentId&&c.featuredInNav):categories.filter((c:any)=>!c.parentId)).map((root:any)=>{const kids=categories.filter((c:any)=>c.parentId===root.id);return <div key={root.id} className="rounded-xl border border-[#4b6b89] bg-[#28435f] p-3"><Link href={`/shop?category=${encodeURIComponent(root.id)}`} onClick={()=>setCategoryOpen(false)} className="font-black text-white hover:text-sky-300">{localizedCategoryName(language,root)}</Link>{kids.length>0&&<div className="mt-2 space-y-1">{kids.slice(0,6).map((child:any)=><Link key={child.id} href={`/shop?category=${encodeURIComponent(child.id)}`} onClick={()=>setCategoryOpen(false)} className="block text-xs font-semibold text-slate-300 hover:text-sky-300">{localizedCategoryName(language,child)}</Link>)}</div>}</div>})}</div></div>}
        </div>

        <form onSubmit={search} className="relative ml-auto hidden min-w-0 max-w-xl flex-1 md:flex">
          <div className="flex w-full overflow-hidden rounded-full border border-[#4b6b89] bg-[#10243a] shadow-sm focus-within:border-[#38bdf8] focus-within:ring-4 focus-within:ring-sky-400/10">
            <input value={query} onFocus={()=>setSearchFocused(true)} onBlur={()=>setTimeout(()=>setSearchFocused(false),150)} onChange={e=>setQuery(e.target.value)} className="min-w-0 flex-1 bg-transparent px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-400" placeholder={t('search')}/>
            <button className="grid w-12 place-items-center bg-[#f97316] text-white hover:bg-[#ea580c]"><Search size={19}/></button>
          </div>
          {searchFocused&&suggestions.length>0&&<div className="absolute left-0 right-0 top-[50px] overflow-hidden rounded-2xl border border-[#4b6b89] bg-[#203753] p-2 text-white shadow-2xl">{suggestions.map((p:any)=>{const image=p.variants?.[0]?.imageUrl||(Array.isArray(p.media)?p.media.find((m:any)=>m.type==='image')?.url:null)||p.primaryImageUrl;return <Link key={p.id} href={`/shop/${p.slug}`} onMouseDown={e=>e.preventDefault()} onClick={()=>{setSearchFocused(false);setQuery('')}} className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-[#294866]">{image?<img src={image} alt="" className="h-11 w-11 rounded-lg object-cover"/>:<span className="grid h-11 w-11 place-items-center rounded-lg bg-slate-100 text-slate-400"><PackageSearch size={18}/></span>}<div className="min-w-0"><p className="truncate text-sm font-black text-slate-800">{localizedProductName(language,p)}</p><p className="mt-0.5 truncate text-[11px] text-slate-400">{p.category?localizedCategoryName(language,p.category):''}{p.brand?.name?` · ${p.brand.name}`:''}</p></div></Link>})}<button type="submit" className="mt-1 w-full rounded-xl bg-slate-50 px-3 py-2.5 text-left text-xs font-black text-[#1464f4]">{language==='bn'?`"${query}" এর সব ফলাফল দেখুন`:`See all results for "${query}"`} →</button></div>}
        </form>

        <nav className="hidden items-center gap-4 text-sm font-bold text-slate-600 xl:flex">
          <Link href="/new-arrivals" className="text-slate-100 hover:text-sky-300">{t('newArrivals')}</Link>
        </nav>

        <div className="flex items-center gap-1.5">
          {ready&&user?.role==='CUSTOMER'&&<div className="relative hidden sm:block">
            <button
              type="button"
              title={t('notifications')}
              onClick={()=>{setNotificationOpen(v=>!v);setAccountOpen(false);if(!notificationOpen)refreshNotifications()}}
              className="relative grid h-10 w-10 place-items-center rounded-xl text-slate-100 hover:bg-[#294866] hover:text-sky-300"
            >
              <Bell size={20}/>
              {unread>0&&<span className="absolute right-0 top-0 grid min-h-4 min-w-4 place-items-center rounded-full bg-[#f36b21] px-1 text-[9px] font-black text-white">{unread>9?'9+':unread}</span>}
            </button>
            {notificationOpen&&<div className="absolute right-0 top-12 z-[90] w-[390px] overflow-hidden rounded-2xl border border-[#4b6b89] bg-[#172d45] text-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#355675] px-4 py-3">
                <div><p className="text-sm font-black">{language==='bn'?'নোটিফিকেশন':'Notifications'}</p><p className="mt-0.5 text-[10px] text-slate-400">{unread} {language==='bn'?'টি অপঠিত':'unread'}</p></div>
                {unread>0&&<button onClick={markAllNotifications} className="rounded-lg bg-[#164e63] px-2.5 py-1.5 text-[10px] font-black text-sky-200 hover:bg-[#0e7490]">{language==='bn'?'সব পড়া':'Mark all read'}</button>}
              </div>
              <div className="max-h-[430px] overflow-y-auto p-2">
                {notificationItems.slice(0,7).map((item:any)=><button key={item.id} onClick={()=>openNotification(item)} className={`mb-1 flex w-full gap-3 rounded-xl p-3 text-left transition last:mb-0 ${item.isRead?'bg-[#203753] hover:bg-[#28435f]':'border border-blue-400/30 bg-[#173f70] hover:bg-[#1d4ed8]/35'}`}>
                  <span className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl ${item.isRead?'bg-[#294866] text-slate-300':'bg-[#2563eb] text-white'}`}><Bell size={15}/></span>
                  <span className="min-w-0 flex-1"><span className="flex items-start justify-between gap-2"><span className="truncate text-xs font-black text-white">{item.title}</span>{!item.isRead&&<span className="rounded-full bg-[#f97316] px-1.5 py-0.5 text-[8px] font-black">NEW</span>}</span><span className="mt-1 block line-clamp-2 text-[11px] leading-5 text-slate-300">{item.message}</span></span>
                </button>)}
                {!notificationItems.length&&<div className="p-8 text-center text-xs font-bold text-slate-400">{language==='bn'?'কোনো নোটিফিকেশন নেই':'No notifications yet'}</div>}
              </div>
              <Link href="/account/notifications" onClick={()=>setNotificationOpen(false)} className="block border-t border-[#355675] bg-[#203753] px-4 py-3 text-center text-xs font-black text-sky-300 hover:bg-[#28435f]">{language==='bn'?'সব নোটিফিকেশন দেখুন':'View all notifications'} →</Link>
            </div>}
          </div>}
          {ready&&!user&&<div className="hidden items-center gap-1 sm:flex"><button onClick={()=>setAuthMode('login')} className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-xs font-black text-white hover:bg-[#264d6f] hover:text-sky-300"><LogIn size={17}/>{language==='bn'?'সাইন ইন':'Sign in'}</button><button onClick={()=>setAuthMode('register')} className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#2563eb] px-4 text-xs font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#1d4ed8]"><UserPlus size={17}/>{language==='bn'?'অ্যাকাউন্ট তৈরি':'Create account'}</button></div>}
          {ready&&user&&<div className="relative"><button onClick={()=>{setAccountOpen(v=>!v);setNotificationOpen(false)}} className="flex h-10 items-center gap-2 rounded-xl px-2 text-white hover:bg-[#294866] hover:text-sky-300" title={t('account')}><UserRound size={21}/><span className="hidden max-w-28 truncate text-xs font-black 2xl:block">{user.name}</span><ChevronDown size={14} className="hidden sm:block"/></button>{accountOpen&&<div className="absolute right-0 top-12 w-64 overflow-hidden rounded-2xl border border-[#4b6b89] bg-[#203753] p-2 text-white shadow-2xl"><div className="border-b border-slate-100 px-3 py-3"><p className="truncate text-sm font-black text-white">{user.name}</p><p className="mt-1 truncate text-[11px] text-slate-400">{user.email}</p></div>{user.role==='CUSTOMER'&&<><Link onClick={()=>setAccountOpen(false)} href="/account" className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold hover:bg-blue-50"><LayoutDashboard size={16}/>{language==='bn'?'ওভারভিউ':'Overview'}</Link><Link onClick={()=>setAccountOpen(false)} href="/account/orders" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold hover:bg-[#294866]"><Package size={16}/>{language==='bn'?'আমার অর্ডার':'My orders'}</Link><Link onClick={()=>setAccountOpen(false)} href="/account/wishlist" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold hover:bg-[#294866]"><Heart size={16}/>Wishlist</Link><Link onClick={()=>setAccountOpen(false)} href="/account/returns" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold hover:bg-[#294866]"><RotateCcw size={16}/>Returns & refunds</Link><Link onClick={()=>setAccountOpen(false)} href="/account/profile" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold hover:bg-[#294866]"><UserRound size={16}/>Profile</Link><Link onClick={()=>setAccountOpen(false)} href="/account/addresses" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold hover:bg-[#294866]"><MapPin size={16}/>Addresses</Link><Link onClick={()=>setAccountOpen(false)} href="/account/payments" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold hover:bg-[#294866]"><CreditCard size={16}/>Payments</Link><Link onClick={()=>setAccountOpen(false)} href="/account/security" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold hover:bg-[#294866]"><ShieldCheck size={16}/>Security</Link></>}{isStaffRole(user.role)&&<Link onClick={()=>setAccountOpen(false)} href="/admin" className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold hover:bg-blue-50"><LayoutDashboard size={16}/>{language==='bn'?'অ্যাডমিন কনসোল':'Admin Console'}</Link>}{user.role==='DELIVERY_AGENT'&&<Link onClick={()=>setAccountOpen(false)} href="/delivery" className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold hover:bg-blue-50"><Package size={16}/>{language==='bn'?'ডেলিভারি ড্যাশবোর্ড':'Delivery dashboard'}</Link>}<button onClick={logout} className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-rose-600 hover:bg-rose-50"><LogOut size={16}/>{language==='bn'?'লগআউট':'Sign out'}</button></div>}</div>}
          <Link href="/cart" title={t('cart')} className="relative grid h-11 w-11 place-items-center rounded-full bg-[#f97316] text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#ea580c]"><ShoppingCart size={20}/>{cartCount>0&&<span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-[#1464f4] px-1 text-[10px] font-black text-white">{cartCount>99?'99+':cartCount}</span>}</Link>
          <button onClick={()=>setOpen(v=>!v)} className="grid h-10 w-10 place-items-center rounded-xl border border-[#4b6b89] bg-[#203753] text-white lg:hidden">{open?<X size={20}/>:<Menu size={20}/>}</button>
        </div>
      </div>

      <div className="hidden border-t border-[#456785] bg-[#1c3954] lg:block">
        <div className="mx-auto flex max-w-7xl items-center gap-7 px-5 py-2.5 text-[13px] font-black text-slate-600">
          <Link href="/" className="text-slate-100 hover:text-sky-300">{t('home')}</Link>
          <Link href="/shop" className="text-slate-100 hover:text-sky-300">{t('shop')}</Link>
          <Link href="/new-arrivals" className="text-slate-100 hover:text-sky-300">{t('newArrivals')}</Link>
          <Link href="/pages/about" className="text-slate-100 hover:text-sky-300">{t('about')}</Link>
          <Link href="/pages/contact" className="text-slate-100 hover:text-sky-300">{t('contact')}</Link>
        </div>
      </div>

      {open&&<div className="border-t border-[#456785] bg-[#1c3954] px-4 py-4 text-white lg:hidden">
        <form onSubmit={search} className="mb-3 flex overflow-hidden rounded-xl border-2 border-[#1464f4]"><input value={query} onChange={e=>setQuery(e.target.value)} className="min-w-0 flex-1 px-3 py-2.5 text-sm outline-none" placeholder={t('search')}/><button className="w-11 bg-[#1464f4] text-white"><Search className="mx-auto" size={18}/></button></form>
        <div className="grid gap-1 text-sm font-bold text-slate-700">
          <Link onClick={()=>setOpen(false)} href="/">{t('home')}</Link>
          <Link onClick={()=>setOpen(false)} href="/shop" className="rounded-lg py-2">{t('shop')}</Link>
          {categories.slice(0,8).map(c=><Link key={c.id} onClick={()=>setOpen(false)} href={`/shop?category=${c.id}`} className="rounded-lg py-2 text-slate-500">{localizedCategoryName(language,c)}</Link>)}
          <Link onClick={()=>setOpen(false)} href="/track-order" className="rounded-lg py-2">{t('track')}</Link>
          {!user&&<><button onClick={()=>{setOpen(false);setAuthMode('login')}} className="rounded-lg py-2 text-left">{language==='bn'?'সাইন ইন':'Sign in'}</button><button onClick={()=>{setOpen(false);setAuthMode('register')}} className="rounded-lg bg-[#2563eb] px-3 py-2 text-left text-white">{language==='bn'?'অ্যাকাউন্ট তৈরি করুন':'Create account'}</button></>}
          {user?.role==='CUSTOMER'&&<><Link onClick={()=>setOpen(false)} href="/account" className="rounded-lg py-2">{language==='bn'?'আমার অ্যাকাউন্ট':'My account'}</Link><Link onClick={()=>setOpen(false)} href="/account/orders" className="rounded-lg py-2">{language==='bn'?'আমার অর্ডার':'My orders'}</Link></>}
          {user&&isStaffRole(user.role)&&<Link onClick={()=>setOpen(false)} href="/admin" className="rounded-lg py-2">{language==='bn'?'অ্যাডমিন কনসোল':'Admin Console'}</Link>}
          {user?.role==='DELIVERY_AGENT'&&<Link onClick={()=>setOpen(false)} href="/delivery" className="rounded-lg py-2">{language==='bn'?'ডেলিভারি ড্যাশবোর্ড':'Delivery dashboard'}</Link>}
          {user&&<button onClick={logout} className="rounded-lg py-2 text-left text-rose-600">{language==='bn'?'লগআউট':'Sign out'}</button>}
        </div>
      </div>}
    </header>
    {authMode&&<AuthModal initialMode={authMode} onClose={()=>{setAuthMode(null);setAuthNext(null)}} onAuthenticated={(u:any)=>{setUser(u);setAuthMode(null);setReady(true);const next=authNext;setAuthNext(null);if(next)router.push(next);else router.refresh();}}/>}
  </>
}
