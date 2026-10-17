// Data kontak dari origamibjjbali.com
export const site = {
  address: "Uluwatu St No.132, Ungasan, South Kuta, Badung Regency, Bali 80361, Indonesia",
  phone: "+62 813 3636 162",
  whatsapp: "628133636162",
  email: "info@origamibjjbali.com",
  instagram: "https://www.instagram.com/origamibjj/",
  mapsUrl: "https://www.google.com/maps/place/Origami+BJJ+(Brazilian+Jiu+Jitsu)+Uluwatu/@-8.8128916,115.1570942,17z/data=!3m1!4b1!4m6!3m5!1s0x2dd2450054027455:0x92f03825625f5854!8m2!3d-8.8128916!4d115.1570942!16s%2Fg%2F11ylty1hrc",
  rating: "5.0",
  reviewCount: 81,
};

export const waLink = (text = "Hi Origami BJJ, I'd like to ask about classes.") =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;
