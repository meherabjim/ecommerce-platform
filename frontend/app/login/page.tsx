'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { saveAuth } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@neurocommerce.local');
  const [password, setPassword] = useState('Admin12345!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/login', { email, password });
      saveAuth(data.accessToken, data.user);
      router.push(data.user.role === 'ADMIN' ? '/admin' : '/account');
    } catch (error: any) {
      setError(error?.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-[#f7f7f5] lg:grid-cols-2">
      <section className="hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="text-xl font-black">Neuro Commerce</Link>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/40">
            Secure commerce
          </p>
          <h1 className="mt-4 max-w-lg text-5xl font-black tracking-tight">
            One account for your entire shopping journey.
          </h1>
        </div>
        <p className="text-sm text-white/40">Customer & admin authentication</p>
      </section>

      <section className="flex items-center justify-center p-6">
        <form onSubmit={handleSubmit} className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">Welcome back</p>
          <h2 className="mt-2 text-3xl font-black">Sign in</h2>

          {error && <div className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          <label className="mt-7 block text-sm font-semibold">Email</label>
          <input
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
          />

          <label className="mt-5 block text-sm font-semibold">Password</label>
          <input
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
          />

          <button
            className="mt-7 w-full rounded-xl bg-slate-950 py-3.5 font-bold text-white disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <p className="mt-5 text-center text-sm text-slate-500">
            New customer?{' '}
            <Link href="/register" className="font-bold text-slate-950">Create an account</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
