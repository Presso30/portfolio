/* ═══════════════════════════════════════════════════
   PORTFOLIO — Péniel Toton « Presso »
   Interactions : thème, nav, reveals, planche du hero, formulaire
   ═══════════════════════════════════════════════════ */

"use strict";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ── Thème clair / sombre ─────────────────────────── */
(function initTheme() {
  const stored = localStorage.getItem("theme");
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = stored || (systemDark ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", theme);

  document.getElementById("themeToggle").addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  });
})();

/* ── Navigation ───────────────────────────────────── */
const navbar = document.getElementById("navbar");
const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("navMenu");
const navLinks = document.querySelectorAll(".nav-link");

hamburger.addEventListener("click", () => {
  const open = navMenu.classList.toggle("active");
  hamburger.classList.toggle("active", open);
  hamburger.setAttribute("aria-expanded", String(open));
});

navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    navMenu.classList.remove("active");
    hamburger.classList.remove("active");
    hamburger.setAttribute("aria-expanded", "false");

    const target = document.querySelector(link.getAttribute("href"));
    if (target) {
      const top = target.getBoundingClientRect().top + window.scrollY - navbar.offsetHeight + 2;
      window.scrollTo({ top, behavior: prefersReducedMotion ? "auto" : "smooth" });
    }
  });
});

/* ombre de nav + lien actif + back-to-top, sur un seul listener scroll */
const sections = document.querySelectorAll("section[id], header[id]");
const backToTop = document.createElement("button");
backToTop.className = "back-to-top";
backToTop.innerHTML = "↑";
backToTop.setAttribute("aria-label", "Retour en haut de page");
document.body.appendChild(backToTop);
backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
});

let scrollTick = false;
window.addEventListener("scroll", () => {
  if (scrollTick) return;
  scrollTick = true;
  requestAnimationFrame(() => {
    const y = window.scrollY;
    navbar.classList.toggle("scrolled", y > 10);
    backToTop.classList.toggle("visible", y > 500);

    const pos = y + navbar.offsetHeight + 90;
    let currentId = null;
    sections.forEach((s) => {
      if (pos >= s.offsetTop && pos < s.offsetTop + s.offsetHeight) currentId = s.id;
    });
    navLinks.forEach((l) => {
      l.classList.toggle("active-link", l.getAttribute("href") === `#${currentId}`);
    });
    scrollTick = false;
  });
}, { passive: true });

/* ── Reveals au scroll ────────────────────────────── */
(function initReveals() {
  const targets = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || prefersReducedMotion) {
    targets.forEach((el) => el.classList.add("in-view"));
    return;
  }
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
  targets.forEach((el) => observer.observe(el));
})();

/* ── Compteurs de la section À propos ─────────────── */
(function initCounters() {
  const nums = document.querySelectorAll("[data-count]");
  if (!nums.length) return;
  if (prefersReducedMotion || !("IntersectionObserver" in window)) return; // valeurs déjà écrites en dur

  const animate = (el) => {
    const target = parseInt(el.getAttribute("data-count"), 10);
    const start = target > 100 ? target - 60 : 0; // les années démarrent proche, les petits nombres de zéro
    const duration = 1100;
    const t0 = performance.now();
    const step = (t) => {
      const p = Math.min((t - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(start + (target - start) * eased));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const obs = new IntersectionObserver((entries, o) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { animate(e.target); o.unobserve(e.target); }
    });
  }, { threshold: 0.6 });
  nums.forEach((el) => obs.observe(el));
})();

/* ── Planche du hero : brut → structuré → décidé ───── */
(function initPlate() {
  const svg = document.getElementById("plateSvg");
  if (!svg) return;
  const layer = svg.querySelector(".plate-points");
  const steps = document.querySelectorAll(".plate-steps li");
  const NS = "http://www.w3.org/2000/svg";

  // générateur pseudo-aléatoire à graine fixe : même dessin à chaque visite
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  const COLS = [4, 7, 12, 9, 6, 4]; // 42 points, la colonne la plus haute est « la décision »
  const N = COLS.reduce((a, b) => a + b, 0);
  const HOT = COLS.indexOf(Math.max(...COLS));

  // état 0 : nuage en désordre
  const raw = Array.from({ length: N }, () => ({ x: 44 + rand() * 292, y: 34 + rand() * 214 }));
  // état 1 : aligné sur la tendance, avec un reste de bruit
  const trend = Array.from({ length: N }, (_, i) => {
    const x = 46 + (i / (N - 1)) * 288;
    return { x, y: 238 - (x - 38) * 0.583 + (rand() - 0.5) * 34 };
  });
  // état 2 : rangé en colonnes (histogramme en points)
  const cols = [], hot = [];
  COLS.forEach((count, c) => {
    for (let k = 0; k < count; k++) {
      cols.push({ x: 70 + c * 50, y: 250 - k * 16 });
      hot.push(c === HOT);
    }
  });
  // on mélange l'ordre des colonnes pour que chaque point voyage vraiment
  const order = Array.from({ length: N }, (_, i) => i).sort(() => rand() - 0.5);
  const states = [raw, trend, order.map((i) => cols[i])];
  const hotAt = order.map((i) => hot[i]);

  const dots = Array.from({ length: N }, (_, i) => {
    const c = document.createElementNS(NS, "circle");
    c.setAttribute("r", "4.6");
    layer.appendChild(c);
    return c;
  });

  let current = states[2].map((p) => ({ ...p }));
  const place = () => dots.forEach((d, i) => {
    d.setAttribute("cx", current[i].x.toFixed(1));
    d.setAttribute("cy", current[i].y.toFixed(1));
  });

  function show(step) {
    svg.dataset.state = step;
    steps.forEach((li) => li.classList.toggle("is-on", Number(li.dataset.step) === step));
    dots.forEach((d, i) => d.classList.toggle("is-hot", step === 2 && hotAt[i]));
  }

  if (prefersReducedMotion) { place(); show(2); return; }

  const easeOutExpo = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
  const DURATION = 1300, STAGGER = 14, HOLD = 2600;
  let step = 0, from = null, start = 0, raf = null, timer = null, running = false;

  current = states[0].map((p) => ({ ...p }));
  place(); show(0);

  function animate(now) {
    let done = true;
    for (let i = 0; i < N; i++) {
      const t = Math.min(Math.max((now - start - i * STAGGER) / DURATION, 0), 1);
      if (t < 1) done = false;
      const e = easeOutExpo(t), to = states[step][i];
      current[i].x = from[i].x + (to.x - from[i].x) * e;
      current[i].y = from[i].y + (to.y - from[i].y) * e;
    }
    place();
    if (done) { raf = null; timer = setTimeout(next, HOLD); }
    else raf = requestAnimationFrame(animate);
  }

  function next() {
    step = (step + 1) % 3;
    from = current.map((p) => ({ ...p }));
    start = performance.now();
    show(step);
    raf = requestAnimationFrame(animate);
  }

  function play() { if (!running) { running = true; timer = setTimeout(next, 900); } }
  function pause() {
    running = false;
    clearTimeout(timer); cancelAnimationFrame(raf); raf = null;
  }

  // pause quand la planche sort de l'écran ou que l'onglet est caché
  let inView = false;
  new IntersectionObserver(([e]) => {
    inView = e.isIntersecting;
    inView ? play() : pause();
  }, { threshold: 0.2 }).observe(svg);
  document.addEventListener("visibilitychange", () => (document.hidden ? pause() : inView && play()));
})();

/* ── Formulaire de contact (EmailJS) ──────────────── */
const contactForm = document.getElementById("contactForm");
const formInputs = contactForm.querySelectorAll("input:not(.hp-field), textarea");
const submitBtn = document.getElementById("submitBtn");

formInputs.forEach((input) => {
  input.addEventListener("blur", () => validateField(input));
  input.addEventListener("input", () => {
    input.closest(".form-group").classList.remove("error");
  });
});

function validateField(field) {
  const group = field.closest(".form-group");
  const errorEl = group.querySelector(".error-message");
  const value = field.value.trim();
  group.classList.remove("error");
  errorEl.textContent = "";

  let message = "";
  switch (field.name) {
    case "nom":
      if (value.length < 2) message = "Le nom doit contenir au moins 2 caractères.";
      break;
    case "email":
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) message = "Veuillez entrer un email valide.";
      break;
    case "sujet":
      if (value.length < 3) message = "Le sujet doit contenir au moins 3 caractères.";
      break;
    case "message":
      if (value.length < 10) message = "Le message doit contenir au moins 10 caractères.";
      break;
  }

  if (message) {
    group.classList.add("error");
    errorEl.textContent = message;
    return false;
  }
  return true;
}

contactForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // honeypot rempli = robot → on ignore silencieusement
  const hp = document.getElementById("website");
  if (hp && hp.value.trim() !== "") return;

  let valid = true;
  formInputs.forEach((input) => { if (!validateField(input)) valid = false; });

  if (!valid) {
    const firstError = contactForm.querySelector(".form-group.error");
    if (firstError) firstError.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Envoi en cours…";

  emailjs.send("service_cmts3fi", "template_3y2rf78", {
    from_name: document.getElementById("nom").value,
    from_email: document.getElementById("email").value,
    subject: document.getElementById("sujet").value,
    message: document.getElementById("message").value,
  })
    .then(() => {
      notify("✓ Message envoyé ! Je vous réponds très vite.");
      contactForm.reset();
    })
    .catch((error) => {
      console.error("Erreur EmailJS :", error);
      notify("✕ L'envoi a échoué. Réessayez, ou écrivez-moi sur WhatsApp.");
    })
    .finally(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = "Envoyer le message";
    });
});

function notify(text) {
  const el = document.createElement("div");
  el.className = "success-notification";
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => {
    el.classList.add("leaving");
    setTimeout(() => el.remove(), 400);
  }, 4200);
}
