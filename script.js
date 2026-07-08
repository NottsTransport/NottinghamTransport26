/* =========================
   STATE
========================= */

let favorites = [];

/* =========================
   INIT
========================= */

document.addEventListener("DOMContentLoaded", () => {
    loadFavorites();
    updateFavoriteUI();

    document.querySelectorAll('.like-btn').forEach(btn => {

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(btn);
        });

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
        lightbox.innerHTML = `<img src="${img.src}">`;
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
   SEARCH
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
   GEO LOCATION (IMPROVED)
========================= */

async function getCityName(lat, lon) {
    try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;

        const res = await fetch(url);
        const data = await res.json();

        const a = data.address;

        return (
            a.village ||
            a.hamlet ||
            a.suburb ||
            a.neighbourhood ||
            a.town ||
            a.city ||
            a.county ||
            "Unknown location"
        );
    } catch (e) {
        return "Unknown location";
    }
}

/* =========================
   FAVORITES SYSTEM
========================= */

function loadFavorites() {
    const stored = localStorage.getItem("favorites");
    favorites = stored ? JSON.parse(stored) : [];
}

function saveFavorites() {
    localStorage.setItem("favorites", JSON.stringify(favorites));
}

function toggleFavorite(btn) {
    const item = btn.closest(".griditem");
    const id = item.dataset.id;

    if (!id) return;

    const index = favorites.findIndex(f => f.id === id);

    // REMOVE
    if (index !== -1) {
        favorites.splice(index, 1);
        saveFavorites();
        updateFavoriteUI();
        return;
    }

    // ADD + LOCATION
    navigator.geolocation.getCurrentPosition(async (pos) => {

        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        const place = await getCityName(lat, lon);

        favorites.push({
            id: id,
            likedAt: Date.now(),
            place: place
        });

        saveFavorites();
        updateFavoriteUI();
        createHeartPop(btn);

    }, () => {

        favorites.push({
            id: id,
            likedAt: Date.now()
        });

        saveFavorites();
        updateFavoriteUI();
        createHeartPop(btn);
    });
}

function updateFavoriteUI() {
    document.querySelectorAll(".griditem").forEach(item => {
        const id = item.dataset.id;
        const btn = item.querySelector(".like-btn");

        if (!btn) return;

        const fav = favorites.find(f => f.id === id);
        const isFav = !!fav;

        btn.classList.toggle("active", isFav);
        btn.innerHTML = isFav ? "❤" : "♡";

        let badge = item.querySelector(".ribbon");

        if (isFav && !badge) {
            badge = document.createElement("div");
            badge.className = "ribbon";

            const date = new Date(fav.likedAt);

            let locationText = "";

            if (fav.place) {
                locationText = ` @ ${fav.place}`;
            }

            badge.textContent =
                "Liked on " +
                date.toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true
                }) +
                locationText;

            item.appendChild(badge);
        }

        else if (!isFav && badge) {
            badge.remove();
        }
    });
}

/* =========================
   FAVORITES FILTER
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
        const isFav = favorites.some(f => f.id === id);

        item.classList.toggle("hidden", !isFav);

        if (isFav) visible++;
    });

    document.getElementById("noResults").style.display =
        visible === 0 ? "block" : "none";
}

/* =========================
   HEART POP
========================= */

function createHeartPop(btn) {
    const heart = document.createElement("div");
    heart.classList.add("floating-heart");
    heart.innerHTML = "❤";

    const rect = btn.getBoundingClientRect();

    const scrollLeft = window.scrollX || window.pageXOffset || 0;
    const scrollTop = window.scrollY || window.pageYOffset || 0;

    heart.style.left = (rect.left + scrollLeft) + "px";
    heart.style.top = (rect.top + scrollTop) + "px";

    document.body.appendChild(heart);

    setTimeout(() => heart.remove(), 800);
}


const holder = document.getElementById("Photos");

// count only direct div children
const count = holder.querySelectorAll(":scope > div").length;

document.getElementById("count").textContent =
    "There are currently: " + count + " photos in the gallery.";


function updateDaysAgo() {
  document.querySelectorAll("[data-time]").forEach(el => {
    const date = new Date(el.dataset.time);
    const diff = Date.now() - date;

    const days = Math.floor(diff / 86400000);

    const formattedDate = date.toLocaleString("en-GB", {
      year: "numeric",
        day: "2-digit",
        month: "long",
        });

    el.textContent = `Photo taken ${days} days ago, on the ${formattedDate}`;
  });
}

updateDaysAgo();
setInterval(updateDaysAgo, 60000);


// document.getElementById("am").textContent = "My name is Cameron, and I've been interested in buses for the past few months. I decided to share that interest by posting photos of the buses I see and enjoy. I hope you like my content as much as I enjoy creating it!";

