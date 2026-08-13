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


export default function ReturnsPage() {

  const router =
    useRouter();

  const [items,setItems] =
    useState<any[]>([]);


  useEffect(() => {

    if (!getStoredUser()) {
      router.replace('/login');
      return;
    }

    api.get('/returns')
      .then(
        response =>
          setItems(
            response.data || [],
          ),
      );

  },[router]);


  return (
    <main className="min-h-screen bg-[#f7f7f5]">

      <Navbar />

      <div className="mx-auto max-w-5xl px-5 py-12">

        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
          Customer portal
        </p>

        <h1 className="mt-2 text-4xl font-black">
          Returns & refunds
        </h1>


        <div className="mt-8 space-y-4">

          {items.map((item:any) => (

            <article
              key={item.id}
              className="rounded-3xl border bg-white p-6"
            >

              <div className="flex flex-wrap justify-between gap-4">

                <div>
                  <p className="font-black">
                    Return request
                  </p>

                  <p className="mt-2 text-sm text-slate-600">
                    {item.reason}
                  </p>
                </div>

                <span className="h-fit rounded-full bg-slate-100 px-3 py-2 text-xs font-bold">
                  {item.status}
                </span>

              </div>

              {item.adminNote && (
                <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm">
                  Admin:
                  {' '}
                  {item.adminNote}
                </p>
              )}

            </article>

          ))}

        </div>


        {!items.length && (
          <div className="mt-8 rounded-3xl border border-dashed p-12 text-center text-slate-500">
            No return requests.
          </div>
        )}

      </div>

    </main>
  );
}
