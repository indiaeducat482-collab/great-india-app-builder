import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, orderBy, getDocs, serverTimestamp, doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
let mode = "login";
let currentUser = null;
let editingId = null;

const $ = id => document.getElementById(id);
$("loginTab").onclick = () => { mode="login"; $("authBtn").textContent="Login"; };
$("signupTab").onclick = () => { mode="signup"; $("authBtn").textContent="Create Account"; };

$("authBtn").onclick = async () => {
  $("authMsg").textContent = "";
  try {
    if(mode==="signup") await createUserWithEmailAndPassword(auth,$("email").value,$("password").value);
    else await signInWithEmailAndPassword(auth,$("email").value,$("password").value);
  } catch(e) { $("authMsg").textContent = e.message; }
};

$("googleBtn").onclick = async () => {
  try { await signInWithPopup(auth,new GoogleAuthProvider()); }
  catch(e) { $("authMsg").textContent=e.message; }
};

$("logout").onclick = () => signOut(auth);

onAuthStateChanged(auth, async user => {
  currentUser=user;
  $("authView").classList.toggle("hidden",!!user);
  $("appView").classList.toggle("hidden",!user);
  $("logout").classList.toggle("hidden",!user);
  $("userInfo").textContent=user ? (user.email || user.displayName || "") : "";
  if(user) await loadApps();
});

$("appForm").onsubmit = async e => {
  e.preventDefault();
  $("appMsg").textContent="";
  const data = {
    userId: currentUser.uid,
    appName: $("appName").value.trim(),
    websiteUrl: $("websiteUrl").value.trim(),
    packageName: $("packageName").value.trim(),
    version: $("version").value.trim(),
    description: $("description").value.trim(),
    updatedAt: serverTimestamp()
  };
  try {
    if(editingId) await updateDoc(doc(db,"apps",editingId),data);
    else { data.createdAt=serverTimestamp(); await addDoc(collection(db,"apps"),data); }
    editingId=null; $("appForm").reset(); $("version").value="1.0.0";
    $("appMsg").textContent="App saved successfully.";
    await loadApps();
  } catch(e) { $("appMsg").textContent=e.message; }
};

async function loadApps(){
  const q=query(collection(db,"apps"),where("userId","==",currentUser.uid),orderBy("updatedAt","desc"));
  const snap=await getDocs(q);
  $("apps").innerHTML="";
  if(snap.empty){$("apps").innerHTML='<p class="muted">No apps yet.</p>';return;}
  snap.forEach(d=>{
    const x=d.data();
    const el=document.createElement("div");
    el.className="appItem";
    el.innerHTML=`<b>${escapeHtml(x.appName)}</b><span class="muted">${escapeHtml(x.packageName)}</span><br><a target="_blank" href="${escapeAttr(x.websiteUrl)}">${escapeHtml(x.websiteUrl)}</a><br><button data-id="${d.id}" class="edit">Edit</button><button data-url="${escapeAttr(x.websiteUrl)}" data-name="${escapeAttr(x.appName)}" data-pkg="${escapeAttr(x.packageName)}" class="build">Build APK</button>`;
    el.querySelector(".edit").onclick=()=>editApp(d.id,x);
    el.querySelector(".build").onclick=()=>startBuild(x);
    $("apps").appendChild(el);
  });
}

function editApp(id,x){ editingId=id; $("appName").value=x.appName||""; $("websiteUrl").value=x.websiteUrl||""; $("packageName").value=x.packageName||""; $("version").value=x.version||"1.0.0"; $("description").value=x.description||""; window.scrollTo({top:0,behavior:"smooth"}); }

$("buildBtn").onclick=()=>{
  const x={appName:$("appName").value,websiteUrl:$("websiteUrl").value,packageName:$("packageName").value};
  startBuild(x);
};

function startBuild(x){
  const GITHUB_REPO = "YOUR_GITHUB_OWNER/YOUR_REPO"; // Change this after uploading to GitHub
  const url=`https://github.com/${GITHUB_REPO}/actions/workflows/android-build.yml`;
  alert("Build system is included. Push this project to GitHub, then run the Android Build workflow from GitHub Actions. Replace YOUR_GITHUB_OWNER/YOUR_REPO in app.js with your repository.");
  window.open(url,"_blank");
}

function escapeHtml(s=""){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c]));}
function escapeAttr(s=""){return s.replace(/"/g,"&quot;");}
