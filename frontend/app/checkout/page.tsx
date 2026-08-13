'use client';

import {
  FormEvent,
  useEffect,
  useState,
} from 'react';

import Link from 'next/link';

import {
  useRouter,
} from 'next/navigation';

import Navbar from '@/components/navbar';
import LocationPicker from '@/components/location-picker';
import CompactLocationSelector from '@/components/compact-location-selector';

import { api } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';


export default function CheckoutPage() {

  const router = useRouter();

  const [cart,setCart] =
    useState<any>(null);

  const [addresses,setAddresses] =
    useState<any[]>([]);

  const [selected,setSelected] =
    useState('');

  const [manual,setManual] =
    useState(false);

  const [saveAddress,setSaveAddress] =
    useState(true);

  const [error,setError] =
    useState('');

  const [busy,setBusy] =
    useState(false);


  const [form,setForm] =
    useState<any>({
      customerName:'',
      phone:'',
      email:'',
      addressLine:'',
      city:'',
      division:'',
      district:'',
      area:'',
      landmark:'',
      postalCode:'',
      addressLabel:'HOME',

      latitude:null,
      longitude:null,
      locationSource:'NONE',

      notes:'',
      paymentMode:'COD',
      couponCode:'',
    });


  function applyAddress(
    address:any,
  ) {

    setForm((current:any) => ({
      ...current,

      customerName:
        address.recipientName,

      phone:
        address.phone,

      addressLine:
        address.addressLine,

      city:
        address.district,

      division:
        address.division,

      district:
        address.district,

      area:
        address.area,

      landmark:
        address.landmark || '',

      postalCode:
        address.postalCode || '',

      addressLabel:
        address.type,

      latitude:
        address.latitude === null
          ? null
          : Number(
              address.latitude,
            ),

      longitude:
        address.longitude === null
          ? null
          : Number(
              address.longitude,
            ),

      locationSource:
        address.locationSource ||
        'NONE',
    }));
  }


  useEffect(() => {

    const user =
      getStoredUser();

    if (!user) {
      router.replace('/login');
      return;
    }

    setForm(
      (current:any) => ({
        ...current,

        customerName:
          user.name,

        phone:
          user.phone || '',

        email:
          user.email,
      }),
    );


    Promise.all([
      api.get('/cart'),
      api.get(
        '/users/me/addresses',
      ),
    ])
      .then(
        ([cartResponse,addressResponse]) => {

          if (
            !cartResponse.data.items.length
          ) {
            router.replace('/cart');
            return;
          }

          setCart(
            cartResponse.data,
          );

          const list =
            addressResponse.data || [];

          setAddresses(
            list,
          );

          const defaultAddress =
            list.find(
              (x:any) =>
                x.isDefault,
            );

          if (defaultAddress) {

            setSelected(
              defaultAddress.id,
            );

            applyAddress(
              defaultAddress,
            );

            setManual(false);

          } else {

            setManual(true);
          }
        },
      )
      .catch(() => {
        setError(
          'Could not prepare checkout.',
        );
      });

  },[router]);


  function useSavedAddress(
    address:any,
  ) {

    setSelected(
      address.id,
    );

    applyAddress(
      address,
    );

    setManual(false);
  }


  function useNewAddress() {

    const user =
      getStoredUser();

    setSelected('');

    setManual(true);

    setForm(
      (current:any) => ({
        ...current,

        customerName:
          user?.name || '',

        phone:
          user?.phone || '',

        addressLine:'',

        city:'',

        division:'',

        district:'',

        area:'',

        landmark:'',

        postalCode:'',

        addressLabel:'HOME',

        latitude:null,

        longitude:null,

        locationSource:'NONE',
      }),
    );
  }


  async function submit(
    event:FormEvent,
  ) {

    event.preventDefault();

    setBusy(true);
    setError('');


    try {

      let addressId =
        selected ||
        undefined;


      // ----------------------------------------
      // Save a newly entered address
      // ----------------------------------------

      if (
        manual &&
        saveAddress
      ) {

        const saved =
          await api.post(
            '/users/me/addresses',
            {
              recipientName:
                form.customerName,

              phone:
                form.phone,

              type:'HOME',

              division:
                form.division,

              district:
                form.district,

              area:
                form.area,

              addressLine:
                form.addressLine,

              landmark:
                undefined,

              postalCode:
                form.postalCode ||
                undefined,

              latitude:
                form.latitude ??
                undefined,

              longitude:
                form.longitude ??
                undefined,

              locationSource:
                form.locationSource,

              isDefault:
                addresses.length === 0,
            },
          );

        addressId =
          saved.data.id;
      }


      const response =
        await api.post(
          '/checkout',
          {
            ...form,

            city:
              form.district,

            addressId,
          },
        );


      router.push(
        `/account/orders/${response.data.id}`,
      );

    } catch (e:any) {

      const message =
        e?.response?.data?.message;

      setError(
        Array.isArray(message)
          ? message.join(', ')
          : message ||
            'Checkout failed.',
      );

    } finally {

      setBusy(false);
    }
  }


  if (!cart) {

    return (
      <main className="grid min-h-screen place-items-center">
        Preparing checkout...
      </main>
    );
  }


  const shipping =
    cart.subtotal >= 3000
      ? 0
      : 120;


  return (
    <main className="min-h-screen bg-[#f7f7f5] text-slate-950">

      <Navbar />


      <div className="mx-auto max-w-6xl px-5 py-10">

        <div className="flex flex-wrap items-end justify-between gap-4">

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              Secure checkout
            </p>

            <h1 className="mt-2 text-4xl font-black">
              Checkout
            </h1>
          </div>

          <Link
            href="/account/addresses"
            className="text-sm font-bold underline"
          >
            Manage addresses
          </Link>

        </div>


        <form
          onSubmit={submit}
          className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]"
        >

          <section className="space-y-6">


            {/* ======================================
                DELIVERY ADDRESS
            ====================================== */}

            <div className="rounded-3xl border bg-white p-6">

              <div className="flex flex-wrap items-center justify-between gap-3">

                <div>
                  <h2 className="text-xl font-black">
                    Delivery address
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Choose a saved address or add a new one.
                  </p>
                </div>

                {addresses.length > 0 && (
                  <button
                    type="button"
                    onClick={useNewAddress}
                    className="rounded-xl border px-4 py-2 text-sm font-bold"
                  >
                    + New address
                  </button>
                )}

              </div>


              {error && (
                <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </p>
              )}


              {/* SAVED ADDRESSES */}

              {addresses.length > 0 && (
                <div className="mt-5 grid gap-3 md:grid-cols-2">

                  {addresses.map(
                    (address:any) => (

                      <button
                        type="button"
                        key={address.id}
                        onClick={() =>
                          useSavedAddress(
                            address,
                          )
                        }
                        className={`rounded-2xl border p-4 text-left transition ${
                          !manual &&
                          selected ===
                            address.id
                            ? 'border-slate-950 ring-1 ring-slate-950'
                            : 'border-slate-200 hover:border-slate-400'
                        }`}
                      >

                        <div className="flex gap-2">

                          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold">
                            {address.type}
                          </span>

                          {address.isDefault && (
                            <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
                              DEFAULT
                            </span>
                          )}

                          {address.latitude &&
                            address.longitude && (
                              <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">
                                GPS
                              </span>
                            )}

                        </div>


                        <p className="mt-3 font-black">
                          {address.recipientName}
                        </p>

                        <p className="text-sm text-slate-500">
                          {address.phone}
                        </p>

                        <p className="mt-2 text-sm">
                          {address.addressLine}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {[
                            address.area,
                            address.district,
                          ]
                            .filter(Boolean)
                            .join(', ')}
                        </p>

                      </button>

                    ),
                  )}

                </div>
              )}


              {/* NEW ADDRESS */}

              {manual && (

                <div className="mt-6 border-t pt-6">

                  <h3 className="font-black">
                    New delivery address
                  </h3>


                  <div className="mt-4 grid gap-4 sm:grid-cols-2">

                    <label className="text-sm font-bold">

                      Full name

                      <input
                        required
                        value={
                          form.customerName
                        }
                        onChange={(e) =>
                          setForm({
                            ...form,
                            customerName:
                              e.target.value,
                          })
                        }
                        className="mt-2 w-full rounded-xl border p-3 font-normal"
                      />

                    </label>


                    <label className="text-sm font-bold">

                      Phone

                      <input
                        required
                        value={
                          form.phone
                        }
                        onChange={(e) =>
                          setForm({
                            ...form,
                            phone:
                              e.target.value,
                          })
                        }
                        className="mt-2 w-full rounded-xl border p-3 font-normal"
                      />

                    </label>


                    <div className="sm:col-span-2">

                      <CompactLocationSelector
                        division={
                          form.division
                        }
                        district={
                          form.district
                        }
                        area={
                          form.area
                        }
                        postalCode={
                          form.postalCode
                        }
                        onChange={(
                          location,
                        ) =>
                          setForm({
                            ...form,
                            ...location,
                            city:
                              location.district,
                          })
                        }
                      />

                    </div>


                    <label className="text-sm font-bold sm:col-span-2">

                      House / Road / Village / Full address

                      <textarea
                        required
                        value={
                          form.addressLine
                        }
                        onChange={(e) =>
                          setForm({
                            ...form,
                            addressLine:
                              e.target.value,
                          })
                        }
                        className="mt-2 min-h-24 w-full rounded-xl border p-3 font-normal"
                        placeholder="House, road, block, village..."
                      />

                    </label>


                    <div className="sm:col-span-2">

                      <LocationPicker
                        latitude={
                          form.latitude
                        }
                        longitude={
                          form.longitude
                        }
                        locationSource={
                          form.locationSource
                        }
                        onChange={(
                          latitude,
                          longitude,
                          locationSource,
                        ) =>
                          setForm({
                            ...form,
                            latitude,
                            longitude,
                            locationSource,
                          })
                        }
                      />

                    </div>


                    <label className="flex items-center gap-2 text-sm font-semibold sm:col-span-2">

                      <input
                        type="checkbox"
                        checked={
                          saveAddress
                        }
                        onChange={(e) =>
                          setSaveAddress(
                            e.target.checked,
                          )
                        }
                      />

                      Save this address for next order

                    </label>

                  </div>

                </div>

              )}

            </div>



            {/* ======================================
                PAYMENT
            ====================================== */}

            <div className="rounded-3xl border bg-white p-6">

              <h2 className="text-xl font-black">
                Payment
              </h2>

              <label className="mt-4 flex items-center gap-3 rounded-xl border border-slate-950 p-4">

                <input
                  type="radio"
                  checked
                  readOnly
                />

                <span className="font-semibold">
                  Cash on delivery
                </span>

              </label>


              <label className="mt-4 block text-sm font-bold">

                Coupon code

                <input
                  value={
                    form.couponCode
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      couponCode:
                        e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="Optional"
                  className="mt-2 w-full rounded-xl border p-3 font-normal uppercase"
                />

              </label>

            </div>

          </section>



          {/* ======================================
              SUMMARY
          ====================================== */}

          <aside className="h-fit rounded-3xl bg-slate-950 p-6 text-white lg:sticky lg:top-6">

            <h2 className="text-xl font-black">
              Order summary
            </h2>


            <div className="mt-5 space-y-3 text-sm">

              {cart.items.map(
                (item:any) => (

                  <div
                    key={item.id}
                    className="flex justify-between gap-4"
                  >

                    <span>
                      {item.productName}
                      {' × '}
                      {item.quantity}
                    </span>

                    <span>
                      BDT {item.lineTotal}
                    </span>

                  </div>

                ),
              )}

            </div>


            <div className="mt-5 border-t border-white/10 pt-5 text-sm">

              <div className="flex justify-between">
                <span>
                  Subtotal
                </span>

                <span>
                  BDT {cart.subtotal}
                </span>
              </div>


              <div className="mt-2 flex justify-between">
                <span>
                  Shipping
                </span>

                <span>
                  {shipping === 0
                    ? 'FREE'
                    : `BDT ${shipping}`}
                </span>
              </div>

            </div>


            <button
              disabled={
                busy ||
                (!selected &&
                  !manual)
              }
              className="mt-6 w-full rounded-xl bg-white py-3.5 font-bold text-slate-950 disabled:opacity-50"
            >

              {busy
                ? 'Placing order...'
                : 'Place order'}

            </button>

          </aside>

        </form>

      </div>

    </main>
  );
}
