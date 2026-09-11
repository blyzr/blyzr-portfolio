(() => {
'use strict';

const sites = [
  { slug:'mikflix', name:'MikFlix', kicker:'01 · WordPress site', sub:'Director’s portfolio site.',
    blurb:'Designed, then built. Live seven years. The homepage carousel and project thumbnails are the real, live interactions — this is the actual site, not a recording of it.',
    tags:['WordPress','PHP','MySQL','JS'], ink:'#c0392b', link:'https://mikhailmehra.com' },
  { slug:'syntra', name:'Syntra', kicker:'02 · SaaS landing page', sub:'Shopify growth subscription — pricing-led landing page.',
    blurb:'A predictable-subscription pitch for a Shopify CRO and design agency, built around plans, process, and proof.',
    tags:['HTML','CSS','JS'], ink:'#557143', link:'/web/sites/syntra/index.html' },
  { slug:'blossom', name:'Blossom Perfumery', kicker:'03 · Storefront homepage', sub:'Designer-inspired fragrance, direct-to-consumer.',
    blurb:'A boutique fragrance storefront built around real product photography, pricing, and a warm, editorial brand voice.',
    tags:['HTML','CSS','JS'], ink:'#c79a3d', link:'/web/sites/blossom/index.html' },
  { slug:'whiteelm', name:'White Elm', kicker:'04 · Storefront homepage', sub:'Convertible bag brand, women-led and versatile.',
    blurb:'A product-led homepage for a convertible bag brand, built around lifestyle photography and customer testimonials.',
    tags:['HTML','CSS','JS'], ink:'#5b371d', link:'/web/sites/whiteelm/index.html' },
];

const $ = sel => document.querySelector(sel);
const DESKTOP = { w:1440, h:900 };
const MOBILE  = { w:390,  h:844 };

/* --- grid markup ----------------------------------------------------------- */
const grid = $('#webGrid');
grid.innerHTML = sites.map(s => `
  <button class="site-card" type="button" data-slug="${s.slug}" style="--pa:${s.ink}">
    <span class="thumb-wrap">
      <span class="thumb-scale"><iframe data-src="/web/sites/${s.slug}/index.html" tabindex="-1" aria-hidden="true" loading="lazy"></iframe></span>
      <span class="thumb-fade" aria-hidden="true"></span>
    </span>
    <span class="card-meta">
      <h3>${s.name}</h3>
      <span class="card-sub">${s.sub}</span>
      <span class="card-tags tools">${s.tags.map(t => `<span class="tool">${t}</span>`).join('')}</span>
    </span>
  </button>`).join('');

const cards = [...grid.querySelectorAll('.site-card')];

/* thumbnails render at a real 1440x900 desktop viewport, scaled down to fit
   the card via a CSS container query (see .thumb-scale in web.css) — no JS
   sizing here, so there's nothing to go stale on resize/reflow. */

/* lazy-load: only point a thumbnail iframe at its real src once the card is
   actually near the viewport — four full page loads (one of them a whole
   WordPress mirror) up front isn't worth it for cards nobody scrolled to */
const io = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const iframe = entry.target.querySelector('.thumb-scale iframe');
    if (iframe.dataset.src) { iframe.src = iframe.dataset.src; delete iframe.dataset.src; }
    io.unobserve(entry.target);
  });
}, { rootMargin:'400px' });
cards.forEach(card => io.observe(card));

/* --- expand overlay ---------------------------------------------------------
   FLIP: the panel always lives at its final resting size/position (centred
   by the overlay's flex layout). Opening reads the clicked card's rect,
   maps the panel's natural rect back onto it with an instant transform, then
   clears that transform on the next frame so the browser tweens the whole
   translate+scale back to identity — the panel visibly grows out of the
   thumbnail it was clicked from. Closing runs the same math in reverse.
   The inner .expand-scale carries a *separate* scale (real device width ->
   however wide the frame column actually is) for the desktop/mobile toggle,
   independent of this open/close transform. */
const overlay   = $('#expandOverlay');
const panel     = $('#expandPanel');
const frameWrap = $('#expandFrameWrap');
const scaleEl   = $('#expandScale');
const iframe    = $('#expandFrame');
const vpToggle  = $('#viewportToggle');
let currentVp = DESKTOP;
let openCard = null;

/* the actual fit-to-frame scaling is a CSS container query on .expand-scale
   (see web.css) — this just tells CSS which real device size to target via
   --vw/--vh, so there's no JS measurement to go stale on resize/reflow. */
function applyViewport(vp, animate) {
  currentVp = vp;
  if (!animate) scaleEl.style.transition = 'none';
  frameWrap.style.setProperty('--vw', vp.w + 'px');
  frameWrap.style.setProperty('--vh', vp.h + 'px');
  if (!animate) { void scaleEl.offsetWidth; scaleEl.style.transition = ''; }
  vpToggle.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.vp === (vp === MOBILE ? 'mobile' : 'desktop')));
}
vpToggle.addEventListener('click', e => {
  const btn = e.target.closest('button[data-vp]');
  if (!btn) return;
  applyViewport(btn.dataset.vp === 'mobile' ? MOBILE : DESKTOP, true);
});

function flipFrom(rect) {
  const last = panel.getBoundingClientRect();
  const dx = rect.left - last.left, dy = rect.top - last.top;
  const sx = rect.width / last.width, sy = rect.height / last.height;
  return `translate(${dx}px,${dy}px) scale(${sx},${sy})`;
}

function openSite(card) {
  const slug = card.dataset.slug;
  const site = sites.find(s => s.slug === slug);
  if (!site) return;
  openCard = card;

  $('#edKicker').textContent = site.kicker;
  $('#edTitle').textContent = site.name;
  $('#edSub').textContent = site.sub;
  $('#edBlurb').textContent = site.blurb;
  $('#edTags').innerHTML = site.tags.map(t => `<span class="tool">${t}</span>`).join('');
  panel.style.setProperty('--pa', site.ink);
  const link = $('#edLink');
  if (site.link) { link.href = site.link; link.hidden = false; } else { link.hidden = true; }

  overlay.hidden = false;
  iframe.src = `/web/sites/${slug}/index.html`;
  applyViewport(DESKTOP, false);

  const startRect = card.querySelector('.thumb-wrap').getBoundingClientRect();
  panel.classList.remove('animating');
  panel.style.transform = flipFrom(startRect);
  void panel.offsetWidth; // flush the start transform before animating away from it
  requestAnimationFrame(() => {
    overlay.classList.add('on');
    panel.classList.add('animating');
    panel.style.transform = 'none';
  });
  document.body.style.overflow = 'hidden';
}

function closeSite() {
  if (overlay.hidden) return;
  const card = openCard;
  overlay.classList.remove('on');
  document.body.style.overflow = '';
  if (card) {
    const rect = card.querySelector('.thumb-wrap').getBoundingClientRect();
    panel.classList.add('animating');
    panel.style.transform = flipFrom(rect);
  }
  setTimeout(() => {
    overlay.hidden = true;
    panel.classList.remove('animating');
    panel.style.transform = '';
    iframe.src = 'about:blank';
    openCard = null;
  }, 560);
}

cards.forEach(card => card.addEventListener('click', () => openSite(card)));
$('#expandClose').addEventListener('click', closeSite);
overlay.addEventListener('click', e => { if (e.target === overlay) closeSite(); });
addEventListener('keydown', e => { if (e.key === 'Escape' && !overlay.hidden) closeSite(); });

})();
