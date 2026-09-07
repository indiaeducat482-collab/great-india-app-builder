import { auth, db, storage } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { collection, addDoc, doc, getDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-storage.js";

const $ = (selector) => document.querySelector(selector);
const form = $("#appForm");
const saveBtn = $("#saveBtn");
const message = $("#message");
const appId = new URLSearchParams(window.location.search).get("id");
let currentUser = null;

function showMessage(text, type = "error") {
  if (!message) return;
  message.hidden = false;
  message.className = "message " + type;
  message.textContent = text;
}

const logoutBtn = $("#logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      window.location.href = "./login.html";
    } catch (error) {
      showMessage(error.message || "Logout failed.");
    }
  });
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "./login.html";
    return;
  }
  currentUser = user;
  if (appId) await loadApp(appId, user.uid);
});

async function loadApp(id, uid) {
  try {
    const snapshot = await getDoc(doc(db, "apps", id));
    if (!snapshot.exists()) {
      showMessage("App not found.");
      return;
    }
    const data = snapshot.data();
    if (data.userId !== uid) {
      showMessage("You do not have permission to edit this app.");
      return;
    }
    if ($("#pageTitle")) $("#pageTitle").textContent = "Edit App";
    if ($("#appName")) $("#appName").value = data.appName || "";
    if ($("#websiteUrl")) $("#websiteUrl").value = data.websiteUrl || "";
    if ($("#packageName")) $("#packageName").value = data.packageName || "";
    if ($("#version")) $("#version").value = data.version || "1.0.0";
    if ($("#theme")) $("#theme").value = data.theme || "light";
  } catch (error) {
    console.error("Load app error:", error);
    showMessage(error.message || "Could not load app.");
  }
}

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!currentUser) {
      showMessage("Please login first.");
      return;
    }

    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = "Saving...";
    }

    try {
      const appName = $("#appName").value.trim();
      const websiteUrl = $("#websiteUrl").value.trim();
      const packageName = $("#packageName").value.trim();
      const version = $("#version").value.trim() || "1.0.0";
      const theme = $("#theme").value || "light";

      if (!appName) throw new Error("Please enter App Name.");
      if (!websiteUrl) throw new Error("Please enter Website URL.");
      try {
        new URL(websiteUrl);
      } catch (_) {
        throw new Error("Please enter a valid Website URL.");
      }
      if (!packageName) throw new Error("Please enter Package Name.");

      const appData = {
        userId: currentUser.uid,
        appName,
        websiteUrl,
        packageName,
        version,
        theme,
        status: "draft",
        updatedAt: serverTimestamp()
      };

      let appRef;
      if (appId) {
        appRef = doc(db, "apps", appId);
        await updateDoc(appRef, appData);
      } else {
        appData.createdAt = serverTimestamp();
        appRef = await addDoc(collection(db, "apps"), appData);
      }

      const logoInput = $("#logoFile");
      const iconInput = $("#iconFile");
      const logoFile = logoInput && logoInput.files.length ? logoInput.files[0] : null;
      const iconFile = iconInput && iconInput.files.length ? iconInput.files[0] : null;

      if (!logoFile && !iconFile) {
        window.location.href = "./my-apps.html";
        return;
      }

      showMessage("App saved. Uploading files...", "success");

      const tasks = [];

      if (logoFile) {
        const logoRef = ref(storage, "logos/" + currentUser.uid + "/" + Date.now() + "-" + logoFile.name);
        tasks.push(
          uploadBytes(logoRef, logoFile).then(() => getDownloadURL(logoRef)).then((url) => ({ logoUrl: url }))
        );
      }

      if (iconFile) {
        const iconRef = ref(storage, "icons/" + currentUser.uid + "/" + Date.now() + "-" + iconFile.name);
        tasks.push(
          uploadBytes(iconRef, iconFile).then(() => getDownloadURL(iconRef)).then((url) => ({ iconUrl: url }))
        );
      }

      const results = await Promise.all(tasks);
      const fileData = {};
      results.forEach((item) => Object.assign(fileData, item));

      await updateDoc(appRef, {
        ...fileData,
        updatedAt: serverTimestamp()
      });

      window.location.href = "./my-apps.html";
    } catch (error) {
      console.error("Save App Error:", error);
      showMessage(error.message || "Could not save app.");
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.textContent = "Save App";
      }
    }
  });
}

const previewBtn = $("#previewBtn");
if (previewBtn) {
  previewBtn.addEventListener("click", () => {
    const name = $("#appName") ? $("#appName").value : "";
    const website = $("#websiteUrl") ? $("#websiteUrl").value : "";
    const packageName = $("#packageName") ? $("#packageName").value : "";
    const version = $("#version") ? $("#version").value : "";
    alert("App: " + name + "\nWebsite: " + website + "\nPackage: " + packageName + "\nVersion: " + version);
  });
}
