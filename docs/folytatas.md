# Folytatás – hol tartunk (2026-11-24)

## Kész
- 1. fázis: statikus, mobil-first oldal (`index.html`), admin (`admin.html`), jogi oldalak sablonja.
- Git repó, private GitHub: https://github.com/vaktorsamuel-dot/hollywood-fodraszat-web (ág: main).
- README.md és CLAUDE.md a repóban.

## Következő: 2. fázis (még NEM kezdődött el, csak a terv van meg)
1. Adatbázis Supabase EU régióban: services, staff, staff_hours, time_off, bookings, customers, settings, content_blocks, profiles.
   Dupla foglalás elleni védelem: `EXCLUDE USING gist` a bookings táblán + `create_booking` RPC függvény. RLS minden táblán.
2. A `Store` (`assets/js/common.js`) lecserélése Supabase-kliensre (aszinkron). `app.js` és `admin.js` átírása async-re. A `freeSlots` marad.
3. Valódi admin belépés (Supabase Auth, email + jelszó), szerepkörök: tulajdonos, fodrász. PIN kikerül.
4. Visszaigazoló email lemondási linkkel (Edge Function + Resend). Saját domain kell hozzá.
5. Tesztek: dupla foglalás, RLS, mobil.

## Amit a tulajdonostól / Samutól kérek a folytatáshoz
- Supabase projekt EU régióban: Project URL + anon kulcs (service-role kulcsot NE chatbe, csak lokális .env).
- Opcionális: Supabase CLI (`brew install supabase/tap/supabase`, `supabase login`).
- Resend fiók + API kulcs, és saját domain (email nélkül is el lehet indulni, később kapcsolható be).
- Első tulajdonos email-címe az admin belépéshez.
- Lemondási határidő (javaslat: 2 óra) és max. előre foglalás (jelenleg 60 nap).

## Nyitott döntések
- Email nélkül induljunk-e (javaslat: igen).
- Tartalom tárolása: JSON dokumentum + külön táblák a szolgáltatásoknak/fodrászoknak (javaslat: igen).
- Hosting előnézetre: GitHub Pages / Cloudflare Pages / csak lokális szerver.

## Tartalmi TODO (tulajdonos adja)
Árak és időtartamok, fodrászok nevei/fotói, logó, galéria képek, Instagram, cégnév, székhely, nyilvántartási szám, adószám, tárhelyszolgáltató.

## Helyi megnyitás
`cd hollywood-fodraszat-web && python3 -m http.server 8000`, majd http://localhost:8000 (admin: /admin.html).
