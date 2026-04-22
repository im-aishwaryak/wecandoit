/**
 * @file accessibility_settings.js
 * @description
 * Manages accessibility settings for the application.
 *
 * Features include:
 * - Dark mode
 * - High contrast mode
 * - Colorblind filters
 * - Font scaling
 * - Line and letter spacing adjustments
 * - Reading guide support
 *
 * Settings are stored and retrieved from Firebase Firestore
 * and applied dynamically to the UI.
 *
 * @author Aishwarya Kumaran
 * @version 1.0
 */



import { db, auth, doc, getDoc, setDoc } from "./firebaseModule.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

/**
 * Mapping of numeric line spacing values to human-readable labels.
 * @type {Object<number, string>}
 */
const lineLabels = { 1: "Compact", 2: "Normal", 3: "Relaxed" };

/**
 * Mapping of numeric letter spacing values to human-readable labels.
 * @type {Object<number, string>}
 */
const letterLabels = { 1: "Tight", 2: "Normal", 3: "Wide" };


/**
 * Updates the UI elements related to line and letter spacing.
 * Adjusts slider values and text labels to match current settings.
 *
 * @function updateSpacingUI
 * @param {number} lineSpacing - Numeric line spacing level (1–3).
 * @param {number} letterSpacing - Numeric letter spacing level (1–3).
 * @returns {void}
 */
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



/**
 * Applies accessibility settings to the page.
 * Updates CSS classes and font scaling based on user preferences.
 *
 * @function applySettings
 * @param {Object} settings - Accessibility settings object.
 * @param {boolean} [settings.highContrast=false] - Enables high contrast mode.
 * @param {string} [settings.colorBlindMode="none"] - Colorblind mode type.
 * @param {number} [settings.fontSize=100] - Font size percentage.
 * @param {boolean} [settings.darkMode=false] - Enables dark mode.
 * @param {boolean} [settings.highlightLinks=false] - Highlights hyperlinks.
 * @param {boolean} [settings.reduceMotion=false] - Reduces animations.
 * @param {boolean} [settings.dyslexiaFont=false] - Enables dyslexia-friendly font.
 * @param {number} [settings.lineSpacing=2] - Line spacing level.
 * @param {number} [settings.letterSpacing=2] - Letter spacing level.
 * @param {boolean} [settings.readingGuide=false] - Enables reading guide.
 * @returns {void}
 */
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


/**
 * Updates the font size slider and label display.
 *
 * @function updateSliderUI
 * @param {number} value - Font size percentage.
 * @returns {void}
 */
function updateSliderUI(value) {
    const slider = document.getElementById("font-size");
    const label = document.getElementById("font-size-val");
    if (slider) slider.value = value;
    if (label) label.textContent = `${value}%`;
}


/**
 * Loads accessibility settings from Firebase Firestore.
 *
 * Retrieves user-specific accessibility preferences and applies them.
 *
 * @async
 * @function loadSettings
 * @param {string} email - User email used as document ID.
 * @returns {Promise<Object>} Resolves to the loaded settings object.
 */
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



/**
 * Saves a single accessibility setting to Firebase Firestore.
 *
 * Uses merge mode to update only the specified setting.
 *
 * @async
 * @function saveSetting
 * @param {string} email - User email used as document ID.
 * @param {string} key - Name of the setting to update.
 * @param {*} value - Value to store for the setting.
 * @returns {Promise<void>}
 */
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


/**
 * Initializes UI control event listeners for accessibility settings.
 *
 * Attaches change and input listeners to form controls and
 * saves updates to Firebase when values change.
 *
 * @function initControls
 * @param {string} email - User email used for saving settings.
 * @returns {void}
 */
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


/**
 * Synchronizes UI control values with stored accessibility settings.
 *
 * Updates checkboxes, dropdowns, and spacing labels
 * to reflect the current settings state.
 *
 * @function syncControls
 * @param {Object} settings - Accessibility settings object.
 * @returns {void}
 */
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


/**
 * Firebase authentication state listener.
 *
 * Loads accessibility settings when a user logs in,
 * synchronizes UI controls, and initializes event handlers.
 *
 * @async
 * @callback AuthStateChangeHandler
 * @param {Object|null} user - Firebase authenticated user object.
 * @returns {Promise<void>}
 */
onAuthStateChanged(auth, async (user) => {
    if (!user) return;
    const settings = await loadSettings(user.email);
    syncControls(settings);
    initControls(user.email);
});