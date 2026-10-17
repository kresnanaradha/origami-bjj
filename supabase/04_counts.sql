-- Jumlah peserta per sesi (booking + hadir) tanpa membuka data member lain.
create or replace function public.session_taken(p_ids uuid[]) returns table (session_id uuid, taken int)
language sql stable security definer set search_path = public as $$
  select b.session_id, count(*)::int from bookings b
  where b.session_id = any(p_ids) and b.status in ('booked', 'attended')
  group by b.session_id;
$$;
revoke execute on function session_taken from public, anon;
grant execute on function session_taken to authenticated;
