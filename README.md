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
├── tools/
│   └── build-resume.py   # Renders the resume PDF and fixes its colour space
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
