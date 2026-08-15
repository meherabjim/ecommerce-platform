'use client';

import { FormEvent,useEffect,useMemo,useState } from 'react';
import { useRouter } from 'next/navigation';
import { AtSign, CheckCircle2, Mail, Phone, Save, ShieldCheck, UserRound } from 'lucide-react';
import Navbar from '@/components/navbar';
import AccountShell from '@/components/account-shell';
import StoreFooter from '@/components/store-footer';
import { api } from '@/lib/api';
import { getStoredUser,saveAuth } from '@/lib/auth';
import { authRedirectUrl } from '@/lib/customer-auth';
import { useI18n } from '@/lib/i18n';

export default function ProfilePage(){
  const router=useRouter();
  const {language}=useI18n();
  const [f,setF]=useState({name:'',email:'',phone:''});
  const [message,setMessage]=useState('');
  const [busy,setBusy]=useState(false);

  useEffect(()=>{
    const u=getStoredUser();
    if(!u){router.replace(authRedirectUrl('/account/profile'));return}
    setF({name:u.name||'',email:u.email||'',phone:u.phone||''});
  },[router]);

  const completeness=useMemo(()=>{
    const values=[f.name,f.email,f.phone].filter(x=>String(x||'').trim());
    return Math.round(values.length/3*100);
  },[f]);

  async function submit(e:FormEvent){
    e.preventDefault();setBusy(true);setMessage('');
    try{
      const r=await api.patch('/users/me/profile',f);
      const a=localStorage.getItem('accessToken');
      const rt=localStorage.getItem('refreshToken')||undefined;
      if(a)saveAuth(a,r.data,rt);
      setMessage(language==='bn'?'প্রোফাইল সফলভাবে আপডেট হয়েছে।':'Profile updated successfully.');
    }catch(e:any){
      setMessage(e?.response?.data?.message||(language==='bn'?'প্রোফাইল আপডেট করা যায়নি।':'Profile update failed.'));
    }finally{setBusy(false)}
  }

  return <main className="customer-canvas customer-v3"><Navbar/><AccountShell>
    <section className="customer-panel-soft overflow-hidden p-6 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div>
          <p className="customer-kicker">{language==='bn'?'ব্যক্তিগত তথ্য':'Personal details'}</p>
          <h1 className="customer-title">{language==='bn'?'আপনার প্রোফাইল':'Your profile'}</h1>
          <p className="customer-subtitle">{language==='bn'?'ডেলিভারি ও অ্যাকাউন্ট যোগাযোগের জন্য আপনার তথ্য আপডেট রাখুন।':'Keep your contact details current for delivery updates and account communication.'}</p>
        </div>
        <div className="min-w-44 rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-white">
          <div className="flex items-center justify-between text-xs font-black"><span>{language==='bn'?'প্রোফাইল সম্পূর্ণ':'Profile complete'}</span><span className="text-[#1464f4]">{completeness}%</span></div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-gradient-to-r from-[#1464f4] via-[#7048ff] to-[#f36b21]" style={{width:`${completeness}%`}}/></div>
        </div>
      </div>
    </section>

    {message&&<div className="mt-5 flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm font-bold text-blue-800"><CheckCircle2 size={18}/>{message}</div>}

    <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_300px]">
      <form onSubmit={submit} className="customer-panel p-6 sm:p-7">
        <div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#1464f4] to-[#7048ff] text-white"><UserRound size={20}/></span><div><h2 className="text-xl font-black">{language==='bn'?'অ্যাকাউন্ট তথ্য':'Account information'}</h2><p className="text-sm text-slate-500">{language==='bn'?'আপনার নাম, ইমেইল ও ফোন নম্বর।':'Your name, email address and phone number.'}</p></div></div>
        <div className="mt-6 grid gap-5">
          <label className="text-sm font-black">{language==='bn'?'নাম':'Full name'}<div className="relative mt-2"><UserRound size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/><input required value={f.name} onChange={e=>setF({...f,name:e.target.value})} className="focus-ring w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 font-normal outline-none"/></div></label>
          <label className="text-sm font-black">{language==='bn'?'ইমেইল':'Email'}<div className="relative mt-2"><Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/><input required type="email" value={f.email} onChange={e=>setF({...f,email:e.target.value})} className="focus-ring w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 font-normal outline-none"/></div></label>
          <label className="text-sm font-black">{language==='bn'?'ফোন':'Phone'}<div className="relative mt-2"><Phone size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/><input value={f.phone} onChange={e=>setF({...f,phone:e.target.value})} className="focus-ring w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 font-normal outline-none"/></div></label>
        </div>
        <button disabled={busy} className="customer-btn-primary mt-6 disabled:opacity-50"><Save size={16}/>{busy?(language==='bn'?'সেভ হচ্ছে...':'Saving...'):(language==='bn'?'প্রোফাইল সেভ করুন':'Save profile')}</button>
      </form>

      <aside className="space-y-4">
        <div className="customer-panel p-5"><span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><ShieldCheck size={19}/></span><h3 className="mt-4 font-black">{language==='bn'?'নিরাপদ অ্যাকাউন্ট':'Secure account'}</h3><p className="mt-2 text-xs leading-5 text-slate-500">{language==='bn'?'পাসওয়ার্ড ও সক্রিয় ডিভাইস Security পেইজ থেকে নিয়ন্ত্রণ করুন।':'Manage passwords and active devices from Security.'}</p></div>
        <div className="customer-panel p-5"><span className="grid h-11 w-11 place-items-center rounded-xl bg-orange-50 text-[#f36b21]"><AtSign size={19}/></span><h3 className="mt-4 font-black">{language==='bn'?'যোগাযোগ তথ্য':'Contact details'}</h3><p className="mt-2 text-xs leading-5 text-slate-500">{language==='bn'?'সঠিক ফোন ও ইমেইল অর্ডার আপডেট পেতে সাহায্য করে।':'Accurate phone and email details help with order updates.'}</p></div>
      </aside>
    </div>
  </AccountShell><StoreFooter/></main>
}
