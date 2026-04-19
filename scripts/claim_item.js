// scripts/claim_item.js
import {
    db, auth,
    doc, getDoc, collection, addDoc, updateDoc, increment
} from './firebaseModule.js';


let currentItem = null;


// Get item ID from URL
const urlParams = new URLSearchParams(window.location.search);
const itemId = urlParams.get('id');
console.log(itemId)


// Load item details on page load
async function loadItemDetails() {
    if (!itemId) {
        showNotif("No item selected", "error")
        window.location.href = "browse-items.html";
        return;
    }
   
    try {
        const itemRef = doc(db, "Item_Data", itemId);
        const itemSnap = await getDoc(itemRef);
       
        if (!itemSnap.exists()) {
            showNotif("Item not found", "error")
            window.location.href = "browse-items.html";
            return;
        }
       
        currentItem = { id: itemSnap.id, ...itemSnap.data() };
       
        console.log(currentItem.item_name)
        console.log(currentItem.image_url)


        displayItemDetails();
        displayVerificationQuestions();
       
    } catch (error) {
        console.error("Error loading item:", error);
        showNotif("Error loading item details", "error")
        window.location.href = "browse-items.html";
    }
}


// Display item details in the form
function displayItemDetails() {
    const itemCard = document.querySelector('.item-card');
   
    if (itemCard && currentItem) {
        let dateDisplay = currentItem.date_found || "Unknown date";
        if (currentItem.time_found) {
            dateDisplay += ` ${currentItem.time_found}`;
        }
       
       
        itemCard.innerHTML = `
            <img class="item-img" style="width: 150px; height: 150px"
                src="${currentItem.image_url|| 'assets/placeholders/lost-item2.jpg'}"
                alt="${currentItem.item_name || 'Item'}">


            <div class="item-info">
                <div class="item-tags">
                    <span class="tag tag-blue">Available</span>
                    <span class="tag tag-orange"><img src="assets/icons/tag-right.svg">${currentItem.category || 'Other'}</span>
                </div>


                <div class="item-text">
                    <h3 class="item-name">${currentItem.item_name || currentItem.category || 'Unknown Item'}</h3>
                    <p class="item-desc">${currentItem.public_description || 'No description available'}</p>
                </div>


                <div class="item-tags">
                    <span class="tag tag-transparent"><img src="assets/icons/location.svg">${currentItem.location_found || 'Unknown'}</span>
                    <span class="tag tag-transparent"><img src="assets/icons/clock.svg">${dateDisplay}</span>
                </div>
            </div>
        `;
    }
}


// Display verification questions from the item
function displayVerificationQuestions() {
    const verificationSection = document.querySelector('.form-group');
   
    if (!currentItem || !currentItem.verification_qs) {
        return;
    }
   
    const questions = currentItem.verification_qs;
    const questionKeys = Object.keys(questions);
   
    // Find the verification questions container
    const container = Array.from(document.querySelectorAll('.form-group')).find(group =>
        group.querySelector('label')?.textContent.includes('Verification Questions')
    );
   
    if (container && questionKeys.length > 0) {
        // Clear existing inputs (keep the label and hint)
        const inputFields = container.querySelectorAll('.input-field');
        inputFields.forEach(field => field.remove());
       
        // Add question inputs dynamically
        questionKeys.forEach((question, index) => {
            const inputField = document.createElement('div');
            inputField.className = 'input-field';
            inputField.innerHTML = `
                <label for="answer${index + 1}">${question} <span class="required">*</span></label>
                <input type="text" id="answer${index + 1}" placeholder="Your answer ..." required>
            `;
            container.appendChild(inputField);
        });
    }
}


// Submit claim
async function submitClaim(e) {
    e.preventDefault();
   
    const user = auth.currentUser;
    if (!user) {
        showNotif("You must be logged in to claim an item", "error")
        window.location.href = "log-in.html";
        return;
    }
   
    if (!currentItem) {
        showNotif("No item selected", "error"); 
        return;
    }
   
    // Get form values
    const studentName = document.querySelector('input[placeholder="First and Last Name"]').value.trim();
    const studentEmail = document.querySelector('input[placeholder="0000000@apps.nsd.org"]').value.trim();
    const lostDate = document.querySelector('input[type="date"]').value;
    const lostTime = document.querySelector('input[type="time"]').value;
    const additionalInfo = document.querySelector('textarea').value.trim();
   
    // Validate required fields
    if (!studentName || !studentEmail || !lostDate) {
        showNotif("Please fill in all required fields", "error"); 
        return;
    }
   
    // Validate email matches logged-in user
    if (studentEmail !== user.email) {
        showNotif("Email must match your logged-in account", "error"); 

        return;
    }
   
    // Get verification answers
    const answers = {};
    const questions = Object.keys(currentItem.verification_qs);
   
    for (let i = 0; i < questions.length; i++) {
        const answerInput = document.getElementById(`answer${i + 1}`);
        if (!answerInput || !answerInput.value.trim()) {
            showNotif("Please answer all verification questions", "error"); 
            return;
        }
        answers[questions[i]] = answerInput.value.trim().toLowerCase();
    }
   
    // Disable submit button
    const submitBtn = document.querySelector('button.btn-orange');
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";
   
    try {
        // Create claim document
        const claimRef = collection(db, "Claims");
        const claimDoc = await addDoc(claimRef, {
            item_id: currentItem.id,
            item_name: currentItem.item_name,
            item_image: currentItem.image_url,
            claimant_name: studentName,
            claimant_email: studentEmail,
            lost_date: lostDate,
            lost_time: lostTime || "",
            verification_answers: answers,
            additional_info: additionalInfo,
            status: "pending",
            submitted_at: new Date().toISOString(),
            reviewed_at: null,
            reviewed_by: null,
            review_notes: ""
        });
       
        // Update item status to "claimed_pending"
        const itemRef = doc(db, "Item_Data", currentItem.id);
        await updateDoc(itemRef, {
            status: "pending retrieval",
            claim_id: claimDoc.id,
            //claimed_by: studentEmail,
            //claimed_at: new Date().toISOString()
        });
       
        // Update user's items_claimed count
        const userRef = doc(db, "User_Data", user.email);
        await updateDoc(userRef, {
            items_claimed: increment(1)
        });
       
        
        showNotif("Claim submitted successfully! An administrator will review your request.", "success"); 
        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 1500);

       
    } catch (error) {
        console.error("Error submitting claim:", error);
        showNotif("Failed to submit claim. Please try again.", "error"); 
       
        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit for review";
    }
}


// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadItemDetails();

    const submitBtn = document.querySelector('button.btn-orange');
    if (submitBtn) {
        submitBtn.addEventListener('click', submitClaim);
    }

    // ---------------------- Autofill name & email ----------------------
    auth.onAuthStateChanged(user => {
        if (!user) return; // no user logged in

        const nameInput = document.getElementById('student-name');
        const emailInput = document.getElementById('student-email');

        // Fill email
        if (emailInput) emailInput.value = user.email || "";

        // Fill name from displayName or fallback to email prefix
        if (nameInput) {
            console.log("lol? ")
            if (user.displayName) {
                nameInput.value = user.displayName;
            } else {
                const defaultName = user.full_name;
                nameInput.value = defaultName;
            }
        }
    });
});

