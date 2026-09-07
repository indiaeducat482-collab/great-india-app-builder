import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { doc, getDoc, setDoc, runTransaction, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const API="https://rpzmnfvtfikiabowjnzj.supabase.co/functions/v1",PUBLISH="publish-v13",STATUS="build-status-v3";
const ADMIN_EMAIL="admin@greatindia.technology";
const $=x=>document.getElementById(x); let user=null,buildId=null,timer=null,start=0;

function show(x,error=false){$("result").style.display="block";$("result").className="result"+(error?" error":"");$("result").innerHTML=x}
function valid(u){return /^https?:\/\//i.test(u)}
function esc(x){return String(x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
async function call(path,data){const r=await fetch(API+"/"+path+"?t="+Date.now(),{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json","Cache-Control":"no-cache"},body:JSON.stringify(data),cache:"no-store"});const t=await r.text();let d;try{d=JSON.parse(t)}catch{throw Error("Server response invalid")}if(!r.ok||d.ok===false)throw Error(d.error||d.message||"Request failed");return d}

async function quota(){
  const ref=doc(db,"usage",user.uid), snap=await getDoc(ref);
  const q=snap.exists()?snap.data():{count:0,extra:0};
  const used=Number(q.count||0),extra=Number(q.extra||0),limit=2+extra;
  $("quota").textContent=`APK usage: ${used}/${limit} used`;
  return {used,extra,limit};
}
async function reserveBuild(){
  return runTransaction(db,async tx=>{
    const ref=doc(db,"usage",user.uid),snap=await tx.get(ref),d=snap.exists()?snap.data():{count:0,extra:0};
    const count=Number(d.count||0),limit=2+Number(d.extra||0);
    if(count>=limit) throw Error("LIMIT");
    tx.set(ref,{uid:user.uid,count:count+1,extra:Number(d.extra||0),updatedAt:serverTimestamp()},{merge:true});
    return {used:count+1,limit};
  });
}
async function requestApproval(){
  const q=await getDoc(doc(db,"usage",user.uid)),d=q.exists()?q.data():{count:0,extra:0};
  const snap=await getDoc(doc(db,"adminRequests",user.uid));
  if(snap.exists()&&snap.data().status==="pending") return false;
  await setDoc(doc(db,"adminRequests",user.uid),{uid:user.uid,email:user.email,name:user.displayName||"",count:Number(d.count||0),status:"pending",createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
  return true;
}
async function poll(){
  try{const d=await call(STATUS,{build_id:buildId}),u=d.apk_url||d.apk_path||d.project?.apk_url||d.project?.apk_path||d.build?.apk_url||d.build?.apk_path;
    if(u){clearTimeout(timer);$("publish").disabled=false;show(`<b>✅ APK तैयार है</b><a class="apk" href="${esc(u)}" target="_blank" rel="noopener">⬇️ Download Android APK</a>`);return}
    const s=String(d.status||d.build?.status||"").toLowerCase();if(s==="failed")throw Error(d.error||d.build_log||"APK build failed");
    show(`⏳ <b>APK बन रहा है…</b><div class="muted">Build ID: ${esc(buildId)}<br>Elapsed: ${Math.floor((Date.now()-start)/1000)} sec</div>`);
  }catch(e){$("publish").disabled=false;show("❌ "+esc(e.message),true);return}
  timer=setTimeout(poll,1200);
}
$("logout").onclick=()=>signOut(auth).then(()=>location.href="login.html");
$("name").oninput=()=>{$("pname").textContent=$("name").value.trim()||"My App"};
$("preview").onclick=()=>{const u=$("url").value.trim(),n=$("name").value.trim()||"My App";if(!valid(u))return show("❌ Valid Website URL डालें.",true);$("previewBox").innerHTML=`<div class="phone"><div class="head">🚀 <span>${esc(n)}</span></div><div class="body"><iframe src="${esc(u)}" allow="camera;microphone;geolocation;fullscreen;payment" allowfullscreen></iframe></div></div>`};

$("publish").onclick=async()=>{
  clearTimeout(timer); const n=$("name").value.trim()||"My App",u=$("url").value.trim();
  if(!valid(u))return show("❌ Valid Website URL डालें.",true);
  $("publish").disabled=true;
  try{
    const q=await quota();
    if(q.used>=q.limit){
      await requestApproval();
      $("publish").disabled=false;
      show(`⚠️ <b>2 APK limit reached.</b><div class="muted">Admin approval request भेज दी गई है. Approval के बाद फिर Publish करें.</div>`);
      return;
    }
    const f=$("logo").files?.[0]; let logo=null;
    if(f){if(f.size>3e6)throw Error("Logo 3 MB से छोटा रखें");logo=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(f)})}
    const reserved=await reserveBuild();
    const d=await call(PUBLISH,{name:n,target_url:u,logo_data:logo,config:{firebase_uid:user.uid,user_email:user.email}});
    buildId=d.build_id;if(!buildId)throw Error("Build ID नहीं मिला");
    await addDoc(collection(db,"appHistory"),{uid:user.uid,buildId,name:n,targetUrl:u,status:"queued",createdAt:serverTimestamp()});
    $("quota").textContent=`APK usage: ${reserved.used}/${reserved.limit} used`; start=Date.now();poll();
  }catch(e){
    $("publish").disabled=false;
    if(e.message==="LIMIT"){await requestApproval();return show("⚠️ 2 APK limit reached. Admin approval request भेज दी गई है.",true)}
    show("❌ "+esc(e.message||e),true);
  }
};

onAuthStateChanged(auth,async u=>{
  if(!u){location.href="login.html";return}
  user=u;$("userEmail").textContent=u.email||"";if((u.email||"").toLowerCase()===ADMIN_EMAIL) $("adminLink").classList.remove("hidden");
  try{await quota()}catch(e){show("❌ Firebase/Firestore setup error: "+esc(e.message),true)}
});
