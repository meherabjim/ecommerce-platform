'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { Mail, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [token, setToken] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    const response = await api.post('/auth/forgot-password', { email });
    setMessage(response.data.message);
    setToken(response.data.developmentResetToken || '');
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f6f8] px-5">
      <form onSubmit={submit} className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 premium-shadow">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#1464f4] text-white"><Mail size={19}/></span>
        <p className="mt-6 text-xs font-black uppercase tracking-[.18em] text-slate-400">Account recovery</p>
        <h1 className="mt-2 text-3xl font-black">Reset your password</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">Enter your account email. Production delivery can be connected to email/SMS later.</p>

        <label className="mt-6 block text-sm font-black">Email
          <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 font-normal outline-none"/>
        </label>
        <button className="mt-5 w-full rounded-xl bg-[#1464f4] py-3.5 text-sm font-black text-white">Create reset instruction</button>

        {message&&<p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm">{message}</p>}
        {token&&<div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs"><b>Development reset token:</b><br/><code className="break-all">{token}</code><br/><Link className="mt-3 inline-block font-black underline" href={`/reset-password?token=${encodeURIComponent(token)}`}>Open reset page</Link></div>}

        <div className="mt-5 flex gap-3 rounded-xl bg-slate-50 p-4"><ShieldCheck size={17}/><p className="text-xs leading-5 text-slate-500">The API returns the same public message whether the email exists or not.</p></div>
        <Link href="/login" className="mt-6 block text-center text-sm font-black">← Back to login</Link>
      </form>
    </main>
  );
}
