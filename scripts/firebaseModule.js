/**
 * @file firebaseModule.js
 * @description
 * Centralized Firebase configuration and utility module.
 *
 * This module initializes Firebase services and exports
 * commonly used Firebase functions for use across the
 * Lost & Found system.
 *
 * Services initialized:
 * - Firebase Authentication
 * - Firestore Database
 * - Firebase Storage
 *
 * This module also provides helper functions for:
 * - Retrieving all items
 * - Listening to item updates in real time
 * - Fetching single item records
 *
 * Firebase collections used:
 * - Item_Data
 * - User_Data
 * - Claims
 *
 * Usage:
 * Import required Firebase utilities from this module
 * instead of importing directly from Firebase SDK files.
 *
 * @author Aadhya Goyal, Aanya Rawal, Aishwarya Kumaran
 * @version 1.0
 */



// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";


import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

import {
    getFirestore, doc, getDoc, setDoc, query, where, collection, addDoc, updateDoc, increment, deleteDoc, deleteField, getDocs, onSnapshot
}
    from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-storage.js";
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional


/**
 * Firebase project configuration settings.
 *
 * Contains credentials required to connect
 * to the Firebase backend services.
 *
 * @type {Object}
 * @property {string} apiKey
 * @property {string} authDomain
 * @property {string} projectId
 * @property {string} storageBucket
 * @property {string} messagingSenderId
 * @property {string} appId
 * @property {string} measurementId
 */
const firebaseConfig = {
  apiKey: "AIzaSyB0-zKGjr3Qf7sswyDrswarFOQ2pgbuylc",
  authDomain: "boomerang-2fa9a.firebaseapp.com",
  projectId: "boomerang-2fa9a",
  storageBucket: "boomerang-2fa9a.firebasestorage.app",
  messagingSenderId: "634137468033",
  appId: "1:634137468033:web:46871a68f9d97734e1c180",
  measurementId: "G-F2CD66RB6K"
};

/**
 * Firebase application instance.
 *
 * Initializes Firebase using project configuration.
 *
 * @type {import("firebase/app").FirebaseApp}
 */
const app = initializeApp(firebaseConfig);


/**
 * Google authentication provider.
 *
 * Used for Google sign-in functionality.
 *
 * @type {GoogleAuthProvider}
 */
const provider = new GoogleAuthProvider();
//provider.addScope('https://www.googleapis.com/auth/contacts.readonly');




/**
 * Firebase Authentication instance.
 *
 * Handles user authentication including:
 * - Email/password login
 * - Google sign-in
 * - User session management
 *
 * @type {import("firebase/auth").Auth}
 */
const auth = getAuth();
auth.languageCode = 'it';



/**
 * Firestore database instance.
 *
 * Provides access to all Firestore collections.
 *
 * @type {import("firebase/firestore").Firestore}
 */
const db = getFirestore();

/**
 * Firebase Storage instance.
 *
 * Used for uploading and retrieving item images.
 *
 * @type {import("firebase/storage").FirebaseStorage}
 */
const storage = getStorage(); 



/**
 * Exported Firebase utilities.
 *
 * These functions are re-exported so that
 * other modules can import Firebase functionality
 * from a single centralized location.
 *
 * Includes:
 * - Authentication functions
 * - Firestore document operations
 * - Storage utilities
 */
export{app, db, auth, provider, signInWithPopup, signOut,createUserWithEmailAndPassword, signInWithEmailAndPassword, 
     doc, getDoc, setDoc, collection, addDoc, updateDoc, deleteDoc, deleteField, getDocs, onSnapshot,
    storage, ref, uploadBytes, getDownloadURL, query, where, increment, updateProfile}


// ---------------------------
// FUNCTIONS YOU EXPORT
// ---------------------------


/**
 * Retrieves all items from the Item_Data collection.
 *
 * Converts Firestore documents into plain
 * JavaScript objects with IDs included.
 *
 * @async
 * @function getAllItems
 *
 * @returns {Promise<ItemData[]>}
 * Resolves to an array of item objects.
 */
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

/**
 * Creates a real-time listener for item updates.
 *
 * Executes callback whenever changes occur
 * in the Item_Data collection.
 *
 * @function listenToItems
 *
 * @param {ItemsListenerCallback} callback
 * Function executed when items update.
 *
 * @returns {Function}
 * Unsubscribe function to stop listening.
 */
export function listenToItems(callback) {
  return onSnapshot(collection(db, "Item_Data"), snap => {
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(items);
  });
}


/**
 * Retrieves a single item by document ID.
 *
 * Returns null if item does not exist.
 *
 * @async
 * @function getItemById
 *
 * @param {string} id
 * Firestore document ID.
 *
 * @returns {Promise<ItemData|null>}
 * Item object or null if not found.
 */
export async function getItemById(id) {
  const docRef = doc(db, "Item_Data", id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() };
}
