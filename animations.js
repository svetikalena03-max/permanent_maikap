(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function revealAll() {
    document.querySelectorAll(".js-reveal, .js-reveal-row").forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  var header = document.querySelector(".site-header");
  if (header) {
    function onScrollHeader() {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    }
    onScrollHeader();
    window.addEventListener("scroll", onScrollHeader, { passive: true });
  }

  if (reduce) {
    revealAll();
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { root: null, rootMargin: "0px 0px -6% 0px", threshold: 0.08 }
  );

  document.querySelectorAll(".js-reveal, .js-reveal-row").forEach(function (el) {
    observer.observe(el);
  });

  /* Параллакс только для блока с фото в hero */
  var hero = document.querySelector(".hero");
  var heroVisual = document.querySelector(".hero-visual");
  if (hero && heroVisual) {
    var parallaxTick = false;
    function parallax() {
      parallaxTick = false;
      var rect = hero.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      var maxShift = 28;
      var y = window.scrollY * 0.045;
      if (y > maxShift) y = maxShift;
      heroVisual.style.transform = "translate3d(0, " + y + "px, 0)";
    }
    function onScrollParallax() {
      if (!parallaxTick) {
        parallaxTick = true;
        requestAnimationFrame(parallax);
      }
    }
    parallax();
    window.addEventListener("scroll", onScrollParallax, { passive: true });
  }
})();
