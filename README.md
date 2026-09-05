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

`.a1` to `.a10` at the end of the artwork block in `main.css`, in the same
order as the `projects` array in `main.js`. All WebP, capped at 1400px, ~1.6MB
for the set.

| Class | Project | Source |
|---|---|---|
| `.a1` | Dewlora | own prerender, widened to 3:2 with a blurred fill so the open preview crops gradient, not product |
| `.a2` | Trü Spray | embroidered mockup, cropped off page 2 of `TruSprayLogoMockups.pdf` |
| `.a3` | MikFlix | 4×2 montage of the portrait thumbnail system |
| `.a4` | Good Hands | identity sheet |
| `.a5` | Kronan | `kronan_01` |
| `.a6` | Chris Emery | album cover |
| `.a7` | Discrete | album cover |
| `.a8` | TapTec | packaging mockup — logo lockup + real production boxes in one frame |
| `.a9` | Min Reid | pitch pack cover, page 1 at 150dpi |
| `.a10` | HITTIT | title frame at t=6s |

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
