-- Member ids. Must match MemberId in src/models/band-member.ts.
create table members (id text primary key);
insert into members (id) values ('anna'),('kyle'),('nick'),('francesco'),('colin');

-- Higher beats lower when an import would overwrite an answer. Mirrors AvailabilitySource in src/models/availability.ts.
create function source_rank(source text) returns int language sql immutable as $$
  select case source when 'self' then 4 when 'manual' then 3 when 'poll' then 2 when 'assumed' then 1 end $$;

create table availability (
  member_id text not null references members(id) on update cascade,
  day date not null,
  answer text not null check (answer in ('yes','no','maybe')),
  source text not null check (source_rank(source) is not null),
  updated_by text not null references members(id) on update cascade,
  updated_at timestamptz not null default now(),
  primary key (member_id, day));
