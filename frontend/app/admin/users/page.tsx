'use client';

import { FormEvent,useEffect,useMemo,useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminShell from '@/components/admin-shell';
import { api } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';

const roles=[
  'ADMIN','CATALOG_MANAGER','INVENTORY_MANAGER','ORDER_MANAGER',
  'CUSTOMER_SUPPORT','MARKETING_MANAGER','FINANCE','DELIVERY_AGENT',
];

const pretty=(x:string)=>String(x||'').replaceAll('_',' ');

export default function AdminUsersPage(){
  const router=useRouter();
  const me=getStoredUser();
  const [users,setUsers]=useState<any[]>([]);
  const [search,setSearch]=useState('');
  const [message,setMessage]=useState('');
  const [busy,setBusy]=useState('');
  const [form,setForm]=useState({
    name:'',email:'',phone:'',password:'',role:'ORDER_MANAGER',
  });

  async function load(){
    try{const r=await api.get('/users');setUsers(r.data||[])}
    catch(e:any){setMessage(e?.response?.data?.message||'Could not load users.')}
  }

  useEffect(()=>{
    const u=getStoredUser();
    if(!u||!['SUPER_ADMIN','ADMIN'].includes(u.role)){router.replace('/login');return}
    load();
  },[router]);

  const filtered=useMemo(()=>{
    const q=search.trim().toLowerCase();
    return !q?users:users.filter(x=>`${x.name} ${x.email} ${x.phone||''} ${x.role} ${x.status}`.toLowerCase().includes(q));
  },[users,search]);

  async function create(e:FormEvent){
    e.preventDefault();setBusy('create');setMessage('');
    try{
      await api.post('/users/staff',form);
      setForm({name:'',email:'',phone:'',password:'',role:'ORDER_MANAGER'});
      setMessage('Staff account created.');await load();
    }catch(e:any){setMessage(e?.response?.data?.message||'Could not create staff.')}
    finally{setBusy('')}
  }

  async function status(id:string,status:string){
    setBusy(id);
    try{await api.patch(`/users/${id}/status`,{status});await load()}
    catch(e:any){setMessage(e?.response?.data?.message||'Status update failed.')}
    finally{setBusy('')}
  }

  async function role(id:string,role:string){
    setBusy(id);
    try{await api.patch(`/users/${id}/role`,{role});await load()}
    catch(e:any){setMessage(e?.response?.data?.message||'Role update failed.')}
    finally{setBusy('')}
  }

  return <AdminShell>
    <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
      <div><p className="text-xs font-black uppercase tracking-[.18em] text-slate-400">Access management</p><h1 className="mt-2 text-3xl font-black">Staff & users</h1><p className="mt-2 text-sm text-slate-500">Public signup creates customers only. Super Admin creates operational staff here.</p><div className="mt-3 flex flex-wrap gap-2"><span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black text-blue-700">{users.length} total</span><span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black text-emerald-700">{users.filter(x=>x.status==='ACTIVE').length} active</span><span className="rounded-full bg-violet-50 px-3 py-1 text-[10px] font-black text-violet-700">{users.filter(x=>x.role!=='CUSTOMER'&&x.role!=='DELIVERY_AGENT').length} staff</span></div></div>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search users..." className="h-12 rounded-xl border bg-white px-4"/>
    </div>

    {message&&<p className="mt-5 rounded-xl border bg-white p-4 text-sm font-semibold">{message}</p>}

    {me?.role==='SUPER_ADMIN'&&
      <form onSubmit={create} className="mt-6 rounded-[1.5rem] bg-[#1464f4] p-6 text-white">
        <h2 className="text-xl font-black">Create staff account</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Full name" className="rounded-xl border border-white/10 bg-white/10 p-3"/>
          <input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="Email" className="rounded-xl border border-white/10 bg-white/10 p-3"/>
          <input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="Phone" className="rounded-xl border border-white/10 bg-white/10 p-3"/>
          <input required minLength={12} autoComplete="new-password" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="Temporary password (12+ chars)" className="rounded-xl border border-white/10 bg-white/10 p-3"/>
          <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})} className="rounded-xl border border-white/10 bg-white/10 p-3">
            {roles.map(x=><option className="text-black" key={x} value={x}>{pretty(x)}</option>)}
          </select>
        </div>
        <button disabled={busy==='create'} className="mt-4 rounded-xl bg-white px-5 py-3 text-sm font-black text-slate-950 disabled:opacity-50">{busy==='create'?'Creating...':'Create staff'}</button>
      </form>
    }

    <section className="mt-6 overflow-hidden rounded-[1.5rem] border bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1050px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-400"><tr><th className="px-5 py-4">User</th><th>Role</th><th>Status</th><th>Email verification</th><th>Last login</th><th>Actions</th></tr></thead>
          <tbody className="divide-y">
            {filtered.map(u=><tr key={u.id}>
              <td className="px-5 py-4"><p className="font-black">{u.name}</p><p className="text-xs text-slate-500">{u.email} · {u.phone||'—'}</p></td>
              <td>
                {me?.role==='SUPER_ADMIN'&&u.role!=='CUSTOMER'&&u.id!==me?.id?
                  <select value={u.role} onChange={e=>role(u.id,e.target.value)} className="rounded-lg border px-2 py-2 text-xs font-bold">
                    {['SUPER_ADMIN',...roles].map(x=><option key={x} value={x}>{pretty(x)}</option>)}
                  </select>:<span className="font-bold">{pretty(u.role)}</span>}
              </td>
              <td><span className={`rounded-full px-2 py-1 text-[10px] font-black ${u.status==='ACTIVE'?'bg-emerald-50 text-emerald-700':'bg-slate-100 text-slate-600'}`}>{u.status}</span></td>
              <td>{u.emailVerified?'Verified':'Pending'}</td>
              <td className="text-xs">{u.lastLoginAt?new Date(u.lastLoginAt).toLocaleString():'—'}</td>
              <td>
                {u.id!==me?.id&&u.role!=='SUPER_ADMIN'&&
                  <button disabled={busy===u.id} onClick={()=>status(u.id,u.status==='ACTIVE'?'INACTIVE':'ACTIVE')} className="rounded-lg border px-3 py-2 text-xs font-black">
                    {u.status==='ACTIVE'?'Disable':'Activate'}
                  </button>}
              </td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </section>
  </AdminShell>
}
