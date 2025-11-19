// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";


import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

import {
    getFirestore, doc, getDoc, setDoc, collection, addDoc, updateDoc, deleteDoc, deleteField
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
     doc, getDoc, setDoc, collection, addDoc, updateDoc, deleteDoc, deleteField,
    storage, ref, uploadBytes, getDownloadURL}



