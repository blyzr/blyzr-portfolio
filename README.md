# blyzr.design

Portfolio site. Static, no build step, no framework.

## Structure

```
blyzr-portfolio/
├── index.html                  both layouts, CSS picks one at 860px
├── favicon.svg                 vector, preferred by modern browsers
├── favicon.ico                 16/32/48/64 fallback
├── favicon-16x16.png
├── favicon-32x32.png
├── apple-touch-icon.png        180×180
├── site.webmanifest
├── robots.txt
└── assets/
    ├── css/main.css
    ├── js/main.js
    └── img/                    project imagery goes here
        ├── icon-192.png
        └── icon-512.png
```

## Running it locally

Paths are absolute (`/assets/...`), so it needs a server rather than
opening the file directly.

```bash
cd blyzr-portfolio
python3 -m http.server 8080
```

Then http://localhost:8080

## Putting it on the homelab

It is a static folder, so anything will serve it. Drop it in a web root and
point an NPM proxy host at it, or run it from a container:

```bash
docker run -d --name blyzr -p 8080:80 \
  -v /path/to/blyzr-portfolio:/usr/share/nginx/html:ro nginx:alpine
```

## Two layouts, one document

Both live in `index.html`. `@media (max-width: 860px)` and the matching
`matchMedia` in `main.js` decide which is active, and `applyMode()` keeps
the JS in step with the CSS.

- **Index** (wide): typographic project list, sticky preview panel, light
  table proximity lighting.
- **Specimen** (narrow): large `br.` mark, project bands, loupe reveal tied
  to a fixed reading zone at 42% viewport height. Tapping a band expands its
  detail and scrolls it to the reading zone, so the open project is also the
  lit one. One band is open at a time.

## How the header dock works

Scrolling through the dead zone (`deadZone()`) does nothing. The threshold is
the point where the subtitle's top edge meets the underside of the header, so
it is read from live geometry rather than summed from element heights — an
earlier version added the subtitle's own height, which meant the dock did not
start until the subtitle had scrolled fully behind the header. Past the
threshold GSAP plays the whole transition as one 0.78s tween, and it reverses
at 72% of it. The hysteresis gap stops it flapping, and because the tween owns
the value it can never rest half-finished.

The docked state slides line two up beside line one, which needs line one's own
text width. `.dockfx .ln` is therefore `width:max-content`; as a plain block it
measured the widest line instead and opened a gap after "digital".

Every run rolls new Recursive axis values (`rollAxes`), so the weight, slant,
casual axis and tracking land somewhere slightly different each time.

## Project artwork

`.a1` to `.a11` (minus `.a3`, see below) at the end of the artwork block in
`main.css`, in the same order as the `projects` array in `main.js`. These are
single-image projects only — each renders as one `.art` div with a CSS
background, cover-cropped. All WebP, capped at 1400px, ~1.6MB for the set.

| Class | Project | Source |
|---|---|---|
| `.a1` | Dewlora | own prerender, widened to 3:2 with a blurred fill so the open preview crops gradient, not product |
| `.a2` | Trü Spray | embroidered mockup, cropped off page 2 of `TruSprayLogoMockups.pdf` |
| `.a4` | Good Hands | identity sheet |
| `.a6` | Chris Emery | album cover |
| `.a7` | Discrete | album cover |
| `.a8` | TapTec | packaging mockup — logo lockup + real production boxes in one frame |
| `.a9` | Min Reid | pitch pack cover, page 1 at 150dpi |
| `.a10` | HITTIT | title frame at t=6s — now the poster behind its video, see "Video slides" below |
| `.a11` | Koru | own render |

A project with more than one image (MikFlix, Min Reid, X&G, NightOwl, Pangea
Survival, Allie Nixon, Kronan) skips `.art` entirely and renders as a
`.carousel` instead — one slide visible at a time (also cover-cropped, to
the same project `ratio` an `.art` div would use), with nav arrows/dots.
`.a3`, `.a5`, `.a12`, `.a13`, `.a14`, `.a15` are unused art slots: each
still has an `art:'aN'` field in `main.js` for shape-consistency with the
other project objects, but nothing reads it once a project has more than
one image, so there's no matching rule in `main.css`.

**Kronan (2026-09-09):** was showing only `kronan_01` despite the copy
always having said "Three covers, one series" — the other two covers
(`kronan_02`, `kronan_03`, same `/opt/portfolio-src/05_Kronan_EP_Artwork`
source as the first) were just never brought in. Added as `kronan-2.webp`
and `kronan-3.webp`, same 1400px-cap WebP conversion as everything else;
`kronan.webp` (the original `kronan_01` export) is unchanged and stays
slide one.

**Behance backfill (2026-09-09):** four early projects pulled in from
`behance.net/blayzereid` — X&G Neon Sign Animation, NightOwl Mobile App
Concepts, Pangea Survival Identity, Allie Nixon Identity. OGZ United Identity
was on the same profile and deliberately excluded. Source stills pulled from
Behance's CDN, converted to WebP capped at 1400px via the alpine/imagemagick
throwaway-container recipe above. Copy is a compressed paraphrase of each
project's original Behance caption, not new client-facing copy.

## Video slides

A project can carry a `video` (filename in `assets/video/`) plus a `poster`
(filename in `assets/img/`, defaults to `images[0]`) alongside its `images`.
`mediaOf(p)` in `main.js` is the single ordered list every renderer walks —
video first if present, then stills — so video and image slides mix through
the same carousel/gallery/single-art code paths instead of each needing a
separate branch. A project with only a video and no stills (HITTIT) skips
the carousel chrome entirely and renders the `<video>` directly as `.art`.

Videos play muted/looped/inline, autoplaying via both the HTML attribute and
a JS `.play()` kick (some browsers only honour the `muted` *property*, not
the attribute, before allowing programmatic playback). `prefers-reduced-motion`
gets native `controls` and no forced autoplay instead, same as every other
motion effect in this file.

HITTIT's and X&G's masters: HITTIT from its own `/opt/portfolio-src` export;
X&G was never in that mirror — Behance's case study embeds it via Adobe's
CCV player, whose embed page exposes a direct, token-expiring `.mp4` URL.
Both re-encoded muted (audio stripped) H.264 via the same alpine/ffmpeg
throwaway-container pattern used for images — HITTIT scaled to 960px wide
(~8.6MB for 30s), X&G left near its original 1024×576 (~250KB for 10s).

## Touch and aspect ratio (2026-09-09)

`.band .gallery.multi` (the portrait-mobile swipeable strip) now sets
`touch-action:pan-x` explicitly. Left to the browser's default heuristic, a
swipe that starts even slightly diagonally — easy to do one-handed — could
get claimed by the page's own vertical scroll instead of the strip, which
read as "swipe doesn't work." Its cards also dropped the fixed `aspect-ratio:
16/10` + `object-fit:cover` crop in favour of each image's own natural ratio,
matching how the non-multi (desktop-row and single-image-band) gallery
already behaved — portrait shots (phone screens, Behance stills) no longer
lose their top and bottom to a landscape-shaped box.

## Preview height, no more viewport cap (2026-09-09)

`layout()` used to cap the preview's ratio-derived height to a fraction of
`innerHeight` — first spotted on a landscape phone's short viewport, but the
same cap cover-cropped square (`ratio:1.0`, e.g. Discrete, Kronan, Chris
Emery) and portrait images on an ordinary desktop too, any time the open
panel's width made its ratio-derived height taller than that fraction of the
browser window. The cap is gone outright now, on every viewport: the box is
always exactly `width / ratio`, so nothing is ever cover-cropped away to fit
a height it was never sized for. `centerPreview()` already centres the box
on the viewport's vertical middle and clamps it within `.split`, so any
excess just becomes something to scroll up or down into, uncropped.

Multi-image or not, a click on the image opens it uncropped in the lightbox
(`#lightbox` in `index.html`) — that's the escape hatch for whatever cover
crops away, rather than a second copy of every asset at a different ratio.

MikFlix's images (2026-09-05): `mikflix-wordmark.png` (kept, the actual
logo/brand mark) plus four live-site screenshots pulled from Nextcloud's
`portfolio-content/03_MikFlix_Portfolio_Site/Website_Screenshots` — replacing
the old single hero screenshot and the separate thumbnail-system montage.

Masters are on LXC 102 at `/opt/portfolio-src`, mirrored from Nextcloud
(`blyzr/portfolio-content`), along with everything a case study would need —
exploded assembly, orthographic views, production photos, the before/after
comparison.

Rect positions are cached and only re-read when `stale` is set, on scroll and
resize. If you add an element that moves independently, set `stale = true` when
it does, or it will light from the wrong place.

The lighting filters sit on `.art`, so imagery inherits the effect with no
other changes. Resting values were lifted once real photography went in
(`.prev .art` from `.15`/`.52` saturate/brightness, and the band thumbs off
full greyscale) — the gradients had no detail to lose, photographs do.

## Palette: Ink and lead

Printer's blacks with vermilion as the only voice. Set in `:root`.

| Token | Value | Role |
|---|---|---|
| `--base` | `#0f0f0f` | page |
| `--surface` | `#1a1a1a` | raised |
| `--text` | `#e8e6e1` | body |
| `--subtle` | `#b5b0a8` | secondary |
| `--muted` | `#8a8681` | labels |
| `--accent` | `#d4472f` | vermilion, used sparingly |

Each project carries its own ink (`ink` in the `projects` array), drawn from a
press-ink range rather than a rainbow: verdigris, ochre, burnt sienna, payne's
grey, olive drab, rust, slate, amber. The live accent drifts toward whichever
project has focus, which is why the dot changes colour.

## Spacing

One 4px scale, `--s1` (4px) through `--s9` (96px). No off-scale value exists in
the stylesheet; if you need one, the scale is wrong, not the exception.
Radius is `--r1` (2px) for frames and `--r2` (6px) for panels. Two values.

## Motion budget

Three ambient effects, deliberately. Earlier revisions ran ten at once, which is
why none of them registered.

1. **Light table** — proximity lighting on rows and the preview
2. **Live mark** — cursor or gyroscope tilt on the monogram
3. **Header dock** — the hero title docking on scroll

Grain is texture, not motion. Cut along the way: the lagging trail glow,
background parallax, the dot's drop-shadow glow, and the pointer-entry colour
bloom. If you add one back, take one out.

## Tuning constants

Top of `main.js`:

| Constant | Current | What it does |
|---|---|---|
| `TILT` | `1.0` | Live mark rotation multiplier |
| `MOBILE_TILT` | `1.45` | Same, on touch |
| `MARK_EASE` | `0.1` | Live mark damping per frame. Lower is smoother and laggier |
| `SPREAD` | `0.99` | Light radius as a fraction of the smaller viewport dimension |
| `MARK_HERO_PX` | `32` | Header mark size before docking |
| `MARK_DOCK_PX` | `17` | Header mark size after docking |
| `DOCK_DURATION` | `0.78` | Dock tween length in seconds |
| `READING_ZONE` | `0.42` | Where the mobile loupe sits, as a fraction of viewport height |

## Copy

All project copy is a draft written from the shortlist notes, not from the
designer. Read it as a first pass in the right voice, not as approved text.

One line needs care rather than editing: Dewlora's second paragraph states the
product line's turnover without claiming the redesign caused it. The sales ramp
predates the redesign, so "designed the enclosure for a line doing $3M" is
supportable and anything causal is not.

## Desktop row centring (2026-09-09)

Opening a row used to just expand its `.detail` in place, wherever that
landed on screen — on a long list that could open well outside the visible
area with nothing to bring it into view. `centerRow()` mirrors the mobile
`centreBand()` pattern (same file) but targets true viewport centre rather
than the mobile loupe's fixed `READING_ZONE`: it reads the clicked row's
`getBoundingClientRect()` and its `.detail-in`'s `scrollHeight` in the same
tick the `.live` class is added — before the 0.7s grid-template-rows
transition has moved anything — so the sum is an estimate of where the row
will end up once fully open, not a value computed mid-transition that would
fight it. If another row was already open, its own `.detail-in.scrollHeight`
is subtracted back out first when it sits above the newly-clicked row, since
closing it will pull everything below back up by that amount. Only fires on
open (clicking through projects), not on close.

## Row inset, back-to-index, project links (2026-09-09)

`.row:hover,.row.live` added `padding-right` to match its existing
`padding-left` — the left-side padding was already there (also making room
for `::before`'s accent bar), but with no right-side counterpart the title
gained breathing room from the edge on open/hover while the year/kind on
the right stayed flush against it, an inset that only ever showed on one
side.

Now that opening a row scrolls it to viewport centre (see "Desktop row
centring" above), the existing `#back` button at the top of `.panel` can
land off-screen above a row opened deep in the list — nothing visible to
close it with. Each row's own `.detail` now ends with a `.row-back` span
doing the same `closeProject()`.

A project can carry a `link` (and optional `linkLabel`, default "View live
site") to its actual live site — `projectLink()` renders it in both the
desktop row and mobile band detail. MikFlix is the first: linked to
`mikhailmehra.com`, the director's site it actually is. Both `.row-back` and
`.row-link` are `<span role="…" tabindex="0">`, not a real `<button>`/`<a>`
— either would be interactive content nested inside the row/band's own
`<button>`, which is invalid HTML with unreliable click/keyboard behaviour
in practice. `.row-link` opens via `window.open(..., '_blank', 'noopener,
noreferrer')` and clears `.opener` after, which is what a real
`target="_blank" rel="noopener noreferrer"` link would do.

## Preview centring while clicking through rows (2026-09-09)

`centerPreview()` reads `split.getBoundingClientRect()`, which is
viewport-relative — its `.top` already bakes in whatever `scrollY` happens
to be *right now*. That's fine only when nothing is about to scroll. Opening
a row without going back to the index first fires two things in the same
tick: `centerRow()` kicks off the page's own scroll toward the newly-clicked
row, and `layout()` → `centerPreview()` positions `.prev`'s `translateY` —
computed against the *pre-scroll* `splitRect.top`, a value the page is
about to leave. On a modestly-sized box the resulting offset was small
enough to miss; on NightOwl, whose portrait ratio makes its box far taller
than most, it was the difference between "centred on the row" and "parked
somewhere in the whole column" — worse the more rows you'd clicked through
without returning to index, since each click's stale reading compounded
whatever the previous one left mid-flight.

Fixed by not depending on live `scrollY` at all: `centerRow()` now returns
the `scrollY` it's animating the page *toward*, and `openProject()` threads
that straight into `layout(targetScrollY)` → `centerPreview(targetScrollY)`,
which folds `targetScrollY - scrollY` into its viewport-middle calculation.
The box is positioned for where the page will end up, computed in the same
synchronous tick as the scroll request — it doesn't matter whether that
scroll's smooth animation has started, finished, or gotten interrupted by
another row-click queuing a new one before it settles.

## Still to do

- Case study pages behind "See full case study" — the link is styled but dead
- The hero still reads "Identity, digital and motion design", which predates
  Dewlora leading the work. Product/industrial design is now the strongest
  piece and the strapline does not mention it.
- About and contact pages
- Self-host Recursive instead of the Google Fonts CDN
- No `Cache-Control` on the nginx container, so browsers hold stale assets
  between deploys
- `sitemap.xml`
- Open Graph and Twitter card images
