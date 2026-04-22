/**
 * @file Student/admin sign-up logic. Handles email-based account creation,
 * validates NSD domain emails, determines user role from email domain, and
 * writes the new user record to Firestore before redirecting to the
 * appropriate dashboard.
 */

import {
    db, auth, provider, signInWithPopup, createUserWithEmailAndPassword, signOut,
    doc, getDoc, setDoc, collection, addDoc, updateDoc, deleteDoc,
    deleteField, storage, ref, uploadBytes, getDownloadURL, updateProfile
} from './firebaseModule.js';





/**
 * @type {import('firebase/auth').User|undefined}
 * The currently authenticated Firebase user.
 */
let user;
/**
 * @type {string|undefined}
 * Role of the current user. Either "Student" or "Admin".
 */
let user_status;
//const signInGoogleButton = document.getElementById("google-auth sign-in");
const signInEmailButton = document.getElementById("email-sign-up")





/*
const userGoogleSignIn = async () => {
    signInWithPopup(auth, provider)
        .then((result) => {
            console.log("in result")
            user = result.user;
            console.log(user);
            //signInButton.style.display = "none";
            AddUser();
            if(user_status == "Student"){
              window.location.href = "dashboard.html";
            // ...
          }
            else{
              window.location.href = "admin-dashboard.html"
            }
        }).catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
        })
}*/

/**
 * Reads email, password, confirm-password, and fullname from the DOM, validates
 * that the passwords match and that the email belongs to an NSD domain, then
 * creates a new Firebase Auth account. On success, sets the user's display name,
 * calls AddUser, and redirects to the appropriate dashboard based on user_status.
 * Shows an error notification for any validation or Firebase failure.
 * @async
 * @returns {Promise<void>}
 */
const userEmailSignIn = async () => {
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;
    var confirm_pass = document.getElementById("confirm-password").value; 
    var name = document.getElementById("fullname").value; 

    if(password != confirm_pass){
      showNotif("Passwords must match.", "error")
      return; 
    }
    if (!email.includes("@apps.nsd.org") && !email.includes("@nsd.org")) {
      showNotif("Email must be tied to North Creek High School", "error");
      return;
  }

  createUserWithEmailAndPassword(auth, email, password)
  .then(async (userCredential) => {
    // Signed up
    user = userCredential.user;
    await updateProfile(user, {
      displayName: name
    });
    const success = await AddUser(name)
    if(!success){
      return; 
    }

    if(user_status == "Student"){
      localStorage.setItem("user_identity", "student")
      window.location.href = "dashboard.html";
  }
    else if (user_status == "Admin"){
      localStorage.setItem("user_identity", "admin")
      window.location.href = "admin-dashboard.html"
    }
    else{
      return; 
    }
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    showNotif(errorMessage, "error");
  });
}






//signInGoogleButton.addEventListener('click', userGoogleSignIn)
signInEmailButton.addEventListener('click', (e) => {
  e.preventDefault(); 
  userEmailSignIn();
}); 

/**
 * Creates a new Firestore document in "User_Data" for the currently authenticated user,
 * keyed by their email address. Determines user_status ("Student" or "Admin") based
 * on the email domain (@apps.nsd.org vs @nsd.org).
 * @async
 * @param {string} name - The user's full name to store in Firestore.
 * @returns {Promise<boolean>} Resolves to true if the document was written successfully,
 *     or false if no authenticated user is present.
 */
async function AddUser(name) {
    if (!user) {
        console.log("no user ")
        return false; 
    }

    if (auth.currentUser.email.includes("@apps.nsd.org")){
      user_status = "Student"
    }
    else if (auth.currentUser.email.includes("@nsd.org")){
      user_status = "Admin"
    }
    var ref = doc(db, "User_Data", user.email);
    await setDoc(
      ref, {
      items_posted: 0,
      status: user_status,
      full_name:name
    }); 
    return true; 
}

