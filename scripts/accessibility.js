import { db, auth, doc, getDoc, setDoc } from "./firebaseModule.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

const lineLabels = { 1: "Compact", 2: "Normal", 3: "Relaxed" };
const letterLabels = { 1: "Tight", 2: "Normal", 3: "Wide" };

function updateSpacingUI(lineSpacing, letterSpacing) {
    const lineVal = document.getElementById("line-spacing-val");
    const letterVal = document.getElementById("letter-spacing-val");
    const lineSlider = document.getElementById("line-spacing");
    const letterSlider = document.getElementById("letter-spacing");

    if (lineVal) lineVal.textContent = lineLabels[lineSpacing] || "Normal";
    if (letterVal) letterVal.textContent = letterLabels[letterSpacing] || "Normal";
    if (lineSlider) lineSlider.value = lineSpacing;
    if (letterSlider) letterSlider.value = letterSpacing;
}

function applySettings(settings) {
    const {
        highContrast = false,
        colorBlindMode = "none",
        fontSize = 100,
        darkMode = false,
        highlightLinks = false,
        reduceMotion = false,
        dyslexiaFont = false,
        lineSpacing = 2,
        letterSpacing = 2,
        readingGuide = false
    } = settings;

    document.body.classList.toggle("a11y-high-contrast", highContrast);
    document.body.classList.toggle("dark-mode", darkMode);
    document.body.classList.toggle("a11y-highlight-links", highlightLinks);
    document.body.classList.toggle("a11y-reduce-motion", reduceMotion);
    document.body.classList.toggle("a11y-dyslexia-font", dyslexiaFont);
    document.body.classList.toggle("a11y-reading-guide", readingGuide);

    document.body.classList.remove("a11y-deuteranopia", "a11y-protanopia", "a11y-tritanopia");
    if (colorBlindMode !== "none") {
        document.body.classList.add(`a11y-${colorBlindMode}`);
    }

    document.body.classList.remove("a11y-line-spacing-1", "a11y-line-spacing-2", "a11y-line-spacing-3");
    document.body.classList.add(`a11y-line-spacing-${lineSpacing}`);

    document.body.classList.remove("a11y-letter-spacing-1", "a11y-letter-spacing-2", "a11y-letter-spacing-3");
    document.body.classList.add(`a11y-letter-spacing-${letterSpacing}`);

    document.documentElement.style.setProperty("--font-scale", fontSize / 100);
    updateSliderUI(fontSize);
    updateSpacingUI(lineSpacing, letterSpacing);
}

function updateSliderUI(value) {
    const slider = document.getElementById("font-size");
    const label = document.getElementById("font-size-val");
    if (slider) slider.value = value;
    if (label) label.textContent = `${value}%`;
}

async function loadSettings(email) {
    try {
        const ref = doc(db, "User_Data", email);
        const snap = await getDoc(ref);
        if (snap.exists()) {
            const data = snap.data();
            const settings = data.accessibility || {};
            applySettings(settings);
            return settings;
        }
    } catch (e) {
        console.error("Failed to load accessibility settings", e);
    }
    return {};
}

async function saveSetting(email, key, value) {
    try {
        const ref = doc(db, "User_Data", email);
        await setDoc(ref, {
            accessibility: { [key]: value }
        }, { merge: true });
    } catch (e) {
        console.error("Failed to save setting", e);
    }
}

function initControls(email) {
    document.getElementById("dark-mode")?.addEventListener("change", (e) => {
        document.body.classList.toggle("dark-mode", e.target.checked);
        saveSetting(email, "darkMode", e.target.checked);
    });

    document.getElementById("high-contrast")?.addEventListener("change", (e) => {
        document.body.classList.toggle("a11y-high-contrast", e.target.checked);
        saveSetting(email, "highContrast", e.target.checked);
    });

    document.getElementById("colorblind")?.addEventListener("change", (e) => {
        document.body.classList.remove("a11y-deuteranopia", "a11y-protanopia", "a11y-tritanopia");
        if (e.target.value !== "none") {
            document.body.classList.add(`a11y-${e.target.value}`);
        }
        saveSetting(email, "colorBlindMode", e.target.value);
    });

    const fontSlider = document.getElementById("font-size");
    const fontLabel = document.getElementById("font-size-val");
    fontSlider?.addEventListener("input", (e) => {
        const value = Number(e.target.value);
        document.documentElement.style.setProperty("--font-scale", value / 100);
        if (fontLabel) fontLabel.textContent = `${value}%`;
    });
    fontSlider?.addEventListener("change", (e) => {
        saveSetting(email, "fontSize", Number(e.target.value));
    });

    document.getElementById("highlight-links")?.addEventListener("change", (e) => {
        document.body.classList.toggle("a11y-highlight-links", e.target.checked);
        saveSetting(email, "highlightLinks", e.target.checked);
    });

    document.getElementById("reduce-motion")?.addEventListener("change", (e) => {
        document.body.classList.toggle("a11y-reduce-motion", e.target.checked);
        saveSetting(email, "reduceMotion", e.target.checked);
    });

    document.getElementById("dyslexia-font")?.addEventListener("change", (e) => {
        document.body.classList.toggle("a11y-dyslexia-font", e.target.checked);
        saveSetting(email, "dyslexiaFont", e.target.checked);
    });

    document.getElementById("reading-guide")?.addEventListener("change", (e) => {
        document.body.classList.toggle("a11y-reading-guide", e.target.checked);
        saveSetting(email, "readingGuide", e.target.checked);
    });

    document.getElementById("line-spacing")?.addEventListener("input", (e) => {
        const value = Number(e.target.value);
        document.body.classList.remove("a11y-line-spacing-1", "a11y-line-spacing-2", "a11y-line-spacing-3");
        document.body.classList.add(`a11y-line-spacing-${value}`);
        const label = document.getElementById("line-spacing-val");
        if (label) label.textContent = lineLabels[value];
    });
    document.getElementById("line-spacing")?.addEventListener("change", (e) => {
        saveSetting(email, "lineSpacing", Number(e.target.value));
    });

    document.getElementById("letter-spacing")?.addEventListener("input", (e) => {
        const value = Number(e.target.value);
        document.body.classList.remove("a11y-letter-spacing-1", "a11y-letter-spacing-2", "a11y-letter-spacing-3");
        document.body.classList.add(`a11y-letter-spacing-${value}`);
        const label = document.getElementById("letter-spacing-val");
        if (label) label.textContent = letterLabels[value];
    });
    document.getElementById("letter-spacing")?.addEventListener("change", (e) => {
        saveSetting(email, "letterSpacing", Number(e.target.value));
    });

    document.getElementById("save-btn")?.addEventListener("click", () => {
        const msg = document.getElementById("saved-msg");
        if (msg) {
            msg.textContent = "Settings saved!";
            setTimeout(() => msg.textContent = "", 3000);
        }
    });

    document.getElementById("reset-btn")?.addEventListener("click", async () => {
        const defaults = {
            highContrast: false,
            colorBlindMode: "none",
            fontSize: 100,
            darkMode: false,
            highlightLinks: false,
            reduceMotion: false,
            dyslexiaFont: false,
            lineSpacing: 2,
            letterSpacing: 2,
            readingGuide: false
        };

        try {
            const ref = doc(db, "User_Data", email);
            await setDoc(ref, { accessibility: defaults }, { merge: true });
            applySettings(defaults);
            syncControls(defaults);

            const msg = document.getElementById("saved-msg");
            if (msg) {
                msg.textContent = "Settings reset to defaults!";
                setTimeout(() => msg.textContent = "", 3000);
            }
        } catch (e) {
            console.error("Failed to reset settings", e);
        }
    });
}

function syncControls(settings) {
    const {
        highContrast = false, colorBlindMode = "none", fontSize = 100,
        darkMode = false, highlightLinks = false, reduceMotion = false,
        dyslexiaFont = false, lineSpacing = 2, letterSpacing = 2, readingGuide = false
    } = settings;

    const getId = (id) => document.getElementById(id);

    if (getId("high-contrast")) getId("high-contrast").checked = highContrast;
    if (getId("colorblind")) getId("colorblind").value = colorBlindMode;
    if (getId("dark-mode")) getId("dark-mode").checked = darkMode;
    if (getId("highlight-links")) getId("highlight-links").checked = highlightLinks;
    if (getId("reduce-motion")) getId("reduce-motion").checked = reduceMotion;
    if (getId("dyslexia-font")) getId("dyslexia-font").checked = dyslexiaFont;
    if (getId("reading-guide")) getId("reading-guide").checked = readingGuide;

    updateSpacingUI(lineSpacing, letterSpacing);
}

onAuthStateChanged(auth, async (user) => {
    if (!user) return;
    const settings = await loadSettings(user.email);
    syncControls(settings);
    initControls(user.email);
});