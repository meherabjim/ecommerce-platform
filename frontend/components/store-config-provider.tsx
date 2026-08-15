'use client';

import {
  createContext, useContext, useEffect, useMemo, useState,
} from 'react';
import { api } from '@/lib/api';

type StoreConfig = Record<string,any>;

const StoreConfigContext=createContext<StoreConfig>({});

export function StoreConfigProvider({children}:{children:React.ReactNode}){
  const [config,setConfig]=useState<StoreConfig>({});

  useEffect(()=>{
    api.get('/cms/public/settings').then(r=>{
      const value=r.data||{};
      setConfig(value);

      const theme=value['store.theme']||{};
      const root=document.documentElement;
      if(theme.primary) root.style.setProperty('--store-primary',theme.primary);
      // Customer storefront uses the V3 dark design system. Keep admin/config
      // values available elsewhere, but do not let a light DB theme repaint the
      // browser root during hydration and cause a white flash.
      if(theme.surface && !String(theme.surface).toLowerCase().includes('#fff')) root.style.setProperty('--store-surface',theme.surface);
      if(theme.background && !['#fff','#ffffff','#f5f6f8','#f7f9fc'].includes(String(theme.background).toLowerCase())) root.style.setProperty('--store-background',theme.background);
      if(theme.accent) root.style.setProperty('--store-accent',theme.accent);
      if(theme.radius) root.style.setProperty('--store-radius',theme.radius);
      if(theme.fontFamily) root.style.fontFamily=theme.fontFamily;
    }).catch(()=>{});
  },[]);

  const memo=useMemo(()=>config,[config]);
  return <StoreConfigContext.Provider value={memo}>{children}</StoreConfigContext.Provider>
}

export function useStoreConfig(){return useContext(StoreConfigContext)}
