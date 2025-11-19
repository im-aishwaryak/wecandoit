import {
    db, auth, provider, signInWithPopup, signOut,
    doc, getDoc, setDoc, collection, addDoc, updateDoc, deleteDoc,
    deleteField, storage, ref, uploadBytes, getDownloadURL
} from './firebaseModule.js';

const report_button = document.getElementById("submit-button")
console.log("hello therw!!")

const uploadImage = async() =>{
    console.log("in function")
    var category = document.getElementById("category").value; 
    var public_desc = document.getElementById("public_desc").value; 
    var private_desc = document.getElementById("private_desc").value; 
    var location = document.getElementById("location").value; 
    var date = document.getElementById("date").value; 
    var time = document.getElementById("time").value; 

    //IMAGE SAVING CODE GET IT DONE EUHEHUUFWBBUEQUYQYUFEYUUYIE

    var q1 = document.getElementById("question1").value
    var a1 = document.getElementById("answer1").value
    
    var q2 = document.getElementById("question2").value
    var a2 = document.getElementById("answer2").value

    var q3 = document.getElementById("question3").value
    var a3 = document.getElementById("answer3").value

    var verifications = {[q1]:a1, [q2]:a2, [q3]:a3}
    console.log(verifications)

    var ref = collection(db, "Item_Data")
    console.log(ref)
    console.log(localStorage.getItem("user_logged_in"))
    await addDoc(
        ref, {
            category: category,
            public_description: public_desc,
            private_description: private_desc, 
            location_found: location, 
            date_found: date,
            time_found: time,
            verification_qs: verifications
        }
    ); 
}

report_button.addEventListener("click", async (e) => {
    e.preventDefault();   // 🔥 stops page reload
    await uploadImage();
    window.location.reload();
});