/* ============================================================
   MAZU — site script
   - Loads shared header + footer partials
   - Marks the current nav link as active
   - Mobile menu toggle
   - Home page slideshow (auto-advance + prev/next)
   ============================================================ */

document.addEventListener('DOMContentLoaded', init);

async function init() {
  await loadPartial('site-header', 'partials/header.html');
  await loadPartial('site-footer', 'partials/footer.html');

  highlightActiveNav();
  wireMobileMenu();
  startSlideshow();
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
  // Page sets <body data-page="about"> etc. Match against nav data-page.
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

/* ---------- Slideshow ---------- */
function startSlideshow() {
  const slides = document.querySelectorAll('.slideshow img');
  if (slides.length === 0) return;

  let index = 0;
  slides[0].classList.add('is-active');

  const show = i => {
    slides.forEach(s => s.classList.remove('is-active'));
    index = (i + slides.length) % slides.length;
    slides[index].classList.add('is-active');
  };

  const next = () => show(index + 1);
  const prev = () => show(index - 1);

  // Auto-advance every 4 seconds
  let timer = setInterval(next, 4000);
  const reset = () => { clearInterval(timer); timer = setInterval(next, 4000); };

  const nextBtn = document.querySelector('.slideshow-controls .next');
  const prevBtn = document.querySelector('.slideshow-controls .prev');
  if (nextBtn) nextBtn.addEventListener('click', () => { next(); reset(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { prev(); reset(); });
}
