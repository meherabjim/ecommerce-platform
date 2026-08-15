'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, KeyRound, PlugZap, Truck, WalletCards, XCircle } from 'lucide-react';

import AdminShell from '@/components/admin-shell';
import { api } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';

export default function IntegrationsPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const user = getStoredUser();
    if (!user || !['SUPER_ADMIN','ADMIN'].includes(String(user.role).toUpperCase())) {
      router.replace('/admin?denied=1');
      return;
    }

    api.get('/admin/integrations').then((response) => setData(response.data));
  }, [router]);

  const Provider = ({ item }: { item: any }) => (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-black">{item.name}</p>
          <p className="mt-1 text-xs text-slate-400">{item.key}</p>
        </div>
        {item.configured ? (
          <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-black text-emerald-700">
            <CheckCircle2 size={13} /> READY
          </span>
        ) : (
          <span className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1.5 text-[10px] font-black text-amber-700">
            <XCircle size={13} /> CREDENTIALS NEEDED
          </span>
        )}
      </div>

      <p className="mt-4 text-sm text-slate-500">
        {item.mode === 'built-in'
          ? 'Built into the current platform.'
          : 'Provider adapter boundary is ready; real API activation requires the provider credentials below.'}
      </p>

      {item.requiredEnv?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {item.requiredEnv.map((key: string) => (
            <code
              key={key}
              className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-[10px] font-bold text-slate-600"
            >
              {key}
            </code>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <AdminShell>
      <div>
        <p className="text-xs font-black uppercase tracking-[.18em] text-slate-400">
          Provider architecture
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">Integrations</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
          External payment and courier providers are intentionally marked ready only
          when their real credentials exist. No fake provider success is shown.
        </p>
      </div>

      {!data ? (
        <div className="mt-8 grid min-h-64 place-items-center rounded-3xl border border-slate-200 bg-white font-black">
          Loading provider status...
        </div>
      ) : (
        <>
          <section className="mt-7 rounded-[1.5rem] bg-[#1464f4] p-6 text-white">
            <div className="flex gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/10">
                <PlugZap size={19} />
              </span>
              <div>
                <p className="font-black">Integration readiness</p>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-white/50">
                  {data.note}
                </p>
              </div>
            </div>
          </section>

          <section className="mt-6">
            <div className="flex items-center gap-3">
              <WalletCards size={19} />
              <h2 className="text-2xl font-black">Payment providers</h2>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {(data.payments || []).map((item: any) => (
                <Provider key={item.key} item={item} />
              ))}
            </div>
          </section>

          <section className="mt-8">
            <div className="flex items-center gap-3">
              <Truck size={19} />
              <h2 className="text-2xl font-black">Courier providers</h2>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {(data.couriers || []).map((item: any) => (
                <Provider key={item.key} item={item} />
              ))}
            </div>
          </section>

          <section className="mt-8 rounded-[1.5rem] border border-slate-200 bg-white p-6">
            <div className="flex gap-4">
              <KeyRound size={20} />
              <div>
                <h2 className="font-black">Production activation rule</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Add credentials through environment variables, implement/test the
                  provider-specific adapter against sandbox, then enable production.
                  Payment callbacks must be verified server-to-server before marking an
                  order paid.
                </p>
              </div>
            </div>
          </section>
        </>
      )}
    </AdminShell>
  );
}
