# shawonhaque.github.io

Personal portfolio of **Shawon Haque**, Full Stack Developer.
Live at **https://shawonhaque.github.io**

## Overview

A dependency-free portfolio built with semantic HTML, modern CSS and vanilla
JavaScript. No framework, no build step — the files are deployed as-is via GitHub
Pages, which keeps the site fast and the maintenance surface small.

The home page is a single scrolling page; the case studies, the process page and
the 404 page are separate documents that share the same stylesheet and tokens.

## Features

- Responsive layout from small phones up to large desktops
- Light and dark themes with system detection and a persisted preference
- Accessible: skip link, keyboard navigation, visible focus states, ARIA-labelled
  controls, reduced-motion support
- SEO: descriptive title and meta description, canonical URL, Open Graph and
  Twitter cards, JSON-LD `Person` structured data, `robots.txt` and `sitemap.xml`
- Performance: system font fallbacks, `font-display: swap`, preloaded hero image,
  WebP with JPEG fallback, lazy loading below the fold
- Resume: one-page PDF, viewable in the browser or downloadable from the Resume section
- Contact form that composes a prefilled email, plus one-click address copy
- Optional motion: a WebGL hero constellation and scroll-driven reveals, both
  additive — the site works the same without them
- Case studies: a full write-up per project — problem, architecture, security and
  trade-offs — linked from each project card
- Writing index: the long-form pieces in one place, with measured word counts
- Blog notes: technical write-ups drawn from the source — Row Level Security,
  a typed service layer, progressive enhancement, and the build-time feed
  pipeline
- Process page: the learning path through the stack and the five-stage workflow
- Custom 404 page

## Related repositories

- **[shawonhaque.github.io](https://github.com/shawonhaque/shawonhaque.github.io)** — this site
- **[Nexora](https://github.com/shawonhaque/Nexora)** — full-stack knowledge platform · [live](https://shawonhaque.github.io/Nexora/)
- **[Shawon-](https://github.com/shawonhaque/Shawon-)** — talking-video portfolio, TanStack Start · [live](https://shawonhaque.github.io/Shawon-/)
- **[shawonhaque](https://github.com/shawonhaque/shawonhaque)** — GitHub profile README

## Structure

```
.
├── index.html            # Home: hero, about, expertise, projects, experience,
│                         # resume, contact
├── journey.html          # Development journey and workflow
├── writing.html          # Writing index (the long-form pieces)
├── blog/                 # Technical notes
│   ├── row-level-security.html
│   ├── typed-service-layer.html
│   ├── progressive-enhancement.html
│   └── build-time-feeds.html
├── 404.html              # Custom not-found page
├── projects/
│   ├── index.html        # Case-study index
│   ├── nexora.html       # NEXORA case study
│   ├── portfolio.html    # This site's case study
│   └── shawon.html       # Talking-video portfolio case study
├── site.webmanifest      # Web app manifest
├── robots.txt            # Crawler rules + sitemap reference
├── sitemap.xml           # XML sitemap
├── favicon.ico           # Browser favicon
├── tools/
│   └── build-resume.py   # Renders the resume PDF and fixes its colour space
└── assets/
    ├── css/styles.css    # Design tokens, layout, components, inner pages
    ├── js/main.js        # Theme, navigation, scroll behaviour
    ├── js/motion.js      # Optional motion layer (WebGL hero, scroll effects)
    ├── js/vendor/        # Third-party scripts, committed as-is
    │   ├── lenis.min.js      # Smooth wheel scrolling (MIT, v1.3.27)
    │   ├── gsap.min.js       # GSAP core (standard licence)
    │   ├── ScrollTrigger.min.js
    │   └── three.module.min.js  # Three.js, ES module (MIT, r160)
    ├── img/              # Optimised images, icons, social card
    │   └── portrait-3d.*   # Hero 3D render, alpha cut-out (WebP + PNG)
    └── resume/
        ├── resume.html       # Source for the PDF (print stylesheet)
        ├── shawon-haque.png  # Headshot used in the resume header
        └── Shawon-Haque-Resume.pdf
```

## Design

An editorial layout: a greige canvas behind white panels, near-black type set in
Inter, and a single restrained accent. The hero pairs a large outlined name with an
alpha cut-out portrait, and the experience block inverts to near-black for contrast.
Light and dark themes both run off the same token set.

## Motion

Everything animated is optional. The site is complete and readable with JavaScript
off, with motion turned down, and on a device that cannot run WebGL — the layers
below only add to what is already there.

- **Hero constellation** — a Three.js point field, drawn behind the hero. It is
  loaded as an ES module only after the hero nears the viewport, only on screens
  wider than 720px, and only when WebGL is available. It pauses when scrolled out
  of view or when the tab is hidden, and re-tints itself when the theme changes.
- **Scroll effects** — GSAP with ScrollTrigger drives the section headings, the
  ghost watermark, the experience blocks and the hero copy. Every tween sets
  `immediateRender: false`, so nothing is hidden until its animation actually
  starts; if ScrollTrigger never fires, the page looks exactly like the plain
  version.
- **Reduced motion** — when `prefers-reduced-motion: reduce` is set, the canvas is
  hidden in CSS, the hero scene is never fetched, and no scroll tweens are created.
  The reveal-on-scroll in `main.js` still runs on IntersectionObserver, which is
  the same behaviour the site had before GSAP was added.

Three.js (MIT), GSAP and ScrollTrigger (GreenSock standard licence) and Lenis (MIT)
are committed under `assets/js/vendor/` and loaded from there, so the site has no
runtime dependency on a CDN.

## Editing the resume

`assets/resume/resume.html` is the source. Edit it, then regenerate the PDF:

```bash
python3 tools/build-resume.py     # needs chromium and pikepdf
```

The script prints the page with Chrome and then rewrites the photo's colour space.
Both steps are needed, and both are about the same thing: the photo must decode in
every reader, not just the big desktop ones.

- **Colour space.** Chrome writes the photo as `/ColorSpace [/ICCBased <stream>]`, and
  a reader needs ICC support to decode that. Small and embedded PDF libraries — inside
  mobile viewers and chat apps — often have none, so they drop the image and the
  resume shows a blank photo. The script switches it to `/DeviceRGB`, which every
  reader decodes. The photo is sRGB, so the picture does not change.
- **Encoding.** Keep `shawon-haque.png` a **PNG**: Chrome embeds it as a `FlateDecode`
  stream. A JPEG becomes `DCTDecode` instead, and a progressive JPEG inside one is not
  rendered by all readers. Flatten any transparency onto white, since the page is
  white:

```python
photo.convert('RGBA')                       # source
flat = Image.alpha_composite(Image.new('RGBA', photo.size, (255,255,255,255)), photo)
flat.convert('RGB').save('shawon-haque.png', 'PNG', optimize=True)
```

`shawon-haque.png` sits next to the source, so the file path resolves without a
server. The PDF is a single A4 page; check the page count after editing.

## Local preview

Any static file server works:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deployment

Served by GitHub Pages from the `main` branch root. Push to `main` and deployment
runs automatically.
