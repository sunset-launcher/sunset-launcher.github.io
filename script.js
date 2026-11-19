(() => {
  "use strict";
  const REPO = "sunset-launcher/sunset-launcher";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(pointer: fine)").matches;
  const page = document.body.dataset.page || "home";

  /* =========================================================
     Themes (matching launcher presets)
     ========================================================= */
  const THEMES = {
    sunset: {
      label: "Sunset", swatch: "#ff7833", themeColor: "#120e18",
      particles: ["255,179,71", "255,120,51", "232,80,106", "160,120,220"],
    },
    emerald: {
      label: "Emerald", swatch: "#1bd96a", themeColor: "#101514",
      particles: ["134,239,172", "27,217,106", "16,185,129", "110,231,183"],
    },
    cyan: {
      label: "Obsidian Cyan", swatch: "#22d3ee", themeColor: "#0d131a",
      particles: ["165,243,252", "34,211,238", "56,189,248", "14,165,233"],
    },
    amethyst: {
      label: "Amethyst", swatch: "#a855f7", themeColor: "#13101c",
      particles: ["233,213,255", "192,132,252", "168,85,247", "139,92,246"],
    },
    crimson: {
      label: "Crimson", swatch: "#ef4444", themeColor: "#161012",
      particles: ["254,202,202", "239,68,68", "251,146,60", "248,113,113"],
    },
    midnight: {
      label: "Midnight", swatch: "#38bdf8", themeColor: "#0b101e",
      particles: ["186,230,253", "56,189,248", "129,140,248", "99,102,241"],
    },
  };
  let currentTheme = (() => {
    try {
      const saved = localStorage.getItem("theme");
      return saved && THEMES[saved] ? saved : "sunset";
    } catch { return "sunset"; }
  })();

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
    <div class="toast" id="toast" role="status" aria-live="polite"></div>
    <a class="skip-link" href="#main" data-i18n="a11y.skip">Перейти к содержимому</a>
    <button class="to-top" id="toTop" type="button" aria-label="Back to top"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg></button>
    <div class="palette" id="palette" aria-hidden="true">
      <div class="palette-box" role="dialog" aria-modal="true" aria-label="Command palette">
        <div class="palette-input">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>
          <input id="paletteInput" type="text" autocomplete="off" spellcheck="false" data-i18n-ph="pal.ph" placeholder="Куда перейти?" />
          <kbd>Esc</kbd>
        </div>
        <ul class="palette-list" id="paletteList" role="listbox"></ul>
        <div class="palette-foot"><span><kbd>↑</kbd><kbd>↓</kbd> <span data-i18n="pal.nav">выбор</span></span><span><kbd>Enter</kbd> <span data-i18n="pal.open">открыть</span></span></div>
      </div>
    </div>`);
  $(".page")?.setAttribute("id", "main");

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
          <div class="nav-mobile-actions">
            <button class="btn btn-ghost btn-sm" id="paletteBtnMobile" type="button">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>
              <span data-i18n="nav.search">Поиск</span>
            </button>
            <a class="btn btn-ghost btn-sm" href="https://github.com/${REPO}" target="_blank" rel="noopener">${GH_ICON}<span>GitHub</span><em class="gh-stars" hidden></em></a>
          </div>
        </nav>
        <div class="nav-actions">
          <button class="kbd-btn" id="paletteBtn" type="button" aria-label="Search (Ctrl+K)"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><kbd>Ctrl K</kbd></button>
          <div class="theme-wrap" id="themeWrap">
            <button class="theme-btn" id="themeBtn" type="button" aria-label="Theme" aria-haspopup="menu" aria-expanded="false"><span class="theme-dot"></span></button>
            <div class="theme-menu" id="themeMenu" role="menu">
              ${Object.entries(THEMES).map(([k, th]) => `<button class="theme-opt" type="button" role="menuitemradio" data-set-theme="${k}" aria-checked="false"><span class="swatch" style="--sw:${th.swatch}"></span><span>${th.label}</span></button>`).join("")}
            </div>
          </div>
          <button class="lang-btn" id="langBtn" type="button" aria-label="Switch language">EN</button>
          <a class="btn btn-ghost btn-sm gh" href="https://github.com/${REPO}" target="_blank" rel="noopener">${GH_ICON}<span>GitHub</span><em class="gh-stars" id="ghStars" hidden></em></a>
          <button class="burger" id="burger" type="button" aria-label="Menu" aria-expanded="false" aria-controls="navLinks"><span></span><span></span><span></span></button>
        </div>
      </div>
    </header>
    <div class="nav-backdrop" id="navBackdrop" aria-hidden="true"></div>`;

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
          <span><span data-i18n="ft.by">Сделано</span> <a href="https://github.com/sunset-launcher" target="_blank" rel="noopener">svarka</a> &amp; Antigravity · MIT License</span>
          <span data-i18n="ft.legal">Не является официальным продуктом Minecraft. Не связано с Mojang или Microsoft.</span>
        </div>
      </div>
    </footer>`;

  /* =========================================================
     i18n — Russian lives in the HTML, English here
     ========================================================= */
  const EN = {
    "title.home": "Sunset Launcher — Fast Native Minecraft Launcher in Rust",
    "title.features": "Features — Sunset Launcher",
    "title.screenshots": "Screenshots — Sunset Launcher",
    "title.download": "Download — Sunset Launcher",
    "title.faq": "FAQ — Sunset Launcher",
    "title.404": "404 — Sunset Launcher",
    "nav.home": "Home", "nav.features": "Features", "nav.screens": "Screenshots", "nav.download": "Download", "nav.faq": "FAQ", "nav.search": "Search",
    "a11y.skip": "Skip to content", "pal.ph": "Where to go?", "pal.nav": "select", "pal.open": "open", "pal.empty": "Nothing found",
    "pal.pages": "Pages", "pal.actions": "Actions", "pal.themes": "Themes", "pal.themeSet": "Theme:",
    "pal.dlWin": "Download for Windows", "pal.dlLinux": "Download for Linux",
    "pal.gh": "Open GitHub repository", "pal.issue": "Report a bug", "pal.lang": "Switch language to Russian", "pal.top": "Scroll to top",
    "stats.downloads": "downloads", "stats.stars": "GitHub stars",
    "how.eyebrow": "Getting started", "how.title": "From download to playing — 3 steps",
    "how.s1t": "Download", "how.s1d": "One file for Windows or Linux. No installers and no extra dependencies.",
    "how.s2t": "Create an instance", "how.s2d": "Pick a version and a loader, or install a Modrinth modpack in one click.",
    "how.s3t": "Play", "how.s3d": "Sign in with Microsoft, Ely.by or offline — and hit Play.",
    "nf.lead": "This chunk hasn't been generated yet. Looks like the page got lost somewhere in the Nether.", "nf.home": "Back home",
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
    "fp.custom": "Personalization", "fp.customTitle": "Themes and 9 UI languages", "fp.customSub": "Click a theme to preview it right here on the site.",
    "fp.themes": "Launcher themes", "fp.themesDesc": "The launcher includes 10 presets and a fully customizable color palette.",
    "fp.langs": "Interface languages", "fp.langsDesc": "Translated UI, command palette and language-aware Discord Rich Presence.",
    "fp.more": "And more", "fp.moreTitle": "Little things that matter",
    "fp.ctaTitle": "Ready to try it?",
    "ld.eyebrow": "Loaders", "ld.title": "Any loader — in a couple of clicks",
    "ld.sub": "Official Mojang, Fabric/Quilt Meta and Forge/NeoForge Maven APIs, including installer processors.",
    "ld.v": "Pure Minecraft", "ld.f": "Light and fast", "ld.q": "Fabric fork", "ld.fo": "Modding classic", "ld.n": "Next generation",
    "cmp.eyebrow": "Why Sunset", "cmp.title": "Native vs Electron", "cmp.others": "Typical launcher",
    "cmp.r1": "Technology", "cmp.r2": "Telemetry", "cmp.r3": "Single binary", "cmp.r4": "Ely.by out of the box", "cmp.r5": "Open source",
    "cmp.none": "None", "cmp.often": "Often", "cmp.varies": "Varies",
    "dl.title": "Ready to play?", "dl.sub": "Download Sunset Launcher for your system. It's free and always will be.",
    "dl.src": "Source code", "dl.ver": "Latest version:", "dl.all": "All releases", "dl.copy": "Copy", "dl.copied": "Copied!", "dl.for": "Download for",
    "dl.started": "Download started…",
    "cta.screens": "View screenshots",
    "sp.title1": "Take a look", "sp.title2": "inside", "sp.lead": "Click a screenshot to open it fullscreen. Use ← → to browse.",
    "scr.fAll": "All", "scr.fUi": "Interface", "scr.fMods": "Mods", "scr.fSys": "System",
    "scr.t1": "Library", "scr.t2": "Modrinth", "scr.t3": "Mods", "scr.t4": "Accounts", "scr.t5": "Settings", "scr.t6": "Console",
    "scr.d1": "All instances and quick launch", "scr.d2": "Mods and modpacks catalog", "scr.d3": "Instance content",
    "scr.d4": "Microsoft, Ely.by, Offline", "scr.d5": "Themes, Java, language", "scr.d6": "Live game log",
    "dp.title1": "Download", "dp.rec": "Recommended", "dp.get": "Download", "dp.install": "Install", "dp.howto": "How to install",
    "dp.l1": "Download the sunset-launcher-linux-x64 file.", "dp.l2": "Make it executable and run it:",
    "dp.l3": "On first launch the launcher adds its icon and an application menu entry automatically.",
    "dp.verifyLinux": "Verify SHA-256 (optional)",
    "dp.w1": "Download sunset-launcher-windows-x64.exe.", "dp.w2": "Run the .exe — a Start Menu shortcut is created automatically.",
    "dp.w3": "If SmartScreen appears: \"More info\" → \"Run anyway\".", "dp.verify": "PowerShell — verify SHA-256",
    "dp.s1": "Install Rust via rustup.", "dp.s2": "Clone the repository and build a release:",
    "dp.req": "System requirements", "dp.r1": "OS", "dp.r2": "Memory", "dp.r2v": "4 GB+ (8 GB for modpacks)",
    "dp.r3v": "Auto-detect / Adoptium", "dp.r4": "Internet", "dp.r4v": "For the first version download",
    "dp.changes": "What's new", "dp.loading": "Loading release notes from GitHub…", "dp.noNotes": "Couldn't load release notes. See them on GitHub.",
    "dp.history": "Previous releases",
    "dp.faqTitle": "Questions about install or SmartScreen?", "dp.faqDesc": "Answers on security, Java, game folders and modpacks are in the FAQ.", "dp.faqBtn": "Open FAQ",
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
  const RU = {
    ["title." + page]: document.title,
    "dl.copied": "Скопировано!", "dl.for": "Скачать для", "dl.started": "Загрузка началась…", "nav.search": "Поиск",
    "dp.noNotes": "Не удалось загрузить заметки. Смотрите их на GitHub.", "dp.history": "Предыдущие релизы",
    "stats.dl": "потоков скачивания", "stats.rust": "чистый Rust",
    "pal.empty": "Ничего не найдено", "pal.pages": "Страницы", "pal.actions": "Действия", "pal.themes": "Темы", "pal.themeSet": "Тема:",
    "pal.dlWin": "Скачать для Windows", "pal.dlLinux": "Скачать для Linux", "pal.gh": "Открыть репозиторий на GitHub",
    "pal.issue": "Сообщить о баге", "pal.lang": "Switch language to English", "pal.top": "Наверх",
    "scr.t1": "Библиотека", "scr.t2": "Modrinth", "scr.t3": "Моды", "scr.t4": "Аккаунты", "scr.t5": "Настройки", "scr.t6": "Консоль",
    "scr.d1": "Все сборки и быстрый запуск", "scr.d2": "Каталог модов и модпаков", "scr.d3": "Контент сборки",
    "scr.d4": "Microsoft, Ely.by, Offline", "scr.d5": "Темы, Java, язык", "scr.d6": "Живой лог игры",
  };
  $$("[data-i18n]").forEach((el) => { if (!RU[el.dataset.i18n]) RU[el.dataset.i18n] = el.textContent.trim(); });
  $$("[data-i18n-ph]").forEach((el) => (RU[el.dataset.i18nPh] = el.placeholder));

  let lang = (() => {
    try {
      const saved = localStorage.getItem("lang");
      if (saved === "ru" || saved === "en") return saved;
    } catch { /* ignore */ }
    return /^(ru|uk|be|kk)/i.test(navigator.language || "ru") ? "ru" : "en";
  })();
  const t = (k) => (lang === "en" ? EN[k] : RU[k]) ?? RU[k] ?? EN[k] ?? k;

  let latestPublishedAt = null;
  function formatRelDate() {
    const dateEl = $("#relDate");
    if (!dateEl || !latestPublishedAt) return;
    dateEl.textContent = "· " + new Date(latestPublishedAt).toLocaleDateString(
      lang === "en" ? "en-US" : "ru-RU",
      { day: "numeric", month: "long", year: "numeric" },
    );
  }

  let refreshFaqAfterLang = () => {};
  function applyLang() {
    document.documentElement.lang = lang;
    const titleKey = "title." + page;
    if (EN[titleKey] || RU[titleKey]) document.title = t(titleKey);
    $$("[data-i18n]").forEach((el) => (el.textContent = t(el.dataset.i18n)));
    $$("[data-i18n-ph]").forEach((el) => (el.placeholder = t(el.dataset.i18nPh)));
    $("#langBtn").textContent = lang === "ru" ? "EN" : "RU";
    updateDownloadCTA();
    formatRelDate();
    refreshFaqAfterLang();
    requestAnimationFrame(() => { moveInd(); moveSeg(); });
  }
  $("#langBtn").addEventListener("click", () => {
    lang = lang === "ru" ? "en" : "ru";
    try { localStorage.setItem("lang", lang); } catch { /* ignore */ }
    if (!reduceMotion) document.body.animate([{ opacity: 1 }, { opacity: .4 }, { opacity: 1 }], { duration: 350 });
    applyLang();
  });

  /* =========================================================
     Theme switching
     ========================================================= */
  const themeBtn = $("#themeBtn"), themeMenu = $("#themeMenu");
  function syncThemeUI() {
    const th = THEMES[currentTheme] || THEMES.sunset;
    if (currentTheme === "sunset") delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = currentTheme;
    $('meta[name="theme-color"]')?.setAttribute("content", th.themeColor);
    $$("[data-set-theme]").forEach((el) => {
      const on = el.dataset.setTheme === currentTheme;
      el.classList.toggle("active", on);
      if (el.hasAttribute("aria-checked")) el.setAttribute("aria-checked", String(on));
    });
  }
  function setTheme(name) {
    if (!THEMES[name]) return;
    currentTheme = name;
    try { localStorage.setItem("theme", name); } catch { /* ignore */ }
    syncThemeUI();
    rebuildParticleColors();
    closeThemeMenu();
  }
  function closeThemeMenu() {
    themeMenu.classList.remove("open");
    themeBtn.setAttribute("aria-expanded", "false");
  }
  themeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = themeMenu.classList.toggle("open");
    themeBtn.setAttribute("aria-expanded", String(open));
    if (open) closeMenu();
  });
  $$("[data-set-theme]").forEach((el) => el.addEventListener("click", () => setTheme(el.dataset.setTheme)));
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#themeWrap")) closeThemeMenu();
  });
  syncThemeUI();

  /* =========================================================
     Nav: scroll state, sliding indicator, burger
     ========================================================= */
  const nav = $("#nav"), links = $("#navLinks"), ind = $(".nav-ind"), hov = $(".nav-hover"), progress = $(".progress"), navBackdrop = $("#navBackdrop");
  function place(el, target) {
    if (!target || !links.offsetWidth) { el.style.opacity = 0; return; }
    el.style.opacity = 1;
    el.style.width = target.offsetWidth + "px";
    el.style.transform = `translateX(${target.offsetLeft}px)`;
  }
  function moveInd() { place(ind, $("a.active", links)); }
  $$("a", links).forEach((a) => a.addEventListener("mouseenter", () => place(hov, a)));
  links.addEventListener("mouseleave", () => (hov.style.opacity = 0));
  addEventListener("resize", moveInd);
  if (typeof ResizeObserver !== "undefined") new ResizeObserver(moveInd).observe(links);
  document.fonts?.ready.then(moveInd);

  const burger = $("#burger");
  function setMenu(open) {
    if (open) closeThemeMenu();
    links.classList.toggle("open", open);
    burger.classList.toggle("open", open);
    navBackdrop.classList.toggle("open", open);
    nav.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", String(open));
  }
  function closeMenu() { setMenu(false); }
  burger.addEventListener("click", (e) => {
    e.stopPropagation();
    setMenu(!links.classList.contains("open"));
  });
  $("#paletteBtnMobile")?.addEventListener("click", () => {
    closeMenu();
    openPalette();
  });
  navBackdrop.addEventListener("click", closeMenu);
  $$("a", links).forEach((a) => a.addEventListener("click", closeMenu));
  document.addEventListener("click", (e) => {
    if (links.classList.contains("open") && !e.target.closest("#navLinks, #burger")) closeMenu();
  });
  matchMedia("(min-width: 961px)").addEventListener("change", (e) => {
    if (e.matches) closeMenu();
  });

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
    closeMenu();
    if (reduceMotion) { location.href = dest.href; return; }
    document.body.classList.add("leaving");
    setTimeout(() => (location.href = dest.href), 320);
  });
  addEventListener("pageshow", (e) => {
    if (e.persisted) document.body.classList.remove("leaving");
    closeMenu();
  });

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
  $$(".reveal").forEach((el) => {
    const sibs = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
    el.style.transitionDelay = `${Math.min(sibs.indexOf(el), 6) * 80}ms`;
    io.observe(el);
  });
  function countUp(el) {
    const end = +el.dataset.count, suffix = el.dataset.suffix || "";
    if (reduceMotion) { el.textContent = end + suffix; return; }
    const dur = 1400, start = performance.now();
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
  let glowRaf = null;
  const glow = $(".cursor-glow");
  let gx = -999, gy = -999, cx = -999, cy = -999;
  function stepGlow() {
    if (document.hidden) { glowRaf = null; return; }
    cx += (gx - cx) * 0.12; cy += (gy - cy) * 0.12;
    glow.style.left = cx + "px"; glow.style.top = cy + "px";
    glowRaf = requestAnimationFrame(stepGlow);
  }
  if (finePointer && !reduceMotion) {
    addEventListener("pointermove", (e) => {
      if (cx < -500) { cx = e.clientX; cy = e.clientY; }
      gx = e.clientX; gy = e.clientY;
    });
    glowRaf = requestAnimationFrame(stepGlow);

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
     OS detection + download CTAs + toast
     ========================================================= */
  const toastEl = $("#toast");
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 1900);
  }

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
  const heroBtn = $("#heroDownload");
  if (heroBtn && os) {
    heroBtn.href = DL[os];
    heroBtn.dataset.dl = "1";
  }
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-dl]")) toast("⬇️ " + t("dl.started"));
  });

  /* =========================================================
     GitHub release data (cached + fallback)
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

  const CACHE_KEY = "gh-cache-v2", CACHE_TTL = 15 * 60 * 1000;
  async function loadGitHub() {
    try {
      const c = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
      if (c && Date.now() - c.at < CACHE_TTL) return c.data;
    } catch { /* ignore */ }
    const [repo, releases] = await Promise.all([
      fetch(`https://api.github.com/repos/${REPO}`).then((r) => (r.ok ? r.json() : null)),
      fetch(`https://api.github.com/repos/${REPO}/releases?per_page=100`).then((r) => (r.ok ? r.json() : null)),
    ]);
    if (!repo && !releases) throw new Error("github unavailable");
    const list = Array.isArray(releases) ? releases.filter((r) => !r.draft) : [];
    const latest = list.find((r) => !r.prerelease) || list[0] || null;
    const downloads = list.reduce((sum, r) => sum + (r.assets || [])
      .filter((a) => !a.name.endsWith(".sha256"))
      .reduce((s, a) => s + a.download_count, 0), 0);
    const history = list
      .filter((r) => latest && r.id !== latest.id)
      .slice(0, 5)
      .map((r) => ({
        tag: r.tag_name,
        name: r.name || r.tag_name,
        date: r.published_at,
        body: r.body || "",
        url: r.html_url,
        downloads: (r.assets || []).filter((a) => !a.name.endsWith(".sha256")).reduce((s, a) => s + a.download_count, 0),
      }));
    const data = { stars: repo?.stargazers_count ?? null, downloads: list.length ? downloads : null, latest, history };
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data })); } catch { /* quota */ }
    return data;
  }

  const fmtNum = (n) => (n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "") + "k" : String(n));
  function animateTo(el, end, suffix = "") {
    if (reduceMotion) { el.textContent = fmtNum(end) + suffix; return; }
    const start = performance.now(), dur = 1400;
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = fmtNum(Math.round(end * (1 - Math.pow(1 - p, 4)))) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  function setLiveStat(key, val, fallbackNum, fallbackSuffix, fallbackLabelKey) {
    $$(`[data-live="${key}"]`).forEach((el) => {
      const label = el.nextElementSibling;
      const run = () => {
        if (val != null) animateTo(el, val);
        else {
          animateTo(el, fallbackNum, fallbackSuffix);
          if (label && label.dataset.i18n) {
            label.dataset.i18n = fallbackLabelKey;
            label.textContent = t(fallbackLabelKey);
          }
        }
      };
      const host = el.closest(".reveal");
      if (!host || host.classList.contains("in")) run();
      else new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { run(); o.disconnect(); } }).observe(host);
    });
  }

  loadGitHub()
    .then(({ stars, downloads, latest: d, history }) => {
      if (stars != null) {
        $$(".gh-stars").forEach((s) => { s.textContent = "★ " + fmtNum(stars); s.hidden = false; });
      }
      setLiveStat("downloads", downloads, 64, "", "stats.dl");
      setLiveStat("stars", stars, 100, "%", "stats.rust");

      if (!d?.tag_name) throw 0;
      const v = d.tag_name.startsWith("v") ? d.tag_name : `v${d.tag_name}`;
      $$(".version").forEach((el) => (el.textContent = v));
      if (d.published_at) {
        latestPublishedAt = d.published_at;
        formatRelDate();
      }
      (d.assets || []).forEach((a) => $$(`[data-asset="${a.name}"]`).forEach((el) => (el.textContent = "· " + fmtSize(a.size))));
      const cl = $("#changelog");
      if (cl) {
        cl.innerHTML = `<h3>${esc(d.name || v)}</h3>` + (md(d.body || "") || "") +
          (d.assets?.length ? `<div class="assets">${d.assets.map((a) =>
            `<div class="asset"><a href="${esc(a.browser_download_url)}">${esc(a.name)}</a><span>${fmtSize(a.size)} · ⬇ ${a.download_count}</span></div>`).join("")}</div>` : "");
      }
      const rh = $("#relHistory");
      if (rh && history?.length) {
        rh.hidden = false;
        rh.innerHTML = `<div class="rel-history-title" data-i18n="dp.history">${esc(t("dp.history"))}</div>` +
          history.map((r) => `
            <details class="rel-old">
              <summary><span>${esc(r.name)}</span><span>${r.date ? new Date(r.date).toISOString().slice(0, 10) : ""} · ⬇ ${r.downloads}</span></summary>
              <div class="rel-old-body">${md(r.body) || ""}<p><a href="${esc(r.url)}" target="_blank" rel="noopener">GitHub →</a></p></div>
            </details>`).join("");
      }
    })
    .catch(() => {
      setLiveStat("downloads", null, 64, "", "stats.dl");
      setLiveStat("stars", null, 100, "%", "stats.rust");
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
    if (!a || !i) return;
    i.style.width = a.offsetWidth + "px";
    i.style.transform = `translateX(${a.offsetLeft}px)`;
  }
  if (seg) {
    const select = (osName) => {
      $$(".seg-btn", seg).forEach((b) => {
        const active = b.dataset.os === osName;
        b.classList.toggle("active", active);
        b.setAttribute("aria-selected", String(active));
      });
      $$(".os-panel").forEach((p) => p.classList.toggle("active", p.dataset.panel === osName));
      moveSeg();
    };
    $$(".seg-btn", seg).forEach((b) => b.addEventListener("click", () => select(b.dataset.os)));
    if (os === "win") select("windows");
    addEventListener("resize", moveSeg);
    if (typeof ResizeObserver !== "undefined") new ResizeObserver(moveSeg).observe(seg);
    document.fonts?.ready.then(moveSeg);
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
     Shared Lightbox + Screenshot Filters
     ========================================================= */
  const zoomables = $$(".shot, .zoomable");
  if (zoomables.length) {
    document.body.insertAdjacentHTML("beforeend", `
      <div class="lightbox" id="lightbox" aria-hidden="true" role="dialog" aria-modal="true" aria-label="Screenshot preview">
        <button class="lb-close" type="button" aria-label="Close">✕</button>
        <button class="lb-nav lb-prev" type="button" aria-label="Previous">‹</button>
        <figure class="lb-stage"><img id="lbImg" alt="" /><figcaption id="lbCap"></figcaption></figure>
        <button class="lb-nav lb-next" type="button" aria-label="Next">›</button>
        <div class="lb-count" id="lbCount"></div>
        <div class="lb-dots" id="lbDots"></div>
      </div>`);

    const lb = $("#lightbox"), lbImg = $("#lbImg"), lbCap = $("#lbCap"), lbCount = $("#lbCount"), lbDots = $("#lbDots");
    let activeList = [], idx = 0, opener = null;
    const visibleItems = () => zoomables.filter((el) => !el.hidden);
    const captionOf = (el) => {
      if (el.dataset.capKey) return `${t(el.dataset.capKey)} — ${t(el.dataset.descKey)}`;
      const b = $("figcaption b", el)?.textContent || "";
      const s = $("figcaption span", el)?.textContent || "";
      return s ? `${b} — ${s}` : b;
    };
    const show = (i) => {
      if (!activeList.length) return;
      idx = (i + activeList.length) % activeList.length;
      const el = activeList[idx];
      lbImg.style.opacity = 0;
      setTimeout(() => {
        lbImg.onload = () => (lbImg.style.opacity = 1);
        lbImg.src = el.dataset.src;
        lbImg.alt = $("img", el)?.alt || "";
        if (lbImg.complete) lbImg.style.opacity = 1;
        lbCap.textContent = captionOf(el);
        lbCount.textContent = `${idx + 1} / ${activeList.length}`;
        $$(".lb-dot", lbDots).forEach((d, n) => d.classList.toggle("active", n === idx));
      }, 140);
    };
    const openLb = (el) => {
      opener = el;
      activeList = visibleItems();
      const startIdx = Math.max(0, activeList.indexOf(el));
      lbDots.innerHTML = activeList.map((_, n) => `<button class="lb-dot" type="button" aria-label="Slide ${n + 1}" data-dot="${n}"></button>`).join("");
      show(startIdx);
      lb.classList.add("open");
      lb.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      $(".lb-close", lb).focus();
    };
    const closeLb = () => {
      lb.classList.remove("open");
      lb.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      opener?.focus?.();
    };

    zoomables.forEach((el) => {
      el.addEventListener("click", () => openLb(el));
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLb(el); }
      });
    });
    lbDots.addEventListener("click", (e) => {
      const d = e.target.closest("[data-dot]");
      if (d) show(+d.dataset.dot);
    });
    $(".lb-close", lb).addEventListener("click", closeLb);
    $(".lb-prev", lb).addEventListener("click", (e) => { e.stopPropagation(); show(idx - 1); });
    $(".lb-next", lb).addEventListener("click", (e) => { e.stopPropagation(); show(idx + 1); });
    lb.addEventListener("click", (e) => { if (e.target === lb) closeLb(); });
    addEventListener("keydown", (e) => {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") closeLb();
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

    /* screenshot category filters */
    const filterBtns = $$(".filter-btn");
    if (filterBtns.length) {
      filterBtns.forEach((btn) => btn.addEventListener("click", () => {
        const cat = btn.dataset.filter;
        filterBtns.forEach((b) => b.classList.toggle("active", b === btn));
        $$(".shot").forEach((s) => {
          const match = cat === "all" || s.dataset.cat === cat;
          s.hidden = !match;
          if (match) s.classList.add("in");
        });
      }));
    }
  }

  /* =========================================================
     FAQ: search + highlighting + smooth accordion + hash open
     ========================================================= */
  const search = $("#faqSearch"), faqItems = $$("#faqList details");
  if (faqItems.length) {
    const empty = $("#faqEmpty");
    const storeOriginals = () => faqItems.forEach((d) => {
      const s = $("summary", d), p = $(".ans p", d);
      if (s) d.dataset.qOrig = s.textContent;
      if (p) d.dataset.aOrig = p.textContent;
    });
    const highlight = (str, q) => {
      if (!q) return esc(str);
      const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return esc(str).replace(new RegExp(safe, "gi"), (m) => `<mark>${m}</mark>`);
    };
    const runSearch = () => {
      if (!search) return;
      const q = search.value.trim();
      const ql = q.toLowerCase();
      let shown = 0;
      faqItems.forEach((d) => {
        const qOrig = d.dataset.qOrig || "", aOrig = d.dataset.aOrig || "";
        const hit = !ql || (qOrig + "\n" + aOrig).toLowerCase().includes(ql);
        d.hidden = !hit;
        if (hit) shown++;
        $("summary", d).innerHTML = highlight(qOrig, q);
        $(".ans p", d).innerHTML = highlight(aOrig, q);
        if (ql) d.open = hit && shown <= 3;
        else if (location.hash.slice(1) !== d.id) d.open = false;
      });
      if (empty) empty.hidden = shown > 0;
    };
    refreshFaqAfterLang = () => { storeOriginals(); runSearch(); };
    storeOriginals();
    search?.addEventListener("input", runSearch);

    /* smooth accordion height animation on click */
    const animateDetails = (d, open) => {
      const ans = $(".ans", d);
      if (!ans || reduceMotion) { d.open = open; return; }
      ans.getAnimations().forEach((a) => a.cancel());
      if (open) {
        d.open = true;
        const h = ans.scrollHeight;
        const anim = ans.animate([{ height: "0px", opacity: 0 }, { height: h + "px", opacity: 1 }], { duration: 280, easing: "cubic-bezier(.2,.8,.2,1)" });
        anim.onfinish = () => { ans.style.height = ""; };
      } else {
        const h = ans.offsetHeight;
        const anim = ans.animate([{ height: h + "px", opacity: 1 }, { height: "0px", opacity: 0 }], { duration: 220, easing: "cubic-bezier(.2,.8,.2,1)" });
        anim.onfinish = () => { d.open = false; ans.style.height = ""; };
      }
    };
    faqItems.forEach((d) => {
      const s = $("summary", d);
      s?.addEventListener("click", (e) => {
        e.preventDefault();
        const willOpen = !d.open;
        if (willOpen && !search?.value) {
          faqItems.forEach((o) => { if (o !== d && o.open) animateDetails(o, false); });
        }
        animateDetails(d, willOpen);
      });
    });

    if (location.hash) {
      const target = faqItems.find((d) => d.id === location.hash.slice(1));
      if (target) {
        target.open = true;
        setTimeout(() => target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" }), 120);
      }
    }
  }

  /* =========================================================
     Command palette (Ctrl+K) — same idea as in the launcher
     ========================================================= */
  const pal = $("#palette"), palInput = $("#paletteInput"), palList = $("#paletteList");
  const ICONS = { home: "🏠", features: "✨", screenshots: "🖼️", download: "⬇️", faq: "❓" };
  function paletteItems() {
    const go = (href) => () => {
      const a = document.createElement("a");
      a.href = href; document.body.appendChild(a); a.click(); a.remove();
    };
    const items = PAGES.map(([id, href, key]) => ({
      group: t("pal.pages"), icon: ICONS[id], label: t(key), kw: `${id} ${EN[key]} ${RU[key]}`, run: go(href),
    }));
    items.push(
      { group: t("pal.actions"), icon: "🪟", label: t("pal.dlWin"), kw: "windows exe скачать download", run: () => { toast("⬇️ " + t("dl.started")); location.href = DL.win; } },
      { group: t("pal.actions"), icon: "🐧", label: t("pal.dlLinux"), kw: "linux скачать download", run: () => { toast("⬇️ " + t("dl.started")); location.href = DL.linux; } },
      { group: t("pal.actions"), icon: "🐙", label: t("pal.gh"), kw: "github source код исходники", run: () => open(`https://github.com/${REPO}`, "_blank", "noopener") },
      { group: t("pal.actions"), icon: "🐞", label: t("pal.issue"), kw: "bug issue баг ошибка", run: () => open(`https://github.com/${REPO}/issues`, "_blank", "noopener") },
      { group: t("pal.actions"), icon: "🌐", label: t("pal.lang"), kw: "language язык english русский", run: () => $("#langBtn").click() },
      { group: t("pal.actions"), icon: "⬆️", label: t("pal.top"), kw: "top наверх", run: () => scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }) },
    );
    Object.entries(THEMES).forEach(([k, th]) => items.push({
      group: t("pal.themes"), icon: "🎨", label: `${t("pal.themeSet")} ${th.label}`, kw: `theme тема ${k} ${th.label}`, run: () => setTheme(k),
    }));
    faqItems.forEach((d) => {
      const label = d.dataset.qOrig || $("summary", d).textContent;
      items.push({
        group: "FAQ", icon: "💬", label, kw: `${label} ${d.dataset.aOrig || ""}`,
        run: () => { d.hidden = false; d.open = true; d.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" }); },
      });
    });
    return items;
  }
  let palItems = [], palShown = [], palIdx = 0;
  function renderPalette() {
    const q = palInput.value.trim().toLowerCase();
    palShown = palItems.filter((i) => !q || (i.label + " " + i.kw).toLowerCase().includes(q));
    palIdx = Math.min(palIdx, Math.max(palShown.length - 1, 0));
    if (!palShown.length) { palList.innerHTML = `<li class="palette-empty">${esc(t("pal.empty"))}</li>`; return; }
    let html = "", group = "";
    palShown.forEach((i, n) => {
      if (i.group !== group) { group = i.group; html += `<li class="palette-group">${esc(group)}</li>`; }
      html += `<li class="palette-item${n === palIdx ? " active" : ""}" role="option" data-n="${n}"><span class="pi-ico">${i.icon}</span><span>${esc(i.label)}</span><span class="pi-go">↵</span></li>`;
    });
    palList.innerHTML = html;
    $(".palette-item.active", palList)?.scrollIntoView({ block: "nearest" });
  }
  function openPalette() {
    palItems = paletteItems(); palIdx = 0; palInput.value = "";
    renderPalette();
    pal.classList.add("open"); pal.setAttribute("aria-hidden", "false");
    setTimeout(() => palInput.focus(), 30);
  }
  function closePalette() { pal.classList.remove("open"); pal.setAttribute("aria-hidden", "true"); }
  function runPalette(n) { const i = palShown[n]; if (!i) return; closePalette(); i.run(); }
  $("#paletteBtn").addEventListener("click", openPalette);
  pal.addEventListener("click", (e) => { if (e.target === pal) closePalette(); });
  palInput.addEventListener("input", () => { palIdx = 0; renderPalette(); });
  palList.addEventListener("click", (e) => { const li = e.target.closest(".palette-item"); if (li) runPalette(+li.dataset.n); });
  palList.addEventListener("mousemove", (e) => {
    const li = e.target.closest(".palette-item");
    if (!li || +li.dataset.n === palIdx) return;
    palIdx = +li.dataset.n;
    $$(".palette-item", palList).forEach((el) => el.classList.toggle("active", el === li));
  });
  addEventListener("keydown", (e) => {
    const typing = /^(INPUT|TEXTAREA)$/.test(document.activeElement?.tagName);
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      pal.classList.contains("open") ? closePalette() : openPalette();
      return;
    }
    if (!pal.classList.contains("open")) {
      if (e.key === "Escape") { closeThemeMenu(); closeMenu(); }
      if (e.key === "/" && !typing) {
        const s = $("#faqSearch");
        if (s) { e.preventDefault(); s.focus(); }
        else { e.preventDefault(); openPalette(); }
      }
      return;
    }
    if (e.key === "Escape") closePalette();
    else if (e.key === "ArrowDown") { e.preventDefault(); palIdx = (palIdx + 1) % Math.max(palShown.length, 1); renderPalette(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); palIdx = (palIdx - 1 + palShown.length) % Math.max(palShown.length, 1); renderPalette(); }
    else if (e.key === "Enter") { e.preventDefault(); runPalette(palIdx); }
  });

  /* back to top */
  const toTop = $("#toTop");
  toTop.addEventListener("click", () => scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));
  addEventListener("scroll", () => toTop.classList.toggle("show", scrollY > 700), { passive: true });

  /* =========================================================
     Floating pixel particles (embers) — paused when tab hidden
     ========================================================= */
  const cv = $("#particles"), ctx = cv.getContext("2d");
  let W, H, parts = [], partRaf = null;
  function paletteColors() { return (THEMES[currentTheme] || THEMES.sunset).particles; }
  function rebuildParticleColors() {
    const cols = paletteColors();
    parts.forEach((p, i) => (p.c = cols[i % cols.length]));
  }
  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = cv.width = innerWidth * dpr;
    H = cv.height = innerHeight * dpr;
    cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
    const cols = paletteColors();
    const n = Math.min(46, Math.floor(innerWidth / 32));
    parts = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      s: (2 + Math.random() * 5) * dpr,
      v: (0.15 + Math.random() * 0.45) * dpr,
      w: Math.random() * Math.PI * 2,
      a: 0.12 + Math.random() * 0.4,
      c: cols[Math.floor(Math.random() * cols.length)],
    }));
  }
  function tick(time) {
    if (document.hidden) { partRaf = null; return; }
    ctx.clearRect(0, 0, W, H);
    for (const p of parts) {
      p.y -= p.v;
      const x = p.x + Math.sin(time / 1800 + p.w) * 12;
      if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
      ctx.fillStyle = `rgba(${p.c},${p.a * (0.7 + 0.3 * Math.sin(time / 700 + p.w))})`;
      ctx.fillRect(x, p.y, p.s, p.s);
    }
    partRaf = requestAnimationFrame(tick);
  }
  addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      if (!reduceMotion && !partRaf) partRaf = requestAnimationFrame(tick);
      if (finePointer && !reduceMotion && !glowRaf) glowRaf = requestAnimationFrame(stepGlow);
    }
  });
  resize();
  if (!reduceMotion) partRaf = requestAnimationFrame(tick);

  applyLang();
})();
