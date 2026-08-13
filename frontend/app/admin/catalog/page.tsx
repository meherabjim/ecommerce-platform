'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminShell from '@/components/admin-shell';
import { api } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';

export default function CatalogAdmin(){
  const router=useRouter();
  const [categories,setCategories]=useState<any[]>([]);
  const [brands,setBrands]=useState<any[]>([]);
  const [products,setProducts]=useState<any[]>([]);
  const [message,setMessage]=useState('');
  const [editing,setEditing]=useState<any|null>(null);
  const [search,setSearch]=useState('');

  const [product,setProduct]=useState({
    name:'',categoryId:'',brandId:'',shortDescription:'',description:'',
    primaryImageUrl:'',featured:false
  });

  const [variant,setVariant]=useState({
    productId:'',sku:'',variantCode:'',attributesText:'Color=Black,Size=M',
    price:'',salePrice:'',costPrice:'',openingStock:'0',imageUrl:''
  });

  const [category,setCategory]=useState({name:'',barcodePrefix:''});
  const [brand,setBrand]=useState('');

  async function load(){
    const [c,b,p]=await Promise.all([
      api.get('/catalog/categories'),
      api.get('/catalog/brands'),
      api.get('/catalog/products')
    ]);
    setCategories(c.data);setBrands(b.data);setProducts(p.data);
  }

  useEffect(()=>{
    const u=getStoredUser();
    if(!u||u.role!=='ADMIN'){router.replace('/login');return;}
    load();
  },[router]);

  const filtered=useMemo(()=>products.filter(p=>
    `${p.name} ${p.category?.name||''} ${p.brand?.name||''}`.toLowerCase().includes(search.toLowerCase())
  ),[products,search]);

  const attrs=(t:string)=>Object.fromEntries(
    t.split(',').map(x=>x.trim()).filter(Boolean).map(x=>{
      const [k,...v]=x.split('=');return [k.trim(),v.join('=').trim()]
    }).filter(([k,v])=>k&&v)
  );

  async function createCategory(e:FormEvent){
    e.preventDefault();
    try{
      await api.post('/catalog/categories',category);
      setCategory({name:'',barcodePrefix:''});setMessage('Category created.');await load();
    }catch(e:any){setMessage(e?.response?.data?.message||'Category failed.')}
  }

  async function createBrand(e:FormEvent){
    e.preventDefault();
    try{
      await api.post('/catalog/brands',{name:brand});
      setBrand('');setMessage('Brand created.');await load();
    }catch(e:any){setMessage(e?.response?.data?.message||'Brand failed.')}
  }

  async function saveProduct(e:FormEvent){
    e.preventDefault();
    try{
      const body={...product,brandId:product.brandId||undefined,status:editing?.status||'DRAFT'};
      if(editing) await api.patch(`/catalog/products/${editing.id}`,body);
      else await api.post('/catalog/products',body);
      setProduct({name:'',categoryId:'',brandId:'',shortDescription:'',description:'',primaryImageUrl:'',featured:false});
      setEditing(null);setMessage(editing?'Product updated.':'Product created.');await load();
    }catch(e:any){setMessage(e?.response?.data?.message||'Product save failed.')}
  }

  function beginEdit(p:any){
    setEditing(p);
    setProduct({
      name:p.name||'',categoryId:p.categoryId||'',brandId:p.brandId||'',
      shortDescription:p.shortDescription||'',description:p.description||'',
      primaryImageUrl:p.primaryImageUrl||'',featured:!!p.featured
    });
    window.scrollTo({top:0,behavior:'smooth'});
  }

  async function createVariant(e:FormEvent){
    e.preventDefault();
    try{
      await api.post('/catalog/variants',{
        productId:variant.productId,sku:variant.sku,variantCode:variant.variantCode,
        attributes:attrs(variant.attributesText),price:Number(variant.price),
        salePrice:variant.salePrice?Number(variant.salePrice):undefined,
        costPrice:variant.costPrice?Number(variant.costPrice):undefined,
        openingStock:Number(variant.openingStock||0),
        imageUrl:variant.imageUrl||undefined
      });
      setVariant({productId:'',sku:'',variantCode:'',attributesText:'Color=Black,Size=M',price:'',salePrice:'',costPrice:'',openingStock:'0',imageUrl:''});
      setMessage('Variant created with automatic barcode.');await load();
    }catch(e:any){setMessage(e?.response?.data?.message||'Variant failed.')}
  }

  async function activate(id:string,status:string){
    try{
      await api.patch(`/catalog/products/${id}/status?status=${status}`);
      setMessage(`Product ${status.toLowerCase()}.`);await load();
    }catch(e:any){setMessage(e?.response?.data?.message||'Status update failed.')}
  }

  return <AdminShell>
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Catalog management</p>
        <h1 className="mt-2 text-4xl font-black">Products & variants</h1>
        <p className="mt-2 text-slate-500">Create, edit, price and publish sellable inventory.</p>
      </div>
      <input className="rounded-xl border bg-white px-4 py-3" placeholder="Search catalog..." value={search} onChange={e=>setSearch(e.target.value)}/>
    </div>

    {message&&<div className="mt-5 rounded-2xl border bg-white p-4 text-sm font-semibold">{message}</div>}

    <section className="mt-6 grid gap-5 xl:grid-cols-[1.4fr_1fr]">
      <form onSubmit={saveProduct} className="rounded-3xl bg-white p-6 border">
        <div className="flex justify-between gap-4">
          <div><h2 className="text-xl font-black">{editing?'Edit product':'New product'}</h2><p className="text-sm text-slate-500">Core product information.</p></div>
          {editing&&<button type="button" onClick={()=>{setEditing(null);setProduct({name:'',categoryId:'',brandId:'',shortDescription:'',description:'',primaryImageUrl:'',featured:false})}} className="text-sm font-bold underline">Cancel edit</button>}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <input className="rounded-xl border p-3" placeholder="Product name" required value={product.name} onChange={e=>setProduct({...product,name:e.target.value})}/>
          <select className="rounded-xl border p-3" required value={product.categoryId} onChange={e=>setProduct({...product,categoryId:e.target.value})}>
            <option value="">Category</option>{categories.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}
          </select>
          <select className="rounded-xl border p-3" value={product.brandId} onChange={e=>setProduct({...product,brandId:e.target.value})}>
            <option value="">No brand</option>{brands.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}
          </select>
          <input className="rounded-xl border p-3" placeholder="Image URL" value={product.primaryImageUrl} onChange={e=>setProduct({...product,primaryImageUrl:e.target.value})}/>
        </div>

        <input className="mt-3 w-full rounded-xl border p-3" placeholder="Short description" value={product.shortDescription} onChange={e=>setProduct({...product,shortDescription:e.target.value})}/>
        <textarea className="mt-3 min-h-28 w-full rounded-xl border p-3" placeholder="Full description" value={product.description} onChange={e=>setProduct({...product,description:e.target.value})}/>
        <label className="mt-3 flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={product.featured} onChange={e=>setProduct({...product,featured:e.target.checked})}/> Featured product</label>
        <button className="mt-5 rounded-xl bg-slate-950 px-5 py-3 font-bold text-white">{editing?'Save changes':'Create product'}</button>
      </form>

      <div className="space-y-5">
        <form onSubmit={createCategory} className="rounded-3xl bg-white p-6 border">
          <h2 className="font-black">Quick category</h2>
          <div className="mt-3 grid grid-cols-[1fr_110px] gap-2">
            <input className="rounded-xl border p-3" placeholder="Name" required value={category.name} onChange={e=>setCategory({...category,name:e.target.value})}/>
            <input className="rounded-xl border p-3" placeholder="2 digits" maxLength={2} required value={category.barcodePrefix} onChange={e=>setCategory({...category,barcodePrefix:e.target.value})}/>
          </div>
          <button className="mt-3 rounded-xl border px-4 py-2 text-sm font-bold">Add category</button>
        </form>

        <form onSubmit={createBrand} className="rounded-3xl bg-white p-6 border">
          <h2 className="font-black">Quick brand</h2>
          <input className="mt-3 w-full rounded-xl border p-3" placeholder="Brand name" required value={brand} onChange={e=>setBrand(e.target.value)}/>
          <button className="mt-3 rounded-xl border px-4 py-2 text-sm font-bold">Add brand</button>
        </form>
      </div>
    </section>

    <form onSubmit={createVariant} className="mt-5 rounded-3xl bg-slate-950 p-6 text-white">
      <h2 className="text-xl font-black">Add sellable variant</h2>
      <p className="mt-1 text-sm text-white/50">Creates SKU + unique barcode + opening inventory.</p>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <select className="rounded-xl bg-white/10 p-3" required value={variant.productId} onChange={e=>setVariant({...variant,productId:e.target.value})}>
          <option className="text-black" value="">Product</option>{products.map(x=><option className="text-black" key={x.id} value={x.id}>{x.name}</option>)}
        </select>
        <input className="rounded-xl bg-white/10 p-3" placeholder="SKU" required value={variant.sku} onChange={e=>setVariant({...variant,sku:e.target.value})}/>
        <input className="rounded-xl bg-white/10 p-3" placeholder="Variant code" required value={variant.variantCode} onChange={e=>setVariant({...variant,variantCode:e.target.value})}/>
        <input className="rounded-xl bg-white/10 p-3 md:col-span-2" placeholder="Color=Black,Size=M" required value={variant.attributesText} onChange={e=>setVariant({...variant,attributesText:e.target.value})}/>
        <input className="rounded-xl bg-white/10 p-3" placeholder="Variant image URL" value={variant.imageUrl} onChange={e=>setVariant({...variant,imageUrl:e.target.value})}/>
        <input type="number" step="0.01" min="0" className="rounded-xl bg-white/10 p-3" placeholder="Price" required value={variant.price} onChange={e=>setVariant({...variant,price:e.target.value})}/>
        <input type="number" step="0.01" min="0" className="rounded-xl bg-white/10 p-3" placeholder="Sale price" value={variant.salePrice} onChange={e=>setVariant({...variant,salePrice:e.target.value})}/>
        <input type="number" step="0.01" min="0" className="rounded-xl bg-white/10 p-3" placeholder="Cost price" value={variant.costPrice} onChange={e=>setVariant({...variant,costPrice:e.target.value})}/>
        <input type="number" min="0" className="rounded-xl bg-white/10 p-3" placeholder="Opening stock" value={variant.openingStock} onChange={e=>setVariant({...variant,openingStock:e.target.value})}/>
      </div>
      <button className="mt-4 rounded-xl bg-white px-5 py-3 font-bold text-slate-950">Create variant</button>
    </form>

    <section className="mt-6 space-y-4">
      {filtered.map(p=><div key={p.id} className="rounded-3xl border bg-white p-6">
        <div className="flex flex-wrap justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">{p.category?.name} {p.brand?.name?`| ${p.brand.name}`:''}</p>
            <h3 className="mt-1 text-xl font-black">{p.name}</h3>
            <p className="mt-1 text-sm text-slate-500">{p.shortDescription}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={()=>beginEdit(p)} className="rounded-lg border px-3 py-2 text-xs font-bold">EDIT</button>
            {p.status!=='ACTIVE'
              ?<button onClick={()=>activate(p.id,'ACTIVE')} className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white">ACTIVATE</button>
              :<button onClick={()=>activate(p.id,'INACTIVE')} className="rounded-lg border px-3 py-2 text-xs font-bold">DEACTIVATE</button>}
          </div>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {p.variants?.map((v:any)=><div key={v.id} className="rounded-2xl bg-slate-50 p-4">
            <div className="flex justify-between gap-3">
              <div><p className="font-black">{v.sku}</p><p className="font-mono text-xs text-slate-500">{v.barcode}</p><p className="mt-1 text-xs">{Object.values(v.attributes||{}).join(' / ')}</p></div>
              <div className="text-right"><p className="font-black">BDT {v.salePrice||v.price}</p><p className="text-xs text-slate-500">Available {v.stock}</p></div>
            </div>
          </div>)}
        </div>
      </div>)}
    </section>
  </AdminShell>
}
