import {auth,db} from "./firebase-config.js";
import {createUserWithEmailAndPassword,signInWithEmailAndPassword,sendPasswordResetEmail,updateProfile,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import {doc,setDoc,serverTimestamp} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
const $=s=>document.querySelector(s);
const msg=(t,c="error")=>{const e=$("#message");if(e){e.textContent=t;e.className="message "+c;e.hidden=false}};
document.querySelectorAll(".toggle-pass").forEach(b=>b.onclick=()=>{const i=$("#"+b.dataset.target);i.type=i.type==="password"?"text":"password";b.textContent=i.type==="password"?"Show":"Hide"});
const lf=$("#loginForm");
if(lf) lf.onsubmit=async e=>{e.preventDefault();const b=$("#loginBtn");b.disabled=true;b.textContent="Logging in…";try{await signInWithEmailAndPassword(auth,$("#email").value.trim(),$("#password").value);location.href="./dashboard.html"}catch(x){msg(firebaseError(x));b.disabled=false;b.textContent="Login"}};
const rf=$("#registerForm");
if(rf) rf.onsubmit=async e=>{e.preventDefault();if($("#password").value!==$("#confirmPassword").value)return msg("Passwords do not match.");const b=$("#registerBtn");b.disabled=true;b.textContent="Creating…";try{const c=await createUserWithEmailAndPassword(auth,$("#email").value.trim(),$("#password").value);await updateProfile(c.user,{displayName:$("#fullName").value.trim()});await setDoc(doc(db,"users",c.user.uid),{uid:c.user.uid,fullName:$("#fullName").value.trim(),email:c.user.email,createdAt:serverTimestamp(),updatedAt:serverTimestamp()});location.href="./dashboard.html"}catch(x){msg(firebaseError(x));b.disabled=false;b.textContent="Create Account"}};
$("#forgotBtn")?.addEventListener("click",async()=>{const email=$("#email")?.value.trim();if(!email)return msg("Enter your email first.");try{await sendPasswordResetEmail(auth,email);msg("Password reset email sent.","success")}catch(x){msg(firebaseError(x))}});
function firebaseError(e){const m={auth/invalid-credential:"Invalid email or password.",auth/invalid-email:"Invalid email address.",auth/user-not-found:"Invalid email or password.",auth/wrong-password:"Invalid email or password.",auth/email-already-in-use:"Email is already registered.",auth/weak-password:"Password must be at least 6 characters.",auth/too-many-requests:"Too many attempts. Please try again later."};return m[e.code]||e.message||"Something went wrong."}
onAuthStateChanged(auth,u=>{if(u&&location.pathname.endsWith("/login.html")){}});
