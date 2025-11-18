export function show(sectionId) {
    document.querySelectorAll("main").forEach(m => m.style.display = "none");
    document.getElementById(sectionId).style.display = "flex";
}

export function render(html, id) {
    document.getElementById(id).innerHTML = html;
}
