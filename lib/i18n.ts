import { cookies, headers } from "next/headers";

export type Lang = "en" | "id";

const en = {
  // nav
  "nav.about": "About", "nav.facility": "Facility", "nav.instructor": "Instructor", "nav.classes": "Classes", "nav.contact": "Contact", "nav.login": "Member Login",
  "tab.home": "Home", "tab.membership": "Membership", "tab.scan": "Scan", "tab.class": "Class", "tab.profile": "Profile",
  // landing
  "hero.eyebrow": "Origami BJJ · Uluwatu, Bali", "hero.t1": "Discover the art of", "hero.t2": "Brazilian Jiu-Jitsu",
  "hero.sub": "A family-friendly studio where simple, basic steps bring meaningful change, in life and on the mats. New or experienced, there is a place for you.",
  "hero.book": "Book Now", "hero.wa": "Chat on WhatsApp",
  "stat.1k": "IBJJF", "stat.1v": "Registered academy", "stat.2k": "9+ yrs", "stat.2v": "Teaching in the region", "stat.3k": "Kids & Adults", "stat.3v": "Family-friendly mats", "stat.4k": "Uluwatu", "stat.4v": "South Kuta, Bali",
  "tick.1": "Family-friendly", "tick.2": "IBJJF registered", "tick.3": "Kids & adults", "tick.4": "Uluwatu, Bali", "tick.5": "All levels welcome",
  "about.eyebrow": "About us", "about.title": "More than just a gym.",
  "about.p1": "Origami BJJ is a family-friendly Brazilian Jiu-Jitsu studio in the Uluwatu area of Bali. Our name is inspired by the Japanese art of “folded paper”, a reminder that simple, basic steps can bring meaningful change.",
  "about.p2": "Our curriculum is built around the core tenets of Brazilian Jiu-Jitsu, and we are dedicated to making it accessible to the Indonesian community, with a welcoming atmosphere for kids and adults alike.",
  "pillar.1t": "Technique", "pillar.1d": "Simple, foundational steps that compound into real skill.",
  "pillar.2t": "Discipline", "pillar.2d": "Show up, train smart, and grow on and off the mat.",
  "pillar.3t": "Community", "pillar.3d": "A welcoming, family-oriented atmosphere for every level.",
  "inst.eyebrow": "Head instructor", "inst.c1": "IBJJF-certified Black Belt", "inst.c2": "Teaching 9+ years", "inst.c3": "Competed in 4 countries",
  "inst.bio": "Coach Ronny started Brazilian Jiu-Jitsu in Indonesia in 2011 and trained under Prof. Zoro Moreira and Prof. Thiago Gaspary, with additional learning from Prof. Airam Nogueira and Prof. Deddy Wigraha. He has trained and taught at academies including FAMA in Singapore, and has competed in Indonesia, Singapore, the Philippines, and Japan.",
  "classes.eyebrow": "Train with us", "classes.title": "Our Classes", "classes.book": "Book Now",
  "cta.eyebrow": "Your first step", "cta.title": "Ready to train with us?", "cta.sub": "Create your member account, pick a class, and check in with a quick scan when you arrive.", "cta.wa": "Ask on WhatsApp",
  "rev.eyebrow": "Testimonials", "rev.title": "Google Reviews", "rev.count": "{n} Google reviews", "rev.all": "See all reviews on Google Maps", "rev.guide": "Local Guide",
  "foot.contact": "Contact", "foot.pages": "Pages", "foot.rights": "All rights reserved.",
  // auth
  "auth.back": "← Back to home", "auth.welcome": "Welcome back", "auth.loginSub": "Sign in to book classes and check in.",
  "auth.email": "Email", "auth.password": "Password", "auth.login": "Login", "auth.noAccount": "No account yet?", "auth.signup": "Sign up",
  "auth.registerTitle": "Join Origami", "auth.registerSub": "Create your member account.", "auth.fullName": "Full name", "auth.phone": "Phone number",
  "auth.passwordHint": "Password (min. 6 characters)", "auth.belt": "Your current belt", "auth.beltHelp": "This sets your starting Belt Progress. Your coach can adjust it later.",
  "auth.stripes": "Stripes", "auth.haveAccount": "Already have an account?", "auth.createAccount": "Create account",
  "auth.checkEmail": "Check your email to confirm, then log in.",
  // belts
  "belt.White": "White", "belt.Blue": "Blue", "belt.Purple": "Purple", "belt.Brown": "Brown", "belt.Black": "Black",
  // member
  "m.eyebrow": "Member area", "m.welcome": "Welcome back,", "m.tagline": "Your journey in Brazilian Jiu Jitsu continues. Stay committed, train hard, and embrace the path to mastery.",
  "m.next": "Next class", "m.noBooking": "No booking yet. Pick a class to get started.", "m.scanIn": "Scan to check in", "m.bookClass": "Book a class",
  "m.stat.month": "Classes this month", "m.stat.total": "Total classes", "m.stat.valid": "Membership valid until",
  "m.benefits": "Membership Benefits", "m.b1t": "Unlimited Classes", "m.b1d": "Access to all scheduled classes throughout the week including fundamentals, all levels, and open mat sessions.",
  "m.b2t": "Belt Progression", "m.b2d": "Structured curriculum and regular assessments to support your journey through the ranks.",
  "mem.eyebrow": "Membership", "mem.title": "Your member card", "mem.status": "Status", "mem.active": "Active", "mem.inactive": "Not active", "mem.hint": "To renew or change your plan, ask the admin at the gym.",
  "mem.none": "No active membership", "mem.suffix": "Membership", "mem.no": "MEMBER No.", "mem.valid": "VALID UNTIL",
  "cls.eyebrow": "Schedule", "cls.title": "Classes", "cls.empty": "No classes scheduled yet.", "cls.instructor": "Instructor", "cls.book": "Book Now", "cls.booked": "Cancel", "cls.youBooked": "✓ Booked", "cls.attended": "Attended ✓", "cls.noshow": "No-show", "cls.today": "Today", "cls.tomorrow": "Tomorrow", "cls.spots": "{n} spots left", "cls.full": "Full",
  "scan.eyebrow": "Check-in", "scan.title": "Scan attendance QR", "scan.ok": "Checked in: {name} ✓", "scan.pick": "Which class are you attending?", "scan.none": "No class to check in to yet. Check-in opens 30 minutes before a class starts and stays open all day.", "scan.mine": "You booked this", "scan.confirm": "Check in", "scan.checking": "Checking in…", "scan.again": "Scan again", "scan.done": "You're checked in", "scan.home": "Back to home", "scan.camera": "Camera unavailable. Allow camera access, or scan the QR with your phone's camera app.", "scan.hint": "Point your camera at the QR at the gym. Hold the phone about 20–30 cm away until the QR looks sharp.",
  "prof.waiver": "Waiver form", "prof.filled": "Filled", "prof.notFilled": "Not filled", "prof.belt": "Belt Progress", "prof.currentBelt": "Current Belt", "prof.stripes": "Stripes", "prof.attended": "Classes attended", "prof.since": "Member since", "prof.history": "Attendance history", "prof.noHistory": "No history yet.", "prof.present": "Present", "prof.noshow": "No-show",
  "belt.word": "Belt",
  // admin
  "a.dashboard": "Dashboard", "a.schedule": "Schedule", "a.members": "Members", "a.qr": "QR", "a.memberView": "Member view", "a.eyebrow": "Admin",
  "a.dash.title": "Dashboard", "a.dash.members": "Total members", "a.dash.active": "Active memberships", "a.dash.expiring": "Expiring in 7 days", "a.dash.today": "Today's classes", "a.dash.week": "Attendance this week",
  "a.dash.todayList": "Today's classes", "a.dash.noToday": "No classes today.", "a.dash.expList": "Memberships ending soon", "a.dash.noExp": "Nothing expiring soon.", "a.dash.open": "Open attendance", "a.dash.present": "present", "a.dash.booked": "booked",
  "a.sch.title": "Weekly schedule", "a.sch.upcoming": "Upcoming", "a.sch.past": "Past", "a.sch.allClasses": "All classes", "a.sch.generate": "Generate next 4 weeks", "a.sch.generated": "{n} new sessions created.", "a.sch.empty": "No sessions.",
  "a.sch.add": "Add one-off session", "a.sch.start": "Start (WITA)", "a.sch.end": "End (WITA)", "a.sch.instructor": "Instructor", "a.sch.capacity": "Capacity", "a.sch.addBtn": "Add session",
  "a.sch.weekly": "Weekly template", "a.sch.weeklyHint": "Recurring classes. Use “Generate” to create sessions from this template.", "a.sch.day": "Day", "a.sch.class": "Class", "a.sch.remove": "Remove", "a.sch.addTpl": "Add to template",
  "a.ses.back": "← All sessions", "a.ses.checked": "Total Checked In", "a.ses.capacity": "Capacity", "a.ses.find": "Find member...", "a.ses.empty": "No attendees yet.", "a.ses.present": "Present", "a.ses.noshow": "No-show", "a.ses.booked": "Booked", "a.ses.attended": "Present", "a.ses.walkin": "Add walk-in member", "a.ses.pick": "Choose member", "a.ses.addPresent": "Add as present", "a.ses.instructor": "Instructor",
  "a.mem.title": "Members", "a.mem.search": "Search name, email or phone...", "a.mem.all": "All", "a.mem.activeF": "Active", "a.mem.expiredF": "Expired / none", "a.mem.empty": "No members found.", "a.mem.plan": "Plan", "a.mem.until": "Valid until", "a.mem.edit": "Manage",
  "a.md.title": "Manage member", "a.md.profile": "Profile", "a.md.membership": "Membership", "a.md.activate": "Activate / extend plan", "a.md.activateHint": "Adds the plan duration. Extends from the end date if still active, otherwise starts today.",
  "a.md.plan.Monthly": "Monthly (30 days)", "a.md.plan.3 Month": "3 Month (90 days)", "a.md.plan.Annual": "Annual (365 days)", "a.md.apply": "Apply plan", "a.md.manual": "Manual edit", "a.md.memberNo": "Member No.", "a.md.noPlan": "No plan", "a.md.save": "Save changes", "a.md.saved": "Saved.", "a.md.waiver": "Waiver form filled", "a.md.history": "Attendance history", "a.md.attended": "attended",
  "a.qr.title": "Attendance QR", "a.qr.today": "Today's QR", "a.qr.hint": "Members scan this to check in. The QR changes automatically every day and works all day, from 30 minutes before a class starts until midnight, so members can still check in after training.", "a.qr.print": "Print", "a.qr.printWeek": "Print next 7 days", "a.qr.day": "Valid on", "a.qr.scan": "Scan to check in", "a.qr.unavailable": "QR unavailable.", "a.qr.sheetHint": "One QR per day. Display or hang the QR for the right date.",
  "gi.label": "Gi size", "gi.own": "I bring my own gi", "gi.none": "Not set", "gi.kids": "Kids", "gi.adult": "Adult",
  "auth.gi": "Gi size (optional)", "auth.giHelp": "So we can prepare a gi for you if you need one.",
  "prof.gi": "Gi size", "prof.giSave": "Save",
  "a.ses.giTitle": "Gi to prepare", "a.ses.giHelp": "Based on members booked or present in this class.", "a.ses.giNone": "No gi needed yet.", "a.ses.giUnknown": "Size not set", "a.ses.who": "Who's coming", "a.ses.count": "{n} members",
  "a.attendance": "Attendance",
  "a.sch.intro": "Set your regular classes here. Changes apply to upcoming classes automatically.", "a.sch.addClass": "+ Add class", "a.sch.edit": "Edit", "a.sch.saveBtn": "Save", "a.sch.deleteBtn": "Delete class",
  "a.sch.noClass": "No classes", "a.sch.active": "Active", "a.sch.note": "Classes that already have bookings are kept as they are.", "a.sch.saved": "Saved.",
  "a.att.title": "Attendance", "a.att.intro": "Open a class to see who is coming and confirm attendance.",
  "a.ses.cancelClass": "Cancel this class", "a.ses.cancelHelp": "Removes this class and all of its bookings. Members are not notified.", "a.ses.cancelConfirm": "Yes, cancel class",
  "a.ses.newPerson": "Add a new person (no account yet)", "a.ses.guestHelp": "For walk-ins without an account. If they sign up later with the same phone number or email, their record merges automatically.",
  "a.ses.nameLbl": "Full name", "a.ses.phoneLbl": "Phone (optional)", "a.ses.emailLbl": "Email (optional)", "a.ses.undo": "Tap again to undo", "a.mem.guest": "No account yet", "a.ses.added": "Added.",
  "a.md.merge": "Merge into an account", "a.md.mergeHelp": "This person has no account yet. If they already signed up with a different phone number or email, choose their account here. Attendance, plan and details move over and this entry is removed.", "a.md.mergePick": "Choose account", "a.md.mergeBtn": "Merge",
  // common
  "c.logout": "Logout", "c.save": "Save", "c.search": "Search", "c.clear": "Clear",
} as const;

export type Key = keyof typeof en;

const id: Record<Key, string> = {
  "nav.about": "Tentang", "nav.facility": "Fasilitas", "nav.instructor": "Instruktur", "nav.classes": "Kelas", "nav.contact": "Kontak", "nav.login": "Masuk Member",
  "tab.home": "Beranda", "tab.membership": "Member", "tab.scan": "Scan", "tab.class": "Kelas", "tab.profile": "Profil",
  "hero.eyebrow": "Origami BJJ · Uluwatu, Bali", "hero.t1": "Temukan seni", "hero.t2": "Brazilian Jiu-Jitsu",
  "hero.sub": "Studio ramah keluarga tempat langkah sederhana membawa perubahan berarti, dalam hidup dan di atas matras. Pemula maupun berpengalaman, ada tempat untukmu.",
  "hero.book": "Daftar Sekarang", "hero.wa": "Chat WhatsApp",
  "stat.1k": "IBJJF", "stat.1v": "Akademi terdaftar", "stat.2k": "9+ thn", "stat.2v": "Mengajar di kawasan ini", "stat.3k": "Anak & Dewasa", "stat.3v": "Matras ramah keluarga", "stat.4k": "Uluwatu", "stat.4v": "Kuta Selatan, Bali",
  "tick.1": "Ramah keluarga", "tick.2": "Terdaftar IBJJF", "tick.3": "Anak & dewasa", "tick.4": "Uluwatu, Bali", "tick.5": "Semua level diterima",
  "about.eyebrow": "Tentang kami", "about.title": "Lebih dari sekadar gym.",
  "about.p1": "Origami BJJ adalah studio Brazilian Jiu-Jitsu ramah keluarga di kawasan Uluwatu, Bali. Namanya terinspirasi seni Jepang “kertas lipat”, pengingat bahwa langkah sederhana dan mendasar dapat membawa perubahan yang berarti.",
  "about.p2": "Kurikulum kami dibangun di atas prinsip inti Brazilian Jiu-Jitsu, dan kami berkomitmen membuatnya mudah diakses oleh masyarakat Indonesia, dengan suasana ramah bagi anak-anak maupun dewasa.",
  "pillar.1t": "Teknik", "pillar.1d": "Langkah dasar yang sederhana, berlipat menjadi kemampuan nyata.",
  "pillar.2t": "Disiplin", "pillar.2d": "Hadir, berlatih cerdas, dan bertumbuh di dalam maupun di luar matras.",
  "pillar.3t": "Komunitas", "pillar.3d": "Suasana hangat berorientasi keluarga untuk semua level.",
  "inst.eyebrow": "Kepala instruktur", "inst.c1": "Black Belt bersertifikat IBJJF", "inst.c2": "Mengajar 9+ tahun", "inst.c3": "Berkompetisi di 4 negara",
  "inst.bio": "Coach Ronny mulai berlatih Brazilian Jiu-Jitsu di Indonesia pada 2011 dan berguru kepada Prof. Zoro Moreira dan Prof. Thiago Gaspary, serta belajar dari Prof. Airam Nogueira dan Prof. Deddy Wigraha. Ia pernah berlatih dan mengajar di berbagai akademi termasuk FAMA di Singapura, dan telah berkompetisi di Indonesia, Singapura, Filipina, dan Jepang.",
  "classes.eyebrow": "Berlatih bersama kami", "classes.title": "Kelas Kami", "classes.book": "Daftar Sekarang",
  "cta.eyebrow": "Langkah pertamamu", "cta.title": "Siap berlatih bersama kami?", "cta.sub": "Buat akun member, pilih kelas, lalu absen dengan sekali scan saat tiba.", "cta.wa": "Tanya via WhatsApp",
  "rev.eyebrow": "Testimoni", "rev.title": "Ulasan Google", "rev.count": "{n} ulasan Google", "rev.all": "Lihat semua ulasan di Google Maps", "rev.guide": "Local Guide",
  "foot.contact": "Kontak", "foot.pages": "Halaman", "foot.rights": "Hak cipta dilindungi.",
  "auth.back": "← Kembali ke beranda", "auth.welcome": "Selamat datang kembali", "auth.loginSub": "Masuk untuk book kelas dan absen.",
  "auth.email": "Email", "auth.password": "Password", "auth.login": "Masuk", "auth.noAccount": "Belum punya akun?", "auth.signup": "Daftar",
  "auth.registerTitle": "Gabung Origami", "auth.registerSub": "Buat akun member kamu.", "auth.fullName": "Nama lengkap", "auth.phone": "No. telepon",
  "auth.passwordHint": "Password (min. 6 karakter)", "auth.belt": "Belt kamu saat ini", "auth.beltHelp": "Ini menjadi awal Belt Progress kamu. Coach bisa mengubahnya nanti.",
  "auth.stripes": "Stripe", "auth.haveAccount": "Sudah punya akun?", "auth.createAccount": "Buat akun",
  "auth.checkEmail": "Cek email kamu untuk konfirmasi, lalu login.",
  "belt.White": "Putih", "belt.Blue": "Biru", "belt.Purple": "Ungu", "belt.Brown": "Cokelat", "belt.Black": "Hitam",
  "m.eyebrow": "Area member", "m.welcome": "Selamat datang kembali,", "m.tagline": "Perjalanan Brazilian Jiu Jitsu kamu berlanjut. Tetap konsisten, berlatih keras, dan tempuh jalan menuju penguasaan.",
  "m.next": "Kelas berikutnya", "m.noBooking": "Belum ada booking. Pilih kelas untuk mulai.", "m.scanIn": "Scan untuk absen", "m.bookClass": "Book kelas",
  "m.stat.month": "Kelas bulan ini", "m.stat.total": "Total kelas", "m.stat.valid": "Member berlaku hingga",
  "m.benefits": "Keuntungan Member", "m.b1t": "Kelas Tanpa Batas", "m.b1d": "Akses ke semua kelas terjadwal sepanjang minggu, termasuk fundamentals, all levels, dan open mat.",
  "m.b2t": "Kenaikan Belt", "m.b2d": "Kurikulum terstruktur dan penilaian berkala untuk mendukung perjalananmu naik tingkat.",
  "mem.eyebrow": "Membership", "mem.title": "Kartu member kamu", "mem.status": "Status", "mem.active": "Aktif", "mem.inactive": "Tidak aktif", "mem.hint": "Untuk perpanjang atau ganti paket, hubungi admin di gym.",
  "mem.none": "Belum ada membership aktif", "mem.suffix": "Membership", "mem.no": "MEMBER No.", "mem.valid": "BERLAKU HINGGA",
  "cls.eyebrow": "Jadwal", "cls.title": "Kelas", "cls.empty": "Belum ada jadwal kelas.", "cls.instructor": "Instruktur", "cls.book": "Book", "cls.booked": "Batalkan", "cls.youBooked": "✓ Sudah di-book", "cls.attended": "Hadir ✓", "cls.noshow": "Tidak hadir", "cls.today": "Hari ini", "cls.tomorrow": "Besok", "cls.spots": "Sisa {n} tempat", "cls.full": "Penuh",
  "scan.eyebrow": "Check-in", "scan.title": "Scan QR absen", "scan.ok": "Absen berhasil: {name} ✓", "scan.pick": "Kamu ikut kelas yang mana?", "scan.none": "Belum ada kelas untuk diabsen. Absen dibuka 30 menit sebelum kelas mulai dan tetap terbuka sepanjang hari.", "scan.mine": "Kamu sudah book", "scan.confirm": "Absen", "scan.checking": "Memproses…", "scan.again": "Scan lagi", "scan.done": "Absen berhasil", "scan.home": "Kembali ke beranda", "scan.camera": "Kamera tidak bisa dibuka. Izinkan akses kamera, atau scan QR dengan kamera bawaan HP.", "scan.hint": "Arahkan kamera ke QR di gym. Jauhkan HP sekitar 20–30 cm sampai QR terlihat tajam.",
  "prof.waiver": "Waiver form", "prof.filled": "Sudah diisi", "prof.notFilled": "Belum diisi", "prof.belt": "Belt Progress", "prof.currentBelt": "Belt Saat Ini", "prof.stripes": "Stripe", "prof.attended": "Kelas dihadiri", "prof.since": "Member sejak", "prof.history": "Riwayat kehadiran", "prof.noHistory": "Belum ada riwayat.", "prof.present": "Hadir", "prof.noshow": "No-show",
  "belt.word": "Belt",
  "a.dashboard": "Dashboard", "a.schedule": "Jadwal", "a.members": "Member", "a.qr": "QR", "a.memberView": "Tampilan member", "a.eyebrow": "Admin",
  "a.dash.title": "Dashboard", "a.dash.members": "Total member", "a.dash.active": "Membership aktif", "a.dash.expiring": "Berakhir dalam 7 hari", "a.dash.today": "Kelas hari ini", "a.dash.week": "Kehadiran minggu ini",
  "a.dash.todayList": "Kelas hari ini", "a.dash.noToday": "Tidak ada kelas hari ini.", "a.dash.expList": "Membership segera berakhir", "a.dash.noExp": "Belum ada yang segera berakhir.", "a.dash.open": "Buka daftar hadir", "a.dash.present": "hadir", "a.dash.booked": "booking",
  "a.sch.title": "Jadwal mingguan", "a.sch.upcoming": "Mendatang", "a.sch.past": "Lalu", "a.sch.allClasses": "Semua kelas", "a.sch.generate": "Buat sesi 4 minggu ke depan", "a.sch.generated": "{n} sesi baru dibuat.", "a.sch.empty": "Belum ada sesi.",
  "a.sch.add": "Tambah sesi satuan", "a.sch.start": "Mulai (WITA)", "a.sch.end": "Selesai (WITA)", "a.sch.instructor": "Instruktur", "a.sch.capacity": "Kapasitas", "a.sch.addBtn": "Tambah sesi",
  "a.sch.weekly": "Template mingguan", "a.sch.weeklyHint": "Kelas rutin. Gunakan “Buat sesi” untuk membuat sesi dari template ini.", "a.sch.day": "Hari", "a.sch.class": "Kelas", "a.sch.remove": "Hapus", "a.sch.addTpl": "Tambah ke template",
  "a.ses.back": "← Semua sesi", "a.ses.checked": "Total Hadir", "a.ses.capacity": "Kapasitas", "a.ses.find": "Cari member...", "a.ses.empty": "Belum ada peserta.", "a.ses.present": "Hadir", "a.ses.noshow": "No-show", "a.ses.booked": "Booking", "a.ses.attended": "Hadir", "a.ses.walkin": "Tambah member walk-in", "a.ses.pick": "Pilih member", "a.ses.addPresent": "Tandai hadir", "a.ses.instructor": "Instruktur",
  "a.mem.title": "Member", "a.mem.search": "Cari nama, email, atau telepon...", "a.mem.all": "Semua", "a.mem.activeF": "Aktif", "a.mem.expiredF": "Habis / belum ada", "a.mem.empty": "Member tidak ditemukan.", "a.mem.plan": "Paket", "a.mem.until": "Berlaku hingga", "a.mem.edit": "Kelola",
  "a.md.title": "Kelola member", "a.md.profile": "Profil", "a.md.membership": "Membership", "a.md.activate": "Aktifkan / perpanjang paket", "a.md.activateHint": "Menambah durasi paket. Diperpanjang dari tanggal berakhir jika masih aktif, kalau sudah habis mulai hari ini.",
  "a.md.plan.Monthly": "Monthly (30 hari)", "a.md.plan.3 Month": "3 Month (90 hari)", "a.md.plan.Annual": "Annual (365 hari)", "a.md.apply": "Terapkan paket", "a.md.manual": "Edit manual", "a.md.memberNo": "No. Member", "a.md.noPlan": "Tanpa paket", "a.md.save": "Simpan perubahan", "a.md.saved": "Tersimpan.", "a.md.waiver": "Waiver form sudah diisi", "a.md.history": "Riwayat kehadiran", "a.md.attended": "hadir",
  "a.qr.title": "QR Absen", "a.qr.today": "QR hari ini", "a.qr.hint": "Member scan QR ini untuk absen. QR ganti otomatis setiap hari dan berlaku seharian, dari 30 menit sebelum kelas mulai sampai tengah malam, jadi member masih bisa absen setelah latihan.", "a.qr.print": "Cetak", "a.qr.printWeek": "Cetak 7 hari ke depan", "a.qr.day": "Berlaku pada", "a.qr.scan": "Scan untuk absen", "a.qr.unavailable": "QR tidak tersedia.", "a.qr.sheetHint": "Satu QR per hari. Tampilkan atau pasang QR sesuai tanggalnya.",
  "gi.label": "Ukuran gi", "gi.own": "Bawa gi sendiri", "gi.none": "Belum diisi", "gi.kids": "Anak", "gi.adult": "Dewasa",
  "auth.gi": "Ukuran gi (opsional)", "auth.giHelp": "Supaya kami bisa menyiapkan gi kalau kamu butuh.",
  "prof.gi": "Ukuran gi", "prof.giSave": "Simpan",
  "a.ses.giTitle": "Gi yang perlu disiapkan", "a.ses.giHelp": "Berdasarkan member yang booking atau hadir di kelas ini.", "a.ses.giNone": "Belum ada gi yang perlu disiapkan.", "a.ses.giUnknown": "Ukuran belum diisi", "a.ses.who": "Siapa saja yang datang", "a.ses.count": "{n} member",
  "a.attendance": "Kehadiran",
  "a.sch.intro": "Atur kelas rutin di sini. Perubahan otomatis berlaku untuk kelas yang akan datang.", "a.sch.addClass": "+ Tambah kelas", "a.sch.edit": "Ubah", "a.sch.saveBtn": "Simpan", "a.sch.deleteBtn": "Hapus kelas",
  "a.sch.noClass": "Tidak ada kelas", "a.sch.active": "Aktif", "a.sch.note": "Kelas yang sudah ada booking tidak diubah.", "a.sch.saved": "Tersimpan.",
  "a.att.title": "Kehadiran", "a.att.intro": "Buka kelas untuk melihat siapa yang datang dan konfirmasi kehadiran.",
  "a.ses.cancelClass": "Batalkan kelas ini", "a.ses.cancelHelp": "Menghapus kelas ini beserta semua booking-nya. Member tidak diberi tahu.", "a.ses.cancelConfirm": "Ya, batalkan kelas",
  "a.ses.newPerson": "Tambah orang baru (belum punya akun)", "a.ses.guestHelp": "Untuk walk-in yang belum punya akun. Kalau nanti mendaftar dengan no. telepon atau email yang sama, datanya otomatis menyatu.",
  "a.ses.nameLbl": "Nama lengkap", "a.ses.phoneLbl": "Telepon (opsional)", "a.ses.emailLbl": "Email (opsional)", "a.ses.undo": "Tekan lagi untuk membatalkan", "a.mem.guest": "Belum punya akun", "a.ses.added": "Ditambahkan.",
  "a.md.merge": "Gabungkan ke akun", "a.md.mergeHelp": "Orang ini belum punya akun. Kalau dia sudah mendaftar dengan no. telepon atau email yang berbeda, pilih akunnya di sini. Kehadiran, paket, dan datanya dipindahkan, lalu catatan ini dihapus.", "a.md.mergePick": "Pilih akun", "a.md.mergeBtn": "Gabungkan",
  "c.logout": "Keluar", "c.save": "Simpan", "c.search": "Cari", "c.clear": "Reset",
};

const dict = { en, id } as const;

const DAYS: Record<string, string> = { Mon: "Sen", Tue: "Sel", Wed: "Rab", Thu: "Kam", Fri: "Jum", Sat: "Sab", Sun: "Min" };
const TEXT_ID: Record<string, string> = {
  Adults: "Dewasa", "Kids, Adults, and Family": "Anak, Dewasa, dan Keluarga", "4+ yo and above": "Usia 4 tahun ke atas",
  "By Appointment": "Dengan janji", "1 hr": "1 jam",
};
const WEEKDAYS = {
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  id: ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"],
};

export async function getLang(): Promise<Lang> {
  const c = (await cookies()).get("lang")?.value;
  if (c === "en" || c === "id") return c;
  const al = (await headers()).get("accept-language") ?? "";
  return al.toLowerCase().startsWith("id") ? "id" : "en";
}

export function makeI18n(lang: Lang) {
  const loc = lang === "id" ? "id-ID" : "en-GB";
  const TZ = "Asia/Makassar"; // WITA (Bali)
  // fungsi biasa (bukan method) supaya aman dipakai lewat destructuring: const { range } = await getI18n()
  const time = (iso: string) => new Date(iso).toLocaleTimeString("en-US", { timeZone: TZ, hour: "numeric", minute: "2-digit" });
  return {
    lang,
    t: (key: Key, vars?: Record<string, string | number>) =>
      dict[lang][key].replace(/\{(\w+)\}/g, (_, k) => String(vars?.[k] ?? "")),
    // teks kelas dari database (hari, audiens, durasi) ikut diterjemahkan
    x: (text: string | null | undefined) => {
      if (!text) return "";
      if (lang === "en") return text;
      return TEXT_ID[text] ?? text.replace(/\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\b/g, (d) => DAYS[d]);
    },
    weekday: (n: number) => WEEKDAYS[lang][n],
    date: (iso: string) => new Date(iso).toLocaleDateString(loc, { timeZone: TZ, weekday: "short", day: "numeric", month: "short" }),
    dateLong: (iso: string) => new Date(iso).toLocaleDateString(loc, { timeZone: TZ, weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    dateShort: (iso: string) => new Date(iso).toLocaleDateString(loc, { timeZone: TZ, day: "2-digit", month: "short", year: "numeric" }),
    time,
    range: (a: string, b: string) => `${time(a)} - ${time(b)}`,
  };
}

export async function getI18n() {
  return makeI18n(await getLang());
}

export type I18n = ReturnType<typeof makeI18n>;
