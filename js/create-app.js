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


const $ = (selector) => document.querySelector(selector);

const form = $("#appForm");
const saveButton = $("#saveBtn");
const messageBox = $("#message");

const appId =
  new URLSearchParams(window.location.search).get("id");

let currentUser = null;


/* =========================
   MESSAGE
========================= */

function showMessage(text, type) {
  if (!messageBox) return;

  messageBox.hidden = false;
  messageBox.className =
    type === "success"
      ? "message success"
      : "message error";

  messageBox.textContent = text;
}


/* =========================
   LOGOUT
========================= */

const logoutButton = $("#logoutBtn");

if (logoutButton) {
  logoutButton.addEventListener("click", async function () {

    try {
      await signOut(auth);
      window.location.href = "./login.html";

    } catch (error) {
      showMessage(error.message, "error");
    }

  });
}


/* =========================
   LOGIN CHECK
========================= */

onAuthStateChanged(auth, async function (user) {

  if (!user) {
    window.location.href = "./login.html";
    return;
  }

  currentUser = user;

  if (appId) {
    await loadApp(appId, user.uid);
  }

});


/* =========================
   LOAD APP FOR EDIT
========================= */

async function loadApp(id, uid) {

  try {

    const appReference =
      doc(db, "apps", id);

    const snapshot =
      await getDoc(appReference);

    if (!snapshot.exists()) {
      showMessage("App not found.", "error");
      return;
    }

    const data = snapshot.data();

    if (data.userId !== uid) {
      showMessage(
        "You do not have permission to edit this app.",
        "error"
      );
      return;
    }

    if ($("#pageTitle")) {
      $("#pageTitle").textContent = "Edit App";
    }

    if ($("#appName")) {
      $("#appName").value = data.appName || "";
    }

    if ($("#websiteUrl")) {
      $("#websiteUrl").value = data.websiteUrl || "";
    }

    if ($("#packageName")) {
      $("#packageName").value = data.packageName || "";
    }

    if ($("#version")) {
      $("#version").value =
        data.version || "1.0.0";
    }

    if ($("#theme")) {
      $("#theme").value =
        data.theme || "light";
    }

  } catch (error) {

    console.error(error);

    showMessage(
      error.message || "Could not load app.",
      "error"
    );

  }

}


/* =========================
   SAVE
========================= */

if (form) {

  form.addEventListener("submit", async function (event) {

    event.preventDefault();

    if (!currentUser) {
      showMessage(
        "Please login first.",
        "error"
      );
      return;
    }

    if (saveButton) {
      saveButton.disabled = true;
      saveButton.textContent = "Saving...";
    }

    try {

      /* FORM VALUES */

      const appName =
        $("#appName").value.trim();

      const websiteUrl =
        $("#websiteUrl").value.trim();

      const packageName =
        $("#packageName").value.trim();

      const version =
        $("#version").value.trim() || "1.0.0";

      const theme =
        $("#theme").value || "light";


      /* VALIDATION */

      if (!appName) {
        throw new Error("Please enter App Name.");
      }

      if (!websiteUrl) {
        throw new Error("Please enter Website URL.");
      }

      try {
        new URL(websiteUrl);
      } catch (error) {
        throw new Error(
          "Please enter a valid Website URL."
        );
      }

      if (!packageName) {
        throw new Error("Please enter Package Name.");
      }


      /* =========================
         SAVE DATA
      ========================= */

      const appData = {
        userId: currentUser.uid,
        appName: appName,
        websiteUrl: websiteUrl,
        packageName: packageName,
        version: version,
        theme: theme,
        status: "draft",
        updatedAt: serverTimestamp()
      };


      let appReference;


      /* NEW APP */

      if (!appId) {

        appData.createdAt =
          serverTimestamp();

        appReference =
          await addDoc(
            collection(db, "apps"),
            appData
          );

      }

      /* EDIT APP */

      else {

        appReference =
          doc(db, "apps", appId);

        await updateDoc(
          appReference,
          appData
        );

      }


      /* =========================
         CHECK FILES
      ========================= */

      const logo =
        $("#logoFile") &&
        $("#logoFile").files.length
          ? $("#logoFile").files[0]
          : null;

      const icon =
        $("#iconFile") &&
        $("#iconFile").files.length
          ? $("#iconFile").files[0]
          : null;


      /* NO FILE */

      if (!logo && !icon) {

        window.location.href =
          "./my-apps.html";

        return;
      }


      /* =========================
         UPLOAD FILES
      ========================= */

      showMessage(
        "App saved. Uploading files...",
        "success"
      );


      const uploadTasks = [];


      /* LOGO */

      if (logo) {

        const logoReference =
          ref(
            storage,
            "logos/" +
            currentUser.uid +
            "/" +
            Date.now() +
            "-" +
            logo.name
          );

        uploadTasks.push(
          uploadBytes(
            logoReference,
            logo
          ).then(async function () {

            const url =
              await getDownloadURL(
                logoReference
              );

            return {
              logoUrl: url
            };

          })
        );

      }


      /* ICON */

      if (icon) {

        const iconReference =
          ref(
            storage,
            "icons/" +
            currentUser.uid +
            "/" +
            Date.now() +
            "-" +
            icon.name
          );

        uploadTasks.push(
          uploadBytes(
            iconReference,
            icon
          ).then(async function () {

            const url =
              await getDownloadURL(
                iconReference
              );

            return {
              iconUrl: url
            };

          })
        );

      }


      /* WAIT FOR UPLOADS */

      const uploaded =
        await Promise.all(uploadTasks);


      /* CREATE FILE DATA */

      const fileData = {};

      uploaded.forEach(function (item) {

        if (item.logoUrl) {
          fileData.logoUrl =
            item.logoUrl;
        }

        if (item.iconUrl) {
          fileData.iconUrl =
            item.iconUrl;
        }

      });


      /* UPDATE URLS */

      await updateDoc(
        appReference,
        {
          ...fileData,
          updatedAt: serverTimestamp()
        }
      );


      /* DONE */

      window.location.href =
        "./my-apps.html";


    } catch (error) {

      console.error(
        "SAVE ERROR:",
        error
      );

      showMessage(
        error.message ||
        "Could not save app.",
        "error"
      );

    } finally {

      if (saveButton) {
        saveButton.disabled = false;
        saveButton.textContent =
          "Save App";
      }

    }

  });

}


/* =========================
   PREVIEW
========================= */

const previewButton =
  $("#previewBtn");

if (previewButton) {

  previewButton.addEventListener(
    "click",
    function () {

      const name =
        $("#appName")?.value || "";

      const website =
        $("#websiteUrl")?.value || "";

      const packageName =
        $("#packageName")?.value || "";

      const version =
        $("#version")?.value || "";

      alert(
        "App: " + name +
        "\nWebsite: " + website +
        "\nPackage: " + packageName +
        "\nVersion: " + version
      );

    }
  );

}
```
