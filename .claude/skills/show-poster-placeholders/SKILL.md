---
name: show-poster-placeholders
description: 'Use when a new show is added to shows.ts without a real flyer photo yet, and a minimal band-poster-style placeholder image needs to be generated.'
user-invocable: false
---

# Show Poster Placeholders

Use this skill when adding an upcoming show that has no real flyer/photo available yet. Generate a minimal, poster-style placeholder rather than leaving the show without an image or reusing an unrelated photo.

## Reference Style

Match the minimal poster flyers already in the repo (e.g. `public/images/shows/Renegade-09-03-20.jpg`, `public/images/zombie-head.png`), not the photo-based flyers. That style is:

- Flat cream/off-white background, single dark accent ink color (no gradients/photos).
- A double circular ring border.
- Band name "LIES FROM GRANNY" curved along the **top** inside of the ring.
- A small, very simple centered icon/illustration relevant to the show (1-2 shapes, flat fills/strokes only — not detailed or photorealistic).
- A date row in the middle, e.g. `◆ 03/16 ◆ 2026`.
- The venue name curved along the **bottom** inside of the ring.
- Pick one accent ink color per show that fits its vibe (e.g. green for a St. Patrick's Day show, teal for a beach bar, orange for a sunset/festival show).

## Technique

Build the poster as an SVG and rasterize it to PNG with `sharp` (already a project dependency in `node_modules`, no install needed).

**Do not use `<textPath>`** — it silently fails to render with sharp's SVG backend (librsvg), leaving curved text blank. Instead, manually place each character along a circular arc:

```js
const CX = 400;
const CY = 500;

// centerAngleDeg: 0 = top of circle, 180 = bottom (clockwise from top).
// For the bottom arc, pass a NEGATIVE degPerChar (index increasing must
// decrease the angle on the bottom half, or the text renders backwards)
// and set flip so letters read upright instead of upside-down.
function arcText(text, { radius, centerAngleDeg, degPerChar, flip, fontSize, color }) {
	const chars = text.split('');
	const total = (chars.length - 1) * degPerChar;
	const start = centerAngleDeg - total / 2;

	return chars
		.map((ch, i) => {
			const a = start + i * degPerChar;
			const rad = (a * Math.PI) / 180;
			const x = CX + radius * Math.sin(rad);
			const y = CY - radius * Math.cos(rad);
			const rotate = flip ? a - 180 : a;
			const glyph = ch === ' ' ? '\u00A0' : ch;

			return `<text x="${x}" y="${y}" transform="rotate(${rotate} ${x} ${y})" text-anchor="middle" font-family="Arial Narrow, Helvetica Neue, Arial, sans-serif" font-size="${fontSize}" font-weight="700" fill="${color}">${glyph}</text>`;
		})
		.join('\n');
}
```

Call it once for the band name (`centerAngleDeg: 0`, positive `degPerChar`) and once for the venue name (`centerAngleDeg: 180`, negative `degPerChar`, `flip: true`).

Write a throwaway Node script in `/tmp` that builds the full SVG string (ring, arc text, date row, icon, background) and rasterizes with:

```js
const sharp = require('<absolute-path-to-repo>/node_modules/sharp');
await sharp(Buffer.from(svgString)).png().toFile(outputPath);
```

Run it with `node /tmp/generate-posters.js`, view the output PNGs with the image tool to confirm the text isn't reversed/overlapping, then **delete the temp script** — only the final PNGs belong in the repo.

## File Placement

- Save to `public/images/shows/<year>/`, creating the year folder if needed.
- Name files descriptively with a `-placeholder` suffix, e.g. `molloys-3-16-2026-placeholder.png`, so it's obvious the image should be swapped for a real flyer later.
- Generate at 800x1000px (matches the `imgWidth`/`imgHeight` most existing flyers use) and set those fields to match exactly in the `Gig` entry.

## Follow-Up

- Placeholders are meant to be temporary. Leave the `-placeholder` suffix in the filename as a signal to swap in a real flyer once one exists, and update `img`/`imgAlt`/`imgWidth`/`imgHeight` together when that happens.
