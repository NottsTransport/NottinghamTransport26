/* =========================
   STATE
========================= */

let favorites = [];
let favoriteCounts = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0
};

const API_URL = 'http://localhost:3000/api';

/* =========================
   INIT
========================= */

document.addEventListener("DOMContentLoaded", () => {
    loadFavorites();
    // Attach mobile-friendly handlers to like buttons
    document.querySelectorAll('.like-btn').forEach(btn => {
        // Prevent taps on the like button from bubbling to the image/lightbox.
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(btn);
        });

        // On touch devices, stop propagation on touchstart to avoid accidental image taps.
        btn.addEventListener('touchstart', (e) => {
            e.stopPropagation();
        }, { passive: true });
    });

    document.addEventListener("keydown", (e) => {
        const lightbox = document.getElementById("lightbox");
        if (!lightbox || lightbox.style.display !== "flex") return;

        if (e.key === "Escape") closeLightbox();
    });
});

/* =========================
   LIGHTBOX
========================= */

function openLightbox(el) {
    const lightbox = document.getElementById("lightbox");

    const item = el.closest(".griditem");
    const img = item.querySelector("img");
    const video = item.querySelector("video");

    lightbox.style.display = "flex";

    if (img && el.tagName === "IMG") {
        lightbox.innerHTML = `
            <img src="${img.src}">
        `;
    }

    else if (video) {
        const src = video.querySelector("source").src;

        lightbox.innerHTML = `
            <video controls autoplay style="max-width:90%; max-height:80%;">
                <source src="${src}" type="video/mp4">
            </video>
        `;
    }
}

function closeLightbox() {
    const lightbox = document.getElementById("lightbox");
    lightbox.style.display = "none";
    lightbox.innerHTML = "";
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

        item.classList.toggle("hidden", !match);

        if (match) visible++;
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
            item.classList.remove("hidden");
            visible++;

            titleEl.innerHTML = highlightText(title, input);
            descEl.innerHTML = highlightText(desc, input);
        } else {
            item.classList.add("hidden");

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

/* =========================
   FAVORITES SYSTEM
========================= */

function loadFavorites() {
    // Load user's local favorites from localStorage
    const stored = localStorage.getItem("favorites");
    favorites = stored ? JSON.parse(stored) : [];
    
    // Load global counts from API
    fetch(`${API_URL}/favorites`)
        .then(res => res.json())
        .then(data => {
            favoriteCounts = data;
            updateFavoriteUI();
        })
        .catch(err => {
            console.error('Error loading favorites:', err);
            // Fallback to default values if API is unavailable
            updateFavoriteUI();
        });
}

function saveFavorites() {
    // Favorites are now saved via API
}

function toggleFavorite(btn) {
    const item = btn.closest(".griditem");
    const id = item.dataset.id;

    if (!id) return;

    // Check if user has already liked this
    const isCurrentlyLiked = favorites.includes(id);

    if (isCurrentlyLiked) {
        // Unlike - remove from favorites and decrement count
        favorites = favorites.filter(f => f !== id);
        localStorage.setItem("favorites", JSON.stringify(favorites));
        
        fetch(`${API_URL}/favorites/${id}/decrement`, {
            method: 'POST'
        })
            .then(res => res.json())
            .then(data => {
                favoriteCounts[id] = data.count;
                updateFavoriteUI();
            })
            .catch(err => console.error('Error decrementing favorite:', err));
    } else {
        // Like - add to favorites and increment count
        favorites.push(id);
        localStorage.setItem("favorites", JSON.stringify(favorites));
        
        fetch(`${API_URL}/favorites/${id}/increment`, {
            method: 'POST'
        })
            .then(res => res.json())
            .then(data => {
                favoriteCounts[id] = data.count;
                createHeartPop(btn);
                updateFavoriteUI();
            })
            .catch(err => console.error('Error incrementing favorite:', err));
    }
}



function updateFavoriteUI() {
    document.querySelectorAll(".griditem").forEach(item => {
        const id = item.dataset.id;
        const btn = item.querySelector(".like-btn");
        const countDisplay = item.querySelector(".favorite-count");

        if (!btn) return;

        const isFav = favorites.includes(id);

        btn.classList.toggle("active", isFav);
        btn.innerHTML = isFav ? "❤" : "♡";
        
        if (countDisplay) {
            countDisplay.textContent = favoriteCounts[id] || 0;
        }
    });
}

/* =========================
   FAVORITES FILTER (OPTIONAL)
========================= */

function showFavorites(btn) {
    const items = document.querySelectorAll(".griditem");
    let visible = 0;

    document.querySelectorAll(".filter-btn").forEach(b => {
        b.classList.remove("active");
    });

    if (btn) btn.classList.add("active");

    items.forEach(item => {
        const id = item.dataset.id;
        const isFav = favorites.includes(id);

        item.classList.toggle("hidden", !isFav);

        if (isFav) visible++;
    });

    document.getElementById("noResults").style.display =
        visible === 0 ? "block" : "none";
}

function createHeartPop(btn) {
    const heart = document.createElement("div");
    heart.classList.add("floating-heart");
    heart.innerHTML = "❤";

    const rect = btn.getBoundingClientRect();

    // Account for page scroll when positioning on mobile
    const scrollLeft = window.scrollX || window.pageXOffset || 0;
    const scrollTop = window.scrollY || window.pageYOffset || 0;

    heart.style.left = (rect.left + scrollLeft) + "px";
    heart.style.top = (rect.top + scrollTop) + "px";

    document.body.appendChild(heart);

    setTimeout(() => {
        heart.remove();
    }, 800);
}