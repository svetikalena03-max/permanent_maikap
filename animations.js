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
  } else {
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
