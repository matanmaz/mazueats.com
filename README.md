# mazueats.com

Clean static site for MAZU restaurant.

## File structure

```
mazueats.com/
├── index.html          # Home (photo slideshow)
├── about.html          # About + hours
├── menu.html           # Menu (single image)
├── ifa.html            # Immigrants Feed America events
├── contact.html        # Contact / location
├── partials/
│   ├── header.html     # Top bar + nav (edit nav links ONCE here)
│   └── footer.html     # Footer (edit address/phone ONCE here)
├── assets/
│   ├── css/styles.css  # All styling — colors, fonts, layout
│   └── js/main.js      # Loads partials, runs slideshow + mobile menu
├── img/                # Your existing images (logo, about-img/, menu.jpg, etc.)
└── README.md
```

## How to make common edits

### Change phone number, address, or social links
Open `partials/footer.html` (and `partials/header.html` for the top social icons).
Edit once → updates on every page.

### Add or rename a nav menu item
Open `partials/header.html`, edit the `<nav>` list.

### Change colors, fonts, or spacing
Open `assets/css/styles.css`. The top section has CSS variables like:
```css
:root {
  --color-accent: #fc6c3f;
  --color-text: #232d37;
  --font-body: 'Poppins', sans-serif;
  --font-display: 'Shadows Into Light Two', cursive;
}
```
Change those values and the whole site updates.

### Add or remove home page slideshow photos
Open `index.html` and edit the `<div class="slideshow">` block. Just add or remove
`<img>` tags. JS handles the rest.

### Update hours
Open `about.html` — the hours are in plain HTML inside `.hours-box`.

### Update the menu
Replace `img/menu.jpg` with a new image. (If you ever want a text-based menu instead
of an image, ask and I'll swap it for an editable HTML version.)

### Add or edit an event on the IFA page
Open `ifa.html`. Each event is a `<article class="event">` block — copy/paste one
and edit the date, title, and body. Use `<span class="badge badge-free">Free</span>`
or `<span class="badge badge-paid">$15</span>` for the tag.

## Running locally
Because the site uses `fetch()` to load the header/footer partials, you can't just
double-click `index.html` — browsers block that for security. Two easy options:

**Option A — Python (already installed on Mac/Linux, easy to install on Windows):**
```
cd path/to/mazueats.com
python -m http.server 8000
```
Then visit http://localhost:8000

**Option B — VS Code:** install the "Live Server" extension, right-click `index.html`,
choose "Open with Live Server".

When deployed to a real web host (GitHub Pages, Netlify, your current host), it just works.

## Deployment
Upload all files to your web host, keeping the folder structure. That's it.
