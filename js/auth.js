import { auth, db, firebaseConfigured } from "./firebase-config.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, updateProfile, onAuthStateChanged, browserLocalPersistence, browserSessionPersistence, setPersistence } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const $ = s => document.querySelector(s);
const message = $("#message");
function showMessage(text,type="error"){ if(!message)return; message.textContent=text; message.className=`message ${type}`; message.hidden=false; }
function firebaseHint(){ return "Firebase is not configured yet. Open js/firebase-config.js and paste your Firebase Web App configuration."; }
function busy(btn,on,label){ if(!btn)return; btn.disabled=on; btn.textContent=on?"Please wait…":label; }

document.querySelectorAll(".toggle-pass").forEach(btn=>btn.addEventListener("click",()=>{const input=document.getElementById(btn.dataset.target); input.type=input.type==="password"?"text":"password"; btn.textContent=input.type==="password"?"Show":"Hide";}));

if(location.pathname.endsWith("/login.html") || location.pathname.endsWith("/register.html")){
  if(!firebaseConfigured) showMessage(firebaseHint(),"info");
  if(auth) onAuthStateChanged(auth,user=>{ if(user) location.href="./dashboard.html"; });
}

$("#registerForm")?.addEventListener("submit", async e=>{
  e.preventDefault(); if(!firebaseConfigured){showMessage(firebaseHint(),"error");return;}
  const name=$("#fullName").value.trim(), email=$("#email").value.trim(), pass=$("#password").value, confirm=$("#confirmPassword").value, btn=$("#registerBtn");
  if(pass!==confirm){showMessage("Passwords do not match.");return;}
  if(pass.length<6){showMessage("Password must be at least 6 characters.");return;}
  busy(btn,true,"Create Account");
  try{
    const cred=await createUserWithEmailAndPassword(auth,email,pass);
    await updateProfile(cred.user,{displayName:name});
    await setDoc(doc(db,"users",cred.user.uid),{uid:cred.user.uid,fullName:name,email:email,createdAt:serverTimestamp(),updatedAt:serverTimestamp()},{merge:true});
    showMessage("Account created successfully. Opening dashboard…","success");
    setTimeout(()=>location.href="./dashboard.html",500);
  }catch(err){showMessage(readAuthError(err));}finally{busy(btn,false,"Create Account");}
});

$("#loginForm")?.addEventListener("submit", async e=>{
  e.preventDefault(); if(!firebaseConfigured){showMessage(firebaseHint(),"error");return;}
  const email=$("#email").value.trim(), pass=$("#password").value, btn=$("#loginBtn");
  busy(btn,true,"Login");
  try{
    await setPersistence(auth,$("#remember")?.checked?browserLocalPersistence:browserSessionPersistence);
    await signInWithEmailAndPassword(auth,email,pass); location.href="./dashboard.html";
  }catch(err){showMessage(readAuthError(err));}finally{busy(btn,false,"Login");}
});

$("#forgotBtn")?.addEventListener("click",async()=>{
  if(!firebaseConfigured){showMessage(firebaseHint(),"error");return;}
  const email=$("#email")?.value.trim(); if(!email){showMessage("Enter your email address first.");return;}
  try{await sendPasswordResetEmail(auth,email);showMessage("Password reset email sent. Check your inbox.","success");}catch(err){showMessage(readAuthError(err));}
});

function readAuthError(err){
  const code=err?.code||"";
  const map={"auth/invalid-email":"Please enter a valid email address.","auth/email-already-in-use":"An account with this email already exists.","auth/weak-password":"Choose a stronger password.","auth/invalid-credential":"Email or password is incorrect.","auth/user-not-found":"No account was found for this email.","auth/wrong-password":"Email or password is incorrect.","auth/too-many-requests":"Too many attempts. Please try again later.","auth/network-request-failed":"Network error. Check your internet connection."};
  return map[code]||err?.message||"Something went wrong. Please try again.";
}
