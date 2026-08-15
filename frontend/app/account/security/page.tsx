'use client';

import { FormEvent,useEffect,useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, KeyRound, MailCheck, ShieldCheck, MonitorSmartphone, LogOut } from 'lucide-react';
import Navbar from '@/components/navbar';
import AccountShell from '@/components/account-shell';
import StoreFooter from '@/components/store-footer';
import { api } from '@/lib/api';
import { clearAuth, getStoredUser, saveAuth } from '@/lib/auth';
import { authRedirectUrl } from '@/lib/customer-auth';

export default function SecurityPage(){
  const router=useRouter();
  const [user,setUser]=useState<any>(null);
  const [sessions,setSessions]=useState<any[]>([]);
  const [currentPassword,setCurrentPassword]=useState('');
  const [newPassword,setNewPassword]=useState('');
  const [message,setMessage]=useState('');
  const [verifyToken,setVerifyToken]=useState('');

  async function loadSessions(){
    try{const r=await api.get('/auth/sessions');setSessions(r.data||[])}catch{}
  }

  useEffect(()=>{
    const current=getStoredUser();
    if(!current){router.replace(authRedirectUrl(window.location.pathname));return}
    api.get('/auth/me').then(r=>setUser(r.data)).catch(()=>setUser(current));
    loadSessions();
  },[router]);

  async function change(e:FormEvent){
    e.preventDefault();
    try{
      const r=await api.post('/auth/change-password',{currentPassword,newPassword});
      setMessage(`${r.data.message} Sign in again because existing sessions were revoked.`);
      clearAuth();setTimeout(()=>router.replace(authRedirectUrl(window.location.pathname)),1000);
    }catch(e:any){setMessage(e?.response?.data?.message||'Password change failed.')}
  }

  async function requestVerification(){
    try{const r=await api.post('/auth/request-email-verification');setMessage(r.data.message);setVerifyToken(r.data.developmentVerificationToken||'')}
    catch(e:any){setMessage(e?.response?.data?.message||'Verification request failed.')}
  }

  async function verify(){
    try{
      const r=await api.post('/auth/verify-email',{token:verifyToken});
      setUser(r.data.user);
      const access=localStorage.getItem('accessToken'),refresh=localStorage.getItem('refreshToken')||undefined;
      if(access)saveAuth(access,r.data.user,refresh);
      setMessage(r.data.message);setVerifyToken('');
    }catch(e:any){setMessage(e?.response?.data?.message||'Verification failed.')}
  }

  async function revoke(id:string){
    await api.delete(`/auth/sessions/${id}`);setMessage('Session revoked.');await loadSessions();
  }

  async function logoutAll(){
    if(!confirm('Sign out all devices?'))return;
    await api.post('/auth/logout-all');
    clearAuth();router.replace(authRedirectUrl(window.location.pathname));router.refresh();
  }

  return <main className="customer-canvas customer-v3"><Navbar/><AccountShell>
    <div><p className="text-xs font-black uppercase tracking-[.18em] text-slate-400">Account protection</p><h1 className="mt-2 text-4xl font-black">Security</h1><p className="mt-2 text-sm text-slate-500">Password, verification and active device sessions.</p></div>
    {message&&<p className="mt-5 rounded-2xl border bg-white p-4 text-sm font-semibold">{message}</p>}

    <section className="mt-6 grid gap-5 xl:grid-cols-2">
      <form onSubmit={change} className="customer-panel p-6">
        <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#1464f4] text-white"><KeyRound size={18}/></span><div><h2 className="text-xl font-black">Change password</h2><p className="text-sm text-slate-500">Changing password revokes refresh sessions.</p></div></div>
        <label className="mt-6 block text-sm font-black">Current password<input type="password" required value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} className="mt-2 w-full rounded-xl border bg-slate-50 p-3.5 font-normal"/></label>
        <label className="mt-4 block text-sm font-black">New password<input type="password" required value={newPassword} onChange={e=>setNewPassword(e.target.value)} className="mt-2 w-full rounded-xl border bg-slate-50 p-3.5 font-normal"/></label>
        <button className="mt-5 rounded-xl bg-[#1464f4] px-5 py-3 text-sm font-black text-white">Update password</button>
      </form>

      <div className="customer-panel p-6">
        <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#1464f4] text-white">{user?.emailVerified?<CheckCircle2 size={18}/>:<MailCheck size={18}/>}</span><div><h2 className="text-xl font-black">Email verification</h2><p className="text-sm text-slate-500">{user?.email||'Account email'}</p></div></div>
        <p className="mt-5 text-sm">{user?.emailVerified?'Your email is verified.':'Your email has not been verified yet.'}</p>
        {!user?.emailVerified&&<button onClick={requestVerification} className="mt-4 rounded-xl border px-4 py-3 text-sm font-black">Create verification instruction</button>}
        {verifyToken&&<div className="mt-4 rounded-xl bg-amber-50 p-4"><p className="text-xs font-black">Development verification token</p><code className="mt-2 block break-all text-[10px]">{verifyToken}</code><button onClick={verify} className="mt-3 rounded-lg bg-[#1464f4] px-4 py-2 text-xs font-black text-white">Verify with this token</button></div>}
        <div className="mt-5 flex gap-3 rounded-xl bg-slate-50 p-4"><ShieldCheck size={17}/><p className="text-xs leading-5 text-slate-500">Production verification should use a configured message provider.</p></div>
      </div>
    </section>

    <section className="mt-5 customer-panel p-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#1464f4] text-white"><MonitorSmartphone size={18}/></span><div><h2 className="text-xl font-black">Active sessions</h2><p className="text-sm text-slate-500">Refresh-token sessions currently able to renew access.</p></div></div><button onClick={logoutAll} className="flex items-center gap-2 rounded-xl border border-rose-200 px-4 py-3 text-sm font-black text-rose-600"><LogOut size={16}/>Sign out all</button></div>
      <div className="mt-5 space-y-3">{sessions.map(s=><div key={s.id} className="flex flex-wrap items-center gap-3 rounded-xl bg-slate-50 p-4"><div className="min-w-[220px] flex-1"><p className="text-sm font-black">{s.userAgent||'Unknown device'}</p><p className="mt-1 text-xs text-slate-500">{s.ipAddress||'Unknown IP'} · created {new Date(s.createdAt).toLocaleString()}</p><p className="text-[10px] text-slate-400">Expires {new Date(s.expiresAt).toLocaleString()}</p></div><button onClick={()=>revoke(s.id)} className="rounded-lg border px-3 py-2 text-xs font-black">Revoke</button></div>)}</div>
      {!sessions.length&&<p className="mt-5 rounded-xl bg-slate-50 p-5 text-sm text-slate-500">No active refresh sessions.</p>}
    </section>
  </AccountShell><StoreFooter/></main>
}
