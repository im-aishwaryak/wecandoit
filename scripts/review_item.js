// scripts/review_claim.js
import {
    db, auth,
    doc, getDoc, updateDoc
} from './firebaseModule.js';

let currentClaim = null;
let currentItem = null;

// Get claim ID from URL
const urlParams = new URLSearchParams(window.location.search);
const itemId = urlParams.get('id');
console.log("🔍 [URL] Item ID from URL:", itemId);

// Load claim and item details
async function loadReviewData() {
    console.log("📥 [LOAD] Starting loadReviewData...");
    
    if (!itemId) {
        console.error("❌ [ERROR] No item ID provided in URL");
        alert("No item selected");
        window.location.href = "admin-dashboard.html";
        return;
    }
    
    try {
        console.log("📦 [ITEM] Fetching item from Item_Data collection...");
        
        // Load item
        const itemRef = doc(db, "Claims", itemId);
        console.log("📦 [ITEM] Item reference created:", itemRef.path);
        
        const itemSnap = await getDoc(itemRef);
        console.log("📦 [ITEM] Item snapshot retrieved, exists:", itemSnap.exists());
        
        if (!itemSnap.exists()) {
            console.error("❌ [ERROR] Item document does not exist");
            alert("Item not found");
            window.location.href = "admin-dashboard.html";
            return;
        }
        
        currentItem = { id: itemSnap.id, ...itemSnap.data() };
        console.log("✅ [ITEM] Item loaded successfully:", {
            id: currentItem.id,
            item_name: currentItem.item_name,
            status: currentItem.status,
            claimant_id: currentItem.claimant_id,
            allFields: Object.keys(currentItem)
        });
        
        // Load associated retrieval claim
        console.log("🔗 [CLAIM] Checking for associated claim...");
        
        if (currentItem.claimant_id) {
            console.log("🔗 [CLAIM] claim_id found in item:", currentItem.claimant_id);
            
            const claimRef = doc(db, "Claims", currentItem.id);
            console.log("🔗 [CLAIM] Claim reference created:", claimRef.path);
            
            const claimSnap = await getDoc(claimRef);
            console.log("🔗 [CLAIM] Claim snapshot retrieved, exists:", claimSnap.exists());
            
            if (claimSnap.exists()) {
                currentClaim = { id: claimSnap.id, ...claimSnap.data() };
                console.log("✅ [CLAIM] Claim loaded successfully:", {
                    id: currentClaim.id,
                    item_name: currentClaim.item_name,
                    claimant_email: currentClaim.claimant_email,
                    status: currentClaim.status,
                    allFields: Object.keys(currentClaim)
                });
            } else {
                console.error("❌ [CLAIM] Claim document does not exist");
            }
        } else {
            console.warn("⚠️ [CLAIM] No claim_id field found in item");
            console.log("📋 [DEBUG] Item fields:", Object.keys(currentItem));
        }
        
        console.log("🎨 [DISPLAY] Calling displayComparison...");
        displayComparison();
        
    } catch (error) {
        console.error("❌ [ERROR] Error in loadReviewData:", error);
        console.error("❌ [ERROR] Error stack:", error.stack);
        alert("Error loading claim details: " + error.message);
        window.location.href = "admin-dashboard.html";
    }
}

// Display comparison between claim and item
function displayComparison() {
    console.log("🎨 [DISPLAY] Starting displayComparison...");
    console.log("🎨 [DISPLAY] currentClaim:", currentClaim ? "exists" : "null");
    console.log("🎨 [DISPLAY] currentItem:", currentItem ? "exists" : "null");
    
    if (!currentClaim || !currentItem) {
        console.error("❌ [DISPLAY] Missing data - currentClaim:", !!currentClaim, "currentItem:", !!currentItem);
        alert("Missing claim or item data");
        return;
    }
    
    const comparisonCard = document.querySelector('.comparison-card');
    console.log("🎨 [DISPLAY] Comparison card element found:", !!comparisonCard);
    
    if (!comparisonCard) {
        console.error("❌ [DISPLAY] Comparison card container not found in DOM");
        return;
    }
    
    // Build verification questions comparison
    console.log("✅ [VERIFY] Building verification comparison...");
    let verificationHTML = '';
    const itemQuestions = currentItem.verification_qs || {};
    const claimAnswers = currentClaim.verification_answers || {};
    
    console.log("✅ [VERIFY] Item questions:", Object.keys(itemQuestions).length, "questions");
    console.log("✅ [VERIFY] Claim answers:", Object.keys(claimAnswers).length, "answers");
    
    Object.keys(itemQuestions).forEach((question, index) => {
        const correctAnswer = itemQuestions[question];
        const claimAnswer = claimAnswers[question] || 'No answer provided';
        
        // Check if answers match (case-insensitive, trimmed)
        const isMatch = correctAnswer.toLowerCase().trim() === claimAnswer.toLowerCase().trim();
        const matchClass = isMatch ? 'style="color: green; font-weight: bold;"' : 'style="color: red;"';
        
        console.log(`✅ [VERIFY] Q${index + 1}:`, {
            question: question,
            correctAnswer: correctAnswer,
            claimAnswer: claimAnswer,
            match: isMatch
        });
        
        verificationHTML += `
            <p><b>Q${index + 1}:</b> ${question}</p>
            <p><b>Correct A${index + 1}:</b> ${correctAnswer}</p>
            <p ${matchClass}><b>Claimant A${index + 1}:</b> ${claimAnswer} ${isMatch ? '✓' : '✗'}</p>
            <br>
        `;
    });
    
    console.log("🎨 [DISPLAY] Building HTML...");
    
    comparisonCard.innerHTML = `
        <img src="${currentItem.item_image || 'assets/placeholders/lost-item1.jpg'}" alt="Item">

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
                    <p><b>Reporter Email:</b> ${currentItem.submitter_email || currentItem.submitted_by || 'Unknown'}</p>
                    <p><b>Public Description:</b> ${currentItem.public_description}</p>
                    <p><b>Private Description:</b> ${currentItem.private_description}</p>
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
    
    console.log("🎨 [DISPLAY] HTML inserted into DOM");
    
    // Add event listeners
    console.log("🎨 [DISPLAY] Adding event listeners...");
    const approveBtn = document.getElementById('approve-btn');
    const rejectBtn = document.getElementById('reject-btn');
    
    console.log("🎨 [DISPLAY] Approve button found:", !!approveBtn);
    console.log("🎨 [DISPLAY] Reject button found:", !!rejectBtn);
    
    if (approveBtn) {
        approveBtn.addEventListener('click', approveClaim);
    }
    if (rejectBtn) {
        rejectBtn.addEventListener('click', rejectClaim);
    }
    
    console.log("✅ [DISPLAY] Display complete!");
}

// Approve the claim
async function approveClaim() {
    console.log("✅ [APPROVE] Approve button clicked");
    
    if (!confirm('Approve this claim? The student will be notified to pick up the item.')) {
        console.log("⚠️ [APPROVE] User cancelled approval");
        return;
    }
    
    console.log("✅ [APPROVE] User confirmed approval");
    
    try {
        const user = auth.currentUser;
        console.log("✅ [APPROVE] Current user:", user.email);
        console.log("✅ [APPROVE] Claim ID:", currentClaim.id);
        console.log("✅ [APPROVE] Item ID:", currentItem.id);
        
        // Update claim status
        console.log("✅ [APPROVE] Updating claim document...");
        const claimRef = doc(db, "Claims", currentClaim.id);
        await updateDoc(claimRef, {
            status: "approved",
            reviewed_at: new Date().toISOString(),
            reviewed_by: user.email,
            review_notes: "Approved - verification successful"
        });
        console.log("✅ [APPROVE] Claim updated successfully");
        
        // Update item status
        console.log("✅ [APPROVE] Updating item document...");
        const itemRef = doc(db, "Item_Data", currentItem.item_id);
        await updateDoc(itemRef, {
            status: "claimed and ready to retrieve",
            approved_at: new Date().toISOString(),
            approver_id: user.uid,
            approver_email: user.email
        });
        console.log("✅ [APPROVE] Item updated successfully");
        
        alert('Claim approved! Student can now pick up the item from the main office.');
        console.log("✅ [APPROVE] Redirecting to admin dashboard...");
        window.location.href = "admin-dashboard.html";
        
    } catch (error) {
        console.error("❌ [APPROVE] Error approving claim:", error);
        console.error("❌ [APPROVE] Error stack:", error.stack);
        alert('Failed to approve claim: ' + error.message);
    }
}

// Reject the claim
async function rejectClaim() {
    console.log("🚫 [REJECT] Reject button clicked");
    
    const reason = prompt('Enter reason for rejection (optional):');
    
    if (reason === null) {
        console.log("⚠️ [REJECT] User cancelled rejection");
        return; // User cancelled
    }
    
    console.log("🚫 [REJECT] User confirmed rejection, reason:", reason || "(none)");
    
    try {
        const user = auth.currentUser;
        console.log("🚫 [REJECT] Current user:", user.email);
        console.log("🚫 [REJECT] Claim ID:", currentClaim.id);
        console.log("🚫 [REJECT] Item ID:", currentItem.id);
        
        // Update claim status
        console.log("🚫 [REJECT] Updating claim document...");
        const claimRef = doc(db, "Claims", currentClaim.id);
        await updateDoc(claimRef, {
            status: "rejected",
            reviewed_at: new Date().toISOString(),
            reviewed_by: user.email,
            reviewer_id: user.uid,
            review_notes: reason || "Rejected - verification failed"
        });
        console.log("🚫 [REJECT] Claim updated successfully");
        
        // Update item status back to available
        console.log("🚫 [REJECT] Updating item document...");
        const itemRef = doc(db, "Item_Data", currentItem.id);
        await updateDoc(itemRef, {
            status: "available to claim",
            receiver_id: "",
            receiver_email: "",
            claim_id: ""
        });
        console.log("🚫 [REJECT] Item updated successfully");
        
        alert('Claim rejected. The item is now available again.');
        console.log("🚫 [REJECT] Redirecting to admin dashboard...");
        window.location.href = "admin-dashboard.html";
        
    } catch (error) {
        console.error("❌ [REJECT] Error rejecting claim:", error);
        console.error("❌ [REJECT] Error stack:", error.stack);
        alert('Failed to reject claim: ' + error.message);
    }
}

// Helper: Format date
function formatDate(isoString) {
    if (!isoString) {
        console.warn("⚠️ [FORMAT] No date string provided");
        return 'Unknown date';
    }
    const date = new Date(isoString);
    const formatted = date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    console.log("📅 [FORMAT] Formatted date:", isoString, "→", formatted);
    return formatted;
}

// Initialize
console.log("🚀 [INIT] Script loaded, waiting for DOM...");

document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 [INIT] DOM loaded, starting loadReviewData...");
    loadReviewData();
});