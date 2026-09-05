(() => {
'use strict';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
// mobile only in portrait — turned sideways, a phone has enough width for
// the desktop split layout and not enough height for the portrait design.
// tracked as two separate MediaQueryLists rather than one compound query:
// some engines are unreliable firing 'change' on a rotation for a single
// multi-feature query, but each simple query updates live without fail.
const narrowW = matchMedia('(max-width: 860px)');
const portraitO = matchMedia('(orientation: portrait)');
const isMobile = () => narrowW.matches && portraitO.matches;

const TILT = 1.0;
const MOBILE_TILT = 1.45;
const MARK_EASE = 0.1;
const SPREAD = 0.99;
const MARK_HERO_PX = 32;
const MARK_DOCK_PX = 17;
const DOCK_DURATION = 0.78;
const READING_ZONE = 0.42;

const projects = [
  { name:'Koru', kind:'Identity', year:'', art:'a11', ink:'#4a8f6b', ratio:1.664,
    images:['koru.png'],
    blurb:'Brand identity and app design for Koru.',
    project:'Identity and app design.', deliverables:'Logo, mark, mini design system.', skills:'Branding, UI design.',
    tools:['Illustrator','Figma'] },
  { name:'Tr\u00fc Spray Systems', kind:'Identity', year:'20', art:'a2', ink:'#2a72a4', ratio:1.908,
    images:['truspray.webp'],
    blurb:'A brand system, not just a mark.',
    project:'Full brand system for a supplier.', deliverables:'Wordmark, shield, lockups, Pantones, type spec.', skills:'Identity design.',
    tools:['Illustrator','Photoshop'] },
  { name:'TapTec', kind:'Identity', year:'22', art:'a8', ink:'#e6508f', ratio:1.664,
    images:['taptec.webp'],
    blurb:'A logo system, proven on real packaging.',
    project:'Tech-company logo and brand system.', deliverables:'Lockup, icon, wordmark, packaging application.', skills:'Identity design, logo systems.',
    tools:['Illustrator','Photoshop'] },
  { name:'MikFlix', kind:'Site', year:'19', art:'a3', ink:'#c0392b', ratio:1.2,
    images:['mikflix-wordmark.png','mikflix-hero.webp','mikflix-overview.webp','mikflix-majorlazer.webp','mikflix-cyberpunk.webp'],
    blurb:'Designed, then built. Live seven years.',
    project:'Director\u2019s portfolio site.', deliverables:'Custom WordPress theme, thumbnail system, client guide.', skills:'Web design, front-end build.',
    tools:['Photoshop','Illustrator','WordPress'] },
  { name:'Good Hands', kind:'Identity', year:'23', art:'a4', ink:'#d15a3f', ratio:1.664,
    images:['goodhands.webp'],
    blurb:'A hand-lettered identity.',
    project:'Hand-lettered brand identity.', deliverables:'Mark, letterpress/tote/signage proofs.', skills:'Lettering, identity design.',
    tools:['Procreate','Illustrator'] },
  { name:'Discrete', kind:'Artwork', year:'23', art:'a7', ink:'#2f9698', ratio:1.0,
    images:['discrete.webp'],
    blurb:'A 3D portrait against display type.',
    project:'3D portrait sleeve artwork.', deliverables:'Final sleeve art, display type.', skills:'3D rendering, typography.',
    tools:['Cinema 4D','Photoshop','Illustrator'] },
  { name:'Kronan', kind:'Artwork', year:'21', art:'a5', ink:'#a86a4e', ratio:1.0,
    images:['kronan.webp'],
    blurb:'Three covers, one series.',
    project:'Three-cover EP series.', deliverables:'Cover artwork \u00d7 3.', skills:'Illustration, series design.',
    tools:['Illustrator','Photoshop','Cinema 4D'] },
  { name:'Chris Emery', kind:'Album', year:'20', art:'a6', ink:'#6e8a9c', ratio:1.0,
    images:['emery.webp'],
    blurb:'A composite, taken to press.',
    project:'Album cover composite.', deliverables:'Cover art, press-ready digipack.', skills:'Compositing, print prep.',
    tools:['Photoshop','InDesign','Cinema 4D','After Effects'] },
  { name:'Dewlora', kind:'Product', year:'26', art:'a1', ink:'#4f5b78', ratio:1.501,
    images:['dewlora.webp'],
    blurb:'A gas and CO detector, brief to production.',
    project:'Gas and CO detector enclosure.', deliverables:'Shell, faceplate, die line, renders.', skills:'Product design.',
    tools:['Fusion 360','Illustrator','Photoshop'] },
  { name:'Min Reid', kind:'Editorial', year:'19', art:'a9', ink:'#54658a', ratio:1.414,
    images:['minreid.webp','minreid-cover.png','minreid-mood.png','minreid-budget.png'],
    blurb:'Twenty pages, one grid, one duotone.',
    project:'Feature film pitch pack.', deliverables:'20-page pitch document.', skills:'Editorial design, art direction.',
    tools:['InDesign','Photoshop'] },
  { name:'HITTIT', kind:'Motion', year:'22', art:'a10', ink:'#3fb098', ratio:1.777,
    images:['hittit.webp'],
    blurb:'A broadcast open, dissolved into fluid.',
    project:'Broadcast ident.', deliverables:'30-second animated open.', skills:'Motion design, simulation.',
    tools:['Cinema 4D','After Effects'] }
];

const $ = sel => document.querySelector(sel);
const pad = i => String(i + 1).padStart(2, '0');
const metaDesk = (i, p) => `${pad(i)} · ${p.kind}${p.year ? ' · ' + p.year : ''}`;
const metaMob  = (i, p) => `${pad(i)} · ${p.kind}${p.year ? ' · 20' + p.year : ''}`;
const gallery = p => `<span class="gallery${p.images.length > 1 ? ' multi' : ''}">${
  p.images.map(src => `<span class="shot"><img src="/assets/img/${src}" alt="" loading="lazy"></span>`).join('')
}</span>`;
const tools = p => `<span class="tools">${p.tools.map(t => `<span class="tool">${t}</span>`).join('')}</span>`;
const facts = p => `<span class="facts">
  <span class="fact"><span class="fact-k">Project</span><span class="fact-v">${p.project}</span></span>
  <span class="fact"><span class="fact-k">Deliverables</span><span class="fact-v">${p.deliverables}</span></span>
  <span class="fact"><span class="fact-k">Skills</span><span class="fact-v">${p.skills}</span></span>
</span>`;
const clamp01 = v => v < 0 ? 0 : v > 1 ? 1 : v;
const clamp11 = v => v < -1 ? -1 : v > 1 ? 1 : v;
const smooth = t => t * t * (3 - 2 * t);
const smoothBetween = (a, b, t) => smooth(clamp01((t - a) / (b - a)));
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (a, b) => a + Math.random() * (b - a);
const hex = h => ({ r:parseInt(h.slice(1,3),16), g:parseInt(h.slice(3,5),16), b:parseInt(h.slice(5,7),16) });

/* --- accent saturation floor ---------------------------------------------
   some inks (greys, muted blues) sit under 30% saturation, which reads as
   muddy for text/borders on the dark base — this raises a floor without
   touching anything already saturated enough to read fine. */
const hexToHsl = h => {
  const { r, g, b } = hex(h);
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let hh = 0, s = 0;
  const d = max - min;
  if (d) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn: hh = (gn - bn) / d + (gn < bn ? 6 : 0); break;
      case gn: hh = (bn - rn) / d + 2; break;
      default: hh = (rn - gn) / d + 4;
    }
    hh /= 6;
  }
  return { h: hh, s, l };
};
const hslToHex = (h, s, l) => {
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const toHex = v => Math.round(clamp01(v) * 255).toString(16).padStart(2, '0');
  return `#${toHex(hue2rgb(p, q, h + 1 / 3))}${toHex(hue2rgb(p, q, h))}${toHex(hue2rgb(p, q, h - 1 / 3))}`;
};
const satFloor = (h, min) => {
  const { h: hh, s, l } = hexToHsl(h);
  return s >= min ? h : hslToHex(hh, min, l);
};
projects.forEach(p => { p.ink = satFloor(p.ink, 0.5); });

/* --- markup ------------------------------------------------------------- */
$('#list').innerHTML = projects.map((p, i) => `
  <button class="row" type="button" data-i="${i}" style="--pa:${p.ink}">
    <span class="row-top">
      <span class="row-name">${p.name}</span>
      <span class="row-blurb">${p.blurb}</span>
      <span class="row-meta">${metaDesk(i, p)}</span>
    </span>
    <span class="detail"><span class="detail-in">
      ${facts(p)}
      ${tools(p)}
    </span></span>
  </button>`).join('');

$('#prev').innerHTML = projects.map((p, i) => `
  <div class="frame${i === 0 ? ' on' : ''}" data-i="${i}">${
    p.images.length > 1
      ? `<div class="carousel">
           <div class="ctrack">${p.images.map((src, n) => `<div class="cslide-wrap${n === 0 ? ' on' : ''}"><img class="cslide" src="/assets/img/${src}" alt="" data-n="${n}"></div>`).join('')}</div>
           <button class="cnav prev" type="button" aria-label="Previous image">&lsaquo;</button>
           <button class="cnav next" type="button" aria-label="Next image">&rsaquo;</button>
           <div class="cdots">${p.images.map((_, n) => `<span class="cdot${n === 0 ? ' on' : ''}" data-n="${n}"></span>`).join('')}</div>
         </div>`
      : `<div class="art ${p.art}" data-src="/assets/img/${p.images[0]}"></div>`
  }</div>`).join('');

$('#bands').innerHTML = projects.map((p, i) => `
  <button class="band" type="button" data-i="${i}" style="--pa:${p.ink}">
    <span class="band-top">
      <span class="txt"><h3>${p.name}</h3><span class="meta">${metaMob(i, p)}</span></span>
    </span>
    <span class="detail"><span class="detail-in">
      ${gallery(p)}
      ${facts(p)}
      ${tools(p)}
    </span></span>
  </button>`).join('');

const root    = document.documentElement;
const split   = $('#work');
const listEl  = $('#list');
const prev    = $('#prev');
const bg      = $('#bg');
const lamp    = $('#lamp');
const rows    = [...listEl.querySelectorAll('.row')];
const frames  = [...prev.querySelectorAll('.frame')];
const bands   = [...document.querySelectorAll('.band')];
const indexMarks = [...document.querySelectorAll('#stage-index .livemark')];
const specMarks  = [...document.querySelectorAll('#stage-spec .livemark')];

let mobile = isMobile();
let openIndex = -1;
let previewIndex = 0;
let light = { x:innerWidth / 2, y:innerHeight * 0.45 };
let accent = hex('#d4472f');
let pulse = 0;
let mv = 0; // cursor-speed signal driving the livemark glow's luminance — see tick()
let lastLx = light.x, lastLy = light.y;
let gyro = null;
let stale = true;

/* --- header dock --------------------------------------------------------

   Below the dead zone the hero just scrolls. Cross the threshold and the
   whole thing plays as one tween, so it can never rest half finished. */

const dock = { p:0, wght:600, slnt:0, casl:0, ls:-0.03 };
let isDocked = false;

function setDocked(next) {
  if (isDocked === next) return;
  isDocked = next;
  gsap.to(dock, {
    p: next ? 1 : 0,
    wght: rand(430, 720),
    slnt: rand(-9, 0),
    casl: rand(0, 0.85),
    ls:   rand(-0.045, -0.005),
    duration: DOCK_DURATION,
    ease: 'power3.inOut',
    overwrite: true
  });
}

// same randomised-wonkiness idea as setDocked/dock above, but on its own
// trigger for the title specifically (see the titleGap check in applyDock)
// rather than dock.p, so it plays out earlier — before the subtitle (and
// dock.p, and the livemark's bpjr->br contraction) are anywhere near firing
const wonkyFx = { wght:600, slnt:0, casl:0, ls:-0.03 };
let isWonky = false;

function setWonky(next) {
  if (isWonky === next) return;
  isWonky = next;
  gsap.to(wonkyFx, {
    wght: next ? rand(430, 720) : 600,
    slnt: next ? rand(-9, 0) : 0,
    casl: next ? rand(0, 0.85) : 0,
    ls:   next ? rand(-0.045, -0.005) : -0.03,
    duration: DOCK_DURATION,
    ease: 'power3.inOut',
    overwrite: true
  });
}

// true once the user has actually scrolled at all — gates the titleGap-based
// setWonky call below so it can't immediately revert the one-time load-in
// wonky (see the setTimeout near applyMode()) back to the base font before
// the user has done anything; titleGap is always "far" at scrollY 0, so
// without this gate that revert would fire on literally the next frame
let hasScrolled = false;

// docks a full subtitle-height before it would actually meet the header, so
// the fade (below) has room to finish before the two ever visually overlap
function deadZone() {
  const sub    = mobile ? $('#subSpec') : $('#sub');
  const header = mobile ? $('#hdSpec')  : $('#hd');
  const subRect = sub.getBoundingClientRect();
  return Math.max(1, subRect.top + scrollY - header.offsetHeight - subRect.height);
}

// pure write phase — every rect this needs (mobileDock's from/to/heroPx, or
// desktop's titleGap) is read up front in tick() and passed in, rather than
// read here interleaved with the writes below. Reading and writing DOM
// properties alternately forces a synchronous layout recalc on each read
// that follows an uncommitted write; batching every read before every
// write (across the whole frame, not just within one function) means the
// browser only ever has to do that once per frame, not several times.
// mobileDock/titleGap are null on frames where tick() decided nothing that
// affects them could have changed (see dockActive there) — in which case
// the writes that depend on them are just skipped, not redone with stale data.
function applyDock(header, mobileDock, titleGap) {
  const p = dock.p;
  header.style.setProperty('--hp', p.toFixed(3));

  root.style.setProperty('--wght', dock.wght.toFixed(0));
  root.style.setProperty('--slnt', dock.slnt.toFixed(2));
  root.style.setProperty('--casl', dock.casl.toFixed(3));
  root.style.setProperty('--ls', dock.ls.toFixed(4) + 'em');
  // eased separately from the title dock, and finishes well before p
  // reaches 1 — the whole point of the earlier trigger above is wasted
  // if the fade still rides the tween all the way to the end
  root.style.setProperty('--subOp', (1 - smoothBetween(0, 0.6, p)).toFixed(3));

  if (mobile) {
    // mobile's header mark only ever exists as this flying clone of #phSpec —
    // there's no separate persistent small mark the way desktop's #hdMark is,
    // so this one still relies on the from/to rect-lerp + scale technique
    if (mobileDock) {
      const dockedPx = 22;
      $('#fxSpec').style.transform =
        `translate(${lerp(mobileDock.from.left, mobileDock.to.left, p)}px,${lerp(mobileDock.from.top, mobileDock.to.top, p)}px) `
        + `scale(${lerp(1, dockedPx / mobileDock.heroPx, p)})`;
    }
  } else {
    // desktop's mark shrinks via a real font-size change (crisp re-render)
    // rather than transform:scale (which resamples an already-rasterised
    // glyph) — the hero title itself no longer flies into the header at
    // all; #phTitle lost its .ph class and is just a normal, static,
    // always-visible element now, scrolling away like anything else
    $('#hdMark').style.fontSize = `${lerp(MARK_HERO_PX, MARK_DOCK_PX, p)}px`;

    // the title fades on its own schedule, not dock.p/--hp — it sits above
    // the subtitle so it would otherwise reach the sticky header earlier
    // than --subOp's fade (tied to the subtitle's position) accounts for,
    // and get visibly clipped under the header's opaque background rather
    // than fading away cleanly first. A binary on/off toggle (CSS transition
    // handles the smoothing — see .hero h1) rather than tracking distance
    // continuously, tied to how close its own bottom edge actually is to
    // the header (in px) so the cutoff has a real margin to spare before
    // that could ever happen — not a scroll-distance guess that could be
    // wrong at another viewport size.
    if (titleGap !== null) {
      root.style.setProperty('--titleOp', titleGap < 120 ? '0' : '1');
      // wobbles wonky just before the fade above actually triggers (260 vs
      // the fade's own 120 cutoff) — a lead-in, not simultaneous — and only
      // once the user has actually scrolled (see hasScrolled), so this can't
      // stomp on the one-time load-in wonky before the user's done anything
      if (hasScrolled) setWonky(titleGap < 260);
    }
    root.style.setProperty('--twght', wonkyFx.wght.toFixed(0));
    root.style.setProperty('--tslnt', wonkyFx.slnt.toFixed(2));
    root.style.setProperty('--tcasl', wonkyFx.casl.toFixed(3));
    root.style.setProperty('--tls', wonkyFx.ls.toFixed(4) + 'em');
  }
}

/* --- index -------------------------------------------------------------- */
function showPreview(i) {
  previewIndex = i;
  frames.forEach(f => f.classList.toggle('on', +f.dataset.i === i));
  if (openIndex < 0) layout();
}

function fadeByDistance() {
  rows.forEach(r => {
    const d = openIndex < 0 ? 0 : Math.abs(+r.dataset.i - openIndex);
    r.style.setProperty('--fade', openIndex < 0 ? 1 : Math.max(0, 1 - d * 0.26).toFixed(3));
  });
}

function openProject(i) {
  openIndex = i;
  showPreview(i);
  split.classList.add('open');
  rows.forEach(r => r.classList.toggle('live', +r.dataset.i === i));
  fadeByDistance();
  layout();
}

function closeProject() {
  openIndex = -1;
  split.classList.remove('open');
  rows.forEach(r => r.classList.remove('live'));
  prev.style.transform = '';
  fadeByDistance();
  layout();
}

rows.forEach(row => {
  const i = +row.dataset.i;
  row.addEventListener('pointerenter', () => { if (openIndex < 0) showPreview(i); });
  row.addEventListener('click', () => openIndex === i ? closeProject() : openProject(i));
});
$('#back').addEventListener('click', closeProject);
addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (!lightbox.hidden) return closeLightbox();
  if (contactFx.classList.contains('on')) return closeContactFx();
  if (openIndex >= 0) closeProject();
});

let openBandIndex = -1;

// the detail is still mid-transition here, so the resting height is measured
// rather than read, and a band collapsing above us shifts the target up
function centreBand(band, closing) {
  const detailH = band.querySelector('.detail-in').scrollHeight + 12;
  const r = band.getBoundingClientRect();
  let top = r.top + scrollY;
  if (closing && closing.getBoundingClientRect().top < r.top) {
    top -= closing.querySelector('.detail-in').scrollHeight + 12;
  }
  scrollTo({ top: Math.max(0, top + (r.height + detailH) / 2 - innerHeight * READING_ZONE),
             behavior: reduce ? 'auto' : 'smooth' });
}

bands.forEach(band => {
  const i = +band.dataset.i;
  band.addEventListener('click', () => {
    const wasOpen = openBandIndex === i;
    const closing = openBandIndex >= 0 ? bands[openBandIndex] : null;
    if (closing) closing.classList.remove('open');
    openBandIndex = wasOpen ? -1 : i;
    if (!wasOpen) {
      band.classList.add('open');
      centreBand(band, closing);
    }
    stale = true;
  });
});

/* --- lightbox ------------------------------------------------------------
   the preview and band galleries both crop (cover/fixed-ratio) so the grid
   stays tidy — this is the escape hatch to see an image uncropped, full res. */
const lightbox = $('#lightbox');
const lbImg    = $('#lbImg');
let lbCloseTimer = null;

function openLightbox(src) {
  if (!src) return;
  clearTimeout(lbCloseTimer);
  lbImg.src = src;
  lightbox.hidden = false;
  requestAnimationFrame(() => lightbox.classList.add('on'));
}
function closeLightbox() {
  lightbox.classList.remove('on');
  lbCloseTimer = setTimeout(() => { lightbox.hidden = true; lbImg.src = ''; }, 320);
}
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
$('#lbClose').addEventListener('click', closeLightbox);

// bound directly to each image (rather than one delegated listener) so
// stopPropagation reliably runs before a click can bubble up into a band's
// own open/close toggle — a mobile shot's <img> sits inside a clickable band
document.querySelectorAll('.band .shot img').forEach(img => {
  img.addEventListener('click', e => { e.stopPropagation(); openLightbox(img.currentSrc || img.src); });
});

/* --- desktop carousel -----------------------------------------------------
   multi-image projects: a peeking filmstrip (current slide fills the frame,
   next slide's edge shows at the right) with nav/dots, instead of the old
   wrapped grid — the lightbox above is what shows each image uncropped.
   Slide width and the track's translateX are computed in px here rather
   than as a CSS percentage — see the .carousel comment in main.css for why.
   Auto-advances slowly on a loop whenever this frame is the visible one,
   the tab is in the foreground, and the mouse isn't over it; refreshers[]
   lets layout() re-run every open carousel's show() on resize, since the
   px measurements above go stale when the frame's width changes. */
const GAP = 12; // px between slides — must match .ctrack's gap:var(--s3) in main.css
const refreshers = [];

frames.forEach(frame => {
  const art = frame.querySelector('.art');
  if (art) art.addEventListener('click', () => openLightbox(art.dataset.src));

  const track = frame.querySelector('.ctrack');
  const slides = [...frame.querySelectorAll('.cslide')];
  if (!slides.length) return;
  const wraps = [...frame.querySelectorAll('.cslide-wrap')];
  const dots  = [...frame.querySelectorAll('.cdot')];
  let cur = 0;

  // each slide keeps its own natural aspect ratio (height:100% + width:auto
  // in main.css) rather than a forced crop, so slide widths vary by image
  // and the shift to bring slide `cur` to the frame's left edge has to sum
  // every preceding slide's actual rendered width, not a fixed slideW
  const show = n => {
    cur = (n + slides.length) % slides.length;
    let offset = 0;
    for (let k = 0; k < cur; k++) offset += wraps[k].getBoundingClientRect().width + GAP;
    track.style.transform = `translateX(-${Math.round(offset)}px)`;
    wraps.forEach((w, k) => w.classList.toggle('on', k === cur));
    dots.forEach((d, k) => d.classList.toggle('on', k === cur));
  };
  show(0);
  refreshers.push(() => show(cur));
  // a slide's rendered width is 0 until its image data arrives, so an
  // offset summed before that finishes needs redoing once it lands
  slides.forEach(s => s.addEventListener('load', () => show(cur)));

  frame.querySelector('.cnav.prev').addEventListener('click', e => { e.stopPropagation(); show(cur - 1); });
  frame.querySelector('.cnav.next').addEventListener('click', e => { e.stopPropagation(); show(cur + 1); });
  dots.forEach((d, k) => d.addEventListener('click', e => { e.stopPropagation(); show(k); }));
  // clicking the current (fully visible) slide opens the lightbox; clicking
  // the peeking next slide advances to it instead — it's barely visible, so
  // "look closer" reads as "bring it forward", not "zoom this sliver"
  slides.forEach(s => {
    s.addEventListener('click', () => {
      const n = +s.dataset.n;
      if (n === cur) openLightbox(s.currentSrc || s.src);
      else show(n);
    });
  });

  setInterval(() => {
    if (document.hidden || frame.matches(':hover') || !frame.classList.contains('on')) return;
    show(cur + 1);
  }, 4500);
});

/* --- contact fx -----------------------------------------------------------
   clicking "Contact" in either nav dims the page and flies a real mailto
   link (#emailFx) to screen-centre, where it now stays until it's clicked
   (opens mail) or the dimmed backdrop (#contactFx) is clicked to dismiss
   without emailing. The flight itself is plain CSS transitions rather than
   a measured tween like the header dock: left/top interpolate cleanly from
   a px start to a 50% end because the browser animates the computed pixel
   value either way, so no rect-lerp is needed — but both ends have to be
   set inline from JS (not via a class), since an inline style always wins
   over a class selector once it's been set. */
const contactFx = $('#contactFx');
const emailFx   = $('#emailFx');
emailFx.tabIndex = -1; // a real <a>, so pointer-events:none alone won't keep
                       // it out of keyboard tab order while hidden

function openContactFx(trigger) {
  const r = trigger.getBoundingClientRect();
  contactFx.classList.add('on');

  emailFx.classList.remove('sweep');
  emailFx.style.transition = 'none';
  emailFx.style.pointerEvents = 'none';
  emailFx.style.fontSize = getComputedStyle(trigger).fontSize;
  emailFx.style.left = r.left + 'px';
  emailFx.style.top = r.top + 'px';
  emailFx.style.transform = 'translate(0,0) scale(1)';
  emailFx.style.opacity = '1';
  void emailFx.offsetWidth; // flush the reset before re-enabling transitions
  emailFx.style.transition = '';

  requestAnimationFrame(() => {
    emailFx.style.left = '50%';
    emailFx.style.top = '50%';
    emailFx.style.transform = 'translate(-50%,-50%) scale(2.6)';
    emailFx.style.pointerEvents = 'auto';
    emailFx.tabIndex = 0;
    setTimeout(() => emailFx.classList.add('sweep'), 700);
  });
}
function closeContactFx() {
  contactFx.classList.remove('on');
  emailFx.classList.remove('sweep');
  emailFx.style.pointerEvents = 'none';
  emailFx.style.opacity = '0';
  emailFx.tabIndex = -1;
}

document.querySelectorAll('a[href="#contact"], a[href="#contact-m"]').forEach(a => {
  a.addEventListener('click', e => { e.preventDefault(); openContactFx(a); });
});
contactFx.addEventListener('click', closeContactFx);
emailFx.addEventListener('click', closeContactFx); // mailto: still navigates via the default action

/* --- layout ------------------------------------------------------------- */
function layout() {
  // the reading zone sits partway down, so the sheet needs runway left below it
  $('#specTail').style.height = Math.round(innerHeight * (1 - READING_ZONE)) + 'px';
  if (!mobile) {
    // height follows the preview's own width at the showing project's ratio,
    // so the box matches the art/carousel exactly — carousels use the same
    // single ratio as a single-image project rather than their own natural
    // size, so cropping (cover) is consistent and the box never has to
    // re-measure per slide
    const cap = openIndex >= 0 ? innerHeight * 0.78 : innerHeight - 110;
    const w = prev.getBoundingClientRect().width || split.clientWidth * (openIndex >= 0 ? 0.66 : 0.44);
    const idx = openIndex >= 0 ? openIndex : previewIndex;
    const h = w / projects[idx].ratio;
    prev.style.height = Math.round(Math.min(h, cap)) + 'px';
    if (openIndex >= 0) centerPreview();
    // frame width just changed along with prev's own box — every open
    // carousel's slide width/translateX (both in px, not %) needs redoing
    refreshers.forEach(fn => fn());
  }
  stale = true;
}

// keeps the open preview centred in the viewport's vertical middle, rather
// than chasing whichever row was just clicked — a fixed target regardless
// of row index means switching between open rows no longer visibly shifts
// the image down to meet the row (recomputed on each open/switch/resize,
// same as the rest of layout(), not tracked continuously during scroll)
function centerPreview() {
  const splitRect = split.getBoundingClientRect();
  const prevH     = prev.getBoundingClientRect().height;
  const viewportMidLocal = innerHeight / 2 - splitRect.top;
  const maxTop    = Math.max(0, splitRect.height - prevH);
  const top       = Math.max(0, Math.min(viewportMidLocal - prevH / 2, maxTop));
  prev.style.transform = `translateY(${Math.round(top)}px)`;
}

function applyMode() {
  mobile = isMobile();
  $('#stage-index').hidden = mobile;
  $('#stage-spec').hidden  = !mobile;
  $('#fxSpec').style.display = mobile ? '' : 'none';
  if (openIndex >= 0) closeProject();
  layout();
}
narrowW.addEventListener('change', applyMode);
portraitO.addEventListener('change', applyMode);
applyMode();

// title+bio entrance: starts at opacity 0 in main.css so the very first
// paint is the "before" state — double rAF guarantees that paint has
// actually happened before .loaded triggers the transition, or a browser
// can coalesce "add the class immediately after load" into the very same
// paint and skip the transition entirely. The wonky ease-in is a separate,
// one-time timer rather than reusing the titleGap scroll trigger, since at
// scrollY 0 titleGap always reads "far" — hasScrolled (set in the scroll
// listener below) stops that from immediately reverting this back to the
// base font before the user has done anything.
requestAnimationFrame(() => requestAnimationFrame(() => $('#about').classList.add('loaded')));
if (!reduce) setTimeout(() => { if (!hasScrolled) setWonky(true); }, 900);

/* --- accent ------------------------------------------------------------- */
function driftAccent(target, rate) {
  const t = hex(target);
  const before = accent.r + accent.g + accent.b;
  accent.r += (t.r - accent.r) * rate;
  accent.g += (t.g - accent.g) * rate;
  accent.b += (t.b - accent.b) * rate;
  const delta = Math.abs(accent.r + accent.g + accent.b - before);
  if (delta > 2) pulse = Math.min(1, pulse + delta / 90);
  root.style.setProperty('--accent', `rgb(${accent.r | 0},${accent.g | 0},${accent.b | 0})`);
}

/* --- gyroscope ---------------------------------------------------------- */
if (!finePointer && window.DeviceOrientationEvent) {
  const listen = () => {
    gyro = { gamma:0, beta:0 };
    addEventListener('deviceorientation', e => {
      gyro.gamma = (e.gamma || 0) / 38;
      gyro.beta  = ((e.beta || 0) - 40) / 38;
    });
  };
  // iOS gates the sensor behind a gesture; everywhere else it is free
  if (typeof DeviceOrientationEvent.requestPermission === 'function') {
    addEventListener('click', () => {
      DeviceOrientationEvent.requestPermission().then(r => { if (r === 'granted') listen(); });
    }, { once:true });
  } else listen();
}

/* --- loop --------------------------------------------------------------- */
if (finePointer) {
  addEventListener('pointermove', e => { light.x = e.clientX; light.y = e.clientY; }, { passive:true });
}
addEventListener('scroll', () => {
  hasScrolled = true;
  stale = true;
  const threshold = deadZone();
  if (!isDocked && scrollY > threshold) setDocked(true);
  else if (isDocked && scrollY < threshold * 0.72) setDocked(false);
}, { passive:true });
// belt-and-braces alongside the matchMedia listeners above — some engines
// are late or inconsistent firing 'change' on an orientation flip, but a
// resize always fires, and applyMode() re-checks the mode before laying out
addEventListener('resize', applyMode, { passive:true });
layout();

if (reduce) {
  // one-off call, not per-frame, so reading rects directly here (rather
  // than via tick()'s batched read phase) costs nothing worth avoiding
  const header = mobile ? $('#hdSpec') : $('#hd');
  const headerH = header.offsetHeight;
  let mobileDock = null, titleGap = null;
  if (mobile) {
    const ph = $('#phSpec'), slot = $('#slotSpec');
    mobileDock = { from: ph.getBoundingClientRect(), to: slot.getBoundingClientRect(),
                   heroPx: parseFloat(getComputedStyle(ph).fontSize) };
  } else {
    titleGap = $('#phTitle').getBoundingClientRect().bottom - headerH;
  }
  applyDock(header, mobileDock, titleGap);
  return;
}

// rects only move on scroll and resize, so they are cached rather than
// re-read for every element on every frame
const damped = new Map([...indexMarks, ...specMarks].map(m => [m, { x:0, y:0 }]));

let lit = [];
function remeasure() {
  const targets = mobile ? bands : [...rows, prev];
  lit = targets.map(el => {
    const r = el.getBoundingClientRect();
    // top/height are only for the mobile loupe below, which used to take
    // its own separate getBoundingClientRect() per item every single frame
    // — redundant with this same read, and another interleaved read/write
    // pair on top of it. Caching them here means the loupe just reads this
    // array (refreshed whenever stale, i.e. on scroll/resize, exactly when
    // a band's position could actually have changed) instead.
    return { el, cx:r.left + r.width / 2, cy:r.top + r.height / 2, top:r.top, height:r.height,
             wide:el === prev, i:el.dataset ? +el.dataset.i : -1 };
  });
  stale = false;
}

function tick() {
  // remeasure() (rows/prev/bands rects) resets `stale` to false, so it has
  // to be captured before that happens — it's also this frame's signal for
  // whether the header/title/mark rects below might have moved too
  const wasStale = stale;
  if (stale) remeasure();
  const vw = innerWidth, vh = innerHeight;
  const touchLike = mobile || !finePointer;

  if (finePointer) {
    const dist = Math.hypot(light.x - lastLx, light.y - lastLy);
    lastLx = light.x; lastLy = light.y;
    mv = Math.min(1, mv * 0.9 + dist / 60);
  }
  if (touchLike) { light.x = vw / 2; light.y = vh * READING_ZONE; }

  // ---- read phase ---------------------------------------------------
  // every getBoundingClientRect/getComputedStyle for the whole frame,
  // gathered before any write below can invalidate layout and force a
  // second (or third...) synchronous recalc later in this same frame.
  const header = mobile ? $('#hdSpec') : $('#hd');
  // dock-related rects (mobile's fx clone, or desktop's title-to-header
  // gap) only change when scroll/resize happened or a dock/wonky tween is
  // actively running — reusing last frame's applied values otherwise skips
  // a getBoundingClientRect + getComputedStyle pair most frames spend
  // sitting idle between scrolls
  const dockActive = wasStale || gsap.isTweening(dock) || gsap.isTweening(wonkyFx);
  let mobileDock = null, titleGap = null;
  if (dockActive) {
    const headerH = header.offsetHeight;
    if (mobile) {
      const ph = $('#phSpec'), slot = $('#slotSpec');
      mobileDock = { from: ph.getBoundingClientRect(), to: slot.getBoundingClientRect(),
                     heroPx: parseFloat(getComputedStyle(ph).fontSize) };
    } else {
      titleGap = $('#phTitle').getBoundingClientRect().bottom - headerH;
    }
  }
  const marks = mobile ? specMarks : indexMarks;
  const markRects = marks.map(m => m.getBoundingClientRect());

  // ---- write phase ----------------------------------------------------
  if (finePointer) root.style.setProperty('--mv', mv.toFixed(3));
  applyDock(header, mobileDock, titleGap);

  const spread = Math.round(Math.min(vw, vh) * SPREAD);
  lamp.style.setProperty('--lx', light.x + 'px');
  lamp.style.setProperty('--ly', light.y + 'px');
  lamp.style.setProperty('--spread', spread + 'px');

  if (!mobile) {
    const radius = Math.max(320, Math.min(vw, vh) * SPREAD);
    for (const item of lit) {
      const d = Math.hypot((item.cx - light.x) * 0.6, item.cy - light.y);
      const reach = item.wide ? radius * 1.3 : radius;
      item.el.style.setProperty('--l', smooth(clamp01(1 - d / reach)).toFixed(3));
    }
    // hovering drifts much slower than an open (clicked) row — flicking the
    // mouse across the whole list quickly would otherwise strobe the tint
    // through every row's colour on the way past
    driftAccent(projects[openIndex >= 0 ? openIndex : previewIndex].ink,
                openIndex >= 0 ? 0.12 : 0.035);
  } else {
    // loupe: colour exists only around the reading zone, with no visible
    // boundary. top/height come from the lit cache (refreshed in
    // remeasure() whenever stale) rather than a fresh getBoundingClientRect
    // per band here — that used to be a second, redundant read on top of
    // the one remeasure() already just did.
    const zone = vh * READING_ZONE;
    const reach = Math.max(150, vh * 0.3);
    let brightest = null, brightestValue = 0;
    for (const item of lit) {
      const n = clamp01(1 - Math.abs((item.top + item.height / 2) - zone) / reach);
      const value = smoothBetween(0.30, 0.92, n);
      item.el.style.setProperty('--l', value.toFixed(3));
      if (value > brightestValue) { brightestValue = value; brightest = item; }
    }
    if (brightest && brightestValue > 0.2) driftAccent(projects[brightest.i].ink, 0.09);
  }

  marks.forEach((m, k) => {
    const r = markRects[k];
    let mx, my;
    if (touchLike && gyro) {
      mx = clamp11(gyro.gamma);
      my = clamp11(gyro.beta);
    } else if (touchLike) {
      my = clamp11(((r.top + r.height / 2) / vh - READING_ZONE) * 2.1);
      mx = Math.sin(scrollY / 210) * 0.62;
    } else {
      mx = clamp11((light.x - (r.left + r.width / 2)) / (vw * 0.5));
      my = clamp11((light.y - (r.top + r.height / 2)) / (vh * 0.5));
    }
    // raw gyro and per-frame scroll both arrive jittery, so the mark chases
    // them rather than snapping, which also gives it a little weight
    const s = damped.get(m);
    s.x += (mx - s.x) * MARK_EASE;
    s.y += (my - s.y) * MARK_EASE;
    m.style.setProperty('--mx', s.x.toFixed(3));
    m.style.setProperty('--my', s.y.toFixed(3));
    m.style.setProperty('--mp', (1 - Math.min(1, Math.hypot(s.x, s.y))).toFixed(3));
    m.style.setProperty('--tilt', (mobile ? MOBILE_TILT : TILT).toFixed(2));
  });

  pulse *= 0.93;
  root.style.setProperty('--pulse', pulse.toFixed(3));
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

})();
