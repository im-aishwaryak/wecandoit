/**
 * @file Admin claim review page logic. Loads a found item and its associated
 * retrieval claim by item ID from the URL, renders a side-by-side comparison of
 * the submission and claim details (including verification answer matching), and
 * allows an admin to approve or reject the claim.
 */
import {
    db, auth,
    doc, getDoc, updateDoc
} from './firebaseModule.js';

/**
 * @type {{id: string, item_name: string, claimant_name: string, claimant_email: string,
 *     lost_date: string, lost_time?: string, submitted_at: string, additional_info?: string,
 *     verification_answers: Object.<string, string>}|null}
 * The currently loaded claim document, or null if not yet fetched.
 */
let currentClaim = null;

/**
 * @type {{id: string, item_name?: string, category?: string, image_url?: string,
 *     location_found: string, date_found: string, time_found?: string,
 *     submitter_email: string, verification_qs: Object.<string, string>,
 *     claim_id?: string}|null}
 * The currently loaded item document, or null if not yet fetched.
 */
let currentItem = null;


// Get claim ID from URL
const urlParams = new URLSearchParams(window.location.search);
const itemId = urlParams.get('id');
console.log(itemId)


/**
 * Reads the item ID from the URL query string, fetches the corresponding Item_Data
 * document from Firestore, and then fetches its associated Claims document if a
 * claim_id is present. Stores results in currentItem and currentClaim, then calls
 * displayComparison. Redirects to the admin dashboard on any error or missing data.
 * @async
 * @returns {Promise<void>}
 */
async function loadReviewData() {
    if (!itemId) {
        showNotif("No item selected", "error");
        window.location.href = "admin-dashboard.html";
        return;
    }
   
    try {
        // Load Item Data
        const itemRef = doc(db, "Item_Data", itemId);
        const itemSnap = await getDoc(itemRef);
       
        if (!itemSnap.exists()) {
            showNotif("Item not found", "error");
            window.location.href = "admin-dashboard.html";
            return;
        }
       
        currentItem = { id: itemSnap.id, ...itemSnap.data() };
       
        // Load associated retrieval claim
        if (currentItem.claim_id) {
            const claimRef = doc(db, "Claims", currentItem.claim_id);
            const claimSnap = await getDoc(claimRef);
           
            if (claimSnap.exists()) {
                currentClaim = { id: claimSnap.id, ...claimSnap.data() };
            }
        }
       
        displayComparison();
       
    } catch (error) {
        console.error("Error loading review data:", error);
        showNotif("Error loading claim details", "error");
        window.location.href = "admin-dashboard.html";
    }
}


/**
 * Renders a side-by-side comparison of the current claim and item into the
 * ".comparison-card" DOM element. Compares each verification question answer
 * (case-insensitive) and highlights matches in green and mismatches in red.
 * Appends approve and reject buttons and attaches their event listeners.
 * @returns {void}
 */
function displayComparison() {
    if (!currentClaim || !currentItem) {
        showNotif("Missing claim or item data", "error");
        return;
    }
   
    const comparisonCard = document.querySelector('.comparison-card');
   
    if (!comparisonCard) {
        console.error("Comparison card container not found");
        return;
    }
   
    // Build verification questions comparison
    let verificationHTML = '';
    const itemQuestions = currentItem.verification_qs || {};
    const claimAnswers = currentClaim.verification_answers || {};
   
    Object.keys(itemQuestions).forEach((question, index) => {
        const correctAnswer = itemQuestions[question];
        const claimAnswer = claimAnswers[question] || 'No answer provided';
       
        // Check if answers match (case-insensitive, trimmed)
        const isMatch = correctAnswer.toLowerCase().trim() === claimAnswer.toLowerCase().trim();
        const matchClass = isMatch ? 'style="color: green; font-weight: bold;"' : 'style="color: red;"';
       
        verificationHTML += `
            <p><b>Q${index + 1}:</b> ${question}</p>
            <p><b>Correct A${index + 1}:</b> ${correctAnswer}</p>
            <p ${matchClass}><b>Claimant A${index + 1}:</b> ${claimAnswer} ${isMatch ? '✓' : '✗'}</p>
            <br>
        `;
    });
   
    comparisonCard.innerHTML = `
        <img src="${currentItem.image_url || 'assets/placeholders/lost-item1.jpg'}" alt="Item">


        <div class="comparison-info">
            <div class="comparison-columns">


                <!-- Retrieval Request Column -->
                <div class="comparison-column">
                    <h2>Retrieval Request (Claim)</h2>
                    <br>
                    <p><b>Item Name:</b> ${currentClaim.item_name}</p>
                    <p><b>Submitted on:</b> ${formatDate(currentClaim.submitted_at)}</p>
                    <p><b>Claimant Name:</b> ${currentClaim.claimant_name}</p>
                    <p><b>Student Email:</b> ${currentClaim.claimant_email}</p>
                    <p><b>Lost on:</b> ${currentClaim.lost_date}${currentClaim.lost_time ? ' at ' + currentClaim.lost_time : ''}</p>
                    <br>
                    <p><b>Verification Answers:</b></p>
                    ${Object.entries(claimAnswers).map(([q, a], i) =>
                        `<p>Q${i + 1}: ${q}</p><p>A${i + 1}: ${a}</p>`
                    ).join('')}
                    <br>
                    <p><b>Additional Information:</b></p>
                    <p>${currentClaim.additional_info || 'None provided'}</p>
                </div>


                <!-- Submission Request Column -->
                <div class="comparison-column">
                    <h2>Item Submission (Original)</h2>
                    <br>
                    <p><b>Item Name:</b> ${currentItem.item_name || currentItem.category}</p>
                    <p><b>Found on:</b> ${currentItem.date_found}${currentItem.time_found ? ' at ' + currentItem.time_found : ''}</p>
                    <p><b>Location Found:</b> ${currentItem.location_found}</p>
                    <p><b>Reporter Email:</b> ${currentItem.submitter_email}</p>
                    <br>
                    <p><b>Verification Questions & Correct Answers:</b></p>
                    ${Object.entries(itemQuestions).map(([q, a], i) =>
                        `<p>Q${i + 1}: ${q}</p><p>A${i + 1}: ${a}</p>`
                    ).join('')}
                </div>


            </div>


            <br>
           
            <div style="background: #f9f9f9; padding: 15px; border-radius: 10px; margin-bottom: 15px;">
                <h3 style="margin: 0 0 10px 0;">Verification Check</h3>
                ${verificationHTML}
            </div>


            <button class="btn btn-orange btn-sm full-width" id="approve-btn">Approve Match</button>
            <button class="btn btn-blue btn-sm full-width" id="reject-btn">Reject Match</button>
        </div>
    `;
   
    // Add event listeners
    document.getElementById('approve-btn').addEventListener('click', approveClaim);
    document.getElementById('reject-btn').addEventListener('click', rejectClaim);
}


/**
 * Prompts the admin for confirmation, then updates the claim status to "approved"
 * and the item status to "claimed and ready to retrieve" in Firestore. Records the
 * reviewing admin's email and timestamp. Redirects to the admin dashboard on success.
 * @async
 * @returns {Promise<void>}
 */
async function approveClaim() {
    const confirmed = await showConfirm("Approve this claim? The student will be notified to pick up the item.");
    if (!confirmed) return; 
   
    try {
        const user = auth.currentUser;
       
        // Update claim status
        const claimRef = doc(db, "Claims", currentClaim.id);
        await updateDoc(claimRef, {
            status: "approved",
            reviewed_at: new Date().toISOString(),
            reviewed_by: user.email,
            review_notes: "Approved - verification successful"
        });
       
        // Update item status
        const itemRef = doc(db, "Item_Data", currentItem.id);
        await updateDoc(itemRef, {
            status: "claimed and ready to retrieve"
        });
       
        showNotif("Claim approved! Student can now pick up the item from the main office.", "error");
        window.location.href = "admin-dashboard.html";
       
    } catch (error) {
        console.error("Error approving claim:", error);
        showNotif("Failed to approve claim. Please try again.", "error");
    }
}


/**
 * Prompts the admin for a rejection reason, then updates the claim status to
 * "rejected" and resets the item status back to "available to claim" in Firestore,
 * clearing claim-related fields. Records the reviewing admin's email, timestamp,
 * and reason. Redirects to the admin dashboard after a short delay.
 * @async
 * @returns {Promise<void>}
 */
async function rejectClaim() {
    const reason = await showReasonPrompt();

    if (reason === null) return; 
   
    try {
        const user = auth.currentUser;
       
        // Update claim status
        const claimRef = doc(db, "Claims", currentClaim.id);
        await updateDoc(claimRef, {
            status: "rejected",
            reviewed_at: new Date().toISOString(),
            reviewed_by: user.email,
            review_notes: reason || "Rejected - verification failed"
        });
       
        // Update item status back to available
        const itemRef = doc(db, "Item_Data", currentItem.id);
        await updateDoc(itemRef, {
            status: "available to claim",
            claimed_by: null,
            claimed_at: null,
            claim_id: null
        });

        showNotif('Claim rejected. The item is now available again.', 'info');

        setTimeout(() => {
            window.location.href = "admin-dashboard.html";
        }, 1500);

       
    } catch (error) {
        console.error("Error rejecting claim:", error);
        showNotif('Failed to reject claim. Please try again.', 'info');
    }
}


/**
 * Formats an ISO date string into MM/DD/YYYY format.
 * @param {string} isoString - An ISO 8601 date string.
 * @returns {string} The formatted date, or "Unknown date" if the input is falsy.
 */
function formatDate(isoString) {
    if (!isoString) return 'Unknown date';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
}


// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadReviewData();
});

