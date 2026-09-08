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


/* =========================
   ADMIN EMAIL
========================= */

const ADMIN_EMAIL = "indiaeducat482@gmail.com";


/* =========================
   HELPERS
========================= */

const $ = id => document.getElementById(id);

const esc = x =>
  String(x ?? "").replace(
    /[&<>"']/g,
    c => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[c])
  );


/* =========================
   LOAD ADMIN DATA
========================= */

async function load() {

  try {

    /* =========================
       USERS
    ========================= */

    const usersSnap =
      await getDocs(
        collection(db, "users")
      );


    /* =========================
       APPS
    ========================= */

    const appsSnap =
      await getDocs(
        collection(db, "appHistory")
      );


    /* =========================
       UPGRADE REQUESTS
    ========================= */

    const requestsSnap =
      await getDocs(
        query(
          collection(db, "adminRequests"),
          where("status", "==", "pending")
        )
      );


    /* =========================
       STATS
    ========================= */

    let blocked = 0;

    usersSnap.forEach(x => {

      const d = x.data();

      if (d.blocked) {
        blocked++;
      }

    });


    if ($("users")) {
      $("users").textContent =
        usersSnap.size;
    }

    if ($("blocked")) {
      $("blocked").textContent =
        blocked;
    }

    if ($("apps")) {
      $("apps").textContent =
        appsSnap.size;
    }

    if ($("pending")) {
      $("pending").textContent =
        requestsSnap.size;
    }


    /* =========================
       ALL USERS
    ========================= */

    if ($("usersTable")) {

      if (usersSnap.empty) {

        $("usersTable").innerHTML =
          "<p>No users found.</p>";

      } else {

        $("usersTable").innerHTML = `

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

              ${usersSnap.docs.map(x => {

                const d = x.data();

                const name =
                  d.name ||
                  d.fullName ||
                  "";

                const email =
                  d.email ||
                  "";

                const buildCount =
                  Number(
                    d.buildCount || 0
                  );

                return `

                  <tr>

                    <td>
                      ${esc(name)}
                    </td>

                    <td>
                      ${esc(email)}
                    </td>

                    <td class="muted">
                      ${esc(x.id)}
                    </td>

                    <td>

                      ${
                        d.blocked
                        ? "🚫 Blocked"
                        : "✅ Active"
                      }

                    </td>

                    <td>
                      ${buildCount} builds
                    </td>

                    <td>

                      <button
                        class="btn gray"
                        onclick='editUser(
                          ${JSON.stringify(x.id)},
                          ${JSON.stringify(name)}
                        )'
                      >
                        Edit
                      </button>

                      <button
                        class="btn ${
                          d.blocked
                          ? "ok"
                          : "warn"
                        }"
                        onclick='toggleBlock(
                          ${JSON.stringify(x.id)},
                          ${JSON.stringify(!!d.blocked)}
                        )'
                      >

                        ${
                          d.blocked
                          ? "Unblock"
                          : "Block"
                        }

                      </button>

                      <button
                        class="btn danger"
                        onclick='deleteUserData(
                          ${JSON.stringify(x.id)}
                        )'
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

      }

    }


    /* =========================
       USER MAP
    ========================= */

    const userMap = {};

    usersSnap.forEach(u => {

      const d = u.data();

      userMap[u.id] =
        d.email ||
        d.name ||
        d.fullName ||
        u.id;

    });


    /* =========================
       ALL APPS
    ========================= */

    if ($("appsTable")) {

      if (appsSnap.empty) {

        $("appsTable").innerHTML =
          "<p>No apps found.</p>";

      } else {

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

              ${appsSnap.docs.map(x => {

                const d = x.data();

                const appName =
                  d.name ||
                  d.appName ||
                  "My App";

                const uid =
                  d.uid ||
                  d.userId ||
                  "";

                const targetUrl =
                  d.targetUrl ||
                  d.target_url ||
                  d.url ||
                  "";

                const apk =
                  d.apkUrl ||
                  d.apk_url ||
                  d.downloadUrl ||
                  "";

                const status =
                  d.status ||
                  "queued";

                let date = "";

                if (
                  d.createdAt &&
                  d.createdAt.toDate
                ) {

                  date =
                    d.createdAt
                      .toDate()
                      .toLocaleString();

                }


                let statusHtml = "";

                const statusLower =
                  String(status)
                    .toLowerCase();


                if (
                  statusLower ===
                  "ready"
                ) {

                  statusHtml =
                    "✅ Ready";

                } else if (
                  statusLower ===
                  "failed"
                ) {

                  statusHtml =
                    "❌ Failed";

                } else {

                  statusHtml =
                    "⏳ " +
                    esc(status);

                }


                return `

                  <tr>

                    <td>

                      <b>
                        ${esc(appName)}
                      </b>

                      <br>

                      <span class="muted">
                        ID:
                        ${esc(x.id)}
                      </span>

                    </td>


                    <td>

                      ${esc(
                        userMap[uid] ||
                        uid ||
                        "Unknown"
                      )}

                    </td>


                    <td class="url">

                      ${
                        targetUrl
                        ?
                        `
                        <a
                          href="${esc(targetUrl)}"
                          target="_blank"
                          rel="noopener"
                        >
                          ${esc(targetUrl)}
                        </a>
                        `
                        :
                        "-"
                      }

                    </td>


                    <td>
                      ${statusHtml}
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
                        `
                        <span class="muted">
                          Not Ready
                        </span>
                        `
                      }

                    </td>


                    <td>
                      ${esc(date)}
                    </td>


                    <td>

                      <button
                        class="btn danger"
                        onclick='deleteApp(
                          ${JSON.stringify(x.id)}
                        )'
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
       UPGRADE REQUESTS
    ========================= */

    if ($("requests")) {

      if (requestsSnap.empty) {

        $("requests").innerHTML =
          "<p>No pending requests.</p>";

      } else {

        $("requests").innerHTML =

          requestsSnap.docs.map(x => {

            const d = x.data();

            const requested =
              Number(
                d.requestedExtra ||
                d.extraBuilds ||
                d.requestedBuilds ||
                2
              );

            return `

              <div class="card">

                <b>
                  ${esc(
                    d.name ||
                    "User"
                  )}
                </b>

                —
                ${esc(
                  d.email ||
                  ""
                )}

                <br>

                <span class="muted">

                  Requested extra:
                  ${requested}

                  <br>

                  ${esc(
                    d.message ||
                    "Please approve extra APK builds."
                  )}

                </span>

                <br><br>

                <button
                  class="btn ok"
                  onclick='approve(
                    ${JSON.stringify(x.id)},
                    ${requested}
                  )'
                >
                  Approve
                </button>


                <button
                  class="btn danger"
                  onclick='reject(
                    ${JSON.stringify(x.id)}
                  )'
                >
                  Reject
                </button>

              </div>

            `;

          }).join("");

      }

    }


  } catch (e) {

    console.error(
      "Admin load failed:",
      e
    );


    const message =
      esc(
        e.message ||
        "Unable to load admin data."
      );


    [
      "usersTable",
      "requests",
      "appsTable"
    ].forEach(id => {

      if ($(id)) {

        $(id).innerHTML = `

          <p
            style="
              color:#c92a2a;
              font-weight:800;
            "
          >
            ❌ ${message}
          </p>

        `;

      }

    });

  }

}


/* =========================
   EDIT USER
========================= */

window.editUser =
async (
  uid,
  currentName
) => {

  try {

    const name =
      prompt(
        "User name:",
        currentName || ""
      );


    if (name === null) {
      return;
    }


    await updateDoc(
      doc(
        db,
        "users",
        uid
      ),
      {
        name:
          name.trim(),
        updatedAt:
          serverTimestamp()
      }
    );


    alert(
      "✅ User updated."
    );


    await load();


  } catch (e) {

    console.error(e);

    alert(
      "❌ Update failed: " +
      e.message
    );

  }

};


/* =========================
   BLOCK / UNBLOCK USER
========================= */

window.toggleBlock =
async (
  uid,
  blocked
) => {

  try {

    await updateDoc(
      doc(
        db,
        "users",
        uid
      ),
      {
        blocked:
          !blocked,
        updatedAt:
          serverTimestamp()
      }
    );


    await load();


  } catch (e) {

    console.error(e);

    alert(
      "❌ Block/Unblock failed: " +
      e.message
    );

  }

};


/* =========================
   DELETE USER
========================= */

window.deleteUserData =
async uid => {

  if (
    !confirm(
      "Delete this user's Firestore profile, usage, requests and app history?"
    )
  ) {

    return;

  }


  try {

    /* USER */

    try {

      await deleteDoc(
        doc(
          db,
          "users",
          uid
        )
      );

    } catch (e) {

      console.warn(
        "User delete:",
        e
      );

    }


    /* USAGE */

    try {

      await deleteDoc(
        doc(
          db,
          "usage",
          uid
        )
      );

    } catch (e) {

      console.warn(
        "Usage delete:",
        e
      );

    }


    /* REQUEST */

    try {

      await deleteDoc(
        doc(
          db,
          "adminRequests",
          uid
        )
      );

    } catch (e) {

      console.warn(
        "Request delete:",
        e
      );

    }


    /* APP HISTORY */

    const apps =
      await getDocs(
        query(
          collection(
            db,
            "appHistory"
          ),
          where(
            "uid",
            "==",
            uid
          )
        )
      );


    await Promise.all(
      apps.docs.map(
        x =>
          deleteDoc(x.ref)
      )
    );


    alert(
      "✅ User data deleted."
    );


    await load();


  } catch (e) {

    console.error(e);

    alert(
      "❌ Delete failed: " +
      e.message
    );

  }

};


/* =========================
   DELETE APP
========================= */

window.deleteApp =
async id => {

  if (
    !confirm(
      "क्या आप इस App को permanently delete करना चाहते हैं?"
    )
  ) {

    return;

  }


  try {

    await deleteDoc(
      doc(
        db,
        "appHistory",
        id
      )
    );


    alert(
      "✅ App successfully deleted."
    );


    await load();


  } catch (e) {

    console.error(e);

    alert(
      "❌ Delete failed: " +
      e.message
    );

  }

};


/* =========================
   APPROVE REQUEST
========================= */

window.approve =
async (
  requestId,
  extra
) => {

  try {

    const requestRef =
      doc(
        db,
        "adminRequests",
        requestId
      );


    const usageRef =
      doc(
        db,
        "usage",
        requestId
      );


    await runTransaction(
      db,
      async tx => {

        const usageSnap =
          await tx.get(
            usageRef
          );


        const d =
          usageSnap.exists()
          ?
          usageSnap.data()
          :
          {
            count: 0,
            extra: 0
          };


        tx.set(
          usageRef,
          {
            uid:
              requestId,

            count:
              Number(
                d.count || 0
              ),

            extra:
              Number(
                d.extra || 0
              ) + Number(extra || 0),

            updatedAt:
              serverTimestamp()

          },
          {
            merge: true
          }
        );


        tx.update(
          requestRef,
          {
            status:
              "approved",

            approvedAt:
              serverTimestamp(),

            updatedAt:
              serverTimestamp()
          }
        );

      }
    );


    alert(
      "✅ Request approved."
    );


    await load();


  } catch (e) {

    console.error(e);

    alert(
      "❌ Approve failed: " +
      e.message
    );

  }

};


/* =========================
   REJECT REQUEST
========================= */

window.reject =
async requestId => {

  try {

    await updateDoc(
      doc(
        db,
        "adminRequests",
        requestId
      ),
      {
        status:
          "rejected",

        updatedAt:
          serverTimestamp()
      }
    );


    alert(
      "✅ Request rejected."
    );


    await load();


  } catch (e) {

    console.error(e);

    alert(
      "❌ Reject failed: " +
      e.message
    );

  }

};


/* =========================
   ADMIN AUTH
========================= */

onAuthStateChanged(
  auth,
  async user => {

    if (!user) {

      location.href =
        "admin-login.html";

      return;

    }


    const email =
      String(
        user.email || ""
      )
      .trim()
      .toLowerCase();


    if (
      email !==
      ADMIN_EMAIL.toLowerCase()
    ) {

      alert(
        "❌ Admin access denied."
      );

      location.href =
        "index.html";

      return;

    }


    /* LOAD ADMIN PANEL */

    await load();

  }
);
