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
        <button class="img-expand-btn" onclick="openImageModal('${item.image_url}')">
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
    // first we get the value from the search bar
    const searchValue = document.getElementById("search-input").value.toLowerCase();

    // then we filter items first by direct matches
    let filteredItems = searchByValue(searchValue);

    // now, after filtering direct matches, we are going to look for typos
    const notMatchesList = lostThings.filter(x => !filteredItems.includes(x));
    fuzzySearch(searchValue, notMatchesList).forEach(item => console.log("Fuzzy search: " + item.item_name))

    
    filteredItems = filteredItems.concat(fuzzySearch(searchValue, notMatchesList));


    
    // Testing area
    console.log("type: " + typeof filteredItems);
    filteredItems.forEach(item => console.log("Matched items: " + item.item_name));
    
    
    // This part changes the html
    if(filteredItems.length === 0){
        document.getElementById("searchOutputMSG").textContent = "Item not found!!";
    } else {
        document.getElementById("searchOutputMSG").textContent = "Items found: " + filteredItems.length;
    }

    renderItems(filteredItems);

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
function searchByValue(searchValue){
    // console.log()
    
    // console.log(searchValue)
    return lostThings.filter(obj => {
        if (!obj.item_name) return false;        // skip invalid objects
        return String(obj.item_name).toLowerCase().includes(searchValue);
    });
}




// searches a list with typos
function fuzzySearch(query, list, threshold = 4) {
    // Convert the search query to lowercase so comparisons
    // are case-insensitive.
    query = query.toLowerCase();

    return list
        .map(item => {
            // Convert the item's name to lowercase
            // so comparisons are case-insensitive.
            const lower = item.item_name.toLowerCase();

            // Compute the Levenshtein distance between:
            // - the user query
            // - the full item name
            //
            // This distance measures how many edits it would take
            // to transform 'query' into 'lower'.
            const distance = levenshtein(query, lower);

            // Check whether the query appears anywhere inside the item name.
            // This helps when the user types only part of an item name.
            const includes = lower.includes(query);

            // We will use "score" to determine how good the match is.
            // Start with the Levenshtein distance, since lower distance = better match.
            let score = distance;

            // If the query is actually *contained* in the item name,
            // give it a slight advantage by reducing the score.
            // (Lower score = better match.)
            if (includes) score -= 2;

            // Return an object wrapping the item with its score
            // so we can filter and sort them later.
            return { item, score };
        })
        // Filter out items with a score too high (bad matches).
        // 'threshold' defines how many edits we allow.
        .filter(result => result.score <= threshold)

        // Sort matches from best score (closest match) to worst.
        .sort((a, b) => a.score - b.score)

        // Return only the item objects (drop score metadata)
        .map(result => result.item);
}




// returns the number of edits needed to turn string a into string b
function levenshtein(a, b) {
    // Create a 2D matrix (dp) where:
    // dp[i][j] represents the minimum number of edits needed
    // to convert the first i characters of string 'a'
    // into the first j characters of string 'b'.
    //
    // The matrix has (a.length + 1) rows and (b.length + 1) columns.

    const dp = Array.from({ length: a.length + 1 }, (_, i) =>
        Array.from({ length: b.length + 1 }, (_, j) =>
            // Initialize the first row and first column:
            // dp[i][0] = i → converting i characters into empty string requires i deletions
            // dp[0][j] = j → converting empty string into j characters requires j insertions
            i === 0 ? j : j === 0 ? i : 0
        )
    );

    // Fill in the rest of the matrix
    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            // If characters match, no new edit is needed.
            // Carry over the previous diagonal value.
            if (a[i - 1] === b[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                // Characters do NOT match.
                // We consider three possible operations:
                //
                // 1. Deletion: remove a character from 'a'
                //    → dp[i - 1][j]
                //
                // 2. Insertion: add a character to 'a'
                //    → dp[i][j - 1]
                //
                // 3. Substitution: replace a character in 'a'
                //    → dp[i - 1][j - 1]
                //
                // We choose the operation with the smallest cost and add 1
                // because performing that operation costs one edit.
                dp[i][j] = Math.min(
                    dp[i - 1][j],     // deletion
                    dp[i][j - 1],     // insertion
                    dp[i - 1][j - 1]  // substitution
                ) + 1;
            }
        }
    }

    // The final answer—the minimum number of edits required
    // to transform the full string 'a' into string 'b'—
    // is located in the bottom-right cell.
    return dp[a.length][b.length];
}


