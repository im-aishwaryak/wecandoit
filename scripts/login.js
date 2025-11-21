// scripts/login.js
import {
    db, auth, provider, signInWithPopup,
    doc, getDoc, setDoc, signInWithEmailAndPassword
} from './firebaseModule.js';

let user;
const logInGoogleButton = document.getElementById("google-auth btn");
const logInEmailButton = document.getElementById("email log-in");

// Check if already logged in
auth.onAuthStateChanged((currentUser) => {
    if (currentUser) {
        // Already logged in, redirect to appropriate dashboard
        redirectToDashboard(currentUser);
    }
});

const userGoogleLogIn = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        user = result.user;
        
        // Validate email domain
        if (!isValidEmail(user.email)) {
            await auth.signOut();
            alert("Please use a valid NCHS email (@apps.nsd.org for students or @nsd.org for staff)");
            return;
        }
        
        // Create/update user in database
        await addOrUpdateUser(user);
        
        // Set login flag
        localStorage.setItem("user_logged_in", "true");
        
        // Redirect to appropriate dashboard
        redirectToDashboard(user);
    } catch (error) {
        console.error("Google login error:", error);
        alert("Login failed: " + error.message);
    }
};

const userEmailLogIn = async () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    
    // Validate inputs
    if (!email || !password) {
        alert("Please enter both email and password");
        return;
    }
    
    // Validate email domain
    if (!isValidEmail(email)) {
        alert("Please use a valid NCHS email (@apps.nsd.org for students or @nsd.org for staff)");
        return;
    }
    
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        user = userCredential.user;
        
        // Set login flag
        localStorage.setItem("user_logged_in", "true");
        
        // Redirect to appropriate dashboard
        redirectToDashboard(user);
    } catch (error) {
        console.error("Email login error:", error);
        let errorMessage = "Login failed. ";
        
        switch (error.code) {
            case 'auth/invalid-credential':
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                errorMessage += "Invalid email or password.";
                break;
            case 'auth/invalid-email':
                errorMessage += "Invalid email format.";
                break;
            case 'auth/user-disabled':
                errorMessage += "This account has been disabled.";
                break;
            default:
                errorMessage += error.message;
        }
        
        alert(errorMessage);
    }
};

// Validate email domain
function isValidEmail(email) {
    return email.endsWith("@apps.nsd.org") || email.endsWith("@nsd.org");
}

// Determine user role and redirect
function redirectToDashboard(user) {
    if (user.email.endsWith("@nsd.org")) {
        // Admin user
        window.location.href = "admin-dashboard.html";
    } else if (user.email.endsWith("@apps.nsd.org")) {
        // Student user
        window.location.href = "dashboard.html";
    }
}

// Add or update user in database
async function addOrUpdateUser(user) {
    if (!user || !user.email) {
        console.error("No user to add");
        return;
    }
    
    console.log("=== ADDING/UPDATING USER IN DATABASE ===");
    console.log("User email:", user.email);
    console.log("User displayName:", user.displayName);
    
    const userRef = doc(db, "User_Data", user.email);
    
    try {
        // Check if user exists
        console.log("Checking if user exists...");
        const userSnap = await getDoc(userRef);
        
        // Determine user status
        let userStatus = "";
        if (user.email.endsWith("@apps.nsd.org")) {
            userStatus = "Student";
        } else if (user.email.endsWith("@nsd.org")) {
            userStatus = "Admin";
        }
        
        console.log("User status:", userStatus);
        
        if (!userSnap.exists()) {
            // New user - create record
            console.log("Creating new user document...");
            await setDoc(userRef, {
                email: user.email,
                displayName: user.displayName || "",
                status: userStatus,
                items_posted: 0,
                items_claimed: 0,
                created_at: new Date().toISOString(),
                last_login: new Date().toISOString()
            });
            console.log("✅ User document created successfully!");
        } else {
            // Existing user - update last login
            console.log("User exists, updating last login...");
            await setDoc(userRef, {
                last_login: new Date().toISOString()
            }, { merge: true });
            console.log("✅ User last login updated!");
        }
    } catch (error) {
        console.error("=== ERROR ADDING/UPDATING USER ===");
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        console.error("Full error:", error);
        
        if (error.code === 'permission-denied') {
            alert("Permission denied. Please check Firestore security rules.");
        }
    }
}

// Event listeners
if (logInGoogleButton) {
    logInGoogleButton.addEventListener('click', userGoogleLogIn);
}

if (logInEmailButton) {
    logInEmailButton.addEventListener('click', userEmailLogIn);
}