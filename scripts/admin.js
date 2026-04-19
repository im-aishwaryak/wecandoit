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

    const container = document.getElementById("readyToClaimContainer");
    if (!container) { console.log("ts pmo"); return; }

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

    const tabCount = document.getElementById("readyCount");
    if (tabCount) {
        tabCount.textContent = snapshot.size;
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
                <p class="item-location" style="padding-bottom: 5px;"></p>
                <p class="item-location" style="padding-bottom: 5px;">Approved on ${formatDate(claim.approved_at)}</p>
            </div>
            <!--<button class="btn btn-orange btn-sm" data-modal="claimed">View Details</button>-->
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
    const claimsRef = collection(db, "Item_Data");
    const q = query(claimsRef, where("status", "==", "pending retrieval"));

    const snapshot = await getDocs(q);

    const container = document.getElementById("pendingRetrievalContainer");
    if (!container) { console.log("ts pmo"); return; }

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

    const tabCount = document.getElementById("claimingCount");
    if (tabCount) {
        tabCount.textContent = snapshot.size;
    }

    for (const claimDoc of snapshot.docs) {
        const claim = claimDoc.data();

        const card = document.createElement('div');
        card.className = 'dashboard-item-card';
        card.innerHTML = `
            <img src="${claim.image_url || 'assets/placeholders/lost-item1.jpg'}" class="dashboard-item-img">
            <div class="dashboard-item-info">
                <h4>${claim.item_name}</h4>
                <p class="item-location" style="padding-bottom: 5px;">Submitted on ${formatDate(claim.date_found)}</p>
            </div>
            <!--<button class="btn btn-orange btn-sm" data-modal="claimed">View Details</button>-->
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
    const container = document.getElementById("pendingSubmissionsContainer");
    if (!container) { console.log("ts pmo"); return; }

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

    const tabCount = document.getElementById("turnedinCount");
    if (tabCount) {
        tabCount.textContent = snapshot.size;
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
    const container = document.getElementById("catalogContainer");
    if (!container) { console.log("ts pmo"); return; }

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

    const tabCount = document.getElementById("catalogCount");
    if (tabCount) {
        tabCount.textContent = snapshot.size;
    }

    // Show only first 5 items
    //const itemsToShow = snapshot.docs.slice(0, 5);

    // Show all items
    const itemsToShow = snapshot.docs;

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


// Load reunited items (completed claims)
async function loadReunitedItems() {
    const claimsRef = collection(db, "Item_Data");
    const q = query(claimsRef, where("status", "==", "claimed and retrieved"));

    const snapshot = await getDocs(q);
    const container = document.getElementById("historyContainer");
    if (!container) { console.log("ts pmo"); return; }

    if (!container) return;

    // Clear existing cards
    const existingCards = container.querySelectorAll('.dashboard-item-card');
    existingCards.forEach(card => card.remove());

    if (snapshot.empty) {
        console.log("empty:(")
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
                <p class="item-location">Submitted on ${formatDate(claim.date_found)} </p>
                <p class="item-location">Retrieved on ${formatDate(claim.date_found)}</p>
            </div>
            <!--<button class="btn btn-orange btn-sm" data-modal="claimed">View Details</button>-->
        `;

        card.dataset.claimData = JSON.stringify(claim);
        container.appendChild(card);
    });
}


// Approve item submission
async function approveItem(itemId) {
    const confirmed = await showConfirm("Approve this item submission?");
    if (!confirmed) return; 

    try {
        const user = auth.currentUser;
        const itemRef = doc(db, "Item_Data", itemId);

        await updateDoc(itemRef, {
            status: "available to claim",
            approved_at: new Date().toISOString(),
        });

        showNotif("Item approved and now visible to students!", "success");
        loadAdminDashboard(); // Reload dashboard

    } catch (error) {
        console.error("Error approving item:", error);
        showNotif("Failed to approve item. Please try again.", "error"); 
    }
}


// Mark item as retrieved
async function markItemRetrieved(claimId) {
    const confirmed = await showConfirm("Mark this item as retrieved?");
    if (!confirmed) return; 

    try {
        const itemRef = doc(db, "Item_Data", claimId);
        await updateDoc(itemRef, {
            status: "claimed and retrieved",
            retrieved_at: new Date().toISOString()
        });

     
        showNotif('Item marked as retrieved', 'success'); 
        loadAdminDashboard(); // Reload dashboard

    } catch (error) {
        console.error("Error marking item as retrieved:", error);
        showNotif("Failed to update item status. Please try again.", "error"); 
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
