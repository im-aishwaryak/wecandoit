const objects = [
  { id: 1, name: "Apple", price: 2.99 },
  { id: 2, name: "Banana", price: 1.49 },
  { id: 3, name: "Orange", price: 1.99 }
];

function search() {
    searchByValue();
    
}

function searchByValue(){
    const searchValue = document.getElementById("search-input").value.toLowerCase();
    
    return items.filter(obj => {
        if (!obj.name) return false;        // skip invalid objects
        return String(obj.name).toLowerCase().includes(query);
    });

    // const categoryValue = document.getElementById("category-filter").value;

    // const 
    

}
