import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";
const $ = id => document.getElementById(id);
$("year").textContent = new Date().getFullYear();
const configured = SUPABASE_URL.startsWith("https://") && !SUPABASE_URL.includes("PASTE_") && !SUPABASE_ANON_KEY.includes("PASTE_");
if (!configured) { $("login-msg").textContent = "Setup required: add your Supabase URL and anon key in config.js. Follow SETUP-MR.md."; }
else {
 const db = createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
 let properties = [], currentPhotos = [];
 const esc = s => String(s ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const msg = (id,t,err=false) => { $(id).textContent=t; $(id).className="form-msg "+(err?"error":""); };
 async function checkSession() {
   const {data:{session}} = await db.auth.getSession();
   if(session){ $("login-panel").hidden=true; $("dashboard").hidden=false; await load(); }
   else { $("login-panel").hidden=false; $("dashboard").hidden=true; }
 }
 $("login-form").addEventListener("submit",async e=>{e.preventDefault();msg("login-msg","Signing in…");const {error}=await db.auth.signInWithPassword({email:$("email").value,password:$("password").value});if(error)msg("login-msg",error.message,true);else await checkSession();});
 $("logout").addEventListener("click",async()=>{await db.auth.signOut();await checkSession();});
 function clearForm(){ $("property-form").reset();$("property-id").value="";currentPhotos=[];$("existing-photos").innerHTML="";$("form-title").textContent="Add New Property"; }
 $("reset-form").addEventListener("click",clearForm);
 async function load(){
   const {data,error}=await db.from("properties").select("*").order("created_at",{ascending:false});
   if(error){$("admin-list").innerHTML=`<p class="error">Could not load properties: ${esc(error.message)}</p>`;return;}
   properties=data||[]; $("stats").innerHTML=[["Total",properties.length],["Available",properties.filter(p=>p.status==="available").length],["Sold",properties.filter(p=>p.status==="sold").length]].map(([k,v])=>`<div class="stat"><span>${k}</span><b>${v}</b></div>`).join(""); renderList();
 }
 function renderList(){
   const q=$("admin-search").value.toLowerCase();
   const items=properties.filter(p=>`${p.title} ${p.location} ${p.type}`.toLowerCase().includes(q));
   $("admin-list").innerHTML=items.length?items.map(p=>`<div class="admin-row"><div class="admin-thumb">${p.photos?.[0]?`<img src="${esc(p.photos[0])}" alt="">`:"🏠"}</div><div class="admin-detail"><b>${esc(p.title)}</b><span>${esc(p.type)} · ${esc(p.location)} · ${esc(p.price||"Price on request")}</span></div><span class="status ${p.status}">${p.status}</span><button class="text-btn" data-edit="${p.id}">Edit</button><button class="text-btn danger" data-delete="${p.id}">Delete</button></div>`).join(""):`<p class="muted">No properties added yet.</p>`;
   $("admin-list").querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>edit(b.dataset.edit));
   $("admin-list").querySelectorAll("[data-delete]").forEach(b=>b.onclick=()=>remove(b.dataset.delete));
 }
 $("admin-search").addEventListener("input",renderList);
 function edit(id){const p=properties.find(x=>x.id===id);if(!p)return;$("property-id").value=p.id;$("title").value=p.title;$("type").value=p.type;$("price").value=p.price||"";$("location").value=p.location;$("area").value=p.area||"";$("status").value=p.status;$("description").value=p.description||"";currentPhotos=p.photos||[];$("existing-photos").innerHTML=currentPhotos.map((u,i)=>`<div class="photo-chip"><img src="${esc(u)}"><button type="button" data-remove="${i}">×</button></div>`).join("");$("existing-photos").querySelectorAll("[data-remove]").forEach(b=>b.onclick=()=>{currentPhotos.splice(Number(b.dataset.remove),1);edit(id);});$("form-title").textContent="Edit Property";window.scrollTo({top:0,behavior:"smooth"});}
 async function remove(id){if(!confirm("Delete this property permanently?"))return;const {error}=await db.from("properties").delete().eq("id",id);if(error)alert(error.message);else await load();}
 $("property-form").addEventListener("submit",async e=>{
   e.preventDefault();msg("save-msg","Saving property…");
   const {data:{user}}=await db.auth.getUser(); if(!user){msg("save-msg","Please log in again.",true);return;}
   const id=$("property-id").value || crypto.randomUUID(); const files=[...$("photos").files];
   for(const f of files){const ext=f.name.split(".").pop().replace(/[^a-z0-9]/gi,"");const path=`${user.id}/${id}/${crypto.randomUUID()}.${ext}`;const {error}=await db.storage.from("property-photos").upload(path,f,{upsert:false,contentType:f.type});if(error){msg("save-msg",error.message,true);return;}const {data}=db.storage.from("property-photos").getPublicUrl(path);currentPhotos.push(data.publicUrl);}
   const payload={id,title:$("title").value.trim(),type:$("type").value,price:$("price").value.trim(),location:$("location").value.trim(),area:$("area").value.trim(),status:$("status").value,description:$("description").value.trim(),photos:currentPhotos,updated_at:new Date().toISOString()};
   const {error}=await db.from("properties").upsert(payload);
   if(error){msg("save-msg",error.message,true);return;}msg("save-msg","Saved! Customer website will update automatically.");clearForm();await load();
 });
 checkSession();
}