'use client';

import { FormEvent,useEffect,useMemo,useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Edit3, FolderTree, Plus, Save, Trash2, X } from 'lucide-react';
import AdminShell from '@/components/admin-shell';
import { api } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';

const empty={name:'',nameBn:'',barcodePrefix:'',description:'',descriptionBn:'',imageUrl:'',parentId:'',sortOrder:0,featuredInNav:false,active:true};

export default function CategoryManager(){
  const [items,setItems]=useState<any[]>([]);
  const [form,setForm]=useState<any>(empty);
  const [editing,setEditing]=useState<any|null>(null);
  const [message,setMessage]=useState('');

  async function load(){setItems((await api.get('/catalog/categories')).data||[])}
  useEffect(()=>{const u=getStoredUser();if(!u||!['SUPER_ADMIN','ADMIN','CATALOG_MANAGER'].includes(String(u.role).toUpperCase()))return;load()},[]);

  const roots=useMemo(()=>items.filter(x=>!x.parentId),[items]);
  const children=(id:string)=>items.filter(x=>x.parentId===id);

  function edit(row:any){setEditing(row);setForm({name:row.name||'',nameBn:row.nameBn||'',barcodePrefix:row.barcodePrefix||'',description:row.description||'',descriptionBn:row.descriptionBn||'',imageUrl:row.imageUrl||'',parentId:row.parentId||'',sortOrder:Number(row.sortOrder||0),featuredInNav:!!row.featuredInNav,active:!!row.active});window.scrollTo({top:0,behavior:'smooth'})}
  function cancel(){setEditing(null);setForm(empty)}

  async function save(e:FormEvent){
    e.preventDefault();setMessage('');
    try{
      const body={...form,parentId:form.parentId||undefined,sortOrder:Number(form.sortOrder||0)};
      if(editing){
        delete body.barcodePrefix;
        await api.patch(`/catalog/categories/${editing.id}`,body);
      }else await api.post('/catalog/categories',body);
      setMessage(editing?'Category updated.':'Category created.');cancel();await load();
    }catch(e:any){setMessage(e?.response?.data?.message||'Could not save category.')}
  }

  async function remove(row:any){
    if(!confirm(`Delete category "${row.name}"?`))return;
    try{await api.delete(`/catalog/categories/${row.id}`);setMessage('Category deleted.');await load()}
    catch(e:any){setMessage(e?.response?.data?.message||'Could not delete category.')}
  }

  const Card=({row,child=false}:{row:any,child?:boolean})=><div className={`rounded-2xl border bg-white p-4 ${child?'ml-6 border-blue-100':'border-slate-200'}`}>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        {row.imageUrl?<img src={row.imageUrl} alt="" className="h-12 w-12 rounded-xl object-cover"/>:<span className="grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-blue-600"><FolderTree size={20}/></span>}
        <div className="min-w-0"><p className="truncate font-black text-slate-900">{row.name} {row.nameBn&&<span className="font-semibold text-slate-400">/ {row.nameBn}</span>}</p><p className="mt-1 text-xs text-slate-500">Prefix {row.barcodePrefix} · order {row.sortOrder||0} · {row.active?'Active':'Hidden'} {row.featuredInNav?'· Featured in navigation':''}</p></div>
      </div>
      <div className="flex gap-2"><button onClick={()=>edit(row)} className="rounded-xl border px-3 py-2 text-sm font-bold"><Edit3 size={15}/></button><button onClick={()=>remove(row)} className="rounded-xl border border-rose-200 px-3 py-2 text-rose-600"><Trash2 size={15}/></button></div>
    </div>
  </div>;

  return <AdminShell>
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><Link href="/admin/catalog" className="inline-flex items-center gap-2 text-sm font-black text-blue-600"><ArrowLeft size={15}/>Catalog</Link><p className="mt-4 text-xs font-black uppercase tracking-[.18em] text-blue-600">Navigation structure</p><h1 className="mt-2 text-4xl font-black">Categories & subcategories</h1><p className="mt-2 text-slate-500">Build the storefront category tree, Bangla labels and navigation order from admin.</p></div>
    </div>

    {message&&<div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm font-semibold text-blue-800">{message}</div>}

    <div className="mt-6 grid gap-6 xl:grid-cols-[.8fr_1.2fr]">
      <form onSubmit={save} className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between"><div><h2 className="text-xl font-black">{editing?'Edit category':'New category'}</h2><p className="mt-1 text-sm text-slate-500">One level of subcategories is ideal for the storefront mega menu.</p></div>{editing&&<button type="button" onClick={cancel}><X size={18}/></button>}</div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <input required className="rounded-xl border p-3" placeholder="English name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
          <input className="rounded-xl border p-3" placeholder="বাংলা নাম" value={form.nameBn} onChange={e=>setForm({...form,nameBn:e.target.value})}/>
          <input required={!editing} disabled={!!editing} maxLength={2} className="rounded-xl border p-3 disabled:bg-slate-100" placeholder="Barcode prefix (2 digits)" value={form.barcodePrefix} onChange={e=>setForm({...form,barcodePrefix:e.target.value.replace(/\D/g,'').slice(0,2)})}/>
          <select className="rounded-xl border p-3" value={form.parentId} onChange={e=>setForm({...form,parentId:e.target.value})}><option value="">Top-level category</option>{roots.filter(x=>x.id!==editing?.id).map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select>
          <input type="number" min="0" className="rounded-xl border p-3" placeholder="Sort order" value={form.sortOrder} onChange={e=>setForm({...form,sortOrder:Number(e.target.value)})}/>
          <input className="rounded-xl border p-3" placeholder="Image URL" value={form.imageUrl} onChange={e=>setForm({...form,imageUrl:e.target.value})}/>
        </div>
        <textarea className="mt-3 min-h-20 w-full rounded-xl border p-3" placeholder="English description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
        <textarea className="mt-3 min-h-20 w-full rounded-xl border p-3" placeholder="বাংলা বিবরণ" value={form.descriptionBn} onChange={e=>setForm({...form,descriptionBn:e.target.value})}/>
        <div className="mt-4 flex flex-wrap gap-4 text-sm font-bold"><label className="flex items-center gap-2"><input type="checkbox" checked={form.active} onChange={e=>setForm({...form,active:e.target.checked})}/>Active</label><label className="flex items-center gap-2"><input type="checkbox" checked={form.featuredInNav} onChange={e=>setForm({...form,featuredInNav:e.target.checked})}/>Feature in navigation</label></div>
        <button className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1464f4] py-3.5 font-black text-white">{editing?<Save size={17}/>:<Plus size={17}/>} {editing?'Save changes':'Create category'}</button>
      </form>

      <section>
        <div className="mb-4 flex items-center justify-between"><div><h2 className="text-xl font-black">Store category tree</h2><p className="text-sm text-slate-500">{items.length} categories configured</p></div></div>
        <div className="space-y-4">{roots.map(root=><div key={root.id} className="space-y-2"><Card row={root}/>{children(root.id).map(child=><Card key={child.id} row={child} child/>)}</div>)}{!items.length&&<div className="rounded-3xl border border-dashed bg-white p-10 text-center text-slate-500">No categories yet.</div>}</div>
      </section>
    </div>
  </AdminShell>
}
