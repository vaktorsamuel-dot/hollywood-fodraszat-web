/* Hollywood férfi fodrászat – alap tartalom.
   Ezt az admin felületről (admin.html) lehet felülírni. A mentett módosítások a böngészőben tárolódnak,
   az "Exportálás" gombbal JSON-ba menthetők. Az éles (szerveres) változatban ez adatbázisból jön. */
window.DEFAULT_CONTENT = {
  business: {
    name: "Hollywood férfi fodrászat",
    shortName: "Hollywood",
    tagline: "Férfi fodrászat Miskolcon",
    phone: "+36309784624",
    phoneDisplay: "+36 30 978 4624",
    email: "hollywoodfodraszat@gmail.com",
    address: "3532 Miskolc, Andrássy Gyula u. 3.",
    addressNote: "D bejárat",
    facebook: "https://www.facebook.com/hollywoodfodraszat/",
    instagram: "",
    logo: "assets/img/logo.jpg"
  },
  hero: {
    title: "Hollywood",
    subtitle: "Férfi fodrászat · Miskolc",
    text: "Barber, férfi, női és gyermek hajvágás a belvárosban. Foglalj időpontot pár kattintással.",
    cta: "Időpontot foglalok"
  },
  about: {
    title: "Rólunk",
    text: "A Hollywood férfi fodrászat Miskolcon, az Andrássy Gyula utcában várja a vendégeit. Barber, férfi, női és gyermek hajvágás, rendezett szakáll és pontos időbeosztás. Foglalj időpontot online, és nem kell várakoznod.",
    features: [
      { title: "Időpontra dolgozunk", text: "Előre lefoglalt idősávok, így nincs várakozás." },
      { title: "Barber és hajvágás", text: "Férfi, női és gyermek hajvágás egy helyen." },
      { title: "Belváros", text: "Andrássy Gyula u. 3., D bejárat." }
    ]
  },
  hours: [
    { dow: 1, name: "Hétfő", open: "", close: "" },
    { dow: 2, name: "Kedd", open: "10:00", close: "18:00" },
    { dow: 3, name: "Szerda", open: "10:00", close: "18:00" },
    { dow: 4, name: "Csütörtök", open: "10:00", close: "18:00" },
    { dow: 5, name: "Péntek", open: "10:00", close: "18:00" },
    { dow: 6, name: "Szombat", open: "10:00", close: "15:00" },
    { dow: 0, name: "Vasárnap", open: "", close: "" }
  ],
  closedDates: [],
  services: [
    { id: "sv1", name: "Férfi hajvágás", desc: "Hajvágás igény szerint, mosás és befejező igazítás.", duration: 30, price: "", active: true, category: "Férfi" },
    { id: "sv2", name: "Szakáll igazítás", desc: "Szakáll formázás és élezés.", duration: 20, price: "", active: true, category: "Barber" },
    { id: "sv3", name: "Hajvágás + szakáll", desc: "Teljes csomag: haj és szakáll egy alkalommal.", duration: 45, price: "", active: true, category: "Barber" },
    { id: "sv4", name: "Gyermek hajvágás", desc: "Hajvágás gyerekeknek.", duration: 30, price: "", active: true, category: "Gyermek" },
    { id: "sv5", name: "Női hajvágás", desc: "Női hajvágás, igény szerint szárítással.", duration: 45, price: "", active: true, category: "Női" }
  ],
  staff: [
    { id: "st1", name: "Hollywood fodrász", bio: "A név és a bemutatkozás az adminban szerkeszthető.", photo: "", active: true, timeOff: [] }
  ],
  gallery: [
    { url: "assets/img/galeria/hollywood-01.jpg", alt: "Hajvágás – Hollywood fodrászat" },
    { url: "assets/img/galeria/hollywood-02.jpg", alt: "Hajvágás – Hollywood fodrászat" },
    { url: "assets/img/galeria/hollywood-03.jpg", alt: "Hajvágás – Hollywood fodrászat" },
    { url: "assets/img/galeria/hollywood-04.jpg", alt: "Hajvágás – Hollywood fodrászat" },
    { url: "assets/img/galeria/hollywood-05.jpg", alt: "Hajvágás – Hollywood fodrászat" },
    { url: "assets/img/galeria/hollywood-06.jpg", alt: "Hajvágás – Hollywood fodrászat" },
    { url: "assets/img/galeria/hollywood-07.jpg", alt: "Hajvágás – Hollywood fodrászat" },
    { url: "assets/img/galeria/hollywood-08.jpg", alt: "Hajvágás – Hollywood fodrászat" },
    { url: "assets/img/galeria/hollywood-09.jpg", alt: "Hajvágás – Hollywood fodrászat" },
    { url: "assets/img/galeria/hollywood-10.jpg", alt: "Hajvágás – Hollywood fodrászat" },
    { url: "assets/img/galeria/hollywood-11.jpg", alt: "Hajvágás – Hollywood fodrászat" },
    { url: "assets/img/galeria/hollywood-12.jpg", alt: "Hajvágás – Hollywood fodrászat" },
    { url: "assets/img/galeria/hollywood-13.jpg", alt: "A Hollywood fodrászat kirakata" },
    { url: "assets/img/galeria/hollywood-14.jpg", alt: "A szalon belső tere" }
  ],
  heroImage: "assets/img/szalon.jpg",
  giftcard: { enabled: false, title: "Ajándékkártya", text: "Ajándékkártyát a szalonban tudsz vásárolni, tetszőleges értékben." },
  contact: { title: "Kapcsolat", text: "Kérdésed van, vagy telefonon szeretnél időpontot kérni? Hívj, vagy írj nekünk." },
  settings: { minAdvanceHours: 2, maxAdvanceDays: 60, slotStep: 30, demoMode: true },
  theme: { blue: "#0B2A5B", blueLight: "#1E5AA8", red: "#D7263D" },
  legal: {
    companyName: "", seat: "", regNumber: "", taxNumber: "", hostName: "", hostAddress: "", hostEmail: "",
    retentionMonths: 12
  }
};
