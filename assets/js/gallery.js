/* Galéria oldal: a képek az admin "Galéria" fülén szerkeszthetők. */
(function () {
  var H = window.HW, esc = H.esc, C = H.Store.getContent();
  H.applyTheme(C);
  var $ = function (s) { return document.querySelector(s); };
  var b = C.business;
  $("#brandLogo").innerHTML = b.logo ? '<img src="' + esc(b.logo) + '" alt="' + esc(b.name) + ' logó">' : "";
  $("#brandText").innerHTML = esc(b.shortName) + "<small>Fodrászat</small>";
  $("#galGrid").innerHTML = C.gallery.length ? C.gallery.map(function (g, i) {
    return '<button class="gal-item" data-gal="' + i + '" aria-label="Kép megnyitása nagyban"><img loading="lazy" src="' + esc(g.url) + '" alt="' + esc(g.alt || "Hollywood fodrászat munka") + '"></button>';
  }).join("") : "<p>Még nincsenek képek.</p>";
  var lbIndex = 0, lbBound = false;
  function lbShow(i) {
    var n = C.gallery.length; lbIndex = (i + n) % n;
    var g = C.gallery[lbIndex], lb = $("#lightbox");
    lb.querySelector("img").src = g.url; lb.querySelector("img").alt = g.alt || "";
    lb.querySelector(".lb-count").textContent = (lbIndex + 1) + " / " + n;
    lb.hidden = false; document.body.style.overflow = "hidden";
  }
  function lbClose() { $("#lightbox").hidden = true; document.body.style.overflow = ""; }
  function initLightbox() {
    if (lbBound) return; lbBound = true;
    var lb = document.createElement("div");
    lb.id = "lightbox"; lb.className = "lightbox"; lb.hidden = true; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-label", "Galéria");
    lb.innerHTML = '<button class="lb-btn lb-close" aria-label="Bezár">&times;</button><button class="lb-btn lb-prev" aria-label="Előző">&#8249;</button>' +
      '<img alt=""><button class="lb-btn lb-next" aria-label="Következő">&#8250;</button><div class="lb-count"></div>';
    document.body.appendChild(lb);
    lb.addEventListener("click", function (e) {
      if (e.target.closest(".lb-prev")) lbShow(lbIndex - 1);
      else if (e.target.closest(".lb-next")) lbShow(lbIndex + 1);
      else if (e.target.tagName !== "IMG") lbClose();
    });
    document.addEventListener("click", function (e) {
      var t = e.target.closest("[data-gal]"); if (t) lbShow(+t.getAttribute("data-gal"));
    });
    document.addEventListener("keydown", function (e) {
      if ($("#lightbox").hidden) return;
      if (e.key === "Escape") lbClose(); else if (e.key === "ArrowLeft") lbShow(lbIndex - 1); else if (e.key === "ArrowRight") lbShow(lbIndex + 1);
    });
    var x0 = null;
    lb.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) { if (x0 === null) return; var d = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(d) > 50) lbShow(lbIndex + (d < 0 ? 1 : -1)); });
  }

  initLightbox();
})();
