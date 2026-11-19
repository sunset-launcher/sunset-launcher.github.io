(() => {
  "use strict";
  const REPO = "svarkawm/sunset-launcher";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(pointer: fine)").matches;
  const page = document.body.dataset.page || "home";

  /* =========================================================
     Shared layout (header / footer / decorative layers)
     ========================================================= */
  const GH_ICON = '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>';
  const PAGES = [
    ["home", "index.html", "nav.home", "Главная"],
    ["features", "features.html", "nav.features", "Возможности"],
    ["screenshots", "screenshots.html", "nav.screens", "Скриншоты"],
    ["download", "download.html", "nav.download", "Скачать"],
    ["faq", "faq.html", "nav.faq", "FAQ"],
  ];

  document.body.insertAdjacentHTML("afterbegin", `
    <div class="bg-glow" aria-hidden="true"></div>
    <div class="bg-grid" aria-hidden="true"></div>
    <canvas id="particles" aria-hidden="true"></canvas>
    <div class="cursor-glow" aria-hidden="true"></div>
    <div class="progress" aria-hidden="true"></div>
    <div class="curtain" aria-hidden="true"></div>
    <div class="toast" id="toast"></div>`);

  $("#app-header").outerHTML = `
    <header class="nav" id="nav">
      <div class="container nav-inner">
        <a href="index.html" class="brand">
          <img src="assets/logo.png" alt="" width="34" height="34" />
          <span>Sunset Launcher</span>
        </a>
        <nav class="nav-links" id="navLinks">
          <span class="nav-hover"></span><span class="nav-ind"></span>
          ${PAGES.map(([id, href, key, ru]) => `<a href="${href}" class="${id === page ? "active" : ""}" data-i18n="${key}">${ru}</a>`).join("")}
        </nav>
        <div class="nav-actions">
          <button class="lang-btn" id="langBtn" aria-label="Switch language">EN</button>
          <a class="btn btn-ghost btn-sm gh" href="https://github.com/${REPO}" target="_blank" rel="noopener">${GH_ICON}<span>GitHub</span></a>
          <button class="burger" id="burger" aria-label="Menu"><span></span><span></span><span></span></button>
        </div>
      </div>
    </header>`;

  $("#app-footer").outerHTML = `
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-col">
            <a href="index.html" class="brand"><img src="assets/logo.png" alt="" width="30" height="30" /><span>Sunset Launcher</span></a>
            <p class="muted" data-i18n="ft.desc">Быстрый нативный лаунчер Minecraft на чистом Rust. Без телеметрии, с открытым кодом.</p>
          </div>
          <div class="footer-col">
            <h4 data-i18n="ft.pages">Страницы</h4>
            ${PAGES.map(([, href, key, ru]) => `<a href="${href}" data-i18n="${key}">${ru}</a>`).join("")}
          </div>
          <div class="footer-col">
            <h4 data-i18n="ft.links">Ссылки</h4>
            <a href="https://github.com/${REPO}" target="_blank" rel="noopener">GitHub</a>
            <a href="https://github.com/${REPO}/releases" target="_blank" rel="noopener" data-i18n="ft.releases">Релизы</a>
            <a href="https://github.com/${REPO}/issues" target="_blank" rel="noopener" data-i18n="ft.issues">Сообщить о баге</a>
            <a href="https://modrinth.com" target="_blank" rel="noopener">Modrinth</a>
          </div>
        </div>
        <div class="footer-bottom">
          <span><span data-i18n="ft.by">Сделано</span> <a href="https://github.com/svarkawm" target="_blank" rel="noopener">svarka</a> &amp; Antigravity · MIT License</span>
          <span data-i18n="ft.legal">Не является официальным продуктом Minecraft. Не связано с Mojang или Microsoft.</span>
        </div>
      </div>
    </footer>`;

  /* =========================================================
     i18n — Russian lives in the HTML, English here
     ========================================================= */
  const EN = {
    "nav.home": "Home", "nav.features": "Features", "nav.screens": "Screenshots", "nav.download": "Download", "nav.faq": "FAQ",
    "hero.pill": "New release", "hero.title1": "The Minecraft launcher", "hero.title2": "that just flies",
    "hero.lead": "A native launcher written in pure Rust. Mods and modpacks from Modrinth, Microsoft, Ely.by and offline accounts — no Electron, no telemetry, no bloat.",
    "hero.download": "Download for free", "hero.more": "Features", "hero.meta3": "Zero telemetry",
    "hero.fc1": "parallel downloads", "hero.fc2": "mods · shaders · packs",
    "stats.loaders": "mod loaders", "stats.dl": "download threads", "stats.lang": "UI languages", "stats.rust": "pure Rust",
    "feat.eyebrow": "Features", "feat.title": "Everything you need to play — in one window",
    "feat.sub": "From vanilla survival to a 300-mod pack. Sunset handles all the busywork.", "feat.all": "All features",
    "f1.t": "Instances & profiles", "f1.d": "Create, duplicate and edit instances. Each one lives in its own isolated folder.",
    "f1.long": "Create, duplicate, edit and delete instances. Each one lives in its own instances/<name> folder — mods, configs and worlds of different versions never get mixed up. Switch instances right from the sidebar.",
    "f1.c1": "Isolated game folders", "f1.c2": "One-click duplicate", "f1.c3": "Quick Switch & favorites",
    "f2.t": "Modrinth & .mrpack", "f2.d": "Mods, modpacks, resource packs and shaders. Import and export .mrpack.",
    "f2.long": "A built-in Modrinth catalog: search and install mods, modpacks, resource packs and shaders without leaving the launcher. Dependencies and version compatibility are resolved automatically.",
    "f2.c1": ".mrpack import & export", "f2.c2": "Shaders & resource packs", "f2.c3": "Filter by version and loader",
    "f3.t": "Lightning-fast downloads", "f3.d": "Up to 64 concurrent transfers with streaming SHA-1 verification.",
    "f3b.t": "Content management", "f3b.long": "Enable and disable individual mods without deleting them. See what is installed, which version and where it came from.",
    "f3b.c1": "Toggle files on/off", "f3b.c2": "64 parallel downloads", "f3b.c3": "On-the-fly SHA-1 checks",
    "f4.t": "Accounts & skins", "f4.d": "Microsoft, Ely.by and offline accounts with skin previews.",
    "f4.long": "Microsoft sign-in via Device Code, Ely.by accounts via authlib-injector, and offline profiles. Head and body previews are cached locally.",
    "f5.t": "Worlds & backups", "f5.d": "Quick Play straight into a world and one-click .zip backups.",
    "f6.t": "Java & JVM", "f6.d": "RAM, custom JVM args, G1GC, ZGC and Aikar's presets. Automatic Java discovery.",
    "f7.t": "Live console", "f7.d": "Real-time game log and crash detection.",
    "f7.long": "Game stdout and stderr in real time with filters. If the game crashes you get a banner with the cause, and the crash report is copied with one button.",
    "f7.c1": "Log filters", "f7.c2": "Crash detection", "f7.c3": "Copy crash report",
    "f8.t": "Themes, languages & Discord", "f8.long": "9 UI languages, customizable themes and fonts, a Ctrl+K command palette and Discord Rich Presence in your language.", "f8.c3": "9 languages",
    "f9.t": "Auto-updates", "f9.d": "Checks and installs updates from GitHub Releases.",
    "f10.t": "Privacy", "f10.d": "Zero telemetry. Tokens are stored only on your disk.",
    "f11.t": "OS integration", "f11.d": ".desktop entry on Linux and Start Menu shortcut on Windows, single-instance lock.",
    "f12.t": "Pure Rust", "f12.d": "A single native binary on eframe/egui. Instant startup and low memory use.",
    "fp.title1": "Power that", "fp.title2": "never lags", "fp.lead": "Everything Sunset Launcher can do — from installing a modpack to restoring a world from backup.",
    "fp.more": "And more", "fp.moreTitle": "Little things that matter",
    "ld.eyebrow": "Loaders", "ld.title": "Any loader — in a couple of clicks",
    "ld.sub": "Official Mojang, Fabric/Quilt Meta and Forge/NeoForge Maven APIs, including installer processors.",
    "ld.v": "Pure Minecraft", "ld.f": "Light and fast", "ld.q": "Fabric fork", "ld.fo": "Modding classic", "ld.n": "Next generation",
    "cmp.eyebrow": "Why Sunset", "cmp.title": "Native vs Electron", "cmp.others": "Typical launcher",
    "cmp.r1": "Technology", "cmp.r2": "Telemetry", "cmp.r3": "Single binary", "cmp.r4": "Ely.by out of the box", "cmp.r5": "Open source",
    "cmp.none": "None", "cmp.often": "Often", "cmp.varies": "Varies",
    "dl.title": "Ready to play?", "dl.sub": "Download Sunset Launcher for your system. It's free and always will be.",
    "dl.src": "Source code", "dl.ver": "Latest version:", "dl.all": "All releases", "dl.copy": "Copy", "dl.copied": "Copied!", "dl.for": "Download for",
    "cta.screens": "View screenshots",
    "sp.title1": "Take a look", "sp.title2": "inside", "sp.lead": "Click a screenshot to open it fullscreen. Use ← → to browse.",
    "scr.t1": "Library", "scr.t2": "Modrinth", "scr.t3": "Mods", "scr.t4": "Accounts", "scr.t5": "Settings", "scr.t6": "Console",
    "scr.d1": "All instances and quick launch", "scr.d2": "Mods and modpacks catalog", "scr.d3": "Instance content",
    "scr.d4": "Microsoft, Ely.by, Offline", "scr.d5": "Themes, Java, language", "scr.d6": "Live game log",
    "dp.title1": "Download", "dp.rec": "Recommended", "dp.get": "Download", "dp.install": "Install", "dp.howto": "How to install",
    "dp.l1": "Download the sunset-launcher-linux-x64 file.", "dp.l2": "Make it executable and run it:",
    "dp.l3": "On first launch the launcher adds its icon and an application menu entry automatically.",
    "dp.w1": "Download sunset-launcher-windows-x64.exe.", "dp.w2": "Run the .exe — a Start Menu shortcut is created automatically.",
    "dp.w3": "If SmartScreen appears: \"More info\" → \"Run anyway\".", "dp.verify": "PowerShell — verify SHA-256",
    "dp.s1": "Install Rust via rustup.", "dp.s2": "Clone the repository and build a release:",
    "dp.req": "System requirements", "dp.r1": "OS", "dp.r2": "Memory", "dp.r2v": "4 GB+ (8 GB for modpacks)",
    "dp.r3v": "Auto-detect / Adoptium", "dp.r4": "Internet", "dp.r4v": "For the first version download",
    "dp.changes": "What's new", "dp.loading": "Loading release notes from GitHub…", "dp.noNotes": "Couldn't load release notes. See them on GitHub.",
    "qp.title1": "Frequently asked", "qp.title2": "questions", "qp.search": "Search questions…", "qp.empty": "Nothing found 🤔",
    "qp.help": "Didn't find an answer?", "qp.helpd": "Open an issue on GitHub — we'll sort it out.", "qp.issue": "Open an issue",
    "q1": "Is it free?", "a1": "Yes. Sunset Launcher is MIT-licensed and the source code is open on GitHub.",
    "q2": "Do I need a Minecraft license?", "a2": "Microsoft sign-in requires an owned copy of the game. Ely.by accounts and offline mode are also supported.",
    "q3": "Windows says \"Unknown publisher\". Is it dangerous?", "a3": "Releases are not code-signed yet, so SmartScreen shows a warning. Click \"More info\" → \"Run anyway\". You can verify integrity with the .sha256 file or build from source.",
    "q4": "Do you collect my data?", "a4": "No. No telemetry or analytics. Tokens and accounts are stored locally only. Network requests go only to required services: Mojang, Modrinth, mod loaders, Adoptium, Microsoft / Ely.by and GitHub for updates.",
    "q5": "Where are game files stored?", "a5": "Linux: ~/.local/share/sunset-launcher. Windows: %LOCALAPPDATA%\\sunset-launcher. Inside are profiles, accounts, versions, libraries, assets and isolated instance folders.",
    "q6": "Will there be a macOS version?", "a6": "Linux and Windows are officially supported right now. You can build for other platforms from source with cargo.",
    "q7": "How do I install a modpack?", "a7": "Open the Discover tab, find a modpack on Modrinth and click Install — or import a .mrpack file. The launcher creates the instance and downloads everything.",
    "q8": "Do I need to install Java manually?", "a8": "No. The launcher finds installed Java automatically and can download a suitable Adoptium build into its own folder.",
    "q9": "The game crashes. What should I do?", "a9": "Open the Console tab — you'll see a crash banner and a button to copy the crash report. Increasing RAM or picking a JVM preset in instance settings often helps.",
    "q10": "How do I update the launcher?", "a10": "Sunset checks GitHub Releases itself and offers to install the new version right from the UI.",
    "ft.desc": "A fast native Minecraft launcher in pure Rust. No telemetry, open source.", "ft.pages": "Pages", "ft.links": "Links",
    "ft.releases": "Releases", "ft.issues": "Report a bug", "ft.by": "Made by",
    "ft.legal": "Not an official Minecraft product. Not associated with Mojang or Microsoft.",
  };
  const RU = { "dl.copied": "Скопировано!", "dl.for": "Скачать для", "dp.noNotes": "Не удалось загрузить заметки. Смотрите их на GitHub." };
  $$("[data-i18n]").forEach((el) => { if (!RU[el.dataset.i18n]) RU[el.dataset.i18n] = el.textContent.trim(); });
  $$("[data-i18n-ph]").forEach((el) => (RU[el.dataset.i18nPh] = el.placeholder));

  let lang = localStorage.getItem("lang") || (/^(ru|uk|be|kk)/i.test(navigator.language || "ru") ? "ru" : "en");
  const t = (k) => (lang === "en" ? EN[k] : RU[k]) ?? RU[k] ?? EN[k] ?? k;

  function applyLang() {
    document.documentElement.lang = lang;
    $$("[data-i18n]").forEach((el) => (el.textContent = t(el.dataset.i18n)));
    $$("[data-i18n-ph]").forEach((el) => (el.placeholder = t(el.dataset.i18nPh)));
    $("#langBtn").textContent = lang === "ru" ? "EN" : "RU";
    updateDownloadCTA();
    requestAnimationFrame(() => { moveInd(); moveSeg(); });
  }
  $("#langBtn").addEventListener("click", () => {
    lang = lang === "ru" ? "en" : "ru";
    localStorage.setItem("lang", lang);
    document.body.animate([{ opacity: 1 }, { opacity: .4 }, { opacity: 1 }], { duration: 350 });
    applyLang();
  });

  /* =========================================================
     Nav: scroll state, sliding indicator, burger
     ========================================================= */
  const nav = $("#nav"), links = $("#navLinks"), ind = $(".nav-ind"), hov = $(".nav-hover"), progress = $(".progress");
  function place(el, target) {
    if (!target) { el.style.opacity = 0; return; }
    el.style.opacity = 1;
    el.style.width = target.offsetWidth + "px";
    el.style.transform = `translateX(${target.offsetLeft}px)`;
  }
  function moveInd() { place(ind, $("a.active", links)); }
  $$("a", links).forEach((a) => a.addEventListener("mouseenter", () => place(hov, a)));
  links.addEventListener("mouseleave", () => (hov.style.opacity = 0));
  addEventListener("resize", moveInd);
  document.fonts?.ready.then(moveInd);

  const burger = $("#burger");
  burger.addEventListener("click", () => { links.classList.toggle("open"); burger.classList.toggle("open"); });

  function onScroll() {
    nav.classList.toggle("scrolled", scrollY > 10);
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    const m = $(".mountains");
    if (m && !reduceMotion) m.style.transform = `translateY(${scrollY * 0.15}px)`;
  }
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* =========================================================
     Page transitions
     ========================================================= */
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target === "_blank" || a.hasAttribute("download")) return;
    const href = a.getAttribute("href") || "";
    if (!/^[\w-]+\.html(#.*)?$/.test(href)) return;
    const dest = new URL(href, location.href);
    if (dest.pathname === location.pathname) { if (!dest.hash) { e.preventDefault(); scrollTo({ top: 0 }); } return; }
    e.preventDefault();
    if (reduceMotion) { location.href = dest.href; return; }
    document.body.classList.add("leaving");
    setTimeout(() => (location.href = dest.href), 320);
  });
  addEventListener("pageshow", (e) => { if (e.persisted) document.body.classList.remove("leaving"); });

  /* =========================================================
     Reveal on scroll + counters
     ========================================================= */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      $$("[data-count]", e.target).forEach(countUp);
      io.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  // stagger siblings inside the same parent
  $$(".reveal").forEach((el) => {
    const sibs = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
    el.style.transitionDelay = `${Math.min(sibs.indexOf(el), 6) * 80}ms`;
    io.observe(el);
  });
  function countUp(el) {
    const end = +el.dataset.count, suffix = el.dataset.suffix || "", dur = 1400, start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 4))) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* =========================================================
     Pointer effects: cursor glow, spotlight cards, magnetic buttons, tilt
     ========================================================= */
  if (finePointer && !reduceMotion) {
    const glow = $(".cursor-glow");
    let gx = 0, gy = 0, cx = 0, cy = 0;
    addEventListener("pointermove", (e) => { gx = e.clientX; gy = e.clientY; });
    (function loop() {
      cx += (gx - cx) * 0.12; cy += (gy - cy) * 0.12;
      glow.style.left = cx + "px"; glow.style.top = cy + "px";
      requestAnimationFrame(loop);
    })();

    $$(".feature, .os-card").forEach((f) => f.addEventListener("pointermove", (e) => {
      const r = f.getBoundingClientRect();
      f.style.setProperty("--mx", `${e.clientX - r.left}px`);
      f.style.setProperty("--my", `${e.clientY - r.top}px`);
    }));

    $$(".magnetic").forEach((b) => {
      b.addEventListener("pointermove", (e) => {
        const r = b.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        b.style.transform = `translate(${x * 0.18}px, ${y * 0.3}px)`;
      });
      b.addEventListener("pointerleave", () => (b.style.transform = ""));
    });

    const win = $("#heroWindow"), hero = $(".hero");
    if (win && hero && matchMedia("(min-width: 1001px)").matches) {
      const shine = $(".window-shine", win);
      hero.addEventListener("pointermove", (e) => {
        const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
        win.style.transform = `rotateY(${-10 + x * 12}deg) rotateX(${5 - y * 10}deg)`;
        const r = win.getBoundingClientRect();
        shine.style.setProperty("--sx", `${e.clientX - r.left}px`);
        shine.style.setProperty("--sy", `${e.clientY - r.top}px`);
      });
      hero.addEventListener("pointerleave", () => (win.style.transform = ""));
    }
  }

  /* =========================================================
     Typed loader names (home)
     ========================================================= */
  const typedEl = $("#typed");
  if (typedEl && !reduceMotion) {
    const words = ["Fabric", "Forge", "NeoForge", "Quilt", "Vanilla"];
    let wi = 0, ci = words[0].length, deleting = true;
    (function typeLoop() {
      const w = words[wi];
      typedEl.textContent = w.slice(0, ci);
      let delay = deleting ? 55 : 95;
      if (deleting) { if (--ci < 0) { deleting = false; wi = (wi + 1) % words.length; ci = 0; delay = 250; } }
      else if (++ci > words[wi].length) { deleting = true; ci = words[wi].length; delay = 1800; }
      setTimeout(typeLoop, delay);
    })();
  }

  /* =========================================================
     OS detection + download CTAs
     ========================================================= */
  const ua = navigator.userAgent;
  const os = /Windows/i.test(ua) ? "win" : /Linux|X11/i.test(ua) && !/Android/i.test(ua) ? "linux" : null;
  const DL = {
    win: `https://github.com/${REPO}/releases/latest/download/sunset-launcher-windows-x64.exe`,
    linux: `https://github.com/${REPO}/releases/latest/download/sunset-launcher-linux-x64`,
  };
  function updateDownloadCTA() {
    const txt = $("#heroDownloadText");
    if (txt && os) txt.textContent = `${t("dl.for")} ${os === "win" ? "Windows" : "Linux"}`;
  }
  if (os === "win") $("#cardWin")?.classList.add("recommended");
  if (os === "linux") $("#cardLinux")?.classList.add("recommended");
  if (os) {
    const cards = $(".os-cards"), rec = $(".os-card.recommended");
    if (cards && rec) cards.prepend(rec);
  }
  // hero button: direct download on Win/Linux, otherwise go to the download page
  const heroBtn = $("#heroDownload");
  if (heroBtn && os) heroBtn.href = DL[os];

  /* =========================================================
     GitHub release data
     ========================================================= */
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const fmtSize = (b) => (b > 1048576 ? (b / 1048576).toFixed(1) + " MB" : Math.round(b / 1024) + " KB");
  function md(src) {
    const inline = (s) => esc(s)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
      .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    let out = "", inList = false;
    for (const raw of src.split(/\r?\n/)) {
      const line = raw.trim();
      const li = line.match(/^[-*]\s+(.*)/);
      if (li) { if (!inList) { out += "<ul>"; inList = true; } out += `<li>${inline(li[1])}</li>`; continue; }
      if (inList) { out += "</ul>"; inList = false; }
      if (!line) continue;
      const h = line.match(/^(#{1,6})\s+(.*)/);
      out += h ? (h[1].length <= 2 ? `<h3>${inline(h[2])}</h3>` : `<h4>${inline(h[2])}</h4>`) : `<p>${inline(line)}</p>`;
    }
    return out + (inList ? "</ul>" : "");
  }

  fetch(`https://api.github.com/repos/${REPO}/releases/latest`)
    .then((r) => (r.ok ? r.json() : Promise.reject()))
    .then((d) => {
      if (!d?.tag_name) throw 0;
      const v = d.tag_name.startsWith("v") ? d.tag_name : `v${d.tag_name}`;
      $$(".version").forEach((el) => (el.textContent = v));
      const date = $("#relDate");
      if (date && d.published_at) date.textContent = "· " + new Date(d.published_at).toLocaleDateString(lang === "en" ? "en-US" : "ru-RU", { day: "numeric", month: "long", year: "numeric" });
      (d.assets || []).forEach((a) => $$(`[data-asset="${a.name}"]`).forEach((el) => (el.textContent = "· " + fmtSize(a.size))));
      const cl = $("#changelog");
      if (cl) {
        cl.innerHTML = `<h3>${esc(d.name || v)}</h3>` + (md(d.body || "") || "") +
          (d.assets?.length ? `<div class="assets">${d.assets.map((a) =>
            `<div class="asset"><a href="${esc(a.browser_download_url)}">${esc(a.name)}</a><span>${fmtSize(a.size)} · ⬇ ${a.download_count}</span></div>`).join("")}</div>` : "");
      }
    })
    .catch(() => {
      const cl = $("#changelog");
      if (cl) cl.innerHTML = `<p class="muted" data-i18n="dp.noNotes">${t("dp.noNotes")}</p>`;
    });

  /* =========================================================
     Download page: segmented OS tabs + copy buttons
     ========================================================= */
  const seg = $(".seg");
  function moveSeg() {
    if (!seg) return;
    const a = $(".seg-btn.active", seg), i = $(".seg-ind", seg);
    i.style.width = a.offsetWidth + "px";
    i.style.transform = `translateX(${a.offsetLeft}px)`;
  }
  if (seg) {
    const select = (osName) => {
      $$(".seg-btn", seg).forEach((b) => b.classList.toggle("active", b.dataset.os === osName));
      $$(".os-panel").forEach((p) => p.classList.toggle("active", p.dataset.panel === osName));
      moveSeg();
    };
    $$(".seg-btn", seg).forEach((b) => b.addEventListener("click", () => select(b.dataset.os)));
    if (os === "win") select("windows");
    addEventListener("resize", moveSeg);
    document.fonts?.ready.then(moveSeg);
  }

  const toastEl = $("#toast");
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 1800);
  }
  $$(".copy").forEach((btn) => btn.addEventListener("click", async () => {
    const pre = $("pre", btn.closest(".terminal")).cloneNode(true);
    $$(".c", pre).forEach((c) => c.remove());
    const text = pre.textContent.split("\n").map((l) => l.trim()).filter(Boolean).join("\n");
    try { await navigator.clipboard.writeText(text); } catch { /* ignore */ }
    btn.classList.add("done");
    btn.textContent = t("dl.copied");
    toast("📋 " + t("dl.copied"));
    setTimeout(() => { btn.classList.remove("done"); btn.textContent = t("dl.copy"); }, 1600);
  }));

  /* =========================================================
     Screenshots page: lightbox
     ========================================================= */
  const lb = $("#lightbox");
  if (lb) {
    const shots = $$(".shot");
    const img = $("#lbImg"), cap = $("#lbCap"), count = $("#lbCount");
    let idx = 0;
    const show = (i) => {
      idx = (i + shots.length) % shots.length;
      const s = shots[idx];
      img.style.opacity = 0;
      setTimeout(() => {
        img.onload = () => (img.style.opacity = 1);
        img.src = s.dataset.src;
        if (img.complete) img.style.opacity = 1;
        cap.textContent = $("figcaption b", s).textContent + " — " + $("figcaption span", s).textContent;
        count.textContent = `${idx + 1} / ${shots.length}`;
      }, 150);
    };
    const open = (i) => { show(i); lb.classList.add("open"); lb.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden"; };
    const close = () => { lb.classList.remove("open"); lb.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; };
    shots.forEach((s, i) => s.addEventListener("click", () => open(i)));
    $(".lb-close", lb).addEventListener("click", close);
    $(".lb-prev", lb).addEventListener("click", (e) => { e.stopPropagation(); show(idx - 1); });
    $(".lb-next", lb).addEventListener("click", (e) => { e.stopPropagation(); show(idx + 1); });
    lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
    addEventListener("keydown", (e) => {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
    });
    let sx = null;
    lb.addEventListener("touchstart", (e) => (sx = e.touches[0].clientX), { passive: true });
    lb.addEventListener("touchend", (e) => {
      if (sx === null) return;
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
      sx = null;
    });
  }

  /* =========================================================
     FAQ: search + smooth accordion
     ========================================================= */
  const search = $("#faqSearch");
  if (search) {
    const items = $$("#faqList details"), empty = $("#faqEmpty");
    search.addEventListener("input", () => {
      const q = search.value.trim().toLowerCase();
      let shown = 0;
      items.forEach((d) => {
        const hit = !q || d.textContent.toLowerCase().includes(q);
        d.hidden = !hit;
        if (hit) shown++;
        d.open = !!q && hit && shown <= 3;
      });
      empty.hidden = shown > 0;
    });
  }
  // only one FAQ item open at a time
  $$(".faq details").forEach((d) => d.addEventListener("toggle", () => {
    if (d.open && !search?.value) $$(".faq details").forEach((o) => o !== d && (o.open = false));
  }));

  /* =========================================================
     Floating pixel particles (embers)
     ========================================================= */
  const cv = $("#particles"), ctx = cv.getContext("2d");
  let W, H, parts = [];
  const colors = ["255,179,71", "255,120,51", "232,80,106", "160,120,220"];
  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = cv.width = innerWidth * dpr;
    H = cv.height = innerHeight * dpr;
    cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
    const n = Math.min(46, Math.floor(innerWidth / 32));
    parts = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      s: (2 + Math.random() * 5) * dpr,
      v: (0.15 + Math.random() * 0.45) * dpr,
      w: Math.random() * Math.PI * 2,
      a: 0.12 + Math.random() * 0.4,
      c: colors[Math.floor(Math.random() * colors.length)],
    }));
  }
  function tick(time) {
    ctx.clearRect(0, 0, W, H);
    for (const p of parts) {
      p.y -= p.v;
      const x = p.x + Math.sin(time / 1800 + p.w) * 12;
      if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
      ctx.fillStyle = `rgba(${p.c},${p.a * (0.7 + 0.3 * Math.sin(time / 700 + p.w))})`;
      ctx.fillRect(x, p.y, p.s, p.s);
    }
    requestAnimationFrame(tick);
  }
  addEventListener("resize", resize);
  resize();
  if (!reduceMotion) requestAnimationFrame(tick);

  applyLang();
})();
