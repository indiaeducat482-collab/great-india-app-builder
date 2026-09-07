import { auth, db, firebaseConfigured } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { collection, query, where, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const $=s=>document.querySelector(s), toast=$("#toast");
function showToast(t){toast.textContent=t;toast.classList.add("show");setTimeout(()=>toast.classList.remove("show"),3000)}
function formatDate(v){if(!v)return"—";const d=v.toDate?v.toDate():new Date(v);return isNaN(d)?"—":d.toLocaleDateString(undefined,{year:"numeric",month:"short",day:"numeric"});}
function initials(name="GI"){return name.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join("").toUpperCase()||"GI";}
function requireConfig(){if(!firebaseConfigured){showToast("Firebase is not configured. Add your Web App config.");return false}return true}

$("#logoutBtn")?.addEventListener("click",async()=>{if(auth)await signOut(auth);location.href="./login.html";});
$("#menuBtn")?.addEventListener("click",()=>document.querySelector(".sidebar")?.classList.toggle("mobile-open"));

if(!firebaseConfigured){$("#recentApps").innerHTML='<div class="empty-state"><strong>Firebase configuration required</strong><span>Paste your Firebase Web App config in <b>js/firebase-config.js</b>, then reload.</span></div>';}
if(auth) onAuthStateChanged(auth, async user=>{
  if(!user){location.href="./login.html";return;}
  const name=user.displayName||user.email?.split("@")[0]||"there";
  $("#userName").textContent=name;$("#topName").textContent=name;$("#topEmail").textContent=user.email||"";
  $("#profileName").textContent=name;$("#profileEmail").textContent=user.email||"—";$("#profileUid").textContent=user.uid;$("#avatar").textContent=initials(name);
  if(requireConfig()) await loadApps(user.uid);
});

async function loadApps(uid){
  try{
    const q=query(collection(db,"apps"),where("userId","==",uid),orderBy("createdAt","desc"));
    const snap=await getDocs(q); const apps=snap.docs.map(d=>({id:d.id,...d.data()}));
    $("#totalApps").textContent=apps.length;$("#buildingApps").textContent=apps.filter(a=>a.status==="building").length;$("#readyApps").textContent=apps.filter(a=>a.status==="ready").length;
    const recent=apps.slice(0,5);
    if(!recent.length){$("#recentApps").innerHTML='<div class="empty-state"><strong>You haven’t created any apps yet.</strong><span>Start your first project from the Create New App button.</span></div>';return;}
    $("#recentApps").innerHTML=recent.map(appRow).join("");
  }catch(err){console.error(err);$("#recentApps").innerHTML='<div class="empty-state"><strong>Could not load apps</strong><span>Check Firestore rules/indexes and your Firebase configuration.</span></div>';}
}
function appRow(a){const logo=a.logoUrl?`<img class="app-logo" src="${esc(a.logoUrl)}" alt="">`:`<div class="app-logo">${esc(initials(a.appName))}</div>`;return `<div class="app-row"><div class="app-row-main">${logo}<div><h3>${esc(a.appName||"Untitled App")}</h3><p>${esc(a.websiteUrl||"No website URL")} · ${formatDate(a.createdAt)}</p></div></div><div class="app-actions"><span class="status-badge ${esc(a.status||"draft")}">${esc(a.status||"draft")}</span><a class="mini-btn primary" href="./app-details.html?id=${encodeURIComponent(a.id)}">Open</a><a class="mini-btn" href="./create-app.html?id=${encodeURIComponent(a.id)}">Edit</a></div></div>`}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}
