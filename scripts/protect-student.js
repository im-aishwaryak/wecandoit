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
            
            if (userData.status === 'Admin') {
                // User is admin, redirect to admin dashboard
                console.log("Admin trying to access student page, redirecting");
                window.location.href = 'admin-dashboard.html';
                return;
            }
            
            // User is a student, allow access
            console.log("Student access granted");
            
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