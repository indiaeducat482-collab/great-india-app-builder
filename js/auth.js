import { auth, db } from "./firebase-config.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, updateProfile } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const $=s=>document.querySelector(s), msg=x=>{const e=$("#msg");if(e){e.textContent=x;e.className="msg"}};
const friendly=e=>({"auth/invalid-credential":"Invalid email or password.","auth/invalid-email":"Invalid email address.","auth/email-already-in-use":"Email is already registered.","auth/weak-password":"Password must be at least 6 characters.","auth/too-many-requests":"Too many attempts. Please try again later.","auth/network-request-failed":"Network error. Check your internet connection."}[e?.code]||e?.message||"Something went wrong.");

$("#login")?.addEventListener("click",async()=>{const email=$("#email").value.trim(),password=$("#password").value;if(!email||!password)return msg("Enter email and password.");try{await signInWithEmailAndPassword(auth,email,password);location.href="index.html"}catch(e){msg(friendly(e))}});
$("#forgot")?.addEventListener("click",async e=>{e.preventDefault();const email=$("#email").value.trim();if(!email)return msg("Enter your email first.");try{await sendPasswordResetEmail(auth,email);alert("Password reset email sent.")}catch(x){msg(friendly(x))}});
$("#register")?.addEventListener("click",async()=>{const name=$("#name").value.trim(),email=$("#email").value.trim(),p=$("#password").value,c=$("#confirm").value;if(!name||!email||p.length<6||p!==c)return msg("Check name, email and matching password (6+ characters).");try{const r=await createUserWithEmailAndPassword(auth,email,p);await updateProfile(r.user,{displayName:name});await setDoc(doc(db,"users",r.user.uid),{uid:r.user.uid,name,email,createdAt:serverTimestamp()});location.href="index.html"}catch(e){msg(friendly(e))}});
