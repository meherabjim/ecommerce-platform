'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3,
  Bell,
  Boxes,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  ExternalLink,
  FileBarChart,
  Gift,
  LayoutDashboard,
  LogOut,
  Menu,
  PackageCheck,
  PackagePlus,
  PackageSearch,
  PlugZap,
  RotateCcw,
  Search,
  Settings2,
  ShieldCheck,
  Star,
  Store,
  Truck,
  UserCog,
  UserRound,
  UsersRound,
  Warehouse,
  WalletCards,
  X,
} from 'lucide-react';

import { clearAuth, getStoredUser, isStaffRole, canAccessAdminPath } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { useStoreConfig } from '@/components/store-config-provider';

const ALL = ['SUPER_ADMIN', 'ADMIN'];

type NavItem = {
  href: string;
  label: string;
  labelBn: string;
  icon: React.ComponentType<{ size?: number }>;
  roles: string[];
};

const links: NavItem[] = [
  { href: '/admin', label: 'Overview', labelBn: 'ওভারভিউ', icon: LayoutDashboard, roles: [...ALL, 'CATALOG_MANAGER', 'INVENTORY_MANAGER', 'ORDER_MANAGER', 'CUSTOMER_SUPPORT', 'MARKETING_MANAGER', 'FINANCE'] },
  { href: '/admin/catalog', label: 'Catalog', labelBn: 'ক্যাটালগ', icon: Boxes, roles: [...ALL, 'CATALOG_MANAGER'] },
  { href: '/admin/catalog/categories', label: 'Categories', labelBn: 'ক্যাটাগরি', icon: PackageSearch, roles: [...ALL, 'CATALOG_MANAGER'] },
  { href: '/admin/barcodes', label: 'Barcodes', labelBn: 'বারকোড', icon: PackageSearch, roles: [...ALL, 'CATALOG_MANAGER', 'INVENTORY_MANAGER'] },
  { href: '/admin/inventory', label: 'Inventory', labelBn: 'ইনভেন্টরি', icon: Warehouse, roles: [...ALL, 'INVENTORY_MANAGER'] },
  { href: '/admin/orders', label: 'Orders', labelBn: 'অর্ডার', icon: ClipboardList, roles: [...ALL, 'ORDER_MANAGER', 'CUSTOMER_SUPPORT', 'FINANCE'] },
  { href: '/admin/shipments', label: 'Shipments', labelBn: 'শিপমেন্ট', icon: PackageCheck, roles: [...ALL, 'ORDER_MANAGER'] },
  { href: '/admin/delivery', label: 'Delivery', labelBn: 'ডেলিভারি', icon: Truck, roles: [...ALL, 'ORDER_MANAGER'] },
  { href: '/admin/shipping', label: 'Shipping', labelBn: 'শিপিং', icon: Settings2, roles: [...ALL, 'ORDER_MANAGER'] },
  { href: '/admin/customers', label: 'Customers', labelBn: 'কাস্টমার', icon: UsersRound, roles: [...ALL, 'CUSTOMER_SUPPORT'] },
  { href: '/admin/users', label: 'Staff & Users', labelBn: 'স্টাফ ও ইউজার', icon: UserCog, roles: [...ALL] },
  { href: '/admin/promotions', label: 'Promotions', labelBn: 'প্রমোশন', icon: Gift, roles: [...ALL, 'MARKETING_MANAGER'] },
  { href: '/admin/reviews', label: 'Reviews', labelBn: 'রিভিউ', icon: Star, roles: [...ALL, 'MARKETING_MANAGER', 'CUSTOMER_SUPPORT'] },
  { href: '/admin/returns', label: 'Returns', labelBn: 'রিটার্ন', icon: RotateCcw, roles: [...ALL, 'ORDER_MANAGER', 'CUSTOMER_SUPPORT'] },
  { href: '/admin/notifications', label: 'Notifications', labelBn: 'নোটিফিকেশন', icon: Bell, roles: [...ALL, 'CUSTOMER_SUPPORT', 'MARKETING_MANAGER'] },
  { href: '/admin/finance', label: 'Finance', labelBn: 'ফাইন্যান্স', icon: WalletCards, roles: [...ALL, 'FINANCE'] },
  { href: '/admin/reports', label: 'Reports', labelBn: 'রিপোর্ট', icon: FileBarChart, roles: [...ALL, 'FINANCE'] },
  { href: '/admin/integrations', label: 'Integrations', labelBn: 'ইন্টিগ্রেশন', icon: PlugZap, roles: [...ALL] },
  { href: '/admin/cms', label: 'CMS & Theme', labelBn: 'সিএমএস ও থিম', icon: BarChart3, roles: [...ALL, 'MARKETING_MANAGER'] },
  { href: '/admin/security', label: 'Security', labelBn: 'নিরাপত্তা', icon: ShieldCheck, roles: [...ALL] },
  { href: '/admin/settings', label: 'Store Settings', labelBn: 'স্টোর সেটিংস', icon: Settings2, roles: [...ALL] },
];

function roleLabel(role:string){
  return role.replaceAll('_',' ').replace(/\b\w/g, c=>c.toUpperCase());
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { language } = useI18n();
  const config = useStoreConfig();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = getStoredUser();
    if (!stored) {
      router.replace('/login');
      return;
    }
    if (!isStaffRole(stored.role)) {
      router.replace('/account');
      return;
    }
    setUser(stored);
  }, [router]);

  const role = String(user?.role || '').toUpperCase();
  const visible = useMemo(() => links.filter((item) => item.roles.includes(role)), [role]);
  const identity = config?.['store.identity'] || {};
  const storeName = String(identity.storeName || 'E-Commerce Platform');
  const storeLogo = String(identity.logoUrl || '');
  const initial = (storeName.trim()[0] || 'E').toUpperCase();

  function logout() {
    clearAuth();
    setOpen(false);
    setProfileOpen(false);
    setQuickOpen(false);
    router.replace('/');
    router.refresh();
  }

  function adminSearch(e:FormEvent){
    e.preventDefault();
    const q=search.trim().toLowerCase();
    if(!q) return;
    const match=visible.find(item =>
      item.label.toLowerCase().includes(q) ||
      item.labelBn.includes(search.trim())
    );
    if(match){
      setSearch('');
      router.push(match.href, { scroll: false });
    }
  }

  const denied = mounted && user && !canAccessAdminPath(user.role, pathname);
  const label = (item: NavItem) => (language === 'bn' ? item.labelBn : item.label);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const navs = document.querySelectorAll<HTMLElement>('.admin-sidebar-nav');

      navs.forEach((nav) => {
        const activeItem = nav.querySelector<HTMLElement>('[data-admin-active="true"]');
        if (!activeItem) return;

        const itemTop = activeItem.offsetTop;
        const itemBottom = itemTop + activeItem.offsetHeight;
        const visibleTop = nav.scrollTop;
        const visibleBottom = visibleTop + nav.clientHeight;

        if (itemTop < visibleTop) {
          nav.scrollTop = Math.max(0, itemTop - 8);
        } else if (itemBottom > visibleBottom) {
          nav.scrollTop = itemBottom - nav.clientHeight + 8;
        }
      });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  const menu = (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-white/10 pb-5">
        <Link href="/admin" scroll={false} onClick={() => setOpen(false)} className="flex items-center gap-3">
          {storeLogo ? (
            <img src={storeLogo} alt="" className="h-11 w-11 rounded-2xl object-cover shadow-sm" />
          ) : (
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 text-lg font-black text-white shadow-sm">{initial}</span>
          )}
          <div className="min-w-0">
            <p className="truncate font-black text-white">{storeName}</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[.18em] text-sky-300">
              {language === 'bn' ? 'অ্যাডমিন কনসোল' : 'Admin console'}
            </p>
          </div>
        </Link>

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-blue-600 shadow-sm">
              <ShieldCheck size={17} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-white">
                {mounted ? user?.name || 'Administrator' : 'Administrator'}
              </p>
              <p className="truncate text-[10px] font-bold uppercase tracking-wide text-blue-100/70">
                {mounted ? roleLabel(role || 'STAFF') : 'Staff'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <nav className="admin-sidebar-nav mt-4 min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
        {visible.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (
              item.href !== '/admin' &&
              pathname.startsWith(item.href + '/') &&
              !visible.some(
                (other) =>
                  other.href !== item.href &&
                  other.href.startsWith(item.href + '/') &&
                  (
                    pathname === other.href ||
                    pathname.startsWith(other.href + '/')
                  )
              )
            );
          return (
            <Link
              key={item.href}
              href={item.href}
              scroll={false}
              data-admin-active={active ? 'true' : 'false'}
              onClick={() => setOpen(false)}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-black transition ${
                active
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-blue-50/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon size={17} />
              <span className="flex-1">{label(item)}</span>
              {active && <ChevronRight size={15} />}
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-white/10 pt-4">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/10 px-3 py-3 text-sm font-black text-rose-200 transition hover:bg-rose-500/20 hover:text-white"
        >
          <LogOut size={17} />
          {language === 'bn' ? 'সাইন আউট' : 'Sign out'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#dbeafe_0,_#f8fafc_34%,_#f5f3ff_100%)] text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-50 hidden h-screen w-[286px] border-r border-white/10 bg-gradient-to-b from-slate-950 via-[#102a56] to-[#123a78] p-5 shadow-2xl lg:block">
        {menu}
      </aside>

      <div className="lg:pl-[286px]">
        <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl">
          <div className="flex h-[72px] items-center gap-3 px-4 sm:px-5 lg:px-7">
            <button onClick={() => setOpen(true)} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 lg:hidden">
              <Menu size={19} />
            </button>

            <Link href="/admin" className="flex shrink-0 items-center gap-2 lg:hidden">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 text-sm font-black text-white">{initial}</span>
              <span className="hidden max-w-[150px] truncate text-sm font-black sm:block">{storeName}</span>
            </Link>

            <form onSubmit={adminSearch} className="hidden min-w-0 flex-1 md:block">
              <div className="relative max-w-xl">
                <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                <input
                  value={search}
                  onChange={e=>setSearch(e.target.value)}
                  placeholder={language==='bn'?'অ্যাডমিন পেজ খুঁজুন...':'Search admin modules...'}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-semibold outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </form>

            <div className="ml-auto flex items-center gap-2">
              <Link href="/" target="_blank" className="hidden h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 transition hover:border-blue-300 hover:text-blue-700 sm:inline-flex">
                <Store size={16}/>{language==='bn'?'স্টোর দেখুন':'View store'}<ExternalLink size={13}/>
              </Link>

              <div className="relative">
                <button onClick={()=>{setQuickOpen(v=>!v);setProfileOpen(false)}} className="hidden h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-3 text-xs font-black text-white shadow-sm transition hover:-translate-y-0.5 lg:inline-flex">
                  <PackagePlus size={16}/>{language==='bn'?'কুইক অ্যাকশন':'Quick actions'}<ChevronDown size={14}/>
                </button>
                {quickOpen&&(
                  <div className="absolute right-0 top-13 z-50 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
                    {(role==='SUPER_ADMIN'||role==='ADMIN'||role==='CATALOG_MANAGER')&&<Link onClick={()=>setQuickOpen(false)} href="/admin/catalog" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-black text-slate-700 hover:bg-blue-50 hover:text-blue-700"><Boxes size={16}/>Manage products</Link>}
                    {(role==='SUPER_ADMIN'||role==='ADMIN'||role==='ORDER_MANAGER'||role==='CUSTOMER_SUPPORT')&&<Link onClick={()=>setQuickOpen(false)} href="/admin/orders" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-black text-slate-700 hover:bg-blue-50 hover:text-blue-700"><ClipboardList size={16}/>Process orders</Link>}
                    {(role==='SUPER_ADMIN'||role==='ADMIN')&&<Link onClick={()=>setQuickOpen(false)} href="/admin/users" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-black text-slate-700 hover:bg-blue-50 hover:text-blue-700"><UserCog size={16}/>Manage staff</Link>}
                    {(role==='SUPER_ADMIN'||role==='ADMIN'||role==='MARKETING_MANAGER')&&<Link onClick={()=>setQuickOpen(false)} href="/admin/promotions" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-black text-slate-700 hover:bg-blue-50 hover:text-blue-700"><Gift size={16}/>Promotions</Link>}
                  </div>
                )}
              </div>

              {(role==='SUPER_ADMIN'||role==='ADMIN'||role==='CUSTOMER_SUPPORT'||role==='MARKETING_MANAGER')&&(
                <Link href="/admin/notifications" title="Notifications" className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700">
                  <Bell size={18}/>
                </Link>
              )}

              <div className="relative">
                <button onClick={()=>{setProfileOpen(v=>!v);setQuickOpen(false)}} className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 text-left transition hover:border-blue-300 hover:bg-blue-50">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-900 text-xs font-black text-white">{(user?.name?.[0]||'A').toUpperCase()}</span>
                  <span className="hidden min-w-0 sm:block">
                    <span className="block max-w-[125px] truncate text-xs font-black text-slate-900">{user?.name||'Administrator'}</span>
                    <span className="block max-w-[125px] truncate text-[9px] font-bold uppercase tracking-wide text-slate-400">{roleLabel(role||'STAFF')}</span>
                  </span>
                  <ChevronDown size={14} className="text-slate-400"/>
                </button>

                {profileOpen&&(
                  <div className="absolute right-0 top-13 z-50 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                    <div className="border-b border-slate-100 p-4">
                      <p className="truncate text-sm font-black">{user?.name||'Administrator'}</p>
                      <p className="mt-1 truncate text-xs text-slate-500">{user?.email||''}</p>
                      <span className="mt-2 inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-blue-700">{roleLabel(role||'STAFF')}</span>
                    </div>
                    <div className="p-2">
                      <Link href="/admin/profile" onClick={()=>setProfileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-black text-slate-700 hover:bg-blue-50 hover:text-blue-700"><UserRound size={16}/>My profile</Link>
                      {(role==='SUPER_ADMIN'||role==='ADMIN')&&<Link href="/admin/security" onClick={()=>setProfileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-black text-slate-700 hover:bg-blue-50 hover:text-blue-700"><ShieldCheck size={16}/>Security</Link>}
                      {(role==='SUPER_ADMIN'||role==='ADMIN')&&<Link href="/admin/settings" onClick={()=>setProfileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-black text-slate-700 hover:bg-blue-50 hover:text-blue-700"><Settings2 size={16}/>Store settings</Link>}
                    </div>
                    <div className="border-t border-slate-100 p-2">
                      <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-black text-rose-600 hover:bg-rose-50"><LogOut size={16}/>Sign out</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {open && (
          <div className="fixed inset-0 z-[60] lg:hidden">
            <button aria-label="Close menu" onClick={() => setOpen(false)} className="absolute inset-0 bg-slate-900/45 backdrop-blur-sm" />
            <aside className="absolute inset-y-0 left-0 h-screen w-[88%] max-w-[310px] bg-gradient-to-b from-slate-950 via-[#102a56] to-[#123a78] p-5 shadow-2xl">
              <div className="mb-3 flex justify-end">
                <button onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/10 text-white">
                  <X size={18} />
                </button>
              </div>
              <div className="h-[calc(100%-52px)]">{menu}</div>
            </aside>
          </div>
        )}

        <main>
          <div className="mx-auto max-w-[1680px] p-4 sm:p-5 md:p-7 xl:p-8">
            {denied ? (
              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8">
                <ShieldCheck className="text-amber-600"/>
                <h1 className="mt-4 text-2xl font-black">{language==='bn'?'এই পেজে আপনার অনুমতি নেই':'Access denied'}</h1>
                <p className="mt-2 text-sm text-slate-600">{language==='bn'?'আপনি লগইন অবস্থাতেই আছেন, কিন্তু আপনার রোলে এই পেজের অনুমতি নেই।':'You are still signed in, but your role does not have permission for this page.'}</p>
                <Link href="/admin" className="mt-5 inline-flex rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-black text-white">{language==='bn'?'ড্যাশবোর্ডে ফিরুন':'Back to dashboard'}</Link>
              </div>
            ) : children}
          </div>
        </main>
      </div>
    </div>
  );
}
