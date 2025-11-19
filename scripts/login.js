import {
    db, auth, provider, signInWithPopup, signOut,
    doc, getDoc, setDoc, collection, addDoc, updateDoc, deleteDoc,
    deleteField, storage, ref, uploadBytes, getDownloadURL, signInWithEmailAndPassword
} from './firebaseModule.js';

let user; 
const logInGoogleButton = document.getElementById("google-auth btn");
const logInEmailButton = document.getElementById("email log-in")


const userGoogleLogIn = async () => {
    signInWithPopup(auth, provider)
        .then((result) => {
            console.log("in result")
            user = result.user;
            if(auth.currentUser!= null){
                localStorage.setItem("user_logged_in", true)

            }
            AddUser();
        }).catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
        })
}

const userEmailLogIn = async () => {
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value; 
    console.log(email)
    console.log(password)
    signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed in 
    user = userCredential.user;
    console.log(auth.currentUser.email)
    if(auth.currentUser!= null){
      localStorage.setItem("user_logged_in", true)
    }
    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
  });
}



logInGoogleButton.addEventListener('click', userGoogleLogIn)
logInEmailButton.addEventListener('click', userEmailLogIn)


async function AddUser() {
    if (!user) {
        console.log("no user ")
        return;
    }
    var ref = doc(db, "User_Data", user.email);

      await setDoc(
        ref, {
        items_posted: 0,
    })
}