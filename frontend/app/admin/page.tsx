'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Boxes, ClipboardList, Gift, RotateCcw, Truck, UsersRound, Warehouse, WalletCards } from 'lucide-react';
import AdminShell from '@/components/admin-shell';
import { api } from '@/lib/api';
import { getStoredUser, hasAdminCapability, isStaffRole } from '@/lib/auth';

type LoadState={
  orders:any[];
  users:any[];
  inventory:any[];
  returns:any[];
  shipping:any[];
};

const emptyState:LoadState={orders:[],users:[],inventory:[],returns:[],shipping:[]};

export default function AdminDashboard(){
  const [me,setMe]=useState<any>(null);
  const [data,setData]=useState<LoadState>(emptyState);
  const [loading,setLoading]=useState(true);
  const [warnings,setWarnings]=useState<string[]>([]);

  useEffect(()=>{
    const current=getStoredUser();
    setMe(current);
    if(!current||!isStaffRole(current.role)){
      setLoading(false);
      return;
    }

    const role=String(current.role);
    const requests:{key:keyof LoadState;label:string;run:()=>Promise<any>}[]=[];

    if(hasAdminCapability(role,'ORDERS')){
      requests.push({key:'orders',label:'orders',run:()=>api.get('/admin/orders')});
    }
    if(hasAdminCapability(role,'VIEW_USERS')){
      requests.push({key:'users',label:'users',run:()=>api.get('/users')});
    }
    if(hasAdminCapability(role,'INVENTORY')){
      requests.push({key:'inventory',label:'inventory',run:()=>api.get('/inventory')});
    }
    if(hasAdminCapability(role,'RETURNS')){
      requests.push({key:'returns',label:'returns',run:()=>api.get('/admin/returns')});
    }
    if(hasAdminCapability(role,'DELIVERY')){
      requests.push({key:'shipping',label:'shipping zones',run:()=>api.get('/admin/shipping-zones')});
    }

    Promise.allSettled(requests.map(x=>x.run()))
      .then(results=>{
        const next={...emptyState};
        const failed:string[]=[];
        results.forEach((result,index)=>{
          const request=requests[index];
          if(result.status==='fulfilled'){
            next[request.key]=Array.isArray(result.value.data)?result.value.data:[];
          }else{
            failed.push(request.label);
          }
        });
        setData(next);
        setWarnings(failed);
      })
      .finally(()=>setLoading(false));
  },[]);

  const role=String(me?.role||'');
  const metrics=useMemo(()=>{
    const paidRevenue=data.orders
      .filter(x=>x.paymentStatus==='PAID')
      .reduce((s,x)=>s+Number(x.total||0),0);
    const activeDelivery=data.orders.filter(x=>['READY_FOR_PICKUP','SHIPPED','IN_TRANSIT','OUT_FOR_DELIVERY'].includes(x.status)).length;
    const customers=data.users.filter(x=>x.role==='CUSTOMER').length;
    const riders=data.users.filter(x=>x.role==='DELIVERY_AGENT').length;
    const lowStock=data.inventory.filter(x=>x.lowStock).length;
    const available=data.inventory.reduce((s,x)=>s+Number(x.available||0),0);
    const pendingReturns=data.returns.filter(x=>x.status==='REQUESTED').length;
    const averageOrder=data.orders.length
      ? data.orders.reduce((s,x)=>s+Number(x.total||0),0)/data.orders.length
      : 0;
    return {paidRevenue,activeDelivery,customers,riders,lowStock,available,pendingReturns,averageOrder};
  },[data]);

  const cards=[
    hasAdminCapability(role,'ORDERS')&&{label:'Orders',value:data.orders.length,href:'/admin/orders',icon:ClipboardList,tone:'blue'},
    hasAdminCapability(role,'ORDERS')&&{label:'Paid revenue',value:`BDT ${metrics.paidRevenue.toFixed(2)}`,href:'/admin/orders',icon:WalletCards,tone:'violet'},
    hasAdminCapability(role,'CUSTOMERS')&&{label:'Customers',value:metrics.customers,href:'/admin/customers',icon:UsersRound,tone:'cyan'},
    hasAdminCapability(role,'INVENTORY')&&{label:'Low-stock variants',value:metrics.lowStock,href:'/admin/inventory',icon:Warehouse,tone:'amber'},
    hasAdminCapability(role,'DELIVERY')&&{label:'Active deliveries',value:metrics.activeDelivery,href:'/admin/delivery',icon:Truck,tone:'emerald'},
    hasAdminCapability(role,'RETURNS')&&{label:'Pending returns',value:metrics.pendingReturns,href:'/admin/returns',icon:RotateCcw,tone:'rose'},
    hasAdminCapability(role,'CATALOG')&&{label:'Catalog control',value:'Manage',href:'/admin/catalog',icon:Boxes,tone:'indigo'},
    hasAdminCapability(role,'PROMOTIONS')&&{label:'Promotions',value:'Manage',href:'/admin/promotions',icon:Gift,tone:'orange'},
  ].filter(Boolean) as any[];

  const quick=[
    hasAdminCapability(role,'CATALOG')&&['Manage catalog','/admin/catalog'],
    hasAdminCapability(role,'ORDERS')&&['Process orders','/admin/orders'],
    hasAdminCapability(role,'INVENTORY')&&['Check inventory','/admin/inventory'],
    hasAdminCapability(role,'PROMOTIONS')&&['Manage promotions','/admin/promotions'],
    hasAdminCapability(role,'CUSTOMERS')&&['Customer support','/admin/customers'],
    hasAdminCapability(role,'FINANCE')&&['Finance','/admin/finance'],
    hasAdminCapability(role,'CMS')&&['CMS & theme','/admin/cms'],
  ].filter(Boolean) as string[][];

  if(loading){
    return <AdminShell><div className="grid min-h-[55vh] place-items-center"><div className="text-center"><div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600"/><p className="mt-4 text-sm font-black text-slate-500">Loading your dashboard…</p></div></div></AdminShell>;
  }

  return <AdminShell>
    <div className="flex flex-wrap items-end justify-between gap-5">
      <div>
        <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-[10px] font-black uppercase tracking-[.18em] text-blue-700">{role.replaceAll('_',' ')||'ADMIN'} workspace</span>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Commerce dashboard</h1>
        <p className="mt-2 text-sm text-slate-500">Only data and controls permitted for your current role are loaded here.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {quick.slice(0,3).map(([label,href],i)=><Link key={href} href={href} className={i===0?'rounded-xl bg-blue-600 px-4 py-3 text-sm font-black text-white shadow-sm hover:bg-blue-700':'rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 hover:border-blue-300 hover:text-blue-700'}>{label}</Link>)}
      </div>
    </div>

    {warnings.length>0&&<div className="mt-5 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900"><AlertTriangle size={18} className="mt-0.5 shrink-0"/><div><p className="text-sm font-black">Some dashboard data could not be loaded</p><p className="mt-1 text-xs">Unavailable: {warnings.join(', ')}. Your session has been kept active.</p></div></div>}

    <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card:any)=>{
        const Icon=card.icon;
        return <Link key={card.label} href={card.href} className="group rounded-[1.5rem] border border-white/80 bg-white/90 p-5 shadow-[0_12px_35px_rgba(15,23,42,.06)] transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl">
          <div className="flex items-center justify-between"><span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-700 group-hover:bg-blue-50 group-hover:text-blue-700"><Icon size={18}/></span><span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Live</span></div>
          <p className="mt-5 text-sm font-semibold text-slate-500">{card.label}</p>
          <p className="mt-2 text-3xl font-black tracking-tight">{card.value}</p>
        </Link>
      })}
    </section>

    {hasAdminCapability(role,'ORDERS')&&
      <section className="mt-6 grid gap-5 xl:grid-cols-[.85fr_1.35fr]">
        <div className="rounded-[1.5rem] border border-white/80 bg-white/90 p-5 shadow-sm">
          <h2 className="text-lg font-black">Operational summary</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-2xl bg-blue-50 p-4"><p className="text-xs font-bold text-blue-600">Average order value</p><p className="mt-2 text-2xl font-black">BDT {metrics.averageOrder.toFixed(2)}</p></div>
            {hasAdminCapability(role,'DELIVERY')&&<div className="rounded-2xl bg-emerald-50 p-4"><p className="text-xs font-bold text-emerald-700">Delivery agents</p><p className="mt-2 text-2xl font-black">{metrics.riders}</p></div>}
            {hasAdminCapability(role,'INVENTORY')&&<div className="rounded-2xl bg-amber-50 p-4"><p className="text-xs font-bold text-amber-700">Available units</p><p className="mt-2 text-2xl font-black">{metrics.available}</p></div>}
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-white/80 bg-white/90 p-5 shadow-sm">
          <div className="flex items-end justify-between gap-3"><div><h2 className="text-lg font-black">Recent orders</h2><p className="mt-1 text-xs text-slate-500">Latest transactions available to your role.</p></div><Link href="/admin/orders" className="text-xs font-black text-blue-700">View all →</Link></div>
          <div className="mt-4 space-y-2">
            {data.orders.slice(0,6).map(order=><Link key={order.id} href={`/admin/orders/${order.id}`} className="grid gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3 hover:border-blue-200 hover:bg-blue-50/40 md:grid-cols-[1fr_.7fr_.6fr]"><div><p className="text-sm font-black">{order.orderNumber}</p><p className="text-[11px] text-slate-500">{order.customerName||'Customer'}</p></div><div><p className="text-[10px] uppercase text-slate-400">Status</p><p className="text-xs font-bold">{String(order.status||'').replaceAll('_',' ')}</p></div><div className="md:text-right"><p className="text-[10px] uppercase text-slate-400">Total</p><p className="text-sm font-black">BDT {order.total}</p></div></Link>)}
            {!data.orders.length&&<div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm font-semibold text-slate-400">No order data available for this role.</div>}
          </div>
        </div>
      </section>
    }

    {!cards.length&&<div className="mt-7 rounded-3xl border border-slate-200 bg-white p-6"><h2 className="text-xl font-black">No operational module assigned</h2><p className="mt-2 text-sm text-slate-500">Ask a Super Admin to review this staff account role.</p></div>}
  </AdminShell>
}
