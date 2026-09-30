// MTO Job Accelerator — interactions (vanilla, no dependencies)
(function () {
  "use strict";

  // Mobile menu: hidden state + Escape + focus return
  var menuBtn = document.getElementById("menuBtn");
  var mobileMenu = document.getElementById("mobileMenu");
  function setMenu(open) {
    if (!menuBtn || !mobileMenu) return;
    mobileMenu.classList.toggle("open", open);
    if (open) {
      mobileMenu.removeAttribute("hidden");
    } else {
      mobileMenu.setAttribute("hidden", "");
    }
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
  }
  if (menuBtn && mobileMenu) {
    setMenu(false);
    menuBtn.addEventListener("click", function () {
      var open = !mobileMenu.classList.contains("open");
      setMenu(open);
    });
    mobileMenu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape" && mobileMenu.classList.contains("open")) {
        setMenu(false);
        menuBtn.focus();
      }
    });
  }

  // Accordions (curriculum + FAQ): exclusive-open per group, correct ARIA
  document.querySelectorAll(".accordion").forEach(function (acc) {
    acc.querySelectorAll(".acc-item").forEach(function (item) {
      var btn = item.querySelector(".acc-btn");
      var panel = item.querySelector(".acc-panel");
      var sign = item.querySelector(".acc-sign");
      if (!btn || !panel) return;
      btn.addEventListener("click", function () {
        var isOpen = item.classList.contains("open");
        acc.querySelectorAll(".acc-item.open").forEach(function (other) {
          other.classList.remove("open");
          var ob = other.querySelector(".acc-btn");
          var os = other.querySelector(".acc-sign");
          if (ob) ob.setAttribute("aria-expanded", "false");
          if (os) os.textContent = "+";
        });
        if (!isOpen) {
          item.classList.add("open");
          btn.setAttribute("aria-expanded", "true");
          if (sign) sign.textContent = "–";
        }
      });
    });
  });

  // Testimonial slider: aria-hidden sync + counter + arrow keys
  var slides = Array.from(document.querySelectorAll(".slide"));
  var slideCount = document.getElementById("slideCount");
  var slider = document.querySelector(".slider");
  var idx = 0;
  var prev = document.getElementById("prevSlide");
  var next = document.getElementById("nextSlide");
  function show(i) {
    if (!slides.length) return;
    idx = (i + slides.length) % slides.length;
    slides.forEach(function (s, k) {
      var active = k === idx;
      s.classList.toggle("active", active);
      if (active) {
        s.removeAttribute("aria-hidden");
      } else {
        s.setAttribute("aria-hidden", "true");
      }
    });
    if (slideCount) slideCount.textContent = "Slide " + (idx + 1) + " of " + slides.length;
  }
  if (prev) prev.addEventListener("click", function () { show(idx - 1); });
  if (next) next.addEventListener("click", function () { show(idx + 1); });
  if (slider) {
    slider.addEventListener("keydown", function (ev) {
      if (ev.key === "ArrowLeft") { ev.preventDefault(); show(idx - 1); }
      if (ev.key === "ArrowRight") { ev.preventDefault(); show(idx + 1); }
    });
  }
  show(0);

  // Counters: respect reduced motion
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var counters = document.querySelectorAll("[data-count]");
  function animate(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    if (isNaN(target)) return;
    var suffix = target === 600 ? "+" : "";
    if (reduceMotion) { el.textContent = String(target) + suffix; return; }
    var dur = 900;
    var t0 = null;
    function tick(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      el.textContent = String(Math.round(target * p)) + (p === 1 ? suffix : "");
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if ("IntersectionObserver" in window && counters.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animate(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (c) { io.observe(c); });
  } else {
    counters.forEach(animate);
  }

  // Hero background video: respect reduced motion, best-effort autoplay.
  // Markup already sets autoplay/muted/loop/playsinline + poster fallback.
  var heroVideo = document.querySelector(".hero-video");
  if (heroVideo) {
    try {
      if (reduceMotion) {
        heroVideo.removeAttribute("autoplay");
        heroVideo.pause();
      } else {
        var playPromise = heroVideo.play();
        if (playPromise && playPromise.catch) playPromise.catch(function () {});
      }
    } catch (e) {}
  }

  // Plan selection: ?plan=masterclass|accelerator, pricing buttons, form select
  var planSelect = document.getElementById("plan");
  var planNote = document.getElementById("planNote");
  var PLAN_LABELS = {
    masterclass: "Masterclass (4 weeks · Tk. 2,990)",
    accelerator: "Accelerator (8 weeks · Tk. 4,990)"
  };
  function currentPlan() {
    if (planSelect && (planSelect.value === "masterclass" || planSelect.value === "accelerator")) {
      return planSelect.value;
    }
    return "accelerator";
  }
  function renderPlan() {
    if (planNote) planNote.textContent = "Selected plan: " + PLAN_LABELS[currentPlan()] + " — change with the pricing buttons or the choice below.";
  }
  function planFromUrl() {
    try {
      var q = new URLSearchParams(window.location.search).get("plan");
      var h = (window.location.hash.match(/plan=(masterclass|accelerator)/) || [])[1];
      return q === "masterclass" || q === "accelerator" ? q : h || null;
    } catch (e) { return null; }
  }
  var initialPlan = planFromUrl();
  if (initialPlan && planSelect) planSelect.value = initialPlan;
  renderPlan();
  document.querySelectorAll("[data-plan]").forEach(function (el) {
    el.addEventListener("click", function () {
      var p = el.getAttribute("data-plan");
      if ((p === "masterclass" || p === "accelerator") && planSelect) {
        planSelect.value = p;
        renderPlan();
      }
    });
  });
  if (planSelect) planSelect.addEventListener("change", renderPlan);

  // Application form: honest validation, no fake success.
  // BACKEND INTEGRATION POINT: set data-endpoint on #applyForm to enable POST.
  var form = document.getElementById("applyForm");
  if (form) {
    var out = document.getElementById("formMsg");
    var submitBtn = document.getElementById("applyBtn");
    var nameEl = document.getElementById("name");
    var emailEl = document.getElementById("email");
    var phoneEl = document.getElementById("phone");
    var consentEl = document.getElementById("consent");
    var MESSAGES = {
      name: "Enter your full name (at least 2 letters).",
      email: "Enter a valid email address, e.g. name@example.com.",
      phone: "Enter a valid Bangladeshi mobile, e.g. +880 1XXXXXXXXX.",
      consent: "Please accept contact consent to continue."
    };
    function setError(id, message) {
      var msg = form.querySelector('[data-error-for="' + id + '"]');
      var input = document.getElementById(id);
      if (msg) msg.textContent = message || "";
      if (input) input.setAttribute("aria-invalid", message ? "true" : "false");
    }
    function validPhone(raw) {
      var v = String(raw || "").replace(/[\s\-()]/g, "");
      return /^\+?8801[3-9]\d{8}$/.test(v) || /^01[3-9]\d{8}$/.test(v);
    }
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var ok = true;
      var nameOk = !!(nameEl && nameEl.value.trim().length >= 2 && /[A-Za-z\u0980-\u09FF]/.test(nameEl.value));
      var emailOk = !!(emailEl && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailEl.value.trim()) && emailEl.value.trim().length <= 254);
      var phoneOk = !!(phoneEl && validPhone(phoneEl.value));
      var consentOk = !!(consentEl && consentEl.checked);
      setError("name", nameOk ? "" : MESSAGES.name);
      setError("email", emailOk ? "" : MESSAGES.email);
      setError("phone", phoneOk ? "" : MESSAGES.phone);
      setError("consent", consentOk ? "" : MESSAGES.consent);
      ok = nameOk && emailOk && phoneOk && consentOk;
      if (!ok) {
        if (out) out.textContent = "Check the highlighted fields and try again. Nothing has been submitted.";
        var firstBad = !nameOk ? nameEl : !emailOk ? emailEl : !phoneOk ? phoneEl : consentEl;
        if (firstBad && firstBad.focus) firstBad.focus();
        return; // preserve all entered values
      }
      var endpoint = (form.getAttribute("data-endpoint") || "").trim();
      if (!endpoint) {
        // Static-site fallback: no backend is configured, so hand the
        // validated lead to the visitor's own email app. Nothing is stored
        // on this site and no request is sent anywhere automatically.
        var trackVal = document.getElementById("track") ? document.getElementById("track").value : "";
        var subject = "MTO application - " + PLAN_LABELS[currentPlan()];
        var body = "Name: " + nameEl.value.trim() + "\nEmail: " + emailEl.value.trim() + "\nPhone: " + phoneEl.value.trim() + "\nTrack: " + trackVal + "\nPlan: " + PLAN_LABELS[currentPlan()];
        if (submitBtn) { submitBtn.setAttribute("aria-busy", "false"); }
        if (out) out.textContent = "Online submission is not configured yet, so your email app will open with the application addressed to admissions@mtoaccelerator.com. Press send to submit it — nothing has been stored or sent automatically.";
        window.location.href = "mailto:admissions@mtoaccelerator.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
        return; // do NOT reset: preserve values so nothing is lost
      }
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.setAttribute("aria-busy", "true");
      }
      if (out) out.textContent = "Submitting…";
      var payload = {
        name: nameEl.value.trim(),
        email: emailEl.value.trim(),
        phone: phoneEl.value.trim(),
        track: document.getElementById("track") ? document.getElementById("track").value : "",
        plan: currentPlan(),
        consent: true
      };
      var controller = new AbortController();
      var timer = setTimeout(function () { controller.abort(); }, 10000);
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal
      }).then(function (res) {
        clearTimeout(timer);
        if (!res.ok) throw new Error("bad-status-" + res.status);
        return res.json().catch(function () { return {}; });
      }).then(function () {
        if (out) out.textContent = "Application submitted for " + PLAN_LABELS[currentPlan()] + ". Our team will confirm your track and schedule.";
        form.reset();
        renderPlan();
      }).catch(function (err) {
        if (out) {
          out.textContent = err && err.name === "AbortError"
            ? "Submission timed out. Nothing was confirmed — please try again."
            : "Submission failed. Nothing was confirmed — please try again or email admissions@mtoaccelerator.com.";
        }
      }).then(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.removeAttribute("aria-busy");
        }
      });
    });
  }
})();
