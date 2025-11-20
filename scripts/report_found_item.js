import {
    db, auth, provider, signInWithPopup, signOut,
    doc, getDoc, setDoc, collection, addDoc, updateDoc, deleteDoc,
    deleteField, storage, ref, uploadBytes, getDownloadURL
} from './firebaseModule.js';

const report_button = document.getElementById("submit-button")

const uploadData = async() =>{
    console.log("in function")
    var category = document.getElementById("category").value; 
    var item_name = document.getElementById("item").value; 
    var public_desc = document.getElementById("public_desc").value; 
    var private_desc = document.getElementById("private_desc").value; 
    var location = document.getElementById("location").value; 
    var date = document.getElementById("date").value; 
    var time = document.getElementById("time").value; 

    var image_url = await uploadImage()

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
            item_name: item_name,
            image_url: image_url,
            public_description: public_desc,
            private_description: private_desc, 
            location_found: location, 
            date_found: date,
            time_found: time,
            verification_qs: verifications,
            status: "pending submission", 
            retrieval_date: ""
        }
    ); 
}

report_button.addEventListener("click", async (e) => {
    e.preventDefault();   // 🔥 stops page reload
    await uploadData();
    window.location.reload();
});

const uploadImage = async() =>{
    const data = new FormData();
    const file = document.getElementById("image_file").files[0]; 
    data.append("file", file);
    data.append("upload_preset", "boomerang_uploads");

    const res = await fetch(
        "https://api.cloudinary.com/v1_1/dpj2xj3ry/image/upload",
        {
            method: "POST",
            body: data
        }
    );

    const json = await res.json();
    return json.secure_url; // THIS is the image URL we store in Firestore
}
