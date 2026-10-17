-- Ukuran gi (opsional) supaya admin bisa menyiapkan gi untuk peserta kelas.
-- Nilai: own (bawa sendiri), M0-M4 (anak), A0-A5 (dewasa).
alter table profiles add column if not exists gi_size text check (gi_size is null or gi_size ~ '^(own|M[0-4]|A[0-5])$');
grant update (gi_size) on profiles to authenticated;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  b text := coalesce(new.raw_user_meta_data->>'belt', 'White');
  s int := case when (new.raw_user_meta_data->>'stripes') ~ '^[0-4]$' then (new.raw_user_meta_data->>'stripes')::int else 0 end;
  g text := case when (new.raw_user_meta_data->>'gi_size') ~ '^(own|M[0-4]|A[0-5])$' then new.raw_user_meta_data->>'gi_size' else null end;
begin
  if b not in ('White', 'Blue', 'Purple', 'Brown', 'Black') then b := 'White'; end if;
  insert into profiles (id, full_name, phone, email, belt, stripes, gi_size)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), new.raw_user_meta_data->>'phone', new.email, b, s, g);
  return new;
end $$;

drop function if exists public.admin_update_member(uuid, text, text, text, int, text, date, text, boolean);
create or replace function public.admin_update_member(
  p_id uuid, p_full_name text, p_phone text, p_belt text, p_stripes int,
  p_membership_type text, p_valid_until date, p_member_no text, p_waiver boolean, p_gi_size text
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
    waiver_filled = p_waiver,
    gi_size = nullif(p_gi_size, '')
  where id = p_id;
end $$;
revoke execute on function admin_update_member from public, anon;
grant execute on function admin_update_member to authenticated;
