/* import { db, auth, collection, query, where, getDocs } from './firebaseModule.js';

// Wait for auth state
// Wait for auth to be ready, then load data
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is logged in, load their dashboard data
        loadReadyToClaim(user.uid);
        loadPendingRetrievalRequests(user.uid);
        loadPendingSubmissions(user.uid);
        loadRetrievedItems(user.uid);
    }
    // Don't redirect here - let protect-student.js handle it
});




// Helper function to create dashboard card
function createDashboardCard({ image, title, tags, details, buttons, itemData, itemId, claimData, claimId }) {
    const card = document.createElement('div');
    card.className = 'dashboard-item-card';

    // Store data attributes for modal
    if (itemData) {
        card.dataset.itemData = JSON.stringify(itemData);
        card.dataset.itemId = itemId;
    }
    if (claimData) {
        card.dataset.claimData = JSON.stringify(claimData);
        card.dataset.claimId = claimId;
    }

    card.innerHTML = `
    <img src="${image}" class="dashboard-item-img" alt="${title}">
    <div class="dashboard-item-info">
        <h4>${title}</h4>
        ${tags ? tags.map(tag => `<span class="tag ${tag.class}">${tag.text}</span>`).join('') : ''}
        ${claimData?.claimant_email ? `<p class="item-location" style="padding-bottom: 5px;">Claimed by <span class="tag tag-gray">${claimData.claimant_email}</span></p>` : ''}
        ${itemData?.receiver_email ? `<p class="item-location" style="padding-bottom: 5px;">Claimed by <span class="tag tag-gray">${itemData.receiver_email}</span></p>` : ''}
        ${details.map(detail => `<p class="item-location">${detail}</p>`).join('')}
    </div>
    ${buttons.map(btn => `<button class="btn ${btn.class} btn-sm" data-modal="${btn.modal}">${btn.text}</button>`).join('')}
`;


    return card;
}

// Format date helper
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
}

// Format relative date helper
function formatRelativeDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'today';
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
}





// Load items ready to claim (approved claims)
async function loadReadyToClaim(userId) {
    console.log("🎯 [READY_TO_CLAIM] Starting loadReadyToClaim...");
    console.log("🎯 [READY_TO_CLAIM] User ID:", userId);
    
    const claimsRef = collection(db, "Item_Data");
    console.log("🎯 [READY_TO_CLAIM] Collection reference created: Item_Data");
    
    const q = query(
        claimsRef,
        where("reciever_id", "==", userId),
        where("status", "==", "claimed and ready to retrieve")
    );
    console.log("🎯 [READY_TO_CLAIM] Query created with filters:", {
        reciever_id: userId,
        status: "claimed and ready to retrieve"
    });

    console.log("🎯 [READY_TO_CLAIM] Executing query...");
    const snapshot = await getDocs(q);
    console.log("🎯 [READY_TO_CLAIM] Query results:", {
        totalDocs: snapshot.size,
        empty: snapshot.empty
    });
    
    // Debug: Log all documents found
    if (!snapshot.empty) {
        console.log("🎯 [READY_TO_CLAIM] Documents found:");
        snapshot.docs.forEach((doc, index) => {
            const data = doc.data();
            console.log(`🎯 [READY_TO_CLAIM] Doc ${index + 1}:`, {
                id: doc.id,
                item_name: data.item_name,
                reciever_id: data.reciever_id,
                receiver_id: data.receiver_id,
                status: data.status,
                reviewed_at: data.reviewed_at
            });
        });
    }

    const container = document.getElementById('ready-to-claim-section');
    console.log("🎯 [READY_TO_CLAIM] Container found:", !!container);

    if (!container) {
        console.error("❌ [READY_TO_CLAIM] Container 'ready-to-claim-section' not found!");
        return;
    }

    // Clear existing cards (keep the heading and subtitle)
    const existingCards = container.querySelectorAll('.dashboard-item-card');
    console.log("🎯 [READY_TO_CLAIM] Clearing existing cards:", existingCards.length);
    existingCards.forEach(card => card.remove());

    if (snapshot.empty) {
        console.log("[READY_TO_CLAIM] No items found - showing empty message");
        const emptyMsg = document.createElement('p');
        emptyMsg.className = 'subtitle';
        emptyMsg.textContent = 'No items ready for pickup yet.';
        container.appendChild(emptyMsg);
        return;
    }

    console.log("🎯 [READY_TO_CLAIM] Creating cards for", snapshot.size, "items...");

    for (const claimDoc of snapshot.docs) {
        const claim = claimDoc.data();
        
        console.log("📋 [READY_TO_CLAIM] Processing item:", {
            id: claimDoc.id,
            item_name: claim.item_name,
            reviewed_at: claim.reviewed_at,
            image_url: claim.image_url ? "present" : "missing"
        });

        // ADD SAFETY CHECKS HERE
        let approvedDateStr = 'N/A';
        let pickupDeadlineStr = 'N/A';
        
        if (claim.reviewed_at) {
            try {
                const approvedDate = new Date(claim.reviewed_at);
                if (!isNaN(approvedDate.getTime())) {
                    approvedDateStr = formatDate(claim.reviewed_at);
                    
                    const pickupDeadline = new Date(approvedDate);
                    pickupDeadline.setDate(pickupDeadline.getDate() + 7);
                    pickupDeadlineStr = formatDate(pickupDeadline.toISOString());
                }
            } catch (error) {
                console.error("📋 [READY_TO_CLAIM] Error parsing date:", error);
            }
        }
        
        console.log("📋 [READY_TO_CLAIM] Creating card...");
        const card = createDashboardCard({
            image: claim.image_url,
            title: claim.item_name,
            details: [
                `Approved by ${claim.approver_email || 'Unknown'} on ${approvedDateStr}`,
                `Pick up by ${pickupDeadlineStr}`
            ],
            buttons: [
                { text: 'View Details', class: 'btn-orange', modal: 'claimed' }
            ],
            claimData: claim,
            claimId: claimDoc.id
        });

        console.log("📋 [READY_TO_CLAIM] Card created, appending to container");
        container.appendChild(card);
    }
    
    console.log("✅ [READY_TO_CLAIM] Function complete!");
}

// Load pending retrieval requests
async function loadPendingRetrievalRequests(userId) {
    console.log("loading pending retrivals...")
    const claimsRef = collection(db, "Claims");
    const q = query(
        claimsRef,
        where("claimant_id", "==", userId),
        where("status", "==", "pending")
    );

    const snapshot = await getDocs(q);
    const container = document.getElementById('pending-retrieval-section');

    if (!container) return;

    container.querySelectorAll('.dashboard-item-card').forEach(card => card.remove());

    if (snapshot.empty) {
        const emptyMsg = document.createElement('p');
        emptyMsg.className = 'subtitle';
        emptyMsg.textContent = 'No pending retrieval requests.';
        emptyMsg.style.marginTop = '10px';
        container.appendChild(emptyMsg);
        return;
    }

    snapshot.docs.forEach(claimDoc => {
        const claim = claimDoc.data();

        const card = createDashboardCard({
            image: claim.item_image,
            title: claim.item_name,
            details: [`Submitted on ${formatDate(claim.submitted_at)}`],
            buttons: [{ text: 'View Details', class: 'btn-orange', modal: 'claimed' }],
            claimData: claim,
            claimId: claimDoc.id
        });

        container.appendChild(card);
    });
}

// Load pending submissions
async function loadPendingSubmissions(userId) {
    const itemsRef = collection(db, "Item_Data");
    const q = query(
        itemsRef,
        where("submitter_id", "==", userId),
        where("status", "==", "pending submission")
    );



    const snapshot = await getDocs(q);
    const container = document.getElementById('pending-submissions-section');

    if (!container) return;

    container.querySelectorAll('.dashboard-item-card').forEach(card => card.remove());

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

        const card = createDashboardCard({
            image: item.image_url,
            title: item.item_name || item.category,
            details: [
                `Submitted on ${formatDate(item.submitted_at)}`,
                `Found in ${item.location_found}`
            ],
            buttons: [{ text: 'View Details', class: 'btn-orange', modal: 'reported' }],
            itemData: item,
            itemId: itemDoc.id
        });

        container.appendChild(card);
    });
}

// Load retrieved items
async function loadRetrievedItems(userId) {
    const claimsRef = collection(db, "Item_Data");

    // Query 1: Items where user is the submitter
    const q1 = query(
        claimsRef,
        where("submitter_id", "==", userId)
    );

    // Query 2: Items where user is the recipient/claimant
    const q2 = query(
        claimsRef,
        where("reciever_id", "==", userId)
    );

    // Execute both queries
    const [snapshot1, snapshot2] = await Promise.all([
        getDocs(q1),
        getDocs(q2)
    ]);

    const container = document.getElementById('your-items-section');

    if (!container) return;

    container.querySelectorAll('.dashboard-item-card').forEach(card => card.remove());

    // Combine results from both queries
    const allDocs = [...snapshot1.docs, ...snapshot2.docs];

    if (allDocs.length === 0) {
        const emptyMsg = document.createElement('p');
        emptyMsg.className = 'subtitle';
        emptyMsg.textContent = 'No items yet.';
        container.appendChild(emptyMsg);
        return;
    }

    // Remove duplicates (in case an item appears in both queries)
    const uniqueDocs = new Map();
    allDocs.forEach(doc => {
        uniqueDocs.set(doc.id, doc);
    });

    uniqueDocs.forEach((claimDoc) => {
        const claim = claimDoc.data();

        // Determine if user was submitter or recipient
        const isSubmitter = claim.submitter_id === userId;
        const tagText = isSubmitter ? 'Item Submission' : 'Item Retrieval';
        const tagClass = isSubmitter ? 'tag-blue' : 'tag-orange';

        const card = createDashboardCard({
            image: claim.image_url,
            title: claim.item_name,
            tags: [{ text: tagText, class: tagClass }],
            details: [`Status: ${claim.status || 'N/A'}`],
            buttons: [{ text: 'View Details', class: 'btn-orange', modal: 'claimed' }],
            claimData: claim,
            claimId: claimDoc.id
        });

        container.appendChild(card);
    });
}



// VIEW DETAILS POP UP

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
*/ 



import {
    db, auth,
    collection, query, where, getDocs, doc, updateDoc
} from './firebaseModule.js';

let user = ""; 
// Load student dashboard data
async function loadStudentDashboard() {
    user = auth.currentUser;
    if (!user) {
        console.error("No user logged in");
        return;
    }
   
    console.log("Loading student dashboard for:", user.email);
   
    try {
        await Promise.all([
            loadReadyToClaim(),
            loadPendingRetrievalRequests(), //someone filled out claim form, admin must approve.
            loadPendingSubmissions(), //someone filled out report found item form, admin must approve
            loadFoundItems(), //found items available for people to claim
        ]);
    } catch (error) {
        console.error("Error loading student dashboard:", error);
    }
}


 //Load items ready to claim (approved claims waiting pickup)
async function loadReadyToClaim() {
    console.log("ready to claim being loaded.... ")
    const claimsRef = collection(db, "Claims");
    const q = query(
        claimsRef,
        where("claimant_email", "==", user.email),
        where("status", "==", "approved")
    );
    const snapshot = await getDocs(q);
   
    const targetTitle = Array.from(document.querySelectorAll(".items-section"))
    .find(section => section.querySelector("h2")?.textContent.trim() === "Ready to Claim");


    const container = targetTitle?.closest(".items-section");
   
    if (!container){
        console.log("ts pmo")
        return;
    }
        
   
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
            <img src="${claim.item_image || 'assets/placeholders/lost-item1.jpg'}" class="dashboard-item-img">
            <div class="dashboard-item-info">
                <h4>${claim.item_name}</h4>
                <p class="item-location" style="padding-bottom: 5px;"></p>
                <p class="item-location" style="padding-bottom: 5px;">Approved on ${formatDate(claim.reviewed_at)}</p>
            </div>
            <!--<button class="btn btn-orange btn-sm" data-modal="claimed">View Details</button>-->
        `;
       
        card.dataset.claimData = JSON.stringify(claim);
        container.appendChild(card);
    }
}





// Load pending retrieval requests (claims waiting approval)
async function loadPendingRetrievalRequests() {
    const claimsRef = collection(db, "Claims");
    const q = query(
        claimsRef,
        where("claimant_email", "==", user.email),
        where("status", "==", "pending")
    );
   
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
                <p class="item-location" style="padding-bottom: 5px;">Submitted on ${formatDate(claim.lost_date)}</p>
            </div>
            <!--<button class="btn btn-orange btn-sm" data-modal="claimed">View Details</button>-->
        `;
       
        card.dataset.claimData = JSON.stringify(claim);
        container.appendChild(card);
    }
}


// Load pending item submissions (items waiting approval)
async function loadPendingSubmissions() {
    const itemsRef = collection(db, "Item_Data");
    const q = query(
        itemsRef,
        where("submitter_email", "==", user.email),
        where("status", "==", "pending submission")
    );
   
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
                <p class="item-location" style="padding-bottom: 5px;">Submitted on ${formatDate(item.date_found)} </p>
                <p class="item-location">Found in ${item.location_found}</p>
            </div>
            <!--<button class="btn btn-orange btn-sm" data-modal="reported">View Details</button>-->
        `;
       
        card.dataset.itemData = JSON.stringify(item);
        container.appendChild(card);
    });
   
}


// Load found items (approved and available)
async function loadFoundItems() {
    const claimsRef = collection(db, "Item_Data");

    // Query: Items where user is the recipient/claimant
    const q = query(
        claimsRef,
        where("reciever_id", "==", user.email)
    );

   
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
                <p class="item-location" style="padding-bottom: 5px;">Submitted on ${formatDate(item.date_found)} </p>
                <p class="item-location">Found in ${item.location_found}</p>
            </div>
            <!--<button class="btn btn-orange btn-sm" data-modal="reported">View Details</button>-->
        `;
       
        card.dataset.itemData = JSON.stringify(item);
        container.appendChild(card);
    });
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
        loadStudentDashboard();
    }
});
