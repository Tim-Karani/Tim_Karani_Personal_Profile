/* ==========================================
   MOBILE NAVIGATION
========================================== */

const hamburger = document.querySelector(".hamburger");
const navLinks = document.querySelector(".nav-links");

hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("active");
    hamburger.classList.toggle("active");
});

/* ==========================================
   CLOSE MENU
========================================== */

document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", () => {
        navLinks.classList.remove("active");
        hamburger.classList.remove("active");
    });
});

/* ==========================================
   STICKY NAVIGATION
========================================== */

const header = document.querySelector("header");

window.addEventListener("scroll", () => {
    if(window.scrollY > 50){
        header.style.boxShadow = "0 10px 30px rgba(0,0,0,.08)";
    }
    else{
        header.style.boxShadow = "none";
    }
});

/* ==========================================
   DARK MODE
========================================== */

const themeToggle = document.getElementById("theme-toggle");

function setThemeIcon(isDark){
    const icon = themeToggle.querySelector("i");
    if(isDark){
        icon.classList.remove("fa-moon");
        icon.classList.add("fa-sun");
    }else{
        icon.classList.remove("fa-sun");
        icon.classList.add("fa-moon");
    }
}

// Apply saved theme immediately (this script is deferred, so DOM/body exists)
if(localStorage.getItem("theme") === "dark"){
    document.body.classList.add("dark-mode");
}

setThemeIcon(document.body.classList.contains("dark-mode"));

themeToggle.addEventListener("click", ()=>{
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    setThemeIcon(isDark);
});

/* ==========================================
   TYPING EFFECT
========================================== */

const textArray = [
"IT Professional",
"Web Developer",
"Creative Problem Solver",
"Purpose Driven"
];

let textIndex = 0;
let charIndex = 0;

const typingElement = document.getElementById("typing-text");

function typeText(){
    if(charIndex < textArray[textIndex].length){
        typingElement.textContent += textArray[textIndex].charAt(charIndex);
        charIndex++;
        setTimeout(typeText,80);
    }else{
        setTimeout(eraseText,1800);
    }
}

function eraseText(){
    if(charIndex>0){
        typingElement.textContent = textArray[textIndex].substring(0,charIndex-1);
        charIndex--;
        setTimeout(eraseText,40);
    }else{
        textIndex++;
        if(textIndex>=textArray.length){
            textIndex=0;
        }
        setTimeout(typeText,300);
    }
}

document.addEventListener("DOMContentLoaded",typeText);

/* ==========================================
   BACK TO TOP
========================================== */

const backBtn=document.getElementById("backToTop");

window.addEventListener("scroll",()=>{
if(window.scrollY>300){
backBtn.classList.add("show");
}else{
backBtn.classList.remove("show");
}
});

backBtn.addEventListener("click",()=>{
window.scrollTo({
top:0,
behavior:"smooth"
});
});

/* ==========================================
   PROGRESS BAR
========================================== */

window.addEventListener("scroll",()=>{
const scrollTop=document.documentElement.scrollTop;
const scrollHeight=document.documentElement.scrollHeight-document.documentElement.clientHeight;
const progress=(scrollTop/scrollHeight)*100;
document.getElementById("progress-bar").style.width=progress+"%";
});

/* ==========================================
   SCROLL REVEAL
========================================== */

const reveals=document.querySelectorAll("section");

window.addEventListener("scroll",()=>{
reveals.forEach(section=>{
const top=section.getBoundingClientRect().top;
const visible=150;
if(top<window.innerHeight-visible){
section.classList.add("fade-up");
}
});
});

/* ==========================================
   LOADER
========================================== */

function hideLoader(){
const loaderEl = document.getElementById("loader");
if(!loaderEl || loaderEl.dataset.hidden) return;
loaderEl.dataset.hidden = "true";
loaderEl.style.opacity="0";
loaderEl.style.pointerEvents="none";
setTimeout(()=>{
loaderEl.style.display="none";
},500);
}

// Primary: hide once the DOM itself is ready — does not wait on slow/blocked
// external assets (fonts, icon CDN, images), unlike the old window "load" event.
document.addEventListener("DOMContentLoaded",()=>{
setTimeout(hideLoader, 400);
});

// Safety net: if DOMContentLoaded already fired before this script ran,
// or something else stalls it, force the loader away no later than 2.5s
// so a slow/blocked resource can never permanently block the site.
setTimeout(hideLoader, 2500);

/* ==========================================
   ACTIVE LINK
========================================== */

const navItems=document.querySelectorAll(".nav-links a");

const currentPage = window.location.pathname.split("/").pop() || "index.html";

navItems.forEach(link=>{
const href = link.getAttribute("href");
link.classList.toggle("active", href === currentPage);
});

/* ==========================================
   SKILL BARS (About page) — animate on scroll
========================================== */

const skillBars = document.querySelectorAll(".skill-bar-fill");

if(skillBars.length){
    skillBars.forEach(bar=>{
        bar.dataset.target = bar.style.width;
        bar.style.width = "0";
    });
    const skillObserver = new IntersectionObserver((entries)=>{
        entries.forEach(entry=>{
            if(entry.isIntersecting){
                entry.target.style.width = entry.target.dataset.target;
                skillObserver.unobserve(entry.target);
            }
        });
    },{threshold:0.4});
    skillBars.forEach(bar=> skillObserver.observe(bar));
}

/* ==========================================
   PROJECT FILTERS (Projects page)
========================================== */

const filterBtns = document.querySelectorAll(".filter-btn");
const projectCards = document.querySelectorAll("#projectsGrid .project-card");

if(filterBtns.length && projectCards.length){
    filterBtns.forEach(btn=>{
        btn.addEventListener("click", ()=>{
            filterBtns.forEach(b=>b.classList.remove("active"));
            btn.classList.add("active");
            const filter = btn.getAttribute("data-filter");
            projectCards.forEach(card=>{
                if(filter === "all" || card.getAttribute("data-category") === filter){
                    card.style.display = "";
                }else{
                    card.style.display = "none";
                }
            });
        });
    });
}

/* ==========================================
   CONTACT FORM VALIDATION
========================================== */

const contactForm = document.getElementById("contactForm");

if(contactForm){

    const nameField = document.getElementById("name");
    const emailField = document.getElementById("email");
    const subjectField = document.getElementById("subject");
    const messageField = document.getElementById("message");
    const successBox = document.getElementById("formSuccess");

    function setInvalid(groupId, invalid){
        const group = document.getElementById(groupId);
        if(invalid){
            group.classList.add("invalid");
        }else{
            group.classList.remove("invalid");
        }
    }

    function isValidEmail(value){
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    contactForm.addEventListener("submit", (e)=>{
        e.preventDefault();
        let valid = true;

        if(nameField.value.trim().length < 2){
            setInvalid("group-name", true);
            valid = false;
        }

        else{
            setInvalid("group-name", false);
        }

        if(!isValidEmail(emailField.value.trim())){
            setInvalid("group-email", true);
            valid = false;
        }
        
        else{
            setInvalid("group-email", false);
        }

        if(subjectField.value.trim().length < 2){
            setInvalid("group-subject", true);
            valid = false;
        }
        
        else{
            setInvalid("group-subject", false);
        }

        if(messageField.value.trim().length < 10){
            setInvalid("group-message", true);
            valid = false;
        }
        
        else{
            setInvalid("group-message", false);
        }
        
        if(!valid){
            successBox.classList.remove("show");
            return;
        }
        const to = "placeTech1@gmail.com";
        const subject = encodeURIComponent(subjectField.value.trim());
        const body = encodeURIComponent(
            `Name: ${nameField.value.trim()}\nEmail: ${emailField.value.trim()}\n\n${messageField.value.trim()}`
        );
        window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
        successBox.classList.add("show");
        contactForm.reset();
    });
}
