const faqs = document.getElementById("FAQs");
const btn = document.getElementById("FAQbtn");

btn.addEventListener("click", function () {
    faqs.scrollIntoView({
        behavior: "smooth"
    });
});


const topBtn = document.getElementById("topBtn");

window.addEventListener("scroll", function () {
    if (window.scrollY > 200) {
        topBtn.classList.add("show");
    } else {
        topBtn.classList.remove("show");
    }
});

topBtn.addEventListener("click", function () {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});


const themeToggle = document.getElementById("themebtn");

// Load saved theme
let White = localStorage.getItem("theme") === "light";

function setTheme() {
    if (White) {
        document.body.classList.add("light-mode");
    } else {
        document.body.classList.remove("light-mode");
    }

    // Save theme
    localStorage.setItem("theme", White ? "light" : "dark");
}

themeToggle.addEventListener("click", () => {
    White = !White;
    setTheme();
});

// Apply saved theme when the page loads
setTheme();
