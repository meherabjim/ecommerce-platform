'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { saveAuth } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...form,
        phone: form.phone || undefined,
      };
      const { data } = await api.post('/auth/register', payload);
      saveAuth(data.accessToken, data.user);
      router.push('/account');
    } catch (error: any) {
      const message = error?.response?.data?.message;
      setError(Array.isArray(message) ? message.join(', ') : message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f7f5] px-5 py-12">
      <div className="mx-auto max-w-xl">
        <Link href="/" className="text-xl font-black">Neuro Commerce</Link>
        <form onSubmit={handleSubmit} className="mt-8 rounded-[2rem] bg-white p-8 shadow-xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">Customer account</p>
          <h1 className="mt-2 text-3xl font-black">Create your account</h1>

          {error && <div className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          {[
            ['name', 'Full name', 'text'],
            ['email', 'Email', 'email'],
            ['phone', 'Phone (optional)', 'text'],
            ['password', 'Password', 'password'],
          ].map(([key, label, type]) => (
            <label key={key} className="mt-5 block text-sm font-semibold">
              {label}
              <input
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-slate-500"
                type={type}
                value={(form as any)[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                required={key !== 'phone'}
              />
            </label>
          ))}

          <button
            className="mt-7 w-full rounded-xl bg-slate-950 py-3.5 font-bold text-white disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create account'}
          </button>

          <p className="mt-5 text-center text-sm text-slate-500">
            Already registered?{' '}
            <Link href="/login" className="font-bold text-slate-950">Sign in</Link>
          </p>
        </form>
      </div>
    </main>
  );
}
