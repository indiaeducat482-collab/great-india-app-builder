import { supabase } from './supabase.js';
const msg=document.getElementById('msg');
const form=document.getElementById('loginForm');
if(form) form.addEventListener('submit',async e=>{e.preventDefault();const {error}=await supabase.auth.signInWithPassword({email:email.value,password:password.value});if(error){msg.className='msg error';msg.textContent=error.message}else location.href='dashboard.html'});
const rf=document.getElementById('registerForm');
if(rf) rf.addEventListener('submit',async e=>{e.preventDefault();const {error}=await supabase.auth.signUp({email:document.getElementById('email').value,password:document.getElementById('password').value,options:{data:{full_name:document.getElementById('name').value}}});if(error){msg.className='msg error';msg.textContent=error.message}else{msg.className='msg success';msg.textContent='Account created. Check your email if confirmation is enabled.'}});
