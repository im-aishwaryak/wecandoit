// scripts/sign_up.js
import {
    db, auth, provider, signInWithPopup, createUserWithEmailAndPassword,
    doc, getDoc, setDoc
} from './firebaseModule.js';

let user;
const signInGoogleButton = document.getElementById("google-auth sign-in");
const signInEmailButton = document.getElementById("email sign-up");

// Check if already logged in
auth.onAuthStateChanged((currentUser) => {
    if (currentUser) {
        // Already logged in, redirect to appropriate dashboard
        redirectToDashboard(currentUser);
    }
});

const userGoogleSignIn = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        user = result.user;
        
        // Validate email domain
        if (!isValidEmail(user.email)) {
            await auth.signOut();
            alert("Please use a valid NCHS email (@apps.nsd.org for students or @nsd.org for staff)");
            return;
        }
        
        // Create user in database
        await addUser(user);
        
        // Set login flag
        localStorage.setItem("user_logged_in", "true");
        
        // Redirect to appropriate dashboard
        redirectToDashboard(user);
    } catch (error) {
        console.error("Google sign-in error:", error);
        alert("Sign-in failed: " + error.message);
    }
};

const userEmailSignIn = async () => {
    const fullname = document.getElementById("fullname").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    
    // Validate inputs
    if (!fullname || !email || !password || !confirmPassword) {
        alert("Please fill in all fields");
        return;
    }
    
    // Validate password match
    if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }
    
    // Validate password strength
    if (password.length < 6) {
        alert("Password must be at least 6 characters long");
        return;
    }
    
    // Validate email domain
    if (!isValidEmail(email)) {
        alert("Please use a valid NCHS email (@apps.nsd.org for students or @nsd.org for staff)");
        return;
    }
    
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        user = userCredential.user;
        
        // Create user record with full name
        await addUser(user, fullname);
        
        // Set login flag
        localStorage.setItem("user_logged_in", "true");
        
        // Redirect to appropriate dashboard
        redirectToDashboard(user);
    } catch (error) {
        console.error("Email sign-up error:", error);
        let errorMessage = "Sign-up failed. ";
        
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage += "This email is already registered. Please log in instead.";
                break;
            case 'auth/invalid-email':
                errorMessage += "Invalid email format.";
                break;
            case 'auth/weak-password':
                errorMessage += "Password is too weak. Please use a stronger password.";
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

// Add user to database
async function addUser(user, displayName = null) {
    if (!user || !user.email) {
        console.error("No user to add");
        return;
    }
    
    const userRef = doc(db, "User_Data", user.email);
    
    // Check if user already exists
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
        // User already exists, just update last login
        await setDoc(userRef, {
            last_login: new Date().toISOString()
        }, { merge: true });
        return;
    }
    
    // Determine user status
    let userStatus = "";
    if (user.email.endsWith("@apps.nsd.org")) {
        userStatus = "Student";
    } else if (user.email.endsWith("@nsd.org")) {
        userStatus = "Admin";
    }
    
    // Create new user record
    await setDoc(userRef, {
        email: user.email,
        displayName: displayName || user.displayName || "",
        status: userStatus,
        items_posted: 0,
        items_claimed: 0,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString()
    });
}

// Event listeners
if (signInGoogleButton) {
    signInGoogleButton.addEventListener('click', userGoogleSignIn);
}

if (signInEmailButton) {
    signInEmailButton.addEventListener('click', userEmailSignIn);
}