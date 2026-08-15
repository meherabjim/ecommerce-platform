'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  Download,
  PackageSearch,
  RefreshCw,
  ShoppingCart,
  UsersRound,
  WalletCards,
} from 'lucide-react';

import AdminShell from '@/components/admin-shell';
import { api } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';

const money = (value: unknown) =>
  `BDT ${Number(value || 0).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })}`;

const pretty = (value: string) => String(value || '').replaceAll('_', ' ');

export default function ReportsPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [role,setRole]=useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/admin/reports/overview');
      setData(response.data);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Could not load reports.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const user = getStoredUser();
    if (!user || !['SUPER_ADMIN','ADMIN','FINANCE'].includes(user.role)) {
      router.replace('/admin');
      return;
    }
    setRole(user.role);
    load();
  }, [router]);

  async function exportCsv(path:string,name:string){
    const response=await api.get(path,{responseType:'blob'});
    const url=URL.createObjectURL(new Blob([response.data],{type:'text/csv;charset=utf-8'}));
    const link=document.createElement('a'); link.href=url; link.download=name; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
  }

  async function exportOrders() {
    const response = await api.get('/admin/reports/orders.csv', {
      responseType: 'blob',
    });

    const url = URL.createObjectURL(
      new Blob([response.data], { type: 'text/csv;charset=utf-8' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = `ecommerce-orders-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  const maxTrend = useMemo(
    () =>
      Math.max(
        1,
        ...(data?.salesTrend || []).map((x: any) => Number(x.paid || 0)),
      ),
    [data],
  );

  if (loading) {
    return (
      <AdminShell>
        <div className="grid min-h-[50vh] place-items-center font-black">
          Loading reports...
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[.18em] text-slate-400">
            Business intelligence
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">Reports</h1>
          <p className="mt-2 text-sm text-slate-500">
            Sales, customers, payment, inventory, delivery and return performance.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={load}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button
            onClick={exportOrders}
            className="flex items-center gap-2 rounded-xl bg-[#1464f4] px-4 py-3 text-sm font-black text-white"
          >
            <Download size={16} />
            Export orders CSV
          </button>
          {['SUPER_ADMIN','ADMIN'].includes(role)&&<>
            <button onClick={()=>exportCsv('/admin/reports/customers.csv','ecommerce-customers.csv')} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black"><Download size={16}/>Customers CSV</button>
            <button onClick={()=>exportCsv('/admin/reports/inventory.csv','ecommerce-inventory.csv')} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black"><Download size={16}/>Inventory CSV</button>
          </>}
        </div>
      </div>

      {error && (
        <p className="mt-5 rounded-2xl bg-rose-50 p-4 text-sm font-semibold text-rose-700">
          {error}
        </p>
      )}

      {data && (
        <>
          <section className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              [WalletCards, 'Paid revenue', money(data.sales.totalPaid)],
              [ShoppingCart, 'Total orders', data.orders.total],
              [UsersRound, 'Customers', data.customers.total],
              [PackageSearch, 'Available units', data.inventory.availableUnits],
            ].map(([Icon, label, value]: any) => (
              <div
                key={label}
                className="rounded-[1.5rem] border border-slate-200 bg-white p-5"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#1464f4] text-white">
                  <Icon size={17} />
                </span>
                <p className="mt-4 text-2xl font-black">{value}</p>
                <p className="mt-1 text-sm text-slate-500">{label}</p>
              </div>
            ))}
          </section>

          <section className="mt-5 grid gap-5 xl:grid-cols-[1.3fr_.7fr]">
            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6">
              <div className="flex items-center gap-3">
                <BarChart3 size={18} />
                <div>
                  <h2 className="text-xl font-black">Paid sales trend</h2>
                  <p className="text-sm text-slate-500">Last 14 days</p>
                </div>
              </div>

              <div className="mt-8 flex h-64 items-end gap-2">
                {(data.salesTrend || []).map((row: any) => {
                  const height = Math.max(
                    2,
                    Math.round((Number(row.paid || 0) / maxTrend) * 100),
                  );
                  return (
                    <div
                      key={row.date}
                      className="group flex h-full flex-1 flex-col justify-end"
                      title={`${row.date}: ${money(row.paid)} / ${row.orders} orders`}
                    >
                      <div
                        className="w-full rounded-t-lg bg-[#1464f4] transition group-hover:bg-slate-700"
                        style={{ height: `${height}%` }}
                      />
                      <span className="mt-2 hidden text-center text-[9px] text-slate-400 md:block">
                        {row.date.slice(5)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[1.5rem] bg-[#1464f4] p-6 text-white">
              <p className="text-xs font-black uppercase tracking-[.15em] text-white/40">
                Financial snapshot
              </p>
              <div className="mt-6 space-y-5">
                {[
                  ['Today paid sales', money(data.sales.todaySales)],
                  ['Average order value', money(data.sales.averageOrderValue)],
                  ['Outstanding / due', money(data.sales.dueAmount)],
                  ['Delivered value', money(data.sales.grossDelivered)],
                ].map(([label, value]) => (
                  <div key={label} className="border-b border-white/10 pb-4">
                    <p className="text-xs text-white/45">{label}</p>
                    <p className="mt-1 text-xl font-black">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-5 grid gap-5 lg:grid-cols-3">
            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-black">Order status</h2>
              <div className="mt-5 space-y-3">
                {Object.entries(data.orders.byStatus || {}).map(
                  ([status, count]: any) => (
                    <div
                      key={status}
                      className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm"
                    >
                      <span className="font-bold">{pretty(status)}</span>
                      <span className="font-black">{count}</span>
                    </div>
                  ),
                )}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-black">Customers & stock</h2>
              <div className="mt-5 space-y-3 text-sm">
                {[
                  ['Repeat customers', data.customers.repeat],
                  ['New customers (30d)', data.customers.newLast30Days],
                  ['Low stock variants', data.inventory.lowStock],
                  ['Out of stock variants', data.inventory.outOfStock],
                  ['Active deliveries', data.delivery.active],
                  ['Delivery failures', data.delivery.failed],
                ].map(([label, value]) => (
                  <div
                    key={String(label)}
                    className="flex justify-between rounded-xl bg-slate-50 px-4 py-3"
                  >
                    <span className="text-slate-500">{label}</span>
                    <b>{value}</b>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-black">Top products</h2>
              <div className="mt-5 space-y-3">
                {(data.topProducts || []).map((item: any, index: number) => (
                  <div
                    key={`${item.name}-${index}`}
                    className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#1464f4] text-xs font-black text-white">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black">{item.name}</p>
                      <p className="text-xs text-slate-400">
                        {item.quantity} units · {money(item.revenue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </AdminShell>
  );
}
