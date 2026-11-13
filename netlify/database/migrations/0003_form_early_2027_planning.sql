-- One optional song suggestion per member. A row exists once they've answered; Yes needs the song, No has none.
create table song_pitches (
  form_id integer not null references forms(id) on delete cascade,
  member_id text not null references members(id) on update cascade,
  wants_new boolean not null,
  suggestion text check (length(suggestion) between 1 and 160),
  answered_at timestamptz not null default now(),
  primary key (form_id, member_id),
  check (wants_new = (suggestion is not null)));

-- Retargeted on 2026-11-12 (was a March show form, Jan-Mar, 3 practices) before any deploy applied it, so it was edited in
-- place. Once any deploy has applied this migration, never edit it. A due-date or title fix goes in a new migration.
insert into forms (slug, title, due_day, avail_start, avail_end, practices_needed, target_label, created_by)
  values ('early-2027-planning', 'Early 2027 planning', '2026-11-29', '2027-01-01', '2027-04-30', 2, 'the end of April', 'colin');
insert into form_members (form_id, member_id) select f.id, m.id from forms f cross join members m where f.slug = 'early-2027-planning';
