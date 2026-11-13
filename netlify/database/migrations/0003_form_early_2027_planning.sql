create table song_pitches (
  form_id integer not null references forms(id) on delete cascade,
  member_id text not null references members(id) on update cascade,
  wants_new boolean not null, answered_at timestamptz not null default now(),
  primary key (form_id, member_id));

create table song_suggestions (
  form_id integer not null, member_id text not null, position smallint not null,
  title text not null check (length(title) between 1 and 120),
  artist text not null check (length(artist) between 1 and 120),
  primary key (form_id, member_id, position),
  foreign key (form_id, member_id) references song_pitches on delete cascade);

-- Retargeted on 2026-11-12 (was a March show form, Jan-Mar, 3 practices) before any deploy applied it, so it was edited in
-- place. Once any deploy has applied this migration, never edit it. A due-date or title fix goes in a new migration.
insert into forms (slug, title, due_day, avail_start, avail_end, practices_needed, target_label, created_by)
  values ('early-2027-planning', 'Early 2027 planning', '2026-11-29', '2027-01-01', '2027-04-30', 2, 'the end of April', 'colin');
insert into form_members (form_id, member_id) select f.id, m.id from forms f cross join members m where f.slug = 'early-2027-planning';
