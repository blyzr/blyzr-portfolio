(() => {
'use strict';
const pre = document.getElementById('bpjr-preloader');
if (!pre) return;

const MIN_MS = 500;   // reveal animation gets to play out at least once, even on instant loads
const STALL_MS = 1400; // beyond this, spin the dot as a "still working" tell
const start = performance.now();

const stallTimer = setTimeout(() => pre.classList.add('pl-stall'), STALL_MS);

function hide() {
  clearTimeout(stallTimer);
  const wait = Math.max(0, MIN_MS - (performance.now() - start));
  setTimeout(() => {
    pre.classList.add('pl-done');
    pre.addEventListener('transitionend', () => pre.remove(), { once: true });
  }, wait);
}

if (document.readyState === 'complete') hide();
else addEventListener('load', hide, { once: true });
})();
