# shawonhaque.github.io

Personal portfolio of **Shawon Haque**, Full Stack Developer.
Live at **https://shawonhaque.github.io**

## Overview

A single-page, dependency-free portfolio built with semantic HTML, modern CSS and
vanilla JavaScript. No framework, no build step — the files are deployed as-is via
GitHub Pages, which keeps the site fast and the maintenance surface small.

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
- Custom 404 page

## Structure

```
.
├── index.html            # Single-page site
├── 404.html              # Custom not-found page
├── site.webmanifest      # Web app manifest
├── robots.txt            # Crawler rules + sitemap reference
├── sitemap.xml           # XML sitemap
├── favicon.ico           # Browser favicon
└── assets/
    ├── css/styles.css    # Design tokens, layout, components
    ├── js/main.js        # Theme, navigation, scroll behaviour
    ├── js/vendor/        # Third-party scripts, committed as-is
    │   └── lenis.min.js  # Smooth wheel scrolling (MIT, v1.3.27)
    ├── img/              # Optimised images, icons, social card
    └── resume/
        ├── resume.html   # Source for the PDF (print stylesheet)
        └── Shawon-Haque-Resume.pdf
```

## Editing the resume

`assets/resume/resume.html` is the source. Edit it, then regenerate the PDF:

```bash
chromium --headless --no-pdf-header-footer \
  --print-to-pdf=assets/resume/Shawon-Haque-Resume.pdf \
  file://$PWD/assets/resume/resume.html
```

## Local preview

Any static file server works:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deployment

Served by GitHub Pages from the `main` branch root. Push to `main` and deployment
runs automatically.
