-- Jalankan setelah schema.sql. Menambah: belt saat daftar, email di profil,
-- jadwal mingguan (class_schedules), generator sesi, dan fungsi kelola member untuk admin.

alter table profiles add column if not exists email text;
update profiles p set email = u.email from auth.users u where u.id = p.id and p.email is null;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  b text := coalesce(new.raw_user_meta_data->>'belt', 'White');
  s int := case when (new.raw_user_meta_data->>'stripes') ~ '^[0-4]$' then (new.raw_user_meta_data->>'stripes')::int else 0 end;
begin
  if b not in ('White', 'Blue', 'Purple', 'Brown', 'Black') then b := 'White'; end if;
  insert into profiles (id, full_name, phone, email, belt, stripes)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), new.raw_user_meta_data->>'phone', new.email, b, s);
  return new;
end $$;

-- Jadwal mingguan ---------------------------------------------------------
create table if not exists public.class_schedules (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references classes on delete cascade,
  weekday int not null check (weekday between 0 and 6),          -- 0 = Minggu ... 6 = Sabtu
  start_time time not null,
  end_time time not null check (end_time > start_time),
  instructor text not null default '',
  capacity int not null default 30 check (capacity > 0),
  active boolean not null default true
);
alter table class_schedules enable row level security;
create policy "schedules read" on class_schedules for select using (true);
create policy "schedules admin" on class_schedules for all using (is_admin()) with check (is_admin());

alter table sessions add column if not exists schedule_id uuid references class_schedules on delete set null;
create unique index if not exists sessions_schedule_start on sessions (schedule_id, starts_at) where schedule_id is not null;

-- Buat sesi dari jadwal mingguan untuk p_weeks minggu ke depan (WITA). Aman dijalankan berulang.
create or replace function public.generate_sessions(p_weeks int default 4) returns int
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if not is_admin() then raise exception 'Admin only'; end if;
  insert into sessions (class_id, schedule_id, starts_at, ends_at, instructor, capacity)
  select cs.class_id, cs.id,
         ((today_wita() + g) + cs.start_time) at time zone 'Asia/Makassar',
         ((today_wita() + g) + cs.end_time) at time zone 'Asia/Makassar',
         cs.instructor, cs.capacity
  from class_schedules cs
  cross join generate_series(0, greatest(p_weeks, 1) * 7) g
  where cs.active and extract(dow from today_wita() + g) = cs.weekday
  on conflict (schedule_id, starts_at) where schedule_id is not null do nothing;
  get diagnostics n = row_count;
  return n;
end $$;

-- Kelola member (admin) -----------------------------------------------------
create sequence if not exists member_no_seq start 1;

create or replace function public.admin_update_member(
  p_id uuid, p_full_name text, p_phone text, p_belt text, p_stripes int,
  p_membership_type text, p_valid_until date, p_member_no text, p_waiver boolean
) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'Admin only'; end if;
  update profiles set
    full_name = p_full_name,
    phone = nullif(p_phone, ''),
    belt = p_belt,
    stripes = least(greatest(p_stripes, 0), 4),
    membership_type = nullif(p_membership_type, ''),
    valid_until = p_valid_until,
    member_no = nullif(p_member_no, ''),
    waiver_filled = p_waiver
  where id = p_id;
end $$;

-- Aktifkan / perpanjang paket: Monthly 30 hari, 3 Month 90 hari, Annual 365 hari.
-- Kalau masih aktif, diperpanjang dari tanggal berakhir; kalau sudah habis, mulai hari ini.
create or replace function public.admin_activate_membership(p_id uuid, p_type text) returns date
language plpgsql security definer set search_path = public as $$
declare days int; start date; result date;
begin
  if not is_admin() then raise exception 'Admin only'; end if;
  days := case p_type when 'Monthly' then 30 when '3 Month' then 90 when 'Annual' then 365 end;
  if days is null then raise exception 'Paket tidak dikenal'; end if;
  select greatest(coalesce(valid_until, today_wita()), today_wita()) into start from profiles where id = p_id;
  result := start + days;
  update profiles set
    membership_type = p_type,
    valid_until = result,
    member_no = coalesce(member_no, 'OBJ-' || lpad(nextval('member_no_seq')::text, 4, '0'))
  where id = p_id;
  return result;
end $$;

revoke execute on function generate_sessions, admin_update_member, admin_activate_membership from public, anon;
grant execute on function generate_sessions, admin_update_member, admin_activate_membership to authenticated;

-- QR harian untuk tanggal tertentu (admin), supaya QR beberapa hari ke depan bisa dicetak sekaligus.
drop function if exists public.get_daily_qr();
create or replace function public.get_daily_qr(p_day date default null) returns text
language sql stable security definer set search_path = public as $$
  select daily_token(coalesce(p_day, today_wita())) where is_admin();
$$;
revoke execute on function get_daily_qr(date) from public, anon;
grant execute on function get_daily_qr(date) to authenticated;
