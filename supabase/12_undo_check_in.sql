-- Member bisa membatalkan absennya sendiri (salah pilih kelas) dan memilih ulang.
-- open_sessions sekarang membedakan "sudah booking" (belum hadir) dan "sudah absen".

drop function if exists public.open_sessions(text);
create function public.open_sessions(p_token text)
returns table (sid uuid, cname text, starts timestamptz, ends timestamptz, instr text, is_booked boolean, attended boolean)
language plpgsql stable security definer set search_path = public as $$
begin
  if p_token is distinct from daily_token(today_wita()) then
    raise exception 'QR salah atau sudah kedaluwarsa';
  end if;
  return query
    select s.id, c.name, s.starts_at, s.ends_at, s.instructor,
           exists (select 1 from bookings b where b.session_id = s.id and b.user_id = auth.uid() and b.status = 'booked'),
           exists (select 1 from bookings b where b.session_id = s.id and b.user_id = auth.uid() and b.status = 'attended')
    from sessions s join classes c on c.id = s.class_id
    where (s.starts_at at time zone 'Asia/Makassar')::date = today_wita()
      and now() >= s.starts_at - interval '30 minutes'
    order by s.starts_at desc;
end $$;

-- Batalkan absen milik sendiri untuk kelas hari ini.
-- Kalau absen itu dibuat langsung saat scan (tanpa booking sebelumnya), barisnya dihapus;
-- kalau sebelumnya sudah booking, statusnya kembali ke "booked".
create or replace function public.undo_check_in(p_session uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from sessions s where s.id = p_session and (s.starts_at at time zone 'Asia/Makassar')::date = today_wita()) then
    raise exception 'Hanya absen hari ini yang bisa dibatalkan';
  end if;
  delete from bookings
   where session_id = p_session and user_id = auth.uid() and status = 'attended'
     and checked_in_at is not null and checked_in_at - created_at < interval '10 seconds';
  update bookings set status = 'booked', checked_in_at = null
   where session_id = p_session and user_id = auth.uid() and status = 'attended';
end $$;

revoke execute on function open_sessions, undo_check_in from public, anon;
grant execute on function open_sessions, undo_check_in to authenticated;
