'use client';

import { FormEvent, Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

function ResetForm() {
  const params = useSearchParams();
  const [token,setToken] = useState(params.get('token')||'');
  const [password,setPassword] = useState('');
  const [message,setMessage] = useState('');

  async function submit(e:FormEvent){
    e.preventDefault();
    try{
      const r=await api.post('/auth/reset-password',{token,password});
      setMessage(r.data.message);
    }catch(e:any){
      setMessage(e?.response?.data?.message||'Reset failed.');
    }
  }

  return <form onSubmit={submit} className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 premium-shadow">
    <p className="text-xs font-black uppercase tracking-[.18em] text-slate-400">Security</p>
    <h1 className="mt-2 text-3xl font-black">Choose a new password</h1>
    <label className="mt-6 block text-sm font-black">Reset token<textarea required value={token} onChange={e=>setToken(e.target.value)} className="mt-2 min-h-24 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs"/></label>
    <label className="mt-4 block text-sm font-black">New password<input required type="password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 font-normal"/></label>
    <p className="mt-2 text-xs text-slate-400">Minimum 8 characters with uppercase, lowercase and number.</p>
    <button className="mt-5 w-full rounded-xl bg-[#1464f4] py-3.5 text-sm font-black text-white">Reset password</button>
    {message&&<p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm">{message}</p>}
    <Link href="/login" className="mt-6 block text-center text-sm font-black">Go to login</Link>
  </form>
}

export default function ResetPasswordPage(){
  return <main className="grid min-h-screen place-items-center bg-[#f5f6f8] px-5"><Suspense fallback={<div>Loading...</div>}><ResetForm/></Suspense></main>
}
