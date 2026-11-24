/* Közös segédfüggvények: tárolás, dátumkezelés, szabad időpontok számítása. */
(function (root) {
  var K = { content: "hw_content_v1", bookings: "hw_bookings_v1", pin: "hw_pin_v1", consent: "hw_consent_v1" };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function read(k, def) {
    try { var v = root.localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch (e) { return def; }
  }
  function write(k, v) {
    try { root.localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; }
  }
  function merge(def, o) {
    if (Array.isArray(def) || typeof def !== "object" || def === null) return o === undefined ? def : o;
    var r = {}, k;
    for (k in def) r[k] = merge(def[k], o ? o[k] : undefined);
    if (o) for (k in o) if (!(k in r)) r[k] = o[k];
    return r;
  }

  var Store = {
    getContent: function () { return merge(clone(root.DEFAULT_CONTENT), read(K.content, {})); },
    saveContent: function (c) { return write(K.content, c); },
    resetContent: function () { try { root.localStorage.removeItem(K.content); } catch (e) {} },
    getBookings: function () { return read(K.bookings, []); },
    saveBookings: function (b) { return write(K.bookings, b); },
    getPin: function () { return read(K.pin, null); },
    savePin: function (p) { return write(K.pin, p); },
    getConsent: function () { return read(K.consent, null); },
    saveConsent: function (c) { return write(K.consent, c); }
  };

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function toMin(t) { var p = String(t).split(":"); return Number(p[0]) * 60 + Number(p[1] || 0); }
  function fromMin(m) { return pad(Math.floor(m / 60)) + ":" + pad(m % 60); }
  function dateKey(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function parseKey(k) { var p = k.split("-").map(Number); return new Date(p[0], p[1] - 1, p[2]); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function uid(p) { return (p || "id") + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-3); }

  var DAYS = ["vasárnap", "hétfő", "kedd", "szerda", "csütörtök", "péntek", "szombat"];
  var DAYS_SHORT = ["Vas", "Hét", "Ked", "Sze", "Csü", "Pén", "Szo"];
  var MONTHS = ["jan.", "febr.", "márc.", "ápr.", "máj.", "jún.", "júl.", "aug.", "szept.", "okt.", "nov.", "dec."];

  function formatPrice(p) {
    if (p === "" || p == null || isNaN(Number(p))) return "Ár egyeztetés szerint";
    return Number(p).toLocaleString("hu-HU") + " Ft";
  }

  /* Nyitvatartás adott napra: {open, close} percben, vagy null ha zárva. */
  function hoursFor(c, date) {
    var h = null, i;
    for (i = 0; i < c.hours.length; i++) if (c.hours[i].dow === date.getDay()) h = c.hours[i];
    if (!h || !h.open || !h.close) return null;
    if ((c.closedDates || []).indexOf(dateKey(date)) !== -1) return null;
    return { open: toMin(h.open), close: toMin(h.close) };
  }

  function overlaps(b, dk, staffId, t, dur) {
    return b.status !== "lemondva" && b.staffId === staffId && b.date === dk &&
      t < toMin(b.start) + b.duration && t + dur > toMin(b.start);
  }

  /* Szabad kezdési időpontok egy napra. staffId: "any" vagy konkrét fodrász. */
  function freeSlots(c, bookings, date, duration, staffId, now) {
    var hh = hoursFor(c, date);
    if (!hh || !duration) return [];
    var step = Number(c.settings.slotStep) || 30;
    var minTime = (now || new Date()).getTime() + Number(c.settings.minAdvanceHours || 0) * 3600000;
    var dk = dateKey(date);
    var staff = c.staff.filter(function (s) {
      return s.active !== false && (!staffId || staffId === "any" || s.id === staffId);
    });
    var out = [], t;
    for (t = hh.open; t + duration <= hh.close; t += step) {
      var start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), Math.floor(t / 60), t % 60);
      if (start.getTime() < minTime) continue;
      var free = null, i;
      for (i = 0; i < staff.length && !free; i++) {
        var s = staff[i];
        if ((s.timeOff || []).indexOf(dk) !== -1) continue;
        var busy = false, j;
        for (j = 0; j < bookings.length; j++) if (overlaps(bookings[j], dk, s.id, t, duration)) { busy = true; break; }
        if (!busy) free = s;
      }
      if (free) out.push({ time: fromMin(t), staffId: free.id });
    }
    return out;
  }

  /* Nyitva most? Szöveg a hero-ba. */
  function openStatus(c, now) {
    now = now || new Date();
    var hh = hoursFor(c, now), m = now.getHours() * 60 + now.getMinutes();
    if (hh && m >= hh.open && m < hh.close) return { open: true, text: "Most nyitva, ma " + fromMin(hh.open) + "–" + fromMin(hh.close) };
    if (hh && m < hh.open) return { open: false, text: "Ma " + fromMin(hh.open) + "-kor nyitunk" };
    for (var i = 1; i <= 7; i++) {
      var d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i), h2 = hoursFor(c, d);
      if (h2) return { open: false, text: "Zárva, legközelebb " + (i === 1 ? "holnap" : DAYS[d.getDay()]) + " " + fromMin(h2.open) + "-kor nyitunk" };
    }
    return { open: false, text: "Zárva" };
  }

  function hashPin(p) {
    var h = 5381, s = "hw|" + p, i;
    for (i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    return String(h);
  }

  var API = {
    Store: Store, pad: pad, toMin: toMin, fromMin: fromMin, dateKey: dateKey, parseKey: parseKey, esc: esc, uid: uid,
    DAYS: DAYS, DAYS_SHORT: DAYS_SHORT, MONTHS: MONTHS, formatPrice: formatPrice, hoursFor: hoursFor,
    freeSlots: freeSlots, openStatus: openStatus, hashPin: hashPin, clone: clone, merge: merge
  };
  root.HW = API;
  if (typeof module !== "undefined" && module.exports) module.exports = API;

  /* Téma: CSS változók a tartalomból. */
  API.applyTheme = function (c) {
    var r = root.document && root.document.documentElement;
    if (!r) return;
    r.style.setProperty("--blue", c.theme.blue);
    r.style.setProperty("--blue2", c.theme.blueLight);
    r.style.setProperty("--red", c.theme.red);
  };
})(typeof window !== "undefined" ? window : globalThis);
