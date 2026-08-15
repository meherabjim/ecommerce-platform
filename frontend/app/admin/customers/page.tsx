'use client';
import { useEffect,useMemo,useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminShell from '@/components/admin-shell';
import { api } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';
const money=(v:any)=>`BDT ${Number(v||0).toLocaleString(undefined,{maximumFractionDigits:2})}`;
export default function CustomersPage(){
 const router=useRouter();const [items,setItems]=useState<any[]>([]);const [q,setQ]=useState('');
 useEffect(()=>{const u=getStoredUser();if(!u||!['SUPER_ADMIN','ADMIN','CUSTOMER_SUPPORT'].includes(String(u.role).toUpperCase())){router.replace('/admin?denied=1');return}api.get('/ops/admin/customers').then(r=>setItems(r.data||[]))},[router]);
 const rows=useMemo(()=>items.filter(x=>`${x.name} ${x.email} ${x.phone||''}`.toLowerCase().includes(q.toLowerCase())),[items,q]);
 return <AdminShell><div className="flex justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.18em] text-slate-400">Customer operations</p><h1 className="mt-2 text-4xl font-black">Customers</h1></div><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search customers..." className="h-12 rounded-xl border bg-white px-4"/></div><div className="mt-6 overflow-x-auto rounded-[1.5rem] border bg-white"><table className="w-full min-w-[1000px] text-left text-sm"><thead className="bg-slate-50"><tr><th className="px-5 py-4">Customer</th><th>Status</th><th>Orders</th><th>Delivered</th><th>Order value</th><th>Verified payments</th><th>Last order</th></tr></thead><tbody>{rows.map(x=><tr key={x.id} className="border-t"><td className="px-5 py-4"><b>{x.name}</b><p className="text-xs text-slate-500">{x.email} · {x.phone||'—'}</p></td><td>{x.status}</td><td>{x.metrics.orders}</td><td>{x.metrics.deliveredOrders}</td><td>{money(x.metrics.lifetimeOrderValue)}</td><td>{money(x.metrics.verifiedPayments)}</td><td>{x.metrics.lastOrderAt?new Date(x.metrics.lastOrderAt).toLocaleString():'—'}</td></tr>)}</tbody></table></div></AdminShell>
}
