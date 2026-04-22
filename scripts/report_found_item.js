/**
 * @file Report found item form logic. Handles the "report a found item" submission
 * flow, including verification question dropdowns with custom input support, form
 * validation, image upload to Cloudinary, and writing the new item document to
 * Firestore with a "pending submission" status.
 */

import {
    db, auth, provider, signInWithPopup, signOut,
    doc, getDoc, setDoc, collection, addDoc, updateDoc, deleteDoc,
    deleteField, storage, ref, uploadBytes, getDownloadURL
} from './firebaseModule.js';


/**
 * Reads the selected or custom-entered value for a verification question dropdown.
 * If the dropdown is set to "custom", returns the trimmed value of the corresponding
 * custom text input instead.
 * @param {number} num - The question number (1, 2, or 3), used to locate DOM elements
 *     by ID (e.g., "question1-select", "question1-custom").
 * @returns {string} The selected preset question string, the custom input string,
 *     or an empty string if the element is not found.
 */
function getQuestionValue(num) {
  const select = document.getElementById(`question${num}-select`);
  const custom = document.getElementById(`question${num}-custom`);

  if (!select) return "";

  if (select.value === "custom") {
    return custom.value.trim();
  }
  return select.value;
}

/**
 * Attaches a change event listener to a verification question dropdown that toggles
 * the visibility of the associated custom text input based on whether "custom"
 * is selected.
 * @param {number} num - The question number (1, 2, or 3), used to locate DOM elements
 *     by ID (e.g., "question1-select", "question1-custom").
 * @returns {void}
 */
function setupQuestionDropdown(num) {
  const select = document.getElementById(`question${num}-select`);
  const custom = document.getElementById(`question${num}-custom`);

  if (!select || !custom) return;

  select.addEventListener("change", () => {
    custom.style.display = select.value === "custom" ? "block" : "none";
  });
}

setupQuestionDropdown(1);
setupQuestionDropdown(2);
setupQuestionDropdown(3);










const report_button = document.getElementById("submit-button")

/**
 * Reads and validates all form fields, uploads the item image to Cloudinary via
 * uploadImage, then writes a new document to the "Item_Data" Firestore collection
 * with a status of "pending submission". Requires an authenticated user.
 * Shows error notifications for missing fields, missing image, or no logged-in user.
 * @async
 * @returns {Promise<boolean>} Resolves to true if the item was submitted successfully,
 *     or false if validation failed or an error occurred.
 */
const uploadData = async() => {
    console.log("in function")
   
    // Get the current user
    const currentUser = auth.currentUser;
   
    if (!currentUser) {
        console.error("No user is logged in!");
        showNotif("You must be logged in to submit an item.", "error");
        return false;
    }
   
    var category = document.getElementById("category").value;
    var item_name = document.getElementById("item").value;
    var public_desc = ""
    var private_desc = ""
    var location = document.getElementById("location").value;
    var date = document.getElementById("date").value;
    var time = document.getElementById("time").value;

    if (
        !item_name.trim() ||
        !location.trim() ||
        !date ||
        category === "Select a category"
    ) {
        showNotif("Please fill in all required fields.", "error");
        return false; 
    }
    


    var image_url = await uploadImage()
    if(!image_url){
        showNotif("Please upload an image", "error"); 
        return false; 
    }

    var q1 = getQuestionValue(1);
    var a1 = document.getElementById("answer1").value
   
    var q2 = getQuestionValue(2);
    var a2 = document.getElementById("answer2").value


    var q3 = getQuestionValue(3);
    var a3 = document.getElementById("answer3").value

    if(!a1 || !a2 || !a3){
        showNotif("Please fill in all verification questions.", "error"); 
        return false; 
    }

    var verifications = {[q1]:a1, [q2]:a2, [q3]:a3}


    var ref = collection(db, "Item_Data")
    console.log(ref)
    console.log(localStorage.getItem("user_logged_in"))
   
    const data = {
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
        retrieval_date: "",
        // Add user tracking fields
        submitter_id: currentUser.uid,
        submitter_email: currentUser.email,
        submitted_at: new Date().toISOString()
        }

    if (time && time.trim() !== "") {
        data.time_found = time;
    }
    await addDoc(ref, data);
    return true; 
}


report_button.addEventListener("click", async (e) => {
    e.preventDefault();   // 🔥 stops page reload
    
    const success = await uploadData();
    if(success){ 
        showNotif("Item Report Submitted!", "success");

        setTimeout(() => {
            window.location.reload();
        }, 1500);
    } 
});

/**
 * Uploads the selected image file to Cloudinary using the "boomerang_uploads" preset
 * and returns the resulting secure URL.
 * @async
 * @returns {Promise<string|undefined>} The secure Cloudinary URL of the uploaded image,
 *     or undefined if the upload failed or no file was selected.
 */
const uploadImage = async() => {
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

