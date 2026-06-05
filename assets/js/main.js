/* ============================================================
   MAZU — site script
   - Loads shared header + footer partials BEFORE revealing the page,
     so it doesn't visibly jump as the header drops in.
   - Marks the current nav link as active
   - Mobile menu toggle
   - Home page slideshow: scrolling carousel that shows N images
     at a time and advances one slide every few seconds, looping.
   ============================================================ */

document.addEventListener('DOMContentLoaded', init);

/* Safety net: if anything in init() throws or stalls, reveal the
   page anyway after 2s so it can never get stuck invisible. */
setTimeout(() => document.body.classList.add('ready'), 2000);

async function init() {
  // Load header + footer in parallel; wait for BOTH before showing the page.
  await Promise.all([
    loadPartial('site-header', 'partials/header.html'),
    loadPartial('site-footer', 'partials/footer.html'),
  ]);

  highlightActiveNav();
  wireMobileMenu();
  startSlideshow();

  // Reveal the fully-assembled page on the next frame so the browser
  // has a chance to lay everything out first (no flash, no jump).
  requestAnimationFrame(() => document.body.classList.add('ready'));
}

/* ---------- Load shared header/footer ---------- */
async function loadPartial(slotId, url) {
  const slot = document.getElementById(slotId);
  if (!slot) return;
  try {
    const res = await fetch(url);
    slot.innerHTML = await res.text();
  } catch (err) {
    console.error('Could not load', url, err);
  }
}

/* ---------- Active nav link ---------- */
function highlightActiveNav() {
  const current = document.body.dataset.page;
  if (!current) return;
  document.querySelectorAll('.site-nav a[data-page]').forEach(a => {
    if (a.dataset.page === current) a.classList.add('active');
  });
}

/* ---------- Mobile menu ---------- */
function wireMobileMenu() {
  const btn = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');
  if (!btn || !nav) return;
  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
  });
}

/* ---------- Slideshow (scrolling carousel) ----------
   How it works:
   - We clone the first N images onto the end of the track so when we
     slide past the "real" last slide, the cloned ones make the wrap
     look seamless. After the transition ends on a clone, we snap
     instantly back to the equivalent real slide (no transition).
   - The number of visible images and gap come from the CSS variables
     --slide-visible and --slide-gap (defined in styles.css), so the
     same JS works for desktop / tablet / mobile.
----------------------------------------------------- */
function startSlideshow() {
  const slideshow = document.querySelector('.slideshow');
  const track     = document.querySelector('.slideshow-track');
  if (!slideshow || !track) return;

  const originals = Array.from(track.querySelectorAll('img'));
  if (originals.length === 0) return;

  const speedMs = 3500; // time between auto-advances (also see CSS --slide-speed)

  // Helper: read current "visible count" from CSS variable
  const getVisible = () => {
    const v = parseInt(
      getComputedStyle(slideshow).getPropertyValue('--slide-visible'),
      10
    );
    return Math.max(1, Math.min(originals.length, v || 3));
  };

  // Clone enough images at the end to cover one "page" for seamless loop
  let clones = [];
  const buildClones = () => {
    clones.forEach(c => c.remove());
    clones = [];
    const n = getVisible();
    for (let i = 0; i < n; i++) {
      const c = originals[i].cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      track.appendChild(c);
      clones.push(c);
    }
  };
  buildClones();

  let index = 0; // index of the leftmost visible slide

  // Move the track to show the slide at `index`
  const slideTo = (i, animate = true) => {
    const slide = track.querySelector('img');
    if (!slide) return;
    const slideWidth = slide.getBoundingClientRect().width;
    const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
    const offset = (slideWidth + gap) * i;
    track.style.transition = animate ? 'transform .6s ease' : 'none';
    track.style.transform = `translateX(-${offset}px)`;
  };

  const next = () => {
    index++;
    slideTo(index, true);
    // When we've scrolled into the cloned area, snap back to the start
    if (index >= originals.length) {
      const onEnd = () => {
        track.removeEventListener('transitionend', onEnd);
        index = 0;
        slideTo(0, false);
      };
      track.addEventListener('transitionend', onEnd);
    }
  };

  const prev = () => {
    if (index === 0) {
      // Jump (no animation) to the equivalent position past the end,
      // then animate back one step so it looks like we wrapped backwards.
      index = originals.length;
      slideTo(index, false);
      // Force reflow so the next transform actually animates
      void track.offsetWidth;
    }
    index--;
    slideTo(index, true);
  };

  // Auto-advance
  let timer = setInterval(next, speedMs);
  const reset = () => { clearInterval(timer); timer = setInterval(next, speedMs); };

  const nextBtn = document.querySelector('.slideshow-controls .next');
  const prevBtn = document.querySelector('.slideshow-controls .prev');
  if (nextBtn) nextBtn.addEventListener('click', () => { next(); reset(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { prev(); reset(); });

  // Re-measure on resize (visible count may change via media queries)
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      buildClones();
      index = 0;
      slideTo(0, false);
    }, 150);
  });
}
