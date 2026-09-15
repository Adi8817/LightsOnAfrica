/* ==========================================================
   Serengeti Pride Safaris — USA Travelers Landing Page
   Vanilla JavaScript — behaviour only, no HTML generation
   ========================================================== */

document.addEventListener("DOMContentLoaded", function () {
  /* ---------- sticky nav shadow ---------- */
  var header = document.getElementById("siteHeader");
  window.addEventListener(
    "scroll",
    function () {
      if (window.scrollY > 30) header.classList.add("scrolled");
      else header.classList.remove("scrolled");
    },
    { passive: true }
  );

  /* ---------- mobile menu ---------- */
  var navLinks = document.getElementById("navLinks");
  var burger = document.getElementById("burgerBtn");
  var drawer = document.getElementById("mobileDrawer");
  var backdrop = document.getElementById("drawerBackdrop");
  var drawerClose = document.getElementById("drawerClose");

  function openDrawer() {
    drawer.classList.add("open");
    backdrop.classList.add("show");
    drawer.setAttribute("aria-hidden", "false");
    burger.setAttribute("aria-expanded", "true");
    document.body.classList.add("drawer-lock");
  }
  function closeDrawer() {
    drawer.classList.remove("open");
    backdrop.classList.remove("show");
    drawer.setAttribute("aria-hidden", "true");
    burger.setAttribute("aria-expanded", "false");
    document.body.classList.remove("drawer-lock");
  }
  burger.addEventListener("click", openDrawer);
  drawerClose.addEventListener("click", closeDrawer);
  backdrop.addEventListener("click", closeDrawer);
  drawer.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeDrawer);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeDrawer();
  });

  /* ---------- active nav indication (scrollspy) ---------- */
  var navAnchors = Array.prototype.slice.call(navLinks.querySelectorAll("a")).concat(
    Array.prototype.slice.call(drawer.querySelectorAll(".drawer-links a"))
  );
  var navSections = navAnchors
    .map(function (a) {
      return document.querySelector(a.getAttribute("href"));
    })
    .filter(Boolean);
  function setActiveNav() {
    var pos = window.scrollY + 140;
    var current = navSections[0];
    navSections.forEach(function (sec) {
      if (sec.offsetTop <= pos) current = sec;
    });
    navAnchors.forEach(function (a) {
      a.classList.toggle("active", current && a.getAttribute("href") === "#" + current.id);
    });
  }
  window.addEventListener("scroll", setActiveNav, { passive: true });
  setActiveNav();

  /* ---------- scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("show");
    });
  }

  /* ---------- populate month dropdowns (rolling next 12 months) ---------- */
  var monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  var now = new Date();
  document.querySelectorAll(".monthSelect").forEach(function (sel) {
    for (var i = 0; i < 12; i++) {
      var d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      var label = monthNames[d.getMonth()] + " " + d.getFullYear();
      var opt = document.createElement("option");
      opt.value = label;
      opt.textContent = label;
      sel.appendChild(opt);
    }
  });

  /* ---------- populate traveler count dropdowns (1-12, 13+) ---------- */
  document.querySelectorAll(".travellerSelect").forEach(function (sel) {
    for (var i = 1; i <= 12; i++) {
      var opt = document.createElement("option");
      opt.value = i;
      opt.textContent = i;
      sel.appendChild(opt);
    }
    var last = document.createElement("option");
    last.value = "13+";
    last.textContent = "13+";
    sel.appendChild(last);
  });


  
  /* ---------- generic horizontal sliders (destinations + testimonials) ---------- */
  var sliderState = {};

  function getGap(track) {
    return track.id === "trackTesti" ? 22 : 20;
  }

  function cardWidth(track) {
    return track.children[0] ? track.children[0].offsetWidth + getGap(track) : 0;
  }

  function maxIndex(track) {
    var visible = Math.floor(track.parentElement.offsetWidth / cardWidth(track));
    return Math.max(track.children.length - visible, 0);
  }

  window.slide = function (id, dir) {
    var track = document.getElementById(id);
    if (!track) return;
    var cw = cardWidth(track);
    var max = maxIndex(track);
    var current = sliderState[id] || 0;
    current += dir;
    if (current < 0) current = 0;
    if (current > max) current = max;
    sliderState[id] = current;
    track.style.transform = "translateX(" + -current * cw + "px)";
  };

  function autoAdvance(id, dir, intervalMs) {
    setInterval(function () {
      var track = document.getElementById(id);
      if (!track) return;
      var max = maxIndex(track);
      var current = sliderState[id] || 0;
      current += dir;
      if (current > max) current = 0;
      if (current < 0) current = max;
      sliderState[id] = current;
      track.style.transform = "translateX(" + -current * cardWidth(track) + "px)";
    }, intervalMs);
  }

  autoAdvance("trackDest", 1, 4200);
  autoAdvance("trackTesti", 1, 3800);

  /* ---------- hero fullscreen slider (auto-play fade, arrows, dots) ---------- */
  var heroSection = document.getElementById("hero");
  var heroSlides = document.querySelectorAll(".hero-slide");
  var heroDots = document.querySelectorAll(".hero-dot");
  var heroPrev = document.getElementById("heroPrev");
  var heroNext = document.getElementById("heroNext");
  if (heroSection && heroSlides.length > 1) {
    var heroIndex = 0;
    var heroTimer = null;

    function goToHero(index) {
      heroSlides[heroIndex].classList.remove("is-active");
      heroDots[heroIndex] && heroDots[heroIndex].classList.remove("is-active");
      heroIndex = (index + heroSlides.length) % heroSlides.length;
      heroSlides[heroIndex].classList.add("is-active");
      heroDots[heroIndex] && heroDots[heroIndex].classList.add("is-active");
    }
    function startHeroAutoplay() {
      stopHeroAutoplay();
      heroTimer = setInterval(function () {
        goToHero(heroIndex + 1);
      }, 5000);
    }
    function stopHeroAutoplay() {
      if (heroTimer) clearInterval(heroTimer);
    }

    if (heroPrev) heroPrev.addEventListener("click", function () {
      goToHero(heroIndex - 1);
      startHeroAutoplay();
    });
    if (heroNext) heroNext.addEventListener("click", function () {
      goToHero(heroIndex + 1);
      startHeroAutoplay();
    });
    heroDots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        goToHero(i);
        startHeroAutoplay();
      });
    });
    heroSection.addEventListener("mouseenter", stopHeroAutoplay);
    heroSection.addEventListener("mouseleave", startHeroAutoplay);

    startHeroAutoplay();
  }

  /* re-clamp slider position on resize */
  window.addEventListener("resize", function () {
    ["trackDest", "trackTesti"].forEach(function (id) {
      var track = document.getElementById(id);
      if (!track) return;
      sliderState[id] = 0;
      track.style.transform = "translateX(0px)";
    });
  });





  /* ---------- form validation + async submit (no page reload) ---------- */
  function submitFormAsync() {
    // Placeholder for a real backend/CRM endpoint. Wrapped in a Promise so
    // swapping in a genuine fetch() call later requires no changes above.
    return new Promise(function (resolve, reject) {
      setTimeout(function () {
        resolve();
      }, 800);
    });
  }

  function wireForm(formId, successId) {
    var form = document.getElementById(formId);
    var success = document.getElementById(successId);
    if (!form) return;
    var errorBox = form.querySelector(".form-error");
    var submitBtn = form.querySelector(".form-submit");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      success.classList.remove("show");
      if (errorBox) errorBox.classList.remove("show");

      var valid = true;
      var missingLabels = [];
      form.querySelectorAll("[required]").forEach(function (field) {
        var wrap = field.closest(".field");
        var ok = field.value.trim() !== "";
        if (field.type === "email" && ok) {
          ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
        }
        if (field.type === "tel" && ok) {
          ok = field.value.replace(/\D/g, "").length >= 7;
        }
        if (wrap) wrap.classList.toggle("error", !ok);
        if (!ok) {
          valid = false;
          var label = wrap && wrap.querySelector("label");
          missingLabels.push(label ? label.textContent.replace("*", "").trim() : field.name);
        }
      });

      if (!valid) {
        if (errorBox) {
          errorBox.textContent =
            "Please check the following: " + missingLabels.join(", ") + ".";
          errorBox.classList.add("show");
        }
        return;
      }

      var originalLabel = submitBtn ? submitBtn.textContent : "";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending…";
      }

      submitFormAsync()
        .then(function () {
          form.reset();
          success.textContent =
            "✅ Thank you! Your inquiry has been submitted successfully. Our team will contact you shortly.";
          success.classList.add("show");
          setTimeout(function () {
            success.classList.remove("show");
          }, 7000);
        })
        .catch(function () {
          if (errorBox) {
            errorBox.textContent =
              "❌ Something went wrong. Please try again in a few moments.";
            errorBox.classList.add("show");
          }
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalLabel;
          }
        });
    });
  }
  wireForm("quickLeadForm", "quickSuccess");
  wireForm("mainQuoteForm", "mainSuccess");
  wireForm("offerForm", "offerSuccess");

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var btn = item.querySelector(".faq-q");
    var answer = item.querySelector(".faq-a");
    btn.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach(function (openItem) {
        if (openItem !== item) {
          openItem.classList.remove("open");
          openItem.querySelector(".faq-q").setAttribute("aria-expanded", "false");
          openItem.querySelector(".faq-a").style.maxHeight = null;
        }
      });
      if (isOpen) {
        item.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
        answer.style.maxHeight = null;
      } else {
        item.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });




  /* ---------- rolling 7-day countdown for the offer section ---------- */
  var cdTarget = getNewTarget();
  function getNewTarget() {
    var t = new Date();
    t.setDate(t.getDate() + 7);
    return t;
  }
  function updateCountdown() {
    var now = new Date();
    var diff = cdTarget - now;
    if (diff <= 0) {
      cdTarget = getNewTarget();
      diff = cdTarget - now;
    }
    var d = Math.floor(diff / (1000 * 60 * 60 * 24));
    var h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    var m = Math.floor((diff / (1000 * 60)) % 60);
    var s = Math.floor((diff / 1000) % 60);
    var elD = document.getElementById("cdDays");
    var elH = document.getElementById("cdHours");
    var elM = document.getElementById("cdMins");
    var elS = document.getElementById("cdSecs");
    if (elD) elD.textContent = d;
    if (elH) elH.textContent = h;
    if (elM) elM.textContent = m;
    if (elS) elS.textContent = s;
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);
});
