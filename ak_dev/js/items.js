import { db, storage } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { render } from "./ui.js";

async function loadItems() {
    const items = await getDocs(collection(db, "items"));
    let html = `<div class="items-grid">`;

    items.forEach(doc => {
        const it = doc.data();
        html += `
            <div class="item-card">
                <strong>${it.name}</strong><br>
                ${it.description}
            </div>`;
    });

    html += `</div>`;
    render(html, "appSection");
}

loadItems();
