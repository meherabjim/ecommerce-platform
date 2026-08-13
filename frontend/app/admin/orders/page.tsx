'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminShell from '@/components/admin-shell';
import { api } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';

const transitions: Record<string,string[]> = {
  PENDING:['CONFIRMED','CANCELLED'],
  CONFIRMED:['PROCESSING','CANCELLED'],
  PROCESSING:['PACKED','CANCELLED'],
  PACKED:['SHIPPED','CANCELLED'],
  SHIPPED:['DELIVERED','CANCELLED'],
  DELIVERED:[],
  CANCELLED:[],
};

export default function AdminOrders() {
  const router = useRouter();
  const [orders,setOrders] = useState<any[]>([]);
  const [query,setQuery] = useState('');
  const [filter,setFilter] = useState('');
  const [message,setMessage] = useState('');

  async function load(){ setOrders((await api.get('/admin/orders')).data); }

  useEffect(() => {
    const user = getStoredUser();
    if(!user || user.role !== 'ADMIN'){ router.replace('/login'); return; }
    load();
  }, [router]);

  async function update(id:string,status:string){
    try{
      await api.patch(`/admin/orders/${id}/status`,{
        status,
        note:`Status changed to ${status} by admin`
      });
      setMessage(`Order moved to ${status}.`);
      await load();
    }catch(e:any){
      setMessage(e?.response?.data?.message || 'Update failed.');
    }
  }

  const visible = useMemo(() => orders.filter((o) => {
    const haystack = `${o.orderNumber} ${o.customerName} ${o.phone} ${o.city}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) && (!filter || o.status === filter);
  }), [orders,query,filter]);

  return (
    <AdminShell>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Fulfillment</p>
          <h1 className="mt-2 text-4xl font-black">Orders</h1>
          <p className="mt-2 text-slate-500">Search, review and progress customer orders.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <input className="rounded-xl border bg-white px-4 py-3 text-sm" placeholder="Search order/customer..."
            value={query} onChange={(e)=>setQuery(e.target.value)} />
          <select className="rounded-xl border bg-white px-4 py-3 text-sm" value={filter} onChange={(e)=>setFilter(e.target.value)}>
            <option value="">All statuses</option>
            {Object.keys(transitions).map((s)=><option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {message && <p className="mt-5 rounded-2xl border bg-white p-4 text-sm font-semibold">{message}</p>}

      <section className="mt-8 space-y-4">
        {visible.map((o) => (
          <div key={o.id} className="rounded-3xl border border-slate-200 bg-white p-6">
            <div className="flex flex-wrap justify-between gap-4">
              <div>
                <p className="text-lg font-black">{o.orderNumber}</p>
                <p className="mt-1 text-sm text-slate-500">{o.customerName} | {o.phone} | {o.city}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black">BDT {o.total}</p>
                <p className="text-sm text-slate-500">{o.paymentMode} | {o.paymentStatus}</p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="mr-2 text-sm font-bold">Current: {o.status}</span>
              {(transitions[o.status] || []).map((s) => (
                <button key={s} onClick={()=>update(o.id,s)}
                  className={`rounded-lg border px-3 py-2 text-xs font-bold ${s==='CANCELLED'?'border-red-200 text-red-600':'border-slate-300 hover:bg-slate-950 hover:text-white'}`}>
                  {s}
                </button>
              ))}
              {!(transitions[o.status] || []).length && (
                <span className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-500">Final state</span>
              )}
            </div>

            <div className="mt-4 grid gap-2 md:grid-cols-2">
              {o.items.map((x:any) => (
                <div key={x.id} className="rounded-xl bg-slate-50 p-3 text-sm">
                  <b>{x.productName}</b> x {x.quantity} | BDT {x.lineTotal}
                </div>
              ))}
            </div>
          </div>
        ))}

        {!visible.length && <div className="rounded-3xl border border-dashed p-12 text-center text-slate-500">No matching orders.</div>}
      </section>
    </AdminShell>
  );
}
