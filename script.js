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

    // toggle favorite
    if (favorites.includes(id)) {
        favorites = favorites.filter(f => f !== id);
    } else {
        favorites.push(id);

        // 💥 HEART POP ANIMATION (only when liking)
        createHeartPop(btn);
    }

    saveFavorites();
    updateFavoriteUI();
    
}



function updateFavoriteUI() {
    document.querySelectorAll(".griditem").forEach(item => {
        const id = item.dataset.id;
        const btn = item.querySelector(".like-btn");

        if (!btn) return;

        const isFav = favorites.includes(id);

        btn.classList.toggle("active", isFav);
        btn.innerHTML = isFav ? "❤" : "♡";
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



const canvas = document.getElementById("snow");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const snowflakes = [];

for (let i = 0; i < 100; i++) {
  snowflakes.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * 3 + 1,
    speed: Math.random() * 1 + 0.5
  });
}

function drawSnow() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";

  for (let flake of snowflakes) {
    ctx.beginPath();
    ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
    ctx.fill();

    flake.y += flake.speed;

    if (flake.y > canvas.height) {
      flake.y = -5;
      flake.x = Math.random() * canvas.width;
    }
  }

  requestAnimationFrame(drawSnow);
}

drawSnow();

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});


function searchfaq() {
    const input = document.getElementById("searchInput2").value.toLowerCase();
    const items = document.querySelectorAll(".faq");
    const noResults = document.getElementById("nofaq");

    let visible = 0;

    items.forEach(item => {
        const titleEl = item.querySelector("h1");
        const descEl = item.querySelector("p");

        const title = titleEl.textContent;
        const desc = descEl.textContent;

        const match =
            title.toLowerCase().includes(input) ||
            desc.toLowerCase().includes(input);

        if (match) {
            item.classList.remove("hidden");
            visible++; // Count visible FAQs

            titleEl.innerHTML = highlightText(title, input);
            descEl.innerHTML = highlightText(desc, input);
        } else {
            item.classList.add("hidden");
        }
    });

    noResults.style.display = visible === 0 ? "block" : "none";
}
