/**
 * @file Notification and modal dialog utilities. Provides toast notifications
 * and promise-based confirm/prompt modals used across the application.
 */


/**
 * Creates and displays a toast notification in the "#notif-container" element,
 * creating the container if it doesn't already exist. The toast fades in shortly
 * after being appended and is automatically removed after the specified duration.
 * @param {string} message - The text to display in the notification.
 * @param {"info"|"success"|"error"} [type="info"] - The notification style, applied
 *     as a CSS class alongside "toast".
 * @param {number} [duration=3000] - How long in milliseconds to show the notification
 *     before it begins fading out.
 * @returns {void}
 */
function showNotif(message, type = "info", duration = 3000) {
  let container = document.getElementById("notif-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "notif-container"
    document.body.appendChild(container);
  }

  const notif = document.createElement("div");
  notif.classList.add("toast", type);
  notif.textContent = message;

  container.appendChild(notif);
  console.log("printing notif")
  setTimeout(() => notif.classList.add("show"), 10);

  setTimeout(() => {
    notif.classList.remove("show");
    setTimeout(() => notif.remove(), 300);
  }, duration);
}


/**
 * Displays the "#confirm-modal" dialog with a custom message and waits for the
 * user to click either the confirm or cancel button. Hides the modal on either action.
 * @param {string} message - The confirmation prompt text to display in the modal.
 * @returns {Promise<boolean>} Resolves to true if the user confirmed, false if cancelled.
 */
function showConfirm(message) {
  return new Promise((resolve) => {
    const modal = document.getElementById("confirm-modal");
    const msg = document.getElementById("confirm-message");
    const yes = document.getElementById("confirm-yes");
    const no = document.getElementById("confirm-no");

    msg.textContent = message;
    modal.classList.remove("hidden");

    yes.onclick = () => {
      modal.classList.add("hidden");
      resolve(true);
    };

    no.onclick = () => {
      modal.classList.add("hidden");
      resolve(false);
    };
  });
}

/**
* Displays the "#reason-modal" dialog with a text input and waits for the user
* to either submit a reason or cancel. Clears the input field on each invocation.
* Hides the modal on either action.
* @returns {Promise<string|null>} Resolves to the trimmed input string if submitted,
*     or null if the user cancelled.
*/
function showReasonPrompt() {
  return new Promise((resolve) => {
    const modal = document.getElementById("reason-modal");
    const input = document.getElementById("reason-input");
    const submit = document.getElementById("reason-submit");
    const cancel = document.getElementById("reason-cancel");

    input.value = "";
    modal.classList.remove("hidden");

    submit.onclick = () => {
      modal.classList.add("hidden");
      resolve(input.value.trim()); // returns text
    };

    cancel.onclick = () => {
      modal.classList.add("hidden");
      resolve(null); // user cancelled
    };
  });
}