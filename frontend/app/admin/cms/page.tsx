'use client';

import { useEffect,useMemo,useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, ImagePlus, Plus, Save, Trash2, UploadCloud } from 'lucide-react';
import AdminShell from '@/components/admin-shell';
import { api } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';

const TYPES=['HERO','TRUST_STRIP','CATEGORIES','FEATURED_PRODUCTS','PRODUCT_COLLECTION','PROMOTIONS','BANNER'];
const pretty=(v:string)=>String(v||'').replaceAll('_',' ').toLowerCase().replace(/\b\w/g,x=>x.toUpperCase());

export default function CmsAdminPage(){
  const router=useRouter();
  const [tab,setTab]=useState<'homepage'|'content'|'pages'|'settings'>('homepage');
  const [settings,setSettings]=useState<any[]>([]);
  const [sections,setSections]=useState<any[]>([]);
  const [blocks,setBlocks]=useState<any[]>([]);
  const [pages,setPages]=useState<any[]>([]);
  const [products,setProducts]=useState<any[]>([]);
  const [message,setMessage]=useState('');
  const [uploading,setUploading]=useState('');
  const [slideUploading,setSlideUploading]=useState('');

  async function load(){
    const [s,h,b,p,prod]=await Promise.all([
      api.get('/cms/admin/settings'),api.get('/cms/admin/sections'),api.get('/cms/admin/blocks'),api.get('/cms/admin/pages'),api.get('/catalog/products')
    ]);
    setSettings(s.data||[]);setSections(h.data||[]);setBlocks(b.data||[]);setPages(p.data||[]);setProducts(prod.data||[]);
  }
  useEffect(()=>{const u=getStoredUser();if(!u||!['SUPER_ADMIN','ADMIN','MARKETING_MANAGER'].includes(String(u.role).toUpperCase())){router.replace('/admin?denied=1');return}load()},[router]);

  function patchLocal(id:string,key:string,value:any){setSections(rows=>rows.map(r=>r.id===id?{...r,[key]:value}:r))}
  function patchCfg(id:string,key:string,value:any){setSections(rows=>rows.map(r=>r.id===id?{...r,config:{...(r.config||{}),[key]:value}}:r))}

  function slidesOf(row:any){return Array.isArray(row.config?.slides)?row.config.slides:[]}
  function setSlides(id:string,slides:any[]){patchCfg(id,'slides',slides)}
  function addHeroSlide(row:any){
    setSlides(row.id,[...slidesOf(row),{
      id:`slide-${Date.now()}`,
      enabled:true,
      imageUrl:'',
      eyebrow:'',
      eyebrowBn:'',
      title:'',
      titleBn:'',
      subtitle:'',
      subtitleBn:'',
      ctaLabel:'Shop now',
      ctaLabelBn:'এখনই শপ করুন',
      ctaUrl:'/shop'
    }])
  }
  function patchHeroSlide(row:any,index:number,key:string,value:any){
    const slides=[...slidesOf(row)];
    slides[index]={...(slides[index]||{}),[key]:value};
    setSlides(row.id,slides);
  }
  function removeHeroSlide(row:any,index:number){
    setSlides(row.id,slidesOf(row).filter((_:any,i:number)=>i!==index));
  }
  async function uploadHeroSlide(row:any,index:number,file:File){
    const token=`${row.id}-${index}`;
    setSlideUploading(token);setMessage('');
    try{
      const form=new FormData();form.append('file',file);
      const r=await api.post('/catalog/media/upload',form);
      patchHeroSlide(row,index,'imageUrl',r.data.url);
      setMessage('Slide image uploaded. Click Save section to publish it.');
    }catch(e:any){
      setMessage(e?.response?.data?.message||'Slide upload failed.');
    }finally{
      setSlideUploading('');
    }
  }

  async function saveSection(row:any){
    try{await api.patch(`/cms/admin/sections/${row.id}`,{type:row.type,title:row.title||undefined,subtitle:row.subtitle||undefined,enabled:row.enabled,sortOrder:Number(row.sortOrder||0),config:row.config||{},scheduleFrom:row.scheduleFrom||undefined,scheduleTo:row.scheduleTo||undefined});setMessage('Homepage section saved.');await load()}
    catch(e:any){setMessage(e?.response?.data?.message||'Section save failed.')}
  }
  async function addSection(){
    const r=await api.post('/cms/admin/sections',{type:'BANNER',title:'New campaign banner',subtitle:'Edit this section',enabled:true,sortOrder:(sections.at(-1)?.sortOrder||0)+10,config:{titleBn:'',subtitleBn:'',primaryCtaLabel:'Shop now',primaryCtaLabelBn:'এখনই শপ করুন',primaryCtaUrl:'/shop'}});
    setSections(rows=>[...rows,r.data]);setMessage('New section added.');
  }
  async function removeSection(id:string){if(!confirm('Delete this homepage section?'))return;await api.delete(`/cms/admin/sections/${id}`);await load()}

  async function upload(sectionId:string,file:File){
    setUploading(sectionId);setMessage('');
    try{const form=new FormData();form.append('file',file);const r=await api.post('/catalog/media/upload',form);patchCfg(sectionId,'imageUrl',r.data.url);patchCfg(sectionId,'backgroundImage',r.data.url);setMessage('Campaign media uploaded. Click Save on the section.')}
    catch(e:any){setMessage(e?.response?.data?.message||'Upload failed.')}finally{setUploading('')}
  }

  const productOptions=useMemo(()=>products.filter(p=>p.status==='ACTIVE'),[products]);

  async function saveSetting(row:any){await api.patch(`/cms/admin/settings/${encodeURIComponent(row.key)}`,{value:row.value,groupName:row.groupName,description:row.description||undefined});setMessage(`${row.key} saved.`)}
  async function saveBlock(row:any){await api.patch(`/cms/admin/blocks/${row.id}`,{kind:row.kind,title:row.title,subtitle:row.subtitle||undefined,body:row.body||undefined,imageUrl:row.imageUrl||undefined,linkLabel:row.linkLabel||undefined,linkUrl:row.linkUrl||undefined,active:row.active,sortOrder:Number(row.sortOrder||0),metadata:row.metadata||{}});setMessage('Content saved.')}
  async function addBlock(kind:string){await api.post('/cms/admin/blocks',{kind,title:`New ${pretty(kind)}`,body:'Edit this content.',active:true,sortOrder:10,metadata:{}});await load()}
  async function savePage(row:any){await api.patch(`/cms/admin/pages/${row.id}`,{slug:row.slug,title:row.title,body:row.body,status:row.status,metaTitle:row.metaTitle||undefined,metaDescription:row.metaDescription||undefined,sortOrder:Number(row.sortOrder||0)});setMessage('Page saved.')}
  async function addPage(){await api.post('/cms/admin/pages',{slug:`new-page-${Date.now()}`,title:'New page',body:'Edit this page content.',status:'DRAFT'});await load()}

  return <AdminShell>
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.18em] text-blue-600">Dynamic storefront</p><h1 className="mt-2 text-4xl font-black">Homepage & Content Studio</h1><p className="mt-2 max-w-3xl text-slate-500">Build campaigns, hero banners, product collections, FAQs and policy pages without editing source code.</p></div><a href="/" target="_blank" className="inline-flex items-center gap-2 rounded-xl bg-[#1464f4] px-5 py-3 font-black text-white"><Eye size={16}/>Preview store</a></div>
    {message&&<p className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm font-semibold text-blue-800">{message}</p>}
    <div className="mt-6 flex flex-wrap gap-2">{([['homepage','Homepage Builder'],['content','FAQ / Testimonials'],['pages','CMS Pages'],['settings','Store Settings']] as const).map(([v,l])=><button key={v} onClick={()=>setTab(v)} className={`rounded-xl px-4 py-3 text-sm font-black ${tab===v?'bg-[#1464f4] text-white':'border bg-white'}`}>{l}</button>)}</div>

    {tab==='homepage'&&<section className="mt-6">
      <div className="flex items-center justify-between"><div><h2 className="text-2xl font-black">Homepage sections</h2><p className="text-sm text-slate-500">Order, enable and configure each storefront section.</p></div><button onClick={addSection} className="inline-flex items-center gap-2 rounded-xl bg-[#f36b21] px-4 py-3 text-sm font-black text-white"><Plus size={16}/>Add section</button></div>
      <div className="mt-5 space-y-5">{sections.map((row:any)=><article key={row.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-3"><select value={row.type} onChange={e=>patchLocal(row.id,'type',e.target.value)} className="rounded-xl border px-3 py-2 text-sm font-black">{TYPES.map(t=><option key={t}>{t}</option>)}</select><label className="ml-auto flex items-center gap-2 text-xs font-black"><input type="checkbox" checked={row.enabled} onChange={e=>patchLocal(row.id,'enabled',e.target.checked)}/>Visible</label><input type="number" min="0" value={row.sortOrder} onChange={e=>patchLocal(row.id,'sortOrder',Number(e.target.value))} className="w-20 rounded-xl border p-2 text-sm" title="Display order"/></div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <div className="space-y-3"><p className="text-xs font-black uppercase tracking-wider text-slate-400">English</p><input value={row.title||''} onChange={e=>patchLocal(row.id,'title',e.target.value)} placeholder="Section title" className="w-full rounded-xl border p-3"/><input value={row.subtitle||''} onChange={e=>patchLocal(row.id,'subtitle',e.target.value)} placeholder="Subtitle" className="w-full rounded-xl border p-3"/></div>
          <div className="space-y-3"><p className="text-xs font-black uppercase tracking-wider text-slate-400">বাংলা</p><input value={row.config?.titleBn||''} onChange={e=>patchCfg(row.id,'titleBn',e.target.value)} placeholder="সেকশনের শিরোনাম" className="w-full rounded-xl border p-3"/><input value={row.config?.subtitleBn||''} onChange={e=>patchCfg(row.id,'subtitleBn',e.target.value)} placeholder="সাবটাইটেল" className="w-full rounded-xl border p-3"/></div>
        </div>

        {row.type==='HERO'&&<div className="mt-4 rounded-2xl bg-slate-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black">Hero slider</p>
              <p className="mt-1 text-xs text-slate-500">Add manual slides. If you leave this list empty, the storefront automatically rotates the newest active product images.</p>
            </div>
            <button onClick={()=>addHeroSlide(row)} className="inline-flex items-center gap-2 rounded-xl bg-[#f36b21] px-4 py-2.5 text-xs font-black text-white">
              <Plus size={14}/>Add slide
            </button>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <label className="text-xs font-black">
              Rotation seconds
              <input
                type="number"
                min="4"
                max="12"
                step="0.5"
                value={row.config?.rotationSeconds||5.5}
                onChange={e=>patchCfg(row.id,'rotationSeconds',Number(e.target.value))}
                className="mt-2 w-full rounded-xl border bg-white p-3 font-normal"
              />
            </label>
            <label className="text-xs font-black">
              Default CTA
              <input value={row.config?.primaryCtaLabel||'Shop now'} onChange={e=>patchCfg(row.id,'primaryCtaLabel',e.target.value)} className="mt-2 w-full rounded-xl border bg-white p-3 font-normal"/>
            </label>
            <label className="text-xs font-black">
              Default CTA URL
              <input value={row.config?.primaryCtaUrl||'/shop'} onChange={e=>patchCfg(row.id,'primaryCtaUrl',e.target.value)} className="mt-2 w-full rounded-xl border bg-white p-3 font-normal"/>
            </label>
          </div>

          {slidesOf(row).length===0&&
            <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4 text-xs font-semibold text-blue-800">
              Automatic mode is active: newest ACTIVE products with images will be used as hero slides.
            </div>
          }

          <div className="mt-4 space-y-4">
            {slidesOf(row).map((slide:any,index:number)=>
              <div key={slide.id||index} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="font-black">Slide {index+1}</p>
                  <label className="ml-auto flex items-center gap-2 text-xs font-black">
                    <input type="checkbox" checked={slide.enabled!==false} onChange={e=>patchHeroSlide(row,index,'enabled',e.target.checked)}/>
                    Active
                  </label>
                  <button onClick={()=>removeHeroSlide(row,index)} className="grid h-9 w-9 place-items-center rounded-lg border border-rose-200 text-rose-600">
                    <Trash2 size={14}/>
                  </button>
                </div>

                <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_auto]">
                  <input
                    value={slide.imageUrl||''}
                    onChange={e=>patchHeroSlide(row,index,'imageUrl',e.target.value)}
                    placeholder="Slide image URL"
                    className="rounded-xl border p-3"
                  />
                  <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border bg-slate-50 px-4 py-3 text-xs font-black">
                    <UploadCloud size={15}/>
                    {slideUploading===`${row.id}-${index}`?'Uploading...':'Upload image'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={slideUploading===`${row.id}-${index}`}
                      onChange={e=>{const f=e.target.files?.[0];if(f)uploadHeroSlide(row,index,f);e.currentTarget.value=''}}
                    />
                  </label>
                </div>

                {slide.imageUrl&&<img src={slide.imageUrl} alt="" className="mt-3 h-36 w-full rounded-xl object-cover"/>}

                <div className="mt-3 grid gap-3 lg:grid-cols-2">
                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">English slide content</p>
                    <input value={slide.eyebrow||''} onChange={e=>patchHeroSlide(row,index,'eyebrow',e.target.value)} placeholder="Campaign label" className="w-full rounded-xl border p-3"/>
                    <input value={slide.title||''} onChange={e=>patchHeroSlide(row,index,'title',e.target.value)} placeholder="Slide title" className="w-full rounded-xl border p-3"/>
                    <textarea value={slide.subtitle||''} onChange={e=>patchHeroSlide(row,index,'subtitle',e.target.value)} placeholder="Slide subtitle" className="min-h-20 w-full rounded-xl border p-3"/>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">বাংলা slide content</p>
                    <input value={slide.eyebrowBn||''} onChange={e=>patchHeroSlide(row,index,'eyebrowBn',e.target.value)} placeholder="ক্যাম্পেইন লেবেল" className="w-full rounded-xl border p-3"/>
                    <input value={slide.titleBn||''} onChange={e=>patchHeroSlide(row,index,'titleBn',e.target.value)} placeholder="স্লাইড শিরোনাম" className="w-full rounded-xl border p-3"/>
                    <textarea value={slide.subtitleBn||''} onChange={e=>patchHeroSlide(row,index,'subtitleBn',e.target.value)} placeholder="স্লাইড সাবটাইটেল" className="min-h-20 w-full rounded-xl border p-3"/>
                  </div>
                </div>

                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  <input value={slide.ctaLabel||''} onChange={e=>patchHeroSlide(row,index,'ctaLabel',e.target.value)} placeholder="Button label" className="rounded-xl border p-3"/>
                  <input value={slide.ctaLabelBn||''} onChange={e=>patchHeroSlide(row,index,'ctaLabelBn',e.target.value)} placeholder="Button বাংলা" className="rounded-xl border p-3"/>
                  <input value={slide.ctaUrl||'/shop'} onChange={e=>patchHeroSlide(row,index,'ctaUrl',e.target.value)} placeholder="/shop/..." className="rounded-xl border p-3"/>
                </div>
              </div>
            )}
          </div>
        </div>}

        {row.type==='BANNER'&&<div className="mt-4 rounded-2xl bg-slate-50 p-4">
          <div className="grid gap-3 lg:grid-cols-3">
            <input value={row.config?.eyebrow||''} onChange={e=>patchCfg(row.id,'eyebrow',e.target.value)} placeholder="Campaign label" className="rounded-xl border bg-white p-3"/>
            <input value={row.config?.eyebrowBn||''} onChange={e=>patchCfg(row.id,'eyebrowBn',e.target.value)} placeholder="ক্যাম্পেইন লেবেল" className="rounded-xl border bg-white p-3"/>
            <input value={row.config?.backgroundImage||row.config?.imageUrl||''} onChange={e=>{patchCfg(row.id,'backgroundImage',e.target.value);patchCfg(row.id,'imageUrl',e.target.value)}} placeholder="Banner image URL" className="rounded-xl border bg-white p-3"/>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black shadow-sm">
              <UploadCloud size={16}/>{uploading===row.id?'Uploading...':'Upload image'}
              <input type="file" accept="image/*" className="hidden" disabled={uploading===row.id} onChange={e=>{const f=e.target.files?.[0];if(f)upload(row.id,f);e.currentTarget.value=''}}/>
            </label>
            {row.config?.backgroundImage&&<img src={row.config.backgroundImage} alt="" className="h-12 w-20 rounded-lg object-cover"/>}
          </div>
        </div>}

        {['CATEGORIES','FEATURED_PRODUCTS','PRODUCT_COLLECTION','PROMOTIONS'].includes(row.type)&&<div className="mt-4 rounded-2xl bg-slate-50 p-4">
          <div className="grid gap-3 md:grid-cols-3"><label className="text-xs font-black">Item limit<input type="number" min="1" max="20" value={row.config?.limit||8} onChange={e=>patchCfg(row.id,'limit',Number(e.target.value))} className="mt-2 w-full rounded-xl border bg-white p-3 font-normal"/></label><label className="text-xs font-black">CTA label<input value={row.config?.ctaLabel||''} onChange={e=>patchCfg(row.id,'ctaLabel',e.target.value)} className="mt-2 w-full rounded-xl border bg-white p-3 font-normal"/></label><label className="text-xs font-black">CTA URL<input value={row.config?.ctaUrl||'/shop'} onChange={e=>patchCfg(row.id,'ctaUrl',e.target.value)} className="mt-2 w-full rounded-xl border bg-white p-3 font-normal"/></label></div>
          {['FEATURED_PRODUCTS','PRODUCT_COLLECTION'].includes(row.type)&&<>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="text-xs font-black">
                Automatic product source
                <select value={row.config?.source||(row.type==='FEATURED_PRODUCTS'?'FEATURED':'NEWEST')} onChange={e=>patchCfg(row.id,'source',e.target.value)} className="mt-2 w-full rounded-xl border bg-white p-3 font-normal">
                  <option value="FEATURED">Featured</option>
                  <option value="NEWEST">Newest products</option>
                  <option value="OFFERS">Products on offer</option>
                </select>
              </label>
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs text-blue-800">
                Manual product selection below overrides the automatic source.
              </div>
            </div>
            <div className="mt-4"><p className="text-xs font-black">Manually pin products (optional)</p><div className="mt-2 grid max-h-52 gap-2 overflow-auto rounded-xl border bg-white p-3 sm:grid-cols-2 lg:grid-cols-3">{productOptions.map(p=>{const checked=(row.config?.productIds||[]).includes(p.id);return <label key={p.id} className="flex items-center gap-2 text-xs font-semibold"><input type="checkbox" checked={checked} onChange={e=>{const ids=row.config?.productIds||[];patchCfg(row.id,'productIds',e.target.checked?[...ids,p.id]:ids.filter((x:string)=>x!==p.id))}}/>{p.name}</label>})}</div></div></>}
        </div>}

        {row.type==='TRUST_STRIP'&&<div className="mt-4 rounded-2xl bg-slate-50 p-4"><p className="text-sm font-black">Trust strip</p><p className="mt-1 text-xs text-slate-500">Default delivery, security, return and live-stock cards will render automatically. Advanced item editing can stay in config later.</p></div>}

        <div className="mt-4 flex gap-2"><button onClick={()=>saveSection(row)} className="inline-flex items-center gap-2 rounded-xl bg-[#1464f4] px-4 py-2.5 text-xs font-black text-white"><Save size={14}/>Save section</button><button onClick={()=>removeSection(row.id)} className="rounded-xl border border-rose-200 px-4 py-2.5 text-xs font-black text-rose-600"><Trash2 size={14}/></button></div>
      </article>)}</div>
    </section>}

    {tab==='content'&&<section className="mt-6 space-y-8">{['FAQ','TESTIMONIAL','BANNER'].map(kind=><div key={kind}><div className="flex items-center justify-between"><div><h2 className="text-2xl font-black">{pretty(kind)}</h2><p className="text-sm text-slate-500">Reusable storefront content.</p></div><button onClick={()=>addBlock(kind)} className="rounded-xl border bg-white px-4 py-3 text-sm font-black">+ Add</button></div><div className="mt-4 grid gap-4 xl:grid-cols-2">{blocks.filter(x=>x.kind===kind).map((row:any)=><article key={row.id} className="rounded-2xl border bg-white p-5"><input value={row.title} onChange={e=>setBlocks(b=>b.map(x=>x.id===row.id?{...x,title:e.target.value}:x))} className="w-full rounded-xl border p-3 font-bold"/><textarea value={row.body||''} onChange={e=>setBlocks(b=>b.map(x=>x.id===row.id?{...x,body:e.target.value}:x))} className="mt-3 min-h-24 w-full rounded-xl border p-3"/><button onClick={()=>saveBlock(row)} className="mt-3 rounded-xl bg-[#1464f4] px-4 py-2 text-xs font-black text-white">Save</button></article>)}</div></div>)}</section>}

    {tab==='pages'&&<section className="mt-6"><div className="flex justify-between"><div><h2 className="text-2xl font-black">Policy & information pages</h2><p className="text-sm text-slate-500">About, privacy, terms, shipping and returns.</p></div><button onClick={addPage} className="rounded-xl bg-[#1464f4] px-4 py-3 text-sm font-black text-white">+ Add page</button></div><div className="mt-5 space-y-4">{pages.map((row:any)=><article key={row.id} className="rounded-2xl border bg-white p-5"><div className="grid gap-3 md:grid-cols-3"><input value={row.title} onChange={e=>setPages(p=>p.map(x=>x.id===row.id?{...x,title:e.target.value}:x))} className="rounded-xl border p-3"/><input value={row.slug} onChange={e=>setPages(p=>p.map(x=>x.id===row.id?{...x,slug:e.target.value}:x))} className="rounded-xl border p-3"/><select value={row.status} onChange={e=>setPages(p=>p.map(x=>x.id===row.id?{...x,status:e.target.value}:x))} className="rounded-xl border p-3"><option>DRAFT</option><option>PUBLISHED</option><option>ARCHIVED</option></select></div><textarea value={row.body||''} onChange={e=>setPages(p=>p.map(x=>x.id===row.id?{...x,body:e.target.value}:x))} className="mt-3 min-h-36 w-full rounded-xl border p-3"/><button onClick={()=>savePage(row)} className="mt-3 rounded-xl bg-[#1464f4] px-4 py-2 text-xs font-black text-white">Save</button></article>)}</div></section>}

    {tab==='settings'&&<section className="mt-6"><h2 className="text-2xl font-black">Store settings</h2><div className="mt-5 grid gap-4 xl:grid-cols-2">{settings.map((row:any)=><article key={row.id} className="rounded-2xl border bg-white p-5"><p className="font-black">{row.key}</p><p className="text-xs text-slate-400">{row.description}</p><textarea value={JSON.stringify(row.value||{},null,2)} onChange={e=>{try{const value=JSON.parse(e.target.value);setSettings(s=>s.map(x=>x.id===row.id?{...x,value}:x))}catch{}}} className="mt-3 min-h-40 w-full rounded-xl border bg-slate-50 p-3 font-mono text-xs"/><button onClick={()=>saveSetting(row)} className="mt-3 rounded-xl bg-[#1464f4] px-4 py-2 text-xs font-black text-white">Save setting</button></article>)}</div></section>}
  </AdminShell>
}
