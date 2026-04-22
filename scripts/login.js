/**
 * @file login.js
 * @description
 * Handles user authentication for the Lost & Found system.
 *
 * Supports:
 * - Email/password login
 * - Role-based routing (Student vs Admin)
 * - User identity storage using localStorage
 * - Retrieval of user status from Firestore
 *
 * After successful login:
 * - Students → dashboard.html
 * - Admins → admin-dashboard.html
 *
 * Firebase collections used:
 * - User_Data
 *
 * Dependencies:
 * - firebaseModule.js
 *
 * @author Aadhya Goyal, Aanya Rawal, Aishwarya Kumaran
 * @version 1.0
 */



import {
    db, auth, provider, signInWithPopup, signOut,
    doc, getDoc, setDoc, collection, addDoc, updateDoc, deleteDoc,
    deleteField, storage, ref, uploadBytes, getDownloadURL, signInWithEmailAndPassword
} from './firebaseModule.js';



/**
 * Currently authenticated Firebase user.
 *
 * Set after successful login.
 *
 * @type {import("firebase/auth").User|null}
 */
let user;

/**
 * Stores the role of the logged-in user.
 *
 * Possible values:
 * - "Student"
 * - "Admin"
 *
 * Retrieved from Firestore.
 *
 * @type {string}
 */
let user_status;



/**
 * Signs out any existing session when login page loads.
 *
 * Ensures users always start from a clean
 * authentication state.
 */
signOut(auth)
  .then(() => {
    console.log("Signed out on page load");
  })
  .catch((e) => console.log(e));




//const logInGoogleButton = document.getElementById("google-auth btn");
/**
 * Email login button element.
 *
 * Triggers email/password authentication.
 *
 * @type {HTMLElement}
 */
const logInEmailButton = document.getElementById("email log-in")



/*
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
}*/

/**
 * Authenticates user using email and password.
 *
 * Workflow:
 * 1. Retrieve email/password input
 * 2. Authenticate with Firebase
 * 3. Fetch user role from Firestore
 * 4. Store login state in localStorage
 * 5. Redirect to appropriate dashboard
 *
 * Role Routing:
 * - Student → dashboard.html
 * - Admin → admin-dashboard.html
 *
 * Error Handling:
 * Displays notification messages for:
 * - User not found
 * - Invalid credentials
 * - Too many attempts
 *
 * @async
 * @function userEmailLogIn
 *
 * @returns {Promise<void>}
 */
const userEmailLogIn = async () => {
  /**
   * Retrieves user email from login form.
   *
   * @type {string}
   */
    var email = document.getElementById("email").value;

    /**
     * Retrieves user password from login form.
     *
     * @type {string}
     */
    var password = document.getElementById("password").value;



  /**
   * Attempts Firebase authentication
   * using provided credentials.
   *
   * On success:
   * Returns userCredential object.
   *
   * On failure:
   * Returns Firebase error code.
   */
  signInWithEmailAndPassword(auth, email, password)
  .then(async (userCredential) => {
    // Signed in
    user = userCredential.user;
    if(auth.currentUser.email != null){
      console.log("omff")
      localStorage.setItem("user_logged_in", true)
     
      /**
       * Reference to user's Firestore record.
       *
       * Document ID = user email.
       *
       * @type {import("firebase/firestore").DocumentReference}
       */
      var ref = doc(db, "User_Data", user.email)


      /**
       * Retrieves user document from Firestore.
       *
       * Used to determine user role.
       */ 
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
    console.log(errorCode)
    switch (errorCode) {
      case "auth/user-not-found":
        showNotif("No account found with that email.", "error")
        break;
  
      case "auth/invalid-credential":
        showNotif("Incorrect email or password. Try again.", "error");
        break;
  
  
      case "auth/too-many-requests":
        showNotif("Too many attempts. Try again later.", "error");
        break;
  
      default:
        showNotif("Login failed. Please try again.", "error");
    }
  });
}





/**
 * Attaches click event to login button.
 *
 * Executes authentication workflow.
 */
logInEmailButton.addEventListener('click', userEmailLogIn)



/**
 * Creates a new user record in Firestore.
 *
 * Determines user role based on email domain:
 * - "@apps.nsd.org" → Student
 * - "@nsd.org" → Admin
 *
 * Initializes user document with:
 * - items_posted counter
 *
 * Prevents non-school emails
 * from registering.
 *
 * @async
 * @function AddUser
 *
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
      showNotif("Email must be tied to North Creek High School", "error"); 
      return;
    }
    var ref = doc(db, "User_Data", user.email);


    /**
      * Creates Firestore user document.
      *
      * Initializes user metadata fields.
      */
    await setDoc(
        ref, {
        items_posted: 0,
    })
}