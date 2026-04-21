(function () {
  "use strict";

  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  function scrollToTopHard() {
    window.scrollTo(0, 0);
  }

  scrollToTopHard();
  requestAnimationFrame(function () {
    requestAnimationFrame(scrollToTopHard);
  });
  window.addEventListener(
    "load",
    function () {
      scrollToTopHard();
      window.setTimeout(scrollToTopHard, 0);
      window.setTimeout(scrollToTopHard, 150);
    },
    { once: true }
  );
  window.addEventListener("pageshow", function (e) {
    if (e.persisted) scrollToTopHard();
  });

  var PM_RETURN_READING_KEY = "pm_return_reading_y";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var mobileHero = window.matchMedia("(max-width: 768px)").matches;
  var disableHeroTypewriter = reduce || mobileHero;

  function initHeroTypewriterStatic() {
    var typeRoot = document.querySelector("[data-hero-typewriter]");
    var h1 = document.querySelector(".hero-h1");
    var sr = h1 && h1.querySelector(".visually-hidden");
    if (typeRoot) typeRoot.setAttribute("hidden", "");
    if (sr) {
      sr.classList.remove("visually-hidden");
      sr.classList.add("visually-hidden--off");
    }
  }

  function initHeroTypewriter() {
    var typeRoot = document.querySelector("[data-hero-typewriter]");
    if (!typeRoot || disableHeroTypewriter) return;

    var contentEl = typeRoot.querySelector(".text-type__content");
    if (!contentEl) return;

    var lines = [
      "Перманентный макияж, который выглядит естественно — без эффекта «нарисовано»",
      "Брови, губы, межресничка — подбираю форму и оттенок под ваши черты лица",
      "Куровское, ТЦ «Светлана» — можно начать с консультации, без обязательств"
    ];

    var typingSpeed = 48;
    var deletingSpeed = 42;
    var pauseDuration = 2700;
    var initialDelay = 380;
    var loop = true;

    var currentTextIndex = 0;
    var displayedText = "";
    var currentCharIndex = 0;
    var isDeleting = false;
    var timeoutId = null;

    function clearTimer() {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    }

    function tick() {
      clearTimer();
      var currentText = lines[currentTextIndex];

      if (isDeleting) {
        if (!displayedText) {
          isDeleting = false;
          currentTextIndex = (currentTextIndex + 1) % lines.length;
          currentCharIndex = 0;
          timeoutId = setTimeout(tick, pauseDuration);
          return;
        }
        displayedText = displayedText.slice(0, -1);
        contentEl.textContent = displayedText;
        timeoutId = setTimeout(tick, deletingSpeed);
        return;
      }

      if (currentCharIndex < currentText.length) {
        currentCharIndex += 1;
        displayedText = currentText.slice(0, currentCharIndex);
        contentEl.textContent = displayedText;
        timeoutId = setTimeout(tick, typingSpeed);
        return;
      }

      if (!loop && currentTextIndex === lines.length - 1) return;

      timeoutId = setTimeout(function () {
        isDeleting = true;
        tick();
      }, pauseDuration);
    }

    function onReady() {
      clearTimer();
      displayedText = "";
      currentCharIndex = 0;
      isDeleting = false;
      currentTextIndex = 0;
      contentEl.textContent = "";
      timeoutId = setTimeout(tick, initialDelay);
    }

    var h1 = typeRoot.closest(".hero-h1");
    var fallbackTimer = null;

    if (h1 && h1.classList.contains("is-revealed")) {
      onReady();
    } else if (h1) {
      var mo = new MutationObserver(function () {
        if (h1.classList.contains("is-revealed")) {
          mo.disconnect();
          if (fallbackTimer !== null) {
            clearTimeout(fallbackTimer);
            fallbackTimer = null;
          }
          onReady();
        }
      });
      mo.observe(h1, { attributes: true, attributeFilter: ["class"] });
      fallbackTimer = setTimeout(function () {
        mo.disconnect();
        fallbackTimer = null;
        if (!h1.classList.contains("is-revealed")) onReady();
      }, 2400);
    } else {
      onReady();
    }
  }

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

  if (disableHeroTypewriter) {
    revealAll();
    initHeroTypewriterStatic();
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

    initHeroTypewriter();
  }

  function initPrivacyModal() {
    var modal = document.getElementById("privacy-modal");
    if (!modal) return;

    var openers = document.querySelectorAll("[data-open-privacy]");
    var closers = modal.querySelectorAll("[data-close-privacy]");
    var lastFocus = null;

    function openModal() {
      lastFocus = document.activeElement;
      modal.removeAttribute("hidden");
      document.body.classList.add("privacy-modal-open");
      var closeBtn = modal.querySelector(".privacy-modal__close");
      if (closeBtn) closeBtn.focus();
    }

    function closeModal() {
      modal.setAttribute("hidden", "");
      document.body.classList.remove("privacy-modal-open");
      if (lastFocus && typeof lastFocus.focus === "function") {
        lastFocus.focus();
      }
      lastFocus = null;
    }

    openers.forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        openModal();
      });
    });

    closers.forEach(function (el) {
      el.addEventListener("click", function () {
        closeModal();
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !modal.hasAttribute("hidden")) {
        closeModal();
      }
    });
  }

  initPrivacyModal();

  function initVideoLayout() {
    var video = document.querySelector(".media-video");
    var card = video && video.closest(".video-card");
    if (!video || !card) return;

    function apply() {
      var w = video.videoWidth;
      var h = video.videoHeight;
      if (!w || !h) return;
      card.classList.remove("video-card--portrait", "video-card--landscape");
      if (h > w) {
        card.classList.add("video-card--portrait");
      } else {
        card.classList.add("video-card--landscape");
      }
    }

    video.addEventListener("loadedmetadata", apply);
    if (video.readyState >= 1) apply();
  }

  initVideoLayout();

  function initReturnToReading() {
    var returnBtn = document.getElementById("return-to-reading");
    if (!returnBtn) return;

    function showReturn() {
      var raw = sessionStorage.getItem(PM_RETURN_READING_KEY);
      if (raw === null || raw === "") return;
      var y = parseFloat(raw, 10);
      if (isNaN(y)) return;
      returnBtn.removeAttribute("hidden");
      returnBtn.hidden = false;
    }

    function hideReturn() {
      returnBtn.setAttribute("hidden", "");
      returnBtn.hidden = true;
    }

    function saveReadingScroll() {
      sessionStorage.setItem(PM_RETURN_READING_KEY, String(window.scrollY));
    }

    document.querySelectorAll('a[href="#request"]').forEach(function (link) {
      link.addEventListener("click", function () {
        saveReadingScroll();
        window.setTimeout(showReturn, 500);
      });
    });

    window.addEventListener("hashchange", function () {
      if (window.location.hash === "#request") {
        window.setTimeout(showReturn, 500);
      }
    });

    returnBtn.addEventListener("click", function () {
      var raw = sessionStorage.getItem(PM_RETURN_READING_KEY);
      sessionStorage.removeItem(PM_RETURN_READING_KEY);
      hideReturn();
      if (raw === null || raw === "") return;
      var y = parseFloat(raw, 10);
      if (isNaN(y)) return;
      var instant = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: Math.max(0, y), behavior: instant ? "auto" : "smooth" });
    });

    if (window.location.hash === "#request") {
      window.setTimeout(showReturn, 500);
    }
  }

  initReturnToReading();

  /* Форма заявки -> Netlify Function -> Telegram bot */
  var requestForm = document.getElementById("request-form");
  var requestError = document.getElementById("request-form-error");
  if (requestForm && requestError) {
    var messengerLinks = {
      telegram: "https://t.me/assistant_Irinachistyakova_bot",
      vk: "https://vk.me/iriska_77?text=Здравствуйте!%20Хочу%20записаться%20на%20консультацию"
    };

    requestForm.addEventListener("submit", function (e) {
      e.preventDefault();
      requestError.hidden = true;
      requestError.textContent = "";
      var nameEl = document.getElementById("request-fullname");
      var phoneEl = document.getElementById("request-phone");
      var consentEl = document.getElementById("request-consent");
      var messengerEl = requestForm.querySelector("input[name='request-messenger']:checked");
      if (!nameEl || !phoneEl) return;
      if (consentEl && !consentEl.checked) {
        requestError.textContent =
          "Пожалуйста, отметьте согласие с политикой конфиденциальности.";
        requestError.hidden = false;
        consentEl.focus();
        return;
      }
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

      fetch("/.netlify/functions/send-telegram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ fullname: fullname, phone: phone })
      })
        .then(function (response) {
          if (!response.ok) throw new Error("send failed");
          var messenger = messengerEl ? messengerEl.value : "telegram";
          var messengerUrl = messengerLinks[messenger] || messengerLinks.telegram;
          alert("Заявка отправлена");
          window.open(messengerUrl, "_blank", "noopener,noreferrer");
          requestForm.reset();
          var returnBtn = document.getElementById("return-to-reading");
          if (returnBtn && sessionStorage.getItem(PM_RETURN_READING_KEY)) {
            returnBtn.removeAttribute("hidden");
            returnBtn.hidden = false;
          }
        })
        .catch(function () {
          alert("Ошибка отправки. Напишите в Telegram или ВКонтакте");
        });
    });
  }
})();
