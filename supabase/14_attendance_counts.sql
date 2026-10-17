-- Jumlah kehadiran per member untuk daftar Members (admin). Dihitung di database supaya tidak terkena batas 1000 baris.
create or replace function public.admin_attendance_counts()
returns table (member_id uuid, total int, this_month int)
language plpgsql stable security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'Admin only'; end if;
  return query
    select b.user_id,
           count(*)::int,
           (count(*) filter (where b.checked_in_at >= (date_trunc('month', now() at time zone 'Asia/Makassar') at time zone 'Asia/Makassar')))::int
    from bookings b
    where b.status = 'attended'
    group by b.user_id;
end $$;

revoke execute on function admin_attendance_counts from public, anon;
grant execute on function admin_attendance_counts to authenticated;
