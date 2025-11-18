const objects = [
  { id: 1, name: "Apple", price: 2.99 },
  { id: 2, name: "Banana", price: 1.49 },
  { id: 3, name: "Orange", price: 1.99 }
];

function search() {
    filteredItems = searchByValue();

    // Testing area
    console.log(typeof filteredItems);
    filteredItems.forEach(item => console.log("Matched items: " + item.name));




    
    // This part changes the html
    if(filteredItems.length === 0){
        document.getElementById("searchOutputMSG").textContent = "Item not found!!";
    } else {
        document.getElementById("searchOutputMSG").textContent = "Items found: " + filteredItems.length;
    }
    
}

function searchByValue(){
    const searchValue = document.getElementById("search-input").value.toLowerCase();
    
    return objects.filter(obj => {
        if (!obj.name) return false;        // skip invalid objects
        return String(obj.name).toLowerCase().includes(searchValue);
    });

    // const categoryValue = document.getElementById("category-filter").value;

    // const 
    

}
