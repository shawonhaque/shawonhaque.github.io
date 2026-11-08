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

  /* ---------- Scroll progress + back to top ---------- */
  var progressBar = document.getElementById("progressBar");
  var toTop = document.getElementById("toTop");

  var onScrollFrame = function () {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var y = window.scrollY || doc.scrollTop;

    if (progressBar) {
      var ratio = max > 0 ? Math.min(y / max, 1) : 0;
      progressBar.style.width = (ratio * 100).toFixed(2) + "%";
    }
    if (toTop) toTop.classList.toggle("is-visible", y > 480);
  };

  var ticking = false;
  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      onScrollFrame();
      ticking = false;
    });
  }, { passive: true });
  window.addEventListener("resize", onScrollFrame, { passive: true });
  onScrollFrame();

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ---------- Copy email ---------- */
  var copyBtn = document.getElementById("copyEmail");
  var copyStatus = document.getElementById("copyStatus");

  if (copyBtn) {
    var legacyCopy = function (text) {
      var field = document.createElement("textarea");
      field.value = text;
      field.setAttribute("readonly", "");
      field.style.position = "absolute";
      field.style.left = "-9999px";
      document.body.appendChild(field);
      field.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(field);
      return ok;
    };

    copyBtn.addEventListener("click", function () {
      var email = copyBtn.getAttribute("data-email");
      var label = copyBtn.querySelector(".copy-btn-text");

      var succeed = function () {
        copyBtn.classList.add("is-copied");
        if (label) label.textContent = "Copied";
        if (copyStatus) {
          copyStatus.textContent = "Email copied to clipboard";
          copyStatus.classList.add("is-visible");
        }
        window.setTimeout(function () {
          copyBtn.classList.remove("is-copied");
          if (label) label.textContent = "Copy";
          if (copyStatus) copyStatus.classList.remove("is-visible");
        }, 2200);
      };

      var fail = function () {
        if (copyStatus) {
          copyStatus.textContent = "Press Ctrl/Cmd + C to copy";
          copyStatus.classList.add("is-visible");
          window.setTimeout(function () {
            copyStatus.classList.remove("is-visible");
          }, 2600);
        }
      };

      var afterLegacy = function () {
        if (legacyCopy(email)) { succeed(); } else { fail(); }
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(succeed, afterLegacy);
      } else {
        afterLegacy();
      }
    });
  }

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
  var revealTargets = document.querySelectorAll(".card, .project-card, .notice, .contact-card, .philosophy, .resume-card");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    Array.prototype.forEach.call(revealTargets, function (el) { el.classList.add("is-visible"); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.1 });

    Array.prototype.forEach.call(revealTargets, function (el, index) {
      el.classList.add("reveal");
      /* Stagger within each row of cards, then reset, so long grids do not
         accumulate an ever-growing delay. */
      el.style.transitionDelay = (index % 3) * 70 + "ms";
      revealObserver.observe(el);
    });
  }

  /* ---------- Intro curtain ---------- */
  /* The pre-paint script adds .has-intro on the first visit of a session.
     Everything animated by that class ends in its natural state, so clearing
     it is safe — but it must happen only after the last animation finishes,
     or the hero entrance would be cut off part way. .hero-stack carries the
     longest delay, so its animationend is the signal. A fallback timer runs
     in case that event never fires. */
  if (root.classList.contains("has-intro")) {
    var introTimer = null;
    var lastHero = document.querySelector(".hero-stack");

    var clearIntro = function () {
      if (!root.classList.contains("has-intro")) return;
      root.classList.remove("has-intro");
      if (introTimer) window.clearTimeout(introTimer);
      if (lastHero) lastHero.removeEventListener("animationend", clearIntro);
    };

    if (lastHero) lastHero.addEventListener("animationend", clearIntro);
    introTimer = window.setTimeout(clearIntro, 2200);
  }

  /* ---------- Same-page view transitions ---------- */
  /* Soft cross-fade when a nav link jumps to a section, where the browser
     supports it. Everything degrades to an instant jump otherwise. */
  if (!reduceMotion && typeof document.startViewTransition === "function") {
    document.addEventListener("click", function (event) {
      var link = event.target.closest('a[href^="#"]');
      if (!link) return;
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (link.target && link.target !== "_self") return;

      var hash = link.getAttribute("href");
      if (hash === "#" || hash === "#top") return;

      var target = document.getElementById(hash.slice(1));
      if (!target) return;

      event.preventDefault();
      document.startViewTransition(function () {
        target.scrollIntoView({ behavior: "auto", block: "start" });
        if (history.replaceState) history.replaceState(null, "", hash);
      });
    });
  }
})();
