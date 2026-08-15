'use client';

import Link from 'next/link';
import { ArrowUpRight, Clock3, Mail, MapPin, MessageCircle, Phone, ShieldCheck } from 'lucide-react';
import { useStoreConfig } from '@/components/store-config-provider';
import { useI18n } from '@/lib/i18n';

function normalizeBangladeshPhone(value:string){
  const digits=(value||'').replace(/\D/g,'');
  if(digits.startsWith('880'))return digits;
  if(digits.startsWith('0'))return `88${digits}`;
  return digits;
}

export default function StoreFooter(){
  const config=useStoreConfig();
  const {language,t}=useI18n();
  const identity=config['store.identity']||{};
  const footer=config['store.footer']||{};
  const contact=config['store.contact']||{};
  const storeName=identity.storeName||'E-Commerce Platform';
  const about=footer.about||'Modern fashion, dependable delivery and a connected shopping experience.';
  const copyright=footer.copyright||`© 2026 ${storeName}. All rights reserved.`;
  const phone=contact.phone||identity.supportPhone||'01764305948';
  const email=contact.email||identity.supportEmail||'meherabjim2022@gmail.com';
  const address=contact.address||'Vatara, Dhaka';
  const facebookUrl=contact.facebookUrl||'https://www.facebook.com/';
  const messengerUrl=contact.messengerUrl||'https://www.messenger.com/';
  const whatsappDigits=normalizeBangladeshPhone(contact.whatsappNumber||phone);
  const supportHours=contact.supportHours||'Every day, 10:00 AM – 10:00 PM';

  return <footer className="mt-20 bg-[#0e1621] text-white">
    <div className="border-b border-white/10 bg-gradient-to-r from-[#1d4ed8] via-[#0369a1] to-[#16a34a]">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-7 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[.18em] text-white/70">{language==='bn'?'সহায়তা দরকার?':'Need help?'}</p>
          <h2 className="mt-1 text-2xl font-black">{language==='bn'?'অর্ডার, ডেলিভারি বা রিটার্ন—আমরা আছি।':'Orders, delivery or returns — we’re here.'}</h2>
        </div>
        <Link href="/track-order" className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-[#101827]">
          {language==='bn'?'অর্ডার ট্র্যাক করুন':'Track an order'}<ArrowUpRight size={16}/>
        </Link>
      </div>
    </div>

    <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-2 xl:grid-cols-[1.35fr_.8fr_.9fr_1.1fr]">
      <div>
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-xl font-black text-[#101827]">{storeName.charAt(0).toUpperCase()}</span>
          <div><p className="text-xl font-black">{storeName}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-[.16em] text-white/45">{identity.tagline||'Smart shopping, easy living'}</p></div>
        </div>
        <p className="mt-5 max-w-sm text-sm leading-7 text-white/60">{about}</p>
        <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-2 text-xs font-black text-emerald-300"><ShieldCheck size={15}/>{language==='bn'?'নিরাপদ চেকআউট':'Secure checkout'}</div>
        <div className="mt-6 flex gap-2">
          <a href={facebookUrl} target="_blank" rel="noreferrer" aria-label="Facebook" className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-sm font-black transition hover:bg-[#2f6fed]">f</a>
          <a href={messengerUrl} target="_blank" rel="noreferrer" aria-label="Messenger" className="grid h-10 w-10 place-items-center rounded-full bg-white/10 transition hover:bg-[#2f6fed]"><MessageCircle size={17}/></a>
          <a href={`https://wa.me/${whatsappDigits}`} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="grid h-10 w-10 place-items-center rounded-full bg-white/10 transition hover:bg-[#21b573]"><MessageCircle size={17}/></a>
        </div>
      </div>

      <div>
        <p className="text-xs font-black uppercase tracking-[.16em] text-[#ffb347]">{t('quickLinks')}</p>
        <div className="mt-5 space-y-3 text-sm font-semibold text-white/65">
          <Link className="block hover:text-white" href="/shop">Shop all</Link>
          <Link className="block hover:text-white" href="/new-arrivals">New arrivals</Link>
          <Link className="block hover:text-white" href="/shop?offers=1">Offers</Link>
          <Link className="block hover:text-white" href="/pages/about">About us</Link>
          <Link className="block hover:text-white" href="/pages/contact">Contact</Link>
        </div>
      </div>

      <div>
        <p className="text-xs font-black uppercase tracking-[.16em] text-[#9bbcff]">{t('customerService')}</p>
        <div className="mt-5 space-y-3 text-sm font-semibold text-white/65">
          <Link className="block hover:text-white" href="/account/orders">My orders</Link>
          <Link className="block hover:text-white" href="/account/returns">Returns & refunds</Link>
          <Link className="block hover:text-white" href="/account/addresses">Delivery addresses</Link>
          <Link className="block hover:text-white" href="/pages/privacy">Privacy</Link>
          <Link className="block hover:text-white" href="/pages/terms">Terms</Link>
        </div>
      </div>

      <div>
        <p className="text-xs font-black uppercase tracking-[.16em] text-[#ff8e77]">{t('contactUs')}</p>
        <div className="mt-5 space-y-4 text-sm text-white/65">
          <div className="flex gap-3"><MapPin className="mt-0.5 shrink-0 text-[#ff6542]" size={17}/><span>{address}</span></div>
          <a href={`tel:${phone}`} className="flex gap-3 hover:text-white"><Phone className="mt-0.5 shrink-0 text-[#2f6fed]" size={17}/><span>{phone}</span></a>
          <a href={`mailto:${email}`} className="flex gap-3 break-all hover:text-white"><Mail className="mt-0.5 shrink-0 text-[#21b573]" size={17}/><span>{email}</span></a>
          <div className="flex gap-3"><Clock3 className="mt-0.5 shrink-0 text-[#ffb347]" size={17}/><span>{supportHours}</span></div>
        </div>
      </div>
    </div>

    <div className="border-t border-white/10">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-5 py-5 text-xs text-white/45 sm:flex-row sm:items-center">
        <span>{copyright}</span>
        <div className="flex flex-wrap items-center gap-2 font-black">
          {['bKash','Nagad','VISA','Mastercard','SSL Secured'].map(x=><span key={x} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">{x}</span>)}
        </div>
      </div>
    </div>
  </footer>
}
