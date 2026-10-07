/* Twin Cities Airsoft — spec mockup. Plain JS, no build step.
   Motion character: snaps. Everything collapses to instant under prefers-reduced-motion. */
(function () {
  "use strict";
  var doc = document.documentElement;
  doc.classList.add("js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Sticky header condenses on scroll — phone stays visible at every size */
  var header = document.querySelector(".site-header");
  function onScroll() { if (header) header.classList.toggle("is-condensed", window.scrollY > 40); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  var btn = document.querySelector(".menu-btn");
  var panel = document.getElementById("mobile-nav");
  if (btn && panel) {
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      panel.classList.toggle("is-open", !open);
      document.body.style.overflow = open ? "" : "hidden";
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && btn.getAttribute("aria-expanded") === "true") { btn.click(); btn.focus(); }
    });
  }

  /* Hero boot: brackets draw in, then the headline sets in one cut */
  var hero = document.querySelector(".hero");
  if (hero) {
    if (reduce) hero.classList.add("is-booted");
    else requestAnimationFrame(function () { setTimeout(function () { hero.classList.add("is-booted"); }, 60); });
  }

  /* Stepped HUD reveals */
  var targets = document.querySelectorAll(".rv, .rv-stagger");
  if (reduce || !("IntersectionObserver" in window)) {
    targets.forEach(function (el) { el.classList.add("on"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("on"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* Ammo-readout counters — ONLY on verified published figures (data-count is set in markup) */
  var counters = document.querySelectorAll("[data-count]");
  function tick(el) {
    var end = parseInt(el.getAttribute("data-count"), 10);
    if (reduce || isNaN(end)) { el.textContent = el.getAttribute("data-count"); return; }
    var steps = 12, i = 0;
    var timer = setInterval(function () {
      i++;
      el.textContent = i >= steps ? String(end) : String(Math.round(end * (i / steps)));
      if (i >= steps) clearInterval(timer);
    }, 45);
  }
  if ("IntersectionObserver" in window && !reduce) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { tick(en.target); cio.unobserve(en.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(tick);
  }

  /* Events: rendered from the inline JSON block so the owner edits data, not layout.
     [EVENT DATA — JSON/MD SOURCE SO THE OWNER CAN EDIT, CONFIRM CMS PREFERENCE] */
  var dataEl = document.getElementById("event-data");
  var mount = document.getElementById("event-archive");
  if (dataEl && mount) {
    try {
      var events = JSON.parse(dataEl.textContent);
      mount.innerHTML = "";
      events.forEach(function (ev) { mount.appendChild(renderEvent(ev)); });
    } catch (err) { /* static fallback inside #event-archive stays in place */ }
  }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function renderEvent(ev) {
    var card = el("article", "event event--expired");
    card.appendChild(el("p", "event-date", ev.date + " " + ev.year));
    var h = el("h3", null, ev.name); card.appendChild(h);
    if (ev.format) card.appendChild(el("p", "hud hud--ember", ev.format));
    var note = el("p", "confirm confirm--block expired-note", "[EVENT DATE EXPIRED — 2027 SCHEDULE NOT PUBLISHED, CONFIRM]");
    card.appendChild(note);
    var dl = el("dl");
    (ev.facts || []).forEach(function (f) { dl.appendChild(el("dt", null, f[0])); dl.appendChild(el("dd", null, f[1])); });
    card.appendChild(dl);
    if (ev.schedule && ev.schedule.length) {
      card.appendChild(el("p", "hud", "Published run of day (2026)"));
      var ul = el("ul", "schedule");
      ev.schedule.forEach(function (s) { var li = el("li"); li.appendChild(el("b", null, s[0])); li.appendChild(el("span", null, s[1])); ul.appendChild(li); });
      card.appendChild(ul);
    }
    return card;
  }

  /* Mockup forms: never submit anywhere */
  document.querySelectorAll("form[data-mock]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var n = f.querySelector(".form-note");
      if (n) { n.classList.add("is-shown"); n.focus(); }
    });
  });

  /* Footer year */
  document.querySelectorAll("[data-year]").forEach(function (n) { n.textContent = new Date().getFullYear(); });
})();
