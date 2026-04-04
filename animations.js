(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initRevealStagger() {
    document.querySelectorAll("[data-reveal-stagger]").forEach(function (root) {
      var step = parseFloat(root.getAttribute("data-reveal-stagger"), 10);
      var start = parseFloat(root.getAttribute("data-reveal-start") || "0", 10);
      if (isNaN(step)) step = 0.1;
      if (isNaN(start)) start = 0;
      var sel = root.getAttribute("data-reveal-target");
      var list = sel ? root.querySelectorAll(sel) : root.children;
      Array.prototype.forEach.call(list, function (node, i) {
        node.classList.add("reveal");
        node.style.setProperty("--delay", start + i * step + "s");
      });
    });
  }

  initRevealStagger();

  function revealAll() {
    document.querySelectorAll(".js-reveal, .js-reveal-row").forEach(function (el) {
      el.classList.add("is-visible");
    });
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("is-revealed");
    });
  }

  function unlockReveal(el) {
    if (el.classList.contains("js-reveal") || el.classList.contains("js-reveal-row")) {
      el.classList.add("is-visible");
    }
    if (el.classList.contains("reveal")) {
      el.classList.add("is-revealed");
    }
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
  } else {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          unlockReveal(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { root: null, rootMargin: "0px 0px -6% 0px", threshold: 0.08 }
    );

    document.querySelectorAll(".js-reveal, .js-reveal-row, .reveal").forEach(function (el) {
      observer.observe(el);
    });

    var hero = document.querySelector(".hero");
    var heroInner = document.querySelector(".hero-visual-inner");
    if (hero && heroInner) {
      var parallaxTick = false;
      function parallax() {
        parallaxTick = false;
        var rect = hero.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        var maxShift = 28;
        var y = window.scrollY * 0.045;
        if (y > maxShift) y = maxShift;
        heroInner.style.transform = "translate3d(0, " + y + "px, 0)";
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

    var canCustomCursor =
      window.matchMedia("(pointer: fine)").matches && window.matchMedia("(hover: hover)").matches;

    if (canCustomCursor) {
      var cursorEl = document.getElementById("custom-cursor");
      if (cursorEl) {
        cursorEl.removeAttribute("hidden");
        cursorEl.hidden = false;
        document.body.classList.add("has-custom-cursor");

        var dot = cursorEl.querySelector(".custom-cursor-dot");
        var ring = cursorEl.querySelector(".custom-cursor-ring");
        var mx = 0;
        var my = 0;
        var rx = 0;
        var ry = 0;
        var cursorRaf = 0;
        var hoverInteractive = false;

        function setHover(on) {
          if (hoverInteractive === on) return;
          hoverInteractive = on;
          cursorEl.classList.toggle("is-hover", on);
        }

        function cursorFrame() {
          cursorRaf = 0;
          rx += (mx - rx) * 0.22;
          ry += (my - ry) * 0.22;
          if (dot) dot.style.transform = "translate3d(" + mx + "px," + my + "px,0)";
          if (ring) ring.style.transform = "translate3d(" + rx + "px," + ry + "px,0)";
          if (Math.abs(mx - rx) > 0.35 || Math.abs(my - ry) > 0.35) {
            cursorRaf = requestAnimationFrame(cursorFrame);
          }
        }

        function queueCursorFrame() {
          if (!cursorRaf) cursorRaf = requestAnimationFrame(cursorFrame);
        }

        document.addEventListener(
          "mousemove",
          function (e) {
            mx = e.clientX;
            my = e.clientY;
            var t = e.target;
            setHover(
              !!(
                t &&
                t.closest &&
                t.closest(
                  "a, button, input, textarea, select, summary, label, [role='button'], .btn"
                )
              )
            );
            queueCursorFrame();
          },
          { passive: true }
        );

        cursorFrame();
      }
    }
  }

  /* Форма заявки → Telegram, ВК или Max с текстом */
  var requestForm = document.getElementById("request-form");
  var requestError = document.getElementById("request-form-error");
  if (requestForm && requestError) {
    function buildRequestText(fullname, phone) {
      return (
        "Заявка с сайта (перманентный макияж)\n" +
        "ФИО: " +
        fullname +
        "\n" +
        "Телефон: " +
        phone
      );
    }

    requestForm.addEventListener("submit", function (e) {
      e.preventDefault();
      requestError.hidden = true;
      requestError.textContent = "";
      var nameEl = document.getElementById("request-fullname");
      var phoneEl = document.getElementById("request-phone");
      if (!nameEl || !phoneEl) return;
      var fullname = nameEl.value.trim();
      var phone = phoneEl.value.trim();
      if (!fullname) {
        requestError.textContent = "Пожалуйста, укажите ФИО.";
        requestError.hidden = false;
        nameEl.focus();
        return;
      }
      if (!phone) {
        requestError.textContent = "Пожалуйста, укажите номер телефона.";
        requestError.hidden = false;
        phoneEl.focus();
        return;
      }

      var messenger = requestForm.querySelector('input[name="request-messenger"]:checked');
      var channel = messenger ? messenger.value : "max";
      var encoded = encodeURIComponent(buildRequestText(fullname, phone));
      var url;

      if (channel === "telegram") {
        var tg = (requestForm.dataset.telegramUser || "").trim().replace(/^@/, "");
        if (!tg) {
          requestError.textContent =
            "Для Telegram укажите ваш username в атрибуте data-telegram-user у формы (без @) или выберите Max.";
          requestError.hidden = false;
          return;
        }
        url = "https://t.me/" + encodeURIComponent(tg) + "?text=" + encoded;
      } else if (channel === "vk") {
        var vk = (requestForm.dataset.vkScreen || "").trim();
        vk = vk.replace(/^https?:\/\/(vk\.com\/|vk\.me\/)?/i, "").replace(/\/$/, "");
        if (!vk) {
          requestError.textContent =
            "Для ВКонтакте укажите короткое имя в data-vk-screen у формы (как в vk.me/…) или выберите Max.";
          requestError.hidden = false;
          return;
        }
        url = "https://vk.me/" + encodeURIComponent(vk) + "?text=" + encoded;
      } else {
        url = "https://max.ru/:share?text=" + encoded;
      }

      window.open(url, "_blank", "noopener,noreferrer");
    });
  }
})();
