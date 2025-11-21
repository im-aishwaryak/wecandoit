import { auth, db, doc, getDoc } from './firebaseModule.js';

auth.onAuthStateChanged(async (user) => {
    if (!user) {
        // Not logged in, redirect to login
        console.log("No user logged in, redirecting to login");
        window.location.href = 'log-in.html';
        return;
    }

    try {
        // Get user data from database
        const userDoc = await getDoc(doc(db, "Users", user.uid));
        
        if (userDoc.exists()) {
            const userData = userDoc.data();
            
            if (userData.status !== 'Admin') {
                // User is not admin, redirect to student dashboard
                console.log("Non-admin trying to access admin page, redirecting");
                window.location.href = 'student-dashboard.html';
                return;
            }
            
            // User is an admin, allow access
            console.log("Admin access granted");
            
        } else {
            // User document doesn't exist
            console.error("User document not found");
            window.location.href = 'log-in.html';
        }
        
    } catch (error) {
        console.error("Error checking user status:", error);
        window.location.href = 'log-in.html';
    }
});