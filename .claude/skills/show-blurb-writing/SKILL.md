---
name: show-blurb-writing
description: 'Use when adding a new show/gig entry to shows.ts, including writing the blurb text, new-songs list, and other Gig fields for Lies From Granny.'
user-invocable: false
---

# Writing Show Blurbs And Gig Entries

Use this skill whenever a new show is added to `src/components/shows/shows.ts`, whether it's a past recap or an upcoming announcement.

## Gig Shape

Each entry follows `Gig` in `src/models/gig.ts`: `id`, `name`, `date`, `text` (string array, one paragraph per entry, rendered with `v-html`), `img`, `imgAlt`, optional `imgWidth`/`imgHeight`, and an optional `songs` array for new setlist additions.

- `id`: increment from the current highest id in the file (ids don't need to stay date-ordered — they reflect when the entry was added).
- `date`: a plain, human string parseable by `new Date()`, e.g. `'March 16, 2026'` or `'Sept 27, 2025'`. This is used to sort/filter upcoming vs. past shows in `src/router/views/shows.vue`, so keep the format consistent with nearby entries.
- New shows are typically added near the top of the array for readability, since the array is otherwise roughly newest-first, but placement doesn't affect behavior.
- `songs` is only included when the show debuts new setlist additions — omit it entirely rather than passing an empty array.

## Voice And Content

Read a few existing entries in `shows.ts` before writing a new one to match tone. A few representative examples:

> "St. Patty's at Molloys - an Irish bar through and through, and we're bringing the party!", "We've got a batch of new songs ready to debut, so come sing along with us.", "Wear your green, grab a pint, and let's celebrate!"

> "Summer's winding down, but we're not done yet!", "Come rock out with us for a energy-filled set at Pickles!", "Have you tried the Original Pickle Shot yet? If not, what have you been waiting for? And while you're at it, order a round for the band ;)"

> "Ocean City holds a special place in our heart's, so we were thrilled to be rock at one of the best spots in town.", "If you're ever in OC, Pickles is a full-service bar and restaurant, so it's a great option for dinner if you're looking to fill your stomach before a night of drinkin' and dancin'!"

Guidelines drawn from those examples:

- Casual, first-person-plural, exclamation-friendly band voice — not press-release copy.
- 2-4 short sentences/paragraphs, each its own `text` array entry (renders as a separate `<p>`).
- Call out something concrete and specific to the venue or occasion (the food, a signature drink, the stage, a co-headliner, a festival tie-in) rather than generic tour-stop language.
- For upcoming shows, give people a reason to show up early or a detail that sets the scene (opening/closing slot, holiday theme, nearby festival).
- For past-show recaps, thank people for coming out and mention a specific highlight (attendance, a co-bill, a fun mishap).
- Straight apostrophes render fine through `v-html`; avoid raw `&`/`<`/`>` since the text is injected as HTML — use `<a href="...">` only when linking out (see the id 19 and id 12 entries for examples), and always add `target="_blank"` for outbound links.
- Don't invent ticket links, set times, or other facts not provided — leave that detail out or phrase it generally (e.g. "we'll post ticket info when available") rather than guessing.

## Procedure

1. Gather the facts: date, venue, any co-headliners/context, and any new songs debuting.
2. Check whether a real flyer image exists under `public/images/shows/`. If not, see the `show-poster-placeholders` skill to generate one.
3. Write 2-4 `text` entries in the established voice, using the facts gathered — no invented details.
4. Add the `songs` array only if new songs are debuting.
5. Run `yarn type-check` after editing `shows.ts`.
