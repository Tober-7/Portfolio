"use strict";

//#region ELements

  const header = document.querySelector(".header");
  const modal = document.querySelector(".modal");
  const overlay = document.querySelector(".overlay");
  const tabs = document.querySelectorAll(".operations__tab");
  const tabsContent = document.querySelectorAll(".operations__content");
  const tabContainer = document.querySelector(".operations__tab-container");
  const dotsContainer = document.querySelector(".dots");
  const navContainer = document.querySelector(".nav");

  const section1 = document.querySelector("#section--1");
  const sections = document.querySelectorAll(".section");

  const slides = document.querySelectorAll(".slide");
  let dots;

  const btnScrollTo = document.querySelector(".btn--scroll-to");
  const btnsOpenModal = document.querySelectorAll(".btn--show-modal");
  const btnCloseModal = document.querySelector(".btn--close-modal");
  const btnSliderLeft = document.querySelector(".slider__btn--left");
  const btnSliderRight = document.querySelector(".slider__btn--right");
  
  const navHeight = navContainer.getBoundingClientRect().height;

//#endregion

//#region Variables

  let slideInt = 0;

//#endregion

//#region Functions

  function openModal (e) {
    e.preventDefault();

    modal.classList.remove("hidden");
    overlay.classList.remove("hidden");
  };

  function closeModal () {
    modal.classList.add("hidden");
    overlay.classList.add("hidden");
  };

  function scroll (section) {
    section.scrollIntoView({
      behavior: "smooth",
    });
  };

  function changeSlide () {
    if (slideInt + this > slides.length - 1) slideInt = 0;
    else if (slideInt + this < 0) slideInt = slides.length - 1;
    else slideInt += this;

    checkSlides();
  };

  function checkSlides () {
    slides.forEach((s, i) => s.style.transform = `translateX(${(i - slideInt) * 100}%)`);
    dots.forEach((d, i) => {
      if (i === slideInt) d.classList.add("dots__dot--active");
      else d.classList.remove("dots__dot--active");
    });
  };

  function createDots () {
    slides.forEach (function (_, i) {
      dotsContainer.insertAdjacentHTML("beforeend",
      `<button class="dots__dot" data-slide="${i}"></button>`);
    });

    dots = dotsContainer.querySelectorAll(".dots__dot");

    dotsContainer.addEventListener("click",
    function (e) {
      if (!e.target.classList.contains("dots__dot")) return;
      
      slideInt = +e.target.dataset.slide;
      
      checkSlides();
    });
  };
  createDots();
  
//#endregion
  
//#region Event Listeners
  
  // Simple Listeners
  
  btnCloseModal.addEventListener("click", closeModal);
  btnScrollTo.addEventListener("click", () => scroll(section1));
  overlay.addEventListener("click", closeModal);
  btnSliderLeft.addEventListener("click", changeSlide.bind(-1));
  btnSliderRight.addEventListener("click", changeSlide.bind(1));

  navContainer.addEventListener("mouseover", hoverLinks.bind(0.5));
  navContainer.addEventListener("mouseout", hoverLinks.bind(1));
  
  btnsOpenModal.forEach(b => b.addEventListener("click", openModal));
  
  // Key Listeners
  
  document.addEventListener("keydown",
  function (e) {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) closeModal();
  });

  document.addEventListener("keydown",
  function (e) {
    if (e.key === "ArrowLeft") changeSlide.bind(-1)();
  });

  document.addEventListener("keydown",
  function (e) {
    if (e.key === "ArrowRight") changeSlide.bind(1)();
  });

  // Event Delegation

  document.querySelector(".nav__links").addEventListener("click",
  function (e) {
    e.preventDefault();

    if (e.target.classList.contains("nav__link")) {
      document.querySelector(e.target.getAttribute("href")).scrollIntoView({behavior: "smooth"});
    }
  });

  tabContainer.addEventListener("click",
  function (e) {
    e.preventDefault();

    const btn = e.target.closest(".operations__tab");
    
    // Guard Close
    if (!btn) return;

    tabs.forEach(c => c.classList.remove("operations__tab--active"))
    tabsContent.forEach(c => c.classList.remove("operations__content--active"))
    
    btn.classList.add("operations__tab--active");
    document.querySelector(`.operations__content--${btn.dataset.tab}`).classList.add("operations__content--active");
  });

  function hoverLinks(e, i) {
    if (e.target.classList.contains("nav__link")) {
      const link = e.target;
      const siblings = link.closest(".nav").querySelectorAll(".nav__link");
      const logo = link.closest(".nav").querySelector("img");

      siblings.forEach(el => {
        if (el !== e.target) el.style.opacity = this;
      })

      logo.style.opacity = this;
    } 
  }

//#endregion

//#region Observers

  // const scrollDistance = section1.getBoundingClientRect();
  // 
  // window.addEventListener("scroll",
  // function (e) {
  //   if (window.scrollY > scrollDistance.top) navContainer.classList.add("sticky");
  //   else navContainer.classList.remove("sticky");
  // });

  const obsCallback = function (entries) {
    entries.forEach(ent => {
      if (!ent.isIntersecting) navContainer.classList.add("sticky");
      else navContainer.classList.remove("sticky");
    })
  };

  const obsOptions = {
    root: null,
    rootMargin: `-${navHeight}px`,
    threshold: [0],
  };

  const observer = new IntersectionObserver(obsCallback, obsOptions);
  observer.observe(header);

  // Reveal sections

  const sectionCallback = function (ent, obs) {
    const [entry] = ent;
    if (entry.isIntersecting) entry.target.classList.remove("section--hidden");
    observer.unobserve(entry.target);
  };

  const sectionOptions = {
    root: null,
    threshold: 0.15,
  };

  const sectionObserver = new IntersectionObserver(sectionCallback, sectionOptions);
  sections.forEach(s => {
    s.classList.add("section--hidden");
    sectionObserver.observe(s)
  });

  // Lazy Loading

  const imgTargets = document.querySelectorAll("img[data-src]");

  const imgCallback = function (ent, obs) {
    const [entry] = ent;

    if (!entry.isIntersecting) return;

    entry.target.src = entry.target.dataset.src;
    entry.target.addEventListener("load",
    function (e) {
      entry.target.classList.remove("lazy-img");
    });

    observer.unobserve(entry.target);
  };

  const imgOptions = {
    root: null,
    rootMargin: "200px",
    threshold: 0,
  };

  const imgObserver = new IntersectionObserver(imgCallback, imgOptions);
  imgTargets.forEach(i => imgObserver.observe(i));

  // Slides

  // const slider = document.querySelector(".slider");
  // slider.style.transform = "scale(0.5)";
  // slider.style.overflow = "visible";

  checkSlides();

//#endregion

////////////////////////////////

/* 1

// console.log(document.documentElement);
// console.log(document.head);
// console.log(document.body);

const header = document.querySelector(".header");
const sections = document.querySelectorAll(".section");

// console.log(sections);

document.getElementById("section--1");
const btns = document.getElementsByTagName("button");

// console.log(btns);

// console.log(document.getElementsByClassName("btn"));

// Creating and inserting

// .insertAdjacentHTML

const message = document.createElement("div");
message.classList.add("cookie-message");
// message.textContent = "We use cookies for improved functionality and analytics.";
message.innerHTML = `
We use cookies for improved functionality and analytics.
<button class="btn btn--close-cookie">Got it!</button>`;

// header.prepend(message);
header.append(message);
// header.append(message.cloneNode(true));

// header.before(message);
// header.after(message);

// Delete

document.querySelector(".btn--close-cookie").addEventListener("click",
function () {
  // message.remove();
  message.parentElement.removeChild(message);
});

/* 2

// Styles

message.style.backgroundColor = "#37383d";
message.style.width = "120%";

// console.log(message.style.height);
console.log(getComputedStyle(message).height);

console.log(message.style.width);

message.style.height = Number.parseFloat(getComputedStyle(message).height) + 30 + "px";

document.documentElement.style.setProperty("--color-primary", "orangered");

// Attributes

const logo = document.querySelector(".nav__logo");
// console.log(logo.alt);
// console.log(logo.src); // Absolute
// console.log(logo.getAttribute("src")); // Relative
// console.log(logo.className);

logo.alt = "Beautiful minimalist logo";
logo.setAttribute("company", "Bankist");

const link = document.querySelector(".twitter-link");
console.log(link.href);
console.log(link.getAttribute("href"));

// Data Attributes

console.log(logo.dataset.versionNumber);

// Classes

logo.classList.add("s");
logo.classList.remove("s");
logo.classList.toggle("s");
logo.classList.contains("s");

// Don't use
logo.className = "jonas"; */

/* 3

const btnScrollTo = document.querySelector(".btn--scroll-to");
const section1 = document.querySelector("#section--1");

btnScrollTo.addEventListener("click",
function (e) {
  const s1cords = section1.getBoundingClientRect();
  // console.log(e.target.getBoundingClientRect());
  // console.log("Current scroll ", window.pageXOffset, window.pageYOffset);
  // console.log("Height and width ", document.documentElement.clientHeight, document.documentElement.clientWidth);

  // window.scrollTo({
  //   left: s1cords.left + window.pageXOffset,
  //   top: s1cords.top + window.pageYOffset,
  //   behavior: "smooth",
  // });

  section1.scrollIntoView({
    behavior: "smooth",
  });
}); */

/* 4

const h1 = document.querySelector("h1");

function alertH1 (e) {
  alert("H1");

  h1.removeEventListener("mouseenter", alertH1);
};

h1.addEventListener("mouseenter", alertH1);

// h1.onmouseenter = alertH1; */

/* 5

const randNum = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
const randColor = () => `rgb(${randNum(0, 255)}, ${randNum(0, 255)}, ${randNum(0, 255)})`;

document.querySelector(".nav__link").addEventListener("click",
function (e) {
  this.style.backgroundColor = randColor();
  console.log("Link:" , e.target, e.currentTarget);
  console.log(e.currentTarget === this);

  // e.stopPropagation();
});

document.querySelector(".nav__links").addEventListener("click",
function (e) {
  this.style.backgroundColor = randColor();
  console.log("Container:" , e.target, e.currentTarget);
  console.log(e.currentTarget === this);
});

document.querySelector(".nav").addEventListener("click",
function (e) {
  this.style.backgroundColor = randColor();
  console.log("Nav:" , e.target, e.currentTarget);
  console.log(e.currentTarget === this);
}); */ 

/* 6

const h1 = document.querySelector("h1");

console.log(h1.querySelectorAll(".highlight"));
console.log(h1.childNodes);
console.log(h1.children);
h1.firstElementChild.style.color = "white";
h1.lastElementChild.style.color = "white";

console.log(h1.parentNode);
console.log(h1.parentElement);
h1.closest(".header").style.backgroundColor = `#000000`;
console.log(h1.closest("h1"));

console.log(h1.previousElementSibling);
console.log(h1.nextElementSibling);

console.log(h1.previousSibling);
console.log(h1.nextSibling);

console.log(h1.parentElement.children);
[...h1.parentElement.children].forEach(function (e) {
  if (e !== h1) e.style.transform = "scale(0.5)"
}); */

/* 7

document.addEventListener("DOMContentLoaded",
function (e) {
  console.log("HTML parsed and DOM tree built", e);
});

window.addEventListener("load",
function (e) {
  console.log("Page fully loaded", e);
});

// window.addEventListener("beforeunload",
// function (e) {
//   e.preventDefault();
//   console.log(e);
//   e.returnValue = "";
// }); */

// 8

