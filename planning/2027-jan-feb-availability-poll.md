# Jan–Feb 2027 availability poll

Round one of the poll in `2026-da-band-edition.md` §6. Built as a Google Form, sent November 10, 2026,
due **Sunday, November 15**. The Drive connector can't create Forms, so this is the copy to paste in
by hand. About 10 minutes.

## Build the form

Go to [forms.new](https://forms.new) while signed in to your Google account.

**Title:** `Lies From Granny: Jan & Feb practice dates`

**Description:**

> Check every date you could practice in January and February. Two minutes, tops. Please answer by
> **Sunday, Nov 15**. You can come back and edit your answers later.

### Question 1: Who are you?

- Type: **Multiple choice**. Turn on **Required**.
- Options: `Anna`, `Kyle`, `Nick`, `Francesco`, `Colin`

A fixed list instead of a typed name, so every answer maps cleanly to one person.

### Question 2: Which January dates could you practice?

- Type: **Checkboxes**. Leave **Required** off, because checking nothing is a real answer.
- Paste the whole list below into the first option field. Google Forms should split a multi-line paste
  into one option per line. If it puts everything in one option, paste a week at a time instead.

```
Fri, Jan 1
Sat, Jan 2
Sun, Jan 3
Mon, Jan 4
Tue, Jan 5
Wed, Jan 6
Thu, Jan 7
Fri, Jan 8
Sat, Jan 9
Sun, Jan 10
Mon, Jan 11
Tue, Jan 12
Wed, Jan 13
Thu, Jan 14
Fri, Jan 15
Sat, Jan 16
Sun, Jan 17
Mon, Jan 18
Tue, Jan 19
Wed, Jan 20
Thu, Jan 21
Fri, Jan 22
Sat, Jan 23
Sun, Jan 24
Mon, Jan 25
Tue, Jan 26
Wed, Jan 27
Thu, Jan 28
Fri, Jan 29
Sat, Jan 30
Sun, Jan 31
```

### Question 3: Which February dates could you practice?

Same settings as question 2.

```
Mon, Feb 1
Tue, Feb 2
Wed, Feb 3
Thu, Feb 4
Fri, Feb 5
Sat, Feb 6
Sun, Feb 7
Mon, Feb 8
Tue, Feb 9
Wed, Feb 10
Thu, Feb 11
Fri, Feb 12
Sat, Feb 13
Sun, Feb 14
Mon, Feb 15
Tue, Feb 16
Wed, Feb 17
Thu, Feb 18
Fri, Feb 19
Sat, Feb 20
Sun, Feb 21
Mon, Feb 22
Tue, Feb 23
Wed, Feb 24
Thu, Feb 25
Fri, Feb 26
Sat, Feb 27
Sun, Feb 28
```

Two month questions rather than one 59-option question keep the scroll readable on a phone. It's still
one tap per date, which is the property that made the last poll work.

### Settings

- **Responses tab → Link to Sheets → Create a new spreadsheet.** Name it
  `LFG Jan-Feb 2027 availability`. That's what gets read back into the site afterward.
- **Settings → Responses:** turn **Allow response editing** on. Leave **Collect email addresses** off
  and **Limit to 1 response** off. That one forces a Google sign-in, which costs answers.
- **Preview** it on your phone before sending.

## The text

> Hey all! Trying to lock in practices for January and February. Tap every date you could practice,
> takes two minutes: [form link]. Please answer by Sunday 11/15. Dec 6 is the next practice
> (Burtonsville, time TBD).

## After the deadline

Send Claude the Sheet's name. It reads the responses through the Drive connector and turns them into
the "nights everyone can do" list, with near-misses ("everyone but Francesco"). Anyone who didn't
answer counts as unknown, never as unavailable (§6). Nudge stragglers on Friday, Nov 13.
