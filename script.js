/* ═══════════════════════════════════════════════════
   PORTFOLIO — Péniel Toton « Presso »
   Interactions : thème, nav, reveals, canvas, formulaire
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

/* ── Canvas : champ de points de données (hero) ───── */
(function initDataField() {
  const canvas = document.getElementById("dataField");
  if (!canvas || prefersReducedMotion) return;
  const ctx = canvas.getContext("2d");

  let w, h, points = [], raf;
  const DENSITY = 1 / 16000; // points par pixel²
  const LINK_DIST = 130;

  const colors = () => {
    const dark = document.documentElement.getAttribute("data-theme") === "dark";
    return {
      dot: dark ? "rgba(147,164,216,0.55)" : "rgba(43,58,103,0.4)",
      link: dark ? "rgba(147,164,216," : "rgba(43,58,103,",
      coral: dark ? "rgba(239,138,113,0.8)" : "rgba(226,114,91,0.7)",
    };
  };

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.offsetWidth;
    h = canvas.offsetHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.min(Math.round(w * h * DENSITY), 90);
    points = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.8 + 0.8,
      coral: Math.random() < 0.12,
    }));
  }

  function frame() {
    ctx.clearRect(0, 0, w, h);
    const c = colors();

    for (const p of points) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
    }

    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const a = points[i], b = points[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d = Math.hypot(dx, dy);
        if (d < LINK_DIST) {
          ctx.strokeStyle = c.link + (0.14 * (1 - d / LINK_DIST)).toFixed(3) + ")";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    for (const p of points) {
      ctx.fillStyle = p.coral ? c.coral : c.dot;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    raf = requestAnimationFrame(frame);
  }

  // pause quand le hero sort de l'écran (économie batterie)
  const hero = document.querySelector(".hero");
  const visObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { if (!raf) raf = requestAnimationFrame(frame); }
      else { cancelAnimationFrame(raf); raf = null; }
    });
  }, { threshold: 0.05 });
  visObs.observe(hero);

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 200);
  });

  resize();
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

/* ── Portrait : rotation automatique du stack ─────── */
(function initPortraitStack() {
  const frames = Array.from(document.querySelectorAll(".portrait-frame[data-pos]"));
  if (frames.length < 2 || prefersReducedMotion) return;

  setInterval(() => {
    frames.forEach((frame) => {
      const pos = parseInt(frame.getAttribute("data-pos"), 10);
      frame.setAttribute("data-pos", String((pos + 2) % 3));
    });
  }, 4000);
})();

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
