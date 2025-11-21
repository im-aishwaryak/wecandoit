import { auth, signOut } from './firebaseModule.js';

const logoutBtn = document.getElementById('logout-btn');

if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        try {
            // Clear localStorage first
            localStorage.removeItem('user_logged_in');
            localStorage.removeItem('user_identity');
            
            // Then sign out
            await signOut(auth);
            
            console.log("User signed out successfully");
            
            // Redirect to login page
            window.location.href = 'log-in.html';
            
        } catch (error) {
            console.error("Error signing out:", error);
            alert("Failed to log out. Please try again.");
        }
    });
}