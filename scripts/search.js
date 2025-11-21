// search.js (include as: <script type="module" src="search.js"></script>)
// search.js


import {
  db, auth, provider, signInWithPopup, signOut,
  doc, getDoc, setDoc, collection, addDoc, updateDoc, deleteDoc,
  deleteField, storage, ref, uploadBytes, getDownloadURL, signInWithEmailAndPassword,
  getAllItems, listenToItems, getItemById   // <- ADD THESE
} from './firebaseModule.js';

const lostThings = [
];


async function load() {
    console.log("printed")
    try {
        const items = await getAllItems();
        const availableItems = items.filter(item => item.status === "available to claim");
        console.log("Available items:", availableItems.length);
        // console.log("All items:", items);

        // Example: iterate and read nested fields safely
        availableItems.forEach(item => {
            lostThings.push({id: item.id, 
                        public_description: item.public_description, 
                        location_found: item.location_found, 
                        item_name: item.item_name,
                        category: item.category,
                        date_found: item.date_found,
                        time_found: item.time_found,
                        status: item.status,
                        image_url: item.image_url
                    })

        /*
        // verification_qs is a map/object in your Firestore doc
        const vq = item.verification_qs || {};

        // Keys in verification_qs may have spaces/punctuation e.g. "What brand?"
        // Use bracket notation to access them
        console.log("What brand?:", vq["What brand?"]);
        console.log("What is in the front pocket?:", vq["What is in the front pocket?"]);
        console.log("What is the keychain? :", vq["What is the keychain? "]); // note trailing space in screenshot
        */
        });
    } catch (err) {
        console.error("Error loading items:", err);
    }
    renderItems(lostThings)
}

load()


const searchInput = document.getElementById('search-input');
searchInput.addEventListener('keyup', search);
const itemGrid = document.getElementById("item-grid");



/*------------------------------ SEARCH FUNCTIONS ------------------------------*/
/*______________________________________________________________________________*/



function createItemCard(item) {
  const card = document.createElement("div");
  card.classList.add("item-card");
  console.log(item.id)
  console.log(item.category)
  console.log(item.image_url)

  card.innerHTML = `
    <div class="image-wrapper">
        <img class="item-img" src="${item.image_url}" alt="Chromebook charger">
        <button class="img-expand-btn" onclick="openImageModal('assets/placeholders/lost-item3.jpg')">
            <img src="assets/icons/expand.svg" alt="expand">
        </button>
    </div>
    <div class="item-info">
        <div class="item-tags">
            <span class="tag tag-blue">${item.status}</span>
            <span class="tag tag-orange"><img src="assets/icons/tag-right.svg">${item.category}</span>
        </div>

        <div class="item-text">
            <h3 class="item-name">${item.item_name}</h3> 
            
            <p class="item-desc">${item.public_description}</p>
        </div>

        <div class="item-tags">
            <span class="tag tag-transparent"><img src="assets/icons/location.svg">${item.location_found}</span>
            <span class="tag tag-transparent"><img src="assets/icons/clock.svg">${item.date_found}</span>
        </div>

        <a class="btn btn-blue btn-sm full-width" href="claim-lost-item.html?id=${item.id}">Claim this item</a>
    </div>
  `;
  
// note: lines 80, 76, and 75 need to be updated. Image also needs to be updated
  return card;
}












//this function handles all the searching
function search() {
    const filteredItems = searchByValue();

    // Testing area
    console.log("type: " + typeof filteredItems);
    filteredItems.forEach(item => console.log("Matched items: " + item.category));
    
    // This part changes the html
    if(filteredItems.length === 0){
        document.getElementById("searchOutputMSG").textContent = "Item not found!!";
    } else {
        document.getElementById("searchOutputMSG").textContent = "Items found: " + filteredItems.length;
    }

    renderItems(filteredItems)
}


function renderItems(items) {
  itemGrid.innerHTML = ""; // clear previous content
  items.forEach(item => {
    const card = createItemCard(item);
    itemGrid.appendChild(card);
  });
}





//this function basically searches by the value that the user types in
//specifically not the catory dropdown search
function searchByValue(){
    console.log()
    const searchValue = document.getElementById("search-input").value.toLowerCase();
    console.log(searchValue)
    return lostThings.filter(obj => {
        if (!obj.category) return false;        // skip invalid objects
        return String(obj.category).toLowerCase().includes(searchValue);
    });

    // const categoryValue = document.getElementById("category-filter").value;

    // const 
    

}
