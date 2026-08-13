'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import AdminShell from '@/components/admin-shell';
import { api } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';

export default function AdminUsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    try {
      const response = await api.get('/users');
      setUsers(response.data || []);
    } catch (error: any) {
      setMessage(
        error?.response?.data?.message ||
        'Could not load users.'
      );
    }
  }

  useEffect(() => {
    const user = getStoredUser();

    if (!user || user.role !== 'ADMIN') {
      router.replace('/login');
      return;
    }

    load();
  }, [router]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) return users;

    return users.filter((user) =>
      [
        user.name,
        user.email,
        user.phone,
        user.role,
        user.status,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(q)
        )
    );
  }, [users, search]);

  async function changeStatus(
    id: string,
    status: 'ACTIVE' | 'INACTIVE'
  ) {
    setBusy(id);
    setMessage('');

    try {
      await api.patch(`/users/${id}/status`, {
        status,
      });

      setMessage(
        status === 'ACTIVE'
          ? 'User activated.'
          : 'User deactivated.'
      );

      await load();
    } catch (error: any) {
      setMessage(
        error?.response?.data?.message ||
        'Could not update user.'
      );
    } finally {
      setBusy(null);
    }
  }

  return (
    <AdminShell>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            Customers
          </p>

          <h1 className="mt-2 text-4xl font-black">
            User management
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage registered customer accounts.
          </p>
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="w-full rounded-xl border bg-white px-4 py-3 md:w-80"
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border bg-white p-5">
          <p className="text-sm text-slate-500">
            Total users
          </p>
          <p className="mt-2 text-3xl font-black">
            {users.length}
          </p>
        </div>

        <div className="rounded-3xl border bg-white p-5">
          <p className="text-sm text-slate-500">
            Active
          </p>
          <p className="mt-2 text-3xl font-black">
            {
              users.filter(
                (u) => u.status === 'ACTIVE'
              ).length
            }
          </p>
        </div>

        <div className="rounded-3xl border bg-white p-5">
          <p className="text-sm text-slate-500">
            Inactive
          </p>
          <p className="mt-2 text-3xl font-black">
            {
              users.filter(
                (u) => u.status === 'INACTIVE'
              ).length
            }
          </p>
        </div>
      </div>

      {message && (
        <p className="mt-5 rounded-2xl border bg-white p-4 text-sm font-semibold">
          {message}
        </p>
      )}

      <section className="mt-6 overflow-hidden rounded-3xl border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left text-sm">
            <thead className="border-b bg-slate-50">
              <tr>
                <th className="px-5 py-4">User</th>
                <th className="px-5 py-4">Contact</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {filtered.map((user) => (
                <tr key={user.id}>
                  <td className="px-5 py-4">
                    <p className="font-black">
                      {user.name}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <p>{user.email}</p>
                    <p className="text-xs text-slate-400">
                      {user.phone || 'No phone'}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    {user.role}
                  </td>

                  <td className="px-5 py-4">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">
                      {user.status}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-right">
                    {user.role === 'ADMIN' ? (
                      <span className="text-xs text-slate-400">
                        Protected
                      </span>
                    ) : user.status === 'ACTIVE' ? (
                      <button
                        disabled={busy === user.id}
                        onClick={() =>
                          changeStatus(
                            user.id,
                            'INACTIVE'
                          )
                        }
                        className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600"
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        disabled={busy === user.id}
                        onClick={() =>
                          changeStatus(
                            user.id,
                            'ACTIVE'
                          )
                        }
                        className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white"
                      >
                        Activate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!filtered.length && (
          <div className="p-10 text-center text-slate-500">
            No users found.
          </div>
        )}
      </section>
    </AdminShell>
  );
}
