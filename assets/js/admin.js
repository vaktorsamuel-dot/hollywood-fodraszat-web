/* Admin: foglalások, tartalom, szolgáltatások, fodrászok, nyitvatartás, színek.
   FIGYELEM: bemutató változat. A belépés (PIN) és az adatok a böngészőben vannak, ez nem biztonságos éles használatra.
   Éles üzemben szerveres belépés és adatbázis kell (lásd README, 2. fázis). */
(function () {
  var H = window.HW, esc = H.esc, S = H.Store;
  var C = S.getContent();
  var tab = "bookings";
  var authed = false;
  try { authed = sessionStorage.getItem("hw_admin") === "1"; } catch (e) {}
  var bkFilter = { date: H.dateKey(new Date()), staff: "all", upcoming: false, formOpen: false, err: "" };
  var app = document.getElementById("app");
  H.applyTheme(C);

  var STATUSES = ["visszaigazolt", "megjelent", "nem jelent meg", "lemondva"];
  var TABS = [["bookings", "Foglalások"], ["services", "Szolgáltatások"], ["staff", "Fodrászok"], ["hours", "Nyitvatartás"],
    ["texts", "Szövegek"], ["contact", "Elérhetőségek"], ["gallery", "Galéria"], ["theme", "Színek és beállítások"], ["data", "Adatok"]];

  function toast(msg) {
    var t = document.getElementById("toast");
    t.textContent = msg; t.className = "show";
    setTimeout(function () { t.className = ""; }, 2200);
  }
  function getP(o, p) { return p.split(".").reduce(function (a, k) { return a == null ? a : a[k]; }, o); }
  function setP(o, p, v) { var k = p.split("."), last = k.pop(); k.reduce(function (a, x) { return a[x]; }, o)[last] = v; }

  function field(label, path, opts) {
    opts = opts || {};
    var v = getP(C, path), type = opts.type || "text";
    if (type === "textarea") return "<label>" + esc(label) + '<textarea class="in" data-p="' + path + '">' + esc(v) + "</textarea></label>";
    if (type === "check") return '<label class="check"><input type="checkbox" data-p="' + path + '" ' + (v ? "checked" : "") + "><span>" + esc(label) + "</span></label>";
    return "<label>" + esc(label) + '<input class="in" type="' + type + '" data-p="' + path + '" value="' + esc(v) + '"' + (opts.attr ? " " + opts.attr : "") + "></label>";
  }
  function collectSimple(root) {
    Array.prototype.slice.call(root.querySelectorAll("[data-p]")).forEach(function (el) {
      var v = el.type === "checkbox" ? el.checked : el.type === "number" ? (el.value === "" ? "" : Number(el.value)) : el.value;
      setP(C, el.getAttribute("data-p"), v);
    });
  }
  function save(msg) {
    if (S.saveContent(C)) { H.applyTheme(C); toast(msg || "Mentve"); } else toast("Nem sikerült menteni (tele a tárhely?)");
  }

  /* ---------- képfeltöltés (átméretezve, a böngészőben tárolva) ---------- */
  function readImage(file, max) {
    return new Promise(function (res, rej) {
      var fr = new FileReader();
      fr.onerror = rej;
      fr.onload = function () {
        var img = new Image();
        img.onerror = rej;
        img.onload = function () {
          var k = Math.min(1, (max || 1200) / Math.max(img.width, img.height)), c = document.createElement("canvas");
          c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
          c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
          res(c.toDataURL("image/jpeg", 0.82));
        };
        img.src = fr.result;
      };
      fr.readAsDataURL(file);
    });
  }

  /* ---------- belépés ---------- */
  function loginView() {
    var pin = S.getPin();
    app.innerHTML = '<div class="wrap"><div class="a-card login"><h3>' + (pin ? "Belépés" : "PIN kód beállítása") + "</h3>" +
      '<div class="warn">Bemutató változat: a PIN csak ebben a böngészőben védi az admint. Éles használathoz szerveres belépés kell.</div>' +
      '<form id="loginForm"><label>PIN kód (legalább 4 karakter)<input class="in" type="password" id="pin" autocomplete="off" required minlength="4"></label>' +
      '<p class="err" id="loginErr" hidden></p><button class="btn btn-red" style="width:100%">' + (pin ? "Belépek" : "Beállítom és belépek") + "</button></form></div></div>";
    document.getElementById("loginForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var v = document.getElementById("pin").value, err = document.getElementById("loginErr");
      if (v.length < 4) { err.hidden = false; err.textContent = "Legalább 4 karakter kell."; return; }
      if (!pin) { S.savePin(H.hashPin(v)); } else if (H.hashPin(v) !== pin) { err.hidden = false; err.textContent = "Hibás PIN."; return; }
      authed = true;
      try { sessionStorage.setItem("hw_admin", "1"); } catch (x) {}
      render();
    });
  }

  /* ---------- fül: foglalások ---------- */
  function svcNames(ids) { return ids.map(function (id) { var s = C.services.filter(function (x) { return x.id === id; })[0]; return s ? s.name : "?"; }).join(" + "); }
  function staffName(id) { var s = C.staff.filter(function (x) { return x.id === id; })[0]; return s ? s.name : "?"; }

  function bookingsView() {
    var all = S.getBookings(), today = H.dateKey(new Date());
    var list = all.filter(function (b) {
      if (bkFilter.staff !== "all" && b.staffId !== bkFilter.staff) return false;
      return bkFilter.upcoming ? b.date >= today : b.date === bkFilter.date;
    }).sort(function (a, b) { return (a.date + a.start) < (b.date + b.start) ? -1 : 1; });
    var html = '<div class="a-card"><div class="a-row two"><label>Nap<input class="in" type="date" id="bkDate" value="' + esc(bkFilter.date) + '"></label>' +
      '<label>Fodrász<select class="in" id="bkStaff"><option value="all">Mindenki</option>' + C.staff.map(function (s) {
        return '<option value="' + esc(s.id) + '"' + (bkFilter.staff === s.id ? " selected" : "") + ">" + esc(s.name) + "</option>";
      }).join("") + "</select></label></div>" +
      '<label class="check"><input type="checkbox" id="bkUp" ' + (bkFilter.upcoming ? "checked" : "") + "><span>Minden jövőbeli foglalás</span></label>" +
      '<div class="a-actions"><button class="btn btn-red btn-sm" data-act="toggle-form">' + (bkFilter.formOpen ? "Mégse" : "Új foglalás (telefonos)") + "</button></div></div>";

    if (bkFilter.formOpen) {
      html += '<form class="a-card" id="manualForm"><h3>Új foglalás</h3>' + (bkFilter.err ? '<p class="err">' + esc(bkFilter.err) + "</p>" : "") +
        '<div class="a-row two"><label>Nap<input class="in" type="date" name="date" value="' + esc(bkFilter.date) + '" required></label><label>Kezdés<input class="in" type="time" name="time" required></label></div>' +
        '<div class="a-row"><label>Fodrász<select class="in" name="staff">' + C.staff.filter(function (s) { return s.active !== false; }).map(function (s) { return '<option value="' + esc(s.id) + '">' + esc(s.name) + "</option>"; }).join("") + "</select></label>" +
        '<label>Szolgáltatás<select class="in" name="svc" multiple size="' + Math.min(5, C.services.length) + '">' + C.services.filter(function (s) { return s.active !== false; }).map(function (s) { return '<option value="' + esc(s.id) + '">' + esc(s.name) + " (" + s.duration + " perc)</option>"; }).join("") + "</select></label></div>" +
        '<div class="a-row two"><label>Név<input class="in" name="name" required></label><label>Telefon<input class="in" name="phone" type="tel"></label></div>' +
        '<div class="a-actions"><button class="btn btn-red">Foglalás mentése</button></div></form>';
    }

    html += '<div class="a-card"><h3>' + (bkFilter.upcoming ? "Jövőbeli foglalások" : esc(bkFilter.date)) + " (" + list.length + ")</h3>";
    if (!list.length) html += '<p class="muted">Nincs foglalás.</p>';
    html += list.map(function (b) {
      return '<div class="bk"><div class="t">' + (bkFilter.upcoming ? esc(b.date) + " " : "") + esc(b.start) + "–" + esc(H.fromMin(H.toMin(b.start) + b.duration)) + "</div>" +
        "<div><b>" + esc(b.name) + '</b> · <a href="tel:' + esc(b.phone) + '">' + esc(b.phone) + "</a></div>" +
        '<div class="muted">' + esc(svcNames(b.serviceIds)) + " · " + esc(staffName(b.staffId)) + (b.note ? " · " + esc(b.note) : "") + "</div>" +
        '<div class="a-actions" style="margin:4px 0 0"><select data-status="' + esc(b.id) + '">' + STATUSES.map(function (s) { return "<option" + (b.status === s ? " selected" : "") + ">" + s + "</option>"; }).join("") + "</select>" +
        '<button class="btn btn-line dark btn-sm" data-del-bk="' + esc(b.id) + '">Törlés</button></div></div>';
    }).join("") + "</div>";
    return html;
  }

  /* ---------- fül: szolgáltatások ---------- */
  function servicesView() {
    return '<div class="a-card"><h3>Szolgáltatások</h3><p class="muted">Az ár üresen hagyható, ilyenkor "Ár egyeztetés szerint" jelenik meg. Az időtartam percben van.</p><div data-list="services">' +
      C.services.map(function (s, i) {
        return '<div class="item" data-i="' + i + '"><div class="a-row four"><label>Név<input class="in" data-k="name" value="' + esc(s.name) + '"></label>' +
          '<label>Leírás<input class="in" data-k="desc" value="' + esc(s.desc) + '"></label>' +
          '<label>Idő (perc)<input class="in" type="number" min="5" step="5" data-k="duration" value="' + esc(s.duration) + '"></label>' +
          '<label>Ár (Ft, bruttó)<input class="in" type="number" min="0" step="100" data-k="price" value="' + esc(s.price) + '"></label></div>' +
          '<div class="a-row two"><label>Kategória<input class="in" data-k="category" value="' + esc(s.category || "") + '"></label>' +
          '<label class="check"><input type="checkbox" data-k="active" ' + (s.active !== false ? "checked" : "") + "><span>Látszik az oldalon</span></label></div>" +
          '<button class="btn btn-line dark btn-sm" data-rm="services:' + i + '">Törlés</button></div>';
      }).join("") + '</div><div class="a-actions"><button class="btn btn-blue btn-sm" data-add="services">Új szolgáltatás</button><button class="btn btn-red" data-save="services">Mentés</button></div></div>';
  }
  function staffView() {
    return '<div class="a-card"><h3>Fodrászok</h3><p class="muted">A szabadság napjait vesszővel elválasztva add meg (ÉÉÉÉ-HH-NN).</p><div data-list="staff">' +
      C.staff.map(function (s, i) {
        return '<div class="item" data-i="' + i + '"><div class="a-row two"><label>Név<input class="in" data-k="name" value="' + esc(s.name) + '"></label>' +
          '<label>Fotó (URL)<input class="in" data-k="photo" value="' + (s.photo && s.photo.indexOf("data:") === 0 ? "" : esc(s.photo || "")) + '" placeholder="' + (s.photo && s.photo.indexOf("data:") === 0 ? "feltöltött kép" : "assets/img/fodrasz.jpg") + '"></label></div>' +
          '<label>Bemutatkozás<textarea class="in" data-k="bio">' + esc(s.bio) + "</textarea></label>" +
          '<label>Szabadság napjai<input class="in" data-k="timeOff" value="' + esc((s.timeOff || []).join(", ")) + '"></label>' +
          '<label>Fotó feltöltése<input class="in" type="file" accept="image/*" data-upload-staff="' + i + '"></label>' +
          '<label class="check"><input type="checkbox" data-k="active" ' + (s.active !== false ? "checked" : "") + "><span>Aktív (foglalható)</span></label>" +
          '<button class="btn btn-line dark btn-sm" data-rm="staff:' + i + '">Törlés</button></div>';
      }).join("") + '</div><div class="a-actions"><button class="btn btn-blue btn-sm" data-add="staff">Új fodrász</button><button class="btn btn-red" data-save="staff">Mentés</button></div></div>';
  }
  function hoursView() {
    return '<div class="a-card"><h3>Nyitvatartás</h3><p class="muted">Zárt nap: hagyd üresen mindkét mezőt.</p><div data-list="hours">' +
      C.hours.map(function (h, i) {
        return '<div class="a-row three item" data-i="' + i + '"><b>' + esc(h.name) + '</b><label>Nyit<input class="in" type="time" data-k="open" value="' + esc(h.open) + '"></label><label>Zár<input class="in" type="time" data-k="close" value="' + esc(h.close) + '"></label></div>';
      }).join("") + '</div><label>Zárva tartott napok (ünnep, szabadság), vesszővel: ÉÉÉÉ-HH-NN<input class="in" id="closedDates" value="' + esc((C.closedDates || []).join(", ")) + '"></label>' +
      '<div class="a-actions"><button class="btn btn-red" data-save="hours">Mentés</button></div></div>';
  }
  function textsView() {
    var f = C.about.features.map(function (x, i) { return '<div class="item">' + field("Kiemelés " + (i + 1) + " címe", "about.features." + i + ".title") + field("Szöveg", "about.features." + i + ".text") + "</div>"; }).join("");
    return '<div class="a-card" data-simple><h3>Nyitó rész</h3>' + field("Cím", "hero.title") + field("Alcím", "hero.subtitle") + field("Szöveg", "hero.text", { type: "textarea" }) + field("Gomb felirata", "hero.cta") + "</div>" +
      '<div class="a-card" data-simple><h3>Rólunk</h3>' + field("Cím", "about.title") + field("Szöveg", "about.text", { type: "textarea" }) + f + "</div>" +
      '<div class="a-card" data-simple><h3>Ajándékkártya</h3>' + field("Megjelenjen az oldalon", "giftcard.enabled", { type: "check" }) + field("Cím", "giftcard.title") + field("Szöveg", "giftcard.text", { type: "textarea" }) + "</div>" +
      '<div class="a-actions"><button class="btn btn-red" data-save="simple">Mentés</button></div>';
  }
  function contactView() {
    return '<div class="a-card" data-simple><h3>Elérhetőségek</h3>' + field("Szalon neve", "business.name") + field("Rövid név (fejléc)", "business.shortName") +
      field("Telefon (nemzetközi: +36...)", "business.phone") + field("Telefon (ahogy megjelenik)", "business.phoneDisplay") + field("Email", "business.email", { type: "email" }) +
      field("Cím", "business.address") + field("Cím megjegyzés (pl. bejárat)", "business.addressNote") + field("Facebook link", "business.facebook") + field("Instagram link", "business.instagram") +
      field("Kapcsolat rész címe", "contact.title") + field("Kapcsolat rész szövege", "contact.text", { type: "textarea" }) +
      '<label>Logó feltöltése<input class="in" type="file" accept="image/*" id="logoUp"></label>' + field("Logó (URL vagy feltöltött)", "business.logo", { attr: 'placeholder="assets/img/logo.png"' }) + "</div>" +
      '<div class="a-card" data-simple><h3>Jogi adatok (impresszumhoz)</h3><p class="muted">Ezeket a fodrászat tulajdonosa adja meg. Amíg üresek, az impresszum oldalon TODO jelzés látszik.</p>' +
      field("Cégnév / egyéni vállalkozó neve", "legal.companyName") + field("Székhely", "legal.seat") + field("Nyilvántartási / cégjegyzékszám", "legal.regNumber") + field("Adószám", "legal.taxNumber") +
      field("Tárhelyszolgáltató neve", "legal.hostName") + field("Tárhelyszolgáltató címe", "legal.hostAddress") + field("Tárhelyszolgáltató email", "legal.hostEmail") +
      field("Foglalási adatok megőrzése (hónap)", "legal.retentionMonths", { type: "number" }) + "</div>" +
      '<div class="a-actions"><button class="btn btn-red" data-save="simple">Mentés</button></div>';
  }
  function galleryView() {
    return '<div class="a-card"><h3>Galéria</h3><p class="muted">Csak saját vagy engedélyezett képet tölts fel. A képek átméretezve a böngészőben tárolódnak (bemutató mód), éles változatban képtárolóba kerülnek.</p>' +
      '<label>Új kép feltöltése<input class="in" type="file" accept="image/*" multiple id="galUp"></label><div class="grid gallery" style="margin-top:12px">' +
      C.gallery.map(function (g, i) { return '<div><img src="' + esc(g.url) + '" alt=""><button class="btn btn-line dark btn-sm" style="width:100%;margin-top:6px" data-rm="gallery:' + i + '">Törlés</button></div>'; }).join("") + "</div></div>";
  }
  function themeView() {
    return '<div class="a-card" data-simple><h3>Színek</h3>' +
      [["Sötétkék (fejléc, háttér)", "theme.blue"], ["Világoskék (kiemelés)", "theme.blueLight"], ["Piros (gombok)", "theme.red"]].map(function (x) {
        return '<div class="color-row"><input type="color" data-p="' + x[1] + '" value="' + esc(getP(C, x[1])) + '"><span>' + x[0] + "</span></div>";
      }).join("") + '<div class="a-actions"><button class="btn btn-line dark btn-sm" data-act="theme-reset">Alapszínek</button></div></div>' +
      '<div class="a-card" data-simple><h3>Foglalási beállítások</h3>' +
      field("Legkorábbi foglalás (óra múlva)", "settings.minAdvanceHours", { type: "number", attr: 'min="0"' }) + field("Legkésőbbi foglalás (nap)", "settings.maxAdvanceDays", { type: "number", attr: 'min="1"' }) +
      field("Időpont lépésköz (perc)", "settings.slotStep", { type: "number", attr: 'min="5" step="5"' }) +
      field("Bemutató üzemmód (jelzés a foglalás végén)", "settings.demoMode", { type: "check" }) + "</div>" +
      '<div class="a-actions"><button class="btn btn-red" data-save="simple">Mentés</button></div>';
  }
  function dataView() {
    return '<div class="a-card"><h3>Mentés és visszaállítás</h3><p class="muted">Az exportált JSON-ban a tartalom és a foglalások is benne vannak. Ezt tedd el biztonsági mentésnek.</p>' +
      '<div class="a-actions"><button class="btn btn-blue btn-sm" data-act="export">Exportálás (JSON)</button>' +
      '<label class="btn btn-line dark btn-sm" style="cursor:pointer">Importálás<input type="file" accept="application/json" id="importFile" hidden></label></div></div>' +
      '<div class="a-card"><h3>PIN kód</h3><form id="pinForm"><label>Új PIN (legalább 4 karakter)<input class="in" type="password" id="newPin" minlength="4" autocomplete="off"></label><div class="a-actions"><button class="btn btn-red btn-sm">PIN módosítása</button></div></form></div>' +
      '<div class="a-card"><h3>Veszélyes műveletek</h3><div class="a-actions"><button class="btn btn-line dark btn-sm" data-act="reset-content">Tartalom visszaállítása az alapra</button><button class="btn btn-line dark btn-sm" data-act="clear-bookings">Összes foglalás törlése</button><button class="btn btn-line dark btn-sm" data-act="logout">Kilépés</button></div></div>';
  }

  /* ---------- keret ---------- */
  function render() {
    if (!authed) return loginView();
    var views = { bookings: bookingsView, services: servicesView, staff: staffView, hours: hoursView, texts: textsView, contact: contactView, gallery: galleryView, theme: themeView, data: dataView };
    app.innerHTML = '<div class="a-head"><div class="wrap"><b>Hollywood admin</b><a class="btn btn-line btn-sm" href="index.html" target="_blank" rel="noopener">Oldal megnyitása</a></div></div>' +
      '<div class="a-tabs" role="tablist">' + TABS.map(function (t) { return '<button role="tab" class="' + (tab === t[0] ? "on" : "") + '" data-tab="' + t[0] + '">' + t[1] + "</button>"; }).join("") + "</div>" +
      '<div class="wrap a-main">' + views[tab]() + "</div>";
  }

  function collectList(name, keys) {
    var out = [];
    Array.prototype.slice.call(app.querySelectorAll('[data-list="' + name + '"] .item')).forEach(function (row, i) {
      var base = (C[name] && C[name][i]) ? JSON.parse(JSON.stringify(C[name][i])) : {};
      Array.prototype.slice.call(row.querySelectorAll("[data-k]")).forEach(function (el) {
        var k = el.getAttribute("data-k"), v;
        if (el.type === "checkbox") v = el.checked;
        else if (el.type === "number") v = el.value === "" ? "" : Number(el.value);
        else v = el.value;
        if (k === "timeOff") v = String(v).split(",").map(function (x) { return x.trim(); }).filter(Boolean);
        if (k === "photo" && !v && base.photo && base.photo.indexOf("data:") === 0) return; /* feltöltött kép marad */
        if (k === "open" || k === "close") { base[k] = v; return; }
        base[k] = v;
      });
      out.push(base);
    });
    return out;
  }

  document.addEventListener("click", function (e) {
    var t = e.target.closest("button");
    if (!t || !authed) return;
    var v;
    if ((v = t.getAttribute("data-tab"))) { tab = v; render(); return; }
    if ((v = t.getAttribute("data-save"))) {
      if (v === "simple") app.querySelectorAll("[data-simple]").forEach(collectSimple);
      if (v === "services") C.services = collectList("services");
      if (v === "staff") C.staff = collectList("staff");
      if (v === "hours") {
        C.hours = collectList("hours");
        C.closedDates = document.getElementById("closedDates").value.split(",").map(function (x) { return x.trim(); }).filter(Boolean);
      }
      save(); render(); return;
    }
    if ((v = t.getAttribute("data-add"))) {
      if (v === "services") { C.services = collectList("services"); C.services.push({ id: H.uid("sv"), name: "Új szolgáltatás", desc: "", duration: 30, price: "", active: true, category: "" }); }
      if (v === "staff") { C.staff = collectList("staff"); C.staff.push({ id: H.uid("st"), name: "Új fodrász", bio: "", photo: "", active: true, timeOff: [] }); }
      render(); return;
    }
    if ((v = t.getAttribute("data-rm"))) {
      var p = v.split(":"), name = p[0], i = Number(p[1]);
      if (name === "services") { C.services = collectList("services"); C.services.splice(i, 1); }
      else if (name === "staff") { C.staff = collectList("staff"); if (C.staff.length > 1) C.staff.splice(i, 1); else return toast("Legalább egy fodrász kell"); }
      else if (name === "gallery") { C.gallery.splice(i, 1); save(); }
      render(); return;
    }
    if ((v = t.getAttribute("data-del-bk"))) {
      S.saveBookings(S.getBookings().filter(function (b) { return b.id !== v; })); toast("Foglalás törölve"); render(); return;
    }
    if ((v = t.getAttribute("data-act"))) {
      if (v === "toggle-form") { bkFilter.formOpen = !bkFilter.formOpen; bkFilter.err = ""; render(); }
      if (v === "theme-reset") { C.theme = H.clone(window.DEFAULT_CONTENT.theme); save(); render(); }
      if (v === "logout") { try { sessionStorage.removeItem("hw_admin"); } catch (x) {} authed = false; render(); }
      if (v === "reset-content") { S.resetContent(); C = S.getContent(); H.applyTheme(C); toast("Visszaállítva"); render(); }
      if (v === "clear-bookings") { S.saveBookings([]); toast("Foglalások törölve"); render(); }
      if (v === "export") {
        var a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([JSON.stringify({ content: C, bookings: S.getBookings() }, null, 2)], { type: "application/json" }));
        a.download = "hollywood-mentes-" + H.dateKey(new Date()) + ".json";
        document.body.appendChild(a); a.click(); a.remove();
      }
    }
  });

  document.addEventListener("change", function (e) {
    var el = e.target;
    if (!authed) return;
    if (el.id === "bkDate") { bkFilter.date = el.value; render(); return; }
    if (el.id === "bkStaff") { bkFilter.staff = el.value; render(); return; }
    if (el.id === "bkUp") { bkFilter.upcoming = el.checked; render(); return; }
    var id = el.getAttribute && el.getAttribute("data-status");
    if (id) {
      var all = S.getBookings();
      all.forEach(function (b) { if (b.id === id) b.status = el.value; });
      S.saveBookings(all); toast("Állapot mentve"); return;
    }
    if (el.id === "galUp") {
      Promise.all(Array.prototype.slice.call(el.files).map(function (f) { return readImage(f, 1200); })).then(function (urls) {
        urls.forEach(function (u) { C.gallery.push({ url: u, alt: "" }); }); save("Képek feltöltve"); render();
      }).catch(function () { toast("Kép feltöltése nem sikerült"); });
    }
    if (el.id === "logoUp" && el.files[0]) {
      readImage(el.files[0], 300).then(function (u) { C.business.logo = u; app.querySelectorAll("[data-simple]").forEach(collectSimple); C.business.logo = u; save("Logó feltöltve"); render(); });
    }
    if (el.hasAttribute("data-upload-staff") && el.files[0]) {
      var idx = Number(el.getAttribute("data-upload-staff"));
      C.staff = collectList("staff");
      readImage(el.files[0], 500).then(function (u) { C.staff[idx].photo = u; save("Fotó feltöltve"); render(); });
    }
    if (el.id === "importFile" && el.files[0]) {
      var fr = new FileReader();
      fr.onload = function () {
        try {
          var d = JSON.parse(fr.result);
          if (d.content) { C = H.merge(H.clone(window.DEFAULT_CONTENT), d.content); S.saveContent(C); }
          if (d.bookings) S.saveBookings(d.bookings);
          H.applyTheme(C); toast("Importálva"); render();
        } catch (x) { toast("Hibás fájl"); }
      };
      fr.readAsText(el.files[0]);
    }
  });

  document.addEventListener("submit", function (e) {
    if (!authed) return;
    if (e.target.id === "pinForm") {
      e.preventDefault();
      var v = document.getElementById("newPin").value;
      if (v.length < 4) return toast("Legalább 4 karakter");
      S.savePin(H.hashPin(v)); toast("PIN módosítva");
    }
    if (e.target.id === "manualForm") {
      e.preventDefault();
      var f = e.target, ids = Array.prototype.slice.call(f.svc.selectedOptions).map(function (o) { return o.value; });
      if (!ids.length) { bkFilter.err = "Válassz szolgáltatást."; return render(); }
      var dur = ids.reduce(function (a, id) { var s = C.services.filter(function (x) { return x.id === id; })[0]; return a + (s ? Number(s.duration) : 0); }, 0);
      var all = S.getBookings(), t = H.toMin(f.time.value), clash = all.some(function (b) {
        return b.status !== "lemondva" && b.staffId === f.staff.value && b.date === f.date.value && t < H.toMin(b.start) + b.duration && t + dur > H.toMin(b.start);
      });
      if (clash) { bkFilter.err = "Ebben az idősávban a fodrásznak már van foglalása."; return render(); }
      all.push({ id: H.uid("bk"), code: "HW-" + Math.random().toString(36).slice(2, 6).toUpperCase(), serviceIds: ids, staffId: f.staff.value, date: f.date.value, start: f.time.value, duration: dur,
        name: f.name.value.trim() || "Telefonos vendég", phone: f.phone.value.trim(), email: "", note: "", status: "visszaigazolt", createdAt: new Date().toISOString() });
      S.saveBookings(all);
      bkFilter.formOpen = false; bkFilter.err = ""; bkFilter.date = f.date.value; bkFilter.upcoming = false;
      toast("Foglalás mentve"); render();
    }
  });

  render();
})();
