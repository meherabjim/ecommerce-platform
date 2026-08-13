'use client';

import {
  useEffect,
  useState,
} from 'react';

import {
  useRouter,
} from 'next/navigation';

import Navbar from '@/components/navbar';

import {
  api,
} from '@/lib/api';

import {
  getStoredUser,
} from '@/lib/auth';


export default function NotificationsPage() {

  const router =
    useRouter();

  const [items,setItems] =
    useState<any[]>([]);


  async function load() {

    const response =
      await api.get(
        '/notifications',
      );

    setItems(
      response.data || [],
    );
  }


  useEffect(() => {

    if (!getStoredUser()) {
      router.replace('/login');
      return;
    }

    load();

  },[router]);


  async function read(
    id:string,
  ) {

    await api.patch(
      `/notifications/${id}/read`,
    );

    await load();
  }


  return (
    <main className="min-h-screen bg-[#f7f7f5]">

      <Navbar />

      <div className="mx-auto max-w-4xl px-5 py-12">

        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
          Customer portal
        </p>

        <h1 className="mt-2 text-4xl font-black">
          Notifications
        </h1>


        <div className="mt-8 space-y-3">

          {items.map((item:any) => (

            <button
              key={item.id}
              onClick={() =>
                read(item.id)
              }
              className={`w-full rounded-2xl border p-5 text-left ${
                item.isRead
                  ? 'bg-white'
                  : 'border-slate-950 bg-slate-50'
              }`}
            >

              <div className="flex justify-between gap-4">

                <div>
                  <p className="font-black">
                    {item.title}
                  </p>

                  <p className="mt-2 text-sm text-slate-600">
                    {item.message}
                  </p>
                </div>

                {!item.isRead && (
                  <span className="h-fit rounded-full bg-slate-950 px-2 py-1 text-[10px] font-bold text-white">
                    NEW
                  </span>
                )}

              </div>

            </button>

          ))}

        </div>


        {!items.length && (
          <div className="mt-8 rounded-3xl border border-dashed p-12 text-center text-slate-500">
            No notifications yet.
          </div>
        )}

      </div>

    </main>
  );
}
