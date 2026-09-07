import { auth, db } from "./firebase-config.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const $ = (s) => document.querySelector(s);

const msg = (text, type = "error") => {
  const e = $("#message");

  if (e) {
    e.textContent = text;
    e.className = "message " + type;
    e.hidden = false;
  }
};

/* Show / Hide Password */
document.querySelectorAll(".toggle-pass").forEach((button) => {
  button.onclick = () => {
    const input = $("#" + button.dataset.target);

    if (!input) return;

    input.type =
      input.type === "password"
        ? "text"
        : "password";

    button.textContent =
      input.type === "password"
        ? "Show"
        : "Hide";
  };
});

/* LOGIN */
const loginForm = $("#loginForm");

if (loginForm) {
  loginForm.onsubmit = async (e) => {
    e.preventDefault();

    const button = $("#loginBtn");

    button.disabled = true;
    button.textContent = "Logging in…";

    try {
      const email = $("#email").value.trim();
      const password = $("#password").value;

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      location.href = "./dashboard.html";

    } catch (error) {

      msg(firebaseError(error));

      button.disabled = false;
      button.textContent = "Login";
    }
  };
}

/* REGISTER */
const registerForm = $("#registerForm");

if (registerForm) {

  registerForm.onsubmit = async (e) => {

    e.preventDefault();

    const password = $("#password").value;
    const confirmPassword = $("#confirmPassword").value;

    if (password !== confirmPassword) {
      msg("Passwords do not match.");
      return;
    }

    const button = $("#registerBtn");

    button.disabled = true;
    button.textContent = "Creating…";

    try {

      const fullName = $("#fullName").value.trim();
      const email = $("#email").value.trim();

      const credential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

      await updateProfile(
        credential.user,
        {
          displayName: fullName
        }
      );

      await setDoc(
        doc(db, "users", credential.user.uid),
        {
          uid: credential.user.uid,
          fullName: fullName,
          email: credential.user.email,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
      );

      location.href = "./dashboard.html";

    } catch (error) {

      msg(firebaseError(error));

      button.disabled = false;
      button.textContent = "Create Account";
    }
  };
}

/* FORGOT PASSWORD */
const forgotButton = $("#forgotBtn");

if (forgotButton) {

  forgotButton.addEventListener(
    "click",
    async () => {

      const email = $("#email")?.value.trim();

      if (!email) {
        msg("Enter your email first.");
        return;
      }

      try {

        await sendPasswordResetEmail(
          auth,
          email
        );

        msg(
          "Password reset email sent.",
          "success"
        );

      } catch (error) {

        msg(firebaseError(error));
      }
    }
  );
}

/* FIREBASE ERROR */
function firebaseError(error) {

  const messages = {

    "auth/invalid-credential":
      "Invalid email or password.",

    "auth/invalid-email":
      "Invalid email address.",

    "auth/user-not-found":
      "Invalid email or password.",

    "auth/wrong-password":
      "Invalid email or password.",

    "auth/email-already-in-use":
      "Email is already registered.",

    "auth/weak-password":
      "Password must be at least 6 characters.",

    "auth/too-many-requests":
      "Too many attempts. Please try again later."
  };

  return (
    messages[error.code] ||
    error.message ||
    "Something went wrong."
  );
}

/* AUTH STATE */
onAuthStateChanged(auth, (user) => {

  if (
    user &&
    location.pathname.endsWith("/login.html")
  ) {
    // Login successful
  }

});
