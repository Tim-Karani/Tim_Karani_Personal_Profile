/* ==========================================
   SHARED HEADER & FOOTER
   Single source of truth — edit here, not in each page.
   Injected into #site-header / #site-footer placeholders.
   Loaded with `defer`, so the placeholder divs already exist
   in the DOM by the time this runs.
========================================== */

const SITE_HEADER = `
<header>
<nav class="navbar">
    <div class="logo">
        <h2>Tim Karani</h2>
        <span>IT Professional</span>
    </div>
    <ul class="nav-links">
        <li><a href="index.html">Home</a></li>
        <li><a href="about.html">About</a></li>
        <li><a href="projects.html">Projects</a></li>
        <li><a href="services.html">Services</a></li>
        <li><a href="resume.html">Resume</a></li>
        <li><a href="contact.html">Contact</a></li>
    </ul>
    <div class="nav-actions">
        <button id="theme-toggle"><i class="fas fa-moon"></i></button>
        <div class="hamburger"><span></span><span></span><span></span></div>
    </div>
</nav>
</header>
`;

const SITE_FOOTER = `
<footer>
<div class="footer-content">
    <h2>Tim Karani</h2>
    <p>Using technology with purpose to create solutions that serve people and make a meaningful impact.</p>
    <div class="social-links">
        <a href="#" aria-label="LinkedIn"><i class="fab fa-linkedin"></i></a>
        <a href="#" aria-label="GitHub"><i class="fab fa-github"></i></a>
        <a href="mailto:placeTech1@gmail.com" aria-label="Email"><i class="fas fa-envelope"></i></a>
    </div>
    <p class="copyright">© 2026 Tim Karani. All Rights Reserved.</p>
</div>
</footer>
`;

(function injectPartials(){

    const headerSlot = document.getElementById("site-header");
    const footerSlot = document.getElementById("site-footer");

    if(headerSlot) headerSlot.innerHTML = SITE_HEADER;
    if(footerSlot) footerSlot.innerHTML = SITE_FOOTER;

})();
