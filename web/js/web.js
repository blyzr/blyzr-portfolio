(() => {
'use strict';

const sites = [
  { slug:'mikflix', name:'MikFlix', kicker:'01 · WordPress site', sub:'Director’s portfolio site.',
    blurb:'Designed, then built. Live seven years, running on a fully custom WordPress theme — the homepage carousel and project thumbnails are the real, live interactions.',
    tags:['WordPress','PHP','MySQL','JS'], ink:'#c0392b', link:'https://mikhailmehra.com' },
  { slug:'verdant', name:'Verdant', kicker:'02 · SaaS landing page', sub:'Shopify growth subscription — pricing-led landing page.',
    blurb:'A predictable-subscription pitch for a Shopify CRO and design agency, built around plans, process, and proof.',
    tags:['HTML','CSS','JS'], ink:'#557143' },
  { slug:'blossom', name:'Blossom Perfumery', kicker:'03 · Storefront homepage', sub:'Designer-inspired fragrance, direct-to-consumer.',
    blurb:'A boutique fragrance storefront built around real product photography, pricing, and a warm, editorial brand voice.',
    tags:['HTML','CSS','JS'], ink:'#c79a3d' },
  { slug:'whiteelm', name:'White Elm', kicker:'04 · Storefront homepage', sub:'Convertible bag brand, women-led and versatile.',
    blurb:'A product-led homepage for a convertible bag brand, built around lifestyle photography and customer testimonials.',
    tags:['HTML','CSS','JS'], ink:'#d9c2a0' },
];

const $ = sel => document.querySelector(sel);
// a plain, realistic 16:10 desktop size — no longer hand-calibrated
// against the panel's own geometry (that broke the instant the panel
// wasn't exactly the one width it was calibrated for, which is most of
// the time — confirmed by screenshots still showing a large empty gap).
// .expand-frame-col's aspect-ratio now reads --vw/--vh directly (see
// web.css), so the frame's own shape always matches whichever of these
// is active instead of the other way around. 1280 clears every site's
// own mobile breakpoint (820-940px) with real margin to spare.
const DESKTOP = { w:1280, h:800 };
const MOBILE  = { w:390,  h:844 };

/* --- grid markup ----------------------------------------------------------- */
const grid = $('#webGrid');
grid.innerHTML = sites.map(s => `
  <button class="site-card" type="button" data-slug="${s.slug}" style="--pa:${s.ink}">
    <span class="card-meta">
      <span class="ed-kicker">${s.kicker}</span>
      <h3>${s.name}</h3>
      <span class="card-sub">${s.sub}</span>
      <span class="card-blurb">${s.blurb}</span>
      <span class="card-tags tools">${s.tags.map(t => `<span class="tool">${t}</span>`).join('')}</span>
    </span>
  </button>`).join('');

const cards = [...grid.querySelectorAll('.site-card')];

/* --- expand overlay ---------------------------------------------------------
   FLIP: the panel always lives at its final resting size/position (centred
   by the overlay's flex layout). Opening reads the clicked card's rect,
   maps the panel's natural rect back onto it with an instant transform, then
   clears that transform on the next frame so the browser tweens the whole
   translate+scale back to identity — the panel visibly grows out of the
   card it was clicked from. Closing runs the same math in reverse.
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

/* the fit-to-frame scale is measured directly with getBoundingClientRect()
   rather than computed in CSS (container queries, aspect-ratio) — three
   different pure-CSS approaches here each broke in a different way once
   the frame column was actually sized by flex-grow in a real layout
   (row on desktop, column on mobile), so this just measures what the
   frame wrap's real rendered box is and sets the scale to match, which
   works the same regardless of how that box ended up that size. Called
   right after overlay.hidden=false (openSite) or on a toggle click
   (panel already open, transform already settled to none) — in both
   cases .expand-panel carries no transform of its own at the moment
   this runs (the FLIP transform is applied *after* this in openSite),
   so the measured rect reflects true layout size, not a visually
   shrunk/enlarged one. */
function fitScale(vp, animate) {
  const rect = frameWrap.getBoundingClientRect();
  const scale = (rect.width > 0 && rect.height > 0)
    ? Math.min(rect.width / vp.w, rect.height / vp.h)
    : 1;
  if (!animate) scaleEl.style.transition = 'none';
  scaleEl.style.transform = `scale(${scale})`;
  if (!animate) { void scaleEl.offsetWidth; scaleEl.style.transition = ''; }
}
function applyViewport(vp, animate) {
  currentVp = vp;
  panel.style.setProperty('--vw', vp.w + 'px');
  panel.style.setProperty('--vh', vp.h + 'px');
  fitScale(vp, animate);
  vpToggle.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.vp === (vp === MOBILE ? 'mobile' : 'desktop')));
}
vpToggle.addEventListener('click', e => {
  const btn = e.target.closest('button[data-vp]');
  if (!btn) return;
  applyViewport(btn.dataset.vp === 'mobile' ? MOBILE : DESKTOP, true);
});
// the frame wrap's real size can change independently of a viewport
// toggle (window resize, orientation flip) — re-measure whenever that
// might have happened while a panel is actually open
addEventListener('resize', () => { if (!overlay.hidden) fitScale(currentVp, false); }, { passive:true });

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
  // always the desktop simulation by default, on phones included — the
  // desktop toggle is a landscape-ish ratio, so at a real phone's ~390px
  // width it derives a comfortably short frame that just fits, no matter
  // how little vertical room is actually left after .expand-details.
  // Defaulting to MOBILE there instead (a tall, narrow ratio) meant its
  // aspect-ratio-derived height regularly exceeded that available room —
  // only .expand-frame-col can flex-shrink (.expand-details can't), and
  // shrinking a column flex item's main-axis size doesn't shrink its
  // stretched cross-axis size to match, so the box's real aspect ratio
  // broke away from what .expand-scale's fit-contain math assumed,
  // which could resolve to an effectively invisible sliver. The Mobile
  // toggle is still right there if someone wants the phone simulation.
  applyViewport(DESKTOP, false);

  const startRect = card.getBoundingClientRect();
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
    const rect = card.getBoundingClientRect();
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

/* --- header --------------------------------------------------------------
   matches home's docked-header look (main.css's .hd already reads
   var(--hp,0) for its background/blur/border) without home's continuous
   scroll-linked tick() loop — just flips --hp between 0 and 1 on a fixed
   threshold, with the CSS transition on .web-hd standing in for the
   per-frame easing home gets instead. */
const hd = $('.web-hd');
addEventListener('scroll', () => {
  hd.style.setProperty('--hp', scrollY > 40 ? 1 : 0);
}, { passive:true });

})();
