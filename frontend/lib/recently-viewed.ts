export type RecentlyViewedProduct = {
  id:string;
  slug:string;
  name:string;
  nameBn?:string|null;
  primaryImageUrl?:string|null;
  media?:any[];
  category?:any;
  variants?:any[];
  viewedAt:number;
};

const KEY='neuroRecentlyViewed';
const LIMIT=10;

export function getRecentlyViewed():RecentlyViewedProduct[]{
  if(typeof window==='undefined') return [];
  try{
    const raw=localStorage.getItem(KEY);
    const rows=raw?JSON.parse(raw):[];
    return Array.isArray(rows)?rows:[];
  }catch{return []}
}

export function rememberRecentlyViewed(product:any){
  if(typeof window==='undefined'||!product?.id)return;
  const compact:RecentlyViewedProduct={
    id:product.id,
    slug:product.slug,
    name:product.name,
    nameBn:product.nameBn||null,
    primaryImageUrl:product.primaryImageUrl||null,
    media:Array.isArray(product.media)?product.media.slice(0,3):[],
    category:product.category?{id:product.category.id,name:product.category.name,nameBn:product.category.nameBn}:null,
    variants:Array.isArray(product.variants)?product.variants.slice(0,4).map((v:any)=>({
      id:v.id,price:v.price,salePrice:v.salePrice,stock:v.stock,imageUrl:v.imageUrl,attributes:v.attributes,sku:v.sku,
    })):[],
    viewedAt:Date.now(),
  };
  const next=[compact,...getRecentlyViewed().filter(x=>x.id!==compact.id)].slice(0,LIMIT);
  localStorage.setItem(KEY,JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('recently-viewed-updated'));
}


export function pruneRecentlyViewed(activeIds:string[]){
  if(typeof window==='undefined') return;
  try{
    const allowed=new Set(activeIds||[]);
    const next=getRecentlyViewed().filter(x=>allowed.has(x.id));
    localStorage.setItem(KEY,JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('recently-viewed-updated'));
  }catch{}
}
