'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminShell from '@/components/admin-shell';
import { api } from '@/lib/api';
import { clearAuth, getStoredUser } from '@/lib/auth';

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredUser();
    if (!stored || stored.role !== 'ADMIN') {
      router.replace('/login');
      return;
    }

    Promise.all([
      api.get('/users'),
      api.get('/catalog/products'),
      api.get('/admin/orders'),
      api.get('/inventory'),
    ])
      .then(([u, p, o, i]) => {
        setUsers(u.data);
        setProducts(p.data);
        setOrders(o.data);
        setInventory(i.data);
      })
      .catch(() => {
        clearAuth();
        router.replace('/login');
      })
      .finally(() => setLoading(false));
  }, [router]);

  const metrics = useMemo(() => ({
    customers: users.filter((x) => x.role === 'CUSTOMER').length,
    revenue: orders
      .filter((x) => x.paymentStatus === 'PAID')
      .reduce((s, x) => s + Number(x.total || 0), 0),
    lowStock: inventory.filter((x) => x.lowStock).length,
    available: inventory.reduce((s, x) => s + Number(x.available || 0), 0),
  }), [users, orders, inventory]);

  const statusCounts = ['CONFIRMED','PROCESSING','PACKED','SHIPPED','DELIVERED','CANCELLED']
    .map((status) => ({ status, count: orders.filter((o) => o.status === status).length }));

  if (loading) return <main className="grid min-h-screen place-items-center">Loading dashboard...</main>;

  return (
    <AdminShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Admin overview</p>
          <h1 className="mt-2 text-4xl font-black">Commerce dashboard</h1>
          <p className="mt-2 text-slate-500">Live operational summary from PostgreSQL.</p>
        </div>
        <Link href="/admin/orders" className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white">
          Manage orders
        </Link>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Customers', metrics.customers, '/admin'],
          ['Products', products.length, '/admin/catalog'],
          ['Orders', orders.length, '/admin/orders'],
          ['Paid revenue', `BDT ${metrics.revenue.toFixed(2)}`, '/admin/orders'],
        ].map(([label, value, href]) => (
          <Link key={String(label)} href={String(href)}
            className="rounded-3xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-lg">
            <p className="text-sm font-semibold text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-black">{value}</p>
          </Link>
        ))}
      </section>

      <section className="mt-4 grid gap-4 md:grid-cols-2">
        <Link href="/admin/inventory" className="rounded-3xl bg-slate-950 p-6 text-white">
          <p className="text-sm font-semibold text-white/50">Available inventory</p>
          <p className="mt-3 text-4xl font-black">{metrics.available}</p>
          <p className="mt-2 text-sm text-white/60">Across all inventory rows.</p>
        </Link>

        <Link href="/admin/inventory" className="rounded-3xl border border-slate-200 bg-white p-6">
          <p className="text-sm font-semibold text-slate-500">Low-stock variants</p>
          <p className="mt-3 text-4xl font-black">{metrics.lowStock}</p>
          <p className="mt-2 text-sm text-slate-500">At or below reorder level.</p>
        </Link>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1.35fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-black">Order pipeline</h2>
          <p className="mt-1 text-sm text-slate-500">Current fulfillment distribution.</p>
          <div className="mt-6 space-y-3">
            {statusCounts.map(({status,count}) => {
              const width = orders.length ? Math.max(6, Math.round((count/orders.length)*100)) : 0;
              return <div key={status}>
                <div className="flex justify-between text-sm"><span className="font-bold">{status}</span><span>{count}</span></div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-slate-950" style={{width:`${width}%`}} />
                </div>
              </div>
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-xl font-black">Recent orders</h2>
              <p className="mt-1 text-sm text-slate-500">Latest customer transactions.</p>
            </div>
            <Link href="/admin/orders" className="text-sm font-bold underline">View all</Link>
          </div>

          <div className="mt-5 space-y-3">
            {orders.slice(0,5).map((o) => (
              <div key={o.id} className="grid gap-3 rounded-2xl bg-slate-50 p-4 md:grid-cols-[1.2fr_1fr_0.7fr]">
                <div><p className="font-black">{o.orderNumber}</p><p className="text-xs text-slate-500">{o.customerName} | {o.city}</p></div>
                <div><p className="text-xs font-bold text-slate-400">STATUS</p><p className="text-sm font-bold">{o.status}</p></div>
                <div className="md:text-right"><p className="text-xs font-bold text-slate-400">TOTAL</p><p className="font-black">BDT {o.total}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
