# CLAUDE.md – Hollywood férfi fodrászat weboldal

Ez a fájl a projekt szabályait és a feladatot tartalmazza. Olvasd el a README.md-vel együtt, mielőtt bármit módosítasz.

## Állapot (2026-11-24)

- A repó létezik: https://github.com/vaktorsamuel-dot/hollywood-fodraszat-web (private, ág: main).
- Az 1. fázis kész: statikus, mobil-first oldal (`index.html`), admin (`admin.html`), jogi oldalak sablonja (`impresszum.html`, `adatvedelem.html`, `aszf.html`), tartalom az `assets/js/data.js`-ben, tárolás és időpontszámítás az `assets/js/common.js`-ben.
- A foglalások és az admin módosítások jelenleg a böngésző localStorage-ában vannak (bemutató mód). Ez a következő fázisban cserélendő közös adatbázisra. Ne építsd újra az 1. fázist, építs rá.

## Feladat

Teljes, reszponzív, magyar nyelvű weboldal a Hollywood férfi fodrászatnak (Miskolc), online időpontfoglalással és teljesen szerkeszthető tartalommal. Mintának a https://barbershopmiskolc.hu/ felépítése és funkciói szolgálnak, de a színvilág kék–piros.

## Szabályok

- Pontosan azt építsd, ami le van írva. Ha egy adat hiányzik (ár, fodrász neve, nyitvatartás), ne találj ki semmit: látható TODO placeholder legyen, és kerüljön a szerkeszthető adatok közé.
- A barbershopmiskolc.hu-ról csak a felépítést, az elrendezés logikáját és a funkciókat vedd mintának. Szöveget, képet, logót, app-képet ne másolj át, a szövegeket magyarul, saját megfogalmazásban írd.
- Minden tartalom szerkeszthető legyen az admin felületen, semmi ne legyen beégetve a HTML-be.
- Kis lépések, minden kész lépés után commit, érthető magyar commit üzenettel. Titkos kulcsot ne commitolj (.env a .gitignore-ban, csak .env.example).
- A fodrászat Facebook-képeit ne töltsd le és ne tedd az oldalra; a képeket a tulajdonos adja.
- Mobilon legyen a legkényelmesebb, gépen is jól nézzen ki.

## Ismert üzleti adatok

| Adat | Érték |
| --- | --- |
| Név | Hollywood férfi fodrászat |
| Cím | 3532 Miskolc, Andrássy Gyula u. 3. (D bejárat) |
| Telefon | +36 30 978 4624 |
| Email | hollywoodfodraszat@gmail.com |
| Facebook | https://www.facebook.com/hollywoodfodraszat/ |
| Nyitvatartás | kedd–péntek 10:00–18:00, szombat 10:00–15:00, vasárnap és hétfő zárva |
| Ársáv | közepes ($$ a Facebookon) |

Még nem ismert (TODO, a tulajdonos adja): szolgáltatások és bruttó árak, időtartamok, fodrászok nevei és fotói, logó, galéria képek, Instagram, cégnév, székhely, nyilvántartási szám, adószám, tárhelyszolgáltató.

## Oldalstruktúra

Fejléc (logó, menü: Rólunk, Szolgáltatások, Csapat, Galéria, Kapcsolat, foglalás gomb; mobilon lebegő Foglalás/Hívás/Útvonal sáv), hero nagy foglalás gombbal és "most nyitva" jelzéssel, rólunk három kiemeléssel és útvonal gombbal, szolgáltatások (leírás, időtartam, bruttó ár, "Foglalok"), csapat (fodrász kártyák), foglalás, galéria, ajándékkártya (ki/be kapcsolható), kapcsolat és nyitvatartás, lábléc (elérhetőségek, social, Adatvédelem, Impresszum, ÁSZF, szerzői jogi sor), süti-sáv (Elfogadom, Elutasítom, Beállítások; kategóriák: szükséges, preferenciák, statisztika, marketing).
Későbbi fázis, most ne építsd: mobilalkalmazás, hűségpontok, ügyfélprofil, hírlevél.

## Dizájn

Kék–piros, borbély hangulat. CSS változók (az admin cserélheti): főkék #0B2A5B, világoskék #1E5AA8, piros #D7263D, háttér #F3F5F8, szöveg #0F172A. A főgomb piros fehér szöveggel. Betűtípusok a repóban (self-host), ne Google szerverről. Kontraszt legalább WCAG AA.

## Foglalási rendszer (célállapot)

Vendég oldal: szolgáltatás(ok) választása, fodrász vagy "bárki", nap és szabad időpont, adatok (név, telefon, email, megjegyzés, kötelező adatkezelési elfogadás), visszaigazolás emailben lemondási linkkel.
Fodrász és tulajdonos oldal: napi és heti naptár fodrászonként (ki, mikor, mire, telefon), státusz (visszaigazolt, lemondva, megjelent, nem jelent meg), kézi foglalás, szabadság és zárt napok blokkolása.
Szabályok: szerveroldali ellenőrzés a dupla foglalás ellen, a szabad idősávok a szolgáltatás hosszából és a munkarendből jönnek, állítható legkorábbi/legkésőbbi foglalás és lemondási határidő, spam elleni védelem (rate limit, honeypot).

## Admin

Védett belépés (valódi szerveres), szerepkörök: tulajdonos (mindent szerkeszt), fodrász (csak a saját naptára). Szerkeszthető: szövegek, szolgáltatások (név, leírás, idő, bruttó ár, sorrend), fodrászok, nyitvatartás és kivételek, galéria, elérhetőségek, színek, jogi szövegek, foglalások. Az admin oldalak noindexek legyenek.

## Technikai irány (2. fázis)

Javaslat: Supabase EU régióban (adatbázis, bejelentkezés, képtárolás), tranzakciós email (pl. Resend), későbbi hosting Vercel, Netlify vagy Cloudflare Pages EU beállítással. A tárolás egyetlen helyen van (`Store` a `common.js`-ben), ezt kell lecserélni. Táblák: services, staff, staff_hours, time_off, bookings, customers, settings, content_blocks. Ha mást javasolsz, indokold, és kérdezz, mielőtt nagyot változtatsz.

Fázisok: 1. alap oldal (kész), 2. közös adatbázis és valódi foglalás, 3. valódi admin belépés és naptár, 4. SEO, jogi oldalak, süti-sáv finomítás, 5. emlékeztetők, galéria, ajándékkártya, értékelések.

## SEO és jogi

Magyar title és description, schema.org HairSalon JSON-LD, sitemap.xml, robots.txt, Open Graph kép. Az `index.html`-ben jelenleg `noindex` van: élesítéskor kell kivenni. A sitemap és robots PELDA-DOMAIN.hu helyére a valódi domain kerül. Süti: statisztika, marketing és Google térkép csak hozzájárulás után tölthet be. Az impresszum, adatkezelési tájékoztató és ÁSZF a tulajdonos adataival töltendő ki, jogi átnézés után.

## Elfogadási kritériumok

- [ ] A foglalás telefonon végigmegy, emailben visszaigazolás jön.
- [ ] Két vendég nem foglalhatja ugyanazt az időpontot ugyanannál a fodrásznál.
- [ ] Az adminban minden szöveg, ár, kép és nyitvatartás átírható.
- [ ] A fodrász látja a saját naptárát: ki, mikor, mire.
- [ ] A téma kék–piros, a színek az adminból állíthatók.
- [ ] Nincs kitalált adat, a hiányzók TODO-ként látszanak.
- [ ] Nincs lemásolt szöveg vagy kép a referenciaoldalról.
- [ ] Lighthouse teljesítmény és SEO mobilon legalább 90.
- [ ] README magyarul, titkos kulcsok nincsenek a repóban.
