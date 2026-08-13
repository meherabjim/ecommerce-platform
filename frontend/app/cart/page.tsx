'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import Navbar from '@/components/navbar';
import { api } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';

export default function CartPage() {
  const router = useRouter();

  const [cart, setCart] = useState<any>(null);
  const [error, setError] = useState('');

  async function loadCart() {
    try {
      const response = await api.get('/cart');
      setCart(response.data);
    } catch {
      router.replace('/login');
    }
  }

  useEffect(() => {
    if (!getStoredUser()) {
      router.replace('/login');
      return;
    }

    loadCart();
  }, [router]);

  async function updateQuantity(id: string, quantity: number) {
    try {
      const response = await api.patch(`/cart/items/${id}`, {
        quantity,
      });

      setCart(response.data);
      setError('');
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          'Could not update quantity.',
      );
    }
  }

  async function removeItem(id: string) {
    const response = await api.delete(`/cart/items/${id}`);
    setCart(response.data);
  }

  if (!cart) {
    return (
      <main className="grid min-h-screen place-items-center">
        Loading cart...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f7f5]">
      <Navbar />

      <div className="mx-auto max-w-6xl px-5 py-12">
        <h1 className="text-4xl font-black">
          Your cart
        </h1>

        {error && (
          <p className="mt-4 rounded-xl bg-red-50 p-3 text-red-700">
            {error}
          </p>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="space-y-3">
            {cart.items.map((item: any) => (
              <div
                key={item.id}
                className="rounded-3xl bg-white p-5"
              >
                <div className="flex flex-wrap justify-between gap-4">
                  <div>
                    <Link
                      href={`/shop/${item.slug}`}
                      className="text-lg font-black"
                    >
                      {item.productName}
                    </Link>

                    <p className="mt-1 text-xs text-slate-500">
                      {Object.values(item.attributes || {}).join(' / ')}
                      {' | '}
                      {item.sku}
                    </p>

                    <p className="mt-3 font-black">
                      BDT {item.unitPrice}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        item.quantity > 1 &&
                        updateQuantity(
                          item.id,
                          item.quantity - 1,
                        )
                      }
                      className="h-10 w-10 rounded-xl border"
                    >
                      -
                    </button>

                    <span className="w-8 text-center font-bold">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          item.quantity + 1,
                        )
                      }
                      className="h-10 w-10 rounded-xl border"
                    >
                      +
                    </button>

                    <button
                      onClick={() =>
                        removeItem(item.id)
                      }
                      className="ml-2 text-sm font-bold text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {cart.items.length === 0 && (
              <div className="rounded-3xl border border-dashed p-12 text-center">
                <p className="font-bold">
                  Your cart is empty.
                </p>

                <Link
                  href="/shop"
                  className="mt-3 inline-block underline"
                >
                  Continue shopping
                </Link>
              </div>
            )}
          </section>

          <aside className="h-fit rounded-3xl bg-slate-950 p-6 text-white">
            <p className="text-sm text-white/50">
              Subtotal
            </p>

            <p className="mt-2 text-4xl font-black">
              BDT {cart.subtotal}
            </p>

            <p className="mt-3 text-sm text-white/50">
              Shipping is calculated at checkout.
              Free shipping from BDT 3000.
            </p>

            <Link
              href={
                cart.items.length
                  ? '/checkout'
                  : '/shop'
              }
              className="mt-6 block rounded-xl bg-white px-5 py-3.5 text-center font-bold text-slate-950"
            >
              {cart.items.length
                ? 'Proceed to checkout'
                : 'Shop now'}
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}
