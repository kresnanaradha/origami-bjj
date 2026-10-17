-- Akun baru langsung dianggap terkonfirmasi (tanpa klik link email).
-- Catatan: ini berarti email tidak diverifikasi. Untuk berhenti mengirim email konfirmasi sama sekali,
-- matikan juga di Supabase: Authentication > Providers > Email > "Confirm email".
create or replace function public.auto_confirm_email() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.email_confirmed_at := coalesce(new.email_confirmed_at, now());
  return new;
end $$;

drop trigger if exists auto_confirm_email on auth.users;
create trigger auto_confirm_email before insert on auth.users
  for each row execute function public.auto_confirm_email();

-- akun lama yang masih menunggu konfirmasi
update auth.users set email_confirmed_at = now() where email_confirmed_at is null;
