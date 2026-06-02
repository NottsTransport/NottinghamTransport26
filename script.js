/* =========================
   STATE
========================= */

let favorites = [];
let images = [];
let currentIndex = 0;

/* =========================
   INIT
========================= */

document.addEventListener("DOMContentLoaded", () => {
    loadFavorites();
    updateFavoriteUI();
    collectImages();

    document.addEventListener("keydown", (e) => {
        const lightbox = document.getElementById("lightbox");
        if (!lightbox || lightbox.style.display !== "flex") return;

        if (e.key === "ArrowRight") changeImage(1);
        if (e.key === "ArrowLeft") changeImage(-1);
        if (e.key === "Escape") closeLightbox();
    });
});

/* =========================
   SAFE DISPLAY SYSTEM
========================= */

function showItem(item) {
    item.classList.remove("hidden");
}

function hideItem(item) {
    item.classList.add("hidden");
}

/* =========================
   LIGHTBOX
========================= */

function collectImages() {
    images = Array.from(document.querySelectorAll(".griditem img"));
}

function openLightbox(img) {
    collectImages();
    currentIndex = images.indexOf(img);

    showImage();
    document.getElementById("lightbox").style.display = "flex";
}

function showImage() {
    const lightboxImg = document.getElementById("lightbox-img");
    lightboxImg.src = images[currentIndex].src;
}

function changeImage(direction, e) {
    if (e) e.stopPropagation();

    currentIndex += direction;

    if (currentIndex < 0) currentIndex = images.length - 1;
    if (currentIndex >= images.length) currentIndex = 0;

    showImage();
}

function closeLightbox(e) {
    if (e && e.target.id !== "lightbox") return;
    document.getElementById("lightbox").style.display = "none";
}

/* =========================
   FILTER SYSTEM
========================= */

function filterGallery(category, btn) {
    const items = document.querySelectorAll(".griditem");
    const noResults = document.getElementById("noResults");

    let visible = 0;

    document.querySelectorAll(".filter-btn").forEach(b => {
        b.classList.remove("active");
    });

    if (btn) btn.classList.add("active");

    items.forEach(item => {
        const match =
            category === "all" ||
            item.dataset.category === category;

        if (match) {
            showItem(item);
            visible++;
        } else {
            hideItem(item);
        }
    });

    noResults.style.display = visible === 0 ? "block" : "none";
}

/* =========================
   SEARCH + HIGHLIGHT
========================= */

function searchGallery() {
    const input = document.getElementById("searchInput").value.toLowerCase();
    const items = document.querySelectorAll(".griditem");
    const noResults = document.getElementById("noResults");

    let visible = 0;

    items.forEach(item => {
        const titleEl = item.querySelector(".card-title");
        const descEl = item.querySelector(".card-desc");

        const title = titleEl.textContent;
        const desc = descEl.textContent;

        const match =
            title.toLowerCase().includes(input) ||
            desc.toLowerCase().includes(input);

        if (match) {
            showItem(item);
            visible++;

            titleEl.innerHTML = highlightText(title, input);
            descEl.innerHTML = highlightText(desc, input);
        } else {
            hideItem(item);

            titleEl.innerHTML = title;
            descEl.innerHTML = desc;
        }
    });

    noResults.style.display = visible === 0 ? "block" : "none";
}

function highlightText(text, query) {
    if (!query) return text;

    const regex = new RegExp(`(${query})`, "gi");
    return text.replace(regex, `<span class="highlight">$1</span>`);
}

