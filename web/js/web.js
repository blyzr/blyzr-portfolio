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
// the time). 1280 clears every site's own mobile breakpoint (820-940px)
// with real margin to spare; h is a floor that fitScale() grows from.
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

/* The scale is measured from the frame wrap's real rendered box rather than
   computed in CSS. This only works because .expand-scale is absolutely
   positioned (see web.css): as a flex item it silently flex-shrank away
   from --vw, so both the iframe's internal viewport and this calculation's
   assumptions were wrong before anything here even ran.
   Called right after overlay.hidden=false (openSite) or on a toggle click
   (panel already open, transform settled) — in both cases .expand-panel
   carries no transform of its own at the moment this runs (the FLIP
   transform is applied *after* this in openSite), so the measured rect is
   true layout size, not a visually shrunk/enlarged one. */
// The simulated window grows as tall as the frame needs so nothing is left
// letterboxed, with a backstop: these sites all use 100vh sections (MikFlix
// leans on them hard), and past a point a very tall window stops resembling
// anything a real browser shows. 1.5x the width is deliberately generous —
// it clears every frame shape this panel actually produces (a desktop frame
// wants ~0.8x, a phone-shaped one ~1.4x), so in practice the height fills
// exactly and this only catches pathological geometry.
const MAX_VH_RATIO = 1.5;

function fitScale(vp, animate) {
  const rect = frameWrap.getBoundingClientRect();
  if (!rect.width || !rect.height) return;

  let scale, vh;
  if (vp === MOBILE) {
    // a phone has a fixed shape — fit the whole device in and centre it,
    // rather than stretching it to whatever the frame happens to be
    scale = Math.min(rect.width / vp.w, rect.height / vp.h);
    vh = vp.h;
  } else {
    // desktop fills the frame's width exactly, then the simulated window
    // grows taller to take up the leftover height, so the frame fills on
    // both axes rather than sitting in a letterbox
    scale = rect.width / vp.w;
    vh = Math.min(vp.w * MAX_VH_RATIO, Math.max(vp.h, rect.height / scale));
  }
  panel.style.setProperty('--vh', Math.round(vh) + 'px');

  // the offsets are plain px in the *parent's* coordinate space, so they
  // centre the scaled box correctly — a percentage translate, or letting
  // flexbox do the centring, would position it using its pre-transform
  // size (--vw/--vh) and drop it well outside the visible frame
  const x = Math.max(0, (rect.width  - vp.w * scale) / 2);
  const y = Math.max(0, (rect.height - vh    * scale) / 2);

  if (!animate) scaleEl.style.transition = 'none';
  scaleEl.style.transform = `translate(${x}px,${y}px) scale(${scale})`;
  if (!animate) { void scaleEl.offsetWidth; scaleEl.style.transition = ''; }
}
function applyViewport(vp, animate) {
  currentVp = vp;
  panel.style.setProperty('--vw', vp.w + 'px');
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

function openSite(card, fromPopstate) {
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

  // a fake #slug entry so the back button reads as "leave this card" rather
  // than "leave /web entirely" — skipped when we're here *because* of a
  // popstate (browser back/forward already moved us, pushing again would
  // just add a duplicate entry on top of the one the user just landed on)
  if (!fromPopstate) history.pushState({ slug }, '', '#' + slug);
}

function closeSite(fromPopstate) {
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
  // closing via the X/backdrop/Escape should consume the fake #slug entry
  // openSite() pushed, so a *later* real back press leaves /web rather than
  // re-opening this same card. Popstate-driven closes skip this — the
  // browser already moved history for us, calling back() again would just
  // fire a second, unwanted navigation.
  if (!fromPopstate && history.state && history.state.slug === card?.dataset.slug) {
    history.back();
  }
}

cards.forEach(card => card.addEventListener('click', () => openSite(card)));
$('#expandClose').addEventListener('click', () => closeSite());
overlay.addEventListener('click', e => { if (e.target === overlay) closeSite(); });
addEventListener('keydown', e => { if (e.key === 'Escape' && !overlay.hidden) closeSite(); });

// browser back/forward through the fake #slug entries: back past one closes
// the panel (landing back on the plain #-less /web/ URL), forward re-opens it
addEventListener('popstate', e => {
  const slug = e.state && e.state.slug;
  if (slug) {
    const card = cards.find(c => c.dataset.slug === slug);
    if (card) openSite(card, true);
  } else if (!overlay.hidden) {
    closeSite(true);
  }
});

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
