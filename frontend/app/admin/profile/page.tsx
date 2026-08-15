'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Mail, Phone, Save, ShieldCheck, UserRound } from 'lucide-react';
import AdminShell from '@/components/admin-shell';
import { api } from '@/lib/api';
import { getStoredUser, saveAuth, getRefreshToken } from '@/lib/auth';

export default function AdminProfilePage(){
  const [user,setUser]=useState<any>(null);
  const [form,setForm]=useState({name:'',phone:''});
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');

  useEffect(()=>{
    const u=getStoredUser();
    setUser(u);
    setForm({name:u?.name||'',phone:u?.phone||''});
  },[]);

  async function submit(e:FormEvent){
    e.preventDefault();
    setBusy(true);
    setMessage('');
    try{
      const r=await api.patch('/users/me/profile',form);
      const updated={...(user||{}),...(r.data||{})};
      setUser(updated);
      const token=typeof window!=='undefined'?localStorage.getItem('accessToken'):null;
      if(token) saveAuth(token,updated,getRefreshToken()||undefined);
      setMessage('Profile updated successfully.');
    }catch(err:any){
      setMessage(err?.response?.data?.message||'Profile update failed.');
    }finally{
      setBusy(false);
    }
  }

  return <AdminShell>
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[.18em] text-blue-600">My control</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">Admin profile</h1>
          <p className="mt-2 text-sm text-slate-500">Manage the profile attached to your staff account.</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-black text-white"><ShieldCheck size={15}/>{String(user?.role||'STAFF').replaceAll('_',' ')}</span>
      </div>

      {message&&<div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm font-bold text-blue-800">{message}</div>}

      <form onSubmit={submit} className="mt-6 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50 p-6">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-xl font-black text-white">{(form.name?.[0]||'A').toUpperCase()}</span>
          <div className="min-w-0">
            <p className="truncate text-xl font-black">{form.name||'Administrator'}</p>
            <p className="mt-1 truncate text-sm text-slate-500">{user?.email}</p>
          </div>
        </div>

        <div className="grid gap-5 p-6 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-500"><UserRound size={14}/>Full name</span>
            <input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"/>
          </label>
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-500"><Phone size={14}/>Phone</span>
            <input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"/>
          </label>
          <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-3"><Mail size={17} className="text-slate-400"/><div><p className="text-xs font-black uppercase tracking-wide text-slate-400">Login email</p><p className="mt-1 text-sm font-black">{user?.email||'—'}</p></div></div>
          </div>
        </div>

        <div className="border-t border-slate-100 bg-slate-50/70 p-6">
          <button disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"><Save size={16}/>{busy?'Saving...':'Save profile'}</button>
        </div>
      </form>
    </div>
  </AdminShell>
}
