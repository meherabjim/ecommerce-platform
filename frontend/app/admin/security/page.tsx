'use client';

import { useEffect,useMemo,useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ShieldCheck } from 'lucide-react';
import AdminShell from '@/components/admin-shell';
import { api } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';

export default function AdminSecurityPage(){
  const router=useRouter();
  const [logs,setLogs]=useState<any[]>([]);
  const [query,setQuery]=useState('');

  async function load(){setLogs((await api.get('/auth/admin/audit-logs?limit=300')).data||[])}
  useEffect(()=>{const u=getStoredUser();if(!u||!['SUPER_ADMIN','ADMIN'].includes(String(u.role).toUpperCase())){router.replace('/admin?denied=1');return}load()},[router]);

  const filtered=useMemo(()=>logs.filter(x=>`${x.action} ${x.entityType||''} ${x.entityId||''} ${x.actorUserId||''}`.toLowerCase().includes(query.toLowerCase())),[logs,query]);

  return <AdminShell>
    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
      <div><p className="text-xs font-black uppercase tracking-[.18em] text-slate-400">Security operations</p><h1 className="mt-2 text-4xl font-black tracking-tight">Audit trail</h1><p className="mt-2 text-sm text-slate-500">Authentication and sensitive account activity.</p></div>
      <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search audit events..." className="py-3 outline-none"/></label>
    </div>
    <section className="mt-6 grid gap-3 sm:grid-cols-3">
      {[['Recorded events',logs.length],['Login events',logs.filter(x=>x.action==='AUTH_LOGIN').length],['Security changes',logs.filter(x=>String(x.action).includes('PASSWORD')||String(x.action).includes('VERIFIED')).length]].map(([a,b])=><div key={String(a)} className="rounded-2xl border border-slate-200 bg-white p-5"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#1464f4] text-white"><ShieldCheck size={17}/></span><p className="mt-4 text-3xl font-black">{b}</p><p className="text-sm text-slate-500">{a}</p></div>)}
    </section>
    <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-400"><tr><th className="px-5 py-4">Time</th><th>Action</th><th>Actor</th><th>Entity</th><th>IP</th></tr></thead><tbody className="divide-y">{filtered.map(x=><tr key={x.id}><td className="px-5 py-4 text-xs">{new Date(x.createdAt).toLocaleString()}</td><td className="font-black">{x.action}</td><td className="font-mono text-xs">{x.actorUserId||'system'}</td><td>{[x.entityType,x.entityId].filter(Boolean).join(' / ')||'—'}</td><td className="text-xs text-slate-500">{x.ipAddress||'—'}</td></tr>)}</tbody></table></div></div>
  </AdminShell>
}
