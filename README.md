# Hollywood férfi fodrászat – weboldal (Miskolc)

Mobil-first, kék-piros weboldal online időpontfoglalással és admin felülettel. Ez az **1. fázis**: statikus oldal, amely hosta nélkül is megnyitható.

## Mi van benne

- `index.html`: nyilvános oldal (hero, rólunk, szolgáltatások, csapat, foglalás, kapcsolat, süti-sáv)
- `galeria.html`: külön galéria oldal nagyítással, a fejléc "Galéria" gombjáról nyílik
- `admin.html`: admin (foglalások naptára, szolgáltatások, fodrászok, nyitvatartás, szövegek, színek, galéria, mentés/import)
- `impresszum.html`, `adatvedelem.html`, `aszf.html`: jogi oldalak sablonja (a TODO mezőket a tulajdonos tölti ki)
- `assets/js/data.js`: az alap tartalom (cím, telefon, nyitvatartás, szolgáltatások)
- `assets/js/common.js`: tárolás, szabad időpontok számítása
- `assets/js/app.js`, `admin.js`: a két felület logikája

Az adatok a Facebook oldalról (hollywoodfodraszat) származnak: cím, telefon, email, nyitvatartás (kedd–péntek 10:00–18:00, szombat 10:00–15:00, vasárnap és hétfő zárva).

## Megnyitás

Dupla kattintás az `index.html`-re, vagy helyi szerver: `python3 -m http.server 8000`, majd http://localhost:8000.
Admin: `/admin.html`. Első belépéskor PIN kódot kell beállítani.

## Mit kell még megadni (TODO)

- Szolgáltatások árai (bruttó Ft) és pontos időtartamai: admin, Szolgáltatások fül. A mostani lista (hajvágás, szakáll, gyermek, női) a bolt kirakata alapján készült példa, az árak üresek.
- Fodrászok neve, fotója, bemutatkozása (jelenleg egy "Hollywood fodrász" helykitöltő van).
- Logó: tedd a `assets/img/` mappába, vagy töltsd fel az adminban (Elérhetőségek). Most egy egyszerű "H" jel látszik.
- Galéria képek: csak saját vagy engedélyezett képek.
- Jogi adatok (cégnév, székhely, adószám, tárhelyszolgáltató): admin, Elérhetőségek fül.
- Instagram link, ha van.

## Fontos korlát: ez bemutató változat

A foglalások és az admin módosítások **a böngészőben** (localStorage) tárolódnak. Ezért:

- a vendég foglalása csak azon az eszközön látszik, ahol készült, a fodrász telefonján nem,
- az admin PIN nem igazi védelem,
- emailes visszaigazolás nincs.

Ez a kinézet, a folyamat és a szerkeszthetőség kipróbálására jó. Éles használathoz a 2. fázis kell.

## 2. fázis: közös adatbázis (éles foglalás)

Javaslat: Supabase (EU régió) adatbázis és bejelentkezés, emailküldés (pl. Resend). A `Store` objektum (`assets/js/common.js`) az egyetlen hely, ahol tárolás történik, ezt kell lecserélni az adatbázis hívásaira. Teendők:

1. Táblák: services, staff, bookings, settings, content.
2. A foglalásnál szerveroldali ellenőrzés, hogy két vendég ne foglalhassa ugyanazt az időt (dupla foglalás elleni védelem).
3. Admin: valódi bejelentkezés, szerepkörök (tulajdonos, fodrász).
4. Visszaigazoló email lemondási linkkel.
5. `settings.demoMode` átállítása hamisra.

## Feltöltés GitHubra

```bash
cd hollywood-fodraszat-web
git init
git add .
git commit -m "Hollywood fodrászat weboldal első verzió"
git branch -M main
git remote add origin https://github.com/<felhasznalonev>/hollywood-fodraszat-web.git
git push -u origin main
```

A repót előbb hozd létre a GitHubon, kezdetben **private**. Jelszavakat, kulcsokat ne töltsd fel.
A GitHub Pages ehhez a statikus változathoz használható előnézetre (Settings, Pages). Az éles, adatbázisos változathoz külön hosting kell.

## Élesítés előtti ellenőrzőlista

- [ ] `index.html`-ből töröld a `noindex` meta sort (különben a Google nem indexel).
- [ ] `robots.txt` és `sitemap.xml`: a PELDA-DOMAIN.hu cseréje a valódi domainre.
- [ ] Jogi oldalak kitöltve és átnézve (lásd a külön jogi dokumentumot).
- [ ] Árak, fodrászok, logó, képek megadva.
- [ ] Google Cégprofil és Search Console beállítva.
- [ ] Betűtípus: a fejlécekhez rendszerfont-lánc van. Ha egyedi betűt akarsz (pl. Bebas Neue), a fájlokat tedd az `assets/fonts` mappába és `@font-face`-szel hivatkozd, ne Google szerverről töltsd.
