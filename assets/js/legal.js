/* Jogi oldalak: a [data-f] elemek tartalmát az admin adataiból tölti ki. Üres adat esetén TODO jelzés látszik. */
(function () {
  var H = window.HW, C = H.Store.getContent();
  H.applyTheme(C);
  function get(p) { return p.split(".").reduce(function (a, k) { return a == null ? a : a[k]; }, C); }
  Array.prototype.slice.call(document.querySelectorAll("[data-f]")).forEach(function (el) {
    var v = get(el.getAttribute("data-f"));
    if (v === "" || v == null) { el.className = "todo"; el.textContent = "[TODO: " + (el.getAttribute("data-label") || el.getAttribute("data-f")) + "]"; }
    else el.textContent = v;
  });
  var l = document.getElementById("brandName");
  if (l) l.textContent = C.business.shortName;
})();
