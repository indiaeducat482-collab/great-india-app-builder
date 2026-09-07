import { auth, db, storage, firebaseConfigured } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { collection, addDoc, doc, getDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-storage.js";

const $=s=>document.querySelector(s), params=new URLSearchParams(location.search), editId=params.get("id");
let currentUser=null, existing=null;
const notice=$("#firebaseNotice");
function toast(t){const x=$("#toast");x.textContent=t;x.classList.add("show");setTimeout(()=>x.classList.remove("show"),3200)}
function setBusy(on){const b=$("#saveBtn");b.disabled=on;b.textContent=on?"Saving…":"Save App";}
function validPackage(v){return /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(v)}
function validVersion(v){return /^\d+\.\d+\.\d+$/.test(v)}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}

if(!firebaseConfigured) notice.hidden=false,notice.textContent="Firebase is not configured yet. You can see the full interface, but saving/uploading requires your Firebase Web App configuration in js/firebase-config.js.";
if(auth) onAuthStateChanged(auth,async u=>{
  if(!u){location.href="./login.html";return} currentUser=u;
  if(editId && firebaseConfigured) await loadExisting();
});
$("#logoutBtn")?.addEventListener("click",async()=>{if(auth)await (await import("https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js")).signOut(auth);location.href="./login.html"});
$("#menuBtn")?.addEventListener("click",()=>document.querySelector(".sidebar")?.classList.toggle("mobile-open"));

async function loadExisting(){
  try{const s=await getDoc(doc(db,"apps",editId));if(!s.exists()||s.data().userId!==currentUser.uid){toast("App not found.");return}existing=s.data();$("#pageTitle").textContent="Edit App";$("#appName").value=existing.appName||"";$("#websiteUrl").value=existing.websiteUrl||"";$("#packageName").value=existing.packageName||"";$("#version").value=existing.version||"1.0.0";$("#theme").value=existing.theme||"light";}catch(e){console.error(e);toast("Could not load app.");}
}
$("#appForm").addEventListener("submit",async e=>{
  e.preventDefault();
  if(!firebaseConfigured){toast("Configure Firebase before saving.");return}
  const appName=$("#appName").value.trim(), websiteUrl=$("#websiteUrl").value.trim(), packageName=$("#packageName").value.trim(), version=$("#version").value.trim(), theme=$("#theme").value;
  try{new URL(websiteUrl)}catch{toast("Enter a valid website URL, including https://");return}
  if(!validPackage(packageName)){toast("Enter a valid Android package name, e.g. com.greatindia.myapp");return}
  if(!validVersion(version)){toast("Version must look like 1.0.0");return}
  setBusy(true);
  try{
    let logoUrl=existing?.logoUrl||"",iconUrl=existing?.iconUrl||"";
    if($("#logoFile").files[0]) logoUrl=await uploadImage($("#logoFile").files[0],"logos");
    if($("#iconFile").files[0]) iconUrl=await uploadImage($("#iconFile").files[0],"icons");
    const data={userId:currentUser.uid,appName,websiteUrl,packageName,version,logoUrl,iconUrl,theme,status:existing?.status||"draft",updatedAt:serverTimestamp()};
    if(editId){await updateDoc(doc(db,"apps",editId),data);toast("App updated successfully.");setTimeout(()=>location.href=`./app-details.html?id=${encodeURIComponent(editId)}`,450);}
    else{data.createdAt=serverTimestamp();const s=await addDoc(collection(db,"apps"),data);toast("App saved successfully.");setTimeout(()=>location.href=`./app-details.html?id=${encodeURIComponent(s.id)}`,450);}
  }catch(err){console.error(err);toast(err?.message||"Could not save app. Check Firebase rules.");}finally{setBusy(false)}
});
async function uploadImage(file,folder){
  if(file.size>5*1024*1024)throw new Error("Image must be smaller than 5 MB.");
  if(!file.type.startsWith("image/"))throw new Error("Only image files are allowed.");
  const path=`${folder}/${currentUser.uid}/${Date.now()}-${safeName(file.name)}`,r=ref(storage,path);await uploadBytes(r,file,{contentType:file.type});return getDownloadURL(r);
}
function safeName(n){return n.replace(/[^a-zA-Z0-9._-]/g,"-")}
$("#previewBtn").addEventListener("click",()=>{const url=$("#websiteUrl").value.trim();if(!url){toast("Enter the website URL first.");return}try{const u=new URL(url);window.open(u.href,"_blank","noopener,noreferrer")}catch{toast("Enter a valid website URL.")}});
["logoFile","iconFile"].forEach(id=>$("#"+id).addEventListener("change",()=>{const box=$("#imagePreview");box.hidden=false;box.innerHTML=Array.from($("#logoFile").files).concat(Array.from($("#iconFile").files)).map(f=>`<img src="${URL.createObjectURL(f)}" alt="${esc(f.name)}">`).join("")||"";}));
