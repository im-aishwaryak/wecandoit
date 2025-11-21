import {
    db, auth, provider, signInWithPopup, createUserWithEmailAndPassword, signOut,
    doc, getDoc, setDoc, collection, addDoc, updateDoc, deleteDoc,
    deleteField, storage, ref, uploadBytes, getDownloadURL
} from './firebaseModule.js';



let user; 
let user_status; 
const signInGoogleButton = document.getElementById("google-auth sign-in");
const signInEmailButton = document.getElementById("email sign-up")



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
}

const userEmailSignIn = async () => {
    var email = document.getElementById("email").value; 
    var password = document.getElementById("password").value;

    createUserWithEmailAndPassword(auth, email, password)
  .then(async (userCredential) => {
    // Signed up 
    user = userCredential.user;
    await AddUser() 
    if(user_status == "Student"){
      localStorage.setItem("user_identity", "student")
      window.location.href = "dashboard.html";
  }
    else{
      localStorage.setItem("user_identity", "admin")
      window.location.href = "admin-dashboard.html"
    }
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    alert(errorMessage)
  });
}



signInGoogleButton.addEventListener('click', userGoogleSignIn)
signInEmailButton.addEventListener('click', userEmailSignIn)


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
      status: user_status
    })
}