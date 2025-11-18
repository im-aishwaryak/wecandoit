import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword, 
  signOut 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getFirestore,
  collection, doc, addDoc, setDoc, getDoc, getDocs, updateDoc, query, where 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import {
  getStorage,
  ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

export const app = initializeApp({  // firebaseConfig variable 
    apiKey: "AIzaSyAmPrbc_SVQdR1FSmGUWIIM6wpE4wxeQ8A",
    authDomain: "schoollostfound.firebaseapp.com",
    projectId: "schoollostfound",
    storageBucket: "schoollostfound.firebasestorage.app",
    messagingSenderId: "700442185236",
    appId: "1:700442185236:web:cc4d9621d6f44c726a6101",
    measurementId: "G-J1JJE80WKK"
});

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Hashing for security questions
export async function hashAnswer(answer) {
    const encoder = new TextEncoder();
    const data = encoder.encode(answer.trim().toLowerCase());
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}
