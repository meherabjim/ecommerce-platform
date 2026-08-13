'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LogOut,
  MapPin,
  ShoppingBag,
  UserRound,
} from 'lucide-react';

import {
  clearAuth,
  getStoredUser,
} from '@/lib/auth';

export default function Navbar() {
  const router = useRouter();
  const user = getStoredUser();

  function logout() {
    clearAuth();
    router.replace('/login');
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">

        <Link
          href="/"
          className="flex items-center gap-2 font-black"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-950 text-white">
            N
          </span>

          Neuro Commerce
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
          <Link
            href="/"
            className="hover:text-slate-950"
          >
            Home
          </Link>

          <Link
            href="/shop"
            className="hover:text-slate-950"
          >
            Shop
          </Link>

          {user && (
            <>
              <Link
                href="/account"
                className="hover:text-slate-950"
              >
                Account
              </Link>

              <Link
                href="/account/addresses"
                className="hover:text-slate-950"
              >
                Addresses
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">

          {user ? (
            <>
              <Link
                href="/account"
                title="My account"
                className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 transition hover:bg-slate-100"
              >
                <UserRound size={18} />
              </Link>

              <Link
                href="/account/addresses"
                title="Saved addresses"
                className="hidden h-10 w-10 place-items-center rounded-xl border border-slate-200 transition hover:bg-slate-100 sm:grid"
              >
                <MapPin size={18} />
              </Link>

              <button
                type="button"
                onClick={logout}
                title="Logout"
                className="flex h-10 items-center gap-2 rounded-xl border border-red-200 px-3 text-sm font-bold text-red-600 transition hover:bg-red-50"
              >
                <LogOut size={17} />

                <span className="hidden sm:inline">
                  Logout
                </span>
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-xl border border-slate-950 px-4 py-2 text-sm font-bold"
            >
              Login
            </Link>
          )}

          <Link
            href="/cart"
            title="Cart"
            className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-white"
          >
            <ShoppingBag size={18} />
          </Link>

        </div>
      </div>
    </header>
  );
}
