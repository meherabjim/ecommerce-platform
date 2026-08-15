export type GuestCartItem = {
  variantId:string;
  slug:string;
  productName:string;
  productNameBn?:string|null;
  sku:string;
  attributes:Record<string,any>;
  unitPrice:number;
  quantity:number;
  imageUrl?:string|null;
};

const KEY='neuroGuestCart';

export function getGuestCart():GuestCartItem[]{
  if(typeof window==='undefined')return[];
  try{return JSON.parse(localStorage.getItem(KEY)||'[]') as GuestCartItem[]}catch{return[]}
}

export function saveGuestCart(items:GuestCartItem[]){
  if(typeof window==='undefined')return;
  localStorage.setItem(KEY,JSON.stringify(items));
  window.dispatchEvent(new CustomEvent('guest-cart-updated'));
}

export function addGuestCartItem(item:GuestCartItem){
  const items=getGuestCart();
  const existing=items.find(x=>x.variantId===item.variantId);
  if(existing)existing.quantity+=item.quantity;
  else items.push(item);
  saveGuestCart(items);
  return items;
}

export function updateGuestCartItem(variantId:string,quantity:number){
  const items=getGuestCart().map(x=>x.variantId===variantId?{...x,quantity}:x).filter(x=>x.quantity>0);
  saveGuestCart(items);
  return items;
}

export function removeGuestCartItem(variantId:string){
  const items=getGuestCart().filter(x=>x.variantId!==variantId);
  saveGuestCart(items);
  return items;
}

export function clearGuestCart(){
  saveGuestCart([]);
}

export async function mergeGuestCartIntoServer(apiClient:any){
  const items=getGuestCart();
  if(!items.length)return;
  for(const item of items){
    await apiClient.post('/cart/items',{variantId:item.variantId,quantity:item.quantity});
  }
  clearGuestCart();
}
