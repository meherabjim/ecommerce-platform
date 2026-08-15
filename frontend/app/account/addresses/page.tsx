'use client';

import {
  FormEvent,
  useEffect,
  useState,
} from 'react';

import { useRouter } from 'next/navigation';

import Navbar from '@/components/navbar';
import AccountShell from '@/components/account-shell';
import StoreFooter from '@/components/store-footer';
import LocationPicker from '@/components/location-picker';

import { api } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';
import { authRedirectUrl } from '@/lib/customer-auth';

const empty = {
  recipientName:'',
  phone:'',
  type:'HOME',
  division:'Dhaka',
  district:'Dhaka',
  area:'',
  addressLine:'',
  landmark:'',
  postalCode:'',
  latitude:null as number | null,
  longitude:null as number | null,
  locationSource:'NONE',
  isDefault:false,
};

export default function AddressesPage() {
  const router = useRouter();

  const [items,setItems] = useState<any[]>([]);
  const [form,setForm] = useState<any>(empty);

  const [editId,setEditId] =
    useState<string | null>(null);

  const [message,setMessage] =
    useState('');

  async function load() {
    try {
      const response =
        await api.get('/users/me/addresses');

      setItems(response.data || []);

    } catch (error:any) {
      setMessage(
        error?.response?.data?.message ||
        'Could not load addresses.',
      );
    }
  }

  useEffect(() => {
    const user = getStoredUser();

    if (!user || user.role !== 'CUSTOMER') {
      router.replace(authRedirectUrl(window.location.pathname));
      return;
    }

    setForm((current:any) => ({
      ...current,
      recipientName:user.name,
      phone:user.phone || '',
    }));

    load();

  },[router]);

  function reset() {
    const user = getStoredUser();

    setEditId(null);

    setForm({
      ...empty,
      recipientName:user?.name || '',
      phone:user?.phone || '',
    });
  }

  async function submit(
    event:FormEvent,
  ) {
    event.preventDefault();

    try {
      if (editId) {
        await api.patch(
          `/users/me/addresses/${editId}`,
          form,
        );
      } else {
        await api.post(
          '/users/me/addresses',
          form,
        );
      }

      setMessage(
        editId
          ? 'Address updated.'
          : 'Address saved.',
      );

      reset();
      await load();

    } catch (error:any) {
      const m =
        error?.response?.data?.message;

      setMessage(
        Array.isArray(m)
          ? m.join(', ')
          : m ||
            'Could not save address.',
      );
    }
  }

  async function remove(id:string) {
    if (!confirm('Delete this address?')) {
      return;
    }

    await api.delete(
      `/users/me/addresses/${id}`,
    );

    await load();
  }

  async function makeDefault(id:string) {
    await api.patch(
      `/users/me/addresses/${id}/default`,
    );

    await load();
  }

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-slate-950">
      <Navbar />

      <AccountShell>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            Customer portal
          </p>

          <h1 className="mt-2 text-4xl font-black">
            Saved addresses
          </h1>

          <p className="mt-2 max-w-2xl text-slate-500">
            Save your address and optionally share an
            exact GPS location with the delivery agent.
          </p>
        </div>

        {message && (
          <p className="mt-5 rounded-2xl border bg-white p-4 text-sm font-semibold">
            {message}
          </p>
        )}

        <div className="mt-7 grid gap-6 xl:grid-cols-[520px_1fr]">
          <form
            onSubmit={submit}
            className="h-fit rounded-[1.75rem] border border-slate-200 bg-white p-6 premium-shadow"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black">
                {editId
                  ? 'Edit address'
                  : 'Add address'}
              </h2>

              {editId && (
                <button
                  type="button"
                  onClick={reset}
                  className="text-xs font-bold underline"
                >
                  Cancel
                </button>
              )}
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                ['recipientName','Recipient name'],
                ['phone','Phone'],
                ['division','Division'],
                ['district','District'],
                ['area','Area / Thana'],
                ['postalCode','Postal code'],
                ['landmark','Landmark'],
              ].map(([key,label]) => (
                <label
                  key={key}
                  className="text-sm font-bold"
                >
                  {label}

                  <input
                    className="mt-2 w-full rounded-xl border p-3 font-normal"
                    value={form[key]}
                    required={
                      ![
                        'postalCode',
                        'landmark',
                      ].includes(key)
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        [key]:e.target.value,
                      })
                    }
                  />
                </label>
              ))}

              <label className="text-sm font-bold">
                Address type

                <select
                  className="mt-2 w-full rounded-xl border p-3 font-normal"
                  value={form.type}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      type:e.target.value,
                    })
                  }
                >
                  <option value="HOME">
                    Home
                  </option>

                  <option value="OFFICE">
                    Office
                  </option>

                  <option value="OTHER">
                    Other
                  </option>
                </select>
              </label>

              <label className="text-sm font-bold sm:col-span-2">
                Full address

                <textarea
                  className="mt-2 min-h-24 w-full rounded-xl border p-3 font-normal"
                  value={form.addressLine}
                  required
                  onChange={(e) =>
                    setForm({
                      ...form,
                      addressLine:e.target.value,
                    })
                  }
                />
              </label>

              <div className="sm:col-span-2">
                <LocationPicker
                  latitude={form.latitude}
                  longitude={form.longitude}
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

              <label className="flex items-center gap-2 text-sm font-bold sm:col-span-2">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      isDefault:
                        e.target.checked,
                    })
                  }
                />

                Set as default
              </label>
            </div>

            <button className="mt-5 w-full rounded-xl bg-[#1464f4] py-3 font-bold text-white">
              {editId
                ? 'Update address'
                : 'Save address'}
            </button>
          </form>

          <section className="space-y-4">
            {items.map((address) => {
              const hasLocation =
                address.latitude !== null &&
                address.longitude !== null;

              return (
                <div
                  key={address.id}
                  className="rounded-3xl border bg-white p-6"
                >
                  <div className="flex flex-col justify-between gap-5 md:flex-row">
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">
                          {address.type}
                        </span>

                        {address.isDefault && (
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                            DEFAULT
                          </span>
                        )}

                        {hasLocation && (
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                            GPS
                          </span>
                        )}
                      </div>

                      <p className="mt-4 text-lg font-black">
                        {address.recipientName}
                      </p>

                      <p className="text-sm text-slate-500">
                        {address.phone}
                      </p>

                      <p className="mt-3 text-sm">
                        {address.addressLine},
                        {' '}
                        {address.area},
                        {' '}
                        {address.district},
                        {' '}
                        {address.division}
                      </p>

                      {address.landmark && (
                        <p className="mt-1 text-xs text-slate-500">
                          Landmark: {address.landmark}
                        </p>
                      )}

                      {hasLocation && (
                        <a
                          href={`https://www.google.com/maps?q=${address.latitude},${address.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-4 inline-flex rounded-xl border px-3 py-2 text-xs font-bold"
                        >
                          View location
                        </a>
                      )}
                    </div>

                    <div className="flex h-fit flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditId(address.id);

                          setForm({
                            ...address,
                            latitude:
                              address.latitude === null
                                ? null
                                : Number(address.latitude),
                            longitude:
                              address.longitude === null
                                ? null
                                : Number(address.longitude),
                          });

                          window.scrollTo({
                            top:0,
                            behavior:'smooth',
                          });
                        }}
                        className="rounded-lg border px-3 py-2 text-xs font-bold"
                      >
                        Edit
                      </button>

                      {!address.isDefault && (
                        <button
                          type="button"
                          onClick={() =>
                            makeDefault(
                              address.id,
                            )
                          }
                          className="rounded-lg border px-3 py-2 text-xs font-bold"
                        >
                          Default
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          remove(address.id)
                        }
                        className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {!items.length && (
              <div className="rounded-3xl border border-dashed p-12 text-center text-slate-500">
                No saved address yet.
              </div>
            )}
          </section>
        </div>
      </AccountShell>

      <StoreFooter />
    </main>
  );
}
