import{initializeApp}from"https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import{getAuth}from"https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import{getFirestore}from"https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
const firebaseConfig={apiKey:"AIzaSyCeI6dOKnC2zbt8QD8WQfERLkNYnGuf11g",authDomain:"great-india-app-builder.firebaseapp.com",projectId:"great-india-app-builder",storageBucket:"great-india-app-builder.firebasestorage.app",messagingSenderId:"795673427755",appId:"1:795673427755:web:0563a68216007e02834f6e",measurementId:"G-NZZSMXN356"};
const app=initializeApp(firebaseConfig);export const auth=getAuth(app);export const db=getFirestore(app);export default app;