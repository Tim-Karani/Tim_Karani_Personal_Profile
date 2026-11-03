# Tim Karani — Portfolio v2 ("Cinematic Technology")

A single-page cinematic portfolio with two case studies and a design-system reference page.
Plain HTML, CSS and JavaScript — no framework, no build step, nothing to install.

## Folder structure

```
tim-karani-portfolio/
├── index.html                       Home: opening sequence + 7 chapters
├── projects/
│   ├── faulu-career-guidance.html   Case study 01 (with interactive screen walkthrough)
│   └── field-operations-system.html Case study 02 (concept, with working prototype loop)
├── design-system.html               Colour, type, components and motion rules (not indexed)
├── 404.html                         Custom "signal lost" page (Netlify serves it automatically)
├── thanks.html                      Contact-form fallback page (used when JavaScript is off)
├── netlify.toml                     Publish settings, redirects from v1 URLs, security headers
└── assets/
    ├── css/main.css                 The whole design system — tokens at the top
    ├── js/main.js                   Nav, progress, opening sequence, hero camera, reveals, form
    ├── js/scenes.js                 Interactive scenes, lazy-loaded after first paint
    ├── img/favicon.svg, og-cover.png
    └── documents/Tim_Karani_CV.pdf  Corrected CV (see "What changed in this round")
```

## Run it locally

```bash
cd tim-karani-portfolio
python -m http.server 8000      # then open http://localhost:8000
```
(A static server is needed because the JavaScript uses ES modules; double-clicking index.html won't run them.)

## Deploy to Netlify (keeps tim-karani.netlify.app)

1. In your site's repository, delete the old v1 files (about.html, projects.html, services.html,
   resume.html, contact.html, the old assets/css and assets/js) and copy in everything from this folder.
   The old URLs keep working: netlify.toml redirects them to the matching chapter.
2. Commit and push (or drag the folder into Netlify → Deploys). No build command; publish directory is the repo root.
3. Contact form: Netlify → Forms → enable form detection. After the next deploy a form called `contact`
   appears. Add an email notification to timothykarani001@gmail.com under Forms → Form notifications.

No environment variables. No paid services.

## What changed in this round

- **Opening sequence, rebuilt as a title sequence.** A single line of light draws across the dark frame;
  the camera dollies fast down a corridor of floating interface planes (each carries a fragment of your real
  work: a form tag, a SQL join, a support-log line) and settles; your name tracks in and racks into focus
  while an anamorphic light streak crosses the frame; letterbox bars retract. Total ≈ 3.5 s, skippable,
  once per session. After the opening, the planes recede so the text stays easy to read. Scrolling pushes the
  camera forward and tilts it, and the title recedes — without hijacking the scroll.
- **Design system completed.** Each chapter now has its own key light that comes up as it enters;
  chapter rules draw in like title cards. New `design-system.html` documents every token and rule.
- **Portrait.** The profile.jpg in your project zip is a generated "TK" placeholder (your old README says so),
  so the site doesn't present it as a photo. It uses a camera-viewfinder monogram instead. To add a real
  portrait, see the comment in `index.html` (search for `portrait.jpg`).
- **Faulu case study.** New interactive walkthrough of the four main screens (sign-up, questionnaire,
  results, dashboard), clearly labelled as an illustrative recreation.
- **Faulu case study rebuilt from the source code.** Real home and sign-in screenshots; journey, features,
  architecture and code excerpts now match the actual app (skills-based matching, saved careers, goals,
  admin panel, CSRF protection, bcrypt). Screens behind the login are recreated in Faulu's own green look,
  clearly labelled. Home-page scenes now use real excerpts from login.php, register.php and results.php.
- **CV corrected.** Your CV PDF contained placeholder contact details (+254 700 000 000 and
  placeTech1@gmail.com) and links to github.com/timkarani and linkedin.com/in/timkarani. That GitHub
  address doesn't exist, and neither link could be verified. The new PDF has identical content, with the
  contact line changed to your real phone, email and portfolio URL, and the two unverified links removed.

## Content still needed from you

1. **LinkedIn and GitHub URLs.** Ready-made rows are commented out in `index.html` (search `YOUR-HANDLE`).
   Add them to the CV too once confirmed.
2. **A real portrait** (optional) — see the comment in `index.html` (search `portrait.jpg`).
3. **More Faulu screenshots** once you can sign in again (questionnaire, results, dashboard, admin).
   Save them as WebP in `assets/projects/faulu/` and add `<figure>` blocks next to the two in
   "The real app" section of `projects/faulu-career-guidance.html`. The recreated tabs can then be retired.
4. **Faulu on GitHub** — if the repository is public, add its link to the case study and to the
   archive entry. Remove the database passwords from it first (see faulu-login-fix → FIX-NOTES.md).

Confirmed in this round: diploma title is **Diploma in Information Technology** (used throughout),
and the Faulu case study now describes the features found in its source code.

## Tested (headless Chrome)

| Check | Result |
|---|---|
| Console errors / broken internal links (all 6 pages) | None |
| Horizontal overflow at 1440 px and 390 px | None |
| Keyboard: skip-intro focus, tabs with arrow keys; mobile menu opens and closes | Working |
| Reduced motion (OS setting and Motion toggle), JavaScript disabled | All content visible |
| Contact form off Netlify | Shows an honest error with your email address |
| Frame rate, desktop | ~60 fps in the opening, idle and while scrolling |
| Frame rate, phone with 4× CPU slowdown + slow 4G | ~60 fps |
| Frame rate, phone with 6× CPU slowdown | ~52 fps during the opening, ~60 fps after |
| Layout shift (CLS) | 0.02 or lower |
| Largest paint (LCP), phone, 4× CPU, slow 4G | 1.2 s on repeat visits; ~4.3 s on the first visit because the name is revealed by the opening sequence |

## Not yet verified

- A physical Android phone and Safari / iOS.
- A Lighthouse run against the live deployment.
- Google Fonts couldn't be reached from the build environment, so screenshots used fallback fonts. The live
  site will load Archivo and JetBrains Mono and look sharper.

## Editing content

- Text lives directly in the HTML (readable by search engines, works without JavaScript).
- Colours, type and spacing: the `:root` block at the top of `assets/css/main.css`.
- Words on the hero's interface planes: `PLANE_LABELS` in `assets/js/main.js`.
- Career sample data in the request-flow demo: `CAREERS` in `assets/js/scenes.js`.
- Support-console scenarios: `SCENARIOS` in `assets/js/scenes.js`.
