-- A member's answer to "can you play a show?" when it differs from `answer`. Empty means it follows `answer`, so the
-- effective show answer is `coalesce(show_answer, answer)`. Shows are only Friday or Saturday nights (Postgres dow 5, 6),
-- so it's only ever set on those days. The grid writes only 'no', on a day whose answer is 'yes'; typing it like `answer`
-- leaves room for a later "show: not sure". Mirrors `DayAnswer.showAnswer` in src/models/availability.ts.
alter table availability
  add column show_answer text check (show_answer in ('yes','no','maybe')),
  add constraint availability_show_answer_on_show_nights
    check (show_answer is null or extract(dow from day) in (5, 6));
