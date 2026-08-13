'use client';

import {
  useEffect,
  useState,
} from 'react';

import {
  useRouter,
} from 'next/navigation';

import AdminShell from '@/components/admin-shell';

import {
  api,
} from '@/lib/api';

import {
  getStoredUser,
} from '@/lib/auth';


export default function AdminReturns() {

  const router =
    useRouter();

  const [items,setItems] =
    useState<any[]>([]);

  const [message,setMessage] =
    useState('');


  async function load() {

    const response =
      await api.get(
        '/admin/returns',
      );

    setItems(
      response.data || [],
    );
  }


  useEffect(() => {

    const user =
      getStoredUser();

    if (
      !user ||
      user.role !== 'ADMIN'
    ) {
      router.replace('/login');
      return;
    }

    load();

  },[router]);


  async function update(
    id:string,
    status:string,
  ) {

    const adminNote =
      prompt(
        'Optional admin note',
      ) || undefined;

    try {

      await api.patch(
        `/admin/returns/${id}`,
        {
          status,
          adminNote,
        },
      );

      setMessage(
        `Return updated to ${status}.`,
      );

      await load();

    } catch (error:any) {

      setMessage(
        error?.response?.data?.message ||
        'Update failed.',
      );
    }
  }


  return (
    <AdminShell>

      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
        Operations
      </p>

      <h1 className="mt-2 text-4xl font-black">
        Returns & refunds
      </h1>


      {message && (
        <p className="mt-5 rounded-2xl border bg-white p-4 text-sm font-semibold">
          {message}
        </p>
      )}


      <section className="mt-6 space-y-4">

        {items.map((item:any) => (

          <article
            key={item.id}
            className="rounded-3xl border bg-white p-6"
          >

            <div className="flex flex-wrap justify-between gap-4">

              <div>

                <p className="font-black">
                  {item.order?.orderNumber ||
                    item.orderId}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {item.order?.customerName}
                </p>

                <p className="mt-4 text-sm">
                  {item.reason}
                </p>

              </div>

              <span className="h-fit rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold">
                {item.status}
              </span>

            </div>


            <div className="mt-5 flex flex-wrap gap-2">

              {item.status ===
                'REQUESTED' && (
                <>
                  <button
                    onClick={() =>
                      update(
                        item.id,
                        'APPROVED',
                      )
                    }
                    className="rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() =>
                      update(
                        item.id,
                        'REJECTED',
                      )
                    }
                    className="rounded-xl border border-red-200 px-4 py-2 text-xs font-bold text-red-600"
                  >
                    Reject
                  </button>
                </>
              )}


              {item.status ===
                'APPROVED' && (
                <button
                  onClick={() =>
                    update(
                      item.id,
                      'RECEIVED',
                    )
                  }
                  className="rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white"
                >
                  Mark received
                </button>
              )}


              {item.status ===
                'RECEIVED' && (
                <button
                  onClick={() =>
                    update(
                      item.id,
                      'REFUNDED',
                    )
                  }
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white"
                >
                  Mark refunded
                </button>
              )}

            </div>

          </article>

        ))}

      </section>

    </AdminShell>
  );
}
