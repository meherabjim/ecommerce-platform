'use client';

import Link from 'next/link';
import {
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Truck,
  RefreshCw,
  CreditCard,
  Headphones,
} from 'lucide-react';
import { useStoreConfig } from '@/components/store-config-provider';
import { useI18n } from '@/lib/i18n';

export default function StoreFooter() {
  const config = useStoreConfig();
  const { language } = useI18n();
  const bn = language === 'bn';

  const identity = config['store.identity'] || {};
  const footer = config['store.footer'] || {};
  const contact = config['store.contact'] || {};

  const storeName = identity.storeName || 'E-Commerce Platform';
  const phone = contact.phone || identity.supportPhone || '01764305948';
  const email = contact.email || identity.supportEmail || 'meherabjim2022@gmail.com';
  const address = contact.address || 'Vatara, Dhaka';

  const about = footer.about || (
    bn
      ? 'স্টাইল, নির্ভরযোগ্য ডেলিভারি এবং নিরাপদ কেনাকাটা—সব এক জায়গায়।'
      : 'Style, dependable delivery and secure shopping — all in one place.'
  );

  return (
    <footer className="mt-6 bg-[#08111d] text-white">
      <div className="border-y border-white/10 bg-[#0d1b2a]">
        <div className="mx-auto grid max-w-[1180px] grid-cols-2 gap-px bg-white/10 lg:grid-cols-4">
          {[
            [Truck, bn ? 'দ্রুত ডেলিভারি' : 'Fast delivery'],
            [ShieldCheck, bn ? 'নিরাপদ পেমেন্ট' : 'Secure payment'],
            [RefreshCw, bn ? 'সহজ রিটার্ন' : 'Easy returns'],
            [Headphones, bn ? 'সাপোর্ট' : 'Customer support'],
          ].map(([Icon, label]: any) => (
            <div key={label} className="flex items-center justify-center gap-2 bg-[#0d1b2a] px-3 py-3 text-[11px] font-black text-white/75">
              <Icon size={16} className="text-sky-300" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-[1180px] px-5 py-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[#2563eb] to-[#7c3aed] text-lg font-black">
                {storeName.charAt(0).toUpperCase()}
              </span>
              <div>
                <p className="text-lg font-black">{storeName}</p>
                <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[.16em] text-white/40">
                  {identity.tagline || 'Smart shopping, made simple'}
                </p>
              </div>
            </div>

            <p className="mt-3 max-w-sm text-xs leading-5 text-white/55">{about}</p>

            <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-black text-emerald-300">
              <ShieldCheck size={15} />
              {bn ? 'নিরাপদ চেকআউট' : 'Secure checkout'}
            </div>
          </div>

          <div>
            <h3 className="text-[11px] font-black uppercase tracking-[.18em] text-white/90">
              {bn ? 'শপ' : 'Shop'}
            </h3>
            <div className="mt-4 space-y-2.5 text-sm font-semibold text-white/50">
              <Link className="block hover:text-white" href="/shop">{bn ? 'সব পণ্য' : 'All products'}</Link>
              <Link className="block hover:text-white" href="/new-arrivals">{bn ? 'নতুন পণ্য' : 'New arrivals'}</Link>
              <Link className="block hover:text-white" href="/shop?offers=1">{bn ? 'অফার' : 'Offers'}</Link>
              <Link className="block hover:text-white" href="/pages/about">{bn ? 'আমাদের সম্পর্কে' : 'About us'}</Link>
            </div>
          </div>

          <div>
            <h3 className="text-[11px] font-black uppercase tracking-[.18em] text-white/90">
              {bn ? 'সাপোর্ট' : 'Support'}
            </h3>
            <div className="mt-4 space-y-2.5 text-sm font-semibold text-white/50">
              <Link className="block hover:text-white" href="/track-order">{bn ? 'অর্ডার ট্র্যাক' : 'Track order'}</Link>
              <Link className="block hover:text-white" href="/account/orders">{bn ? 'আমার অর্ডার' : 'My orders'}</Link>
              <Link className="block hover:text-white" href="/account/returns">{bn ? 'রিটার্ন ও রিফান্ড' : 'Returns & refunds'}</Link>
              <Link className="block hover:text-white" href="/pages/terms">{bn ? 'শর্তাবলি' : 'Terms & conditions'}</Link>
            </div>
          </div>

          <div>
            <h3 className="text-[11px] font-black uppercase tracking-[.18em] text-white/90">
              {bn ? 'যোগাযোগ' : 'Contact'}
            </h3>
            <div className="mt-4 space-y-3 text-sm text-white/55">
              <div className="flex items-start gap-2.5">
                <MapPin size={16} className="mt-0.5 shrink-0 text-orange-400" />
                <span>{address}</span>
              </div>
              <a href={`tel:${phone}`} className="flex items-start gap-2.5 hover:text-white">
                <Phone size={16} className="mt-0.5 shrink-0 text-blue-400" />
                <span>{phone}</span>
              </a>
              <a href={`mailto:${email}`} className="flex items-start gap-2.5 break-all hover:text-white">
                <Mail size={16} className="mt-0.5 shrink-0 text-emerald-400" />
                <span>{email}</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-white/35">
            © 2026 {storeName}. {bn ? 'সর্বস্বত্ব সংরক্ষিত।' : 'All rights reserved.'}
          </p>

          <div className="flex flex-wrap gap-2">
            {['bKash', 'Nagad', 'VISA', 'Mastercard'].map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[.04] px-2.5 py-1.5 text-[10px] font-bold text-white/50"
              >
                <CreditCard size={12} />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
