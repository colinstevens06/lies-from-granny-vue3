# Brief: "free for a show" vs "free for a practice" on /da-band

**Do NOT write, edit or create files. Do not run tests, builds or dev servers. Do not spawn subagents. No web research.**
You are one of four independent reviewers. Each has a different mandate (given in your prompt). Nobody sees the others' reports.

## The product

`/da-band` is a members-only corner of a five-piece cover band's website (Vue 3, PrimeVue 3, PrimeFlex, Netlify Functions + Postgres). Five members: Anna, Kyle ("Fives"), Nick ("Hermes"), Francesco ("Franny"), Colin (the admin, who also builds it). It is used almost entirely on phones. The band moves slowly, members are not motivated form-fillers, and the last poll that worked was "one tap per date, two minutes tops".

## What exists now (built, on a feature branch, not yet used by the band)

- **One answer per member per calendar day**: `yes | no | maybe` ("Not sure"), or no row at all ("Pending"). Postgres table `availability (member_id, day, answer, source, updated_by, updated_at)`, primary key `(member_id, day)`. `source` is `self | manual | poll | assumed`, ranked so a seed never overwrites a member's own answer.
- **Round form (member)**: the admin opens a form for a date range (first one: Jan 1 – Mar 31, 2027, about 13 weeks). The member sees a **week grid**: one line per week, a 54px week label, then 7 day cells (Sun–Sat), 4px gaps. Each cell is about 40px wide by 46px tall on a 390px phone and shows the day number plus a 10px answer word. **A tap cycles blank → Yes → No → Not sure → Yes.** There is no way back to blank. Colors: Yes green `#2f9e44`, No near-black `#212529`, Not sure orange `#f59f00`, blank white with a gray outline. Every tap saves. "Sign off" unlocks once every date is answered. The whole Jan–Mar grid measured about 2 phone screens.
- **"Fill a weekday at once…"** button opens a bottom sheet: one Yes / No / Not sure row per weekday, fills only blank days.
- **Edit mine**: the same tap-to-cycle cells on a month grid, any future date, any time.
- **Shared band calendar**: month grid. Each day is one of: **booked** (pink; a practice or a show is on it), **blocked** (black; anyone said No), **possible** (yellow; all five said Yes), **open** (white). Under the day number are five 6px dots, one per member (green Yes, pink No, orange Not sure, hollow Pending). Tapping a day opens a sheet listing each member's answer.
- **Possible dates list** on the home page: upcoming days where all five said Yes and nothing is booked, with a "Copy list" button for the group text thread.
- **Admin lock-in** ("pick dates"): chips in two groups, **Everyone said Yes** and **One short** ("Sat Jan 16 / no Franny"). Admin picks N, taps Lock in, which creates those **practices** (time TBD) and closes the form. A form can carry "practices needed: N before <target show>".
- **Shows are not booked in the app.** They are static entries in a repo file, added by Colin by hand after a venue confirms. So today the app only ever helps choose **practice** dates; show dates get worked out over text.
- **Seeding**: an import file can pre-fill a member's days (`source: 'manual'`). Its shape: a window, a list of that member's Yes dates, and `busyWeekdays` (in-window dates on those weekdays that are not listed become No).

## The new scenario (the reason for this round)

Anna works some Sundays. Her seed for all of 2027 is: **Yes every Friday and Saturday; Yes on her "long-weekend" Sundays (every 14 days); No on the other Sundays; weekdays blank.** So about 26 Sundays in 2027 are No.

The seed is wrong for the Saturday before a working Sunday:

- A **show** runs roughly 8pm to 1am, plus load-out. She can't do that the night before a Sunday shift.
- A **practice** on that Saturday, say 11am–2pm, is probably fine.

So on about 26 Saturdays a year her true answer is "practice yes, show no", and one answer per day cannot say that. The same shape can hit anyone (an early Monday, a kid's morning game, a Friday work night).

## Verified facts and constraints

- **The band never plays day shows.** "Show" means a night, about 8pm–1am. Practices are usually daytime on weekends or weekday evenings, 2–3 hours, time decided after the date.
- **The owner does not want time-of-day ranges.** His words: "people just know what practice and/or show availability means." Historically, planned by hand, they asked "can you do a show this date" and "can you do practice this date" as separate questions.
- **The owner's own first idea** (he explicitly says do not lock in on it): "free" splits into "free for show" and "free for practice", and a member can be both.
- Shows land on Friday and Saturday nights almost always. Practices land anywhere.
- Members can't clear an answer back to blank; only the admin can.
- "Not sure" exists and must keep meaning "can't commit yet". A possible date needs five Yes.
- 13 weeks × 7 days = about 90 cells per round. Any design that doubles taps for all 90 cells has to justify it. The previous prototype measured about 9 screens for a one-row-per-date list versus 2 for the week grid, and the grid won for that reason.
- Phone content width is about 390px minus gutters; cells are about 40px wide. Five member dots at 6px already sit under each calendar day number.
- UI library is PrimeVue 3 (SelectButton, Sidebar bottom sheet, Button, Checkbox, etc.). No hand-rolled controls where PrimeVue has one, except the calendar cell itself.
- Nothing has shipped to the band yet, so the data model and the seed format can still change freely. The only data is the seed.

## You may read (optional, only if you need to check a claim; keep it small)

Repo root: `/Users/colinstevens/Documents/Coding Projects/lies-from-granny-vue3`

- `src/models/availability.ts`, `src/utils/band-calendar.ts` (status and possible-date logic)
- `src/components/da-band/forms/week-grid.vue`, `answer-cell.vue`, `weekday-fill-sheet.vue`
- `src/components/da-band/calendar/calendar-day.vue`, `pick-dates.vue`, `possible-dates.vue`
- `planning/2026-11-da-band-availability-workflows.md` (the decisions so far; read by section)

## What to report (in this order, 650 words maximum, plain markdown)

1. Opening marker with your role in bold (given in your prompt).
2. **Your one design**, complete: (a) what a member's answer for a day *is* (the data shape, in one or two lines), (b) exactly how a member enters it on a 390px phone, with a small ASCII sketch of the cell or row and the tap sequence, and a tap count for Anna's "practice yes, show no" Saturday and for a plain "can't that day", (c) how the shared calendar, the possible-dates list and the admin's pick-dates read it, (d) how Anna's seed is expressed so the 26 Saturdays come out right without hand-listing them twice.
3. **What it costs** the four members who never have this problem.
4. **The strongest argument against your own design.**
5. Any product judgment you are making that the owner should decide separately.
6. Last line: `**Recommendation:** <one sentence>`

Commit to one design. No menus of equal options. Be blunt; the owner is not attached to his own idea and wants it attacked if it deserves it.

**Reminder: do NOT write, edit or create files. Do not run tests or builds. Do not spawn subagents.**
