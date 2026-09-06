import { supabase } from './supabase.js';
const {data:{session}}=await supabase.auth.getSession(); if(!session) location.href='login.html';
const {data,error}=await supabase.from('app_builds').select('*').eq('user_id',session.user.id).order('created_at',{ascending:false});
const el=document.getElementById('builds');
if(error) el.innerHTML='<div class="card">Unable to load builds.</div>';
else if(!data.length) el.innerHTML='<div class="card"><h3>No builds yet</h3><p>Your build history will appear here.</p></div>';
else el.innerHTML=data.map(b=>`<div class="card"><h3>Build #${b.build_number}</h3><p>Platform: ${b.platform}</p><p>Status: <span class="status">${b.status}</span></p>${b.apk_url?`<a class="btn primary" href="${b.apk_url}" target="_blank">Download APK</a>`:''}</div>`).join('');
