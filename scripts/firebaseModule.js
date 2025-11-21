// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";


import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

import {
    getFirestore, doc, getDoc, setDoc, query, where, collection, addDoc, updateDoc, increment, deleteDoc, deleteField, getDocs, onSnapshot
}
    from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-storage.js";
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB0-zKGjr3Qf7sswyDrswarFOQ2pgbuylc",
  authDomain: "boomerang-2fa9a.firebaseapp.com",
  projectId: "boomerang-2fa9a",
  storageBucket: "boomerang-2fa9a.firebasestorage.app",
  messagingSenderId: "634137468033",
  appId: "1:634137468033:web:46871a68f9d97734e1c180",
  measurementId: "G-F2CD66RB6K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const provider = new GoogleAuthProvider();
//provider.addScope('https://www.googleapis.com/auth/contacts.readonly');

const auth = getAuth();
auth.languageCode = 'it';

const db = getFirestore();
const storage = getStorage(); 

export{app, db, auth, provider, signInWithPopup, signOut,createUserWithEmailAndPassword, signInWithEmailAndPassword, 
     doc, getDoc, setDoc, collection, addDoc, updateDoc, deleteDoc, deleteField, getDocs, onSnapshot,
    storage, ref, uploadBytes, getDownloadURL, query, where, increment, onAuthStateChanged}


// ---------------------------
// FUNCTIONS YOU EXPORT
// ---------------------------

// Get all documents from Item_Data collection
export async function getAllItems() {
  // NOTE: use the exact collection name from your console
  const ref = collection(db, "Item_Data");
  const snap = await getDocs(ref);

  // Map docs to plain objects
  return snap.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));
}

// Real-time listener (optional)
export function listenToItems(callback) {
  return onSnapshot(collection(db, "Item_Data"), snap => {
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(items);
  });
}

// Get single document by id (optional)
export async function getItemById(id) {
  const docRef = doc(db, "Item_Data", id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() };
}
