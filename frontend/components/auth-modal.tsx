'use client';

import { FormEvent, useMemo, useState } from 'react';
import { Eye, EyeOff, LockKeyhole, UserPlus, X } from 'lucide-react';
import { api } from '@/lib/api';
import { saveAuth } from '@/lib/auth';
import { mergeGuestCartIntoServer } from '@/lib/guest-cart';
import { useI18n } from '@/lib/i18n';

type Mode='login'|'register';

export default function AuthModal({
  initialMode='login',
  onClose,
  onAuthenticated,
}:{initialMode?:Mode;onClose:()=>void;onAuthenticated:(user:any)=>void}){
  const {language}=useI18n(); const bn=language==='bn';
  const [mode,setMode]=useState<Mode>(initialMode);
  const [show,setShow]=useState(false); const [loading,setLoading]=useState(false); const [error,setError]=useState('');
  const [login,setLogin]=useState({email:'',password:''});
  const [reg,setReg]=useState({name:'',email:'',phone:'',password:'',confirmPassword:''});
  const [terms,setTerms]=useState(false);
  const checks=useMemo(()=>[
    [bn?'৮+ অক্ষর':'8+ characters',reg.password.length>=8],
    [bn?'বড় হাতের অক্ষর':'Uppercase',/[A-Z]/.test(reg.password)],
    [bn?'ছোট হাতের অক্ষর':'Lowercase',/[a-z]/.test(reg.password)],
    [bn?'সংখ্যা':'Number',/\d/.test(reg.password)]
  ] as [string,boolean][],[reg.password,bn]);

  async function submit(e:FormEvent){
    e.preventDefault(); setError(''); setLoading(true);
    try{
      let data:any;
      if(mode==='login'){
        data=(await api.post('/auth/login',login)).data;
      }else{
        if(reg.password!==reg.confirmPassword) throw new Error(bn?'দুইটি পাসওয়ার্ড মিলছে না।':'Passwords do not match.');
        if(!checks.every(x=>x[1])) throw new Error(bn?'পাসওয়ার্ডের সব শর্ত পূরণ করুন।':'Please meet all password requirements.');
        if(!terms) throw new Error(bn?'Terms ও Privacy Policy গ্রহণ করুন।':'Please accept the Terms and Privacy Policy.');
        const {confirmPassword,...p}=reg;
        data=(await api.post('/auth/register',{...p,phone:p.phone||undefined})).data;
      }
      if(!data?.user) throw new Error('User data missing from authentication response.');
      saveAuth(data.accessToken,data.user,data.refreshToken);
      try{await mergeGuestCartIntoServer(api)}catch{}
      onAuthenticated(data.user);
    }catch(err:any){
      const m=err?.response?.data?.message;
      setError(Array.isArray(m)?m.join(', '):m||err?.message||(bn?'অনুরোধ সম্পন্ন করা যায়নি।':'Request failed.'));
    }finally{setLoading(false)}
  }

  return <div className="fixed inset-0 z-[100] grid place-items-center bg-black/70 p-4 backdrop-blur-sm" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}>
    <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-[#405774] bg-[#253548] text-white shadow-2xl">
      <div className="bg-gradient-to-r from-[#182434] via-[#243b5a] to-[#2f557f] p-6 text-white">
        <button onClick={onClose} className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/15 hover:bg-white/25"><X size={18}/></button>
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/15">{mode==='login'?<LockKeyhole/>:<UserPlus/>}</div>
        <h2 className="mt-4 text-2xl font-black">{mode==='login'?(bn?'সাইন ইন':'Welcome back'):(bn?'অ্যাকাউন্ট তৈরি করুন':'Create your account')}</h2>
        <p className="mt-1 text-xs text-white/75">{mode==='login'?(bn?'আপনার অর্ডার, উইশলিস্ট ও ট্র্যাকিং দেখুন।':'Access orders, wishlist and tracking.'):(bn?'দ্রুত checkout ও order tracking-এর জন্য।':'For faster checkout and order tracking.')}</p>
      </div>

      <div className="grid grid-cols-2 border-b border-[#28496f] bg-[#0b1b31] p-2">
        <button onClick={()=>{setMode('login');setError('')}} className={`rounded-xl px-3 py-2.5 text-sm font-black ${mode==='login'?'bg-[#38bdf8] text-[#10243a] shadow-sm':'text-slate-400'}`}>{bn?'সাইন ইন':'Sign in'}</button>
        <button onClick={()=>{setMode('register');setError('')}} className={`rounded-xl px-3 py-2.5 text-sm font-black ${mode==='register'?'bg-[#38bdf8] text-[#10243a] shadow-sm':'text-slate-400'}`}>{bn?'অ্যাকাউন্ট তৈরি':'Create account'}</button>
      </div>

      <form onSubmit={submit} className="p-6">
        {error&&<div className="mb-4 rounded-xl border border-rose-100 bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</div>}
        {mode==='register'&&<label className="block text-sm font-black">{bn?'নাম':'Full name'}<input required value={reg.name} onChange={e=>setReg({...reg,name:e.target.value})} className="mt-2 w-full rounded-xl border border-[#315276] bg-[#0b1b31] text-white p-3 outline-none focus:border-blue-500"/></label>}
        <label className={`${mode==='register'?'mt-4':'mt-0'} block text-sm font-black`}>{bn?'ইমেইল':'Email'}<input required type="email" value={mode==='login'?login.email:reg.email} onChange={e=>mode==='login'?setLogin({...login,email:e.target.value}):setReg({...reg,email:e.target.value})} className="mt-2 w-full rounded-xl border border-[#315276] bg-[#0b1b31] text-white p-3 outline-none focus:border-blue-500"/></label>
        {mode==='register'&&<label className="mt-4 block text-sm font-black">{bn?'ফোন':'Phone'} <span className="font-normal text-slate-400">({bn?'ঐচ্ছিক':'optional'})</span><input value={reg.phone} onChange={e=>setReg({...reg,phone:e.target.value})} className="mt-2 w-full rounded-xl border border-[#315276] bg-[#0b1b31] text-white p-3 outline-none focus:border-blue-500"/></label>}
        <label className="mt-4 block text-sm font-black">{bn?'পাসওয়ার্ড':'Password'}<div className="relative"><input required type={show?'text':'password'} value={mode==='login'?login.password:reg.password} onChange={e=>mode==='login'?setLogin({...login,password:e.target.value}):setReg({...reg,password:e.target.value})} className="mt-2 w-full rounded-xl border border-[#315276] bg-[#0b1b31] text-white p-3 pr-11 outline-none focus:border-blue-500"/><button type="button" onClick={()=>setShow(v=>!v)} className="absolute right-3 top-5 text-slate-400">{show?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></label>
        {mode==='register'&&<>
          <label className="mt-4 block text-sm font-black">{bn?'পাসওয়ার্ড নিশ্চিত করুন':'Confirm password'}<input required type={show?'text':'password'} value={reg.confirmPassword} onChange={e=>setReg({...reg,confirmPassword:e.target.value})} className="mt-2 w-full rounded-xl border border-[#315276] bg-[#0b1b31] text-white p-3 outline-none focus:border-blue-500"/></label>
          <div className="mt-3 flex flex-wrap gap-1.5">{checks.map(([x,ok])=><span key={x} className={`rounded-full px-2 py-1 text-[10px] font-bold ${ok?'bg-emerald-50 text-emerald-700':'bg-slate-100 text-slate-400'}`}>{x}</span>)}</div>
          <label className="mt-4 flex items-start gap-2 text-xs text-slate-500"><input type="checkbox" checked={terms} onChange={e=>setTerms(e.target.checked)} className="mt-0.5 accent-blue-600"/><span>{bn?'Terms ও Privacy Policy গ্রহণ করছি।':'I accept the Terms and Privacy Policy.'}</span></label>
        </>}
        {mode==='login'&&<a href="/forgot-password" className="mt-3 inline-block text-xs font-black text-[#ffb44c]">{bn?'পাসওয়ার্ড ভুলে গেছেন?':'Forgot password?'}</a>}
        <button disabled={loading} className="mt-5 w-full rounded-xl bg-[#f97316] py-3.5 text-sm font-black text-white shadow-lg shadow-orange-950/30 disabled:opacity-50">{loading?(bn?'অপেক্ষা করুন...':'Please wait...'):(mode==='login'?(bn?'সাইন ইন':'Sign in'):(bn?'অ্যাকাউন্ট তৈরি করুন':'Create account'))}</button>
      </form>
    </div>
  </div>
}
