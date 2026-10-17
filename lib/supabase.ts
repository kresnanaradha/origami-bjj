import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function createClient() {
  const store = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll(list) {
          // dipanggil dari Server Component: cookie hanya bisa ditulis di action/proxy
          try {
            list.forEach(({ name, value, options }) => store.set(name, value, options));
          } catch {}
        },
      },
    },
  );
}

export type Profile = {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  gi_size: string | null;
  is_guest?: boolean;
  role: "member" | "admin";
  belt: string;
  stripes: number;
  membership_type: string | null;
  member_no: string | null;
  valid_until: string | null;
  waiver_filled: boolean;
};

export async function requireUser(admin = false) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single<Profile>();
  if (!profile) redirect("/login");
  if (admin && profile.role !== "admin") redirect("/app");
  return { supabase, user: data.user, profile };
}
