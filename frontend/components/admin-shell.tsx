'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3,
  Boxes,
  FolderTree,
  ChevronRight,
  ClipboardList,
  FileBarChart,
  Gift,
  LayoutDashboard,
  LogOut,
  Menu,
  PackageCheck,
  PackageSearch,
  PlugZap,
  RotateCcw,
  Settings2,
  ShieldCheck,
  Star,
  Truck,
  UsersRound,
  Warehouse,
  WalletCards,
  X,
  Bell,
} from 'lucide-react';

import { clearAuth, getStoredUser, isStaffRole, canAccessAdminPath } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';

const ALL = ['SUPER_ADMIN', 'ADMIN'];

type NavItem = {
  href: string;
  label: string;
  labelBn: string;
  icon: React.ComponentType<{ size?: number }>;
  roles: string[];
};

const links: NavItem[] = [
  { href: '/admin', label: 'Overview', labelBn: 'à¦“à¦­à¦¾à¦°à¦­à¦¿à¦‰', icon: LayoutDashboard, roles: [...ALL, 'CATALOG_MANAGER', 'INVENTORY_MANAGER', 'ORDER_MANAGER', 'CUSTOMER_SUPPORT', 'MARKETING_MANAGER', 'FINANCE'] },
  { href: '/admin/catalog', label: 'Catalog', labelBn: 'à¦•à§à¦¯à¦¾à¦Ÿà¦¾à¦²à¦—', icon: Boxes, roles: [...ALL, 'CATALOG_MANAGER'] },
  { href: '/admin/catalog/categories', label: 'Categories', labelBn: 'à¦•à§à¦¯à¦¾à¦Ÿà¦¾à¦—à¦°à¦¿', icon: FolderTree, roles: [...ALL, 'CATALOG_MANAGER'] },
  { href: '/admin/barcodes', label: 'Barcodes', labelBn: 'à¦¬à¦¾à¦°à¦•à§‹à¦¡', icon: PackageSearch, roles: [...ALL, 'CATALOG_MANAGER', 'INVENTORY_MANAGER'] },
  { href: '/admin/inventory', label: 'Inventory', labelBn: 'à¦‡à¦¨à¦­à§‡à¦¨à§à¦Ÿà¦°à¦¿', icon: Warehouse, roles: [...ALL, 'INVENTORY_MANAGER'] },
  { href: '/admin/orders', label: 'Orders', labelBn: 'à¦…à¦°à§à¦¡à¦¾à¦°', icon: ClipboardList, roles: [...ALL, 'ORDER_MANAGER', 'CUSTOMER_SUPPORT', 'FINANCE'] },
  { href: '/admin/shipments', label: 'Shipments', labelBn: 'à¦¶à¦¿à¦ªà¦®à§‡à¦¨à§à¦Ÿ', icon: PackageCheck, roles: [...ALL, 'ORDER_MANAGER'] },
  { href: '/admin/delivery', label: 'Delivery', labelBn: 'à¦¡à§‡à¦²à¦¿à¦­à¦¾à¦°à¦¿', icon: Truck, roles: [...ALL, 'ORDER_MANAGER'] },
  { href: '/admin/shipping', label: 'Shipping', labelBn: 'à¦¶à¦¿à¦ªà¦¿à¦‚', icon: Settings2, roles: [...ALL, 'ORDER_MANAGER'] },
  { href: '/admin/customers', label: 'Customers', labelBn: 'à¦•à§à¦°à§‡à¦¤à¦¾', icon: UsersRound, roles: [...ALL, 'CUSTOMER_SUPPORT'] },
  { href: '/admin/users', label: 'Staff & Users', labelBn: 'à¦¸à§à¦Ÿà¦¾à¦« à¦“ à¦‡à¦‰à¦œà¦¾à¦°', icon: UsersRound, roles: [...ALL] },
  { href: '/admin/promotions', label: 'Promotions', labelBn: 'à¦ªà§à¦°à¦®à§‹à¦¶à¦¨', icon: Gift, roles: [...ALL, 'MARKETING_MANAGER'] },
  { href: '/admin/reviews', label: 'Reviews', labelBn: 'à¦°à¦¿à¦­à¦¿à¦‰', icon: Star, roles: [...ALL, 'MARKETING_MANAGER', 'CUSTOMER_SUPPORT'] },
  { href: '/admin/returns', label: 'Returns', labelBn: 'à¦°à¦¿à¦Ÿà¦¾à¦°à§à¦¨', icon: RotateCcw, roles: [...ALL, 'ORDER_MANAGER', 'CUSTOMER_SUPPORT'] },
  { href: '/admin/notifications', label: 'Notifications', labelBn: 'à¦¨à§‹à¦Ÿà¦¿à¦«à¦¿à¦•à§‡à¦¶à¦¨', icon: Bell, roles: [...ALL, 'CUSTOMER_SUPPORT', 'MARKETING_MANAGER'] },
  { href: '/admin/finance', label: 'Finance', labelBn: 'à¦«à¦¾à¦‡à¦¨à§à¦¯à¦¾à¦¨à§à¦¸', icon: WalletCards, roles: [...ALL, 'FINANCE'] },
  { href: '/admin/reports', label: 'Reports', labelBn: 'à¦°à¦¿à¦ªà§‹à¦°à§à¦Ÿ', icon: FileBarChart, roles: [...ALL, 'INVENTORY_MANAGER', 'ORDER_MANAGER', 'MARKETING_MANAGER', 'FINANCE'] },
  { href: '/admin/integrations', label: 'Integrations', labelBn: 'à¦‡à¦¨à§à¦Ÿà¦¿à¦—à§à¦°à§‡à¦¶à¦¨', icon: PlugZap, roles: [...ALL] },
  { href: '/admin/cms', label: 'CMS & Theme', labelBn: 'à¦¸à¦¿à¦à¦®à¦à¦¸ à¦“ à¦¥à¦¿à¦®', icon: BarChart3, roles: [...ALL, 'MARKETING_MANAGER'] },
  { href: '/admin/security', label: 'Security', labelBn: 'à¦¨à¦¿à¦°à¦¾à¦ªà¦¤à§à¦¤à¦¾', icon: ShieldCheck, roles: [...ALL] },
  { href: '/admin/settings', label: 'Store Settings', labelBn: 'à¦¸à§à¦Ÿà§‹à¦° à¦¸à§‡à¦Ÿà¦¿à¦‚à¦¸', icon: Settings2, roles: [...ALL] },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { language } = useI18n();
  const [open, setOpen] = useState(false);
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

  function logout() {
    clearAuth();
    setOpen(false);
    router.replace('/');
    router.refresh();
  }

  const denied = mounted && user && !canAccessAdminPath(user.role, pathname);
  const label = (item: NavItem) => (language === 'bn' ? item.labelBn : item.label);

  const menu = (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-white/10 pb-5">
        <Link href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#1464f4] text-lg font-black text-white shadow-sm">N</span>
          <div className="min-w-0">
            <p className="truncate font-black text-white">Neuro Commerce</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[.18em] text-blue-600">
              {language === 'bn' ? 'à¦…à§à¦¯à¦¾à¦¡à¦®à¦¿à¦¨ à¦•à¦¨à¦¸à§‹à¦²' : 'Admin console'}
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
                {mounted ? (role || 'STAFF').replaceAll('_', ' ') : 'STAFF'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <nav className="mt-4 min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
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
              onClick={() => setOpen(false)}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-black transition ${
                active
                  ? 'bg-[#1464f4] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
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
          {language === 'bn' ? 'à¦²à¦—à¦†à¦‰à¦Ÿ' : 'Sign out'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#dbeafe_0,_#f8fafc_34%,_#f5f3ff_100%)] text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-50 hidden h-screen w-[286px] border-r border-white/10 bg-gradient-to-b from-slate-950 via-[#102a56] to-[#123a78] p-5 shadow-2xl lg:block [&_nav_a]:text-blue-50/80 [&_nav_a:hover]:bg-white/10 [&_nav_a:hover]:text-white [&_nav_a.bg-\[\#1464f4\]]:bg-white [&_nav_a.bg-\[\#1464f4\]]:text-blue-700">
        {menu}
      </aside>

      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-xl lg:hidden">
        <Link href="/admin" className="flex items-center gap-3 font-black text-slate-900">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#1464f4] text-white">N</span>
          <span>{language === 'bn' ? 'à¦…à§à¦¯à¦¾à¦¡à¦®à¦¿à¦¨' : 'Admin'}</span>
        </Link>
        <button onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700">
          <Menu size={19} />
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button aria-label="Close menu" onClick={() => setOpen(false)} className="absolute inset-0 bg-slate-900/35 backdrop-blur-sm" />
          <aside className="absolute inset-y-0 left-0 h-screen w-[88%] max-w-[310px] bg-white p-5 shadow-2xl">
            <div className="mb-3 flex justify-end">
              <button onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700">
                <X size={18} />
              </button>
            </div>
            <div className="h-[calc(100%-52px)]">{menu}</div>
          </aside>
        </div>
      )}

      <main className="lg:pl-[286px]">
        <div className="mx-auto max-w-[1580px] p-4 sm:p-5 md:p-8 xl:p-10">{denied ? <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8"><ShieldCheck className="text-amber-600"/><h1 className="mt-4 text-2xl font-black">{language==='bn'?'à¦à¦‡ à¦ªà§‡à¦œà§‡ à¦†à¦ªà¦¨à¦¾à¦° à¦…à¦¨à§à¦®à¦¤à¦¿ à¦¨à§‡à¦‡':'Access denied'}</h1><p className="mt-2 text-sm text-slate-600">{language==='bn'?'à¦†à¦ªà¦¨à¦¿ à¦²à¦—à¦‡à¦¨ à¦…à¦¬à¦¸à§à¦¥à¦¾à¦¤à§‡à¦‡ à¦†à¦›à§‡à¦¨à¥¤ à¦†à¦ªà¦¨à¦¾à¦° à¦°à§‹à¦²à§‡ à¦¶à§à¦§à§ à¦à¦‡ à¦ªà§‡à¦œà§‡à¦° à¦…à¦¨à§à¦®à¦¤à¦¿ à¦¨à§‡à¦‡à¥¤':'You are still signed in. Your role does not have permission for this page.'}</p><Link href="/admin" className="mt-5 inline-flex rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-black text-white">{language==='bn'?'à¦¡à§à¦¯à¦¾à¦¶à¦¬à§‹à¦°à§à¦¡à§‡ à¦«à¦¿à¦°à§à¦¨':'Back to dashboard'}</Link></div> : children}</div>
      </main>
    </div>
  );
}
