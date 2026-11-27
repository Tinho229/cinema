
export const footerData = {
  brand: "ATELIER",
  title: "GET IN\nTOUCH",
  menu: [
    { label: "MENU", href: "#menu" },
    { label: "ABOUT", href: "#about" },
    { label: "BOOK A TABLE", href: "#booking" },
  ],

  openingTitle: "AVANT-PREMIÈRE EXCLUSIVE",
  openingHours: [
    { day: "Date", hours: "22 Décembre 2026" },
    { day: "Heure", hours: "19H" },
    { day: "Lieu", hours: "Cotonou — Hôtel Mavilla" },
  ],
  ticketTitle: "Tarifs",
  tickets: [
    { category: "STANDARD", price: "5 000 F" },
    { category: "VIP", price: "10 000 F" },
    { category: "PRESTIGE", price: "15 000 F" },
  ],
  reservationPhone: "+229 01 47 24 40 56",
  tagline: "Ne manquez pas ce grand rendez-vous.",

  gallery: [
    { src: "/images/suitesMavilla/s1.webp", alt: "Fèmi — portrait", position: "center 20%" },
    { src: "/images/suitesMavilla/s2.webp", alt: "Scène du film — bureau", position: "32% center" },
    { src: "/images/suitesMavilla/s3.webp", alt: "Fèmi — attente", position: "center 20%" },
    { src: "/images/suitesMavilla/s4.webp", alt: "Scène du film — famille", position: "center 20%" },
  ],

  mainImage: "/images/footer/main.jpg",

  contactTitle: "CONTACT / ADDRESSE",
  addressLabel: "ADDRESS",
  address: ["Hôtel Mavilla, Cotonou, Bénin"],

  phoneLabel: "TELEPHONE",
  phone: "+229 01 97 19 83 00",

  emailLabel: "EMAIL",
  email: "hotelmavilla@yahoo.com",

  followLabel: "SITE",
  socials: [
    { label: "Mavilla", href: "https://hotelmavillacotonou.com" }
  ],

  // ---- Barre du bas : 4 petites portions ----
  // 1) LEBIATECH  2) LinkedIn  3) Facebook  4) TikTok
  site: { label: "LEBIATECH", href: "https://lebiatech.com" }, // TODO : URL exacte du site
  copyright: "© 2026 LEBIATECH",

  // TODO : remplace les "#" par les vrais liens des pages LEBIATECH
  networks: [
    { id: "linkedin" as const, label: "LinkedIn", href: "https://www.linkedin.com/company/lebiatech" },
    { id: "facebook" as const, label: "Facebook", href: "https://www.facebook.com/profile.php?id=61588115761284" },
    { id: "tiktok" as const, label: "TikTok", href: "https://www.tiktok.com/@lebiatechsolutions" },
  ],

  
};
