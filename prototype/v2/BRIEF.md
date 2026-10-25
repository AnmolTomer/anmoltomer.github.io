# Portfolio prototype brief (shared by all 8 builders)

Throwaway prototypes for Anmol Tomer's personal portfolio. Branch `prototype/portfolio-variants` only. Never commit or push.

## What the owner said

He rejected four earlier attempts as "really bad designs, no animation, motion, attraction, very bland". He wants a world-class landing page with real motion: smooth animated scroll, hover states, Framer-style springs and layout animation, 3D (three.js) where it earns its place, visuals and effects. It must still feel elegant and put UX first.

His two references:
- https://j471n.in/ is a light page with a faint diagonal-hatch background and corner crosshairs. The name is set in a heavy grotesk, with the second line in a brush script. A tilted, framed photo has floating stat cards. Outlined social icon buttons. A skills grid of logo tiles. A "Featured Articles" list with numbered rows and a big article count.
- https://ishanbagchi.com/ is a soft aurora background with a floating pill nav whose active pill slides. It has a centred circular avatar with a wave emoji and a stats row. Project cards alternate image left and right. There's a ⌘K command palette, a scroll-progress back-to-top ring and a theme toggle.

Screenshots of both are in `/private/tmp/claude-501/-Users-anmoltomer-Documents-code-personal-projects-anmoltomer-github-io/64b150c5-0eca-4b24-af80-f8aea74204c6/scratchpad/ref/` (`*-fold.png`, `*-0.25.png`, `*-0.5.png`, `*-0.75.png`). Look at them before designing. Match that level of density and polish, then go further in your assigned direction. Eyebrow labels, monospace accents, stat chips and cards are all fine here because the owner likes them.

## Content (real only)

Read everything from `../data.js` (`window.PORTFOLIO`). Load it with `<script src="../data.js"></script>`. Render content from that object rather than retyping it, so a fix in one place updates all eight.
- Never invent employers, clients, testimonials, metrics or projects. Do not name his current employer.
- The `stats` in data.js are the only numbers you may show.
- His illustrated Ghibli-style portrait is at `PORTFOLIO.portrait.src`, relative to your page.
- Tool logos live at `PORTFOLIO.logoBase + tool.logo`. Logos marked `mono: true` are black and need `filter: invert(1)` on dark grounds.
- Required sections: hero (name, role, intro, primary action Email me, socials), stack, how I work (principles), now (agentic AI), writing (Medium articles: show at least 4 with covers, title, date, tags; link out), and contact. The timeline and agentRun data are optional extras.

## Files

- Your page is `prototype/v2/<your-slug>/index.html`. Put all CSS and JS inline in that one file. You may add a small asset under your own folder only. Touch no other file.
- Include `<script src="../switcher.js"></script>`, which adds the prototype bar for flipping between variants with `[` and `]`.
- Libraries come from CDN only, pinned to these exact versions:
  - GSAP 3.12.5 + ScrollTrigger: `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js` and `.../ScrollTrigger.min.js`.
  - Lenis 1.1.13: `https://unpkg.com/lenis@1.1.13/dist/lenis.min.js` and `.../lenis.css`.
  - three 0.160.0 as an ES module via importmap: `https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js` (addons under `.../examples/jsm/`).
  - Motion 11.11.13 (Framer Motion's vanilla API: `animate`, `inView`, `scroll`, springs): `https://cdn.jsdelivr.net/npm/motion@11.11.13/+esm`.
  - Fonts from Google Fonts or Fontshare.

## Quality bar (motion and UX)

Follow Emil Kowalski's rules. They're summarised here, and the full skill is `/Users/anmoltomer/.claude/skills/emil-design-eng/SKILL.md` (read it).
- Use custom easings: `--ease-out: cubic-bezier(.23,1,.32,1)` and `--ease-in-out: cubic-bezier(.77,0,.175,1)`. Never use ease-in on UI.
- Keep UI transitions under 300ms. Hero and scroll choreography can run longer.
- Stagger entrances 50-90ms, rising 16-32px with opacity. Elements start at scale(.95) or more, never scale(0).
- Pressable things get `:active { transform: scale(.97) }`. Gate hover effects behind `@media (hover:hover) and (pointer:fine)`.
- Animate transform and opacity only. Use springs for anything cursor-driven (magnetic buttons, tilt, parallax).
- Lenis smooth scroll, wired to ScrollTrigger if you use it. Anchor links scroll smoothly through Lenis.
- `prefers-reduced-motion` keeps all content and drops travel, parallax, 3D spin and Lenis.
- Content must be visible if JS fails. Hide only after JS adds a class on `<html>`.
- Light and dark theme toggle, persisted in localStorage inside try/catch, with no flash on load.
- Phone (390px) is its own composition. No horizontal overflow, and tap targets of 44px or more.
- three.js scenes: cap DPR at 2, pause when off-screen or the tab is hidden, and provide a static fallback when WebGL is missing.
- Semantic HTML: one h1, a heading per section, alt text, visible focus, keyboard-operable controls.

## Verify before reporting

1. Serve with the existing server at `http://localhost:8731/` (repo root is served; your page is `http://localhost:8731/prototype/v2/<slug>/`). If it is down, run `python3 -m http.server 8731` from the repo root in the background.
2. Write a Playwright script in your scratch folder `/private/tmp/claude-501/-Users-anmoltomer-Documents-code-personal-projects-anmoltomer-github-io/64b150c5-0eca-4b24-af80-f8aea74204c6/scratchpad/v2/<slug>/`. Import from `/opt/homebrew/lib/node_modules/@playwright/cli/node_modules/playwright-core/index.mjs` and launch with `chromium.launch({ channel: 'chrome' })`.
   - Capture the fold plus 3-4 scroll positions at 1440x900, in light and dark.
   - Capture the fold and a full scroll at 390x844.
   - Scroll gradually with `mouse.wheel` and waits so scroll animations fire.
   - Record `pageerror` and console errors, and check `scrollWidth - innerWidth` for overflow.
3. Look at every screenshot with the Read tool. Fix anything broken, ugly, invisible, overlapping or cropped. Do at least two look-and-fix rounds.
4. Report `PASS` or `ISSUES` with:
   - the screenshot paths;
   - the signature interactions you built;
   - libraries used;
   - any console errors left;
   - anything you could not verify, such as how the motion feels, which a screenshot can't show.
