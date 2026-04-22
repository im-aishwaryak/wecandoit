/**
 * @file logout.js
 * @description
 * Handles user logout functionality.
 *
 * This script:
 * - Listens for logout button clicks
 * - Clears localStorage session data
 * - Signs the user out of Firebase Authentication
 * - Redirects user to the login page
 *
 * Dependencies:
 * - firebaseModule.js
 *
 * LocalStorage keys used:
 * - user_logged_in
 * - user_identity
 *
 * Redirect target:
 * - log-in.html
 *
 * @author Aadhya Goyal, Aishwarya Kumaran, Aanya Rawal
 * @version 1.0
 */

import { auth, signOut } from './firebaseModule.js';


/**
 * Logout button element.
 *
 * When clicked, initiates logout process.
 *
 * @type {HTMLElement|null}
 */
const logoutBtn = document.getElementById('logout-btn');


/**
 * Ensures logout button exists before
 * attaching event listener.
 *
 * Prevents runtime errors if script
 * loads on pages without logout button.
 */
if (logoutBtn) {
    /**
     * Handles logout button click event.
     *
     * Workflow:
     * 1. Prevent default button behavior
     * 2. Clear local session storage
     * 3. Sign out from Firebase
     * 4. Redirect to login page
     *
     * @async
     * @param {Event} e Click event object
     */
    logoutBtn.addEventListener('click', async (e) => {

        /**
         * Prevents default browser behavior.
         *
         * Useful if logout button is inside
         * a form or anchor element.
         */
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
        
        /**
         * Handles logout failures.
         *
         * Logs error to console and
         * displays notification message.
         *
         * @param {Error} error Logout error object
         */
        } catch (error) {
            console.error("Error signing out:", error);
            showNotif("Failed to log out. Please try again.", "error");
        }
    });
}