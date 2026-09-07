```javascript
import { auth, db, storage } from "./firebase-config.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-storage.js";


/* =========================
   HELPERS
========================= */

const $ = (selector) => document.querySelector(selector);

const appForm = $("#appForm");
const saveBtn = $("#saveBtn");
const previewBtn = $("#previewBtn");
const logoutBtn = $("#logoutBtn");
const message = $("#message");

const id = new URLSearchParams(window.location.search).get("id");

let user = null;


/* =========================
   MESSAGE
========================= */

function showMessage(text, type = "error") {
  if (!message) return;

  message.hidden = false;
  message.className = `message ${type}`;
  message.textContent = text;
}


/* =========================
   LOGOUT
========================= */

logoutBtn?.addEventListener("click", async () => {
  try {
    await signOut(auth);
    window.location.href = "./login.html";
  } catch (error) {
    showMessage(error.message || "Logout failed.");
  }
});


/* =========================
   AUTH
========================= */

onAuthStateChanged(auth, async (currentUser) => {

  if (!currentUser) {
    window.location.href = "./login.html";
    return;
  }

  user = currentUser;

  if (id) {
    await loadEditApp(user.uid);
  }

});


/* =========================
   LOAD EDIT APP
========================= */

async function loadEditApp(uid) {

  try {

    const appRef = doc(db, "apps", id);

    const snapshot = await getDoc(appRef);

    if (!snapshot.exists()) {

      showMessage("App not found.");

      return;
    }

    const app = snapshot.data();

    if (app.userId !== uid) {

      showMessage("You do not have permission to edit this app.");

      return;
    }


    /* Page title */

    if ($("#pageTitle")) {
      $("#pageTitle").textContent = "Edit App";
    }


    /* Form values */

    if ($("#appName")) {
      $("#appName").value = app.appName || "";
    }

    if ($("#websiteUrl")) {
      $("#websiteUrl").value = app.websiteUrl || "";
    }

    if ($("#packageName")) {
      $("#packageName").value = app.packageName || "";
    }

    if ($("#version")) {
      $("#version").value = app.version || "1.0.0";
    }

    if ($("#theme")) {
      $("#theme").value = app.theme || "light";
    }

  } catch (error) {

    console.error("Load app error:", error);

    showMessage(
      error.message || "Could not load app."
    );

  }

}


/* =========================
   SAVE APP
========================= */

appForm?.addEventListener("submit", async (event) => {

  event.preventDefault();

  if (!user) {

    showMessage("Please login first.");

    return;
  }


  /* Button */

  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";
  }


  try {

    /* =========================
       READ FORM
    ========================= */

    const appName =
      $("#appName")?.value.trim() || "";

    const websiteUrl =
      $("#websiteUrl")?.value.trim() || "";

    const packageName =
      $("#packageName")?.value.trim() || "";

    const version =
      $("#version")?.value.trim() || "1.0.0";

    const theme =
      $("#theme")?.value || "light";


    /* =========================
       VALIDATION
    ========================= */

    if (!appName) {
      throw new Error("Please enter App Name.");
    }

    if (!websiteUrl) {
      throw new Error("Please enter Website URL.");
    }

    try {
      new URL(websiteUrl);
    } catch {
      throw new Error(
        "Please enter a valid Website URL. Example: https://example.com"
      );
    }

    if (!packageName) {
      throw new Error("Please enter Package Name.");
    }

    if (!/^[a-z][a-z0-9]*(\.[a-z0-9]+)+$/.test(packageName)) {
      throw new Error(
        "Invalid Package Name. Example: com.greatindia.myapp"
      );
    }


    /* =========================
       BASIC APP DATA
    ========================= */

    const appData = {

      userId: user.uid,

      appName: appName,

      websiteUrl: websiteUrl,

      packageName: packageName,

      version: version,

      theme: theme,

      status: "draft",

      updatedAt: serverTimestamp()

    };


    /* =========================
       SAVE FIRESTORE FIRST
    ========================= */

    let appRef;

    if (id) {

      /* EDIT */

      appRef = doc(db, "apps", id);

      await updateDoc(
        appRef,
        appData
      );

    } else {

      /* NEW APP */

      appData.createdAt =
        serverTimestamp();

      appRef =
        await addDoc(
          collection(db, "apps"),
          appData
        );
    }


    /* =========================
       FILES
    ========================= */

    const logoFile =
      $("#logoFile")?.files?.[0] || null;

    const iconFile =
      $("#iconFile")?.files?.[0] || null;


    /*
       IMPORTANT:

       Firestore is already saved.

       Therefore if no files are selected,
       finish immediately.
    */

    if (!logoFile && !iconFile) {

      window.location.href =
        "./my-apps.html";

      return;
    }


    /* =========================
       UPLOAD MESSAGE
    ========================= */

    showMessage(
      "App saved. Uploading files...",
      "success"
    );


    /* =========================
       UPLOAD LOGO + ICON
       IN PARALLEL
    ========================= */

    const uploadJobs = [];


    /* LOGO */

    if (logoFile) {

      const logoPath =
        `logos/${user.uid}/${Date.now()}-${logoFile.name}`;

      const logoRef =
        ref(storage, logoPath);

      const logoJob =
        uploadBytes(
          logoRef,
          logoFile
        )
        .then(() =>
          getDownloadURL(logoRef)
        )
        .then((url) => ({
          logoUrl: url
        }));

      uploadJobs.push(logoJob);
    }


    /* ICON */

    if (iconFile) {

      const iconPath =
        `icons/${user.uid}/${Date.now()}-${iconFile.name}`;

      const iconRef =
        ref(storage, iconPath);

      const iconJob =
        uploadBytes(
          iconRef,
          iconFile
        )
        .then(() =>
          getDownloadURL(iconRef)
        )
        .then((url) => ({
          iconUrl: url
        }));

      uploadJobs.push(iconJob);
    }


    /* =========================
       WAIT FOR ALL UPLOADS
    ========================= */

    const uploadedFiles =
      await Promise.all(uploadJobs);


    /* =========================
       COMBINE URLS
    ========================= */

    const fileData =
      Object.assign(
        {},
        ...uploadedFiles
      );


    /* =========================
       UPDATE FIRESTORE
    ========================= */

    await updateDoc(
      appRef,
      {
        ...fileData,

        updatedAt:
          serverTimestamp()
      }
    );


    /* =========================
       FINISHED
    ========================= */

    window.location.href =
      "./my-apps.html";


  } catch (error) {

    console.error(
      "Save App Error:",
      error
    );

    showMessage(
      error.message ||
      "Could not save app."
    );

  } finally {

    if (saveBtn) {

      saveBtn.disabled = false;

      saveBtn.textContent =
        "Save App";
    }

  }

});


/* =========================
   PREVIEW
========================= */

previewBtn?.addEventListener(
  "click",
  () => {

    try {

      const appName =
        $("#appName")?.value || "";

      const websiteUrl =
        $("#websiteUrl")?.value || "";

      const packageName =
        $("#packageName")?.value || "";

      const version =
        $("#version")?.value || "";


      alert(
        `App: ${appName}\n` +
        `Website: ${websiteUrl}\n` +
        `Package: ${packageName}\n` +
        `Version: ${version}`
      );

    } catch (error) {

      console.error(
        "Preview error:",
        error
      );

    }

  }
);
```
