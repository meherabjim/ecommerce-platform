'use client';

import {
  useEffect,
  useState,
} from 'react';

import {
  useParams,
  useRouter,
} from 'next/navigation';

import Link from 'next/link';

import AdminShell from '@/components/admin-shell';
import { api } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';

const adminNext:Record<string,string[]> = {
  CONFIRMED:['PROCESSING','CANCELLED'],
  PROCESSING:['PACKED','CANCELLED'],
  PACKED:['READY_FOR_PICKUP'],
  READY_FOR_PICKUP:['SHIPPED'],
};

function nice(value:string) {
  return String(value || '')
    .replaceAll('_',' ')
    .toLowerCase()
    .replace(/\b\w/g,(x) => x.toUpperCase());
}

export default function AdminOrderDetails() {

  const params =
    useParams<{id:string}>();

  const router =
    useRouter();

  const [order,setOrder] =
    useState<any>(null);

  const [agents,setAgents] =
    useState<any[]>([]);

  const [message,setMessage] =
    useState('');

  async function load() {

    const [
      orderResponse,
      agentResponse,
    ] = await Promise.all([
      api.get(
        `/admin/orders/${params.id}`,
      ),

      api.get(
        '/users/delivery-agents',
      ),
    ]);

    setOrder(
      orderResponse.data,
    );

    setAgents(
      agentResponse.data || [],
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

    load().catch(() => {
      setMessage(
        'Could not load order.',
      );
    });

  },[params.id,router]);


  async function changeStatus(
    status:string,
  ) {

    try {

      await api.patch(
        `/admin/orders/${order.id}/status`,
        {
          status,
          note:
            `Status changed to ${status} by admin`,
        },
      );

      setMessage(
        `Order moved to ${nice(status)}.`,
      );

      await load();

    } catch (error:any) {

      setMessage(
        error?.response?.data?.message ||
        'Status update failed.',
      );
    }
  }


  async function assign(
    deliveryAgentId:string,
  ) {

    if (!deliveryAgentId) return;

    try {

      await api.patch(
        `/admin/orders/${order.id}/assign-delivery`,
        {
          deliveryAgentId,
        },
      );

      setMessage(
        'Delivery agent assigned.',
      );

      await load();

    } catch (error:any) {

      setMessage(
        error?.response?.data?.message ||
        'Assignment failed.',
      );
    }
  }


  if (!order) {

    return (
      <AdminShell>
        <p>
          Loading order...
        </p>
      </AdminShell>
    );
  }


  const hasGPS =
    order.deliveryLatitude !== null &&
    order.deliveryLatitude !== undefined &&
    order.deliveryLongitude !== null &&
    order.deliveryLongitude !== undefined;


  const address =
    [
      order.addressLine,
      order.area,
      order.district || order.city,
      order.division,
    ]
      .filter(Boolean)
      .join(', ');


  return (
    <AdminShell>

      <div className="flex flex-wrap items-end justify-between gap-4">

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            Order operations
          </p>

          <h1 className="mt-2 text-4xl font-black">
            {order.orderNumber}
          </h1>

          <p className="mt-2 text-slate-500">
            Full fulfillment, customer and delivery information.
          </p>
        </div>

        <Link
          href="/admin/orders"
          className="rounded-xl border bg-white px-4 py-2 text-sm font-bold"
        >
          Back to orders
        </Link>

      </div>


      {message && (
        <p className="mt-5 rounded-2xl border bg-white p-4 text-sm font-semibold">
          {message}
        </p>
      )}


      <div className="mt-6 grid gap-4 md:grid-cols-4">

        {[
          ['Status',nice(order.status)],
          ['Payment',`${order.paymentMode} / ${order.paymentStatus}`],
          ['Total',`BDT ${order.total}`],
          ['Tracking',order.trackingNumber || 'Not created'],
        ].map(([label,value]) => (

          <div
            key={label}
            className="rounded-2xl border bg-white p-5"
          >
            <p className="text-xs text-slate-500">
              {label}
            </p>

            <p className="mt-2 font-black">
              {value}
            </p>
          </div>

        ))}

      </div>


      {/* ADMIN ACTIONS */}

      <section className="mt-6 rounded-3xl border bg-white p-6">

        <h2 className="text-xl font-black">
          Fulfillment actions
        </h2>

        <div className="mt-4 flex flex-wrap gap-2">

          {(adminNext[order.status] || [])
            .map((status) => (

              <button
                key={status}
                onClick={() =>
                  changeStatus(status)
                }
                className={`rounded-xl px-4 py-3 text-sm font-bold ${
                  status === 'CANCELLED'
                    ? 'border border-red-200 text-red-600'
                    : 'bg-slate-950 text-white'
                }`}
              >
                {nice(status)}
              </button>

            ))}

        </div>


        {!['DELIVERED','CANCELLED'].includes(order.status) && (

          <div className="mt-5">

            <label className="text-sm font-bold">
              Delivery agent
            </label>

            <select
              value={
                order.deliveryAgentId ||
                ''
              }
              onChange={(e) =>
                assign(e.target.value)
              }
              className="mt-2 w-full max-w-lg rounded-xl border p-3"
            >

              <option value="">
                Assign delivery agent...
              </option>

              {agents
                .filter(
                  (agent:any) =>
                    agent.status === 'ACTIVE',
                )
                .map(
                  (agent:any) => (

                    <option
                      key={agent.id}
                      value={agent.id}
                    >
                      {agent.name}
                      {' - '}
                      {agent.phone}
                    </option>

                  ),
                )}

            </select>

          </div>
        )}

      </section>


      <div className="mt-6 grid gap-6 xl:grid-cols-2">


        {/* CUSTOMER */}

        <section className="rounded-3xl border bg-white p-6">

          <h2 className="text-xl font-black">
            Customer & delivery
          </h2>

          <p className="mt-5 font-black">
            {order.customerName}
          </p>

          <p className="mt-1 text-sm">
            {order.phone}
          </p>

          {order.email && (
            <p className="mt-1 text-sm text-slate-500">
              {order.email}
            </p>
          )}

          <p className="mt-5 text-sm leading-6">
            {address}
          </p>

          {order.landmark && (
            <p className="mt-1 text-xs text-slate-500">
              Landmark: {order.landmark}
            </p>
          )}

          {hasGPS && (
            <a
              target="_blank"
              rel="noreferrer"
              href={`https://www.google.com/maps?q=${order.deliveryLatitude},${order.deliveryLongitude}`}
              className="mt-5 inline-flex rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white"
            >
              View exact location
            </a>
          )}

          {order.deliveryAgent && (
            <div className="mt-6 rounded-2xl bg-emerald-50 p-4">

              <p className="text-xs font-bold uppercase text-emerald-700">
                Assigned rider
              </p>

              <p className="mt-2 font-black">
                {order.deliveryAgent.name}
              </p>

              <p className="text-sm text-emerald-800">
                {order.deliveryAgent.phone}
              </p>

            </div>
          )}

        </section>


        {/* MONEY */}

        <section className="rounded-3xl border bg-white p-6">

          <h2 className="text-xl font-black">
            Payment summary
          </h2>

          <div className="mt-5 space-y-3 text-sm">

            <div className="flex justify-between">
              <span>Subtotal</span>
              <b>BDT {order.subtotal}</b>
            </div>

            <div className="flex justify-between">
              <span>Shipping</span>
              <b>BDT {order.shippingCharge}</b>
            </div>

            <div className="flex justify-between">
              <span>Discount</span>
              <b>BDT {order.discount}</b>
            </div>

            <div className="border-t pt-3">
              <div className="flex justify-between text-lg">
                <b>Total</b>
                <b>BDT {order.total}</b>
              </div>
            </div>

            {order.codCollected !== null &&
              order.codCollected !== undefined && (
                <div className="flex justify-between rounded-xl bg-emerald-50 p-3 text-emerald-800">
                  <span>COD collected</span>
                  <b>BDT {order.codCollected}</b>
                </div>
              )}

          </div>

        </section>

      </div>


      {/* ITEMS */}

      <section className="mt-6 rounded-3xl border bg-white p-6">

        <h2 className="text-xl font-black">
          Ordered items
        </h2>

        <div className="mt-4 divide-y">

          {order.items.map(
            (item:any) => (

              <div
                key={item.id}
                className="flex flex-wrap justify-between gap-4 py-4"
              >

                <div>
                  <p className="font-black">
                    {item.productName}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {item.sku}
                    {' · Qty '}
                    {item.quantity}
                  </p>
                </div>

                <p className="font-black">
                  BDT {item.lineTotal}
                </p>

              </div>

            ),
          )}

        </div>

      </section>


      {/* HISTORY */}

      <section className="mt-6 rounded-3xl border bg-white p-6">

        <h2 className="text-xl font-black">
          Complete timeline
        </h2>

        <div className="mt-5 space-y-4">

          {order.history.map(
            (entry:any) => (

              <div
                key={entry.id}
                className="border-l-2 border-slate-950 pl-4"
              >

                <p className="font-black">
                  {nice(entry.newStatus)}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {entry.note ||
                    'Status updated'}
                </p>

                {entry.createdAt && (
                  <p className="mt-1 text-xs text-slate-400">
                    {new Date(
                      entry.createdAt,
                    ).toLocaleString()}
                  </p>
                )}

              </div>

            ),
          )}

        </div>

      </section>

    </AdminShell>
  );
}
