import {
    db, auth, provider, signInWithPopup, createUserWithEmailAndPassword, signOut,
    doc, getDoc, setDoc, collection, addDoc, updateDoc, deleteDoc,
    deleteField, storage, ref, uploadBytes, getDownloadURL
} from './firebaseModule.js';



let user; 
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
            window.location.href = "home.html";
        }).catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
        })
}

const userEmailSignIn = async () => {
    var email = document.getElementById("email").value; 
    var password = document.getElementById("password").value;

    createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed up 
    user = userCredential.user;
    AddUser() 
    window.location.href = "home.html";
    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
  });
}



signInGoogleButton.addEventListener('click', userGoogleSignIn)
signInEmailButton.addEventListener('click', userEmailSignIn)


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