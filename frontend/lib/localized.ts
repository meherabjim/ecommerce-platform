import type { Language } from '@/lib/i18n';

export function localizedValue<T=any>(language:Language,source:any,enKey:string,bnKey?:string,fallback?:T):T{
  if(language==='bn'&&bnKey&&source?.[bnKey]!==undefined&&source?.[bnKey]!==null&&source?.[bnKey]!=='')return source[bnKey] as T;
  if(source?.[enKey]!==undefined&&source?.[enKey]!==null&&source?.[enKey]!=='')return source[enKey] as T;
  return fallback as T;
}

export function localizedProductName(language:Language,p:any){
  return language==='bn'?(p?.nameBn||p?.name||'পণ্য'):(p?.name||'Product');
}

export function localizedProductDescription(language:Language,p:any,short=false){
  if(language==='bn')return (short?p?.shortDescriptionBn:p?.descriptionBn)||(short?p?.shortDescription:p?.description)||'';
  return (short?p?.shortDescription:p?.description)||'';
}

export function localizedCategoryName(language:Language,c:any){
  return language==='bn'?(c?.nameBn||c?.name||'ক্যাটাগরি'):(c?.name||'Category');
}
