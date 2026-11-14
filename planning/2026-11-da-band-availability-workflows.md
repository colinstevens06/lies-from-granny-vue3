# `/da-band` availability: workflows and UI (MVP)

Written November 10, 2026, from Colin's spoken walkthrough. This doc covers the UX, the screens and the
workflows. The tech (Netlify Database, Functions, sign-in) is in `2026-11-da-band-auth-plan.md`. Where
the two disagree, "Changes the frozen plan needs" below lists each difference. Ideas that aren't MVP go in
`da-band-backlog.md`.

**The real-world target:** settle January–March 2027. That means about three practices before a March
show, while the band is working it out over text right now.

> **Update (Colin, November 10, third pass): what goes out is a *form*, not a round.** A form has a name, a
> due date and ordered **parts**: availability parts (a date range, plus optional practices to schedule and
> a target) and yes/no question parts (with optional follow-up fields on Yes). It's one to-do and one
> sign-off per member, and Sign off unlocks when every part is done. The first form is **"March show
> planning"**: availability for Jan 1–Mar 31, then "Add new songs for the March show?" (Song + Band, several
> allowed). Wherever this doc says "round", read "form" (for dates, its availability part). Questions save as
> you go inside the form, with no separate Send. Workflow G's standalone question to-do is replaced by this.
> See "Forms made of parts" below.

## The idea in one paragraph

Colin (the admin) opens an **availability round** for a date range with a due date. Every member then has
a to-do on their `/da-band` home screen. The to-do opens a form with one row per date. Each row takes
**Yes, No or Not sure**, nothing is pre-answered (except Anna's seeded pattern), and every date must be
answered before Submit works. Submitting doesn't lock anything: members can change any day later from a
calendar. Everyone sees one shared calendar, where a single "No" turns a day black. Beside it is a short
list of **possible dates**: days everyone said yes and nothing is booked.

## Answers

| Answer | Meaning | On the shared calendar |
| --- | --- | --- |
| *(none yet)* | Unanswered. Shown as "Pending" | Doesn't block a day |
| **Yes** | Can make it | Counts toward "everyone's in" |
| **No** | Can't | Turns the day black |
| **Not sure** | Can't commit yet | Doesn't turn the day black, but the day isn't a possible date either |

Nothing defaults to Yes. A day becomes a possible date only when all five answered Yes.

## Workflow A: admin opens a round

1. Colin goes to the admin page, **`/da-band/admin`** (its own route). Anyone else who goes there sees
   **"Access denied"**, with no name and no explanation of who does have access.
2. He sets a **start date**, an **end date** and a **due date**. Example: Jan 1 – Mar 31, due Sun Nov 15.
   An optional title defaults to "Jan–Mar 2027".
3. Saving creates the round for all five members. Anna's rows start pre-filled from her seeded pattern.
   Everyone else starts blank.
4. **The app can't text anyone in the MVP** (notifications are edition doc §9). Saving shows a ready-to-send
   text containing the link, with a Copy button, and Colin pastes it into the group thread.
5. Colin's round card shows who's done: "3 of 5 in · waiting on Kyle, Nick". **Copy a nudge** gives a
   one-line reminder to paste.

One round open at a time is enough for the MVP.

## Workflow B: member fills out the round

1. They sign in, and `/da-band` opens with a to-do card at the top: **"1 thing to do: Jan–Mar availability,
   due Sun Nov 15."** After the due date the card turns red and says **"Overdue by 2 days. Shame."**
2. The form is a list grouped by week, with a sticky week header. Each row reads `Fri Jan 8` followed by
   three buttons: **Yes · No · Not sure**. Weekend rows are shaded, because that's where gigs land.
3. **Every-weekday shortcut (MVP):** a strip at the top reads "Every Tue: Yes / No / Not sure" for each
   weekday. It fills only that weekday's **unanswered** rows, so it never overwrites a hand-picked answer.
   It handles "I can't do Tuesdays or Thursdays" in two taps. This is cheap, so it goes in the MVP.
4. A progress line stays visible: "64 of 90 answered · next blank: Feb 3", where the date jumps to that row.
5. Each tap saves immediately, so leaving partway loses nothing. **Submit** stays disabled until every date
   is answered. Submitting marks the member done for the round and removes the to-do.

Ninety rows is long on a phone. The weekday shortcut is what keeps it to a couple of minutes, which was
the property that made Kyle's form work.

## Workflow C: change an answer later

From the shared calendar, a member taps **Edit mine**. Their own month grid then shows their answers in
color, and tapping a day cycles it **Yes → No → Not sure → Yes**. Changes save immediately. The shared
calendar, the possible dates and Colin's round card all update.

Recommendation: after the due date, edits still work. Changing your mind should be easy, and the shame
applies only to never answering.

## Workflow D: look at the calendar and the possible dates

The main `/da-band` page, top to bottom:

1. **To-do card**, only when you have something to do.
2. **Next practice** and **Next gig** (built already).
3. **Possible dates.** Upcoming days where all five said Yes and nothing is booked, soonest first. If Colin
   has set a target, the header reads, for example, **"3 practices to schedule before the March show ·
   7 dates work"**. A **Copy list** button produces a plain-text list for the group thread: this is the
   answer to people throwing out dates that already don't work.
4. **Shared calendar.** One grid per month. **Booked** days (a practice or show) are pink, any **No** is
   black, and everything else is light. Tapping a day opens a small sheet showing each member's answer:
   "Anna Yes · Kyle Not sure · Nick Pending …".
5. **Upcoming practices** and the history link (built already).

## Workflow E: admin sets "practices still needed"

On the round card or next to the gig, Colin sets **Practices to schedule: 1–5**, optionally tied to a gig.
The number drives the possible-dates header. Each practice Colin adds before that gig counts it down.
Practices are still added in `practices.ts`, so scheduling one means Colin tells Claude, and a deploy
publishes it.

## Other ideas, sorted

**Worth the MVP:**
- The weekday shortcut (above).
- **Copy list** and **Copy nudge** buttons. With no notifications, a fast copy into the existing group
  thread is how the app reaches people.
- **"Everyone but one" in the day sheet.** The data's already there, and seeing "everyone but Francesco
  (Not sure)" tells Colin who to ask.

**Probably MVP, Colin's call:**
- An "Updated since you last looked" dot on days whose answers changed. Cheap, but it needs a per-member
  last-seen time.

Everything else is in `da-band-backlog.md`.

## Decisions (Colin, November 10, 2026)

1. **Not sure blocks a possible date.** A possible date needs five Yes answers. Not sure doesn't turn the
   calendar black, but it keeps the day off the list.
2. **Members can edit after the due date,** always.
3. **Anna's seed:** Yes on every Friday and Saturday, Yes on the Sundays in her long-weekend list, and No on
   the other Sundays. Weekdays stay blank. Her rows show as pre-filled, and she still has to finish and
   submit. A day off work isn't automatically a free night, so she confirms.
4. **Only the admin opens a round.** Members only answer. The UI never says who the admin is.
5. **No bridge form.** Build the custom flow properly, not fast. The band moves slowly enough that the
   best MVP is worth the wait. See "Timing" below.

## Screen design (decided from the prototype, Colin, November 10, 2026)

The reference is the prototype: [`prototypes/2026-11-10-da-band-availability-lab.html`](prototypes/2026-11-10-da-band-availability-lab.html),
published at https://claude.ai/artifact/MEQ8ihFb4yWm7iy4Re6uQF (private). Build from these choices, which
replace any conflicting detail in the workflows above:

- **Round form: week grid, tap to cycle.** One line per week (Sunday first), seven day cells, each showing
  the day number and its answer. A tap moves blank → Yes → No → Not sure → Yes. There's no way back to blank,
  which matches "members can't clear an answer". The prototype measured about 2 screens of scrolling for
  Jan–Mar on a phone, against about 9 for one row per date.
- **Every-weekday shortcut: behind a button.** "Fill a weekday at once…" opens a sheet with a Yes / No /
  Not sure row per weekday. It fills only unanswered days.
- **Shared calendar: color plus member dots.** Under each day number, five dots show each member's answer:
  green Yes, pink No, orange Not sure, hollow Pending.
- **Possible dates are yellow** on the calendar, as well as listed above it.
- **Edit mine: a tap cycles the answer** (Yes → No → Not sure), saving right away.
- **Admin is its own route, `/da-band/admin`.** It's where rounds are opened and dates are picked. Members who
  reach it see "Access denied". The admin's round-status card stays on the `/da-band` home page, shown only
  to the admin.

### Added November 10 (second pass)

- **Calendars page by month.** The band calendar and Edit mine each show one month, with previous and next
  buttons. They run from the current month through the end of next year. Past days are dimmed and can't be
  tapped. A month inside the open round is labeled "In the Jan–Mar round". The app opens on the current
  month.
- **Answer any future date, round or not.** Edit mine isn't limited to the round's range: book an August
  vacation now. Answers belong to days (already true in the plan), so they carry into any later round.
- **A round starts from what's already there.** The form opens with every already-answered date filled in,
  under a note: "N dates came in from your calendar. Check them, change anything that's off, then sign off."
  If every date in the range is already answered, the to-do reads **"Jan–Mar: just sign off. Nothing new to
  fill in"** and its button is **Check and sign off**.
- **"Submit" is now "Sign off"** everywhere.
- **Your to-do disappears once you sign off.**

### Workflow F: everyone's in, the admin picks dates, the round closes

1. When all five have signed off, everyone's home page shows **"Everyone's in"** with how many dates work.
   The admin's card gets a **Pick practice dates** button. Members see "Practice dates are being picked.
   They'll show up here."
2. On `/da-band/admin`, the admin sees two groups of future, unbooked dates in the round:
   - **Everyone said Yes**
   - **One short**, where exactly one person isn't a Yes, labeled with who ("no Franny"), for when four of
     five will do
3. Tapping dates picks them, and a counter reads "2 of 3 picked" against the round's target. Going over the
   target is allowed. A bottom bar lists the picks with **Lock in N**.
4. Locking in creates the practices (time TBD, Burtonsville) and **closes the round**. The round card and
   to-dos are gone.
5. The home page goes back to showing what's next: Next practice, Upcoming practices, then the **Band
   calendar**, then **Possible dates below it**. While a round is open, Possible dates stay above the
   calendar, because then they're the point.
6. Answers stay editable after the round closes, and the calendar and possible dates keep updating.
7. With no round open, `/da-band/admin` shows the new-round form. While a round is open but not everyone is
   in, it shows progress and a nudge instead. One round at a time.

### Workflow G: yes/no questions with follow-up fields

Decided by Colin on November 10. The first real one: "Add new songs for the March show?"

1. On `/da-band/admin`, under **Questions**, the admin writes a question, sets a due date, and optionally
   lists fields to ask for on Yes (here, **Song** and **Band**), with or without "let people add several".
   **Send question** puts it on everyone's to-do list.
2. Members see a to-do card ("To do · question") alongside any round to-do. **Answer** opens the question:
   big **Yes / No** buttons, and on Yes, a Song + Band row with **+ Add another song**. **Send** is disabled
   until they pick No, or Yes with at least one complete row.
3. Sending clears the to-do. They can reopen it and **Update** it until the due date.
4. The admin's card shows "4 of 5 answered · 3 yes · waiting on Hermes" and lists every song as "Song –
   Band (who)".

Answers are visible to everyone, the same as availability. Only yes/no questions are in scope: no
multiple choice and no free-form forms.

### Forms made of parts (third pass, supersedes the standalone question)

- **To-do card:** the form's name and due date, plus one line per part with its status: "45 of 90",
  "Already on your calendar ✓", "Not answered", or "Answered ✓". If the dates are already in, it reads "Your
  dates are already in. Just the question left." If everything's in, the button is **Check and sign off**.
- **The form page:** numbered parts in order. Part 1 is the week grid with "Fill a weekday at once…".
  Part 2 is the yes/no question with Song + Band rows on Yes. A sticky line reads "Dates 64/90 · Question
  ✓". The bottom bar reads "Left: 12 dates and the question" and keeps **Sign off** disabled until nothing
  is left.
- **Admin, while the form is open:** progress per member ("45/90 · ?" where ? means the question is
  unanswered), the song answers so far, Copy a nudge, and a read-only "What this form asks" list of parts.
- **Admin, with no form open:** the **form builder**. It has a name, a due date, a parts list with
  **+ Availability** and **+ Yes/no question**, a Remove link on each part, and **Send form**.
- **Part kinds in scope:** availability and yes/no (with optional follow-up fields, optionally several).
  Multiple choice and free text are backlog. A form can be all questions, all availability, or any mix.
- From Colin's November 9 text, two more yes/no questions could be added later: "Running back the jams or
  working on new ones?" and "Keep Dec 6 with four of five, or find a weeknight?" He decided the first form
  needs only the two parts above.

### Workflow H: the admin edits practices

Decided by Colin on November 10. Practice details get an admin screen in the MVP; the seed is for importing
only.

1. **`/da-band/admin/practices`** lists upcoming practices soonest first, each showing its date, time (or
   "Time TBD"), place and a status pill. Members who open it see "Access denied".
2. Tapping one opens an editor:
   - date
   - start and end time (both empty means "Time TBD")
   - location (empty means Burtonsville)
   - status: **Tentative / Scheduled / Cancelled**
   - **Songs to prepare**, a list with "+ Add a song" and Remove
   - **Recap**, one line each
   - **Save** and **Cancel**
3. **+ Add a practice** creates one that didn't come from a form.
4. Locked-in dates from a form show up here as Scheduled with Time TBD, ready for a time.
5. Saving updates the home page right away: Next practice shows the time and an open "Songs to prepare"
   list. A cancelled practice keeps the existing crossed-out look.

Scenarios:
- Given the admin sets Dec 6 to 7:00–10:00 PM, Scheduled, with one song, when they save, then the home
  page's Next practice reads "7:00 PM – 10:00 PM", has no Tentative badge, and lists the song.
- Given a member opens `/da-band/admin/practices`, then they see "Access denied".

### The admin area is a dashboard (Colin, November 10)

The admin doesn't get one screen that changes with the form's state. It gets a dashboard you click into,
built to take more tools later.

- **`/da-band/admin`**, the dashboard:
  - **Forms** has **+ New form** and a tile per form. Each tile shows the name, its parts in brief, the due
    date, a state pill ("2 of 5 signed off", "Everyone's in · pick dates", "Closed") and five
    signed-off dots.
  - Open forms are listed first, then **Past forms**.
  - **Practices** has a tile with the next practice, how many are upcoming, and how many still need a time.
  - A note says more admin tools get their own tile as they're added.
- **`/da-band/admin/forms/:id`**, one form:
  - the state, plus the action that fits it: **Copy a nudge** and **Close form** while people answer,
    **Pick practice dates** with Lock in once everyone's in, or a closed summary
  - **Responses:** one row per member with signed-off status, dates answered ("90 of 90") and their
    question answers ("Yes: Linger – The Cranberries")
  - **What this form asks:** its parts, read-only
- **`/da-band/admin/forms/new`** is the form builder. **`/da-band/admin/practices`** is Workflow H.
- Every admin page has a **← Admin** link back to the dashboard. The admin reaches the dashboard from an
  **Admin** link in the site header, shown only to the admin. Members get "Access denied" on every
  `/da-band/admin` path.
- The home page's "Pick practice dates" button opens the form's page directly.

### Forms are custom, built in code (Colin, November 10). No form builder

Colin is both the developer and the admin. **There is no form-creation tool.** Each form is built for its
purpose, in code, the way any feature is: its own screen, and its own tables when it needs to track
something new. "March show planning" is the first. The pieces that repeat (the availability week grid, a
yes/no with follow-up rows, sign-off, to-do cards, the admin responses page) are reusable components, not
a builder.

- **Remove:** the "+ New form" button, the `/da-band/admin/forms/new` builder, and Workflow G's "admin writes
  a question" step. A form goes out when its code is deployed (its migration or seed creates the form row,
  with a due date).
- **Keep:** the dashboard listing forms, each form's page (responses, Copy a nudge, Close form, Pick
  practice dates, Lock in), to-do cards, sign-off, prefill, and "just sign off".
- **Adding a form later** becomes a repeatable developer task, written down as a runbook skill: define the
  form, add tables if needed, build its screen from the shared pieces, and decide what "done" means for
  sign-off.

### Several forms can be open at once (Colin, November 10)

- Any number of forms can be open, but **only one open form may have an availability part** at a time. A
  quick questions-only form (for example, "Keep Dec 6 with four of five, or find a weeknight?") can go out
  while March show planning is still open. Picking practice dates stays tied to a single form.
- **Members** get one to-do card per open form they haven't signed off, in the order they were sent.
- **The admin dashboard** lists every open form as its own tile, then Past forms.
- Only one open form can ask for availability, so a new form with dates waits until the current one closes.
- The "N practices to schedule" header and "Possible dates" target come from the one open form that has an
  availability part.

### Round targets that aren't booked yet

Decided by Colin on November 10: a round can name its target with **an optional free-text label** ("the
March show"), and optionally a date, instead of a booked gig. Nothing unbooked goes into `shows.ts`, which
feeds the public shows page. A booked show can still be linked by its id.

**This needs practices in the database.** Locking in dates from the app means practices can't live only in
`practices.ts`. That was the backlog item "Schedule from a possible date", and it's now MVP.

### Scenarios from the prototype

- Given a member with a blank round, when they tap a day cell three times, then it shows Yes, then No, then
  Not sure.
- Given a member with every Tuesday blank, when they open "Fill a weekday at once…" and tap Tue → No, then
  every Tuesday in the range shows No, and answered days are unchanged.
- Given a member with 1 date unanswered, then Submit is disabled and the bar reads "1 date left".
- Given every date answered, when they tap Submit, then the to-do card disappears and the admin's card
  counts them in.
- Given the due date has passed and a member hasn't submitted, then their to-do card is pink and reads
  "Overdue by N days. Shame."
- Given a day where one member said No, then the calendar shows it black, with that member's dot pink.
- Given a day where all five said Yes and nothing is booked, then it's yellow and appears under Possible
  dates.
- Given a day where four said Yes and one hasn't answered, when anyone taps it, then the sheet reads
  "Everyone but {name} (Pending)".
- Given a member (not the admin), when they open `/da-band/admin`, then they see "Access denied".
- Given the admin, when they open a round, then they see a ready-to-send text with a Copy button.
- Given a member who marked Aug 7–15 as No before any round covered August, when a round for Jul–Sep
  opens, then those days show No in the form, and the note counts them as already on their calendar.
- Given a member who already answered every date in a new round, then their to-do reads "just sign off",
  and one tap on Sign off clears it.
- Given all five have signed off, then everyone sees "Everyone's in", and only the admin sees Pick practice
  dates.
- Given the admin has picked three dates, when they tap Lock in 3, then the round is gone, the three dates
  are pink on the calendar and listed under Upcoming practices, and Possible dates sits below the calendar.
- Given no round is open, then the home page has no to-do or round card.
- Given someone pages the band calendar, then it moves one month at a time and stops at the last month.
- Given an open question a member hasn't answered, then their home page shows it as a to-do with Answer.
- Given a member picks Yes and fills only the Song, then Send stays disabled until Band is filled too.
- Given a member sends Yes with two songs, then the admin's question card lists both under their name, and
  the member's to-do is gone.
- Given a member answers No, then nothing more is asked and Send is enabled.

**What the design needs from the data:** per day and member, the answer (or none); per round, the range,
due date, practices needed, gig, and each member's submitted time; per member, the short name for dots and
sheets. All of this is already in the frozen plan's tables.

## Changes the frozen plan needs

The auth plan was frozen before this walkthrough. These are schema changes for that session to make
before anything is built:

- **Three answers, not a boolean.** `available: boolean` becomes `answer: 'yes' | 'no' | 'maybe'`.
  Unanswered stays "no row". The calendar rule changes from "any `available: false`" to "any `no`".
- **Rounds are new.** A `rounds` table holds `id, title, start_day, end_day, due_day, practices_needed?,
  gig_id?, created_at`. A `round_members` table holds `round_id, member_id, submitted_at?`. Admin-only
  create. "Submit" sets `submitted_at` and is refused while any day in range is unanswered.
- **Bulk weekday fill** fits the existing PATCH (up to 400 changes), so it's client-side only.
- **The planning calendar (plan phase 3) and entry UI (plan phase 4)** become workflows C and D. The entry
  UI is now a round form plus an edit-mine calendar, not free-form tapping.
- **The poll import** (`seed:band` with `window`) is still useful for Anna's seed and for a Google Form
  bridge, mapped to the three answers.

## Timing

This is several build sessions: the database and functions, sign-in for five people (each needs an
invite and a Google sign-in), then the form and calendar. It won't be ready by Sunday, Nov 15.

**Decided (Colin, November 10): wait for the custom form.** No Google Form goes out.
`2027-jan-feb-availability-poll.md` is superseded. The Jan–Mar round becomes the app's first real round,
and its due date gets set when the round opens. Speed now depends on reaching the round form quickly. The
shortest path is: settle the decisions above, update the frozen plan, build sign-in and the database,
then the round form, then the calendar.
