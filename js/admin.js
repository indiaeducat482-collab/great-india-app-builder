import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { collection, query, where, getDocs, doc, getDoc, runTransaction, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
const ADMIN_EMAIL="admin@greatindia.technology",$=x=>document.getElementById(x);
async function load(){
 const s=await getDocs(query(collection(db,"adminRequests"),where("status","==","pending")));
 $("requests").innerHTML=s.empty?"<p class='muted'>No pending requests.</p>":"";
 s.forEach(x=>{const d=x.data(),el=document.createElement("div");el.className="request";el.innerHTML=`<b>${d.name||"User"}</b><br><span class="muted">${d.email||""} · Used: ${d.count||0}</span><br><button data-uid="${d.uid}">Approve +2 APK</button>`;el.querySelector("button").onclick=()=>approve(d.uid);$("requests").appendChild(el)});
}
async function approve(uid){
 const ref=doc(db,"usage",uid),req=doc(db,"adminRequests",uid);
 await runTransaction(db,async tx=>{const s=await tx.get(ref),d=s.exists()?s.data():{};tx.set(ref,{uid,count:Number(d.count||0),extra:Number(d.extra||0)+2,updatedAt:serverTimestamp()},{merge:true});tx.update(req,{status:"approved",approvedAt:serverTimestamp(),updatedAt:serverTimestamp()})});
 await load();
}
onAuthStateChanged(auth,async u=>{if(!u||u.email.toLowerCase()!==ADMIN_EMAIL){location.href="index.html";return}$("who").textContent=u.email;await load()});
