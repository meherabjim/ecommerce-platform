import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f6f8] px-5">
      <div className="max-w-lg text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#1464f4] font-black text-white">
          404
        </span>
        <h1 className="mt-6 text-4xl font-black tracking-tight">Page not found</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          The page may have moved, or the address may be incorrect.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/" className="rounded-xl bg-[#1464f4] px-5 py-3 text-sm font-black text-white">
            Home
          </Link>
          <Link href="/shop" className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black">
            Shop
          </Link>
        </div>
      </div>
    </main>
  );
}
