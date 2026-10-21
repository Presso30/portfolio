/* ═══════════════════════════════════════════════════
   PORTFOLIO — Péniel Toton « Presso »
   Interactions : thème, nav, reveals, planche du hero, formulaire
   ═══════════════════════════════════════════════════ */

"use strict";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ── Thème clair / sombre ─────────────────────────── */
// le thème initial est posé par le script en tête de index.html (pas de flash)
document.getElementById("themeToggle").addEventListener("click", () => {
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  try { localStorage.setItem("theme", next); } catch (e) { /* navigation privée */ }
});

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
backToTop.innerHTML = '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M8 13.5V3M3.5 7.5 8 3l4.5 4.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
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
  const targets = document.querySelectorAll(".reveal, .trajectory, .skill-index");
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

  if (prefersReducedMotion) {
    place(); show(2);
    document.getElementById("plateToggle").hidden = true;
    return;
  }

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

  let paused = false, started = false;
  function play() {
    if (running || paused) return;
    running = true;
    timer = setTimeout(next, started ? 600 : 2200); // laisse le temps de lire « Brut » au premier passage
    started = true;
  }
  function pause() {
    running = false;
    clearTimeout(timer); cancelAnimationFrame(raf); raf = null;
  }

  // pause quand la planche sort de l'écran ou que l'onglet est caché
  const toggle = document.getElementById("plateToggle");
  toggle.addEventListener("click", () => {
    paused = !paused;
    toggle.setAttribute("aria-pressed", String(paused));
    toggle.setAttribute("aria-label", paused ? "Relancer l'animation" : "Mettre l'animation en pause");
    paused ? pause() : inView && play();
  });

  let inView = false;
  new IntersectionObserver(([e]) => {
    inView = e.isIntersecting;
    inView ? play() : pause();
  }, { threshold: 0.2 }).observe(svg);
  document.addEventListener("visibilitychange", () => (document.hidden ? pause() : inView && play()));
})();

/* ── Figures dessinées : les traits se tracent, les points apparaissent ── */
function prepFigure(svg) {
  svg.classList.add("fig-draw");
  svg.querySelectorAll("line, path, rect, polyline, polygon, circle, ellipse, text").forEach((el, i) => {
    if (el.closest("defs")) return;
    const stroked = el.closest("[stroke]");
    const stroke = stroked && stroked.getAttribute("stroke");
    const dashed = el.closest("[stroke-dasharray]");
    if (el.tagName !== "text" && stroke && stroke !== "none" && !dashed) {
      el.setAttribute("pathLength", "1");
      el.setAttribute("data-draw", "");
    } else {
      el.setAttribute("data-pop", "");
    }
    el.style.setProperty("--o", Math.min(i, 18)); // au-delà, tout finit ensemble
  });
}
function redraw(svg) {
  svg.classList.remove("is-drawn");
  requestAnimationFrame(() => requestAnimationFrame(() => svg.classList.add("is-drawn")));
}

/* ── Sommaire : Fig. 3 suit l'entrée lue (bureau), figures en ligne (mobile) ── */
(function initSommaire() {
  const entries = Array.from(document.querySelectorAll(".entry"));
  const stage = document.querySelector(".sf-stage");
  if (!entries.length || !stage) return;
  const label = document.querySelector(".sf-label");
  const caption = document.querySelector(".sf-caption");
  const desktop = window.matchMedia("(min-width: 1021px)");

  const figs = entries.map((entry) => {
    const clone = entry.querySelector(".entry-svg").cloneNode(true);
    stage.appendChild(clone);
    if (!prefersReducedMotion) {
      prepFigure(clone);
      prepFigure(entry.querySelector(".entry-svg"));
    }
    return clone;
  });

  let current = -1;
  function activate(i) {
    if (i === current) return;
    entries.forEach((e, k) => e.classList.toggle("is-active", k === i));
    figs.forEach((f, k) => f.classList.toggle("is-active", k === i));
    label.textContent = entries[i].dataset.label;
    caption.textContent = entries[i].dataset.caption;
    if (!prefersReducedMotion) redraw(figs[i]);
    current = i;
  }
  activate(0);

  if (!("IntersectionObserver" in window)) return;
  // l'entrée qui traverse le milieu de l'écran devient active
  const mid = new IntersectionObserver((list) => {
    list.forEach((e) => { if (e.isIntersecting && desktop.matches) activate(entries.indexOf(e.target)); });
  }, { rootMargin: "-45% 0px -50% 0px" });
  entries.forEach((e) => mid.observe(e));

  // mobile : chaque figure se dessine en entrant à l'écran
  if (prefersReducedMotion) return;
  const inline = new IntersectionObserver((list, o) => {
    list.forEach((e) => {
      if (e.isIntersecting && !desktop.matches) { e.target.classList.add("is-drawn"); o.unobserve(e.target); }
    });
  }, { threshold: 0.4 });
  entries.forEach((e) => inline.observe(e.querySelector(".entry-svg")));
})();

/* ── Index des compétences : une référence allume ce qu'elle a mobilisé ── */
(function initSkillIndex() {
  const index = document.getElementById("skillIndex");
  if (!index) return;
  const items = Array.from(index.querySelectorAll(".ix-entry"));
  const refs = index.querySelectorAll(".ix-refs a");
  items.forEach((el, i) => el.style.setProperty("--i", i));

  const light = (src) => {
    index.dataset.hl = src;
    items.forEach((el) => el.classList.toggle("is-lit", el.dataset.src.split(" ").includes(src)));
    refs.forEach((a) => a.classList.toggle("is-match", a.dataset.src === src));
  };
  const clear = () => {
    delete index.dataset.hl;
    items.forEach((el) => el.classList.remove("is-lit"));
    refs.forEach((a) => a.classList.remove("is-match"));
  };
  refs.forEach((a) => {
    a.addEventListener("mouseenter", () => light(a.dataset.src));
    a.addEventListener("focus", () => light(a.dataset.src));
    a.addEventListener("mouseleave", clear);
    a.addEventListener("blur", clear);
  });

  // une fois l'apparition finie, on retire les délais pour que le survol réagisse tout de suite
  const settle = new MutationObserver(() => {
    if (index.classList.contains("in-view")) {
      setTimeout(() => index.classList.add("is-settled"), 1900);
      settle.disconnect();
    }
  });
  settle.observe(index, { attributes: true, attributeFilter: ["class"] });
})();

/* ── Formulaire de contact (EmailJS) ──────────────── */
const contactForm = document.getElementById("contactForm");
const formInputs = contactForm.querySelectorAll("input:not(.hp-field), textarea");
const submitBtn = document.getElementById("submitBtn");

formInputs.forEach((input) => {
  input.addEventListener("blur", () => validateField(input));
  input.addEventListener("input", () => {
    input.closest(".form-group").classList.remove("error");
    input.removeAttribute("aria-invalid");
  });
});

function validateField(field) {
  const group = field.closest(".form-group");
  const errorEl = group.querySelector(".error-message");
  const value = field.value.trim();
  group.classList.remove("error");
  field.removeAttribute("aria-invalid");
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
    field.setAttribute("aria-invalid", "true");
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
    const firstError = contactForm.querySelector("[aria-invalid='true']");
    if (firstError) firstError.focus();
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Envoi en cours…";

  const reset = () => {
    submitBtn.disabled = false;
    submitBtn.textContent = "Envoyer le message";
  };

  // Promise.resolve().then : une erreur synchrone (EmailJS non chargé) arrive aussi dans le catch
  Promise.resolve()
    .then(() => {
      if (typeof emailjs === "undefined") throw new Error("EmailJS non chargé");
      return emailjs.send("service_cmts3fi", "template_3y2rf78", {
        from_name: document.getElementById("nom").value,
        from_email: document.getElementById("email").value,
        subject: document.getElementById("sujet").value,
        message: document.getElementById("message").value,
      });
    })
    .then(() => {
      notify("ok", "Message envoyé", "Merci, je vous réponds très vite.");
      contactForm.reset();
    })
    .catch((error) => {
      console.error("Erreur d'envoi :", error);
      notify("error", "L'envoi n'a pas abouti", "Votre message est toujours dans le formulaire. Réessayez, ou écrivez-moi directement :");
    })
    .finally(reset);
});

function notify(kind, title, text) {
  const el = document.createElement("div");
  el.className = `toast toast--${kind}`;
  el.setAttribute("role", kind === "error" ? "alert" : "status");
  const t = document.createElement("strong");
  t.className = "toast-title";
  t.textContent = title;
  const p = document.createElement("span");
  p.textContent = text;
  el.append(t, p);
  if (kind === "error") {
    const a = document.createElement("a");
    a.href = "https://wa.me/2290147167062";
    a.target = "_blank";
    a.rel = "noopener";
    a.className = "link-sweep";
    a.textContent = "WhatsApp ou penieltoton51@gmail.com";
    el.append(a);
  }
  document.body.appendChild(el);
  setTimeout(() => {
    el.classList.add("leaving");
    setTimeout(() => el.remove(), 400);
  }, kind === "error" ? 9000 : 4200);
}
