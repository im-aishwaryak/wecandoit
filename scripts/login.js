/**
 * @file auth.js
 * @description Handles user authentication for the application.
 *
 * Supports:
 * - Google sign-in authentication
 * - Email/password authentication
 * - Automatic role-based routing (Student vs Admin)
 * - User creation in Firestore on first login
 * - Session initialization and sign-out handling
 *
 * Users are stored in Firestore under the "User_Data" collection.
 *
 * @module auth
 * @author Aadhya Goyal, Aanya Rawal, Aishwarya Kumaran
 * @version 1.0
 */





/**
 * Firebase authentication and database utilities imported
 * from the shared firebaseModule.
 *
 * Includes:
 * - Authentication methods (Google + Email)
 * - Firestore operations
 * - Storage utilities
 */
import {
    db, auth, provider, signInWithPopup, signOut,
    doc, getDoc, setDoc, collection, addDoc, updateDoc, deleteDoc,
    deleteField, storage, ref, uploadBytes, getDownloadURL, signInWithEmailAndPassword
} from './firebaseModule.js';



/**
 * Currently authenticated Firebase user.
 *
 * Updated after successful login.
 *
 * @type {Object|null}
 */
let user;

/**
 * Stores the user's role/status.
 *
 * Possible values:
 * - "Student"
 * - "Admin"
 *
 * Used for routing after login.
 *
 * @type {string|undefined}
 */
let user_status;
let user_status;



/**
 * Signs out any existing Firebase session when the page loads.
 *
 * Ensures a clean authentication state before login attempts.
 *
 * @listens signOut
 */
signOut(auth)
  .then(() => {
    console.log("Signed out on page load");
  })
  .catch((e) => console.log(e));



/**
 * Signs out any existing Firebase session when the page loads.
 *
 * Ensures a clean authentication state before login attempts.
 *
 * @listens signOut
 */
const logInGoogleButton = document.getElementById("google-auth btn");


/**
 * Button that triggers email/password login.
 *
 * @type {HTMLElement}
 */
const logInEmailButton = document.getElementById("email log-in")



/**
 * Signs in a user using Google authentication.
 *
 * After successful login:
 * - Stores user session in localStorage
 * - Creates user record in Firestore if needed
 * - Redirects based on user role:
 *   - Student → dashboard.html
 *   - Admin → admin-dashboard.html
 *
 * @async
 * @function userGoogleLogIn
 * @returns {Promise<void>}
 */
const userGoogleLogIn = async () => {
    signInWithPopup(auth, provider)
        .then((result) => {
            console.log("in result")
            user = result.user;
            if(auth.currentUser!= null){
                localStorage.setItem("user_logged_in", true)
                window.location.href = "home.html";
            }
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
}




/**
 * Signs in a user using email and password authentication.
 *
 * After successful login:
 * - Retrieves user role from Firestore
 * - Stores session and identity in localStorage
 * - Redirects based on role:
 *   - Student → dashboard.html
 *   - Admin → admin-dashboard.html
 *
 * @async
 * @function userEmailLogIn
 * @returns {Promise<void>}
 */
const userEmailLogIn = async () => {
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;




  signInWithEmailAndPassword(auth, email, password)
  .then(async (userCredential) => {
    // Signed in
    user = userCredential.user;
    if(auth.currentUser.email != null){
      console.log("omff")
      localStorage.setItem("user_logged_in", true)
     
      var ref = doc(db, "User_Data", user.email)
      const snap = await getDoc(ref);
     
      if (snap.exists()) {
        console.log("wow")
        const data = snap.data();
        user_status = data.status;
      }
   
      if(user_status === "Student"){
        console.log("student !!!")
        localStorage.setItem("user_identity", "student")
        window.location.href = "dashboard.html";
      }
      else{
        console.log("admin !!!")
        localStorage.setItem("user_identity", "admin")
        window.location.href = "admin-dashboard.html";
      }
    }
    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
  });
}





/**
 * Attaches authentication handlers to login buttons.
 *
 * - Google login button triggers userGoogleLogIn
 * - Email login button triggers userEmailLogIn
 */
logInGoogleButton.addEventListener('click', userGoogleLogIn)
logInEmailButton.addEventListener('click', userEmailLogIn)



/**
 * Creates a new user record in Firestore.
 *
 * Called after Google sign-in to ensure
 * the user exists in the database.
 *
 * Assigns user role based on email domain:
 * - @apps.nsd.org → Student
 * - @nsd.org → Admin
 *
 * Initializes user data in "User_Data" collection.
 *
 * @async
 * @function AddUser
 * @returns {Promise<void>}
 */
async function AddUser() {
    if (!user) {
        console.log("no user ")
        return;
    }
    if (auth.currentUser.email.includes("@apps.nsd.org")){
      user_status = "Student"
    }
    else if (auth.currentUser.email.includes("@nsd.org")){
      user_status = "Admin"
    }
    else{
      alert("email must be tied to North Creek High School")
      return;
    }
    var ref = doc(db, "User_Data", user.email);
    await setDoc(
        ref, {
        items_posted: 0,
    })
}