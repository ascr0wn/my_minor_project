// Navigation: Toggle Sections
document.querySelectorAll(".navbar button").forEach(btn => {
    btn.addEventListener("click", () => {
        const section = btn.dataset.section;
        document.querySelectorAll(".content-section").forEach(sec => {
            sec.style.display = sec.id === section ? "block" : "none";
        });
    });
});

// Collapsibles: Expand/Collapse Details
document.querySelectorAll(".collapsible-header").forEach(header => {
    header.addEventListener("click", () => {
        const targetId = header.dataset.toggle;
        const el = document.getElementById(targetId);
        el.style.display = (el.style.display === "block") ? "none" : "block";
    });
});

// Open Streamlit Projects
function openProject(url) {
    window.open(url, '_blank');
}
