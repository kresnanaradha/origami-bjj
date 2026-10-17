-- Walk-in / tamu: admin bisa menambah orang baru (nama saja) ke kelas tanpa akun.
-- Kalau orang itu kemudian mendaftar (email atau no. telepon yang sama), riwayat, paket, belt, dan kehadirannya otomatis menyatu.

-- profiles tidak lagi wajib punya akun login (tamu tidak punya baris di auth.users)
alter table public.profiles drop constraint if exists profiles_id_fkey;
alter table public.profiles add column if not exists is_guest boolean not null default false;

-- profil ikut terhapus kalau akun login dihapus (menggantikan ON DELETE CASCADE yang tadi)
create or replace function public.delete_profile_on_user_delete() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  delete from profiles where id = old.id;
  return old;
end $$;
drop trigger if exists on_auth_user_deleted on auth.users;
create trigger on_auth_user_deleted after delete on auth.users
  for each row execute function public.delete_profile_on_user_delete();

-- Normalisasi no. telepon: +62 813... dan 0813... dianggap sama
create or replace function public.phone_norm(p text) returns text
language sql immutable as $$
  select case when d like '62%' then '0' || substr(d, 3) else d end
  from (select regexp_replace(coalesce(p, ''), '\D', '', 'g') as d) x
$$;

-- Pendaftaran: kalau ada tamu dengan email/telepon yang sama, gabungkan datanya
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  b text := coalesce(new.raw_user_meta_data->>'belt', 'White');
  s int := case when (new.raw_user_meta_data->>'stripes') ~ '^[0-4]$' then (new.raw_user_meta_data->>'stripes')::int else 0 end;
  gsz text := case when (new.raw_user_meta_data->>'gi_size') ~ '^(own|M[0-4]|A[0-5])$' then new.raw_user_meta_data->>'gi_size' else null end;
  nm text := coalesce(new.raw_user_meta_data->>'full_name', '');
  ph text := new.raw_user_meta_data->>'phone';
  g profiles;
begin
  if b not in ('White', 'Blue', 'Purple', 'Brown', 'Black') then b := 'White'; end if;

  select * into g from profiles
  where is_guest
    and ((email is not null and new.email is not null and lower(email) = lower(new.email))
      or (phone_norm(phone) <> '' and phone_norm(phone) = phone_norm(ph)))
  order by created_at limit 1;

  if found then
    insert into profiles (id, full_name, phone, email, belt, stripes, gi_size, membership_type, valid_until, waiver_filled)
    values (new.id, coalesce(nullif(nm, ''), g.full_name), coalesce(nullif(ph, ''), g.phone), new.email,
            g.belt, g.stripes, coalesce(g.gi_size, gsz), g.membership_type, g.valid_until, g.waiver_filled);
    update bookings set user_id = new.id where user_id = g.id;
    delete from profiles where id = g.id;
    update profiles set member_no = g.member_no where id = new.id;
  else
    insert into profiles (id, full_name, phone, email, belt, stripes, gi_size)
    values (new.id, nm, ph, new.email, b, s, gsz);
  end if;
  return new;
end $$;

-- Admin: tambah orang (tamu) ke kelas sebagai hadir. Kalau email/telepon sudah ada, pakai profil yang ada.
create or replace function public.admin_add_guest(
  p_session uuid, p_name text, p_phone text, p_email text, p_belt text, p_gi text
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  pid uuid;
  v_belt text := case when p_belt in ('White', 'Blue', 'Purple', 'Brown', 'Black') then p_belt else 'White' end;
  v_gi text := case when p_gi ~ '^(own|M[0-4]|A[0-5])$' then p_gi else null end;
begin
  if not is_admin() then raise exception 'Admin only'; end if;
  if coalesce(trim(p_name), '') = '' then raise exception 'Nama wajib diisi'; end if;

  select id into pid from profiles
  where (nullif(trim(p_email), '') is not null and lower(email) = lower(trim(p_email)))
     or (phone_norm(p_phone) <> '' and phone_norm(phone) = phone_norm(p_phone))
  limit 1;

  if pid is null then
    insert into profiles (id, full_name, phone, email, belt, gi_size, is_guest)
    values (gen_random_uuid(), trim(p_name), nullif(trim(p_phone), ''), nullif(trim(p_email), ''), v_belt, v_gi, true)
    returning id into pid;
  end if;

  insert into bookings (session_id, user_id, status, checked_in_at)
  values (p_session, pid, 'attended', now())
  on conflict (session_id, user_id) do update
    set status = 'attended', checked_in_at = coalesce(bookings.checked_in_at, now());
  return pid;
end $$;

revoke execute on function admin_add_guest from public, anon;
grant execute on function admin_add_guest to authenticated;
revoke execute on function delete_profile_on_user_delete, phone_norm from public, anon, authenticated;
