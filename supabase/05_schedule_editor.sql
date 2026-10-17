-- Editor jadwal mingguan: simpan/hapus template, sesi mendatang ikut menyesuaikan, dan dibuat otomatis tiap hari.

-- Generator inti (tanpa cek admin; hanya dipanggil dari fungsi lain / cron). Hanya membuat sesi yang belum lewat.
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
  on conflict (schedule_id, starts_at) where schedule_id is not null do nothing;
  get diagnostics n = row_count;
  return n;
end $$;
revoke execute on function _generate_sessions from public, anon, authenticated;

create or replace function public.generate_sessions(p_weeks int default 4) returns int
language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'Admin only'; end if;
  return _generate_sessions(p_weeks);
end $$;

-- Tambah (p_id null) atau ubah template. Sesi mendatang tanpa booking dibuat ulang sesuai template baru;
-- sesi yang sudah ada booking dibiarkan supaya booking member tidak hilang.
create or replace function public.admin_save_schedule(
  p_id uuid, p_class uuid, p_weekday int, p_start time, p_end time, p_instructor text, p_capacity int, p_active boolean
) returns void
language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if not is_admin() then raise exception 'Admin only'; end if;
  if p_end <= p_start then raise exception 'Jam selesai harus setelah jam mulai'; end if;
  if p_id is null then
    insert into class_schedules (class_id, weekday, start_time, end_time, instructor, capacity, active)
    values (p_class, p_weekday, p_start, p_end, coalesce(p_instructor, ''), greatest(coalesce(p_capacity, 30), 1), p_active)
    returning id into v_id;
  else
    update class_schedules set class_id = p_class, weekday = p_weekday, start_time = p_start, end_time = p_end,
      instructor = coalesce(p_instructor, ''), capacity = greatest(coalesce(p_capacity, 30), 1), active = p_active
    where id = p_id;
    v_id := p_id;
  end if;
  delete from sessions s
  where s.schedule_id = v_id and s.starts_at > now()
    and not exists (select 1 from bookings b where b.session_id = s.id);
  perform _generate_sessions(4);
end $$;

create or replace function public.admin_delete_schedule(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'Admin only'; end if;
  delete from sessions s
  where s.schedule_id = p_id and s.starts_at > now()
    and not exists (select 1 from bookings b where b.session_id = s.id);
  delete from class_schedules where id = p_id;
end $$;

revoke execute on function generate_sessions, admin_save_schedule, admin_delete_schedule from public, anon;
grant execute on function generate_sessions, admin_save_schedule, admin_delete_schedule to authenticated;

-- Perpanjang sesi otomatis tiap hari 04:00 WITA (butuh pg_cron; kalau tidak tersedia, abaikan).
do $$
begin
  create extension if not exists pg_cron;
  perform cron.schedule('origami-generate-sessions', '0 20 * * *', 'select public._generate_sessions(4)');
exception when others then
  raise notice 'pg_cron tidak aktif: %', sqlerrm;
end $$;
