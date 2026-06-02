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

function openLightbox(el) {
    const lightbox = document.getElementById("lightbox");

    const item = el.closest(".griditem");
    const img = item.querySelector("img");
    const video = item.querySelector("video");

    lightbox.style.display = "flex";

    // IMAGE
    if (img && el.tagName === "IMG") {
        lightbox.innerHTML = `
            <img id="lightbox-img" src="${img.src}">
        `;
    }

    // VIDEO (LOCAL FILE)
    else if (video) {
        const src = video.querySelector("source").src;

        lightbox.innerHTML = `
            <video controls style="max-width:90%; max-height:80%;">
                <source src="${src}" type="video/mp4">
            </video>
        `;
    }
}


function closeLightbox() {
    const lightbox = document.getElementById("lightbox");

    lightbox.style.display = "none";

    lightbox.innerHTML = `<img id="lightbox-img">`;
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

