/* ============================================================
   Shawon Haque — Portfolio
   Progressive enhancement: theme, navigation, scroll behaviour.
   The site is fully usable and readable with JavaScript disabled.
   ============================================================ */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Smooth wheel scrolling ---------- */
  /* Lenis eases the wheel by animating the real scroll position rather than
     transforming a wrapper. The scrollbar, sticky header, progress bar and
     the reveal observer therefore all keep reading the same window.scrollY,
     so nothing else on the page has to change. It is skipped when the
     visitor prefers reduced motion, and the page scrolls normally if the
     library failed to load. */
  var lenis = null;
  var HEADER_OFFSET = 88;

  if (!reduceMotion && typeof window.Lenis === "function") {
    lenis = new window.Lenis({
      duration: 1.05,
      easing: function (t) { return 1 - Math.pow(1 - t, 3); },
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
      autoRaf: true
    });
    /* Lenis only adds its own class while a scroll is animating, so mark the
       document for the whole session. This keeps `scroll-behavior: smooth`
       off for as long as Lenis is driving the scroll position, which is what
       stops the two animators fighting. */
    root.classList.add("has-lenis");
  }

  /* ---------- Parallax ---------- */
  /* Depth between the background glow and the hero portrait. The glow sits
     far back, so it drifts down with the page; the portrait is the nearest
     layer, so it rises as you scroll — the two move in opposite directions,
     which is what reads as depth rather than everything sliding together.
     The transform lands on .portrait, a different element from the one that
     carries the entrance animation (.hero-visual) and the idle float
     (.portrait img), so the three never fight over the same property. */
  var parallaxGlow = document.querySelector(".bg-glow");
  var parallaxVisual = document.querySelector(".portrait");
  var parallaxOn = !reduceMotion && !!(parallaxGlow || parallaxVisual);

  var scrollCue = document.querySelector(".scroll-cue");

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
      header.classList.toggle("is-stuck", window.scrollY > 40);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Footer year ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Scroll progress + parallax + back to top ---------- */
  var progressBar = document.getElementById("progressBar");
  var toTop = document.getElementById("toTop");

  /* One place that performs a scroll, so smooth and non-smooth paths agree.
     With Lenis active the jump is eased; otherwise it falls back to the
     browser's own behaviour. */
  var scrollToTarget = function (target, immediate) {
    var top = 0;
    if (typeof target === "number") {
      top = target;
    } else if (target && target.getBoundingClientRect) {
      top = target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
    }
    if (top < 0) top = 0;
    if (lenis) lenis.scrollTo(top, immediate ? { immediate: true } : undefined);
    else window.scrollTo({ top: top, behavior: (immediate || reduceMotion) ? "auto" : "smooth" });
  };

  var onScrollFrame = function () {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var y = window.scrollY || doc.scrollTop;

    if (progressBar) {
      var ratio = max > 0 ? Math.min(y / max, 1) : 0;
      progressBar.style.width = (ratio * 100).toFixed(2) + "%";
    }
    if (toTop) toTop.classList.toggle("is-visible", y > 480);
    if (scrollCue) scrollCue.classList.toggle("is-hidden", y > 60);

    if (parallaxOn) {
      /* Far layer: the glow sinks gently as the page moves. */
      var shift = Math.min(y * 0.06, 34);
      if (parallaxGlow) parallaxGlow.style.transform = "translate3d(0," + shift.toFixed(2) + "px,0)";
      /* Near layer: the portrait rises faster than the page, so it lifts away
         from the copy as you scroll. The 0.08 factor keeps the rise well below
         the scroll itself, so the figure never catches the name above it while
         the two are still on screen. */
      if (parallaxVisual && y < window.innerHeight) {
        var rise = Math.min(y * 0.08, 72);
        parallaxVisual.style.transform = "translate3d(0," + (-rise).toFixed(2) + "px,0)";
      }
    }
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
      scrollToTarget(0);
    });
  }

  /* ---------- Navigation: active link + sliding indicator ---------- */
  var navIndicator = document.getElementById("navIndicator");

  /* Slide the ink pill under a link. The offset comes from bounding rects so it
     holds no matter how the link list is laid out. */
  var moveIndicator = function (link) {
    if (!navIndicator) return;
    if (!link) { navIndicator.style.opacity = "0"; return; }
    var pill = navIndicator.parentNode;
    var pillRect = pill.getBoundingClientRect();
    var linkRect = link.getBoundingClientRect();
    navIndicator.style.width = linkRect.width + "px";
    navIndicator.style.transform = "translateX(" + (linkRect.left - pillRect.left) + "px)";
    navIndicator.style.opacity = "1";
  };

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
      var activeLink = null;
      navLinks.forEach(function (link) {
        var isActive = link === linkFor[id];
        link.classList.toggle("is-active", isActive);
        if (isActive) { activeLink = link; link.setAttribute("aria-current", "true"); }
        else link.removeAttribute("aria-current");
      });
      moveIndicator(activeLink);
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

  /* Subpages have no section anchors, so the current page link takes the ink
     pill instead. Section pages link home for their anchors, so they skip it. */
  if (!navLinks.length) {
    var here = location.pathname.replace(/index\.html$/, "");
    Array.prototype.forEach.call(
      document.querySelectorAll(".nav-pill a:not([href^='#'])"),
      function (link) {
        var target = link.getAttribute("href").replace(/^(\.\.\/)+/, "");
        if (here.length >= target.length && here.slice(-target.length) === target) {
          link.classList.add("is-active");
          link.setAttribute("aria-current", "page");
          moveIndicator(link);
        }
      }
    );
  }

  /* Link widths shift when the font swaps in or the viewport changes, so
     re-measure the active link to keep the ink pill aligned. */
  var remeasure = function () {
    var activeLink = document.querySelector(".nav-pill a.is-active");
    if (activeLink) moveIndicator(activeLink);
  };
  window.addEventListener("resize", remeasure, { passive: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(remeasure);

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

  /* ---------- Intro curtain and hero entrance ---------- */
  /* The pre-paint script adds .has-intro for the curtain (first visit of a
     session) and .has-entrance for the hero entrance (every load). Both end in
     the elements' natural state, so clearing them is safe — but only once the
     last animation finishes, or the entrance would be cut off part way.
     .hero-stack carries the longest delay, so its animationend is the signal.
     A fallback timer runs in case that event never fires. */
  var introTimer = null;
  var lastHero = document.querySelector(".hero-stack");
  var entranceClasses = ["has-intro", "has-entrance"];

  var clearIntro = function () {
    var pending = entranceClasses.some(function (name) { return root.classList.contains(name); });
    if (!pending) return;
    entranceClasses.forEach(function (name) { root.classList.remove(name); });
    if (introTimer) window.clearTimeout(introTimer);
    if (lastHero) lastHero.removeEventListener("animationend", clearIntro);
  };

  if (entranceClasses.some(function (name) { return root.classList.contains(name); })) {
    if (lastHero) lastHero.addEventListener("animationend", clearIntro);
    introTimer = window.setTimeout(clearIntro, 2200);
  }

  /* ---------- Lazy loading with animation ---------- */
  /* The pre-paint script hides the hero portrait while its bytes are still in
     flight, so on a slow connection it fades in as it arrives instead of
     popping in after the entrance has finished. The class is cleared on load,
     on error, and on a short timeout, so the image is never left hidden. */
  var portraitImg = document.querySelector(".portrait img");
  if (root.classList.contains("has-img-pending") && portraitImg) {
    var revealPortrait = function () { root.classList.remove("has-img-pending"); };
    if (portraitImg.complete) {
      revealPortrait();
    } else {
      portraitImg.addEventListener("load", revealPortrait);
      portraitImg.addEventListener("error", revealPortrait);
      window.setTimeout(revealPortrait, 2500);
    }
  }

  /* ---------- In-page anchor navigation ---------- */
  /* One handler covers every in-page link: the header nav, the skip link, the
     hero buttons, the scroll cue and the footer. Jumps go through
     scrollToTarget, so the eased path and the plain path behave the same, and
     where the browser supports View Transitions the jump is cross-faded.
     Focus is moved to the target afterwards, which keeps the skip link and
     keyboard navigation working the way a normal anchor jump would. */
  document.addEventListener("click", function (event) {
    var link = event.target.closest('a[href^="#"]');
    if (!link) return;
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (link.target && link.target !== "_self") return;

    var hash = link.getAttribute("href");
    if (hash === "#") return;

    var target = hash === "#top" ? null : document.getElementById(hash.slice(1));
    if (hash !== "#top" && !target) return;

    event.preventDefault();

    var go = function (immediate) {
      scrollToTarget(target || 0, immediate);
      if (history.replaceState) history.replaceState(null, "", hash);
      if (target) {
        if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }
    };

    if (!reduceMotion && typeof document.startViewTransition === "function") {
      document.startViewTransition(function () { go(true); });
    } else {
      go(false);
    }
  });
})();
