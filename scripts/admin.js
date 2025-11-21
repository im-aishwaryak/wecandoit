//admin roles: 
//approves found item submissions
//approves lost item claims 

//student uploads found item submission
//item status = "pending"

//admin dashboard shows two things: 
// - found submissions that need approval (status pending submission )
// - claim form submissions that need approval (status pending)

//found form submmitted (pending submission)
//admin approves found submission (available to claim status)
//item shows up on browse items (available to claim)
//Claim form filled out (status pending retrieval)
//admin approves claim (claimed status)

//statuses:
//pending submission
//available to claim 
//pending retrieval
//claimed and ready to retrieve
//claimed and retrieved 


// scripts/admin_dashboard.js
import {
    db, auth,
    collection, query, where, getDocs, doc, updateDoc
} from './firebaseModule.js';

// Load admin dashboard data
async function loadAdminDashboard() {
    const user = auth.currentUser;
    if (!user) {
        console.error("No user logged in");
        return;
    }
    
    console.log("Loading admin dashboard for:", user.email);
    
    try {
        await Promise.all([
            loadReadyToClaim(), 
            loadPendingRetrievalRequests(), //someone filled out claim form, admin must approve. 
            loadPendingSubmissions(), //someone filled out report found item form, admin must approve
            loadFoundItems(), //found items available for people to claim
            loadReunitedItems() //items that have been recently reunited with their owners 
        ]);
    } catch (error) {
        console.error("Error loading admin dashboard:", error);
    }
}

 //Load items ready to claim (approved claims waiting pickup)
async function loadReadyToClaim() {
    const claimsRef = collection(db, "Item_Data");
    const q = query(claimsRef, where("status", "==", "claimed and ready to retrieve"));
    
    const snapshot = await getDocs(q);
    
    const targetTitle = Array.from(document.querySelectorAll(".subsection-title"))
    .find(el => el.textContent.trim() === "Ready to Claim");

    const container = targetTitle?.closest(".items-section");
    
    if (!container) return;
    
    // Clear existing cards
    const existingCards = container.querySelectorAll('.dashboard-item-card');
    existingCards.forEach(card => card.remove());
    
    if (snapshot.empty) {
        const emptyMsg = document.createElement('p');
        emptyMsg.className = 'subtitle';
        emptyMsg.textContent = 'No items waiting for pickup.';
        container.appendChild(emptyMsg);
        return;
    }
    
    for (const claimDoc of snapshot.docs) {
        const claim = claimDoc.data();
        
        // Calculate pickup deadline
        const approvedDate = new Date(claim.reviewed_at);
        const pickupDeadline = new Date(approvedDate);
        pickupDeadline.setDate(pickupDeadline.getDate() + 7);
        
        const card = document.createElement('div');
        card.className = 'dashboard-item-card';
        card.innerHTML = `
            <img src="${claim.image_url || 'assets/placeholders/lost-item1.jpg'}" class="dashboard-item-img">
            <div class="dashboard-item-info">
                <h4>${claim.item_name}</h4>
                <p class="item-location" style="padding-bottom: 5px;">Claimed by <span class="tag tag-gray">${claim.claimant_email || 'Unknown'}</span></p>
                <p class="item-location" style="padding-bottom: 5px;">Approved on ${formatDate(claim.approved_at)}</p>
            </div>
            <button class="btn btn-orange btn-sm" data-modal="claimed">View Details</button>
            <button class="btn btn-blue btn-sm mark-retrieved" data-claim-id="${claimDoc.id}">Item Retrieved</button>
        `;
        
        card.dataset.claimData = JSON.stringify(claim);
        container.appendChild(card);
    }
    
    // Add event listeners to "Item Retrieved" buttons
    document.querySelectorAll('.mark-retrieved').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const claimId = e.target.dataset.claimId;
            await markItemRetrieved(claimId);
        });
    });
}


// Load pending retrieval requests (claims waiting approval)
async function loadPendingRetrievalRequests() {
    const claimsRef = collection(db, "Claims");
    const q = query(claimsRef, where("status", "==", "pending"));
    
    const snapshot = await getDocs(q);
    const targetTitle = Array.from(document.querySelectorAll(".subsection-title"))
    .find(el => el.textContent.trim() === "Item Retrieval Requests");

    const container = targetTitle?.closest(".items-section");
    
    if (!container) return;
    
    // Clear existing cards
    const existingCards = container.querySelectorAll('.dashboard-item-card');
    existingCards.forEach(card => card.remove());
    
    if (snapshot.empty) {
        const emptyMsg = document.createElement('p');
        emptyMsg.className = 'subtitle';
        emptyMsg.textContent = 'No pending retrieval requests.';
        emptyMsg.style.marginTop = '10px';
        container.appendChild(emptyMsg);
        return;
    }
    
    for (const claimDoc of snapshot.docs) {
        const claim = claimDoc.data();
        
        const card = document.createElement('div');
        card.className = 'dashboard-item-card';
        card.innerHTML = `
            <img src="${claim.item_image || 'assets/placeholders/lost-item1.jpg'}" class="dashboard-item-img">
            <div class="dashboard-item-info">
                <h4>${claim.item_name}</h4>
                <p class="item-location" style="padding-bottom: 5px;">Claimed by <span class="tag tag-gray">${claim.claimant_email || 'Unknown'}</span></p>
                <p class="item-location" style="padding-bottom: 5px;">Submitted by <span class="tag tag-gray">${claim.submitter_email || 'Unknown'}</span></p>
                <p class="item-location" style="padding-bottom: 5px;">Submitted on ${formatDate(claim.date_found)}</p>
            </div>
            <button class="btn btn-orange btn-sm" data-modal="claimed">View Details</button>
            <a href="review-claim.html?id=${claimDoc.id}"><button class="btn btn-blue btn-sm">Review</button></a>
        `;
        
        card.dataset.claimData = JSON.stringify(claim);
        container.appendChild(card);
    }
}

// Load pending item submissions (items waiting approval)
async function loadPendingSubmissions() {
    const itemsRef = collection(db, "Item_Data");
    const q = query(itemsRef, where("status", "==", "pending submission"));
    
    const snapshot = await getDocs(q);
    const targetTitle = Array.from(document.querySelectorAll(".subsection-title"))
    .find(el => el.textContent.trim() === "Item Submission Requests");

    const container = targetTitle?.closest(".items-section");
    
    if (!container) return;
    
    // Clear existing cards
    const existingCards = container.querySelectorAll('.dashboard-item-card');
    existingCards.forEach(card => card.remove());
    
    if (snapshot.empty) {
        const emptyMsg = document.createElement('p');
        emptyMsg.className = 'subtitle';
        emptyMsg.textContent = 'No pending item submissions.';
        emptyMsg.style.marginTop = '10px';
        container.appendChild(emptyMsg);
        return;
    }
    
    snapshot.docs.forEach(itemDoc => {
        const item = itemDoc.data();
        
        const card = document.createElement('div');
        card.className = 'dashboard-item-card';
        card.innerHTML = `
            <img src="${item.image_url || 'assets/placeholders/lost-item1.jpg'}" class="dashboard-item-img">
            <div class="dashboard-item-info">
                <h4>${item.item_name || item.category}</h4>
                <p class="item-location" style="padding-bottom: 5px;">Submitted by <span class="tag tag-gray">${item.submitter_email || 'Unknown'}</span></p>
                <p class="item-location" style="padding-bottom: 5px;">Submitted on ${formatDate(item.date_found)}</p>
                <p class="item-location">Found in ${item.location_found}</p>
            </div>
            <button class="btn btn-orange btn-sm" data-modal="reported">View Details</button>
            <button class="btn btn-blue btn-sm approve-item" data-item-id="${itemDoc.id}">Approve</button>
        `;
        
        card.dataset.itemData = JSON.stringify(item);
        container.appendChild(card);
    });
    
    // Add event listeners to approve buttons
    document.querySelectorAll('.approve-item').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const itemId = e.target.dataset.itemId;
            await approveItem(itemId);
        });
    });
}

// Load found items (approved and available)
async function loadFoundItems() {
    const itemsRef = collection(db, "Item_Data");
    const q = query(itemsRef, where("status", "==", "available to claim"));
    
    const snapshot = await getDocs(q);
    const targetTitle = Array.from(document.querySelectorAll(".subsection-title"))
    .find(el => el.textContent.trim() === "Found Items");

    const container = targetTitle?.closest(".items-section");
    
    if (!container) return;
    
    // Clear existing cards (keep title and subtitle)
    const existingCards = container.querySelectorAll('.dashboard-item-card');
    existingCards.forEach(card => card.remove());
    
    if (snapshot.empty) {
        const emptyMsg = document.createElement('p');
        emptyMsg.className = 'subtitle';
        emptyMsg.textContent = 'No available items currently listed.';
        emptyMsg.style.marginTop = '10px';
        container.appendChild(emptyMsg);
        return;
    }
    
    // Show only first 5 items
    const itemsToShow = snapshot.docs.slice(0, 5);
    
    itemsToShow.forEach(itemDoc => {
        const item = itemDoc.data();
        
        const card = document.createElement('div');
        card.className = 'dashboard-item-card';
        card.innerHTML = `
            <img src="${item.image_url || 'assets/placeholders/lost-item1.jpg'}" class="dashboard-item-img">
            <div class="dashboard-item-info">
                <h4>${item.item_name || item.category}</h4>
                <p class="item-location" style="padding-bottom: 5px;">Submitted by <span class="tag tag-gray">${item.submitter_email || 'Unknown'}</span></p>
                <p class="item-location" style="padding-bottom: 5px;">Submitted on ${formatDate(item.date_found)}</p>
                <p class="item-location">Found in ${item.location_found}</p>
            </div>
            <button class="btn btn-orange btn-sm" data-modal="reported">View Details</button>
        `;
        
        card.dataset.itemData = JSON.stringify(item);
        container.appendChild(card);
    });
}

// Load reunited items (completed claims)
async function loadReunitedItems() {
    const claimsRef = collection(db, "Item_Data");
    const q = query(claimsRef, where("status", "==", "claimed and retrieved"));
    
    const snapshot = await getDocs(q);
    const targetTitle = Array.from(document.querySelectorAll(".subsection-title"))
    .find(el => el.textContent.trim() === "Reunited Items");

    const container = targetTitle?.closest(".items-section");
    
    if (!container) return;
    
    // Clear existing cards
    const existingCards = container.querySelectorAll('.dashboard-item-card');
    existingCards.forEach(card => card.remove());
    
    if (snapshot.empty) {
        console.log("empty:(");
        const emptyMsg = document.createElement('p');
        emptyMsg.className = 'subtitle';
        emptyMsg.textContent = 'No reunited items yet.';
        container.appendChild(emptyMsg);
        return;
    }
    
    // Show only first 5 items
    const itemsToShow = snapshot.docs.slice(0, 5);
    
    itemsToShow.forEach(claimDoc => {
        const claim = claimDoc.data();
        
        const card = document.createElement('div');
        card.className = 'dashboard-item-card';
        card.innerHTML = `
            <img src="${claim.image_url || 'assets/placeholders/lost-item1.jpg'}" class="dashboard-item-img">
            <div class="dashboard-item-info">
                <h4>${claim.item_name}</h4>
                <p class="item-location" style="padding-bottom: 5px;">Submitted by <span class="tag tag-gray">${claim.submitter_email || 'Unknown'}</span></p>
                <p class="item-location" style="padding-bottom: 5px;">Retrieved by <span class="tag tag-gray">${claim.receiver_email || 'Unknown'}</span></p>
                <p class="item-location">Submitted on ${formatDate(claim.date_found)}</p>
                <p class="item-location">Retrieved on ${formatDate(claim.retrieved_at)}</p>
            </div>
            <button class="btn btn-orange btn-sm" data-modal="claimed">View Details</button>
        `;
        
        card.dataset.claimData = JSON.stringify(claim);
        container.appendChild(card);
    });
}

// Approve item submission
async function approveItem(itemId) {
    if (!confirm('Approve this item submission?')) return;
    
    try {
        const user = auth.currentUser;
        const itemRef = doc(db, "Item_Data", itemId);
        
        await updateDoc(itemRef, {
            status: "available to claim",
            approved_at: new Date().toISOString(),
            approver_id: user.uid,
            approver_email: user.email
        });
        
        alert('Item approved and now visible to students!');
        loadAdminDashboard(); // Reload dashboard
        
    } catch (error) {
        console.error("Error approving item:", error);
        alert('Failed to approve item. Please try again.');
    }
}

// Mark item as retrieved
async function markItemRetrieved(claimId) {
    if (!confirm('Mark this item as retrieved?')) return;
    
    try {
        const itemRef = doc(db, "Item_Data", claimId);
        await updateDoc(itemRef, {
            status: "claimed and retrieved",
            retrieved_at: new Date().toISOString()
        });
        
        alert('Item marked as retrieved!');
        loadAdminDashboard(); // Reload dashboard
        
    } catch (error) {
        console.error("Error marking item as retrieved:", error);
        alert('Failed to update item status. Please try again.');
    }
}

// Helper: Format date
function formatDate(isoString) {
    if (!isoString) return 'Unknown date';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
}

// Initialize when auth is ready
auth.onAuthStateChanged((user) => {
    if (user) {
        loadAdminDashboard();
    }
});




// Add these at the end of student_dashboard.js

// Populate the reported item modal
window.populateReportedModal = function(itemData, itemId) {
    console.log("Populating reported modal:", itemData);
    
    const modal = document.getElementById("reported-details-modal");
    if (!modal) return;
    
    // Update image
    const img = modal.querySelector('.details-img');
    if (img) img.src = itemData.image_url || 'assets/placeholders/lost-item1.jpg';
    
    // Update title
    const title = modal.querySelector('h2');
    if (title) title.textContent = itemData.item_name || itemData.category || 'Unknown Item';
    
    // Update tag if exists
    const tag = modal.querySelector('.tag-orange');
    if (tag) tag.textContent = 'Item Submission';
    
    // Update location and time tags
    const tags = modal.querySelectorAll('.tag-transparent');
    if (tags[0]) tags[0].innerHTML = `<img src="assets/icons/location.svg">${itemData.location_found || 'Unknown'}`;
    if (tags[1]) tags[1].innerHTML = `<img src="assets/icons/clock.svg">${formatDate(itemData.submitted_at) || 'Unknown'}`;
    
    // Update submitter info
    const paragraphs = modal.querySelectorAll('p');
    paragraphs.forEach(p => {
        if (p.innerHTML.includes('Student Name:')) {
            p.innerHTML = `<b>Student Name:</b> ${itemData.submitter_name || 'N/A'}`;
        }
        if (p.innerHTML.includes('Student Email:')) {
            p.innerHTML = `<b>Student Email:</b> ${itemData.submitter_email || 'N/A'}`;
        }
        if (p.innerHTML.includes('Public description:')) {
            p.innerHTML = `<b>Public description:</b> ${itemData.public_description || 'N/A'}`;
        }
        if (p.innerHTML.includes('Private description:')) {
            p.innerHTML = `<b>Private description:</b> ${itemData.private_description || 'N/A'}`;
        }
    });
    
    // Update verification questions
    const verificationSection = Array.from(paragraphs).find(p => p.textContent.includes('Verification Questions'));
    if (verificationSection && itemData.verification_questions) {
        let html = '<p><b>Verification Questions</b></p>';
        itemData.verification_questions.forEach((q, index) => {
            html += `<p>Q${index + 1}: ${q.question || 'N/A'}</p>`;
            html += `<p>A${index + 1}: ${q.answer || 'N/A'}</p>`;
        });
        verificationSection.outerHTML = html;
    }
};

// Populate the claimed item modal
window.populateClaimedModal = function(claimData, claimId) {
    console.log("Populating claimed modal:", claimData);
    
    const modal = document.getElementById("claimed-details-modal");
    if (!modal) return;
    
    // Update image
    const img = modal.querySelector('.details-img');
    if (img) img.src = claimData.image_url || claimData.item_image || 'assets/placeholders/lost-item1.jpg';
    
    // Update title
    const title = modal.querySelector('h2');
    if (title) title.textContent = claimData.item_name || 'Unknown Item';
    
    // Update all paragraphs
    const paragraphs = modal.querySelectorAll('p');
    paragraphs.forEach(p => {
        if (p.innerHTML.includes('Student Name:')) {
            p.innerHTML = `<b>Student Name:</b> ${claimData.claimant_name || claimData.receiver_name || 'N/A'}`;
        }
        if (p.innerHTML.includes('Student Email:')) {
            p.innerHTML = `<b>Student Email:</b> ${claimData.claimant_email || claimData.receiver_email || 'N/A'}`;
        }
        if (p.innerHTML.includes('Lost on:')) {
            p.innerHTML = `<b>Lost on:</b> ${formatDate(claimData.submitted_at) || 'N/A'}`;
        }
    });
    
    // Update verification questions if they exist
    if (claimData.verification_answers) {
        const verificationSection = Array.from(paragraphs).find(p => p.textContent.includes('Verification Questions'));
        if (verificationSection) {
            let html = '<p><b>Verification Questions</b></p>';
            claimData.verification_answers.forEach((qa, index) => {
                html += `<p>Q${index + 1}: ${qa.question || 'N/A'}</p>`;
                html += `<p>A${index + 1}: ${qa.answer || 'N/A'}</p>`;
            });
            verificationSection.outerHTML = html;
        }
    }
    
    // Update additional information
    const additionalInfo = Array.from(paragraphs).find(p => p.previousElementSibling?.textContent?.includes('Additional Information'));
    if (additionalInfo) {
        additionalInfo.textContent = claimData.additional_notes || 'No additional notes.';
    }
};