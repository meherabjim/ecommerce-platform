'use client';

import { useEffect,useMemo,useState } from 'react';
import { useRouter } from 'next/navigation';
import { Printer, ScanBarcode, Search } from 'lucide-react';
import AdminShell from '@/components/admin-shell';
import { api, API_BASE_URL } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';

export default function BarcodesPage(){
  const router=useRouter();
  const [variants,setVariants]=useState<any[]>([]);
  const [products,setProducts]=useState<any[]>([]);
  const [selected,setSelected]=useState<string[]>([]);
  const [scan,setScan]=useState('');
  const [found,setFound]=useState<any>(null);
  const [preview,setPreview]=useState<any>(null);
  const [previewProduct,setPreviewProduct]=useState('');
  const [previewCode,setPreviewCode]=useState('1');
  const [message,setMessage]=useState('');

  async function load(){
    const [v,p]=await Promise.all([api.get('/catalog/variants'),api.get('/catalog/products')]);
    setVariants(v.data||[]);setProducts(p.data||[]);
  }
  useEffect(()=>{const u=getStoredUser();if(!u||!['SUPER_ADMIN','ADMIN','CATALOG_MANAGER','INVENTORY_MANAGER'].includes(String(u.role).toUpperCase())){router.replace('/admin?denied=1');return}load()},[router]);

  async function search(){
    try{const r=await api.get(`/catalog/barcodes/search/${scan}`);setFound(r.data);setMessage('')}
    catch(e:any){setFound(null);setMessage(e?.response?.data?.message||'Barcode not found.')}
  }
  async function getPreview(){
    try{const r=await api.get('/catalog/barcodes/preview',{params:{productId:previewProduct,variantCode:previewCode}});setPreview(r.data)}
    catch(e:any){setMessage(e?.response?.data?.message||'Preview failed.')}
  }
  async function printLabels(){
    if(!selected.length){setMessage('Select at least one variant.');return}
    const r=await api.post('/catalog/barcodes/labels',{variantIds:selected});
    const labels=r.data||[];
    const win=window.open('','_blank');
    if(!win)return;
    const html=labels.map((x:any)=>`<div class="label"><div class="name">${x.productName}</div><div class="meta">${x.sku} · ${Object.values(x.attributes||{}).join(' / ')}</div><img src="${API_BASE_URL}/catalog/public/barcodes/${x.barcode}/svg"/><div class="price">BDT ${x.price}</div></div>`).join('');
    win.document.write(`<html><head><title>Barcode Labels</title><style>body{font-family:Arial;padding:12px;display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.label{border:1px solid #aaa;border-radius:8px;padding:10px;text-align:center;break-inside:avoid}.name{font-weight:700;font-size:13px}.meta{font-size:10px;color:#555;margin:4px}.label img{width:100%;height:70px}.price{font-weight:700;font-size:12px}@media print{body{padding:0}.label{page-break-inside:avoid}}</style></head><body>${html}<script>window.onload=()=>window.print()</script></body></html>`);
    win.document.close();
  }

  const productName=(id:string)=>products.find(p=>p.id===id)?.name||'Product';

  return <AdminShell>
    <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end"><div><p className="text-xs font-black uppercase tracking-[.18em] text-slate-400">SRS barcode operations</p><h1 className="mt-2 text-4xl font-black tracking-tight">Barcodes & labels</h1><p className="mt-2 text-sm text-slate-500">Preview the next 12-digit code, scan/search variants and print bulk labels.</p></div><button onClick={printLabels} className="flex items-center gap-2 rounded-xl bg-[#1464f4] px-5 py-3 text-sm font-black text-white"><Printer size={16}/>Print selected ({selected.length})</button></div>
    {message&&<p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm">{message}</p>}

    <section className="mt-6 grid gap-5 xl:grid-cols-2">
      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6"><div className="flex items-center gap-3"><ScanBarcode size={19}/><h2 className="text-xl font-black">Scan / search</h2></div><div className="mt-4 flex gap-2"><input value={scan} onChange={e=>setScan(e.target.value.replace(/\D/g,'').slice(0,12))} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();search()}}} autoFocus placeholder="Scan or enter 12 digits" className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono"/><button onClick={search} className="grid w-12 place-items-center rounded-xl bg-[#1464f4] text-white"><Search size={17}/></button></div>{found&&<div className="mt-4 rounded-xl bg-slate-50 p-4"><p className="font-black">{found.product?.name}</p><p className="mt-1 text-sm">{found.sku}</p><p className="mt-2 font-mono text-lg font-black">{found.barcode}</p><p className="mt-2 text-xs text-slate-500">Available: {found.inventory?.available??0}</p><img src={`${API_BASE_URL}/catalog/public/barcodes/${found.barcode}/svg`} className="mt-3 max-w-xs" alt={found.barcode}/></div>}</div>
      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6"><h2 className="text-xl font-black">Next-code preview</h2><p className="mt-1 text-sm text-slate-500">Preview does not consume the serial.</p><select value={previewProduct} onChange={e=>setPreviewProduct(e.target.value)} className="mt-4 w-full rounded-xl border border-slate-200 p-3"><option value="">Choose product</option>{products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select><input value={previewCode} onChange={e=>setPreviewCode(e.target.value)} placeholder="Variant code" className="mt-3 w-full rounded-xl border border-slate-200 p-3"/><button onClick={getPreview} className="mt-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-black">Preview barcode</button>{preview&&<div className="mt-4 rounded-xl bg-[#1464f4] p-5 text-white"><p className="text-xs text-white/40">Next barcode</p><p className="mt-2 font-mono text-2xl font-black">{preview.barcode}</p><img src={`${API_BASE_URL}/catalog/public/barcodes/${preview.barcode}/svg`} className="mt-4 rounded bg-white p-2" alt={preview.barcode}/><p className="mt-3 text-xs text-white/45">Prefix {preview.categoryPrefix} · variant {preview.variantCode} · serial {preview.nextSerial}</p></div>}</div>
    </section>

    <section className="mt-6 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white"><div className="border-b border-slate-100 p-5"><h2 className="text-xl font-black">Variant label queue</h2><p className="text-sm text-slate-500">Select up to 200 labels for browser printing.</p></div><div className="overflow-x-auto"><table className="w-full min-w-[800px] text-left text-sm"><thead className="bg-slate-50"><tr><th className="px-5 py-4">Select</th><th>Product</th><th>SKU</th><th>Barcode</th><th>Stock</th></tr></thead><tbody className="divide-y">{variants.map(v=><tr key={v.id}><td className="px-5 py-4"><input type="checkbox" checked={selected.includes(v.id)} onChange={e=>setSelected(s=>e.target.checked?[...s,v.id]:s.filter(id=>id!==v.id))}/></td><td className="font-black">{productName(v.productId)}</td><td>{v.sku}</td><td className="font-mono">{v.barcode}</td><td>{v.inventory?.available??0}</td></tr>)}</tbody></table></div></section>
  </AdminShell>
}
