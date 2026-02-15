# CLAUDE.md

## Project Overview

**Graphics Overfit** is a static website for a Korean street fashion brand. The site is hosted via GitHub Pages at `graphicsoverfit.co.kr` and serves as a portfolio and e-commerce gateway linking to Musinsa and Naver Smart Store.

There is no build system, no backend, and no JavaScript framework. All pages are standalone HTML files with inline CSS and inline JavaScript.

## Repository Structure

```
/
├── index.html                          # Homepage (main entry point)
├── CNAME                               # GitHub Pages custom domain (graphicsoverfit.co.kr)
├── robots.txt                          # SEO configuration
├── favicon.ico / favicon.png           # Site icons
├── 시퀀스 01.mp4                        # Homepage video
├── image/                              # Homepage assets (GIFs, PNGs, MP4s)
├── Brand Culture/
│   ├── Brand Culture.html              # Brand culture page
│   └── image/                          # Brand culture media
├── Concept art/
│   ├── Concept art.html                # Concept art gallery
│   └── image/                          # Art thumbnails and backgrounds
├── look book/
│   ├── look book.html                  # Lookbook landing page
│   ├── Model.html                      # Model page
│   ├── Curator.html                    # Curator page
│   └── image/                          # Lookbook photos (organized by curator)
└── NewTrending/
    ├── new-arrivals.html               # New arrivals page
    ├── limited-edition.html            # Limited edition page
    ├── Upcoming Collection.html        # Upcoming collection page
    └── image/                          # Product images (new/, limit/, up/ subdirs)
```

## Tech Stack

- **HTML/CSS/JS only** — no frameworks, no libraries, no build tools
- **No package manager** — no `package.json`, no `node_modules`
- **No build step** — files are served as-is via GitHub Pages
- **External font**: Google Fonts `Noto Sans KR` (loaded in some pages)
- **Responsive**: media queries with 768px mobile breakpoint

## Development Workflow

### Running Locally

Open any HTML file directly in a browser, or use a local server:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

### Deployment

The site is deployed via **GitHub Pages** from the `main` branch. Pushing to `main` triggers automatic deployment. The custom domain is configured in the `CNAME` file.

### No Tests, Linting, or CI/CD

There are no automated tests, linters, formatters, or CI pipelines configured.

## Code Conventions

### File Organization

- Each section of the site has its own directory with an HTML file and an `image/` subfolder
- Directory and file names use spaces and mixed case (e.g., `Brand Culture/Brand Culture.html`, `look book/look book.html`)
- All CSS is embedded in `<style>` tags within each HTML file (no external stylesheets)
- All JavaScript is embedded in `<script>` tags within each HTML file (no external scripts)

### Design Patterns

- **Dark theme**: black backgrounds (`#000`, `#111`), white text
- **Shared navigation**: each page has a consistent sidebar nav and fixed header with logo and SNS links (Instagram, Musinsa)
- **Hamburger menu**: mobile navigation toggle on all pages
- **Interactive elements**: image sliders with dot indicators, dropdown menus, modals with localStorage "don't show again" support
- **Flexbox layouts** for responsive content arrangement

### Language

- HTML comments and UI text are in **Korean**
- Code identifiers (CSS classes, JS variables) are in English

## Key Pages

| Page | File | Description |
|------|------|-------------|
| Homepage | `index.html` | Main landing with slider, popup, brand links |
| Brand Culture | `Brand Culture/Brand Culture.html` | Brand story with video content |
| Concept Art | `Concept art/Concept art.html` | Art gallery with thumbnails |
| Lookbook | `look book/look book.html` | Collection overview |
| Model | `look book/Model.html` | Model photo gallery |
| Curator | `look book/Curator.html` | Curator photo gallery |
| New Arrivals | `NewTrending/new-arrivals.html` | Latest products |
| Limited Edition | `NewTrending/limited-edition.html` | Limited items |
| Upcoming | `NewTrending/Upcoming Collection.html` | Future releases |

## Important Notes for AI Assistants

- **Media-heavy repo**: The repository contains large GIF and image files (some over 20MB). Avoid re-adding or duplicating these assets.
- **No `.gitignore`**: All files are tracked, including large media. Be mindful when staging changes.
- **No build/test commands**: There is nothing to build or test. Validate changes by opening HTML files in a browser.
- **Inline everything**: CSS and JS live inside HTML files. Do not create separate `.css` or `.js` files unless explicitly asked — that would break the existing pattern.
- **File paths with spaces**: Many directories and files contain spaces. Always quote paths in shell commands.
- **Cross-page consistency**: Navigation, header, and footer patterns are duplicated across pages. Changes to shared UI elements should be applied to all 9 HTML files.
- **Korean content**: The site content is in Korean. Preserve existing Korean text when editing.
