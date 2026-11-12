create table forms (
  id integer generated always as identity primary key,
  slug text not null unique check (slug ~ '^[a-z0-9-]{1,60}$'),  -- maps to the code registry
  title text not null check (length(title) between 1 and 80), due_day date not null,
  avail_start date, avail_end date,
  practices_needed smallint check (practices_needed between 1 and 5),
  gig_id integer, target_label text check (length(target_label) between 1 and 80), target_day date,
  created_by text not null references members(id) on update cascade, created_at timestamptz not null default now(),
  closed_by text references members(id) on update cascade, closed_at timestamptz,
  check ((avail_start is null) = (avail_end is null)),
  check (avail_start is null or (avail_start <= avail_end and avail_end - avail_start < 400)),
  check (avail_start is not null or (practices_needed is null and gig_id is null and target_label is null and target_day is null)),
  check (gig_id is null or (target_label is null and target_day is null)),
  check ((closed_at is null) = (closed_by is null)));

-- At most one open form may ask for availability.
create unique index forms_one_open_availability on forms ((true)) where closed_at is null and avail_start is not null;

create table form_members (
  form_id integer not null references forms(id) on delete cascade,
  member_id text not null references members(id) on update cascade,
  signed_off_at timestamptz, primary key (form_id, member_id));

create table practices (
  id integer generated always as identity primary key,
  day date not null, start_time time, end_time time, location text, gig_id integer,
  status text not null check (status in ('tentative','scheduled','cancelled','complete')),
  form_id integer references forms(id),
  created_by text not null references members(id) on update cascade, created_at timestamptz not null default now(),
  updated_by text not null references members(id) on update cascade, updated_at timestamptz not null default now(),
  check ((start_time is null) = (end_time is null)));

create unique index practices_one_live_per_day on practices (day) where status <> 'cancelled';

create table practice_songs (
  practice_id integer not null references practices(id) on delete cascade,
  position smallint not null, title text not null, primary key (practice_id, position));

create table practice_recap_lines (
  practice_id integer not null references practices(id) on delete cascade,
  position smallint not null, line text not null, primary key (practice_id, position));
