# Da Band Edition — `/da-band` Planning Doc

**Status:** planning only. Nothing here is built. Written September 23, 2026; revised the same
day after Colin's first round of decisions — see *Decisions locked in* — and again the same day to
add §10, the admin tier and voice-dictated updates.

**Owner:** Colin (also the band's default planner, and the person this is mostly meant to unstress).

This is the working spec for a band-internal page on liesfromgranny.com. It starts as a
read-only "here is what we already decided" page and has a plausible path to a small
full-stack app with logins and set-list planning. Read the *Reframing* section before the
feature list — the feature list only makes sense if you accept the constraint.

---

## The plan, briefly

The band doesn't need a website. It needs decisions to stop becoming unfindable the moment they're
made. Three incidents this month, all the same root cause: someone asked when practice was four
days beforehand, someone asked which song got cut two days after practice, and pinning down one
date took three weeks across a text thread and an email.

`/da-band` is an unlisted page on liesfromgranny.com that holds those answers. It ships in phases,
and the early ones need no backend at all.

**Phase 0** is read-only and authored by Colin: next practice as a headline, next gig pulled from
existing show data, upcoming practices, songs per practice, and a running decisions log. That
alone kills two of the three incidents.

**Phase 1** pushes practices and gigs into everyone's phone calendar through a subscribable `.ics`
feed — one setup step each, then their own alerts do the work.

**Phase 2** collects availability with a single batched poll, the one format this band has actually
responded to. Free text is why the spreadsheet version stopped working; structured dates are what
let the page compute the nights everyone can do.

**Phases 3–6** add logins, a set-list builder, notifications, and an admin tier with voice-dictated
updates — only if 0–2 get used. The one exception is §10's Option A, which is a textarea and a copy
button and can ship whenever.

1. Write `members.ts` from the roster, plus `practice.ts` and `practices.ts` with real entries.
   Pin every date to `America/New_York` through one shared helper. Run `yarn type-check`.
2. Add the `/da-band` route — unlisted, `noindex`, absent from the nav. Build the next-practice
   headline: day, date, time, location, what to prepare. Readable in two seconds on a phone.
3. Pull the next gig from `shows.ts`. First extract the upcoming/past date filter out of
   `shows.vue` into a shared util, so that logic doesn't get copy-pasted a second time.
4. Add the upcoming-practices list and a per-practice song panel. PrimeVue 3 calls it `Sidebar`,
   not `Drawer` — or use plain `<details>`, which is cheaper and perfectly fine here.
5. Add the decisions log: dated entries for what ran, what got cut, what changed. Five minutes of
   typing after each practice. This is the fix for "what song did we cut?"
6. Ship it. Send one text with the link. Wait two weeks and watch whether anyone opens it before
   building anything else.
7. In parallel, send one availability poll — Google Forms, a single checkbox question listing six
   weeks of nights, with a stated deadline. This tests the human problem, not the software one.
8. Build the availability strip from what comes back plus what Colin already knows. Lead with
   "nights everyone can do." Render unanswered as unknown, never as unavailable.
9. Generate the `.ics` feed at build time with `TZID=America/New_York`, write subscribe
   instructions, send a second text. Setup happens once; every later practice arrives on its own.
10. Reassess before phase 3. Logins, set lists and notifications are worth it only if the page and
    the poll both got used. If neither did, a better page isn't the fix.

---

## 0. Decisions locked in

Settled September 23, 2026. Don't re-open these without a reason.

- **`/da-band` is unlisted but public for the MVP. No auth.** Nothing sensitive goes on the page.
  A backend stays out of scope until phase 3.
- **Availability is not an MVP requirement** — but manual entry by Colin is a fine early addition,
  because the data model is identical either way and the UI only gets built once. See §6.
- **Real names and roles for all five will be shown.** Supplied: **Anna** (lead vocals), **Kyle**
  (lead guitar, backup vocals), **Nick** (rhythm guitar, lead and backup vocals), **Francesco**
  (bass), **Colin** (drums). `members.ts` is unblocked — nothing is blocking work now.
- **Auth, when it lands, means five individual accounts.** Person A logs in as person A and
  cannot act as person B. The shared-passcode-plus-name-select idea in the first draft is
  **rejected** — people will goof around, and nobody should be able to edit someone else's
  availability by accident or otherwise. §7 is rewritten around that.
- **All dates and times are `America/New_York`.** Everyone is in Maryland. Stored, computed and
  displayed in that one zone, always. Note this is the IANA zone, *not* a fixed EST offset —
  Maryland observes DST, so hard-coding `-05:00` puts every practice between March and November
  off by an hour.
- **`LFG Songs.xlsx` is a reference and a seed source, not a source of truth and not a pattern to
  copy.** It's how things got managed by hand. The new system gets a new planning pattern; the
  workbook contributes historical data to seed with and shows which problems are real. Don't port
  its structure one-for-one. Applied throughout §8 and §14. Four years of shows, set
  lists, venue contacts, payouts, and an existing practice-scheduling grid. Explicitly out of
  scope for the MVP; squarely in scope for the long-term model. Catalogued in §14, and it already
  changed two things this doc got wrong.
- **A standing practice slot was already floated to the band** a month or two before this doc and
  is unresolved. Still the cheapest possible fix, still a band conversation, not a code change.
- **All five are believed to be on iPhone.** Unconfirmed, and it blocks nothing until the `.ics`
  subscribe instructions get written.

---

## 1. The actual problem

Three real incidents, all in the last few weeks, all the same root cause:

1. Someone asked "when's the next practice again?" — four days before practice. The answer
   already existed. It was decided. It was just buried in a text thread.
2. Two days after Monday's practice, someone texted asking which song we cut. A decision was
   made in the room and never written down anywhere durable.
3. Pinning down one date this past summer took ~3 weeks, across both a text thread and an
   email, because one person didn't reply and there was no shared surface showing the state
   of the question.

None of these are "we need a website." All three are:

> **Decisions get made, then immediately become unfindable, so they get re-litigated over text.**

Secondary problem, and the harder one: **five adults with jobs and kids do not reliably
respond to asynchronous messages.** That is not a software problem and no page will fix it
directly. What software *can* do is lower the cost of answering from "compose a reply" to
"tap once," and push information into places people already look instead of waiting for them
to come look.

---

## 2. Reframing — the constraint everything else hangs off

**Any feature that requires all five members to enter data *on an ongoing basis* will fail for
exactly the same reason texts fail.** If a bandmate won't answer "does the 29th work?", they will
not log in every week to maintain a busy-times calendar. Building a beautiful five-person
availability calendar and then having it sit empty is the single most likely way this project
wastes a month.

**But "on an ongoing basis" is carrying real weight in that sentence.** One thing *did* get a
response out of everybody: someone sent a link, it opened a poll, every date across about a
six-week window was listed, tap yes or no, submit. That is the only mechanism described anywhere
in this document with a proven track record inside this specific band, and it should be weighted
accordingly. So the rule is narrower and more useful than "people won't enter data":

> **People will not maintain data continuously on their own initiative. They will answer one
> batched, tap-only ask that has a deadline.**

So three design rules:

- **Read-first.** The MVP is authored by one person (you) and read by four. Zero required input
  from anyone else. This alone solves incidents #1 and #2 above.
- **Batch the ask; never stand up a surface for them to keep current.** One poll round every six
  weeks, not a calendar that expects a steady trickle of edits from five people. §6 is the design.
- **Push, don't pull.** Don't build a destination and hope people visit. Get practices and
  gigs into the calendar app already on their phone, where their own alerts fire. See §5,
  which is the highest-leverage item in this entire document and was not in the original
  brain dump.

A fair test of whether this project worked: **six months from now, has the group text gotten
quieter about logistics?** If not, the page didn't land, regardless of how good it looks.

---

## 3. Phases

| Phase | What it is | Needs a backend? | Status |
| --- | --- | --- | --- |
| **0 — MVP** | Read-only `/da-band`. Next practice, next gig, upcoming practices, per-practice song list, practice recaps/decisions log. Data is static TS in the repo, same as `shows.ts`. | No | Spec'd below |
| **1 — Calendar feed** | A subscribable `.ics` of practices + gigs, generated at build time. One-time setup per member, then everything lands in their phone calendar forever. | No | Spec'd below |
| **2 — Availability** | A batched poll round, collected with an off-the-shelf form and parsed into a static data file. Yields "here are the dates everyone can do" plus the busy-days visual. | **No** | §6 |
| **3 — Auth + writes** | Five logins, so responses stop routing through Colin's hands. | Yes | §7 |
| **4 — Set-list builder** | Time math, drag-order sets, Spotify playlist per set list, "what did we play last time at this venue." | Yes (or half of it static) | §8 |
| **5 — Notifications** | Getting attention. Honest assessment in §9 — mostly this is phase 1's job. | Depends | §9 |
| **6 — Admin + voice notes** | An admin tier above the five equal accounts, and a dictate mode that turns a spoken post-practice note into the site's assets. The cheap version needs no backend and no agent. | Half of it, no | §10 |

**The significant change from the first draft:** availability moved *earlier* and lost its backend
requirement. The poll is hosted by somebody else, the responses get parsed into a TS file at your
desk, and the site stays static. Your headline want — a populated calendar of known busy times so
nobody proposes a date we already know is dead — turns out to be reachable without ever standing
up a server. Auth buys convenience later (people answer directly instead of through you), not
capability.

**Added September 23 from a second brain dump:** phase 6 (§10) — an admin role and voice-dictated
updates. It's listed last because the full version depends on §7, but its first version depends on
nothing and could ship right after phase 0.

Phases 0 through 2 are worth doing even if 3–5 never happen. They are a weekend or two of work
and they address every incident that actually happened.

---

## 4. Phase 0 — the MVP spec

### Route and files

New route `/da-band`, lazily imported like the others in [src/router/index.ts](src/router/index.ts).

```
src/router/views/da-band/index.vue          # route-level composition
src/components/da-band/next-practice.vue # the headline block
src/components/da-band/practices/practice-card.vue
src/components/da-band/practice-songs.vue  # the drawer contents
src/components/da-band/availability-strip.vue  # phase 2, see §6
src/components/da-band/practices.ts      # Practice[]
src/components/da-band/members.ts        # BandMember[]
src/models/practice.ts
src/models/band-member.ts
src/styles/views/_da-band.scss        # MUST be added to src/styles/index.scss or it won't load
```

### Page sections, in order

1. **Next practice — the headline.** Its own visually dominant block at the very top. Day of
   week, date, start time, end time, location, and "what to prepare." Not a row in a calendar.
   This is the single most-asked question and it should be answerable in under two seconds
   from a phone lock screen. If there is no next practice scheduled, this block says that
   loudly, because that's also information.
2. **Next gig.** Read straight from the existing `shows` array in
   [src/components/shows/shows.ts](src/components/shows/shows.ts) — no new data. Same
   upcoming-filter logic that [src/router/views/shows.vue:28-36](src/router/views/shows.vue#L28-L36)
   already uses; pull that into a shared util rather than copy-pasting it a second time.
   Include a countdown ("18 days out") because that's what makes urgency legible.
3. **Upcoming practices.** Everything after the headline one, chronological.
4. **Songs for each practice.** A drawer/panel per practice, opened from a "Songs for this
   practice" link on the card. Note: this repo is on **PrimeVue 3** (`primevue ^3.32.2`), where
   the component is `Sidebar`, not `Drawer` — `Drawer` is the PrimeVue 4 rename. An `Accordion`
   or plain `<details>` is honestly fine here and cheaper.
5. **Recent decisions / practice recaps.** *New idea, not in the brain dump, and it's the one
   that solves "what song did we cut?"* An append-only dated list: what we ran, what we cut,
   what changed, who's woodshedding what. Five minutes of typing from you after each practice
   kills an entire category of text message.
6. **Availability.** See the caveat below.

### On the availability calendar

Decided: **not an MVP requirement.** Two reasons to keep it out of the first ship, and one reason
a simple version is still fine to add early.

- A **month grid is more UI than the problem needs.** Practices get scheduled one to three
  weeks out. A horizontal **next-14-days strip** — one column per day, five rows (one per
  member), shaded where someone's out — answers "when can we all do it" faster than a month
  view and is a fraction of the work. PrimeVue 3's `Calendar` is a *date picker*, not an event
  calendar, so either way you're either hand-rolling a CSS grid or pulling in
  `@fullcalendar/vue3`, which is a heavy dependency for five people's busy blocks.
- **The data has to come from somewhere,** and in a read-only MVP that somewhere is you, typing.

**The reason it's still fine to add early:** Colin is willing to hand-enter what he already knows,
and the data model is the same whether a date came from a poll response or from him typing it in.
So it isn't throwaway work — build the strip once, feed it manually now, feed it from poll rounds
later. Just put a `source` field on every response (see §6) so the page can tell "they told me"
apart from "Colin assumed."

**Recommendation:** ship phase 0 without it, then add the strip with manual data as the next
thing — before the `.ics` feed, if you're impatient. A plain-text "known conflicts" list
(`Dave — out Oct 10–17`) is a legitimate stand-in and costs an afternoon.

### Data models

Follow the existing conventions exactly: annotate the array, never cast it
(`export const practices: Practice[]`), so `yarn type-check` validates each new entry the way
it does for `Gig[]` and `BandListing[]`.

```ts
// src/models/band-member.ts
export interface BandMember {
	id: number;
	/** Display name shown on the page. */
	name: string;
	/** 'drums' | 'lead-guitar' | 'rhythm-guitar' | 'bass' | 'vocals' — a member can hold several. */
	roles: BandRole[];
	/** Short initials or nickname for tight calendar columns. */
	shortName: string;
}
```

The roster, concretely:

```ts
// src/components/da-band/members.ts
export const members: BandMember[] = [
	{ id: 1, name: 'Anna', shortName: 'Anna', roles: ['lead-vocals'] },
	{ id: 2, name: 'Kyle', shortName: 'Fives', roles: ['lead-guitar', 'backup-vocals'] },
	{ id: 3, name: 'Nick', shortName: 'Hermes', roles: ['rhythm-guitar', 'lead-vocals', 'backup-vocals'] },
	{ id: 4, name: 'Francesco', shortName: 'Franny', roles: ['bass'] },
	{ id: 5, name: 'Colin', shortName: 'Colin', roles: ['drums'] }
];
```

So `BandRole` is `'lead-vocals' | 'backup-vocals' | 'lead-guitar' | 'rhythm-guitar' | 'bass' |
'drums'`, and `roles` must stay an array — Nick and Kyle both hold two. The `shortName` values are
the nicknames the band's own spreadsheet already uses; see the name-mapping warning in §14 before
importing anything from it.

```ts
// src/models/practice.ts
export interface Practice {
	id: number;
	/** ISO calendar date, 'YYYY-MM-DD'. See the date invariant below. */
	date: string;
	/** 24h local, 'HH:MM'. */
	startTime: string;
	endTime: string;
	location: string;
	/** Songs to have ready. Must match song titles in songs.ts to stay linkable. */
	prepare?: string[];
	/** Written after the fact: what we actually ran, what got cut, what changed. */
	recap?: string[];
	/** Optional tie to the show this practice is prepping for. */
	gigId?: number;
	status: 'scheduled' | 'cancelled' | 'complete';
}
```

**Date invariant — important, and different from `Gig.date`.** `Gig.date` is a human-readable
string parsed with `new Date()`, and per CLAUDE.md that must stay as it is. Do **not** copy that
pattern for practices, because practices have times and times have a timezone trap:
`new Date('2026-09-29')` parses as **UTC** midnight and renders as the 28th in US timezones,
while `new Date('2026-09-29T19:00')` (no `Z`) parses as **local**. So always build the datetime
from both fields, and never hand a bare `YYYY-MM-DD` to `new Date()`:

```ts
// src/utils/dates.ts — one helper, used everywhere
export const practiceStart = (p: Practice) => new Date(`${p.date}T${p.startTime}`);
```

Skip this and you get an off-by-one-day bug that only shows up for people in some timezones,
which is the worst kind.

**And pin the timezone rather than trusting the device.** Everyone is in Maryland, so every date
in this system means `America/New_York` and nothing else. The helper above parses into whatever
zone the viewer's phone happens to be in, which is right at home and wrong the week someone is in
Denver. Format explicitly instead:

```ts
export const EASTERN = 'America/New_York';

export const formatPractice = (p: Practice) =>
	new Intl.DateTimeFormat('en-US', {
		timeZone: EASTERN,
		weekday: 'long',
		month: 'long',
		day: 'numeric',
		hour: 'numeric',
		minute: '2-digit'
	}).format(practiceStart(p));
```

Use the IANA zone `America/New_York`, never a fixed `EST` or `-05:00` offset. Maryland observes
daylight saving, so a hard-coded offset is correct for about four months of the year and an hour
wrong for the other eight. The same rule applies to the `.ics` feed in §5: emit each event with
`TZID=America/New_York` rather than floating times or UTC, or phones will render practices in the
wrong hour half the year.

### Privacy — not in the brain dump, needs a decision

`/da-band` would live on a public marketing domain. Whatever the `_redirects` catch-all serves,
the route is reachable by anyone who guesses the URL, and phase 0 has no auth. Before shipping:

- Add `<meta name="robots" content="noindex, nofollow">` for that route (or a `X-Robots-Tag`
  header via a new `netlify.toml`, which this repo doesn't have yet).
- Don't put it in [src/components/layout/nav.vue](src/components/layout/nav.vue). Unlisted.
- Assume anything on it is effectively public. That's probably fine for practice dates and song
  lists; it is **not** fine for anyone's home address, phone numbers, or pay splits. Keep those off
  the page until phase 3 auth exists.

### Verification gate

Same as the rest of the repo: `yarn type-check` and `yarn lint`. There is no test runner.
Run `yarn netlify` (not `yarn dev`) for local dev if any images are involved.

---

## 5. Phase 1 — the calendar feed (do this one)

**This is my strongest recommendation in the document and it wasn't in the brain dump.**

Generate a `.ics` calendar file at build time from `practices.ts` and `shows.ts`, serve it as a
static file, and have each member subscribe to it once from their phone (`webcal://` link, or
"Add by URL" in Apple/Google Calendar).

Why it beats everything else on the list:

- **It attacks the real problem — attention — without needing anyone to open the site.**
  Practice shows up in the calendar app that's already on their phone. Their own reminder
  settings fire. You are no longer competing for attention in a text thread.
- **One-time setup, zero ongoing effort from them.** Subscribe once; every practice you add
  from then on appears automatically. This is the only "notification" mechanism on the list with
  no per-message cost, no app install, no permission prompt, and no login.
- **It is free and needs no backend.** A Node script in the build step writes `public/band.ics`.
  The ICS format is plain text; you can hand-roll it or use `ics` from npm.
- Add a per-event `.ics` download button on show cards too — that's a small win for fans on the
  public shows page.

Caveat: subscribed calendars refresh on the client's own schedule, which can be hours (iOS in
particular is unpredictable and, on some settings, once a day). For "practice moved to Tuesday"
you still need a text. For "practice is where it's always been, three weeks from now," this is
perfect.

---

## 6. Phase 2 — availability, the poll workflow

This section replaces "everyone maintains a calendar," which was never going to happen. It's
built on the one thing that demonstrably worked.

### What worked before, and why

Someone sent a link. It opened a web page. Every date across roughly a six-week window was
listed. Yes or no on each. Submit. **Everyone answered.**

Why it beat the group text, feature by feature:

- **One screen, one deadline, one kind of decision.** No composing a reply, no reasoning about
  anyone else's schedule, no thread to catch up on first.
- **It was a batch.** Answering cost five minutes once, not thirty seconds a week forever.
- **The state was legible.** You could see who had answered, which is its own social pressure.

Reproduce those three properties and the tool barely matters. Violate any one of them and you're
back in the text thread.

### Designing the ask

- **One question, not forty-two.** List every candidate date as checkboxes inside a *single*
  question: "Check every night you could practice." On a phone that's one scroll and a run of
  taps. Forty-two separate yes/no questions carry the same information and get a completely
  different completion rate.
- **Keep the question that worked: "could you practice?"** — not "are you free?" A night being
  empty on someone's calendar is not the same as their being willing to spend it in a basement.
  The unchecked days give you the busy-calendar view for free, as the inverse.
- **Weeknights only, if that's the reality.** Don't list slots nobody would ever take.
- **State a deadline in the ask.** "By Sunday" is the cheapest item on this list and the original
  poll almost certainly had one.
- **Six weeks out, refreshed every six weeks.** Longer and the answers are fiction; shorter and
  you're asking too often and burning the goodwill that makes it work.

### Which tool

Ranked by how fast you can send round one. **Verify current free-tier terms before committing to
any of these — I'm going from memory and they change.**

- **Google Forms → Google Sheet *(recommended for round one)*.** Free, you already live in Google,
  and a "Checkboxes" question with one option per date is exactly the shape described above.
  Responses land in a Sheet that has a real API and that you can also just eyeball. Zero
  engineering to send it. Parsing the Sheet into a TS file is a twenty-line script, or a
  copy-paste the first time through.
- **Our own poll page, as a Netlify form.** The site already carries a Netlify form for contact
  (the hidden stub in `index.html`), so the pattern exists in this repo. Full control of the UX,
  matches the band's look, and submissions are readable through the Netlify API in a build step.
  **Do this second**, after a Google Forms round proves people still respond. Building it first
  means finding out the hard way.
- **When2meet / Rallly / Doodle.** Purpose-built for exactly this, and the grid UI is nicer than
  anything you'd build. The catch is getting the data back out: When2meet has no official API (the
  responses are embedded in the page's JavaScript, so reading them means scraping something that
  can change without notice), Doodle's API has moved behind paid tiers, and Rallly is open-source
  but self-hosting it means running a server. Worth it if you're happy retyping the result.

### You have already built this once, on paper

`LFG Songs.xlsx` contains a `Practice Scheduling` tab: one column per member (Anna, Franny, Fives,
Hermes, Colin), rows alternating a weekend block (`10/27-10/29`, `11/3-11/5`, …) with a
`Weeknights` row for the same week, and free-text cells like `Kyle Busy 10/27`, `Anna Busy Sun`,
`Out of town 11-6/11-10`, `Available 11/18`.

What's worth taking from it is the **diagnosis, not the layout.** That tab is how this got managed
by hand, and the new version gets its own pattern — but it does tell you precisely why the manual
version ran out of road:

1. **Free text is why it stopped carrying the load.** `Anna Busy Sun` can be read by a human and
   computed by nothing. You cannot derive "dates everyone can do" from prose. The poll's entire job
   is to return that same information as structured dates — that one difference is the whole
   feature.
2. **The window is about right.** Six weeks of lookahead in weeknight-and-weekend chunks is roughly
   what the manual grid tracked, which is decent evidence for the poll's cadence. Evidence, not a
   template.

**The strategy:** the collection tool is disposable, the *data model* is not. Whatever gathers the
responses, they land in the same `availability.ts` shape and the page is built against that.
That's also what lets manual entry, a Google Form, and a future in-site poll coexist without a
rewrite.

### The payoff

Two views out of one dataset:

1. **"Dates everyone can do."** The dates where all five said yes, soonest first, pinned to the
   top of the section. *This is the feature.* It's what ends the circular conversation — nobody
   proposes a dead date when the live ones are listed three inches above. Show near-misses too
   ("Oct 14 — everyone but Francesco"), because four out of five is often good enough and that's a
   call the band should get to make with the information in front of them.
2. **The busy-days strip.** Who's out, when, as a standing visual reference — the thing you
   actually asked for. Derived from the same responses, no extra collection.

### Data model

```ts
export type AvailabilitySource = 'poll' | 'manual' | 'assumed';

export interface AvailabilityRound {
	id: number;
	/** When the ask went out. Availability decays; the page should show how stale this is. */
	collectedOn: string;
	/** Inclusive ISO date bounds of the window this round covers. */
	windowStart: string;
	windowEnd: string;
	responses: AvailabilityResponse[];
}

export interface AvailabilityResponse {
	memberId: number;
	/** ISO dates this member said they could practice. Not in the list = cannot. */
	canPractice: string[];
	source: AvailabilitySource;
	/** Null until they answer, so the UI can show who is outstanding. */
	respondedOn: string | null;
}
```

Two things in that shape matter more than they look:

- **`respondedOn: null` is not the same as "said no."** A member who hasn't answered must render
  as *unknown*, never as unavailable — otherwise the page silently invents conflicts, and a
  planning tool that invents conflicts is one nobody trusts twice. This is the fastest way to kill
  the feature.
- **`source` earns its place.** "Francesco told me" and "Colin assumed" look identical in a shaded
  calendar cell and are worth very different amounts. Render them differently.

### On the every-six-weeks chore

Sending the next round is exactly the kind of recurring, easy-to-forget task worth automating
rather than remembering. Two options, both outside this repo:

- A **scheduled Claude agent** — the `/schedule` skill in Claude Code, or a scheduled task in the
  Desktop app — that fires every five weeks and reminds you, or, once phase 3 exists, drafts the
  next round against current data.
- A plain recurring calendar event. Free, and honestly fine.

Don't build automation for this into the site. It's a personal reminder, not a site feature.

---

## 7. Phase 3 — auth and writes

**Planned November 9, 2026. The buildable plan is
[`2026-11-da-band-auth-plan.md`](2026-11-da-band-auth-plan.md).** This section keeps the reasoning;
the plan holds the contracts. The options survey that used to be here was rewritten because one of
its premises was stale.

**Requirement, per §0:** five individual accounts. Person A logs in as person A and cannot act as
person B — not by accident, not by goofing around. A shared secret gives you a *claim* of identity,
not a verified one, and the whole point of availability is that "Francesco said he's out on the
14th" has to actually mean Francesco said it.

### Correction: Netlify Identity is not deprecated

The earlier version of this section said Identity was in maintenance mode and not to start there.
That was true for a year and isn't now. Netlify announced its deprecation on February 28, 2025, then
reversed it on February 19, 2026. Netlify's current "Use Identity in functions" docs document it as a
supported product, and the Netlify forum points new projects at `@netlify/identity` rather than the
older `netlify-identity-widget`. One Netlify billing page still shows the old deprecation banner, so
re-check the Identity overview page before building.

What matters from the current docs: `getUser()` from `@netlify/identity` works only in modern
`export default` functions (not Lambda-style `export { handler }`), reads the `nf_jwt` session
cookie, and exposes `app_metadata.roles`. Registration can be set to **Invite only**, which also
applies to Google sign-in. Magic links aren't part of `@netlify/identity`.

### What was chosen

- **Netlify Identity, invite-only, signing in with Google.** No second vendor, no token verification
  to write, no password reset path to own. Clerk (now with an official `@clerk/vue` SDK) remains the
  fallback if Identity's status changes again.
- **Netlify Functions for the API, Netlify Database for storage** (changed from Blobs on November 10, 2026). Netlify Database is Netlify's managed Postgres, running on Neon underneath, and it's available on the credit-based Free plan:
  - 48 compute units a month
  - sleeps after 5 idle minutes
  - 5 GB of storage
  Blobs would have worked for availability alone. But the band's data is relational (members, practices, shows, availability, and later songs and set lists). A table with a `(member_id, day)` primary key replaces the hand-written merge and concurrency code Blobs needed. Migrations live in `netlify/database/migrations/`, and Netlify applies them on deploy. Only the schema is in the repo, never the data.
- **Logins map to members through Identity `app_metadata`** (`{ member: 'nick', roles: ['member'] }`,
  `admin` for Colin). Emails stay in Identity and never enter this public repo.
- **Every auth check sits behind one `getCurrentMember(request)` helper,** with `requireAdmin` beside
  it (§10). Swapping the identity provider is a change to one file.
- **Every write records which member made it and when,** per day, with a `source` of `self`, `poll`,
  `manual` or `assumed`. A member's own entry (`self`) is never overwritten by a poll import.
- **The whole `/da-band` area sits behind the login.** Practices stay static TS in the repo, so the
  page gate hides them from the website, not from GitHub; Colin accepted that. Availability lives
  only in the database and is served only to signed-in members.
- **Poll results and gig weekends** are loaded into the database by a local seed script from a gitignored
  file, so nobody's schedule lands on GitHub. This replaces §3's "parsed into a static data file"
  for phase 2.

### Rejected

- **Roll your own passwords:** small code, large surface (sessions, rate limiting, resets).
- **Supabase:** free projects pause after about a week idle, a bad fit for a site visited in bursts.
- **Render plus a real server:** a second deployment target for one page.

### Note on "should the MVP data be JSON?"

You asked to mark this for later. Here's the short version: for phase 0, **keep it as annotated
TypeScript**, not JSON. The annotation is what makes `yarn type-check` catch a missing field on
a new practice — a `.json` import gives you none of that, and CLAUDE.md already calls out this
exact trap for `shows.ts`. When phase 3 lands and records are written at runtime, they become
JSON blobs in the datastore *and* you write a TS type for them — you get both. There's no step
in between where plain JSON files in the repo are the right answer.

---

## 8. Phase 4 — set-list planning

### The time math

Inputs: stage time in half-hour increments (1.5–4h), number of set breaks (0–2), break length
(10–15 min), pad (5 min).

```
stageMinutes   = hours * 60
breakMinutes   = breaks * breakLength
playMinutes    = stageMinutes - breakMinutes
targetMinutes  = playMinutes + pad
```

**The part that's easy to get wrong:** a 3:30 song does not consume 3:30 of stage time. Banter,
tuning changes and changeover all eat the clock. But you don't have to estimate the overhead,
because your own logs already contain it.

### You are not blocked on song durations

The first draft of this doc called missing song durations the blocker for time math. After reading
`LFG Songs.xlsx` (§14), that's wrong twice over:

1. **You already plan by song count, and it works.** The set-list tabs record real sets as
   "N songs, ~X mins, start–end" — `Set 1: 12 songs, ~45 mins, 9:30-10:15`,
   `Set 2: 15, ~1.25hr, 10:30-11:45`, `Set 1: ~1:55hr, 9:00-10:55`. The implied rate sits between
   about 3.5 and 5 minutes per song, clustering near 4. A builder that starts from
   **~4 minutes per song, adjustable** is useful immediately and needs no new data at all.
2. **Durations already exist for some songs.** The sound-check/encore tab carries a
   `Duration (min)` column in decimal minutes (3.5, 3, 2.5, 4). The habit is established; it just
   was never applied to the whole catalogue.

One honest caveat: the logged counts and times **don't fully reconcile.** Pickles 5-2025 records
`Set 2: 15, ~1:45hr`, which works out to seven minutes a song and is far out of line with
everything else. Either a count or a time in there is stale. Worth five minutes in the real file
before treating any of these as calibration.

**Recommendation:** make duration optional on the song model, default to a band-wide
`minutesPerSong`, and let real durations override it as they get filled in. Don't block the
builder on a data-entry project.

### How to model song length

Agreed that a data scrub is worth doing to seed recorded lengths. Two things shape the model:

- **The recorded version is a ballpark, not the truth.** You play extended intros, bridges and
  outros, so some of your arrangements run materially longer than the track does.
- **Granularity stops at the half minute.** Nobody is planning a set to 26 seconds, and pretending
  to that precision makes the data annoying to enter and falsely authoritative to read.

```ts
export interface SongTiming {
	/** The recorded version, in minutes, to the nearest half. Seeded from a metadata scrub. */
	recordedMinutes: number;
	/** True where the band's arrangement runs long — extended intro, bridge, outro. */
	extended?: boolean;
	/** Minutes added on top when extended. Half-minute steps. Defaults to 1 if extended. */
	extraMinutes?: number;
}

export const playedMinutes = (t: SongTiming) =>
	t.recordedMinutes + (t.extended ? t.extraMinutes ?? 1 : 0);
```

Every number in here is minutes in `0.5` steps — `3`, `3.5`, `4`. Validate that on the way in, or
somebody will type `3.75` and the display gets ugly for no benefit. The `extended` boolean earns
its place beyond the math: it's a label the band already thinks in ("we do the long version of
this one"), useful on a set list even where the extra minute doesn't change the plan.

**What the scrub can and cannot get you.** Recorded length, yes. Key and tuning, **no** — you
don't play these in the tunings they were recorded in, you've worked out your own. That's
band-specific knowledge that exists in exactly one place: the workbook's `Tuning` column and
people's heads. Any import script should seed durations automatically and leave tuning to be
carried over by hand, because a scraped tuning would be confidently wrong.

### What the song model actually needs

The repo's catalogue is thin — `BandListing` is `{ id, bandName, songs: string[] }`, just titles.
The workbook is worth mining for *which attributes turned out to matter* over four years of
planning by hand. Take the vocabulary, not the structure — this is a list of things the new model
should be able to express, not a schema to port:

| Workbook column | What it does for the builder |
| --- | --- |
| `Vox` / `Singer` — `A`, `H`, `K`, `BOTH` | Vocal load balancing. The set-list tabs already tally `A: 13, H: 10, Combo: 2`. |
| `Show Ready?` — `yes`, `pretty much` | The readiness flag this doc proposed, already in use. |
| `Tuning` — `Drop D`, `Half-step Down`, `Drop C#`, `Drop D (Kyle E)` | **The big one.** See below. |
| `Key` — `E`, `D`, `Gb`, `B` | Transitions; the workbook literally notes "same key smooth transition". |
| `BPM` | Energy pacing across a set. |
| `Starts With` — `HH`, `Guitar`, `Everyone`, `Snare rolls`, `Bass slide on 4` | How the song kicks off. Matters for what can follow what. |
| `Talk?` — `x` | Marks songs where banter happens. That's real stage time the math should count. |
| `Followed By` | Named segue partners (`The Middle` → `Killin in the Name`). |
| `Vibe` — `Hot Energetic`, `Chillin Cruisin`, `Angry Heavy Loud` | Set dynamics. |
| `Decade` — `1990s`, `2000s` | Already wanted for public song filtering in the other planning doc. |
| `Other Notes` | Free text, and where the opinions hide — *"Hermes isn't a big fan of this one."* |

**Tuning runs are the constraint you're really solving for** — confirmed. In the Molloys 4-4-25
list, positions 31–33 are all Drop D and 26–27 are both Drop C#. That ordering is not an accident;
every tuning change is dead air on stage. A builder that did nothing except **flag tuning changes
and offer to cluster the runs** would earn its keep before any other feature ships. That's the
highest-value automation in the whole set-list idea, and it came out of reading the file rather
than from the brief.

Tuning is also **first-class, required data on every song**, not an optional note. You don't play
these songs in their recorded tunings — the band worked out its own — so this can't be derived,
imported or inferred from anywhere. It has to be carried over deliberately and then maintained.

**On "the singer doesn't want to sing this anymore":** right now that's the `Other Notes` column
doing a job it's bad at. Promote it to structured state — `active` / `cold` / `retired` / `vetoed`,
with an optional note on who vetoed and why — so retired songs drop out of the picker instead of
being remembered by whoever happens to remember. That is precisely the class of decision that
currently lives in somebody's head and resurfaces as a text message.

`BandListing` would have to grow from `songs: string[]` into `songs: Song[]`, which touches
[src/components/songs/songs-container.vue](src/components/songs/songs-container.vue) and
[src/components/songs/song-card.vue](src/components/songs/song-card.vue). Note the existing
invariant while you're in there: `songs-container.vue` **sorts the nested arrays in place**,
mutating the imported module, so anything new reading it sees sorted data. Worth fixing to a
non-mutating sort.

### Cold songs and venue history — the pattern is proven, the structure isn't the answer

The `Songs by Show` tab is a matrix: one row per song, one column per show (`2023-03-31 8x10`,
`2024-9-21 Pickles`, `2025-08-23 Pickles`, `2026-03-16 Molloys`, …), an `x` where it was played,
plus `cut`, `added` and `add?` annotations, with per-show totals across the bottom (27, 19, 32,
28, 47, 33, 15, 39, 54, 54, 48, 51, 32, 30).

That one table is the source for this entire feature area, for free:

- **Cold songs** — count shows since the last `x`. "Haven't played this in four shows" is a
  subtraction, not a new data model. This is the keeping-set-lists-fresh mechanic you described.
- **Last played at this venue** — filter the columns by venue. You play Pickles and Molloys
  repeatedly, so "what we ran the last two times at Pickles" is a column lookup.
- **Rotation health** — songs with an `x` in every column are what a returning crowd has heard
  every single time. Worth surfacing.
- **`cut` and `added` are decisions**, already recorded per show. That's the §4 decisions log,
  retroactively, for every show you've ever played.

What this buys the estimate isn't a UI over that grid — you don't want the grid, you want a
better planning pattern. What it buys is **confidence about which derived views are worth
building**, because these are the questions four years of manual planning kept asking. Build the
answers natively; use the matrix to seed history and to check that the new views produce the same
conclusions you'd have reached by hand.

### Set-list structure

```ts
export interface SetList {
	id: number;
	gigId: number;
	sets: SetSegment[];
	/** Held back for an encore — the workbook tracks these separately, so the model should too. */
	encore?: string[];
	/** Planning constant; ~4 based on the band's own logs. Overridden by real song durations. */
	minutesPerSong: number;
	spotifyPlaylistUrl?: string;
	notes?: string[];
}

export interface SetSegment {
	label: string;
	/** Ordered song ids. */
	songs: string[];
	/** 'HH:MM' local — the workbook already logs each set's wall clock this way. */
	startTime?: string;
	endTime?: string;
}
```

Three things the UI should show live while you drag songs around, all lifted from how the
workbook is already used: **the vocal split** (`A: 13, H: 10, Combo: 2`), **the tuning changes**,
and **the running clock per set**. Opener and closer are the two slots that matter most; make
them visually distinct.

### Spotify

Keep this simple and free: **embed, don't integrate.** A Spotify playlist embed is an `<iframe>`
with a public playlist URL — no OAuth, no API key, no rate limits, works for anyone with the
link. Store `spotifyPlaylistUrl` on the set list and on each practice, render the embed, done.
Your existing library of old set-list playlists can be linked in immediately at zero cost.

Full Web API integration (creating playlists programmatically from a set list) needs per-user
OAuth and a token refresh story. It's a *nice* phase-5 flourish; it is not worth blocking
anything on. Track IDs per song would be a nice addition to the song data if you're already
running a metadata-fetch script.

---

## 9. Phase 5 — notifications, honestly

You named the real problem: people don't reply. Ranked by value per unit of effort:

1. **The calendar feed (§5).** Best answer. Free, no permissions, no install, uses alerting they
   already trust. Do this first and reassess whether you still need anything else.
2. **A generated "paste this into the group text" block.** Genuinely underrated: a button on
   `/da-band` that copies a formatted summary — next practice, songs to prep, link — to your
   clipboard. You still send the text, because that's where they actually are, but composing it
   takes one tap and it's always accurate. This meets them where they are instead of demanding
   they move.
3. **SMS via Twilio.** Lands in the one channel that reliably gets read. Costs real money but
   very little of it — order of a dollar a month for the phone number plus well under a cent per
   message; at your volume, call it $1–3/month. **Verify current pricing.** Also note A2P 10DLC
   registration is now required for US application-to-person SMS, which is paperwork.
4. **Email digest.** Netlify scheduled function plus a transactional email provider on a free
   tier. Cheap and easy — but your own experience says email didn't cut through last summer, so
   don't expect much.
5. **Web push.** Free and technically elegant, and I'd skip it. On iOS, web push requires the
   site be **installed to the home screen as a PWA first** (iOS 16.4+), and then the user grants
   notification permission. That's two acts of setup from people who won't answer a text. The
   calendar subscription is one act of setup and produces better alerts.

---

## 10. Phase 6 — the admin tier, and dictating the update instead of typing it

Added September 23, 2026 from a second brain dump. **Nothing here is decided.** It sits on top of
§7's auth work and is the furthest-out thing in this doc — but one version of it is buildable the
week after phase 0, for free, and that's the version to read first.

The ask, in Colin's words: he's the admin, with a privilege level above the other four. The thing
he wants that privilege *for* is a dictate mode in the Lies From Granny UI — hit a button on his
phone after practice, talk for a minute ("added song X and song Y to the list for the next show,
took these two off, update everything"), and have an agent on the other end turn that into the
actual assets the site needs.

### Reframing — this is two features, and only one of them is expensive

**Capture** is getting the spoken note into text somewhere durable. **Interpretation** is turning
that text into edits to `songs.ts`, a practice entry, and the decisions log.

They're worth separating because capture is nearly free, works on its own, and fixes the real
problem. The reason the decisions log in phase 0 might not get written isn't that typing five
entries is hard — it's the friction of doing it at 10pm in a parking lot with an amp in the other
hand. Capture removes exactly that friction. Interpretation only saves the two minutes of typing
that follow, at Colin's desk, where typing was never the bottleneck.

So: build capture first, live with it, and add interpretation when the manual step starts to grate.
Building them as one feature is how this becomes a six-week project that never ships.

### Authorization — what "admin" actually means here

§0 locks in five individual accounts, all equal. This adds a tier on top:

- Add `role: 'member' | 'admin'` to the member model **when §7 lands, even if nothing reads it
  yet.** It's one field now and an identity migration later. Colin is `admin`; whether anyone else
  is, is an open question below.
- Enforce it **server-side**, in the same `getCurrentMember(request)` helper §7 describes — add a
  `requireAdmin(request)` beside it. Hiding the dictate button in the UI is cosmetic; the function
  that accepts a note has to be the thing that says no.
- §7's rule — *every write records which member made it and when* — matters more here, not less.
  An agent with commit access is a privileged actor, and the note that triggered it should be
  stored verbatim alongside whatever it produced. When a song shows up in the set list that nobody
  remembers agreeing to, the answer is "here's the recording of you adding it."

One honest note on scope: the moment the site can accept a voice note that mutates the repo, the
threat model stops being "someone goofs around with Francesco's availability" and starts being
"an unauthenticated POST rewrites the site." That's not a reason to skip it. It's the reason this
phase is strictly after §7, and the reason Option A below — which has no endpoint at all — is
genuinely attractive rather than a consolation prize.

### Capture — the cheap version is already in his pocket

**Do this: a `<textarea>` on an admin-only page, and the microphone key on the iOS keyboard.**

That's dictate mode. Zero new code beyond the textarea, no API key, no permission prompt he hasn't
already granted, no audio leaving the phone. It is the simplest thing that is both safe and
effective, and it produces the same text a fancier pipeline would.

The two upgrades, and why neither is the starting point:

- **Web Speech API (`SpeechRecognition`) in the browser.** Still vendor-prefixed, historically
  flaky in Safari, and it buys nothing over the keyboard mic on iOS. **Verify current Safari
  support before believing any of this** — it's changed before.
- **Record audio, upload it, transcribe server-side (Whisper-class).** Better accuracy on band
  jargon and song titles, and one real advantage the textarea can't match: he can talk without
  looking at the screen, mid-teardown, and deal with it later. Costs an upload path, a stored
  audio blob, an API key and a small bill. Worth it only if the textarea proves annoying in
  practice, and by then he'll know exactly what it needs to get right.

Either way, **the raw note gets saved as its own record** before anything interprets it. A year of
practice notes is plausibly worth more than the edits derived from them.

### Interpretation — where the agent runs, cheapest first

**Option A — no server at all; the prompt is the product.** *(Start here.)*
The admin page takes the dictated note, bundles it with the current state the agent would need —
the song catalog, the next few practices, the next show — and hands back a single formatted prompt,
copied to the clipboard. Colin pastes it into Claude Code at his desk, which already has repo
access, `yarn type-check`, `yarn lint`, and a human reading the diff.

No infrastructure, no key, no endpoint, no new auth surface, nothing to pay for, and it works the
week after phase 0 ships. It's the same trick §9 already recommends for the group text — compose
it automatically, send it manually — and it's underrated for the same reason.

**Option B — an agent inside the site (Claude Agent SDK in a Netlify Function).**
The note POSTs to a function; the function runs an agent loop with a narrow tool surface and opens
a pull request through the GitHub API. Flags before building it:

- It cannot be request/response. An agent run plus a build is far longer than a page load. Netlify
  sync functions cap around 10 seconds and background functions much longer — **verify both current
  limits.** The shape is: POST returns immediately with a job id, the job writes status to Blobs,
  the page polls.
- The `ANTHROPIC_API_KEY` and a GitHub token live in Netlify env vars, server-side only. Neither
  ever reaches the client bundle.
- Real but small cost per run. A note this size is cents, not dollars.

**Option C — the agent runs in GitHub Actions.**
The site does nothing but dispatch a workflow with the note as its input; the Action holds the
secrets, runs the agent, and opens the PR. Less bespoke server code, better logs, and the run
isn't wedged into a serverless timeout. There's a first-party Claude Code GitHub Action worth
looking at rather than wiring this by hand. **Check whether this repo is public or private first**
— it decides how Actions minutes are billed.

**What I'd actually do:** A until it annoys him, then C. B only if the whole loop living inside
liesfromgranny.com is the point — which, given "in the Lies From Granny UI" was how he described
it, it might be. If so, note that Option C still satisfies that: the UI is the trigger either way,
and only the runner moves.

### The output is a pull request. Never a push to `main`.

This is the load-bearing constraint of the whole phase.

The agent would be editing `shows.ts` and `songs.ts` — annotated arrays whose whole safety story is
that `yarn type-check` validates each entry — and it'd be doing it next to the cross-file invariants
CLAUDE.md already warns about: the hand-duplicated hero preload, the date strings that must stay
`new Date()`-parseable or a show silently vanishes, the `v-html` in `gig.text`. That is precisely
the class of thing an agent breaks quietly and confidently.

So: branch, PR, Netlify deploy preview, and — **this repo has no CI today** — a small workflow
running `yarn type-check` and `yarn build` on the PR, which is worth adding regardless of whether
this phase ever happens. Reviewing from a phone is one tap on Files Changed. A dictation that
mishears a song title should cost thirty seconds of review, not a live site nobody checked.

### What the agent needs to not be useless

The dictated note is ambiguous by design — "took these songs off" names nothing. Three things make
the difference between this working and producing garbage:

1. **Give it the current state as context.** The song catalog, the upcoming practices, the next
   show. It's static TypeScript in the repo, so this is free.
2. **Fuzzy-match names, and ask instead of inventing.** §14's name-mapping warning is the landmine:
   the band says nicknames, the catalog holds real titles, and a dictated title will match neither
   exactly. A low-confidence match must come back as a question. A duplicate song entry created
   from a misheard title is worse than a note that got rejected.
3. **Split understanding from editing.** Note → a small structured change request (*add songs X, Y
   to practice N; remove Z; log decision D*) → apply it with dumb deterministic code. Two steps
   that each fail legibly, instead of one step that produces a mystery diff. It also means the
   review surface is a paragraph of plain English — "here's what I understood you to say" —
   rather than a diff.

### The reality check

At full build-out this saves one person about five minutes a week. That math does not justify
Options B or C on its own, and pretending otherwise would be dishonest.

What justifies it is that friction is the reason the decisions log wouldn't get written at all —
and the version that removes the friction is Option A, which costs a textarea and an afternoon.
Build that one because it's cheap and it fixes something real. Build the rest because it's fun,
and say so out loud rather than dressing it up as time saved.

### Open questions

1. **Is anyone else an admin?** Nick does a fair amount of the set-list thinking. Two admins is the
   same code as one; zero-vs-one is where the model changes.
2. **Does the agent ever write live data, or only repo files?** Once §7's datastore exists, "add
   song X to the next practice" could be a row rather than a commit — no PR, no build, no review.
   Faster and much less safe. Probably: repo files stay PR-gated, datastore rows don't need to be.
3. **Is the repo public or private?** Affects Actions billing in Option C and where secrets can
   live.
4. **Keep the raw notes as an artifact?** A searchable archive of every post-practice note, audio
   or text, is arguably a better band product than any of the edits derived from it.

---

## 11. Things worth adding that weren't in the brain dump

Collected from above plus a few more:

- **Subscribable `.ics` calendar feed** — §5. The highest-value item here.
- **Decisions log / practice recaps** — directly kills "what song did we cut?"
- **One-tap date polls instead of a maintained calendar** — the realistic version of scheduling.
- **Per-song readiness status** — makes "what should I prepare" answerable.
- **"Last played at this venue"** — free once set lists are recorded.
- **Copy-to-clipboard summary for the group text** — meets them where they are.
- **`noindex` + unlisted route + a `netlify.toml`** — the repo has no `netlify.toml` today.
- **A CI workflow running `yarn type-check` and `yarn build` on PRs** — the repo has no CI at all
  today. Cheap, and it's a prerequisite for anything in §10 ever opening a pull request.
- **A dictated note that composes its own prompt** — §10's Option A. A textarea, the iOS keyboard
  mic, and a copy button. Same shape as the group-text item above, and the same reason it works.
- **A "nothing scheduled" state that's loud**, not an empty div. Absence of a practice is
  information and should read as such.
- **Everything mobile-first.** This page will be opened on a phone, standing up, in a parking
  lot, ten minutes before someone needs the answer. Design for that and nothing else.
- **A stable shareable link per practice** (`/da-band#practice-31`) so you can text a deep link
  to the exact thing being asked about.
- **Consider whether a standing weekly slot removes half of this.** If practice were "Mondays
  at 7, unless cancelled," the scheduling problem mostly evaporates and the page's job shrinks to
  exceptions and set lists. That's a band conversation, not a code change, but it's the cheapest
  possible fix and worth raising before building a scheduling system.

---

## 12. Open questions

**Nothing here blocks starting.** The auth question, the availability-in-MVP question, the roster,
and the phone platform were all settled on September 23 and are recorded in §0.

Decide these during implementation:

1. **Where does practice usually happen?** One fixed location, or does it move? Determines whether
   `location` is a free string or a small enum.
2. **How far ahead do practices typically get scheduled?** Drives whether the availability view is
   14 days, 30 days, or the full six-week poll window. The workbook's `Practice Scheduling` tab
   suggests roughly three weeks of lookahead, in weekend-plus-weeknights blocks — worth confirming
   that's still how it works.
3. **Do you want past practices browsable, or does the decisions log cover it?** Archive UI is real
   work; the log may be enough.
4. **What did the poll that worked actually run on?** If you can dig up that link or thread, the
   tool is worth identifying — matching a format people already responded to beats picking a new
   one on the merits. If it's lost, §6's recommendation stands on its own.
5. **Is the `Pickles 5-2025` set timing a typo?** `Set 2: 15, ~1:45hr` doesn't reconcile with the
   other logged sets (§8). Affects whether the ~4 min/song constant is trustworthy.
6. **How much of §14 do you eventually want on the site, and how much stays private?** Set lists
   and cold-song data are plausibly public and would make the shows archive genuinely interesting.
   Venue contacts and payout history are obviously not. Worth deciding before the model gets built,
   because it determines whether one data layer can serve both or you need two.

---

## 13. Suggested order

1. `members.ts` from the roster in §4, plus `practice.ts` / `practices.ts` with a couple of real
   entries. Type-check.
2. `/da-band` route, unlisted, `noindex`. Next-practice headline block. Next gig pulled from
   `shows.ts` — extract the upcoming/past filter out of `shows.vue` into a shared util first.
3. Upcoming practices list + per-practice song panel.
4. Decisions log / recaps section.
5. Ship it to the band. Send one text with the link. **Then wait two weeks and see whether it gets
   used before building anything else.**
6. **Send one poll round** (§6), in parallel with step 5. It costs an hour and it tests the human
   problem rather than the software one. Whether it comes back complete tells you more about this
   project's ceiling than anything you could build.
7. The availability strip, fed from whatever step 6 returns plus what you already know.
8. The `.ics` feed and the subscribe instructions. Send a second text.
9. Reassess. Phases 3–5 are worth building only if 0–2 got traction. If nobody opens the page and
   nobody answers the poll, the problem isn't one a better page solves, and the effort should go
   somewhere else.

Slot in any time after step 4, independent of the rest: **§10's Option A** — an admin-only textarea
that turns a dictated post-practice note into a prompt on the clipboard. It needs no auth, no
backend and no agent, and it attacks the one part of phase 0 most likely to go unwritten.

---

## 14. Appendix — what's already in `LFG Songs.xlsx`

Read September 23, 2026 from Google Drive
([file](https://drive.google.com/file/d/1e6xvsZPpdMNNSnZjvQeP7gst-wdyJ3Ly/view)), owned by Colin,
last modified September 14, 2026.

**Caveat on this appendix, read it before trusting anything below.** What I had access to was a
flattened text extraction of the workbook — roughly 100,000 characters with tab boundaries and
cell structure mostly dissolved — not the live file. I pattern-scanned the whole extraction but
only read perhaps 15% of it closely, sampling the regions around each structural marker. So:

- **The tab list is not guaranteed complete.** There may be tabs I didn't spot.
- **Column layouts are inferred** from flattened rows and may be out of order or incomplete.
- **Anything that didn't survive the export** — formulas, formatting, merged cells — was invisible.
- Several cells came through as `#REF!`, so at least one formula in the real file is already broken.

Treat this as a map of what's in there, not an inventory. Verify against the real file before
building an importer against any of it.

**How to use this appendix.** The workbook is a *reference and a seed source* — explicitly not a
source of truth, and explicitly not a pattern to reproduce. It's how things got managed manually,
and the new system gets a new planning pattern rather than a digital copy of a spreadsheet. What
it's genuinely good for:

- **Seed data.** Four years of real shows, set lists and song attributes to import once.
- **Signal about which problems are real.** Attributes that survived four years of hand-maintenance
  are attributes that matter; columns that stayed empty probably don't.
- **Catching things the brief didn't mention** — it already corrected two points this doc had wrong
  (§6 and §8).

It is not the schema. Don't port it one-for-one. Out of scope for the MVP entirely.

### Tabs identified

| Tab | What it holds |
| --- | --- |
| `All the Songs` | Master repertoire. Song Name, Artist, Vox, Show Ready?, Decade, Tuning, Starts With, Talk?, Followed By, BPM, Other Notes. |
| `Songs by Show` | The matrix — songs × 14 shows, marked `x` / `cut` / `added` / `add?`, with per-show totals. The most valuable table in the file. |
| Per-show set lists | One tab per show (`Pickles 5-2025`, `Molloys 4-4-25`, `Pickles Set List 9-21-24`, `LFG @ Porchfest`, `Pickles Ocean Calling`, `LFG FightLikeFitz 7-29-23`, `Vday - Kyle Notes`, plus copies). Order, Song, Singer, Key, Tuning, Vibe, Energy, Notes, per-set wall-clock timing, Add/Remove columns, vocal tallies. |
| `Venues` | A booking CRM. Who, Where, What Else, Contact, Point Person, Last Played, Last Contact, Initial Contact Method, Times Played, Notes — with outreach history back to 2023. |
| `Monies` | Venue / Date / Payout, back to March 2019. |
| `Practice Scheduling` | See §6 — this is the availability grid, already built, in free text. |
| Songs-to-learn wishlist | Candidate songs with per-member reactions in free text (`yesssssss`, `mehhhhh`, `over-covered IMO`). |
| `Merch Order Oct 2024` | Product, size, quantity, unit cost, total. |
| Sound check / encore options | Carries a `Duration (min)` column in decimal minutes. |

### Name mapping — a landmine for any import

The workbook uses nicknames and initials that don't match display names:

| In the workbook | Person |
| --- | --- |
| `A` | Anna |
| `H`, `Hermes` | **Nick** |
| `K`, `Fives` | **Kyle** |
| `Franny` | Francesco |
| `BOTH` / `Both` / `both` / `A/B` / `Combo` | Shared lead vocal |

Confirmed by Colin: the codes come from surnames — **Nick Herms** and **Kyle Fives** — so `H` is
Nick and `K` is Kyle. `H` is the one that will silently corrupt an import: it reads like a first
initial and isn't one. Any migration script should assert against an explicit mapping table and
fail loudly on an unrecognized code rather than guessing.

**Lead vocals are genuinely distributed**, which the model has to respect: Anna and Nick each sing
lead on a substantial share of the catalogue, some songs are shared lead (`BOTH`), and Kyle sings
lead on one or two. So lead vocal is a per-song property with a real "shared" case — not a band
role you can read off `members.ts` — and that's what makes the per-set vocal tally worth showing
while building a set.

### Things in here that are whole future features

Not proposing these. Noting that the data already exists, so the eventual model shouldn't preclude
them:

- **Venue booking pipeline** — who to contact, when you last reached out, who owns the
  relationship, what they paid. This is real recurring work that currently lives in a spreadsheet
  nobody else opens, and it's plausibly a bigger ongoing stressor than practice scheduling.
- **Payout history per venue** — informs which gigs are worth taking. Obviously stays private.
- **Song wishlist with per-member votes** — the "should we learn this" conversation, which has the
  same response-rate problem as scheduling and the same one-tap fix.
- **Merch inventory.**
- **Public show archive enrichment** — set lists attached to past shows would make the public shows
  page substantially more interesting, if you ever want that public. See open question 6.
