import { auth, db } from "./firebase-config.js";

import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
  updateProfile
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


function getFriendlyError(error){

  const code = error?.code || "";

  const errors = {

    "auth/invalid-credential":
      "Invalid email or password.",

    "auth/invalid-email":
      "Invalid email address.",

    "auth/user-not-found":
      "No account found with this email.",

    "auth/wrong-password":
      "Invalid email or password.",

    "auth/email-already-in-use":
      "This email is already registered.",

    "auth/weak-password":
      "Password must contain at least 6 characters.",

    "auth/too-many-requests":
      "Too many attempts. Please try again later.",

    "auth/network-request-failed":
      "Network error. Please check your internet connection.",

    "auth/operation-not-allowed":
      "Email/password login is not enabled in Firebase.",

    "auth/user-disabled":
      "This account has been disabled."

  };

  return errors[code] ||
    error?.message ||
    "Something went wrong.";
}


/* LOGIN */

async function loginUser(email, password){

  if(!email){
    throw new Error("Enter your email.");
  }

  if(!password){
    throw new Error("Enter your password.");
  }

  const result = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );

  return result.user;
}


/* PASSWORD RESET */

async function resetPassword(email){

  if(!email){
    throw new Error("Enter your email first.");
  }

  await sendPasswordResetEmail(
    auth,
    email
  );

  return true;
}


/* REGISTER */

async function registerUser(name, email, password){

  if(!name){
    throw new Error("Enter your name.");
  }

  if(!email){
    throw new Error("Enter your email.");
  }

  if(password.length < 6){
    throw new Error(
      "Password must contain at least 6 characters."
    );
  }

  const result =
    await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

  await updateProfile(
    result.user,
    {
      displayName: name
    }
  );

  await setDoc(
    doc(db, "users", result.user.uid),
    {
      uid: result.user.uid,
      name: name,
      email: email,
      createdAt: serverTimestamp()
    }
  );

  return result.user;
}


export {
  loginUser,
  resetPassword,
  registerUser,
  getFriendlyError
};
