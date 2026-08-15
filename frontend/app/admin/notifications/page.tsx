'use client';
import { FormEvent,useEffect,useState } from 'react';
import { useRouter } from 'next/navigation';
import { BellRing,Send } from 'lucide-react';
import AdminShell from '@/components/admin-shell';
import { api } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';
const allowed=new Set(['SUPER_ADMIN','ADMIN','CUSTOMER_SUPPORT','MARKETING_MANAGER']);
export default function AdminNotifications(){
 const r=useRouter();const [items,setItems]=useState<any[]>([]);const [msg,setMsg]=useState('');const [f,setF]=useState({type:'SYSTEM',title:'',message:''});
 async function load(){setItems((await api.get('/admin/notifications')).data||[])}
 useEffect(()=>{const u=getStoredUser();if(!u||!allowed.has(u.role)){r.replace('/login');return}load()},[r]);
 async function send(e:FormEvent){e.preventDefault();try{const x=await api.post('/admin/notifications/broadcast',f);setMsg(`Broadcast created for ${x.data.created} customers.`);setF({...f,title:'',message:''});await load()}catch(e:any){setMsg(e?.response?.data?.message||'Broadcast failed.')}}
 return <AdminShell><p className="text-xs font-black uppercase tracking-[.18em] text-slate-400">Customer communication</p><h1 className="mt-2 text-4xl font-black">Notification Center</h1><p className="mt-2 text-sm text-slate-500">Send in-app announcements and review recent notification activity.</p>
 {msg&&<p className="mt-5 rounded-xl border bg-white p-4 text-sm font-semibold">{msg}</p>}
 <form onSubmit={send} className="mt-6 rounded-[1.6rem] border bg-white p-6"><div className="grid gap-3 md:grid-cols-[180px_1fr]"><select className="rounded-xl border p-3" value={f.type} onChange={e=>setF({...f,type:e.target.value})}>{['SYSTEM','ORDER','PAYMENT','DELIVERY','RETURN'].map(x=><option key={x}>{x}</option>)}</select><input className="rounded-xl border p-3" required placeholder="Notification title" value={f.title} onChange={e=>setF({...f,title:e.target.value})}/></div><textarea className="mt-3 min-h-28 w-full rounded-xl border p-3" required placeholder="Message" value={f.message} onChange={e=>setF({...f,message:e.target.value})}/><button className="mt-4 flex items-center gap-2 rounded-xl bg-[#1464f4] px-5 py-3 text-sm font-black text-white"><Send size={15}/>Broadcast to customers</button></form>
 <section className="mt-6 rounded-[1.6rem] border bg-white p-6"><div className="flex items-center gap-2"><BellRing size={18}/><h2 className="text-xl font-black">Recent notifications</h2></div><div className="mt-4 space-y-2">{items.slice(0,100).map(x=><div key={x.id} className="rounded-xl bg-slate-50 p-4"><div className="flex justify-between gap-4"><b className="text-sm">{x.title}</b><span className="text-[10px] font-black text-slate-400">{x.type}</span></div><p className="mt-1 text-sm text-slate-500">{x.message}</p><p className="mt-2 text-[10px] text-slate-400">{x.isRead?'READ':'UNREAD'} · {new Date(x.createdAt).toLocaleString()}</p></div>)}</div></section>
 </AdminShell>
}
