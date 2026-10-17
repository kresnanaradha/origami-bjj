-- Origami BJJ: jalankan seluruh file ini di Supabase > SQL Editor.

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text not null default '',
  phone text,
  role text not null default 'member' check (role in ('member', 'admin')),
  belt text not null default 'White',
  stripes int not null default 0 check (stripes between 0 and 4),
  membership_type text,
  member_no text unique,
  valid_until date,
  waiver_filled boolean not null default false,
  created_at timestamptz not null default now()
);

create function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name, phone)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), new.raw_user_meta_data->>'phone');
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  audience text not null default 'Adults',
  days text not null default '',
  duration text not null default '1 hr',
  image_url text,
  sort int not null default 0
);

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references classes on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null check (ends_at > starts_at),
  instructor text not null default '',
  capacity int not null default 30 check (capacity > 0)
);

-- Rahasia untuk QR harian (tidak bisa dibaca client sama sekali)
create table public.app_secret (
  id int primary key default 1 check (id = 1),
  secret text not null default gen_random_uuid()::text || gen_random_uuid()::text
);
insert into app_secret default values;
alter table app_secret enable row level security;
revoke all on app_secret from anon, authenticated;
create index on sessions (starts_at);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions on delete cascade,
  user_id uuid not null references profiles on delete cascade,
  status text not null default 'booked' check (status in ('booked', 'attended', 'no_show', 'cancelled')),
  checked_in_at timestamptz,
  created_at timestamptz not null default now(),
  unique (session_id, user_id)
);

-- RLS ----------------------------------------------------------------
alter table profiles enable row level security;
alter table classes enable row level security;
alter table sessions enable row level security;
alter table bookings enable row level security;

create policy "profiles read" on profiles for select using (id = auth.uid() or is_admin());
create policy "profiles update own" on profiles for update using (id = auth.uid());
-- member hanya boleh ubah nama & telepon; belt/membership/role diubah admin lewat SQL editor
revoke update on profiles from authenticated, anon;
grant update (full_name, phone) on profiles to authenticated;

create policy "classes read" on classes for select using (true);
create policy "classes admin" on classes for all using (is_admin()) with check (is_admin());

create policy "sessions read" on sessions for select using (true);
create policy "sessions admin" on sessions for all using (is_admin()) with check (is_admin());

create policy "bookings read" on bookings for select using (user_id = auth.uid() or is_admin());
create policy "bookings admin" on bookings for all using (is_admin()) with check (is_admin());
-- member tidak punya policy insert/update: semua lewat fungsi di bawah

-- Fungsi -------------------------------------------------------------
create function public.today_wita() returns date
language sql stable as $$ select (now() at time zone 'Asia/Makassar')::date $$;

-- QR harian: token berubah otomatis tiap hari (WITA), tanpa tabel yang perlu diisi
create function public.daily_token(p_day date) returns text
language sql stable security definer set search_path = public as $$
  select encode(sha256(convert_to((select secret from app_secret) || p_day::text, 'utf8')), 'hex');
$$;

create function public.get_daily_qr() returns text
language sql stable security definer set search_path = public as $$
  select daily_token(today_wita()) where is_admin();
$$;

create function public.book_session(p_session uuid) returns void
language plpgsql security definer set search_path = public as $$
declare s sessions; taken int;
begin
  select * into s from sessions where id = p_session for update;
  if not found or s.ends_at < now() then raise exception 'Sesi tidak tersedia'; end if;
  select count(*) into taken from bookings
    where session_id = p_session and status in ('booked', 'attended') and user_id <> auth.uid();
  if taken >= s.capacity then raise exception 'Kelas sudah penuh'; end if;
  insert into bookings (session_id, user_id) values (p_session, auth.uid())
  on conflict (session_id, user_id) do update set status = 'booked'
    where bookings.status = 'cancelled';
end $$;

create function public.cancel_booking(p_session uuid) returns void
language sql security definer set search_path = public as $$
  update bookings set status = 'cancelled'
  where session_id = p_session and user_id = auth.uid() and status = 'booked';
$$;

-- Absen via QR harian: sesi yang dipilih = yang sedang buka (30 menit sebelum mulai s/d selesai);
-- kalau ada beberapa, utamakan yang sudah di-book member, lalu yang paling dekat waktu mulainya.
create function public.check_in(p_token text) returns text
language plpgsql security definer set search_path = public as $$
declare s sessions; cname text; taken int;
begin
  if p_token is distinct from daily_token(today_wita()) then
    raise exception 'QR salah atau sudah kedaluwarsa';
  end if;
  select ss.* into s from sessions ss
  where now() between ss.starts_at - interval '30 minutes' and ss.ends_at
  order by exists (select 1 from bookings b where b.session_id = ss.id and b.user_id = auth.uid() and b.status <> 'cancelled') desc,
           abs(extract(epoch from ss.starts_at - now()))
  limit 1;
  if not found then raise exception 'Tidak ada kelas yang sedang dibuka untuk absen'; end if;
  select count(*) into taken from bookings
    where session_id = s.id and status in ('booked', 'attended') and user_id <> auth.uid();
  if taken >= s.capacity then raise exception 'Kelas sudah penuh'; end if;
  insert into bookings (session_id, user_id, status, checked_in_at)
  values (s.id, auth.uid(), 'attended', now())
  on conflict (session_id, user_id) do update
    set status = 'attended', checked_in_at = coalesce(bookings.checked_in_at, now());
  select name into cname from classes where id = s.class_id;
  return cname;
end $$;

revoke execute on function daily_token from public, anon, authenticated;
revoke execute on function get_daily_qr, book_session, cancel_booking, check_in from public, anon;
grant execute on function get_daily_qr, book_session, cancel_booking, check_in to authenticated;

-- Data awal (dari Figma) ---------------------------------------------
insert into classes (name, audience, days, duration, image_url, sort) values
  ('Intro to BJJ', 'Adults', 'Mon, Tue, Thu', '1 hr', '/images/class-intro.jpg', 1),
  ('Fundamentals', 'Adults', 'Mon, Tue, Wed, Thu, Fri', '1 hr', '/images/class-fundamentals.jpg', 2),
  ('All Levels', 'Adults', 'Mon, Tue, Wed, Thu, Fri, Sat', '1 hr', '/images/class-all-levels.jpg', 3),
  ('Kids Class', '4+ yo and above', 'Wed, Fri, Sat', '1 hr', '/images/class-kids.jpg', 4),
  ('Private Class', 'Kids, Adults, and Family', 'By Appointment', '1 hr', '/images/class-private.jpg', 5);

-- Jadikan akun admin (setelah daftar lewat aplikasi):
-- update profiles set role = 'admin' where id = (select id from auth.users where email = 'EMAIL_ADMIN');
