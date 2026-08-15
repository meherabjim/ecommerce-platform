'use client';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useRouter,
} from 'next/navigation';

import Link from 'next/link';

import AdminShell from '@/components/admin-shell';

import {
  api,
} from '@/lib/api';

import {
  clearAuth,
  getStoredUser,
} from '@/lib/auth';


export default function AdminDashboard() {

  const router =
    useRouter();

  const [orders,setOrders] =
    useState<any[]>([]);

  const [users,setUsers] =
    useState<any[]>([]);

  const [inventory,setInventory] =
    useState<any[]>([]);

  const [products,setProducts] =
    useState<any[]>([]);

  const [returns,setReturns] =
    useState<any[]>([]);

  const [shipping,setShipping] =
    useState<any[]>([]);

  const [loading,setLoading] =
    useState(true);


  useEffect(() => {

    const current =
      getStoredUser();

    const allowedRoles = [
      'SUPER_ADMIN',
      'ADMIN',
      'CATALOG_MANAGER',
      'INVENTORY_MANAGER',
      'ORDER_MANAGER',
      'CUSTOMER_SUPPORT',
      'MARKETING_MANAGER',
      'FINANCE',
    ];


    if(
      !current ||
      !allowedRoles.includes(
        String(current.role).toUpperCase()
      )
    ){

      router.replace('/');
      return;

    }


    Promise.all([
      api.get('/admin/orders'),
      api.get('/users'),
      api.get('/inventory'),
      api.get('/catalog/products'),
      api.get('/admin/returns'),
      api.get('/admin/shipping-zones'),
    ])
      .then(
        ([
          orderResponse,
          userResponse,
          inventoryResponse,
          productResponse,
          returnResponse,
          shippingResponse,
        ]) => {

          setOrders(
            orderResponse.data || [],
          );

          setUsers(
            userResponse.data || [],
          );

          setInventory(
            inventoryResponse.data || [],
          );

          setProducts(
            productResponse.data || [],
          );

          setReturns(
            returnResponse.data || [],
          );

          setShipping(
            shippingResponse.data || [],
          );
        },
      )
      .catch(() => {

        // Keep the valid session. A failed dashboard request must not log the user out.
        setLoading(false);
      })
      .finally(
        () =>
          setLoading(false),
      );

  },[router]);


  const metrics =
    useMemo(() => {

      const customers =
        users.filter(
          user =>
            user.role === 'CUSTOMER',
        ).length;

      const riders =
        users.filter(
          user =>
            user.role ===
            'DELIVERY_AGENT',
        ).length;

      const delivered =
        orders.filter(
          order =>
            order.status ===
            'DELIVERED',
        );

      const cancelled =
        orders.filter(
          order =>
            order.status ===
            'CANCELLED',
        ).length;

      const activeDelivery =
        orders.filter(
          order =>
            [
              'READY_FOR_PICKUP',
              'SHIPPED',
              'IN_TRANSIT',
              'OUT_FOR_DELIVERY',
            ].includes(
              order.status,
            ),
        ).length;

      const grossSales =
        delivered.reduce(
          (sum,order) =>
            sum +
            Number(
              order.total || 0,
            ),
          0,
        );

      const paidRevenue =
        orders
          .filter(
            order =>
              order.paymentStatus ===
              'PAID',
          )
          .reduce(
            (sum,order) =>
              sum +
              Number(
                order.total || 0,
              ),
            0,
          );

      const lowStock =
        inventory.filter(
          item =>
            item.lowStock,
        ).length;

      const available =
        inventory.reduce(
          (sum,item) =>
            sum +
            Number(
              item.available || 0,
            ),
          0,
        );

      const pendingReturns =
        returns.filter(
          item =>
            item.status ===
            'REQUESTED',
        ).length;

      const averageOrder =
        orders.length
          ? orders.reduce(
              (sum,order) =>
                sum +
                Number(
                  order.total || 0,
                ),
              0,
            ) /
            orders.length
          : 0;

      return {
        customers,
        riders,
        delivered:
          delivered.length,
        cancelled,
        activeDelivery,
        grossSales,
        paidRevenue,
        lowStock,
        available,
        pendingReturns,
        averageOrder,
      };

    },[
      users,
      orders,
      inventory,
      returns,
    ]);


  const statuses = [
    'CONFIRMED',
    'PROCESSING',
    'PACKED',
    'READY_FOR_PICKUP',
    'SHIPPED',
    'IN_TRANSIT',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'DELIVERY_FAILED',
    'CANCELLED',
  ];


  if(loading){

    return (
      <main className="grid min-h-screen place-items-center">
        Loading dashboard...
      </main>
    );
  }


  return (
    <AdminShell>

      <div className="flex flex-wrap items-end justify-between gap-4">

        <div>

          <p className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-black uppercase tracking-[.18em] text-blue-700">
            Admin overview
          </p>

          <h1 className="mt-3 bg-gradient-to-r from-slate-950 via-blue-800 to-violet-700 bg-clip-text text-4xl font-black tracking-tight text-transparent">
            Commerce dashboard
          </h1>

          <p className="mt-2 text-slate-500">
            Sales, fulfillment, customers, inventory and delivery operations.
          </p>

        </div>


        <div className="flex flex-wrap gap-2">

          <Link
            href="/admin/catalog"
            className="rounded-xl border border-blue-200 bg-white/80 px-4 py-3 text-sm font-black text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            Add product
          </Link>

          <Link
            href="/admin/orders"
            className="rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5"
          >
            Process orders
          </Link>

        </div>

      </div>


      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {[
          [
            'Paid revenue',
            `BDT ${metrics.paidRevenue.toFixed(2)}`,
            '/admin/orders',
          ],
          [
            'Orders',
            orders.length,
            '/admin/orders',
          ],
          [
            'Customers',
            metrics.customers,
            '/admin/users',
          ],
          [
            'Avg. order value',
            `BDT ${metrics.averageOrder.toFixed(2)}`,
            '/admin/orders',
          ],
        ].map(
          ([label,value,href]) => (

            <Link
              key={String(label)}
              href={String(href)}
              className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-[0_12px_35px_rgba(15,23,42,.06)] backdrop-blur transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
            >

              <p className="text-sm font-semibold text-slate-500">
                {label}
              </p>

              <p className="mt-3 text-3xl font-black">
                {value}
              </p>

            </Link>

          ),
        )}

      </section>


      <section className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <Link
          href="/admin/delivery"
          className="rounded-3xl bg-gradient-to-br from-blue-600 via-blue-600 to-violet-600 p-6 text-white shadow-xl shadow-blue-200/70"
        >

          <p className="text-sm text-white/50">
            Active deliveries
          </p>

          <p className="mt-3 text-4xl font-black tracking-tight">
            {metrics.activeDelivery}
          </p>

          <p className="mt-2 text-xs text-white/50">
            {metrics.riders} delivery agents
          </p>

        </Link>


        <Link
          href="/admin/inventory"
          className="rounded-[1.5rem] border border-white/70 bg-white/85 p-6 shadow-[0_12px_35px_rgba(15,23,42,.06)] backdrop-blur"
        >

          <p className="text-sm text-slate-500">
            Low-stock variants
          </p>

          <p className="mt-3 text-4xl font-black tracking-tight">
            {metrics.lowStock}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            {metrics.available} units available
          </p>

        </Link>


        <Link
          href="/admin/returns"
          className="rounded-[1.5rem] border border-white/70 bg-white/85 p-6 shadow-[0_12px_35px_rgba(15,23,42,.06)] backdrop-blur"
        >

          <p className="text-sm text-slate-500">
            Pending returns
          </p>

          <p className="mt-3 text-4xl font-black tracking-tight">
            {metrics.pendingReturns}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            {returns.length} total requests
          </p>

        </Link>


        <Link
          href="/admin/shipping"
          className="rounded-[1.5rem] border border-white/70 bg-white/85 p-6 shadow-[0_12px_35px_rgba(15,23,42,.06)] backdrop-blur"
        >

          <p className="text-sm text-slate-500">
            Shipping rules
          </p>

          <p className="mt-3 text-4xl font-black tracking-tight">
            {shipping.length}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Configured delivery zones
          </p>

        </Link>

      </section>


      <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.4fr]">

        <div className="rounded-[1.5rem] border border-white/70 bg-white/85 p-6 shadow-[0_12px_35px_rgba(15,23,42,.06)] backdrop-blur">

          <h2 className="text-xl font-black">
            Order pipeline
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Fulfillment distribution.
          </p>


          <div className="mt-6 space-y-3">

            {statuses.map(
              status => {

                const count =
                  orders.filter(
                    order =>
                      order.status ===
                      status,
                  ).length;

                const width =
                  orders.length
                    ? Math.max(
                        count
                          ? 5
                          : 0,
                        Math.round(
                          (
                            count /
                            orders.length
                          ) *
                          100,
                        ),
                      )
                    : 0;

                return (
                  <div key={status}>

                    <div className="flex justify-between gap-3 text-xs">

                      <span className="font-bold">
                        {status.replaceAll('_',' ')}
                      </span>

                      <span>
                        {count}
                      </span>

                    </div>

                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">

                      <div
                        className="h-full rounded-full bg-[#1464f4]"
                        style={{
                          width:
                            `${width}%`,
                        }}
                      />

                    </div>

                  </div>
                );
              },
            )}

          </div>

        </div>


        <div className="rounded-[1.5rem] border border-white/70 bg-white/85 p-6 shadow-[0_12px_35px_rgba(15,23,42,.06)] backdrop-blur">

          <div className="flex items-end justify-between">

            <div>

              <h2 className="text-xl font-black">
                Recent orders
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Latest customer transactions.
              </p>

            </div>

            <Link
              href="/admin/orders"
              className="text-sm font-bold underline"
            >
              View all
            </Link>

          </div>


          <div className="mt-5 space-y-3">

            {orders
              .slice(0,6)
              .map(
                order => (

                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="grid gap-3 rounded-2xl border border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/50 p-4 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md md:grid-cols-[1.2fr_0.8fr_0.7fr]"
                  >

                    <div>

                      <p className="font-black">
                        {order.orderNumber}
                      </p>

                      <p className="text-xs text-slate-500">
                        {order.customerName}
                        {' · '}
                        {order.area ||
                          order.district ||
                          order.city}
                      </p>

                    </div>


                    <div>

                      <p className="text-[10px] font-bold uppercase text-slate-400">
                        Status
                      </p>

                      <p className="text-sm font-bold">
                        {order.status.replaceAll('_',' ')}
                      </p>

                    </div>


                    <div className="md:text-right">

                      <p className="text-[10px] font-bold uppercase text-slate-400">
                        Total
                      </p>

                      <p className="font-black">
                        BDT {order.total}
                      </p>

                    </div>

                  </Link>

                ),
              )}

          </div>

        </div>

      </section>

    </AdminShell>
  );
}


