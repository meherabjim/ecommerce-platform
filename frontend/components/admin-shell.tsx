'use client';
import Link from 'next/link';
import { usePathname,useRouter } from 'next/navigation';
import { clearAuth } from '@/lib/auth';

const links=[
  {href:'/admin',label:'Overview'},
  {href:'/admin/catalog',label:'Catalog'},
  {href:'/admin/inventory',label:'Inventory'},
  {href:'/admin/orders',label:'Orders'},
  {href:'/admin/users',label:'Users'},
  {href:'/admin/promotions',label:'Promotions'},
  {href:'/admin/reviews',label:'Reviews'},
];

export default function AdminShell({children}:{children:React.ReactNode}){
  const p=usePathname(),r=useRouter();
  return <div className="min-h-screen bg-[#f4f5f7] text-slate-950">
    <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-slate-950 p-5 text-white lg:block">
      <Link href="/admin" className="text-xl font-black">Neuro Commerce</Link>
      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/40">Admin console</p>
      <nav className="mt-10 space-y-2">
        {links.map(l=>{
          const a=l.href==='/admin'?p==='/admin':p.startsWith(l.href);
          return <Link key={l.href} href={l.href}
            className={`block rounded-xl px-4 py-3 text-sm font-bold ${a?'bg-white text-slate-950':'text-white/60 hover:bg-white/10 hover:text-white'}`}>
            {l.label}
          </Link>
        })}
      </nav>
      <button onClick={()=>{clearAuth();r.push('/login')}}
        className="absolute bottom-6 left-5 right-5 rounded-xl border border-white/15 px-4 py-3 text-sm font-bold text-white/70">
        Sign out
      </button>
    </aside>
    <main className="lg:pl-64">
      <div className="mx-auto max-w-[1500px] p-5 md:p-8">{children}</div>
    </main>
  </div>
}

