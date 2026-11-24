/* Nyilvános oldal: tartalom megjelenítése és az időpontfoglalási folyamat. */
(function () {
  var H = window.HW, esc = H.esc;
  var C = H.Store.getContent();
  H.applyTheme(C);

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  var ICON = {
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>'
  };

  function mapsUrl() {
    return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(C.business.address + ", Miskolc");
  }
  function activeServices() { return C.services.filter(function (s) { return s.active !== false; }); }
  function activeStaff() { return C.staff.filter(function (s) { return s.active !== false; }); }
  function svcById(id) { return C.services.filter(function (s) { return s.id === id; })[0]; }
  function staffById(id) { return C.staff.filter(function (s) { return s.id === id; })[0]; }

  /* ---------- statikus szekciók ---------- */
  function renderStatic() {
    var b = C.business;
    document.title = "Férfi fodrászat Miskolc, online időpontfoglalás | " + b.shortName;

    $("#brandLogo").innerHTML = b.logo
      ? '<img src="' + esc(b.logo) + '" alt="' + esc(b.name) + ' logó">'
      : '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22" fill="#0B2A5B"/><text x="24" y="31" text-anchor="middle" font-family="Impact,Arial Narrow,sans-serif" font-size="22" fill="#fff">H</text><path d="M8 38h32" stroke="#D7263D" stroke-width="3" stroke-linecap="round"/></svg>';
    $("#brandText").innerHTML = esc(b.shortName) + "<small>Fodrászat</small>";

    var links = [["rolunk", C.about.title], ["szolgaltatasok", "Szolgáltatások"], ["csapat", "Csapat"]];
    if (C.gallery.length) links.push(["galeria", "Galéria"]);
    links.push(["kapcsolat", C.contact.title]);
    $("#nav").innerHTML = links.map(function (l) { return '<a href="#' + l[0] + '">' + esc(l[1]) + "</a>"; }).join("") +
      '<a class="btn btn-red" href="#foglalas">' + esc(C.hero.cta) + "</a>";

    $("#hero").innerHTML = '<div class="wrap">' +
      '<div class="status" id="status"><span class="dot"></span><span></span></div>' +
      "<h1>" + esc(C.hero.title) + "</h1>" +
      '<div class="sub">' + esc(C.hero.subtitle) + "</div>" +
      "<p>" + esc(C.hero.text) + "</p>" +
      '<div class="actions"><a class="btn btn-red" href="#foglalas">' + esc(C.hero.cta) + '</a>' +
      '<a class="btn btn-line" href="tel:' + esc(b.phone) + '">' + ICON.phone + " " + esc(b.phoneDisplay) + "</a></div></div>";
    updateStatus();

    $("#rolunk").innerHTML = '<div class="wrap"><div class="sec-head"><h2>' + esc(C.about.title) + "</h2></div>" +
      '<p class="about-text">' + esc(C.about.text) + "</p>" +
      '<div class="grid features">' + C.about.features.map(function (f) {
        return '<div class="card feature"><h3>' + esc(f.title) + "</h3><p>" + esc(f.text) + "</p></div>";
      }).join("") + "</div>" +
      '<p style="margin-top:22px"><a class="btn btn-blue btn-sm" href="' + esc(mapsUrl()) + '" target="_blank" rel="noopener">' + ICON.pin + " Útvonal ide</a></p></div>";

    $("#szolgaltatasok").innerHTML = '<div class="wrap"><div class="sec-head"><h2>Szolgáltatások</h2><p>Válaszd ki, mire van szükséged, és foglalj időpontot.</p></div>' +
      '<div class="grid cols-2">' + activeServices().map(function (s) {
        return '<div class="card svc"><div class="svc-top"><span class="svc-name">' + esc(s.name) + '</span><span class="svc-price">' + esc(H.formatPrice(s.price)) + "</span></div>" +
          '<div class="svc-meta">' + (s.category ? '<span class="tag">' + esc(s.category) + "</span>" : "") + esc(s.duration) + " perc</div>" +
          "<div>" + esc(s.desc) + '</div><div><button class="btn btn-red btn-sm" data-svc="' + esc(s.id) + '">Foglalok</button></div></div>';
      }).join("") + "</div></div>";

    var staff = activeStaff();
    $("#csapat").innerHTML = '<div class="wrap"><div class="sec-head"><h2>Csapat</h2></div><div class="grid cols-3">' + staff.map(function (s) {
      return '<div class="card staff"><div class="avatar">' + (s.photo ? '<img src="' + esc(s.photo) + '" alt="' + esc(s.name) + '">' : esc((s.name || "?").charAt(0))) +
        "</div><h3>" + esc(s.name) + "</h3><p>" + esc(s.bio) + '</p><button class="btn btn-blue btn-sm" data-staff="' + esc(s.id) + '">Foglalás hozzá</button></div>';
    }).join("") + "</div></div>";

    var gal = $("#galeria");
    gal.hidden = !C.gallery.length;
    if (C.gallery.length) gal.innerHTML = '<div class="wrap"><div class="sec-head"><h2>Galéria</h2></div><div class="grid gallery">' +
      C.gallery.map(function (g) { return '<img loading="lazy" src="' + esc(g.url) + '" alt="' + esc(g.alt || "Hollywood fodrászat munka") + '">'; }).join("") + "</div></div>";

    var gc = $("#ajandekkartya");
    gc.hidden = !C.giftcard.enabled;
    if (C.giftcard.enabled) gc.innerHTML = '<div class="wrap"><div class="gift"><div><h2>' + esc(C.giftcard.title) + "</h2><p>" + esc(C.giftcard.text) + "</p></div></div></div>";

    var today = new Date().getDay();
    $("#kapcsolat").innerHTML = '<div class="wrap"><div class="sec-head"><h2>' + esc(C.contact.title) + "</h2><p>" + esc(C.contact.text) + '</p></div><div class="contact-grid"><div class="card">' +
      '<div class="ci">' + ICON.pin + "<div>" + esc(b.address) + (b.addressNote ? " (" + esc(b.addressNote) + ")" : "") + '<br><a href="' + esc(mapsUrl()) + '" target="_blank" rel="noopener">Útvonal a Google Térképen</a></div></div><br>' +
      '<div class="ci">' + ICON.phone + '<div><a href="tel:' + esc(b.phone) + '">' + esc(b.phoneDisplay) + "</a></div></div><br>" +
      '<div class="ci">' + ICON.mail + '<div><a href="mailto:' + esc(b.email) + '">' + esc(b.email) + "</a></div></div>" +
      (b.facebook ? '<br><div class="ci">' + ICON.cal + '<div><a href="' + esc(b.facebook) + '" target="_blank" rel="noopener">Facebook oldalunk</a></div></div>' : "") +
      (b.instagram ? '<br><div class="ci">' + ICON.cal + '<div><a href="' + esc(b.instagram) + '" target="_blank" rel="noopener">Instagram</a></div></div>' : "") +
      '</div><div class="card"><h3>Nyitvatartás</h3><table class="hours-t">' + C.hours.map(function (h) {
        return '<tr class="' + (h.dow === today ? "today" : "") + '"><td>' + esc(h.name) + "</td><td>" + (h.open && h.close ? esc(h.open) + " – " + esc(h.close) : '<span class="closed">Zárva</span>') + "</td></tr>";
      }).join("") + "</table></div></div></div>";

    $("#footCols").innerHTML = '<div><h3>' + esc(b.name) + "</h3><div>" + esc(b.address) + "<br>" + esc(b.phoneDisplay) + "<br>" + esc(b.email) + "</div></div>" +
      "<div><h3>Menü</h3>" + links.map(function (l) { return '<div><a href="#' + l[0] + '">' + esc(l[1]) + "</a></div>"; }).join("") + '<div><a href="#foglalas">Időpontfoglalás</a></div></div>' +
      "<div><h3>Kövess</h3>" + (b.facebook ? '<div><a href="' + esc(b.facebook) + '" target="_blank" rel="noopener">Facebook</a></div>' : "") +
      (b.instagram ? '<div><a href="' + esc(b.instagram) + '" target="_blank" rel="noopener">Instagram</a></div>' : "") + "</div>";
    $("#copy").textContent = "© " + new Date().getFullYear() + " " + b.name + ". Minden jog fenntartva.";

    $("#mobileBar").innerHTML = '<a href="tel:' + esc(b.phone) + '">' + ICON.phone + "Hívás</a>" +
      '<a class="main" href="#foglalas">' + ICON.cal + "Foglalás</a>" +
      '<a href="' + esc(mapsUrl()) + '" target="_blank" rel="noopener">' + ICON.pin + "Útvonal</a>";
  }

  function updateStatus() {
    var el = $("#status");
    if (!el) return;
    var st = H.openStatus(C);
    el.firstChild.className = "dot" + (st.open ? " on" : "");
    el.lastChild.textContent = st.text;
  }

  /* ---------- időpontfoglalás ---------- */
  var S = { step: "svc", services: [], staff: "any", dateKey: null, time: null, slotStaff: null, daysShown: 14, error: "", booking: null, form: { name: "", phone: "", email: "", note: "", consent: false } };

  function order() {
    var o = ["svc"];
    if (activeStaff().length > 1) o.push("staff");
    o.push("time", "data");
    return o;
  }
  function totalDur() {
    return S.services.reduce(function (a, id) { var s = svcById(id); return a + (s ? Number(s.duration) || 0 : 0); }, 0);
  }
  function totalPrice() {
    var sum = 0, known = true;
    S.services.forEach(function (id) { var s = svcById(id); if (!s || s.price === "" || isNaN(Number(s.price))) known = false; else sum += Number(s.price); });
    return known && S.services.length ? sum.toLocaleString("hu-HU") + " Ft" : "egyeztetés szerint";
  }
  function dayLabel(k) { var d = H.parseKey(k); return d.getFullYear() + ". " + H.MONTHS[d.getMonth()] + " " + d.getDate() + ". (" + H.DAYS[d.getDay()] + ")"; }

  function availableDays() {
    var bookings = H.Store.getBookings(), out = [], now = new Date(), dur = totalDur(), i;
    for (i = 0; i <= Number(C.settings.maxAdvanceDays || 60); i++) {
      var d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
      var slots = H.freeSlots(C, bookings, d, dur, S.staff, now);
      if (slots.length) out.push({ key: H.dateKey(d), d: d, slots: slots });
    }
    return out;
  }

  function stepper(cur) {
    var o = order(), idx = o.indexOf(cur);
    return '<div class="steps" aria-hidden="true">' + o.map(function (k, i) { return '<div class="step ' + (i < idx ? "done" : i === idx ? "now" : "") + '"></div>'; }).join("") + "</div>";
  }

  function bookingHtml() {
    var o = order(), html = "", st = S.step;
    if (st === "done") return doneHtml();
    var idx = o.indexOf(st), label = (idx + 1) + " / " + o.length;
    html += stepper(st);

    if (st === "svc") {
      html += '<div class="step-label">' + label + '</div><h3>Mit szeretnél?</h3>';
      html += activeServices().map(function (s) {
        var sel = S.services.indexOf(s.id) !== -1;
        return '<button type="button" class="opt ' + (sel ? "sel" : "") + '" data-pick-svc="' + esc(s.id) + '" aria-pressed="' + sel + '"><span class="tick">' + (sel ? "✓" : "") + "</span>" +
          "<span><b>" + esc(s.name) + "</b><small>" + esc(s.duration) + " perc</small></span><span class=\"right\">" + esc(H.formatPrice(s.price)) + "</span></button>";
      }).join("");
      html += S.services.length ? '<p class="svc-meta">Összesen: ' + totalDur() + " perc, " + esc(totalPrice()) + "</p>" : "";
      html += '<div class="nav-row"><button class="btn btn-red" data-next ' + (S.services.length ? "" : "disabled") + ">Tovább</button></div>";
    }

    if (st === "staff") {
      html += '<div class="step-label">' + label + '</div><h3>Kihez?</h3>';
      html += '<button type="button" class="opt radio ' + (S.staff === "any" ? "sel" : "") + '" data-pick-staff="any"><span class="tick">' + (S.staff === "any" ? "●" : "") + "</span><span><b>Bárki, aki ráér</b><small>Így több szabad időpont közül választhatsz</small></span></button>";
      html += activeStaff().map(function (s) {
        var sel = S.staff === s.id;
        return '<button type="button" class="opt radio ' + (sel ? "sel" : "") + '" data-pick-staff="' + esc(s.id) + '"><span class="tick">' + (sel ? "●" : "") + "</span><span><b>" + esc(s.name) + "</b></span></button>";
      }).join("");
      html += '<div class="nav-row"><button class="btn btn-line dark" data-prev>Vissza</button><button class="btn btn-red" data-next>Tovább</button></div>';
    }

    if (st === "time") {
      var days = availableDays();
      if (S.dateKey && !days.some(function (d) { return d.key === S.dateKey; })) { S.dateKey = null; S.time = null; }
      html += '<div class="step-label">' + label + '</div><h3>Mikor?</h3>';
      if (!days.length) {
        html += '<div class="empty">Az elkövetkező időszakban nincs szabad időpont erre a szolgáltatásra. Hívj minket: <a href="tel:' + esc(C.business.phone) + '">' + esc(C.business.phoneDisplay) + "</a>.</div>";
      } else {
        var shown = days.slice(0, S.daysShown);
        html += '<div class="days" role="listbox" aria-label="Nap">' + shown.map(function (d) {
          return '<button type="button" class="day ' + (d.key === S.dateKey ? "sel" : "") + '" data-day="' + d.key + '"><span>' + H.DAYS_SHORT[d.d.getDay()] + "</span><b>" + d.d.getDate() + "</b><span>" + H.MONTHS[d.d.getMonth()] + "</span></button>";
        }).join("") + "</div>";
        if (days.length > shown.length) html += '<p><button type="button" class="btn btn-line dark btn-sm" data-more-days>Több nap</button></p>';
        if (S.dateKey) {
          var cur = days.filter(function (d) { return d.key === S.dateKey; })[0];
          html += '<p class="svc-meta" style="margin-top:6px">' + esc(dayLabel(S.dateKey)) + "</p><div class=\"slots\">" + cur.slots.map(function (sl) {
            return '<button type="button" class="slot ' + (S.time === sl.time ? "sel" : "") + '" data-slot="' + sl.time + '" data-slot-staff="' + esc(sl.staffId) + '">' + sl.time + "</button>";
          }).join("") + "</div>";
        } else html += '<p class="svc-meta">Válassz egy napot.</p>';
      }
      html += '<div class="nav-row"><button class="btn btn-line dark" data-prev>Vissza</button><button class="btn btn-red" data-next ' + (S.time ? "" : "disabled") + ">Tovább</button></div>";
    }

    if (st === "data") {
      var stf = staffById(S.slotStaff);
      html += '<div class="step-label">' + label + '</div><h3>Az adataid</h3><div class="summary">' +
        "<div><span>Szolgáltatás</span><b>" + esc(S.services.map(function (id) { var s = svcById(id); return s ? s.name : ""; }).join(" + ")) + "</b></div>" +
        "<div><span>Időpont</span><b>" + esc(dayLabel(S.dateKey)) + " " + esc(S.time) + "</b></div>" +
        "<div><span>Időtartam</span><b>" + totalDur() + " perc</b></div>" +
        (stf ? "<div><span>Fodrász</span><b>" + esc(stf.name) + "</b></div>" : "") +
        "<div><span>Ár</span><b>" + esc(totalPrice()) + "</b></div></div>";
      html += S.error ? '<p class="err" role="alert">' + esc(S.error) + "</p>" : "";
      html += '<form id="bookForm" novalidate>' +
        '<label class="f">Név<input class="in" name="name" autocomplete="name" required value="' + esc(S.form.name) + '"></label>' +
        '<label class="f">Telefonszám<input class="in" name="phone" type="tel" inputmode="tel" autocomplete="tel" required value="' + esc(S.form.phone) + '"></label>' +
        '<label class="f">Email<input class="in" name="email" type="email" inputmode="email" autocomplete="email" required value="' + esc(S.form.email) + '"></label>' +
        '<label class="f">Megjegyzés (nem kötelező)<textarea class="in" name="note">' + esc(S.form.note) + "</textarea></label>" +
        '<input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">' +
        '<label class="check"><input type="checkbox" name="consent" ' + (S.form.consent ? "checked" : "") + '><span>Elolvastam és elfogadom az <a href="adatvedelem.html" target="_blank" rel="noopener">adatkezelési tájékoztatót</a>.</span></label>' +
        '<div class="nav-row"><button type="button" class="btn btn-line dark" data-prev>Vissza</button><button type="submit" class="btn btn-red">Foglalás elküldése</button></div></form>';
    }
    return html;
  }

  function doneHtml() {
    var b = S.booking, stf = staffById(b.staffId);
    return '<div class="ok-box"><div class="ok-icon" aria-hidden="true">✓</div><h3>Köszönjük, a foglalás rögzítve</h3>' +
      '<p>' + esc(dayLabel(b.date)) + " " + esc(b.start) + "-kor várunk" + (stf ? " (" + esc(stf.name) + ")" : "") + ".</p>" +
      '<p class="svc-meta">Foglalási kód</p><div class="code">' + esc(b.code) + "</div>" +
      '<p class="svc-meta">Lemondáshoz vagy módosításhoz hívj: <a href="tel:' + esc(C.business.phone) + '">' + esc(C.business.phoneDisplay) + "</a>.</p>" +
      '<div class="nav-row" style="flex-direction:column"><button class="btn btn-blue" data-ics>Mentés a naptárba</button><button class="btn btn-line dark" data-reset>Új foglalás</button></div>' +
      (C.settings.demoMode ? '<div class="notice"><b>Bemutató üzemmód:</b> az időpont most csak ezen az eszközön van elmentve, a fodrász még nem látja. Az éles változatban a foglalás közös adatbázisba kerül, és emailben visszaigazolást küld.</div>' : "") +
      "</div>";
  }

  function renderBooking(scroll) {
    var host = $("#foglalas");
    host.innerHTML = '<div class="wrap"><div class="sec-head"><h2>Időpontfoglalás</h2><p>Négy lépés, regisztráció nélkül.</p></div><div class="book-card" id="bookCard">' + bookingHtml() + "</div></div>";
    if (scroll) $("#bookCard").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function go(dir) {
    var o = order(), i = o.indexOf(S.step) + dir;
    if (i >= 0 && i < o.length) { S.step = o[i]; S.error = ""; renderBooking(true); }
  }

  function readForm(form) {
    S.form.name = form.name.value.trim();
    S.form.phone = form.phone.value.trim();
    S.form.email = form.email.value.trim();
    S.form.note = form.note.value.trim();
    S.form.consent = form.consent.checked;
  }

  function submitBooking(form) {
    readForm(form);
    if (form.website.value) return; /* spam csapda */
    var f = S.form;
    if (f.name.length < 2) { S.error = "Add meg a neved."; return renderBooking(); }
    if (!/^[+0-9 ()\/-]{7,}$/.test(f.phone)) { S.error = "Adj meg egy érvényes telefonszámot."; return renderBooking(); }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)) { S.error = "Adj meg egy érvényes email címet."; return renderBooking(); }
    if (!f.consent) { S.error = "A foglaláshoz el kell fogadnod az adatkezelési tájékoztatót."; return renderBooking(); }

    var bookings = H.Store.getBookings(), dur = totalDur(), d = H.parseKey(S.dateKey);
    var slots = H.freeSlots(C, bookings, d, dur, S.staff);
    var slot = slots.filter(function (s) { return s.time === S.time; })[0];
    if (!slot) { S.error = "Ezt az időpontot közben lefoglalták. Válassz másikat."; S.step = "time"; S.time = null; return renderBooking(true); }

    var b = {
      id: H.uid("bk"), code: "HW-" + Math.random().toString(36).slice(2, 6).toUpperCase(),
      serviceIds: S.services.slice(), staffId: slot.staffId, date: S.dateKey, start: S.time, duration: dur,
      name: f.name, phone: f.phone, email: f.email, note: f.note, status: "visszaigazolt", createdAt: new Date().toISOString()
    };
    bookings.push(b);
    if (!H.Store.saveBookings(bookings)) { S.error = "A foglalást nem sikerült elmenteni. Hívj minket telefonon."; return renderBooking(); }
    S.booking = b; S.step = "done";
    renderBooking(true);
  }

  function downloadIcs() {
    var b = S.booking, st = b.date.replace(/-/g, "") + "T" + b.start.replace(":", "") + "00";
    var en = b.date.replace(/-/g, "") + "T" + H.fromMin(H.toMin(b.start) + b.duration).replace(":", "") + "00";
    var names = b.serviceIds.map(function (id) { var s = svcById(id); return s ? s.name : ""; }).join(" + ");
    var txt = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Hollywood fodraszat//HU", "BEGIN:VEVENT", "UID:" + b.id + "@hollywood",
      "DTSTAMP:" + new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, ""), "DTSTART:" + st, "DTEND:" + en,
      "SUMMARY:Hollywood fodrászat – " + names, "LOCATION:" + C.business.address, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([txt], { type: "text/calendar" }));
    a.download = "hollywood-idopont.ics";
    document.body.appendChild(a); a.click(); a.remove();
  }

  function resetBooking() {
    S.step = "svc"; S.services = []; S.staff = activeStaff().length === 1 ? activeStaff()[0].id : "any";
    S.dateKey = null; S.time = null; S.booking = null; S.error = ""; S.daysShown = 14;
    S.form.note = ""; S.form.consent = false;
  }

  document.addEventListener("click", function (e) {
    var t = e.target.closest("button, a");
    if (!t) return;
    if (t.hasAttribute("data-svc")) { resetBooking(); S.services = [t.getAttribute("data-svc")]; S.step = order()[1]; renderBooking(true); return; }
    if (t.hasAttribute("data-staff")) { resetBooking(); S.staff = t.getAttribute("data-staff"); renderBooking(true); return; }
    if (t.hasAttribute("data-pick-svc")) {
      var id = t.getAttribute("data-pick-svc"), i = S.services.indexOf(id);
      if (i === -1) S.services.push(id); else S.services.splice(i, 1);
      S.dateKey = null; S.time = null; renderBooking(); return;
    }
    if (t.hasAttribute("data-pick-staff")) { S.staff = t.getAttribute("data-pick-staff"); S.dateKey = null; S.time = null; renderBooking(); return; }
    if (t.hasAttribute("data-day")) { S.dateKey = t.getAttribute("data-day"); S.time = null; renderBooking(); var sl = $(".slots"); if (sl) sl.scrollIntoView({ behavior: "smooth", block: "nearest" }); return; }
    if (t.hasAttribute("data-more-days")) { S.daysShown += 14; renderBooking(); return; }
    if (t.hasAttribute("data-slot")) { S.time = t.getAttribute("data-slot"); S.slotStaff = t.getAttribute("data-slot-staff"); renderBooking(); return; }
    if (t.hasAttribute("data-next")) { go(1); return; }
    if (t.hasAttribute("data-prev")) { var f = $("#bookForm"); if (f) readForm(f); go(-1); return; }
    if (t.hasAttribute("data-ics")) { downloadIcs(); return; }
    if (t.hasAttribute("data-reset")) { resetBooking(); renderBooking(true); return; }
    if (t.id === "cookieOpen") { e.preventDefault(); showCookie(true); return; }
  });
  document.addEventListener("submit", function (e) {
    if (e.target.id === "bookForm") { e.preventDefault(); submitBooking(e.target); }
  });

  /* ---------- menü ---------- */
  function initNav() {
    var tg = $("#navToggle"), nav = $("#nav");
    tg.addEventListener("click", function () {
      var o = nav.classList.toggle("open");
      tg.setAttribute("aria-expanded", o ? "true" : "false");
    });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) { nav.classList.remove("open"); tg.setAttribute("aria-expanded", "false"); } });
  }

  /* ---------- süti-beállítások ---------- */
  function showCookie(force) {
    var box = $("#cookie"), cur = H.Store.getConsent();
    if (cur && !force) { box.hidden = true; return; }
    var c = cur || { prefs: false, stats: false, marketing: false };
    box.hidden = false;
    box.innerHTML = '<p><b>Sütik</b><br>Az oldal csak a működéshez szükséges adatokat használja (például a foglalás mentése). Statisztikai és marketing sütiket csak a hozzájárulásoddal használnánk. Részletek: <a href="adatvedelem.html">adatvédelem</a>.</p>' +
      '<div class="row"><button class="btn btn-red btn-sm" data-ck="all">Elfogadom</button><button class="btn btn-line dark btn-sm" data-ck="none">Elutasítom</button><button class="btn btn-line dark btn-sm" data-ck="set">Beállítások</button></div>' +
      '<div class="cookie-set" id="ckSet" hidden><label>Szükséges (mindig aktív)<input type="checkbox" checked disabled></label>' +
      '<label>Preferenciák<input type="checkbox" id="ckPrefs"' + (c.prefs ? " checked" : "") + '></label>' +
      '<label>Statisztika<input type="checkbox" id="ckStats"' + (c.stats ? " checked" : "") + '></label>' +
      '<label>Marketing<input type="checkbox" id="ckMkt"' + (c.marketing ? " checked" : "") + '></label>' +
      '<button class="btn btn-blue btn-sm" data-ck="save" style="width:100%;margin-top:6px">Beállítások mentése</button></div>';
  }
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-ck]");
    if (!t) return;
    var v = t.getAttribute("data-ck");
    if (v === "set") { $("#ckSet").hidden = false; return; }
    var c = v === "all" ? { prefs: true, stats: true, marketing: true } : v === "none" ? { prefs: false, stats: false, marketing: false } :
      { prefs: $("#ckPrefs").checked, stats: $("#ckStats").checked, marketing: $("#ckMkt").checked };
    H.Store.saveConsent(c);
    $("#cookie").hidden = true;
  });

  /* ---------- indítás ---------- */
  resetBooking();
  renderStatic();
  renderBooking(false);
  initNav();
  showCookie(false);
  setInterval(updateStatus, 60000);
})();
