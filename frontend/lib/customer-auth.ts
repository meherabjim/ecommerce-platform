'use client';

export type CustomerAuthMode = 'login'|'register';

export function authRedirectUrl(next='/account', mode:CustomerAuthMode='login'){
  const q=new URLSearchParams({auth:mode,next});
  return `/?${q.toString()}`;
}

export function openAuthModal(mode:CustomerAuthMode='login', next?:string){
  if(typeof window==='undefined') return;
  window.dispatchEvent(new CustomEvent('neuro-auth-open',{detail:{mode,next}}));
}
