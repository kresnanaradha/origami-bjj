"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, requireUser } from "@/lib/supabase";
import { getI18n } from "@/lib/i18n";

const enc = encodeURIComponent;
const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const BELTS = ["White", "Blue", "Purple", "Brown", "Black"];

export async function setLang(f: FormData) {
  const lang = str(f, "lang") === "id" ? "id" : "en";
  (await cookies()).set("lang", lang, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  revalidatePath("/", "layout");
}

// ---- auth -------------------------------------------------------------
export async function login(f: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: str(f, "email"), password: str(f, "password") });
  if (error) redirect(`/login?error=${enc(error.message)}`);
  redirect("/app");
}

export async function register(f: FormData) {
  const { t } = await getI18n();
  const belt = BELTS.includes(str(f, "belt")) ? str(f, "belt") : "White";
  const stripes = Math.min(Math.max(Number(str(f, "stripes")) || 0, 0), 4);
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: str(f, "email"),
    password: str(f, "password"),
    options: { data: { full_name: str(f, "full_name"), phone: str(f, "phone"), belt, stripes: String(stripes), gi_size: str(f, "gi_size") } },
  });
  if (error) redirect(`/register?error=${enc(error.message)}`);
  // Akun otomatis terkonfirmasi (trigger di database), jadi kalau belum ada session langsung login saja.
  if (!data.session) {
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: str(f, "email"), password: str(f, "password") });
    if (signInError) redirect(`/login?info=${enc(t("auth.checkEmail"))}`);
  }
  redirect("/app");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

// ---- member -------------------------------------------------------------
export async function book(f: FormData) {
  const { supabase } = await requireUser();
  const { error } = await supabase.rpc("book_session", { p_session: str(f, "session") });
  if (error) redirect(`/app/classes?error=${enc(error.message)}`);
  revalidatePath("/app", "layout");
}

export async function cancel(f: FormData) {
  const { supabase } = await requireUser();
  await supabase.rpc("cancel_booking", { p_session: str(f, "session") });
  revalidatePath("/app", "layout");
}

export type OpenSession = { sid: string; cname: string; starts: string; ends: string; instr: string | null; is_booked: boolean };
export type ScanResult =
  | { status: "done"; name: string }
  | { status: "pick"; sessions: OpenSession[]; preselect: string }
  | { status: "none" }
  | { status: "error"; message: string };

// Absen sekali scan: kalau hanya ada satu kemungkinan kelas (satu kelas buka, atau member hanya book satu dari yang buka),
// langsung dicatat. Member hanya diminta memilih kalau memang ambigu.
export async function resolveScan(token: string): Promise<ScanResult> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase.rpc("open_sessions", { p_token: token });
  if (error) return { status: "error", message: error.message };
  const open = (data ?? []) as OpenSession[];
  if (!open.length) return { status: "none" };
  const booked = open.filter((o) => o.is_booked);
  const auto = open.length === 1 ? open[0] : booked.length === 1 ? booked[0] : null;
  if (auto) return confirmScan(token, auto.sid);
  return { status: "pick", sessions: open, preselect: booked[0]?.sid ?? "" };
}

export async function confirmScan(token: string, sessionId: string): Promise<ScanResult> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase.rpc("check_in", { p_token: token, p_session: sessionId });
  if (error) return { status: "error", message: error.message };
  revalidatePath("/app", "layout");
  return { status: "done", name: String(data) };
}

export async function setMyGi(f: FormData) {
  const { supabase, user } = await requireUser();
  await supabase.from("profiles").update({ gi_size: str(f, "gi_size") || null }).eq("id", user.id);
  revalidatePath("/app/profile");
}

// ---- admin: kehadiran --------------------------------------------------------
export async function setAttendance(f: FormData) {
  const { supabase } = await requireUser(true);
  const picked = str(f, "status");
  if (!["attended", "no_show"].includes(picked)) return;
  // menekan status yang sedang aktif = membatalkan (kembali ke "booked")
  const status = picked === str(f, "current") ? "booked" : picked;
  await supabase
    .from("bookings")
    .update({ status, checked_in_at: status === "attended" ? new Date().toISOString() : null })
    .eq("id", str(f, "booking"));
  revalidatePath(`/admin/sessions/${str(f, "session")}`);
}

export async function addGuest(f: FormData) {
  const { supabase } = await requireUser(true);
  const session = str(f, "session");
  const { error } = await supabase.rpc("admin_add_guest", {
    p_session: session,
    p_name: str(f, "name"),
    p_phone: str(f, "phone"),
    p_email: str(f, "email"),
    p_belt: str(f, "belt"),
    p_gi: str(f, "gi_size"),
  });
  if (error) redirect(`/admin/sessions/${session}?error=${enc(error.message)}`);
  revalidatePath(`/admin/sessions/${session}`);
  redirect(`/admin/sessions/${session}?added=1`);
}

export async function addWalkIn(f: FormData) {
  const { supabase } = await requireUser(true);
  const session = str(f, "session");
  const user = str(f, "user");
  if (!user) return;
  await supabase
    .from("bookings")
    .upsert({ session_id: session, user_id: user, status: "attended", checked_in_at: new Date().toISOString() }, { onConflict: "session_id,user_id" });
  revalidatePath(`/admin/sessions/${session}`);
}

// ---- admin: jadwal ---------------------------------------------------------------
export async function saveTemplate(f: FormData) {
  const { supabase } = await requireUser(true);
  const { error } = await supabase.rpc("admin_save_schedule", {
    p_id: str(f, "id") || null,
    p_class: str(f, "class_id"),
    p_weekday: Number(str(f, "weekday")),
    p_start: str(f, "start_time"),
    p_end: str(f, "end_time"),
    p_instructor: str(f, "instructor"),
    p_capacity: Number(str(f, "capacity")) || 30,
    p_active: str(f, "id") ? f.get("active") === "on" : true,
  });
  if (error) redirect(`/admin/schedule?error=${enc(error.message)}`);
  revalidatePath("/admin", "layout");
  redirect("/admin/schedule?saved=1");
}

export async function deleteTemplate(f: FormData) {
  const { supabase } = await requireUser(true);
  const { error } = await supabase.rpc("admin_delete_schedule", { p_id: str(f, "id") });
  if (error) redirect(`/admin/schedule?error=${enc(error.message)}`);
  revalidatePath("/admin", "layout");
  redirect("/admin/schedule?saved=1");
}

export async function cancelSession(f: FormData) {
  const { supabase } = await requireUser(true);
  await supabase.from("sessions").delete().eq("id", str(f, "id"));
  revalidatePath("/admin", "layout");
  redirect("/admin/sessions");
}

// ---- admin: member -------------------------------------------------------------
export async function updateMember(f: FormData) {
  const { supabase } = await requireUser(true);
  const id = str(f, "id");
  const { error } = await supabase.rpc("admin_update_member", {
    p_id: id,
    p_full_name: str(f, "full_name"),
    p_phone: str(f, "phone"),
    p_belt: BELTS.includes(str(f, "belt")) ? str(f, "belt") : "White",
    p_stripes: Number(str(f, "stripes")) || 0,
    p_membership_type: str(f, "membership_type"),
    p_valid_until: str(f, "valid_until") || null,
    p_member_no: str(f, "member_no"),
    p_waiver: f.get("waiver") === "on",
    p_gi_size: str(f, "gi_size"),
  });
  if (error) redirect(`/admin/members/${id}?error=${enc(error.message)}`);
  revalidatePath("/admin", "layout");
  redirect(`/admin/members/${id}?saved=1`);
}

export async function activatePlan(f: FormData) {
  const { supabase } = await requireUser(true);
  const id = str(f, "id");
  const { error } = await supabase.rpc("admin_activate_membership", { p_id: id, p_type: str(f, "plan") });
  if (error) redirect(`/admin/members/${id}?error=${enc(error.message)}`);
  revalidatePath("/admin", "layout");
  redirect(`/admin/members/${id}?saved=1`);
}

export async function mergeGuest(f: FormData) {
  const { supabase } = await requireUser(true);
  const guest = str(f, "guest");
  const into = str(f, "into");
  const { error } = await supabase.rpc("admin_merge_guest", { p_guest: guest, p_into: into });
  if (error) redirect(`/admin/members/${guest}?error=${enc(error.message)}`);
  revalidatePath("/admin", "layout");
  redirect(`/admin/members/${into}?saved=1`);
}
