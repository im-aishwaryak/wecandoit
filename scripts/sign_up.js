import {
    db, auth, provider, signInWithPopup, signOut,
    doc, getDoc, setDoc, collection, addDoc, updateDoc, deleteDoc,
    deleteField, storage, ref, uploadBytes, getDownloadURL
} from './firebaseModule.js';



let user; 
const signInButton = document.getElementById("google-auth sign-in");


const userSignIn = async () => {
    signInWithPopup(auth, provider)
        .then((result) => {
            console.log("in result")
            user = result.user;
            console.log(user);
            //signInButton.style.display = "none";
            AddUser();
        }).catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
        })
}



signInButton.addEventListener('click', userSignIn)


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