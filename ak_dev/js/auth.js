import { auth, hashAnswer } from "./firebase.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } 
    from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { show, render } from "./ui.js";
import { db } from "./firebase.js";
import { setDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

render(`
    <div class="card auth-box">
        <div class="auth-title">Log In</div>
        <input id="email" class="input-box" placeholder="Email">
        <input id="password" type="password" class="input-box" placeholder="Password"> 
        <button class="btn btn-primary" id="loginBtn">Log In</button>
    </div>
`, "authSection");

document.getElementById("loginBtn").onclick = async () => {
    const email = email.value;
    const pass = password.value;
    await signInWithEmailAndPassword(auth, email, pass);
};

onAuthStateChanged(auth, user => {
    if (user) show("appSection");
    else show("authSection");
});
