import { auth } from './firebaseModule.js';

auth.onAuthStateChanged((user) => {
    if (!user) {
        // Not logged in, redirect to login
        console.log("No user logged in, redirecting to login");
        window.location.href = 'log-in.html';
    } else {
        console.log("User is logged in, access granted");
    }
});