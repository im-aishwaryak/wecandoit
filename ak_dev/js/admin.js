import { db } from "./firebase.js";
import { getDocs, collection } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { render } from "./ui.js";

export async function loadAdminDashboard() {
    const users = await getDocs(collection(db, "users"));

    render(`
        <div class="card admin-grid">
            <div class="admin-card">
                <div class="stat-number">${users.size}</div>
                Registered Users
            </div>
        </div>
    `, "appSection");
}
