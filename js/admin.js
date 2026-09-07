import {
  auth,
  db
} from "./firebase-config.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
  runTransaction,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


const ADMIN_EMAIL =
  "admin@greatindia.technology";


const $ = id =>
  document.getElementById(id);


const esc = x =>
  String(x ?? "").replace(
    /[&<>"']/g,
    c => ({
      "&":"&amp;",
      "<":"&lt;",
      ">":"&gt;",
      '"':"&quot;",
      "'":"&#39;"
    }[c])
  );


async function load(){

  const usersSnap =
    await getDocs(
      collection(db,"users")
    );


  const appsSnap =
    await getDocs(
      collection(db,"appHistory")
    );


  const requestsSnap =
    await getDocs(
      query(
        collection(db,"adminRequests"),
        where("status","==","pending")
      )
    );


  let blocked = 0;


  usersSnap.forEach(x=>{

    if(x.data().blocked){
      blocked++;
    }

  });


  $("users").textContent =
    usersSnap.size;

  $("blocked").textContent =
    blocked;

  $("apps").textContent =
    appsSnap.size;

  $("pending").textContent =
    requestsSnap.size;


  /* =========================
     USERS
  ========================= */

  $("usersTable").innerHTML =
    usersSnap.empty
    ?
    "No users."
    :
    `
    <table class="table">

      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>UID</th>
          <th>Status</th>
          <th>Usage</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>

      ${usersSnap.docs.map(x=>{

        const d=x.data();

        return `
        <tr>

          <td>
            ${esc(
              d.name ||
              d.fullName ||
              ""
            )}
          </td>

          <td>
            ${esc(d.email || "")}
          </td>

          <td class="muted">
            ${esc(x.id)}
          </td>

          <td>
            ${
              d.blocked
              ?
              "🚫 Blocked"
              :
              "✅ Active"
            }
          </td>

          <td>
            ${Number(d.buildCount || 0)}
            builds
          </td>

          <td>

            <button
              class="btn gray"
              onclick="editUser(
                '${x.id}',
                ${JSON.stringify(
                  d.name ||
                  d.fullName ||
                  ""
                )}
              )"
            >
              Edit
            </button>

            <button
              class="btn ${
                d.blocked
                ?
                "ok"
                :
                "warn"
              }"
              onclick="toggleBlock(
                '${x.id}',
                ${!!d.blocked}
              )"
            >
              ${
                d.blocked
                ?
                "Unblock"
                :
                "Block"
              }
            </button>

            <button
              class="btn danger"
              onclick="deleteUserData(
                '${x.id}'
              )"
            >
              Delete
            </button>

          </td>

        </tr>
        `;

      }).join("")}

      </tbody>

    </table>
    `;


  /* =========================
     ALL APPS
  ========================= */


  if(!$("appsTable")){
    console.warn(
      "appsTable element not found"
    );
  }else{

    if(appsSnap.empty){

      $("appsTable").innerHTML =
        "<p>No apps found.</p>";

    }else{

      const userMap = {};

      usersSnap.forEach(u=>{

        const d=u.data();

        userMap[u.id] =
          d.email ||
          d.name ||
          d.fullName ||
          u.id;

      });


      $("appsTable").innerHTML = `

      <table class="table">

        <thead>

          <tr>
            <th>App</th>
            <th>User</th>
            <th>Target URL</th>
            <th>Status</th>
            <th>APK</th>
            <th>Created</th>
            <th>Action</th>
          </tr>

        </thead>

        <tbody>

        ${appsSnap.docs.map(x=>{

          const d=x.data();

          const date =
            d.createdAt?.toDate
            ?
            d.createdAt.toDate()
              .toLocaleString()
            :
            "";


          const apk =
            d.apkUrl ||
            d.apk_url ||
            "";


          const status =
            d.status ||
            "queued";


          return `

          <tr>

            <td>
              <b>
                ${esc(
                  d.name ||
                  "My App"
                )}
              </b>

              <br>

              <span class="muted">
                ID: ${esc(x.id)}
              </span>
            </td>


            <td>
              ${esc(
                userMap[d.uid] ||
                d.uid ||
                "Unknown"
              )}
            </td>


            <td>
              <a
                href="${esc(
                  d.targetUrl ||
                  d.target_url ||
                  "#"
                )}"
                target="_blank"
                rel="noopener"
              >
                ${esc(
                  d.targetUrl ||
                  d.target_url ||
                  ""
                )}
              </a>
            </td>


            <td>
              ${
                String(status)
                  .toLowerCase()
                  === "ready"
                ?
                "✅ Ready"
                :
                String(status)
                  .toLowerCase()
                  === "failed"
                ?
                "❌ Failed"
                :
                "⏳ " +
                esc(status)
              }
            </td>


            <td>

              ${
                apk
                ?
                `
                <a
                  class="btn ok"
                  href="${esc(apk)}"
                  target="_blank"
                  rel="noopener"
                >
                  Download
                </a>
                `
                :
                `<span class="muted">
                   Not Ready
                 </span>`
              }

            </td>


            <td>
              ${esc(date)}
            </td>


            <td>

              <button
                class="btn danger"
                onclick="deleteApp(
                  '${x.id}'
                )"
              >
                🗑 Delete App
              </button>

            </td>

          </tr>

          `;

        }).join("")}

        </tbody>

      </table>

      `;
    }
  }


  /* =========================
     REQUESTS
  ========================= */


  $("requests").innerHTML =
    requestsSnap.empty
    ?
    "No pending requests."
    :
    requestsSnap.docs.map(x=>{

      const d=x.data();

      return `
      <div class="card">

        <b>
          ${esc(d.name || "User")}
        </b>

        —
        ${esc(d.email || "")}

        <br>

        <span class="muted">

          Requested extra:
          ${Number(d.requestedExtra || 2)}

          ·

          ${esc(d.message || "")}

        </span>

        <br>

        <button
          class="btn ok"
          onclick="approve(
            '${x.id}',
            ${Number(
              d.requestedExtra || 2
            )}
          )"
        >
          Approve
        </button>

        <button
          class="btn danger"
          onclick="reject(
            '${x.id}'
          )"
        >
          Reject
        </button>

      </div>
      `;

    }).join("");
}


/* =========================
   EDIT USER
========================= */

window.editUser =
async (uid,current)=>{

  const name =
    prompt(
      "User name:",
      current
    );

  if(name===null)return;


  await updateDoc(
    doc(db,"users",uid),
    {
      name:name.trim(),
      updatedAt:serverTimestamp()
    }
  );


  await load();
};


/* =========================
   BLOCK USER
========================= */

window.toggleBlock =
async (uid,blocked)=>{

  await updateDoc(
    doc(db,"users",uid),
    {
      blocked:!blocked,
      updatedAt:serverTimestamp()
    }
  );


  await load();
};


/* =========================
   DELETE USER
========================= */

window.deleteUserData =
async uid=>{

  if(
    !confirm(
      "Delete this user's Firestore profile, usage and app history?"
    )
  )return;


  await deleteDoc(
    doc(db,"users",uid)
  );


  await deleteDoc(
    doc(db,"usage",uid)
  );


  await deleteDoc(
    doc(db,"adminRequests",uid)
  );


  const apps =
    await getDocs(
      query(
        collection(db,"appHistory"),
        where("uid","==",uid)
      )
    );


  await Promise.all(
    apps.docs.map(
      x=>deleteDoc(x.ref)
    )
  );


  await load();
};


/* =========================
   ⭐ DELETE APP
========================= */

window.deleteApp =
async id=>{

  if(
    !confirm(
      "क्या आप इस App को permanently delete करना चाहते हैं?"
    )
  ){
    return;
  }


  try{

    await deleteDoc(
      doc(db,"appHistory",id)
    );


    alert(
      "✅ App successfully deleted."
    );


    await load();

  }catch(e){

    console.error(e);

    alert(
      "❌ Delete failed: " +
      e.message
    );
  }
};


/* =========================
   APPROVE
========================= */

window.approve =
async (uid,extra)=>{

  const u =
    doc(db,"usage",uid);

  const r =
    doc(db,"adminRequests",uid);


  await runTransaction(
    db,
    async tx=>{

      const s =
        await tx.get(u);

      const d =
        s.exists()
        ?
        s.data()
        :
        {
          count:0,
          extra:0
        };


      tx.set(
        u,
        {
          uid,
          count:Number(
            d.count || 0
          ),
          extra:
            Number(d.extra || 0)
            + extra,
          updatedAt:
            serverTimestamp()
        },
        {
          merge:true
        }
      );


      tx.update(
        r,
        {
          status:"approved",
          approvedAt:
            serverTimestamp(),
          updatedAt:
            serverTimestamp()
        }
      );

    }
  );


  await load();
};


/* =========================
   REJECT
========================= */

window.reject =
async uid=>{

  await updateDoc(
    doc(
      db,
      "adminRequests",
      uid
    ),
    {
      status:"rejected",
      updatedAt:
        serverTimestamp()
    }
  );


  await load();
};


/* =========================
   ADMIN AUTH
========================= */

onAuthStateChanged(
  auth,
  async u=>{

    if(
      !u ||
      String(
        u.email || ""
      ).toLowerCase()
      !== ADMIN_EMAIL
    ){

      location.href =
        "index.html";

      return;
    }


    await load();

  }
);
