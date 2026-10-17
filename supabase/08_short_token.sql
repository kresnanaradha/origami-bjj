-- Token QR harian dipersingkat (24 karakter hex = 96 bit) supaya QR lebih longgar dan mudah dipindai kamera.
-- QR yang sudah dicetak sebelum perubahan ini perlu dicetak ulang.
create or replace function public.daily_token(p_day date) returns text
language sql stable security definer set search_path = public as $$
  select left(encode(sha256(convert_to((select secret from app_secret) || p_day::text, 'utf8')), 'hex'), 24);
$$;
