-- Absen: setelah scan QR harian, member memilih kelas yang sedang dibuka.

-- Kelas yang sedang buka absen (30 menit sebelum mulai s/d selesai), hanya kalau QR-nya benar untuk hari ini.
create or replace function public.open_sessions(p_token text)
returns table (sid uuid, cname text, starts timestamptz, ends timestamptz, instr text, is_booked boolean)
language plpgsql stable security definer set search_path = public as $$
begin
  if p_token is distinct from daily_token(today_wita()) then
    raise exception 'QR salah atau sudah kedaluwarsa';
  end if;
  return query
    select s.id, c.name, s.starts_at, s.ends_at, s.instructor,
           exists (select 1 from bookings b where b.session_id = s.id and b.user_id = auth.uid() and b.status <> 'cancelled')
    from sessions s join classes c on c.id = s.class_id
    where now() between s.starts_at - interval '30 minutes' and s.ends_at
    order by s.starts_at;
end $$;

-- check_in sekarang menerima kelas pilihan member. Tanpa p_session, sistem memilih sendiri seperti sebelumnya.
drop function if exists public.check_in(text);
create or replace function public.check_in(p_token text, p_session uuid default null) returns text
language plpgsql security definer set search_path = public as $$
declare s sessions; cname text; taken int;
begin
  if p_token is distinct from daily_token(today_wita()) then
    raise exception 'QR salah atau sudah kedaluwarsa';
  end if;
  if p_session is null then
    select ss.* into s from sessions ss
    where now() between ss.starts_at - interval '30 minutes' and ss.ends_at
    order by exists (select 1 from bookings b where b.session_id = ss.id and b.user_id = auth.uid() and b.status <> 'cancelled') desc,
             abs(extract(epoch from ss.starts_at - now()))
    limit 1;
  else
    select ss.* into s from sessions ss
    where ss.id = p_session and now() between ss.starts_at - interval '30 minutes' and ss.ends_at;
  end if;
  if not found then raise exception 'Kelas ini tidak sedang dibuka untuk absen'; end if;
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

revoke execute on function open_sessions, check_in from public, anon;
grant execute on function open_sessions, check_in to authenticated;
