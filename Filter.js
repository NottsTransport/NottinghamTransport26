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

var White = false

function settheme() {
    if (White === false) {
        document.body.classList.add("light-mode");
        White = true;
    } else {
        document.body.classList.remove("light-mode");
        White = false;
    }
}

themeToggle.addEventListener("click", settheme);

settheme()



