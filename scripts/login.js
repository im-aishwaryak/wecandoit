import {
    db, auth, provider, signInWithPopup, signOut,
    doc, getDoc, setDoc, collection, addDoc, updateDoc, deleteDoc,
    deleteField, storage, ref, uploadBytes, getDownloadURL, signInWithEmailAndPassword
} from './firebaseModule.js';


let user;
let user_status;


signOut(auth)
  .then(() => {
    console.log("Signed out on page load");
  })
  .catch((e) => console.log(e));




const logInGoogleButton = document.getElementById("google-auth btn");
const logInEmailButton = document.getElementById("email log-in")




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
    console.log(errorCode)
    switch (errorCode) {
      case "auth/user-not-found":
        alert("No account found with that email.");
        break;
  
      case "auth/invalid-credential":
        alert("Incorrect email or password. Try again.");
        break;
  
  
      case "auth/too-many-requests":
        alert("Too many attempts. Try again later.");
        break;
  
      default:
        alert("Login failed. Please try again.");
    }
  });
}






logInGoogleButton.addEventListener('click', userGoogleLogIn)
logInEmailButton.addEventListener('click', userEmailLogIn)




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