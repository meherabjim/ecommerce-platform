'use client';

import {
  useEffect,
  useState,
} from 'react';

import Link from 'next/link';

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


export default function WishlistPage() {

  const router =
    useRouter();

  const [items,setItems] =
    useState<any[]>([]);


  async function load() {

    const response =
      await api.get(
        '/wishlist',
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


  async function remove(
    productId:string,
  ) {

    await api.delete(
      `/wishlist/${productId}`,
    );

    await load();
  }


  return (
    <main className="min-h-screen bg-[#f7f7f5]">

      <Navbar />

      <div className="mx-auto max-w-6xl px-5 py-12">

        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
          Customer portal
        </p>

        <h1 className="mt-2 text-4xl font-black">
          Wishlist
        </h1>


        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">

          {items.map((item:any) => {

            const product =
              item.product;

            if (!product) {
              return null;
            }

            const variant =
              product.variants?.[0];

            return (
              <article
                key={item.id}
                className="rounded-3xl border bg-white p-5"
              >

                <div className="grid aspect-[4/3] place-items-center rounded-2xl bg-slate-100">

                  {product.primaryImageUrl ? (
                    <img
                      src={product.primaryImageUrl}
                      alt={product.name}
                      className="h-full w-full rounded-2xl object-cover"
                    />
                  ) : (
                    <span className="text-6xl font-black text-slate-300">
                      {product.name?.[0]}
                    </span>
                  )}

                </div>

                <h2 className="mt-4 text-xl font-black">
                  {product.name}
                </h2>

                {variant && (
                  <p className="mt-2 font-bold">
                    BDT {variant.salePrice || variant.price}
                  </p>
                )}

                <div className="mt-5 flex gap-2">

                  <Link
                    href={`/shop/${product.slug}`}
                    className="flex-1 rounded-xl bg-slate-950 px-4 py-3 text-center text-sm font-bold text-white"
                  >
                    View product
                  </Link>

                  <button
                    onClick={() =>
                      remove(product.id)
                    }
                    className="rounded-xl border border-red-200 px-4 py-3 text-sm font-bold text-red-600"
                  >
                    Remove
                  </button>

                </div>

              </article>
            );
          })}

        </div>


        {!items.length && (
          <div className="mt-8 rounded-3xl border border-dashed p-12 text-center text-slate-500">
            Your wishlist is empty.
          </div>
        )}

      </div>

    </main>
  );
}
