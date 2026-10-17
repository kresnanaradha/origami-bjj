-- "Batalkan kelas" (libur satu hari) harus tetap batal: pembuat sesi otomatis tidak boleh membuatnya lagi.
-- Sesi yang dibatalkan dicatat di tabel ini lalu barisnya dihapus.

create table if not exists public.cancelled_sessions (
  schedule_id uuid not null references class_schedules on delete cascade,
  starts_at timestamptz not null,
  primary key (schedule_id, starts_at)
);
alter table public.cancelled_sessions enable row level security;   -- tanpa policy: hanya lewat fungsi di bawah

create or replace function public._generate_sessions(p_weeks int) returns int
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  insert into sessions (class_id, schedule_id, starts_at, ends_at, instructor, capacity)
  select cs.class_id, cs.id, s.st, s.en, cs.instructor, cs.capacity
  from class_schedules cs
  cross join generate_series(0, greatest(p_weeks, 1) * 7) g
  cross join lateral (
    select ((today_wita() + g) + cs.start_time) at time zone 'Asia/Makassar' as st,
           ((today_wita() + g) + cs.end_time) at time zone 'Asia/Makassar' as en
  ) s
  where cs.active and extract(dow from today_wita() + g) = cs.weekday and s.st > now()
    and not exists (select 1 from cancelled_sessions x where x.schedule_id = cs.id and x.starts_at = s.st)
  on conflict (schedule_id, starts_at) where schedule_id is not null do nothing;
  get diagnostics n = row_count;
  return n;
end $$;

create or replace function public.admin_cancel_session(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'Admin only'; end if;
  insert into cancelled_sessions (schedule_id, starts_at)
    select schedule_id, starts_at from sessions where id = p_id and schedule_id is not null
  on conflict do nothing;
  delete from sessions where id = p_id;
end $$;

revoke execute on function admin_cancel_session from public, anon;
grant execute on function admin_cancel_session to authenticated;
