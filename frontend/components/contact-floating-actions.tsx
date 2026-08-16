'use client';

import { MessageCircle, Phone } from 'lucide-react';
import { useStoreConfig } from '@/components/store-config-provider';
import { useI18n } from '@/lib/i18n';
import { usePathname } from 'next/navigation';

function normalizeBangladeshPhone(value: string) {
  const digits = (value || '').replace(/\D/g, '');

  if (digits.startsWith('880')) return digits;

  if (digits.startsWith('0')) return `88${digits}`;

  return digits;
}

export default function ContactFloatingActions() {
  const pathname = usePathname();

  // Admin panel এ Messenger / WhatsApp / Phone দেখাবে না
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const config = useStoreConfig();
  const { t } = useI18n();

  const identity = config['store.identity'] || {};
  const contact = config['store.contact'] || {};

  const phone =
    contact.phone ||
    identity.supportPhone ||
    '01764305948';

  const whatsapp =
    contact.whatsappNumber ||
    phone;

  const whatsappDigits =
    normalizeBangladeshPhone(whatsapp);

  const messengerUrl =
    contact.messengerUrl ||
    'https://www.messenger.com/';

  return (
    <aside
      className="
        fixed 
        right-4 
        top-1/2 
        z-40 
        hidden 
        -translate-y-1/2 
        flex-col 
        items-center 
        gap-3 
        lg:flex
      "
      aria-label="Contact shortcuts"
    >

      {/* Messenger */}
      <a
        href={messengerUrl}
        target="_blank"
        rel="noreferrer"
        className="group flex flex-col items-center gap-1.5"
        title={t('contact')}
      >
        <span
          className="
            grid 
            h-12 
            w-12 
            place-items-center 
            rounded-full 
            bg-[#1684ff] 
            text-white 
            shadow-lg 
            transition 
            group-hover:-translate-y-1 
            group-hover:shadow-xl
          "
        >
          <MessageCircle
            size={22}
            fill="currentColor"
          />
        </span>

        <span
          className="
            rounded-full 
            bg-white 
            px-2 
            py-1 
            text-[10px] 
            font-black 
            text-slate-600 
            shadow-sm
          "
        >
          Messenger
        </span>
      </a>


      {/* WhatsApp */}
      <a
        href={`https://wa.me/${whatsappDigits}`}
        target="_blank"
        rel="noreferrer"
        className="group flex flex-col items-center gap-1.5"
        title="WhatsApp"
      >
        <span
          className="
            grid 
            h-12 
            w-12 
            place-items-center 
            rounded-full 
            bg-[#22c55e] 
            text-white 
            shadow-lg 
            transition 
            group-hover:-translate-y-1 
            group-hover:shadow-xl
          "
        >
          <MessageCircle size={22} />
        </span>

        <span
          className="
            rounded-full 
            bg-white 
            px-2 
            py-1 
            text-[10px] 
            font-black 
            text-slate-600 
            shadow-sm
          "
        >
          WhatsApp
        </span>
      </a>


      {/* Phone */}
      <a
        href={`tel:${phone}`}
        className="group flex flex-col items-center gap-1.5"
        title={phone}
      >
        <span
          className="
            grid 
            h-12 
            w-12 
            place-items-center 
            rounded-full 
            bg-[#ef4444] 
            text-white 
            shadow-lg 
            transition 
            group-hover:-translate-y-1 
            group-hover:shadow-xl
          "
        >
          <Phone
            size={21}
            fill="currentColor"
          />
        </span>

        <span
          className="
            rounded-full 
            bg-white 
            px-2 
            py-1 
            text-[10px] 
            font-black 
            text-slate-600 
            shadow-sm
          "
        >
          {phone}
        </span>
      </a>

    </aside>
  );
}