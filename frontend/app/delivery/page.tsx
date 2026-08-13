'use client';

import {
  useEffect,
  useState,
} from 'react';

import {
  useRouter,
} from 'next/navigation';

import { api } from '@/lib/api';

import {
  clearAuth,
  getStoredUser,
} from '@/lib/auth';


const nextStatus:Record<string,string[]> = {
  PACKED:['READY_FOR_PICKUP'],
  READY_FOR_PICKUP:['SHIPPED'],
  SHIPPED:['IN_TRANSIT','OUT_FOR_DELIVERY'],
  IN_TRANSIT:['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY:[
    'DELIVERED',
    'DELIVERY_FAILED',
  ],
  DELIVERY_FAILED:[
    'OUT_FOR_DELIVERY',
  ],
};


function nice(value:string) {
  return String(value || '')
    .replaceAll('_',' ')
    .toLowerCase()
    .replace(/\b\w/g,(x) => x.toUpperCase());
}


export default function DeliveryDashboard() {

  const router =
    useRouter();

  const [orders,setOrders] =
    useState<any[]>([]);

  const [message,setMessage] =
    useState('');

  const user =
    getStoredUser();


  async function load() {

    const response =
      await api.get(
        '/delivery/orders',
      );

    setOrders(
      response.data || [],
    );
  }


  useEffect(() => {

    const current =
      getStoredUser();

    if (
      !current ||
      current.role !==
        'DELIVERY_AGENT'
    ) {

      router.replace('/login');
      return;
    }

    load();

  },[router]);


  async function update(
    id:string,
    status:string,
    paymentMode:string,
    total:string,
  ) {

    let failureReason:
      string | undefined;

    let codCollected:
      number | undefined;


    if (
      status ===
      'DELIVERY_FAILED'
    ) {

      failureReason =
        prompt(
          'Why did the delivery fail?',
        ) || undefined;

      if (!failureReason) {
        return;
      }
    }


    if (
      status === 'DELIVERED' &&
      paymentMode === 'COD'
    ) {

      const value =
        prompt(
          `COD collected amount. Expected BDT ${total}`,
          total,
        );

      if (
        value === null ||
        value.trim() === ''
      ) {
        return;
      }

      codCollected =
        Number(value);

      if (
        Number.isNaN(
          codCollected,
        )
      ) {
        alert(
          'Enter a valid amount.',
        );
        return;
      }
    }


    try {

      await api.patch(
        `/delivery/orders/${id}/status`,
        {
          status,
          failureReason,
          codCollected,
          note:
            `Updated by delivery agent to ${status}`,
        },
      );

      setMessage(
        `Order moved to ${nice(status)}.`,
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
    <main className="min-h-screen bg-[#f4f5f7] text-slate-950">


      <header className="border-b bg-white">

        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">

          <div>
            <p className="font-black">
              Neuro Delivery
            </p>

            <p className="text-xs text-slate-500">
              {user?.name}
            </p>
          </div>

          <button
            onClick={() => {
              clearAuth();
              router.push('/login');
            }}
            className="rounded-xl border px-4 py-2 text-sm font-bold"
          >
            Sign out
          </button>

        </div>

      </header>


      <div className="mx-auto max-w-6xl px-5 py-10">

        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
          Rider workspace
        </p>

        <h1 className="mt-2 text-4xl font-black">
          My deliveries
        </h1>

        <p className="mt-2 text-slate-500">
          Customer location, navigation, COD and delivery status.
        </p>


        {message && (
          <p className="mt-5 rounded-2xl border bg-white p-4 text-sm font-semibold">
            {message}
          </p>
        )}


        <section className="mt-6 space-y-4">

          {orders.map((order:any) => {

            const hasGPS =
              order.deliveryLatitude !== null &&
              order.deliveryLatitude !== undefined &&
              order.deliveryLongitude !== null &&
              order.deliveryLongitude !== undefined;

            const actions =
              nextStatus[order.status] ||
              [];

            return (
              <article
                key={order.id}
                className="rounded-3xl border bg-white p-6"
              >

                <div className="grid gap-6 lg:grid-cols-[1fr_300px]">

                  <div>

                    <div className="flex flex-wrap gap-2">

                      <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-white">
                        {nice(order.status)}
                      </span>

                      {order.paymentMode === 'COD' && (
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                          COD · BDT {order.total}
                        </span>
                      )}

                    </div>


                    <p className="mt-4 text-2xl font-black">
                      {order.orderNumber}
                    </p>

                    {order.trackingNumber && (
                      <p className="mt-1 text-xs font-bold text-slate-500">
                        Tracking:
                        {' '}
                        {order.trackingNumber}
                      </p>
                    )}


                    <div className="mt-5 rounded-2xl bg-slate-50 p-5">

                      <p className="font-black">
                        {order.customerName}
                      </p>

                      <a
                        href={`tel:${order.phone}`}
                        className="mt-1 inline-flex text-sm font-bold underline"
                      >
                        {order.phone}
                      </a>

                      <p className="mt-4 text-sm">
                        {order.addressLine}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {[
                          order.area,
                          order.district ||
                            order.city,
                          order.division,
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </p>

                      {order.landmark && (
                        <p className="mt-1 text-xs text-slate-500">
                          Landmark:
                          {' '}
                          {order.landmark}
                        </p>
                      )}

                    </div>


                    <div className="mt-4 flex flex-wrap gap-2">

                      <a
                        href={`tel:${order.phone}`}
                        className="rounded-xl border px-4 py-3 text-sm font-bold"
                      >
                        Call customer
                      </a>


                      {hasGPS && (
                        <>
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${order.deliveryLatitude},${order.deliveryLongitude}`}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white"
                          >
                            Navigate
                          </a>

                          <a
                            href={`https://www.google.com/maps?q=${order.deliveryLatitude},${order.deliveryLongitude}`}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-xl border px-4 py-3 text-sm font-bold"
                          >
                            View map
                          </a>
                        </>
                      )}

                    </div>


                    {order.deliveryFailureReason && (
                      <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                        Last failure:
                        {' '}
                        {order.deliveryFailureReason}
                      </p>
                    )}

                  </div>


                  <aside className="h-fit rounded-2xl border p-5">

                    <p className="text-sm font-black">
                      Delivery actions
                    </p>

                    <div className="mt-4 space-y-2">

                      {actions.map(
                        (status) => (

                          <button
                            key={status}
                            onClick={() =>
                              update(
                                order.id,
                                status,
                                order.paymentMode,
                                order.total,
                              )
                            }
                            className={`w-full rounded-xl px-4 py-3 text-sm font-bold ${
                              status ===
                              'DELIVERY_FAILED'
                                ? 'border border-red-200 text-red-600'
                                : status ===
                                  'DELIVERED'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-950 text-white'
                            }`}
                          >
                            {nice(status)}
                          </button>

                        ),
                      )}

                    </div>


                    {!actions.length && (
                      <p className="mt-4 text-sm text-slate-500">
                        No further rider action available.
                      </p>
                    )}


                    {order.codCollected !== null &&
                      order.codCollected !== undefined && (
                        <div className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
                          COD collected:
                          {' '}
                          <b>
                            BDT {order.codCollected}
                          </b>
                        </div>
                      )}

                  </aside>

                </div>

              </article>
            );
          })}


          {!orders.length && (
            <div className="rounded-3xl border border-dashed p-12 text-center text-slate-500">
              No deliveries assigned.
            </div>
          )}

        </section>

      </div>

    </main>
  );
}
