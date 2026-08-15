'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f6f8] px-5">
      <div className="max-w-lg rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-xl">
        <p className="text-xs font-black uppercase tracking-[.18em] text-rose-500">
          Something went wrong
        </p>
        <h1 className="mt-3 text-3xl font-black">We could not load this page.</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Try again. If the problem continues, check whether the API and database are running.
        </p>
        <button
          onClick={reset}
          className="mt-6 rounded-xl bg-[#1464f4] px-5 py-3 text-sm font-black text-white"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
