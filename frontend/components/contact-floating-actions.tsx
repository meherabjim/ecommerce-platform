'use client';

import { MessageCircle, Phone } from 'lucide-react';
import { useStoreConfig } from '@/components/store-config-provider';

function normalizeBangladeshPhone(value: string) {
  const digits = (value || '').replace(/\\D/g, '');
  if (digits.startsWith('880')) return digits;
  if (digits.startsWith('0')) return `88${digits}`;
  return digits;
}

export default function ContactFloatingActions() {
  const config = useStoreConfig();
  const identity = config['store.identity'] || {};
  const contact = config['store.contact'] || {};

  const phone = contact.phone || identity.supportPhone || '01764305948';
  const whatsappDigits = normalizeBangladeshPhone(contact.whatsappNumber || phone);
  const messengerUrl = contact.messengerUrl || 'https://www.messenger.com/';

  return (
    <aside
      className="absolute right-3 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-3 lg:flex"
      aria-label="Contact shortcuts"
    >
      <a
        href={messengerUrl}
        target="_blank"
        rel="noreferrer"
        title="Messenger"
        aria-label="Messenger"
        className="grid h-11 w-11 place-items-center rounded-full bg-[#1684ff] text-white shadow-xl ring-4 ring-white/10 transition hover:scale-105"
      >
        <MessageCircle size={20} fill="currentColor" />
      </a>

      <a
        href={`https://wa.me/${whatsappDigits}`}
        target="_blank"
        rel="noreferrer"
        title="WhatsApp"
        aria-label="WhatsApp"
        className="grid h-11 w-11 place-items-center rounded-full bg-[#22c55e] text-white shadow-xl ring-4 ring-white/10 transition hover:scale-105"
      >
        <MessageCircle size={20} />
      </a>

      <a
        href={`tel:${phone}`}
        title="Call"
        aria-label="Call"
        className="grid h-11 w-11 place-items-center rounded-full bg-[#ef4444] text-white shadow-xl ring-4 ring-white/10 transition hover:scale-105"
      >
        <Phone size={19} fill="currentColor" />
      </a>
    </aside>
  );
}
