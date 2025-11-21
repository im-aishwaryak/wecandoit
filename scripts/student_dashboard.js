import { db, auth, collection, query, where, getDocs } from './firebaseModule.js';

// Wait for auth state
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is logged in, load their dashboard data
        loadReadyToClaim(user.uid);
        loadPendingRetrievalRequests(user.uid);
        loadPendingSubmissions(user.uid);
        loadRetrievedItems(user.uid);
    } else {
        // No user logged in, redirect to login
        window.location.href = 'log-in.html';
    }
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
            ${details.map(detail => `<p class="item-location">${detail}</p>`).join('')}
        </div>
        ${buttons.map(btn => `<button class="btn ${btn.class} btn-sm" data-modal="${btn.modal}">${btn.text}</button>`).join('')}
    `;
    
    // Add event listeners to buttons
    buttons.forEach((btn, index) => {
        const buttonElement = card.querySelectorAll('button')[index];
        buttonElement.addEventListener('click', () => {
            if (btn.modal === 'reported') {
                openReportedModal(itemData, itemId);
            } else if (btn.modal === 'claimed') {
                openClaimedModal(claimData, claimId);
            }
        });
    });
    
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
    const claimsRef = collection(db, "Claims");
    const q = query(
        claimsRef,
        where("retriever_id", "==", userId),
        where("status", "==", "available to claim")
    );

    const snapshot = await getDocs(q);
    const container = document.getElementById('ready-to-claim-section');

    if (!container) return;

    // Clear existing cards (keep the heading and subtitle)
    container.querySelectorAll('.dashboard-item-card').forEach(card => card.remove());

    if (snapshot.empty) {
        const emptyMsg = document.createElement('p');
        emptyMsg.className = 'subtitle';
        emptyMsg.textContent = 'No items ready for pickup yet.';
        container.appendChild(emptyMsg);
        return;
    }

    for (const claimDoc of snapshot.docs) {
        const claim = claimDoc.data();

        const approvedDate = new Date(claim.reviewed_at);
        const pickupDeadline = new Date(approvedDate);
        pickupDeadline.setDate(pickupDeadline.getDate() + 7);

        const card = createDashboardCard({
            image: claim.item_image,
            title: claim.item_name,
            details: [
                `Approved on ${formatDate(claim.reviewed_at)}`,
                `Pick up by ${formatDate(pickupDeadline.toISOString())}`
            ],
            buttons: [
                { text: 'View Details', class: 'btn-orange', modal: 'claimed' }
            ],
            claimData: claim,
            claimId: claimDoc.id
        });

        container.appendChild(card);
    }
}

// Load pending retrieval requests
async function loadPendingRetrievalRequests(userId) {
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
        where("recipient_id", "==", userId)
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