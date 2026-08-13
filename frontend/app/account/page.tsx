'use client';

import {
  useEffect,
  useState,
} from 'react';

import {
  useRouter,
} from 'next/navigation';

import Link from 'next/link';

import Navbar from '@/components/navbar';

import {
  api,
} from '@/lib/api';

import {
  getStoredUser,
} from '@/lib/auth';


export default function AccountPage() {

  const router =
    useRouter();

  const [user,setUser] =
    useState<any>(null);

  const [orders,setOrders] =
    useState<any[]>([]);

  const [notifications,setNotifications] =
    useState<any[]>([]);


  useEffect(() => {

    const current =
      getStoredUser();

    if (!current) {
      router.replace('/login');
      return;
    }

    setUser(current);

    Promise.all([
      api.get('/me/orders'),
      api.get('/notifications'),
    ])
      .then(
        ([ordersResponse,notificationResponse]) => {

          setOrders(
            ordersResponse.data || [],
          );

          setNotifications(
            notificationResponse.data || [],
          );
        },
      );

  },[router]);


  if (!user) return null;


  const active =
    orders.filter(
      order =>
        ![
          'DELIVERED',
          'CANCELLED',
        ].includes(
          order.status,
        ),
    ).length;


  const unread =
    notifications.filter(
      item =>
        !item.isRead,
    ).length;


  return (
    <main className="min-h-screen bg-[#f7f7f5]">

      <Navbar />

      <div className="mx-auto max-w-6xl px-5 py-12">

        <div className="rounded-[2rem] bg-slate-950 p-8 text-white">

          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">
            Customer portal
          </p>

          <h1 className="mt-2 text-4xl font-black">
            Hello, {user.name}
          </h1>

          <p className="mt-2 text-white/50">
            {user.email}
          </p>

        </div>


        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {[
            [
              'Orders',
              orders.length,
              '/account',
            ],
            [
              'Active delivery',
              active,
              '/account',
            ],
            [
              'Wishlist',
              'View',
              '/account/wishlist',
            ],
            [
              'Notifications',
              unread,
              '/account/notifications',
            ],
          ].map(
            ([label,value,href]) => (

              <Link
                key={String(label)}
                href={String(href)}
                className="rounded-3xl border bg-white p-5"
              >
                <p className="text-sm text-slate-500">
                  {label}
                </p>

                <p className="mt-3 text-3xl font-black">
                  {value}
                </p>
              </Link>

            ),
          )}

        </section>


        <section className="mt-6 grid gap-4 md:grid-cols-3">

          <Link
            href="/account/addresses"
            className="rounded-2xl border bg-white p-5 font-bold"
          >
            Saved addresses
          </Link>

          <Link
            href="/account/returns"
            className="rounded-2xl border bg-white p-5 font-bold"
          >
            Returns & refunds
          </Link>

          <Link
            href="/shop"
            className="rounded-2xl bg-slate-950 p-5 font-bold text-white"
          >
            Continue shopping
          </Link>

        </section>


        <section className="mt-6 rounded-3xl bg-white p-6">

          <div className="flex items-end justify-between">

            <div>
              <h2 className="text-2xl font-black">
                Your orders
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Track order, payment and fulfillment status.
              </p>
            </div>

          </div>


          <div className="mt-5 space-y-3">

            {orders.map(
              order => (

                <Link
                  key={order.id}
                  href={`/account/orders/${order.id}`}
                  className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-950 transition hover:bg-slate-100 md:grid-cols-4"
                >

                  <span className="font-black">
                    {order.orderNumber}
                  </span>

                  <span>
                    {order.status}
                  </span>

                  <span>
                    {order.paymentStatus}
                  </span>

                  <span className="font-black md:text-right">
                    BDT {order.total}
                  </span>

                </Link>

              ),
            )}


            {!orders.length && (
              <p className="rounded-2xl border border-dashed p-8 text-center text-slate-500">
                No orders yet.
              </p>
            )}

          </div>

        </section>

      </div>

    </main>
  );
}
