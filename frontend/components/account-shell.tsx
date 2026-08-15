'use client';

import type { LucideIcon } from 'lucide-react';

import Link from 'next/link';
import { usePathname,useRouter } from 'next/navigation';
import { useEffect,useMemo,useState } from 'react';
import {
  Bell, ChevronRight, Heart, Home, LogOut, MapPin, Package,
  ReceiptText, RotateCcw, ShieldCheck, ShoppingBag, UserRound,
  WalletCards
} from 'lucide-react';
import { clearAuth,getStoredUser } from '@/lib/auth';
import { authRedirectUrl } from '@/lib/customer-auth';
import { useI18n } from '@/lib/i18n';

type AccountLink = readonly [
  href: string,
  en: string,
  bn: string,
  Icon: LucideIcon
];

type AccountGroup = {
  en: string;
  bn: string;
  links: AccountLink[];
};

const groups: AccountGroup[] = [
  {
    en:'Shopping',bn:'শপিং',
    links:[
      ['/account','Overview','ওভারভিউ',Home],
      ['/account/orders','My orders','আমার অর্ডার',ReceiptText],
      ['/account/wishlist','Wishlist','পছন্দের তালিকা',Heart],
      ['/account/returns','Returns & refunds','রিটার্ন ও রিফান্ড',RotateCcw],
    ]
  },
  {
    en:'Account',bn:'অ্যাকাউন্ট',
    links:[
      ['/account/profile','Profile','প্রোফাইল',UserRound],
      ['/account/addresses','Addresses','ঠিকানা',MapPin],
      ['/account/payments','Payments','পেমেন্ট',WalletCards],
    ]
  },
  {
    en:'Preferences',bn:'পছন্দ ও নিরাপত্তা',
    links:[
      ['/account/notifications','Notifications','নোটিফিকেশন',Bell],
      ['/account/security','Security','নিরাপত্তা',ShieldCheck],
    ]
  },
];

export default function AccountShell({children}:{children:React.ReactNode}){
  const pathname=usePathname();
  const router=useRouter();
  const {language}=useI18n();
  const [user,setUser]=useState<any>(null);

  useEffect(()=>{
    const current=getStoredUser();
    if(!current){
      router.replace(authRedirectUrl(pathname));
      return;
    }
    if(current.role!=='CUSTOMER'){
      router.replace(current.role==='DELIVERY_AGENT'?'/delivery':'/admin');
      return;
    }
    setUser(current);
  },[pathname,router]);

  const initials=useMemo(()=>{
    const value=String(user?.name||'N').trim();
    return value.split(/\s+/).slice(0,2).map((x:string)=>x[0]).join('').toUpperCase();
  },[user]);

  function active(href:string){
    return pathname===href || (href==='/account/orders' && pathname.startsWith('/account/orders/'));
  }

  function logout(){
    clearAuth();
    router.replace('/');
    router.refresh();
  }

  const allLinks: AccountLink[] = groups.flatMap(g => g.links);

  return (
    <div className="relative mx-auto max-w-7xl px-4 py-5 sm:px-5 lg:py-8">
      <div className="mb-4 overflow-x-auto rounded-2xl border border-[#28496f] bg-[#0f223d] p-2 shadow-lg lg:hidden">
        <div className="flex min-w-max gap-2">
          {allLinks.map(([href,en,bn,Icon])=>(
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-black transition ${
                active(href)?'bg-[#2563eb] text-white':'text-slate-200 hover:bg-[#294866] hover:text-sky-200'
              }`}
            >
              <Icon size={15}/>
              {language==='bn'?bn:en}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[270px_minmax(0,1fr)]">
        <aside className="hidden h-fit lg:sticky lg:top-28 lg:block">
          <div className="overflow-hidden rounded-[1.6rem] border border-[#28496f] bg-[#0f223d] shadow-[0_18px_50px_rgba(0,0,0,.28)]">
            <div className="bg-gradient-to-br from-[#1a2b40] via-[#233b58] to-[#2f557f] p-5 text-white">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/15 text-sm font-black ring-1 ring-white/20">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-black">{user?.name||(language==='bn'?'আমার অ্যাকাউন্ট':'My account')}</p>
                  <p className="mt-1 truncate text-[11px] text-white/70">{user?.email||'Neuro Commerce customer'}</p>
                </div>
              </div>

              <Link
                href="/shop"
                className="mt-5 flex items-center justify-between rounded-xl bg-white/12 px-3.5 py-3 text-xs font-black ring-1 ring-white/15 transition hover:bg-white/20"
              >
                <span className="flex items-center gap-2"><ShoppingBag size={15}/>{language==='bn'?'শপিং চালিয়ে যান':'Continue shopping'}</span>
                <ChevronRight size={15}/>
              </Link>
            </div>

            <div className="p-3">
              {groups.map(group=>(
                <div key={group.en} className="mb-4 last:mb-0">
                  <p className="px-3 pb-2 pt-1 text-[10px] font-black uppercase tracking-[.16em] text-slate-400">
                    {language==='bn'?group.bn:group.en}
                  </p>
                  <div className="space-y-1">
                    {group.links.map(([href,en,bn,Icon])=>(
                      <Link
                        key={href}
                        href={href}
                        className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-black transition ${
                          active(href)
                            ? 'bg-[#17365e] text-[#ffb44c]'
                            : 'text-slate-300 hover:bg-[#132a4a] hover:text-white'
                        }`}
                      >
                        <span className={`grid h-8 w-8 place-items-center rounded-lg ${
                          active(href)?'bg-[#2563eb] text-white':'bg-[#294866] text-slate-200'
                        }`}>
                          <Icon size={15}/>
                        </span>
                        <span className="flex-1">{language==='bn'?bn:en}</span>
                        {active(href)&&<span className="h-1.5 w-1.5 rounded-full bg-[#f36b21]"/>}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}

              <button
                onClick={logout}
                className="mt-2 flex w-full items-center gap-3 rounded-xl border border-[#6d3341] bg-[#351923] px-3 py-3 text-sm font-black text-rose-300 transition hover:bg-[#4a202c]"
              >
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#17365e]"><LogOut size={15}/></span>
                {language==='bn'?'লগআউট':'Sign out'}
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-[#28496f] bg-gradient-to-br from-[#102641] to-[#0a1930] p-4">
            <div className="flex gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#ff8a00] text-[#071426]"><Package size={16}/></span>
              <div>
                <p className="text-xs font-black">{language==='bn'?'অর্ডার সাহায্য দরকার?':'Need order help?'}</p>
                <p className="mt-1 text-[11px] leading-5 text-slate-500">
                  {language==='bn'?'অর্ডার পেইজ থেকে ট্র্যাকিং, রিটার্ন ও ইনভয়েস দেখুন।':'Track delivery, returns and invoices from your orders.'}
                </p>
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
