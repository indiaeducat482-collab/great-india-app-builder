import { supabase } from './supabase.js';
const {data:{session}}=await supabase.auth.getSession(); if(!session) location.href='login.html';
document.getElementById('logout').onclick=async()=>{await supabase.auth.signOut();location.href='index.html'};
const {data,error}=await supabase.from('apps').select('*').order('created_at',{ascending:false});
const el=document.getElementById('apps');
if(error){el.innerHTML='<div class="card">Unable to load apps.</div>'}
else if(!data.length){el.innerHTML='<div class="card"><h3>No apps yet</h3><p>Create your first app to begin.</p></div>'}
else el.innerHTML=data.map(a=>`<div class="card"><h2>${esc(a.app_name)}</h2><p>${esc(a.website_url)}</p><span class="status">${esc(a.status)}</span><p><a class="btn" href="builds.html">View builds</a></p></div>`).join('');
function esc(s=''){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
