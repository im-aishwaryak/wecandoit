function showNotif(message, type = "info", duration = 3000){
    let container = document.getElementById("notif-container");
    if(!container){
        container = document.createElement("div"); 
        container.id = "notif-container"
        document.body.appendChild(container); 
    }

    const notif = document.createElement("div"); 
    notif.classList.add("toast", type);
    notif.textContent=message;

    container.appendChild(notif); 
    console.log("printing notif")
    setTimeout(() => notif.classList.add("show"), 10);

    setTimeout(() => {
      notif.classList.remove("show");
      setTimeout(() => notif.remove(), 300);
    }, duration);
}

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