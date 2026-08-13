'use client';

const lifecycle = [
  'CONFIRMED',
  'PROCESSING',
  'PACKED',
  'READY_FOR_PICKUP',
  'SHIPPED',
  'IN_TRANSIT',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

function nice(value:string) {
  return String(value || '')
    .replaceAll('_',' ')
    .toLowerCase()
    .replace(/\b\w/g,(x) => x.toUpperCase());
}

export default function OrderTrackingPanel({
  order,
}:{
  order:any;
}) {
  if (!order) return null;

  const currentIndex =
    lifecycle.indexOf(order.status);

  const hasGPS =
    order.deliveryLatitude !== null &&
    order.deliveryLatitude !== undefined &&
    order.deliveryLongitude !== null &&
    order.deliveryLongitude !== undefined;

  const mapUrl = hasGPS
    ? `https://www.google.com/maps?q=${order.deliveryLatitude},${order.deliveryLongitude}`
    : '';

  const address = [
    order.addressLine,
    order.area,
    order.district || order.city,
    order.division,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 text-slate-950">

      <div className="flex flex-wrap items-start justify-between gap-4">

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
            Delivery tracking
          </p>

          <h2 className="mt-2 text-2xl font-black">
            {nice(order.status)}
          </h2>

          {order.trackingNumber && (
            <p className="mt-1 text-sm text-slate-500">
              Tracking ID:
              {' '}
              <b>{order.trackingNumber}</b>
            </p>
          )}
        </div>

        <span className="rounded-full bg-slate-950 px-4 py-2 text-xs font-bold text-white">
          {nice(order.status)}
        </span>

      </div>


      {/* TRACKING PROGRESS */}

      {!['CANCELLED','DELIVERY_FAILED'].includes(order.status) && (
        <div className="mt-7 overflow-x-auto">
          <div className="flex min-w-[760px] items-start">

            {lifecycle.map((status,index) => {

              const complete =
                currentIndex >= index;

              return (
                <div
                  key={status}
                  className="relative flex flex-1 flex-col items-center"
                >

                  {index > 0 && (
                    <div
                      className={`absolute right-1/2 top-[10px] h-[2px] w-full ${
                        complete
                          ? 'bg-slate-950'
                          : 'bg-slate-200'
                      }`}
                    />
                  )}

                  <div
                    className={`relative z-10 h-5 w-5 rounded-full border-4 ${
                      complete
                        ? 'border-slate-950 bg-slate-950'
                        : 'border-slate-200 bg-white'
                    }`}
                  />

                  <p className="mt-3 max-w-[90px] text-center text-[11px] font-bold">
                    {nice(status)}
                  </p>

                </div>
              );
            })}

          </div>
        </div>
      )}


      {order.status === 'DELIVERY_FAILED' && (
        <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
          <b>Delivery attempt failed.</b>

          {order.deliveryFailureReason && (
            <p className="mt-1">
              {order.deliveryFailureReason}
            </p>
          )}
        </div>
      )}


      {/* DELIVERY INFORMATION */}

      <div className="mt-7 grid gap-4 lg:grid-cols-2">

        <div className="rounded-2xl bg-slate-50 p-5">

          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
            Delivery address
          </p>

          <p className="mt-3 font-black">
            {order.customerName}
          </p>

          <p className="mt-1 text-sm">
            {order.phone}
          </p>

          <p className="mt-3 text-sm text-slate-600">
            {address}
          </p>

          {order.landmark && (
            <p className="mt-1 text-xs text-slate-500">
              Landmark: {order.landmark}
            </p>
          )}

          {hasGPS && (
            <a
              href={mapUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold"
            >
              View delivery location
            </a>
          )}

        </div>


        <div className="rounded-2xl bg-slate-50 p-5">

          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
            Delivery agent
          </p>

          {order.deliveryAgent ? (
            <>
              <p className="mt-3 font-black">
                {order.deliveryAgent.name}
              </p>

              <p className="mt-1 text-sm text-slate-600">
                {order.deliveryAgent.phone || 'No phone'}
              </p>

              {order.deliveryAgent.phone && (
                <a
                  href={`tel:${order.deliveryAgent.phone}`}
                  className="mt-4 inline-flex rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white"
                >
                  Call delivery agent
                </a>
              )}
            </>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              A delivery agent has not been assigned yet.
            </p>
          )}

          <div className="mt-5 border-t pt-4 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-slate-500">
                Payment
              </span>

              <b>
                {order.paymentMode} / {order.paymentStatus}
              </b>
            </div>

            {order.codCollected !== null &&
              order.codCollected !== undefined && (
                <div className="mt-2 flex justify-between gap-3">
                  <span className="text-slate-500">
                    COD collected
                  </span>

                  <b>
                    BDT {order.codCollected}
                  </b>
                </div>
              )}
          </div>

        </div>

      </div>

    </section>
  );
}
