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
}:{initialMode?:Mode;onClose:()=>void;onAuthenticated:(user:any)=>void}) {
  const {language}=useI18n();
  const bn=language==='bn';

  const [mode,setMode]=useState<Mode>(initialMode);
  const [show,setShow]=useState(false);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
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
    e.preventDefault();
    setError('');
    setLoading(true);
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
    }finally{
      setLoading(false);
    }
  }

  const inputClass =
    "mt-1.5 h-11 w-full rounded-lg border border-[#315276] bg-[#0b1b31] px-3 text-sm text-white outline-none transition focus:border-[#38bdf8] focus:ring-2 focus:ring-sky-400/10";

  return (
    <div
      className="fixed inset-0 z-[100] overflow-y-auto bg-black/70 px-3 py-3 backdrop-blur-sm sm:px-4"
      onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}
    >
      <div className="flex min-h-full items-center justify-center">
        <div
  className={`relative my-auto w-full overflow-hidden rounded-[1.3rem] border border-[#405774] bg-[#253548] text-white shadow-2xl ${
    mode === 'login' ? 'max-w-[520px]' : 'max-w-[620px]'
  }`}
>

          <div className="bg-gradient-to-r from-[#182434] via-[#243b5a] to-[#2f557f] px-6 py-5 sm:px-7">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-white/15 transition hover:bg-white/25"
            >
              <X size={15}/>
            </button>

            <div className="flex items-center gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/15">
                {mode==='login'?<LockKeyhole size={16}/>:<UserPlus size={16}/>}
              </div>
              <div className="min-w-0">
                <h2 className="text-2xl font-black leading-tight">
                  {mode==='login'
                    ? (bn?'সাইন ইন':'Welcome back')
                    : (bn?'অ্যাকাউন্ট তৈরি করুন':'Create your account')}
                </h2>
                <p className="mt-0.5 text-xs leading-5 text-white/75">
                  {mode==='login'
                    ? (bn?'আপনার অর্ডার, উইশলিস্ট ও ট্র্যাকিং দেখুন।':'Access orders, wishlist and tracking.')
                    : (bn?'দ্রুত চেকআউট ও অর্ডার ট্র্যাকিংয়ের জন্য।':'For faster checkout and order tracking.')}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 border-b border-[#28496f] bg-[#0b1b31] p-1">
            <button
              type="button"
              onClick={()=>{setMode('login');setError('')}}
              className={`rounded-lg px-4 py-2.5 text-sm font-black transition ${
                mode==='login'
                  ? 'bg-[#38bdf8] text-[#10243a] shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {bn?'সাইন ইন':'Sign in'}
            </button>

            <button
              type="button"
              onClick={()=>{setMode('register');setError('')}}
              className={`rounded-lg px-4 py-2.5 text-sm font-black transition ${
                mode==='register'
                  ? 'bg-[#38bdf8] text-[#10243a] shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {bn?'অ্যাকাউন্ট তৈরি':'Create account'}
            </button>
          </div>

          <form onSubmit={submit} className="p-4 sm:p-4.5">
            {error&&(
              <div className="mb-2.5 rounded-lg border border-rose-100 bg-rose-50 p-2 text-[11px] font-semibold text-rose-700">
                {error}
              </div>
            )}

            {mode==='login' ? (
              <div className="grid gap-2.5">
                <label className="block text-sm font-black">
                  {bn?'ইমেইল':'Email'}
                  <input
                    required
                    type="email"
                    value={login.email}
                    onChange={e=>setLogin({...login,email:e.target.value})}
                    className={inputClass}
                  />
                </label>

                <label className="block text-sm font-black">
                  {bn?'পাসওয়ার্ড':'Password'}
                  <div className="relative">
                    <input
                      required
                      type={show?'text':'password'}
                      value={login.password}
                      onChange={e=>setLogin({...login,password:e.target.value})}
                      className={inputClass+" pr-9"}
                    />
                    <button
                      type="button"
                      onClick={()=>setShow(v=>!v)}
                      aria-label={show?'Hide password':'Show password'}
                      className="absolute right-3 top-[29px] -translate-y-1/2 text-slate-400"
                    >
                      {show?<EyeOff size={15}/>:<Eye size={15}/>}
                    </button>
                  </div>
                </label>

                <div className="flex items-center justify-between gap-3">
                  <a href="/forgot-password" className="text-xs font-black text-[#ffb44c]">
                    {bn?'পাসওয়ার্ড ভুলে গেছেন?':'Forgot password?'}
                  </a>
                </div>

                <button
                  disabled={loading}
                  className="h-11 w-full rounded-lg bg-[#f97316] text-sm font-black text-white shadow-lg shadow-orange-950/30 transition hover:bg-[#ea580c] disabled:opacity-50"
                >
                  {loading?(bn?'অপেক্ষা করুন...':'Please wait...'):(bn?'সাইন ইন':'Sign in')}
                </button>
              </div>
            ) : (
              <div className="grid gap-x-3 gap-y-2.5 sm:grid-cols-2">
                <label className="block text-sm font-black">
                  {bn?'নাম':'Full name'}
                  <input
                    required
                    value={reg.name}
                    onChange={e=>setReg({...reg,name:e.target.value})}
                    className={inputClass}
                  />
                </label>

                <label className="block text-sm font-black">
                  {bn?'ফোন':'Phone'}{' '}
                  <span className="font-normal text-slate-400">({bn?'ঐচ্ছিক':'optional'})</span>
                  <input
                    value={reg.phone}
                    onChange={e=>setReg({...reg,phone:e.target.value})}
                    className={inputClass}
                  />
                </label>

                <label className="block text-sm font-black sm:col-span-2">
                  {bn?'ইমেইল':'Email'}
                  <input
                    required
                    type="email"
                    value={reg.email}
                    onChange={e=>setReg({...reg,email:e.target.value})}
                    className={inputClass}
                  />
                </label>

                <label className="block text-sm font-black">
                  {bn?'পাসওয়ার্ড':'Password'}
                  <div className="relative">
                    <input
                      required
                      type={show?'text':'password'}
                      value={reg.password}
                      onChange={e=>setReg({...reg,password:e.target.value})}
                      className={inputClass+" pr-9"}
                    />
                    <button
                      type="button"
                      onClick={()=>setShow(v=>!v)}
                      aria-label={show?'Hide password':'Show password'}
                      className="absolute right-3 top-[29px] -translate-y-1/2 text-slate-400"
                    >
                      {show?<EyeOff size={15}/>:<Eye size={15}/>}
                    </button>
                  </div>
                </label>

                <label className="block text-sm font-black">
                  {bn?'পাসওয়ার্ড নিশ্চিত করুন':'Confirm password'}
                  <input
                    required
                    type={show?'text':'password'}
                    value={reg.confirmPassword}
                    onChange={e=>setReg({...reg,confirmPassword:e.target.value})}
                    className={inputClass}
                  />
                </label>

                <div className="flex flex-wrap gap-1 sm:col-span-2">
                  {checks.map(([x,ok])=>(
                    <span
                      key={x}
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        ok?'bg-emerald-50 text-emerald-700':'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {x}
                    </span>
                  ))}
                </div>

                <label className="flex items-start gap-2 text-xs leading-5 text-slate-400 sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={terms}
                    onChange={e=>setTerms(e.target.checked)}
                    className="mt-0.5 accent-blue-600"
                  />
                  <span>
                    {bn?'আমি Terms ও Privacy Policy গ্রহণ করছি।':'I accept the Terms and Privacy Policy.'}
                  </span>
                </label>

                <button
                  disabled={loading}
                  className="h-11 w-full rounded-lg bg-[#f97316] text-sm font-black text-white shadow-lg shadow-orange-950/30 transition hover:bg-[#ea580c] disabled:opacity-50 sm:col-span-2"
                >
                  {loading?(bn?'অপেক্ষা করুন...':'Please wait...'):(bn?'অ্যাকাউন্ট তৈরি':'Create account')}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}


