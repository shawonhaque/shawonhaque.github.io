/* ============================================================
   Shawon Haque — Portfolio
   Optional motion layer. Nothing here is required for the site to work:
   every effect is skipped when the visitor prefers reduced motion, when the
   library is missing, or when the device is not able to run it comfortably.
   ============================================================ */
(function () {
  "use strict";

  /* Resolve sibling files against this script, not the page, so the paths stay
     correct whatever directory the site is served from. currentScript is only
     set while a classic script is first executing, so capture it now. */
  var SCRIPT_URL = (document.currentScript && document.currentScript.src) || "";
  function sibling(path) {
    if (!SCRIPT_URL) return path;
    return new URL(path, SCRIPT_URL).href;
  }

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var smallScreen = window.matchMedia("(max-width: 720px)");

  function canAnimate() {
    return !reduceMotion.matches && !document.hidden;
  }

  /* ============================================================
     Hero — Three.js constellation
     Loaded only when the hero canvas is on screen, and only when the device
     looks able to run it. The canvas is decorative, so it is hidden from
     assistive technology and the page reads the same without it.
     ============================================================ */
  function initHeroScene(canvas, THREE) {
    var renderer, scene, camera, group, points, lines;
    var frame = null;
    var running = false;
    var pointer = { x: 0, y: 0 };
    var target = { x: 0, y: 0 };

    var ACCENT = { dark: 0x82a6ff, light: 0x1f4fd8 };

    function currentAccent() {
      return document.documentElement.getAttribute("data-theme") === "light"
        ? ACCENT.light
        : ACCENT.dark;
    }

    function build() {
      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true,
        powerPreference: "low-power"
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setClearAlpha(0);

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(46, 1, 0.1, 100);
      camera.position.set(0, 0, 16);

      group = new THREE.Group();
      scene.add(group);

      var COUNT = 110;
      var positions = new Float32Array(COUNT * 3);
      var spread = { x: 16, y: 7, z: 5 };

      for (var i = 0; i < COUNT; i++) {
        positions[i * 3] = (Math.random() - 0.5) * spread.x;
        positions[i * 3 + 1] = (Math.random() - 0.5) * spread.y;
        positions[i * 3 + 2] = (Math.random() - 0.5) * spread.z;
      }

      var pointGeometry = new THREE.BufferGeometry();
      pointGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

      var pointMaterial = new THREE.PointsMaterial({
        color: currentAccent(),
        size: 0.14,
        transparent: true,
        opacity: 0.9,
        sizeAttenuation: true,
        depthWrite: false
      });
      points = new THREE.Points(pointGeometry, pointMaterial);
      group.add(points);

      /* Join near neighbours, so the field reads as a network rather than
         scattered dots. Rebuilt only when the accent changes. */
      var linkPositions = [];
      var maxDistance = 3.4;
      for (var a = 0; a < COUNT; a++) {
        for (var b = a + 1; b < COUNT; b++) {
          var dx = positions[a * 3] - positions[b * 3];
          var dy = positions[a * 3 + 1] - positions[b * 3 + 1];
          var dz = positions[a * 3 + 2] - positions[b * 3 + 2];
          if (dx * dx + dy * dy + dz * dz < maxDistance * maxDistance) {
            linkPositions.push(
              positions[a * 3], positions[a * 3 + 1], positions[a * 3 + 2],
              positions[b * 3], positions[b * 3 + 1], positions[b * 3 + 2]
            );
          }
        }
      }

      var lineGeometry = new THREE.BufferGeometry();
      lineGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array(linkPositions), 3)
      );
      var lineMaterial = new THREE.LineBasicMaterial({
        color: currentAccent(),
        transparent: true,
        opacity: 0.22,
        depthWrite: false
      });
      lines = new THREE.LineSegments(lineGeometry, lineMaterial);
      group.add(lines);

      resize();
      canvas.classList.add("is-ready");
    }

    function resize() {
      if (!renderer) return;
      var rect = canvas.getBoundingClientRect();
      var width = Math.max(rect.width, 1);
      var height = Math.max(rect.height, 1);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    function draw(time) {
      group.rotation.y = time * 0.00004;
      group.rotation.x = Math.sin(time * 0.00008) * 0.08;

      pointer.x += (target.x - pointer.x) * 0.045;
      pointer.y += (target.y - pointer.y) * 0.045;
      group.position.x = pointer.x * 1.6;
      group.position.y = pointer.y * 1.0;

      renderer.render(scene, camera);
    }

    function loop(time) {
      if (!running) return;
      draw(time);
      frame = window.requestAnimationFrame(loop);
    }

    function start() {
      if (running || !renderer) return;
      running = true;
      frame = window.requestAnimationFrame(loop);
    }

    function stop() {
      running = false;
      if (frame !== null) {
        window.cancelAnimationFrame(frame);
        frame = null;
      }
    }

    function sync() {
      if (canAnimate() && visible && !smallScreen.matches) start();
      else stop();
    }

    var visible = false;

    /* The scene only runs while it is on screen, so scrolling past the hero
       gives the CPU and GPU back. */
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        visible = entry.isIntersecting;
      });
      sync();
    }, { threshold: 0.01 });
    observer.observe(canvas);

    document.addEventListener("visibilitychange", sync);
    reduceMotion.addEventListener("change", sync);
    smallScreen.addEventListener("change", sync);
    window.addEventListener("resize", function () {
      resize();
      sync();
    }, { passive: true });

    window.addEventListener("pointermove", function (event) {
      target.x = (event.clientX / window.innerWidth) * 2 - 1;
      target.y = -((event.clientY / window.innerHeight) * 2 - 1);
    }, { passive: true });

    /* Re-tint when the visitor switches theme. */
    new MutationObserver(function () {
      var accent = currentAccent();
      if (points) points.material.color.setHex(accent);
      if (lines) lines.material.color.setHex(accent);
    }).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"]
    });

    build();
    sync();
  }

  function loadHeroScene() {
    var canvas = document.querySelector("[data-hero-canvas]");
    if (!canvas) return;
    /* Skip the whole thing on reduced motion and on small screens: on a phone
       the scene would be off-screen work and a large download for a decoration
       that adds little at that size. */
    if (reduceMotion.matches || smallScreen.matches) return;

    /* Cheap WebGL check before pulling down the library. */
    try {
      var probe = document.createElement("canvas");
      var gl = probe.getContext("webgl2") || probe.getContext("webgl");
      if (!gl) return;
    } catch (error) {
      return;
    }

    /* Fetch the renderer only once the hero is close to the viewport. */
    var loader = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        loader.disconnect();

        import(sibling("vendor/three.module.min.js"))
          .then(function (module) {
            try {
              initHeroScene(canvas, module);
            } catch (error) {
              canvas.remove();
            }
          })
          .catch(function () {
            /* Offline, blocked, or unsupported — the hero simply has no
               constellation. Nothing else depends on it. */
            canvas.remove();
          });
      });
    }, { rootMargin: "200px" });

    loader.observe(canvas);
  }

  /* ============================================================
     Scroll-driven motion — GSAP + ScrollTrigger
     The reveal-on-scroll in main.js already runs on IntersectionObserver and
     is what visitors see when GSAP is absent, so these effects deliberately
     target different elements and never fight it.
     ============================================================ */
  function initScrollMotion() {
    if (typeof window.gsap !== "function") return;
    var ScrollTrigger = window.ScrollTrigger;
    if (!ScrollTrigger) return;

    var gsap = window.gsap;
    gsap.registerPlugin(ScrollTrigger);

    /* Every tween below sets immediateRender: false. Without it GSAP hides the
       element the moment the tween is created and only reveals it when the
       trigger fires; if the trigger never fires the content stays invisible.
       With it, the element keeps its normal appearance until the animation
       actually starts, so the page is never worse off than plain HTML. */
    var REVEAL = { opacity: 0, y: 26, duration: 0.8, ease: "power3.out", immediateRender: false };

    gsap.context(function () {
      /* Section headings rise into place. */
      gsap.utils.toArray(".section-head").forEach(function (head) {
        gsap.from(head, Object.assign({}, REVEAL, {
          scrollTrigger: { trigger: head, start: "top 86%", once: true }
        }));
      });

      /* The ghost watermark drifts behind its heading as the section passes. */
      gsap.utils.toArray(".ghost").forEach(function (ghost) {
        gsap.fromTo(ghost, { yPercent: 10 }, {
          yPercent: -10,
          ease: "none",
          immediateRender: false,
          scrollTrigger: { trigger: ghost, start: "top bottom", end: "bottom top", scrub: true }
        });
      });

      /* Experience blocks stagger in. */
      gsap.from(".role-card", Object.assign({}, REVEAL, {
        duration: 0.85,
        scrollTrigger: { trigger: ".role-card", start: "top 88%", once: true }
      }));

      gsap.from(".exp-grid > div", Object.assign({}, REVEAL, {
        y: 24,
        duration: 0.7,
        stagger: 0.12,
        scrollTrigger: { trigger: ".exp-grid", start: "top 88%", once: true }
      }));

      /* The hero copy drifts up slightly slower than the page, which adds
         depth without moving anything far enough to distract. */
      gsap.to(".hero-copy", {
        y: -24,
        ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
      });
    });

    /* ScrollTrigger measures before web fonts land, which shifts the layout.
       Re-measure once the fonts are ready, and again after the load event. */
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }
    window.addEventListener("load", function () { ScrollTrigger.refresh(); });
  }

  function boot() {
    loadHeroScene();
    if (!reduceMotion.matches) initScrollMotion();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
