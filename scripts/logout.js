/**
 * @file logout.js
 * @description Handles user logout functionality.
 *
 * This module manages user sign-out from Firebase Authentication.
 * It also clears locally stored session data and redirects the
 * user to the login page after successful logout.
 *
 * Features:
 * - Firebase sign-out handling
 * - Local storage cleanup
 * - Safe event listener attachment
 * - Error handling for failed logout attempts
 *
 * @module logout
 * @author Aadhya Goyal
 * @version 1.0
 */


import { auth, signOut } from './firebaseModule.js';



/**
 * Logout button element from the DOM.
 *
 * This button triggers the Firebase sign-out process
 * when clicked.
 *
 * @type {HTMLElement|null}
 */
const logoutBtn = document.getElementById('logout-btn');


/**
 * Attaches logout functionality to the logout button.
 *
 * When clicked, this handler:
 * - Prevents default button behavior
 * - Clears user session data from localStorage
 * - Signs the user out from Firebase Authentication
 * - Redirects to the login page upon success
 *
 * Includes error handling for failed sign-out attempts.
 *
 * @listens click
 */
if (logoutBtn) {
    /**
     * Executes user logout process.
     *
     * Steps:
     * 1. Prevent default button behavior
     * 2. Clear authentication data from localStorage
     * 3. Sign out from Firebase Authentication
     * 4. Redirect user to login page
     *
     * @async
     * @param {Event} e - Click event from logout button
     * @returns {Promise<void>}
     */
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