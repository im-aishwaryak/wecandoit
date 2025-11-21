//scripts/claim_item.js
import {
    db, auth,
    doc, getDoc, collection, addDoc, updateDoc, increment
} from './firebaseModule.js';

let currentItem = null;

// Get item ID from URL
const urlParams = new URLSearchParams(window.location.search);
const itemId = urlParams.get('id');
console.log("Item ID from URL:", itemId);

// Load item details on page load
async function loadItemDetails() {
    if (!itemId) {
        alert("No item selected");
        window.location.href = "browse-items.html";
        return;
    }
    
    try {
        const itemRef = doc(db, "Item_Data", itemId);
        const itemSnap = await getDoc(itemRef);
        
        if (!itemSnap.exists()) {
            alert("Item not found");
            window.location.href = "browse-items.html";
            return;
        }
        
        currentItem = { id: itemSnap.id, ...itemSnap.data() };
        
        console.log("Item loaded:", currentItem.item_name);
        console.log("Image URL:", currentItem.image_url);

        displayItemDetails();
        displayVerificationQuestions();
        
    } catch (error) {
        console.error("Error loading item:", error);
        alert("Error loading item details");
        window.location.href = "browse-items.html";
    }
}

// Display item details in the form
function displayItemDetails() {
    const itemCard = document.querySelector('.item-card');
    
    if (itemCard && currentItem) {
        let dateDisplay = currentItem.date_found || "Unknown date";
        if (currentItem.time_found) {
            dateDisplay += ` at ${currentItem.time_found}`;
        }
       
        itemCard.innerHTML = `
            <img class="item-img" style="width: 150px; height: 150px; object-fit: cover;"
                src="${currentItem.image_url || 'assets/placeholders/lost-item2.jpg'}" 
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
    if (!currentItem || !currentItem.verification_qs) {
        console.log("No verification questions found");
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
        console.log("works in here?")
        const inputFields = container.querySelectorAll('.input-field');
        inputFields.forEach(field => field.remove());
        
        // Add question inputs dynamically
        questionKeys.forEach((question, index) => {
            if (question && question.trim()) {  // Only add if question exists
                const inputField = document.createElement('div');
                inputField.className = 'input-field';
                inputField.innerHTML = `
                    <label for="answer${index + 1}">${question} <span class="required">*</span></label>
                    <input type="text" id="answer${index + 1}" placeholder="Your answer ..." required>
                `;
                container.appendChild(inputField);
            }
        });
    }
}

// Submit claim
async function submitClaim(e) {
    e.preventDefault();
    
    const user = auth.currentUser;
    if (!user) {
        alert("You must be logged in to claim an item");
        window.location.href = "log-in.html";
        return;
    }
    
    if (!currentItem) {
        alert("No item selected");
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
        alert("Please fill in all required fields");
        return;
    }
    
    // Validate email matches logged-in user
    if (studentEmail !== user.email) {
        alert("Email must match your logged-in account");
        return;
    }
    
    // Get verification answers
    const answers = {};
    const questions = Object.keys(currentItem.verification_qs).filter(q => q && q.trim());
    
    for (let i = 0; i < questions.length; i++) {
        const answerInput = document.getElementById(`answer${i + 1}`);
        if (!answerInput || !answerInput.value.trim()) {
            alert("Please answer all verification questions");
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
            item_category: currentItem.category,

            
            // Claimant info (the person claiming the item)
            claimant_id: user.email,
            claimant_name: studentName,
            claimant_email: studentEmail,
            
            // Submitter info (the person who found the item)
            submitter_id: currentItem.submitter_id,
            submitter_email: currentItem.submitter_email,
            
            // Claim details
            lost_date: lostDate,
            lost_time: lostTime || "",
            verification_answers: answers,
            additional_info: additionalInfo,
            
            // Status tracking
            status: "pending",
            submitted_at: new Date().toISOString(),
            reviewed_at: null,
            reviewed_by: null,
            reviewer_id: null,
            review_notes: ""
        });
        
        console.log("Claim created with ID:", claimDoc.id);
        
        // Update item to add receiver/claimant info
        const itemRef = doc(db, "Item_Data", currentItem.id);
        await updateDoc(itemRef, {
            status: "pending retrieval",
            claim_id: claimDoc.id,
            //receiver_id: user.uid,
            //receiver_email: studentEmail
        });
        
        console.log("Item updated with receiver info");
        
        // Update user's items_claimed count (use Users collection with uid)
        try {
            const userRef = doc(db, "User_Data", user.email);
            const userSnap = await getDoc(userRef);
            
            if (userSnap.exists()) {
                await updateDoc(userRef, {
                    items_claimed: increment(1)
                });
            }
        } catch (userError) {
            console.log("Could not update user claim count:", userError);
            // Don't fail the whole claim if this fails
        }
        
        alert("Claim submitted successfully! An administrator will review your request.");
        window.location.href = "dashboard.html";
        
    } catch (error) {
        console.error("Error submitting claim:", error);
        alert("Failed to submit claim. Please try again.");
        
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
});