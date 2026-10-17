-- Gabungkan profil tamu ke akun asli (kalau tamu mendaftar dengan telepon/email yang berbeda dari yang dicatat admin).
create or replace function public.admin_merge_guest(p_guest uuid, p_into uuid) returns void
language plpgsql security definer set search_path = public as $$
declare g profiles; t profiles;
begin
  if not is_admin() then raise exception 'Admin only'; end if;
  select * into g from profiles where id = p_guest and is_guest;
  if not found then raise exception 'Profil tamu tidak ditemukan'; end if;
  select * into t from profiles where id = p_into and not is_guest;
  if not found then raise exception 'Akun tujuan tidak ditemukan'; end if;

  -- kelas yang sama: simpan status yang paling kuat (hadir > lainnya)
  delete from bookings tb using bookings gb
   where tb.user_id = p_into and gb.user_id = p_guest and tb.session_id = gb.session_id
     and gb.status = 'attended' and tb.status <> 'attended';
  delete from bookings gb using bookings tb
   where gb.user_id = p_guest and tb.user_id = p_into and tb.session_id = gb.session_id;
  update bookings set user_id = p_into where user_id = p_guest;

  update profiles set member_no = null where id = p_guest;   -- nomor member harus unik
  update profiles set
    phone = coalesce(t.phone, g.phone),
    email = coalesce(t.email, g.email),
    gi_size = coalesce(t.gi_size, g.gi_size),
    membership_type = coalesce(t.membership_type, g.membership_type),
    valid_until = coalesce(t.valid_until, g.valid_until),
    member_no = coalesce(t.member_no, g.member_no),
    waiver_filled = t.waiver_filled or g.waiver_filled
  where id = p_into;
  delete from profiles where id = p_guest;
end $$;

revoke execute on function admin_merge_guest from public, anon;
grant execute on function admin_merge_guest to authenticated;
