/* ============================================================
   Shawon Haque — Portfolio
   Progressive enhancement: theme, navigation, scroll behaviour.
   The site is fully usable and readable with JavaScript disabled.
   ============================================================ */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Theme ---------- */
  var themeToggle = document.getElementById("themeToggle");

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (themeToggle) {
      var toLight = theme === "dark";
      themeToggle.setAttribute("aria-pressed", String(toLight));
      themeToggle.setAttribute("aria-label", toLight ? "Switch to light theme" : "Switch to dark theme");
    }
  }

  applyTheme(root.getAttribute("data-theme") === "light" ? "light" : "dark");

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem("theme", next); } catch (e) {}
    });
  }

  /* ---------- Mobile navigation ---------- */
  var navToggle = document.getElementById("navToggle");
  var nav = document.getElementById("primary-nav");

  function closeNav() {
    if (!nav || !navToggle) return;
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open navigation menu");
  }

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeNav();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeNav();
    });

    document.addEventListener("click", function (event) {
      if (!nav.classList.contains("is-open")) return;
      if (nav.contains(event.target) || navToggle.contains(event.target)) return;
      closeNav();
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 720) closeNav();
    });
  }

  /* ---------- Sticky header shadow ---------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-stuck", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Footer year ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Active section highlighting ---------- */
  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll('#primary-nav a[href^="#"]')
  );

  if (navLinks.length && "IntersectionObserver" in window) {
    var linkFor = {};
    navLinks.forEach(function (link) {
      linkFor[link.getAttribute("href").slice(1)] = link;
    });

    var sections = navLinks
      .map(function (link) { return document.getElementById(link.getAttribute("href").slice(1)); })
      .filter(Boolean);

    var setActive = function (id) {
      navLinks.forEach(function (link) {
        var isActive = link === linkFor[id];
        link.classList.toggle("is-active", isActive);
        if (isActive) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    };

    var visible = {};
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        visible[entry.target.id] = entry.isIntersecting;
      });
      var current = null;
      for (var i = 0; i < sections.length; i++) {
        if (visible[sections[i].id]) { current = sections[i].id; break; }
      }
      if (current) setActive(current);
    }, { rootMargin: "-88px 0px -55% 0px", threshold: 0 });

    sections.forEach(function (section) { observer.observe(section); });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealTargets = document.querySelectorAll(".card, .project-card, .notice, .contact-card, .philosophy");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    Array.prototype.forEach.call(revealTargets, function (el) { el.classList.add("is-visible"); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    Array.prototype.forEach.call(revealTargets, function (el, index) {
      el.classList.add("reveal");
      el.style.transitionDelay = Math.min(index % 4, 3) * 60 + "ms";
      revealObserver.observe(el);
    });
  }
})();
