/* ==========================================================
   S.H.E Empowered — Member Registration
   ----------------------------------------------------------
   ✏️  EVERYTHING YOU MIGHT WANT TO CHANGE IS IN THIS CONFIG
   ========================================================== */
const CONFIG = {
  // 1) Paste your Google Apps Script Web App URL here (see README, "Save responses").
  //    Leave it empty and the site runs in preview mode (nothing is saved).
  GOOGLE_SCRIPT_URL: "https://script.google.com/macros/s/AKfycby-Ol-oV35bCtPTCUya3xnUF7G_U_VyPyjxxQUKI7dUx0aLhagj-gTkydKsjMRxp_cj/exec",

  // 2) Members' WhatsApp group
  WHATSAPP_LINK: "https://chat.whatsapp.com/IMszq38FwHLIsbbCRxNOWq?mode=gi_t",

  // 3) Levels shown as buttons
  LEVELS: ["100 Level", "200 Level", "300 Level", "400 Level", "500 Level", "Postgraduate"],

  // 4) Colleges. Leave empty [] for a free-text box, or list them to get a dropdown, e.g.
  //    ["College of Science and Technology", "College of Engineering", ...]
  COLLEGES: [],

  // 5) Fitness options (keep "Other" last — it opens a text box)
  FITNESS: [
    "Track & running", "Basketball", "Gym / weight training", "Football", "Volleyball",
    "Tennis", "Swimming", "Dance", "Yoga & pilates", "Walking & hiking", "Other",
  ],

  // 6) Book genres (keep "Other" last — it opens a text box)
  GENRES: [
    "Romance", "Fiction", "Mystery & thriller", "Fantasy", "Science fiction",
    "Self-help & personal growth", "Faith & Christian living", "Biography & memoir",
    "Business & finance", "African literature", "Poetry", "History", "Psychology",
    "Young adult", "Classics", "Other",
  ],
};

/* ========================================================== */

(() => {
  const form = document.getElementById("she-form");
  const panels = [...form.querySelectorAll(".panel")];
  const navActions = document.getElementById("nav-actions");
  const nextBtn = navActions.querySelector('[data-action="next"]');
  const backBtn = navActions.querySelector('[data-action="back"]');
  const progress = document.querySelector(".progress");
  const progressBar = progress.querySelector(".progress-bar");
  const progressLabel = progress.querySelector(".progress-label");
  const sideItems = [...document.querySelectorAll(".steps-nav li")];
  const DRAFT_KEY = "she-empowered-draft-v1";
  const LAST_STEP = 4;   // review
  const DONE_STEP = 5;   // success

  let step = 0;
  let maxReached = 0;
  let submitting = false;

  document.getElementById("year").textContent = new Date().getFullYear();
  document.getElementById("wa-link").href = CONFIG.WHATSAPP_LINK;
  if (!CONFIG.GOOGLE_SCRIPT_URL) document.getElementById("preview-pill").hidden = false;

  /* ───────── Build dynamic inputs ───────── */
  function buildChips(containerId, options) {
    const box = document.getElementById(containerId);
    const { name, type } = box.dataset;
    box.setAttribute("role", type === "radio" ? "radiogroup" : "group");
    box.innerHTML = options
      .map((opt) => `<label class="chip"><input type="${type}" name="${name}" value="${escapeHtml(opt)}"><span>${escapeHtml(opt)}</span></label>`)
      .join("");
  }
  buildChips("level-chips", CONFIG.LEVELS);
  buildChips("fitness-chips", CONFIG.FITNESS);
  buildChips("book-chips", CONFIG.GENRES);

  (function buildCollege() {
    const field = document.getElementById("college-field");
    const errorEl = field.querySelector(".error");
    let el;
    if (CONFIG.COLLEGES.length) {
      el = document.createElement("select");
      el.innerHTML = `<option value="" disabled selected>Select your college</option>` +
        CONFIG.COLLEGES.map((c) => `<option>${escapeHtml(c)}</option>`).join("");
    } else {
      el = document.createElement("input");
      el.type = "text";
      el.placeholder = "e.g. College of Management and Social Sciences";
    }
    el.id = "college";
    el.name = "college";
    el.required = true;
    field.insertBefore(el, errorEl);
  })();

  /* ───────── Helpers ───────── */
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  const val = (name) => {
    const el = form.elements[name];
    if (!el) return "";
    if (el instanceof RadioNodeList) return el.value || "";
    return (el.value || "").trim();
  };
  const checked = (name) => [...form.querySelectorAll(`input[name="${name}"]:checked`)].map((i) => i.value);

  function setError(name, msg) {
    const errEl = form.querySelector(`[data-error-for="${name}"]`);
    if (!errEl) return;
    errEl.textContent = msg || "";
    const field = errEl.closest(".field");
    if (field) field.classList.toggle("has-error", !!msg);
    const input = form.elements[name];
    if (input && !(input instanceof RadioNodeList)) input.setAttribute("aria-invalid", msg ? "true" : "false");
  }

  /* ───────── Validation ───────── */
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function validatePhone(raw) {
    const digits = raw.replace(/\D/g, "");
    if (!digits) return "Please enter your phone number.";
    if (raw.replace(/[\s\-()+]/g, "").match(/\D/)) return "Use numbers only, e.g. 0801 234 5678.";
    if (digits.startsWith("0") && digits.length !== 11) return "Nigerian numbers starting with 0 should have 11 digits.";
    if (digits.length < 10 || digits.length > 15) return "That doesn’t look like a complete phone number.";
    return "";
  }

  const rules = {
    1: () => {
      const errs = {};
      const name = val("fullName");
      if (!name) errs.fullName = "Please enter your full name.";
      else if (name.length < 3 || !/[a-zA-Z]/.test(name)) errs.fullName = "Please enter your full name.";
      const email = val("email");
      if (!email) errs.email = "Please enter your email address.";
      else if (!EMAIL_RE.test(email)) errs.email = "Please enter a valid email, e.g. you@example.com.";
      const p = validatePhone(val("phone"));
      if (p) errs.phone = p;
      return errs;
    },
    2: () => {
      const errs = {};
      if (!val("level")) errs.level = "Please select your level.";
      if (!val("college")) errs.college = CONFIG.COLLEGES.length ? "Please select your college." : "Please enter your college.";
      if (!val("department")) errs.department = "Please enter your department.";
      return errs;
    },
    3: () => {
      const errs = {};
      if (val("hasBusiness") === "Yes" && !val("businessName")) errs.businessName = "Please enter your business name (or choose “No”).";
      if (val("fitness") === "Yes" && !checked("fitnessActivities").length) errs.fitnessActivities = "Pick at least one activity (or choose “No”).";
      if (val("books") === "Yes" && !checked("bookGenres").length) errs.bookGenres = "Pick at least one genre (or choose “No”).";
      return errs;
    },
  };
  const FIELDS_BY_STEP = {
    1: ["fullName", "email", "phone"],
    2: ["level", "college", "department"],
    3: ["businessName", "fitnessActivities", "bookGenres"],
  };

  function validateStep(n, { focus = true } = {}) {
    const rule = rules[n];
    if (!rule) return true;
    const errs = rule();
    FIELDS_BY_STEP[n].forEach((f) => setError(f, errs[f]));
    const first = FIELDS_BY_STEP[n].find((f) => errs[f]);
    if (first && focus) {
      const el = form.querySelector(`[name="${first}"]`);
      if (el) {
        el.focus({ preventScroll: true });
        el.closest(".field")?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
    return !first;
  }

  // Clear an error as soon as the person fixes it
  form.addEventListener("input", (e) => {
    const name = e.target.name;
    if (!name) return;
    const errEl = form.querySelector(`[data-error-for="${name}"]`);
    if (errEl && errEl.textContent) {
      const n = Object.keys(FIELDS_BY_STEP).find((k) => FIELDS_BY_STEP[k].includes(name));
      const errs = rules[n]();
      setError(name, errs[name]);
    }
    saveDraft();
  });

  // Validate a single text field when leaving it (only if something was typed)
  form.addEventListener("focusout", (e) => {
    const name = e.target.name;
    if (!name || !["email", "phone"].includes(name) || !e.target.value.trim()) return;
    const errs = rules[1]();
    setError(name, errs[name]);
  });

  /* ───────── Optional interests: Yes / No reveals ───────── */
  function syncReveals() {
    ["hasBusiness", "fitness", "books"].forEach((name) => {
      const box = form.querySelector(`[data-reveal="${name}"]`);
      const open = val(name) === "Yes";
      box.hidden = !open;
      box.closest(".interest").classList.toggle("is-open", open);
      if (!open) box.querySelectorAll(".error").forEach((e) => setError(e.dataset.errorFor, ""));
    });
    [["fitnessActivities", "fitnessOther"], ["bookGenres", "bookOther"]].forEach(([group, other]) => {
      const wrap = form.querySelector(`[data-other="${group}"]`);
      wrap.hidden = !checked(group).includes("Other");
    });
  }
  form.addEventListener("change", (e) => {
    if (["hasBusiness", "fitness", "books", "fitnessActivities", "bookGenres"].includes(e.target.name)) {
      syncReveals();
      if (e.target.value === "Yes" && e.target.type === "radio") {
        const first = form.querySelector(`[data-reveal="${e.target.name}"] input`);
        setTimeout(() => first && first.type === "text" && first.focus(), 60);
      }
    }
    if (e.target.name === "level") setError("level", "");
    saveDraft();
  });

  /* ───────── Collect data ───────── */
  function collect() {
    const fitnessYes = val("fitness") === "Yes";
    const booksYes = val("books") === "Yes";
    const bizYes = val("hasBusiness") === "Yes";
    const fit = fitnessYes ? checked("fitnessActivities") : [];
    const gen = booksYes ? checked("bookGenres") : [];
    return {
      fullName: val("fullName").replace(/\s+/g, " "),
      email: val("email").toLowerCase(),
      phone: val("phone"),
      level: val("level"),
      college: val("college"),
      department: val("department"),
      hasBusiness: val("hasBusiness") || "Not answered",
      businessName: bizYes ? val("businessName") : "",
      businessDescription: bizYes ? val("businessDescription") : "",
      fitness: val("fitness") || "Not answered",
      fitnessActivities: fit.filter((x) => x !== "Other").concat(fit.includes("Other") && val("fitnessOther") ? [`Other: ${val("fitnessOther")}`] : fit.includes("Other") ? ["Other"] : []).join(", "),
      books: val("books") || "Not answered",
      bookGenres: gen.filter((x) => x !== "Other").concat(gen.includes("Other") && val("bookOther") ? [`Other: ${val("bookOther")}`] : gen.includes("Other") ? ["Other"] : []).join(", "),
    };
  }

  /* ───────── Review ───────── */
  function renderReview() {
    const d = collect();
    const row = (label, value) =>
      `<dt>${label}</dt><dd class="${value ? "" : "muted"}">${value ? escapeHtml(value) : "—"}</dd>`;
    const optional = (answer, detail) => (answer === "Yes" ? detail || "Yes" : answer === "No" ? "No" : "");
    const business = d.hasBusiness === "Yes"
      ? d.businessName + (d.businessDescription ? ` — ${d.businessDescription}` : "")
      : optional(d.hasBusiness);

    document.getElementById("review").innerHTML = `
      <section class="review-block">
        <header><h3>About you</h3><button type="button" class="edit" data-goto="1">Edit</button></header>
        <dl>${row("Full name", d.fullName)}${row("Email", d.email)}${row("Phone", d.phone)}</dl>
      </section>
      <section class="review-block">
        <header><h3>Your studies</h3><button type="button" class="edit" data-goto="2">Edit</button></header>
        <dl>${row("Level", d.level)}${row("College", d.college)}${row("Department", d.department)}</dl>
      </section>
      <section class="review-block">
        <header><h3>Interests</h3><button type="button" class="edit" data-goto="3">Edit</button></header>
        <dl>${row("Business", business)}${row("Fitness", optional(d.fitness, d.fitnessActivities))}${row("Books", optional(d.books, d.bookGenres))}</dl>
      </section>`;
  }

  /* ───────── Navigation ───────── */
  function goTo(n, { scroll = true } = {}) {
    step = n;
    maxReached = Math.max(maxReached, n);
    panels.forEach((p) => (p.hidden = Number(p.dataset.step) !== n));

    const inFlow = n >= 1 && n <= LAST_STEP;
    navActions.hidden = !inFlow;
    progress.classList.toggle("show", n >= 1);
    const pct = n >= DONE_STEP ? 100 : Math.max(0, ((n - 1) / LAST_STEP) * 100 + 100 / LAST_STEP / 2);
    progressBar.style.width = n === 0 ? "0%" : pct + "%";
    progress.setAttribute("aria-valuenow", String(Math.min(n, LAST_STEP)));
    progressLabel.textContent = inFlow ? `Step ${n} of ${LAST_STEP}` : "";

    if (n === LAST_STEP) renderReview();
    nextBtn.querySelector(".label").textContent = n === LAST_STEP ? "Submit registration" : n === 3 ? "Review" : "Continue";
    backBtn.style.visibility = n >= 1 ? "visible" : "hidden";

    sideItems.forEach((li) => {
      const s = Number(li.dataset.nav);
      li.classList.toggle("is-current", s === n);
      li.classList.toggle("is-done", n === DONE_STEP || (s !== n && s <= maxReached));
      const btn = li.querySelector("button");
      if (s === n) btn.setAttribute("aria-current", "step"); else btn.removeAttribute("aria-current");
    });

    if (scroll) {
      const top = form.getBoundingClientRect().top + window.scrollY - 24;
      if (window.scrollY > top) window.scrollTo({ top, behavior: "smooth" });
    }
    const heading = panels.find((p) => !p.hidden)?.querySelector("h1, h2");
    if (heading) { heading.setAttribute("tabindex", "-1"); heading.focus({ preventScroll: true }); }
    saveDraft();
  }

  // Can we jump straight to step `target`? Only if every earlier step is valid.
  function canJumpTo(target) {
    for (let s = 1; s < target; s++) {
      if (!validateStep(s, { focus: false })) { goTo(s); validateStep(s); return false; }
    }
    return true;
  }

  async function next() {
    if (submitting) return;
    if (step === LAST_STEP) return submit();
    if (!validateStep(step)) return;
    goTo(step + 1);
  }

  form.addEventListener("click", (e) => {
    const action = e.target.closest("[data-action]")?.dataset.action;
    const gotoBtn = e.target.closest("[data-goto]");
    if (gotoBtn) return goTo(Number(gotoBtn.dataset.goto));
    if (action === "start") goTo(1);
    if (action === "next") next();
    if (action === "back" && step > 0) goTo(step - 1);
    if (action === "restart") restart();
  });

  sideItems.forEach((li) =>
    li.querySelector("button").addEventListener("click", () => {
      const target = Number(li.dataset.nav);
      if (step === DONE_STEP || target === step || target > maxReached) return;
      if (target < step || canJumpTo(target)) goTo(target);
    })
  );
  document.querySelector('[data-action="home"]').addEventListener("click", (e) => {
    e.preventDefault();
    if (step !== DONE_STEP) goTo(0);
  });

  // Enter in a text box moves forward instead of submitting the form
  form.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.matches("input[type=text], input[type=email], input[type=tel]")) {
      e.preventDefault();
      next();
    }
  });
  form.addEventListener("submit", (e) => { e.preventDefault(); next(); });

  /* ───────── Submit ───────── */
  async function submit() {
    for (let s = 1; s <= 3; s++) {
      if (!validateStep(s, { focus: false })) { goTo(s); validateStep(s); return; }
    }
    const errorBox = document.getElementById("submit-error");
    errorBox.hidden = true;
    submitting = true;
    const label = nextBtn.querySelector(".label");
    const arrow = nextBtn.querySelector("svg");
    nextBtn.disabled = true;
    backBtn.disabled = true;
    label.textContent = "Submitting…";
    arrow.style.display = "none";
    const spinner = document.createElement("span");
    spinner.className = "spinner";
    nextBtn.prepend(spinner);

    const data = collect();
    data.submittedAt = new Date().toISOString();

    try {
      if (CONFIG.GOOGLE_SCRIPT_URL) {
        // "no-cors" + form encoding is the most reliable way to post to Google Apps Script
        await fetch(CONFIG.GOOGLE_SCRIPT_URL, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
          body: new URLSearchParams(data).toString(),
        });
      } else {
        console.warn("[S.H.E] Preview mode: GOOGLE_SCRIPT_URL is empty, so this response was NOT saved.", data);
        await new Promise((r) => setTimeout(r, 700));
      }
      document.getElementById("done-name").textContent = data.fullName.split(" ")[0] || "sis";
      clearDraft();
      goTo(DONE_STEP);
    } catch (err) {
      console.error(err);
      errorBox.textContent = "We couldn’t submit your registration — please check your internet connection and try again.";
      errorBox.hidden = false;
    } finally {
      submitting = false;
      nextBtn.disabled = false;
      backBtn.disabled = false;
      spinner.remove();
      arrow.style.display = "";
      if (step === LAST_STEP) label.textContent = "Submit registration";
    }
  }

  function restart() {
    form.reset();
    form.querySelectorAll(".error").forEach((e) => setError(e.dataset.errorFor, ""));
    syncReveals();
    maxReached = 0;
    clearDraft();
    goTo(0);
  }

  /* ───────── Draft: keep progress if the page is refreshed ───────── */
  function saveDraft() {
    try {
      if (step === DONE_STEP) return;
      const fd = new FormData(form);
      const obj = {};
      for (const [k, v] of fd.entries()) (obj[k] = obj[k] || []).push(v);
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ data: obj, step, maxReached }));
    } catch (_) { /* storage unavailable — ignore */ }
  }
  function clearDraft() {
    try { localStorage.removeItem(DRAFT_KEY); } catch (_) {}
  }
  function restoreDraft() {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const { data, step: s, maxReached: m } = JSON.parse(raw);
      Object.entries(data).forEach(([name, values]) => {
        form.querySelectorAll(`[name="${name}"]`).forEach((el) => {
          if (el.type === "radio" || el.type === "checkbox") el.checked = values.includes(el.value);
          else el.value = values[0] ?? "";
        });
      });
      syncReveals();
      maxReached = Math.min(m || 0, LAST_STEP);
      if (s >= 1 && s <= LAST_STEP) goTo(s, { scroll: false });
    } catch (_) { /* corrupted draft — ignore */ }
  }

  syncReveals();
  goTo(0, { scroll: false });
  restoreDraft();
})();
