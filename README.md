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
- Contact form that composes a prefilled email, plus one-click address copy
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
    │   └── portrait-new.*  # Hero portrait, alpha cut-out (WebP + PNG)
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

## Editing the resume

`assets/resume/resume.html` is the source. Edit it, then regenerate the PDF:

```bash
chromium --headless --no-pdf-header-footer \
  --print-to-pdf=assets/resume/Shawon-Haque-Resume.pdf \
  file://$PWD/assets/resume/resume.html
```

`shawon-haque.png` sits next to the source, so the `file://` path above resolves it
without a server. The PDF is a single A4 page; check the page count after editing.

Keep the photo a **PNG**. Chrome embeds it in the PDF as a `FlateDecode` stream, which
every reader decodes; a JPEG becomes a `DCTDecode` stream instead, and a progressive
JPEG inside one is not rendered by all of them. Flatten any transparency onto white
first, since the page is white:

```python
photo.convert('RGBA')                       # source
flat = Image.alpha_composite(Image.new('RGBA', photo.size, (255,255,255,255)), photo)
flat.convert('RGB').save('shawon-haque.png', 'PNG', optimize=True)
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
