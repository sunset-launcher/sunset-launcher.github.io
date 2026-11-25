(() => {
  "use strict";
  const REPO = "sunset-launcher/sunset-launcher";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(pointer: fine)").matches;
  const page = document.body.dataset.page || "home";
  if (!reduceMotion) document.documentElement.classList.add("js");

  /* =========================================================
     Line icon set (Lucide, 16px, stroke 1.5)
     ========================================================= */
  const svg = (paths) =>
    `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;

  const LUCIDE = {
    search: svg('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
    arrowUp: svg('<path d="M12 19V5"/><path d="m5 12 7-7 7 7"/>'),
    menu: svg('<path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/>'),
    close: svg('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'),
    chevronLeft: svg('<path d="m15 18-6-6 6-6"/>'),
    chevronRight: svg('<path d="m9 18 6-6-6-6"/>'),
    home: svg('<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>'),
    layers: svg('<path d="m12 2 9 5-9 5-9-5 9-5z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/>'),
    image: svg('<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="m21 15-5-5L5 20"/>'),
    download: svg('<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M4 20h16"/>'),
    history: svg('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 2"/>'),
    help: svg('<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 4.6 1.3c0 1.7-2.1 2.2-2.1 3.7"/><path d="M12 17.5h.01"/>'),
    pkg: svg('<path d="M16.5 9.4 7.55 4.24"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.3 7 12 12l8.7-5"/><path d="M12 22V12"/>'),
    terminal: svg('<path d="m5 8 5 4-5 4"/><path d="M12 16h7"/>'),
    code: svg('<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>'),
    bug: svg('<circle cx="12" cy="13" r="5"/><path d="M12 8V5"/><path d="M4 13h3"/><path d="M17 13h3"/><path d="m6 7 2.2 2.2"/><path d="M18 7l-2.2 2.2"/>'),
    globe: svg('<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z"/>'),
    tag: svg('<path d="M12 2H4a2 2 0 0 0-2 2v8l10 10 10-10L12 2z"/><path d="M7 7h.01"/>'),
    msg: svg('<path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'),
    check: svg('<path d="M20 6 9 17l-5-5"/>'),
    github: svg('<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>'),
  };

  const GH_ICON = LUCIDE.github;

  const NAV_PAGES = [
    ["home", "index.html", "nav.home", "Главная"],
    ["features", "features.html", "nav.features", "Возможности"],
    ["screenshots", "screenshots.html", "nav.screens", "Скриншоты"],
    ["changelog", "changelog.html", "nav.changelog", "Чейнджлог"],
    ["faq", "faq.html", "nav.faq", "FAQ"],
  ];

  const ALL_PAGES = [
    ["home", "index.html", "nav.home", "Главная"],
    ["features", "features.html", "nav.features", "Возможности"],
    ["screenshots", "screenshots.html", "nav.screens", "Скриншоты"],
    ["download", "download.html", "nav.download", "Скачать"],
    ["changelog", "changelog.html", "nav.changelog", "Чейнджлог"],
    ["faq", "faq.html", "nav.faq", "FAQ"],
  ];

  /* =========================================================
     Shared layout (quiet header, footer & dialogs)
     ========================================================= */
  document.body.insertAdjacentHTML("afterbegin", `
    <div class="scroll-progress" id="scrollProgress" aria-hidden="true"></div>
    <div class="toast" id="toast" role="status" aria-live="polite"></div>
    <a class="skip-link" href="#main" data-i18n="a11y.skip">Перейти к содержимому</a>
    <button class="to-top" id="toTop" type="button" aria-label="Back to top">${LUCIDE.arrowUp}</button>
    <div class="palette" id="palette" aria-hidden="true">
      <div class="palette-box" role="dialog" aria-modal="true" aria-label="Command palette">
        <div class="palette-input">
          ${LUCIDE.search}
          <input id="paletteInput" type="text" autocomplete="off" spellcheck="false" data-i18n-ph="pal.ph" placeholder="Поиск" />
          <kbd>Esc</kbd>
        </div>
        <ul class="palette-list" id="paletteList" role="listbox"></ul>
        <div class="palette-foot">
          <span><kbd>↑</kbd><kbd>↓</kbd> <span data-i18n="pal.nav">выбор</span></span>
          <span><kbd>↵</kbd> <span data-i18n="pal.open">открыть</span></span>
        </div>
      </div>
    </div>`);
  $(".page")?.setAttribute("id", "main");

  $("#app-header").outerHTML = `
    <header class="nav" id="nav">
      <div class="container nav-inner">
        <div class="nav-left">
          <a href="index.html" class="brand">
            <img src="assets/logo.png" alt="" width="24" height="24" />
            <span>Sunset Launcher</span>
          </a>
          <nav class="nav-links" id="navLinks">
            ${NAV_PAGES.map(([id, href, key, ru]) => `<a href="${href}" class="${id === page ? "active" : ""}" data-i18n="${key}">${ru}</a>`).join("")}
            <div class="nav-mobile-actions">
              <a class="btn btn-primary btn-sm" href="download.html" data-i18n="nav.download">Скачать</a>
              <a class="btn btn-ghost btn-sm" href="https://github.com/${REPO}" target="_blank" rel="noopener">${GH_ICON}<span>GitHub</span></a>
            </div>
          </nav>
        </div>
        <div class="nav-actions">
          <button class="kbd-btn" id="paletteBtn" type="button" aria-label="Search (Ctrl+K)">
            ${LUCIDE.search}
            <kbd>Ctrl K</kbd>
          </button>
          <a class="nav-link-quiet" href="https://github.com/${REPO}" target="_blank" rel="noopener">
            ${GH_ICON}
            <span>GitHub</span>
            <span class="gh-stars" id="ghStars" hidden></span>
          </a>
          <button class="lang-btn" id="langBtn" type="button" aria-label="Switch language">EN</button>
          <a href="download.html" class="btn btn-primary btn-sm nav-dl-btn" data-i18n="nav.download">Скачать</a>
          <button class="burger" id="burger" type="button" aria-label="Menu" aria-expanded="false" aria-controls="navLinks">${LUCIDE.menu}</button>
        </div>
      </div>
    </header>
    <div class="nav-backdrop" id="navBackdrop" aria-hidden="true"></div>`;

  $("#app-footer").outerHTML = `
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-col">
            <a href="index.html" class="brand"><img src="assets/logo.png" alt="" width="24" height="24" /><span>Sunset Launcher</span></a>
            <p class="muted" data-i18n="ft.desc">Нативный лаунчер Minecraft на чистом Rust. Без телеметрии, с открытым кодом.</p>
          </div>
          <div class="footer-col">
            <h4 data-i18n="ft.pages">Страницы</h4>
            ${ALL_PAGES.map(([, href, key, ru]) => `<a href="${href}" data-i18n="${key}">${ru}</a>`).join("")}
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
          <span><span data-i18n="ft.by">Авторы:</span> <a href="https://github.com/sunset-launcher" target="_blank" rel="noopener">svarka</a> &amp; Antigravity · MIT License</span>
          <span data-i18n="ft.legal">Не является официальным продуктом Minecraft. Не связано с Mojang или Microsoft.</span>
        </div>
      </div>
    </footer>`;

  /* =========================================================
     i18n — Russian in HTML, English here
     ========================================================= */
  const EN = {
    "title.home": "Sunset Launcher — Native Minecraft Launcher in Rust",
    "title.features": "Features — Sunset Launcher",
    "title.screenshots": "Screenshots — Sunset Launcher",
    "title.download": "Download — Sunset Launcher",
    "title.changelog": "Changelog — Sunset Launcher",
    "title.faq": "FAQ — Sunset Launcher",
    "title.404": "404 — Sunset Launcher",
    "nav.home": "Home",
    "nav.features": "Features",
    "nav.screens": "Screenshots",
    "nav.download": "Download",
    "nav.changelog": "Changelog",
    "nav.faq": "FAQ",
    "nav.search": "Search",
    "a11y.skip": "Skip to content",
    "pal.ph": "Search",
    "pal.nav": "select",
    "pal.open": "open",
    "pal.empty": "No results",
    "pal.pages": "Pages",
    "pal.actions": "Actions",
    "pal.cl": "Changelog",
    "pal.cl019": "v0.2.0 — CurseForge, native installers & built-in tunnel",
    "pal.cl018": "v0.1.8 — Dedicated Servers & bore tunnel (CGNAT)",
    "pal.dlWin": "Download for Windows (.exe)",
    "pal.dlLinuxDeb": "Download for Linux (.deb package)",
    "pal.dlLinuxBin": "Download for Linux (.AppImage)",
    "pal.dlMacArm": "Download for macOS (.dmg Apple Silicon)",
    "pal.dlMacIntel": "Download for macOS (.dmg Intel x64)",
    "pal.gh": "Open GitHub repository",
    "pal.issue": "Report a bug",
    "pal.lang": "Switch language to Russian",
    "pal.top": "Scroll to top",
    "hero.pill": "CurseForge, native installers and built-in bore tunnel",
    "hero.title": "Native Minecraft launcher built in Rust",
    "hero.lead": "Isolated instances, Modrinth and CurseForge catalogs, Microsoft and Ely.by accounts, and local dedicated servers in one binary without Electron or telemetry",
    "hero.download": "Download Sunset",
    "hero.more": "Explore features",
    "stats.downloads": "total downloads",
    "stats.stars": "GitHub stars",
    "stats.loaders": "mod loaders",
    "stats.dl": "download threads",
    "stats.lang": "UI languages",
    "stats.rust": "native Rust",
    "how.eyebrow": "Getting started",
    "how.title": "From package to launch in three steps",
    "how.s1t": "Install the package",
    "how.s1d": "Pick the build for your OS: Windows installer, Linux .deb, .rpm or .AppImage, or macOS .dmg.",
    "how.s2t": "Create an instance",
    "how.s2d": "Choose a Minecraft version and loader, or install a Modrinth or CurseForge modpack in one click.",
    "how.s3t": "Launch the game",
    "how.s3d": "Sign in via Microsoft, Ely.by or offline profile — Sunset fetches Java and verifies assets automatically.",
    "nf.title": "Chunk not generated",
    "nf.lead": "The requested page does not exist or moved to another address",
    "nf.home": "Back to home",
    "feat.eyebrow": "Capabilities",
    "feat.title": "Instances, mods, accounts and servers in one window",
    "feat.sub": "From clean vanilla survival to 300-mod packs and local servers over bore",
    "feat.all": "All features",
    "f1.t": "Isolated instances",
    "f1.d": "Create, duplicate and edit instances in readable folders so configs, mods and worlds never collide.",
    "f1.long": "Create, duplicate, edit and delete instances. Each one lives in its own instances/<name> folder — mods, configs and worlds of different versions never get mixed up. Switch instances straight from the sidebar.",
    "f1.c1": "Readable instances/<name> folders",
    "f1.c2": "One-click instance duplication",
    "f1.c3": "Sidebar Quick Switch and favorites",
    "f2.t": "Modrinth, CurseForge & .mrpack",
    "f2.d": "Search and install mods, modpacks, resource packs and shaders with automatic dependency resolution.",
    "f2.long": "Built-in Modrinth and CurseForge catalogs: search and install mods, modpacks, resource packs and shaders without leaving the launcher. Dependencies and loader compatibility are resolved automatically.",
    "f2.c1": ".mrpack import and configurable export",
    "f2.c2": "Shaders and resource packs",
    "f2.c3": "Version and loader filtering",
    "f3.t": "64-thread downloads",
    "f3.d": "Up to 64 concurrent transfers with streaming SHA-1 verification.",
    "f3b.t": "Content management",
    "f3b.long": "Enable and disable individual mods without deleting files. Inspect installed versions, file sizes and catalog sources.",
    "f3b.c1": "Toggle mods without deleting",
    "f3b.c2": "64 concurrent transfers",
    "f3b.c3": "Streaming SHA-1 verification",
    "f4.t": "Accounts & skins",
    "f4.d": "Microsoft OAuth, Ely.by via authlib-injector and offline profiles.",
    "f4.long": "Microsoft sign-in via Device Code, Ely.by accounts via authlib-injector, and offline profiles. Skin previews cache locally and tokens stay in your OS Keyring.",
    "f5.t": "Worlds & backups",
    "f5.d": "Quick Play straight into a save and one-click .zip world archives.",
    "f5b.t": "Dedicated servers & bore",
    "f5b.d": "Local Paper, Fabric and Forge servers published behind CGNAT via bore.pub.",
    "f6.t": "Java & JVM presets",
    "f6.d": "RAM limits, custom flags, G1GC, ZGC and Aikar presets with automatic Adoptium Java provisioning.",
    "f7.t": "Live console",
    "f7.d": "Real-time stdout/stderr stream with crash diagnosis.",
    "f7.long": "Game stdout and stderr in real time with log-level filters. When a crash occurs, Sunset surfaces the cause and copies the report in one click.",
    "f7.c1": "Real-time log filtering",
    "f7.c2": "Automatic crash diagnosis",
    "f7.c3": "One-click crash report copy",
    "f8.t": "Themes, languages & Discord",
    "f8.long": "Nine interface languages, customizable color themes, Ctrl+K command palette and localized Discord Rich Presence.",
    "f8.c3": "9 UI languages",
    "f9.t": "Verified updates",
    "f9.d": "Checks GitHub Releases and verifies SHA-256 digests before updating.",
    "f10.t": "Zero telemetry",
    "f10.d": "No analytics or tracking. Credentials stay in your local OS Keyring.",
    "f11.t": "OS integration",
    "f11.d": "Linux .desktop entry, Windows Start Menu shortcut and single-instance socket lock.",
    "f12.t": "Native Rust + egui",
    "f12.d": "Single compiled binary without Chromium or Electron overhead.",
    "fp.title": "Instances, mods, accounts and servers in one window",
    "fp.lead": "Every tool Sunset Launcher ships with — from modpack export to live crash logs",
    "fp.langsEyebrow": "Localization",
    "fp.langs": "Nine interface languages",
    "fp.langsDesc": "Translated interface, command palette and Discord Rich Presence",
    "fp.more": "System details",
    "fp.moreTitle": "Built for daily modded play",
    "fp.ctaTitle": "Try Sunset Launcher on your machine",
    "ld.eyebrow": "Mod loaders",
    "ld.title": "Five loaders configured from official metadata APIs",
    "ld.sub": "Direct integration with Mojang, Fabric Meta, Quilt Meta and Forge/NeoForge Maven installer processors",
    "ld.v": "Unmodified client",
    "ld.f": "Lightweight mod API",
    "ld.q": "Community fork",
    "ld.fo": "Classic mod ecosystem",
    "ld.n": "Modern Forge fork",
    "cmp.eyebrow": "Architecture",
    "cmp.title": "Compiled Rust instead of an Electron wrapper",
    "cmp.sub": "Sunset renders natively through egui without bundling a browser engine or collecting usage metrics",
    "cmp.colParam": "Property",
    "cmp.others": "Typical launcher",
    "cmp.r1": "UI runtime",
    "cmp.r2": "Telemetry",
    "cmp.r3": "Single native binary",
    "cmp.r4": "Ely.by & bore tunnel",
    "cmp.r5": "Source license",
    "cmp.none": "None",
    "cmp.often": "Included",
    "cmp.varies": "Proprietary / mixed",
    "dl.title": "Download Sunset Launcher",
    "dl.sub": "Free and open-source under the MIT license for Windows, Linux and macOS",
    "dl.src": "Source code",
    "dl.ver": "Latest release:",
    "dl.all": "All releases",
    "dl.copy": "Copy",
    "dl.copied": "Copied",
    "dl.for": "Download for",
    "dl.started": "Download started",
    "cta.screens": "View screenshots",
    "sp.title": "Inside Sunset Launcher",
    "sp.lead": "Select any view to inspect it fullscreen, or use arrow keys to step through",
    "scr.fAll": "All",
    "scr.fUi": "Interface",
    "scr.fMods": "Mods",
    "scr.fSys": "System",
    "scr.t1": "Library",
    "scr.t2": "Modrinth",
    "scr.t3": "Mods",
    "scr.t4": "Accounts",
    "scr.t5": "Settings",
    "scr.t6": "Console",
    "scr.d1": "Instances and quick launch",
    "scr.d2": "Mod and modpack catalog",
    "scr.d3": "Installed instance files",
    "scr.d4": "Microsoft, Ely.by and offline",
    "scr.d5": "Themes, Java and localization",
    "scr.d6": "Real-time stdout/stderr log",
    "dp.title": "Download Sunset Launcher",
    "dp.rec": "Detected OS",
    "dp.get": "Download",
    "dp.install": "Installation",
    "dp.howto": "Install from package or terminal",
    "dl.chooseFmt": "Select package format",
    "dl.debShort": ".deb package",
    "dl.rpmShort": ".rpm package",
    "dl.appImageShort": ".AppImage",
    "dl.dmgShort": ".dmg",
    "dl.anyLinux": "Any distro",
    "dl.winExeLabel": ".exe installer",
    "dl.winSetupLabel": "installer",
    "dl.macAppLabel": ".app bundle",
    "dl.binChip": "bin",
    "dl.tipZip": "Portable .zip archive for Windows",
    "dl.tipDebArm": ".deb package for Linux ARM64",
    "dl.tipBinArm": "Standalone binary for Linux ARM64",
    "dl.tipMacIntel": "macOS .app bundle for Intel (x64)",
    "dl.tipMacBin": "Standalone binary for macOS",
    "dl.allFormats": "All builds, SHA-256 digests and install guide",
    "dp.bit64": "64-bit",
    "dp.archLabel": "Architecture",
    "dp.macSub": "macOS 11+ · Apple Silicon & Intel",
    "dp.binLabel": "binary",
    "dp.winSetupSub": "Inno Setup installer (.exe)",
    "dp.winExeSub": "Standalone .exe",
    "dp.winZipSub": "Portable archive",
    "dp.debSub": "Ubuntu / Debian / Mint",
    "dp.rpmSub": "Fedora / RHEL / openSUSE",
    "dp.appImageSub": "Portable AppImage",
    "dp.binSub": "Any distro · glibc",
    "dp.macDmgSub": "macOS disk image (.dmg)",
    "dp.macAppSub": "macOS .app bundle",
    "dp.macBinSub": "Standalone binary",
    "dp.srcDesc": "sunset-launcher/sunset-launcher · Rust 2021 · MIT License",
    "dp.l1": "Install .deb on Debian/Ubuntu, .rpm on Fedora/RHEL/openSUSE, or run the portable AppImage.",
    "dp.l2": "Run the matching command for your distribution:",
    "dp.termDeb": "Ubuntu / Debian — .deb package",
    "dp.termRpm": "Fedora / RHEL / openSUSE — .rpm package",
    "dp.termAppImage": "Any distro — portable AppImage",
    "dp.termBin": "Any distro — standalone binary",
    "dp.l3": "Installing .deb or .rpm adds Sunset Launcher to your desktop application menu automatically.",
    "dp.verifyLinux": "Verify SHA-256 digest",
    "dp.w1": "Download sunset-launcher-windows-x64-setup.exe or the portable .zip archive.",
    "dp.w2": "Run the installer wizard or extract the .zip into any folder.",
    "dp.w3": "If Windows SmartScreen appears, choose More info → Run anyway.",
    "dp.verify": "PowerShell — verify SHA-256",
    "dp.m1": "Download sunset-launcher-macos-arm64.dmg (Apple Silicon) or sunset-launcher-macos-x64.dmg (Intel).",
    "dp.m2": "Open the .dmg and drag Sunset Launcher.app to /Applications.",
    "dp.m3": "Clear Gatekeeper quarantine before first launch of the unsigned build:",
    "dp.s1": "Install the Rust toolchain via rustup.",
    "dp.s2": "Clone the repository and compile a release binary:",
    "dp.req": "System requirements",
    "dp.r1": "Operating system",
    "dp.r2": "Memory",
    "dp.r2v": "4 GB+ (8 GB for modpacks)",
    "dp.r3v": "Auto-detected or Adoptium download",
    "dp.r4": "Network",
    "dp.r4v": "Required for initial asset download",
    "dp.changes": "Latest release notes",
    "dp.loading": "Loading release notes from GitHub…",
    "dp.noNotes": "Could not fetch release notes. View them on GitHub.",
    "dp.history": "Previous releases",
    "dp.fullCl": "Full changelog",
    "dp.v019.h": "Sunset Launcher v0.2.0 — CurseForge, OS installers & built-in tunnel",
    "dp.v019.b1": "CurseForge catalog integration alongside Modrinth: search, loader/version filtering and dependency installation.",
    "dp.v019.b2": "Native OS packages: Windows Inno Setup wizard (-setup.exe), Linux .rpm & .AppImage (x64 & ARM64), and macOS .dmg disk images.",
    "dp.v019.b3": "Launch hooks (wrapper, pre-launch, post-exit), custom environment variables, instance log viewer and configurable .mrpack export.",
    "dp.v019.b4": "Offline Mode, global default instance settings and responsive layout fixes across narrow windows.",
    "cp.title": "Release history",
    "cp.lead": "Every Sunset Launcher build, protocol addition and security fix from the latest release back to v0.1.0",
    "cp.search": "Search",
    "cp.fAll": "All",
    "cp.fNew": "New",
    "cp.fNet": "Servers & network",
    "cp.fImp": "Improvements & security",
    "cp.latest": "Latest release",
    "cp.tagNew": "New",
    "cp.tagNet": "Network",
    "cp.tagSec": "Security",
    "cp.tagImp": "Improved",
    "cp.tagFix": "Fixed",
    "cp.d020": "2026-11-21",
    "cp.v020.t": "Built-in pure-Rust bore client, Windows tunnel & AppImage fixes",
    "cp.v020.i1": "Implemented a built-in pure-Rust bore protocol client (bore.pub:7835) inside the launcher — no external bore binary download required.",
    "cp.v020.i2": "Fixed the Pinggy SSH fallback tunnel (port 443) on Windows: auto-generated Ed25519 key in tools/tunnel_ed25519, quoted known_hosts path and detailed stderr error reporting instead of exit code 255.",
    "cp.v020.i3": "Fixed Linux AppImage desktop entry persistence (using the APPIMAGE path) and set Wayland app_id / StartupWMClass=sunset-launcher.",
    "cp.d019": "2026-11-21",
    "cp.v019.t": "CurseForge catalog, native OS installers, launch hooks & responsive UI",
    "cp.v019.spotBadge": "v0.1.9 highlight · CurseForge + installers",
    "cp.v019.spotTitle": "CurseForge mod discovery and native packages for every platform",
    "cp.v019.spotP1": "The Discover tab now integrates CurseForge alongside Modrinth: search mods, resource packs, shaders and modpacks, filter by instance loader and Minecraft version, install dependencies automatically and see each file's source.",
    "cp.v019.spotP2": "Packaging now covers every desktop OS: Windows Setup wizard (-setup.exe via Inno Setup), Linux .rpm packages and portable .AppImage builds (x64 & ARM64), plus macOS .dmg disk images.",
    "cp.v019.i1": "CurseForge catalog integration in Discover: project search, compatible file selection, dependency installation and source badges.",
    "cp.v019.i2": "New installers and package formats: Windows Setup wizard (Inno Setup), Linux .rpm & .AppImage (x64 & ARM64), and macOS .dmg with .icns icon.",
    "cp.v019.i3": "Launch hooks (wrapper command like gamemoderun/mangohud, pre-launch and post-exit commands), custom environment variables and an instance log viewer.",
    "cp.v019.i4": "Configurable .mrpack export dialog (configs, options, resource packs, shaders, worlds, exclusions), global default instance settings (RAM, Java, JVM, resolution) and Offline Mode.",
    "cp.v019.i5": "Responsive UI improvements for narrow windows and long localized labels: wrapping checkboxes, adaptive Instance Settings cards, Content toolbar/list and instance header.",
    "cp.d018": "2026-11-20",
    "cp.v018.t": "Dedicated Minecraft servers & bore public tunnel for CGNAT IPs",
    "cp.v018.spotBadge": "v0.1.8 highlight · Dedicated servers + bore",
    "cp.v018.spotTitle": "Host a local server behind carrier-grade NAT without VPN tools",
    "cp.v018.spotP1": "Sunset Launcher includes a Dedicated Server manager for Vanilla, Paper, Purpur, Folia, Fabric, Quilt, Forge, NeoForge and Arclight with automatic Java provisioning, live server console, server.properties editor and Modrinth plugin/mod installs.",
    "cp.v018.spotP2": "Two network publishing modes let friends join without Hamachi or Radmin VPN: automatic UPnP port forwarding on public IPs, and TCP tunneling via bore (bore.pub) for private IPs behind CGNAT.",
    "cp.v018.termHead": "Public tunnel for CGNAT / private IP — bore",
    "cp.v018.boreTag": "bore (CGNAT / private IP)",
    "cp.v018.i1": "Dedicated Server manager: creation, RAM/JVM tuning, live stdout/stderr log, stdin commands, graceful shutdown and automatic Java 8/16/17/21 selection.",
    "cp.v018.i2": "Built-in bore client (ekzhang/bore) to expose servers behind private / CGNAT IPs via bore.pub, plus automatic UPnP port mapping with cleanup on exit.",
    "cp.v018.i3": "Install server mods and plugins straight from Modrinth matched to your server software (Paper, Purpur, Folia, Fabric, Forge, NeoForge, Arclight) and edit core server.properties options.",
    "cp.v018.i4": "Account tokens stored in the OS Keyring, atomic 0600 JSON writes, SHA-256 verification on self-update and Log4j XML exploit protection.",
    "cp.v018.i5": "Legacy Minecraft compatibility (Forge ≤ 1.12.2 installers, pre-1.7.3 virtual/mapped assets) and Prism Launcher / CurseForge modpack import.",
    "cp.v018.i6": "Batch hash-based mod updates, world datapack management, screenshot thumbnails, active download cancellation, modular UI architecture and Linux ARM64 (.deb) & macOS builds.",
    "cp.v018.i7": "Kept the single-instance Unix domain socket path within the OS sun_path length limit.",
    "cp.d017": "2026-11-19",
    "cp.v017.t": "UI optimization & list virtualization",
    "cp.v017.i1": "Virtualized rendering in the live console and mods list for smooth frame times across thousands of log lines and hundreds of installed mods.",
    "cp.v017.i2": "Auto-hiding idle bottom status bar and compact author credit in the sidebar.",
    "cp.v017.i3": "Fixed layout clipping on compact window sizes.",
    "cp.d016": "2026-11-18",
    "cp.v016.t": "Readable instance folders & unified data directory",
    "cp.v016.i1": "Instances now live in human-readable instances/<name> folders instead of UUIDs so mods, screenshots and configs are easy to locate on disk.",
    "cp.v016.i2": "Unified the main data directory under sunset-launcher while keeping backward compatibility.",
    "cp.d015": "2026-11-18",
    "cp.v015.t": "Sunset Launcher rebrand & default Sunset theme",
    "cp.v015.i1": "Added the Sunset default color theme and updated the launcher icon.",
    "cp.v015.i2": "Renamed to Sunset Launcher under the sunset-launcher GitHub organization with auto-update migration.",
    "cp.d014": "2026-11-18",
    "cp.v014.t": "Windows integration & native file dialogs",
    "cp.v014.i1": "Native OS file dialogs (.mrpack, custom icons, Java path) and embedded Windows PE metadata and icon.",
    "cp.d013": "2026-11-15",
    "cp.v013.t": "9 languages, auto-Java manager, theme presets & Discord RPC",
    "cp.v013.i1": "Full 9-language UI translation, Ctrl+K command palette, theme presets, automatic Adoptium Java downloads, .mrpack export and Discord Rich Presence.",
    "cp.d010": "2026-11-13",
    "cp.v010.t": "Initial public release",
    "cp.v010.i1": "Native launcher written in pure Rust and egui: Vanilla, Fabric, Quilt, Forge and NeoForge support, Modrinth catalog, Microsoft / Ely.by / Offline accounts, and Windows & Linux builds.",
    "cp.empty": "No matching changes found",
    "cp.ctaTitle": "Update to the latest build",
    "cp.ctaSub": "Includes CurseForge discovery, dedicated servers and the pure-Rust bore tunnel",
    "dp.faqTitle": "Questions about installation or SmartScreen?",
    "dp.faqDesc": "Details on code signing, Java provisioning, game folders and modpacks are in the FAQ",
    "dp.faqBtn": "Open FAQ",
    "qp.title": "Frequently asked questions",
    "qp.search": "Search",
    "qp.empty": "No matching questions found",
    "qp.help": "Still have a question?",
    "qp.helpd": "Open an issue on GitHub with your OS and console output",
    "qp.issue": "Open an issue",
    "q1": "Is it free?",
    "a1": "Yes. Sunset Launcher is MIT-licensed and the full source code is available on GitHub.",
    "q2": "Do I need a Minecraft license?",
    "a2": "Microsoft sign-in requires an owned copy of Minecraft. Ely.by accounts and offline mode are also supported.",
    "q3": "Windows shows an Unknown publisher prompt. Is it safe?",
    "a3": "Builds are not Authenticode-signed yet, so SmartScreen warns on first launch. Choose More info → Run anyway. You can verify the SHA-256 digest on GitHub Releases or compile from source.",
    "q4": "Does Sunset collect telemetry?",
    "a4": "No. There is zero analytics or telemetry. Tokens are stored locally in your OS Keyring. Network requests go only to Mojang, Modrinth, CurseForge, loader metadata servers, Adoptium, Microsoft / Ely.by and GitHub Releases.",
    "q5": "Where are game files stored?",
    "a5": "Linux: ~/.local/share/sunset-launcher. Windows: %LOCALAPPDATA%\\sunset-launcher. macOS: ~/Library/Application Support/sunset-launcher. Profiles, versions, libraries, assets and isolated instances/<name> folders live inside.",
    "q6": "Are macOS builds and Linux packages available?",
    "a6": "Yes. Windows (.exe installer and portable .zip), Linux (.deb, .rpm and .AppImage for x64 and ARM64) and macOS (.dmg and .app.zip for Apple Silicon and Intel) are published on the Download page and GitHub Releases.",
    "q7": "How do I install a modpack?",
    "a7": "Open the Discover tab, pick a modpack from Modrinth or CurseForge and click Install — or import a local .mrpack file. Sunset creates the isolated instance and downloads all files.",
    "q8": "Do I need to install Java manually?",
    "a8": "No. Sunset detects existing Java installations and can download the matching Adoptium runtime into its own directory automatically.",
    "q9": "The game crashed. Where do I check the cause?",
    "a9": "Open the Console tab to inspect the crash summary and copy the full report in one click. Adjusting RAM allocation or switching JVM presets in instance settings resolves most modpack crashes.",
    "q10": "How do updates work?",
    "a10": "Sunset checks GitHub Releases, verifies the SHA-256 checksum and offers to apply updates directly from the launcher.",
    "ft.desc": "Native Minecraft launcher written in Rust. Zero telemetry, MIT open source.",
    "ft.pages": "Pages",
    "ft.links": "Links",
    "ft.releases": "Releases",
    "ft.issues": "Report a bug",
    "ft.by": "Built by",
    "ft.legal": "Not an official Minecraft product. Not approved by or associated with Mojang or Microsoft.",
  };

  const RU = {
    ["title." + page]: document.title,
    "dl.copied": "Скопировано",
    "dl.for": "Скачать для",
    "dl.started": "Загрузка началась",
    "nav.search": "Поиск",
    "dp.noNotes": "Не удалось загрузить заметки. Смотрите их на GitHub.",
    "dp.history": "Предыдущие релизы",
    "stats.dl": "потока загрузки",
    "stats.rust": "нативный Rust",
    "pal.empty": "Ничего не найдено",
    "pal.pages": "Страницы",
    "pal.actions": "Действия",
    "pal.cl": "Чейнджлог",
    "pal.cl019": "v0.2.0 — CurseForge, установщики ОС и встроенный туннель",
    "pal.cl018": "v0.1.8 — Выделенные серверы и туннель bore (CGNAT)",
    "pal.dlWin": "Скачать для Windows (.exe)",
    "pal.dlLinuxDeb": "Скачать для Linux (.deb пакет)",
    "pal.dlLinuxBin": "Скачать для Linux (.AppImage)",
    "pal.dlMacArm": "Скачать для macOS (.dmg Apple Silicon)",
    "pal.dlMacIntel": "Скачать для macOS (.dmg Intel x64)",
    "pal.gh": "Открыть репозиторий на GitHub",
    "pal.issue": "Сообщить о баге",
    "pal.lang": "Switch language to English",
    "pal.top": "Наверх",
    "scr.t1": "Библиотека",
    "scr.t2": "Modrinth",
    "scr.t3": "Моды",
    "scr.t4": "Аккаунты",
    "scr.t5": "Настройки",
    "scr.t6": "Консоль",
    "scr.d1": "Все сборки и быстрый запуск",
    "scr.d2": "Каталог модов и модпаков",
    "scr.d3": "Установленные файлы сборки",
    "scr.d4": "Microsoft, Ely.by и офлайн",
    "scr.d5": "Темы, Java и локализация",
    "scr.d6": "Поток stdout/stderr в реальном времени",
  };

  $$("[data-i18n]").forEach((el) => {
    if (!RU[el.dataset.i18n]) RU[el.dataset.i18n] = el.textContent.trim();
  });
  $$("[data-i18n-ph]").forEach((el) => {
    if (!RU[el.dataset.i18nPh]) RU[el.dataset.i18nPh] = el.placeholder;
  });
  $$("[data-i18n-title]").forEach((el) => {
    if (!RU[el.dataset.i18nTitle]) RU[el.dataset.i18nTitle] = el.getAttribute("title") || "";
  });
  $$("[data-i18n-aria]").forEach((el) => {
    if (!RU[el.dataset.i18nAria]) RU[el.dataset.i18nAria] = el.getAttribute("aria-label") || "";
  });

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
    dateEl.textContent = "· " + new Date(latestPublishedAt).toISOString().slice(0, 10);
  }

  let refreshFaqAfterLang = () => {};
  let refreshClAfterLang = () => {};
  let syncPreviewMeta = () => {};
  const pillSyncers = [];
  const syncAllPills = () => requestAnimationFrame(() => pillSyncers.forEach((fn) => fn()));

  function bindSlidePill(container, itemSel, { withHover = false } = {}) {
    if (!container) return () => {};
    const pill = document.createElement("span");
    pill.className = "slide-pill";
    pill.setAttribute("aria-hidden", "true");
    container.prepend(pill);

    let hoverPill = null;
    if (withHover) {
      hoverPill = document.createElement("span");
      hoverPill.className = "slide-pill hover-pill";
      hoverPill.setAttribute("aria-hidden", "true");
      container.prepend(hoverPill);
    }
    container.classList.add("has-pill");

    const place = (el, target) => {
      if (!el) return;
      if (!target || !container.offsetParent || !target.offsetWidth) {
        el.style.opacity = "0";
        return;
      }
      el.style.opacity = "1";
      el.style.width = `${target.offsetWidth}px`;
      el.style.height = `${target.offsetHeight}px`;
      el.style.transform = `translate3d(${target.offsetLeft}px, ${target.offsetTop}px, 0)`;
    };

    const sync = () => place(pill, $(`${itemSel}.active`, container));
    if (hoverPill) {
      container.addEventListener("pointerover", (e) => {
        const item = e.target.closest(itemSel);
        if (item && container.contains(item)) place(hoverPill, item);
      });
      container.addEventListener("pointerleave", () => {
        hoverPill.style.opacity = "0";
      });
    }
    if (typeof ResizeObserver !== "undefined") new ResizeObserver(sync).observe(container);
    pillSyncers.push(sync);
    requestAnimationFrame(sync);
    return sync;
  }

  function applyLang() {
    document.documentElement.lang = lang;
    const titleKey = "title." + page;
    if (EN[titleKey] || RU[titleKey]) document.title = t(titleKey);
    $$("[data-i18n]").forEach((el) => (el.textContent = t(el.dataset.i18n)));
    $$("[data-i18n-ph]").forEach((el) => (el.placeholder = t(el.dataset.i18nPh)));
    $$("[data-i18n-title]").forEach((el) => el.setAttribute("title", t(el.dataset.i18nTitle)));
    $$("[data-i18n-aria]").forEach((el) => el.setAttribute("aria-label", t(el.dataset.i18nAria)));
    $("#langBtn").textContent = lang === "ru" ? "EN" : "RU";
    formatRelDate();
    refreshFaqAfterLang();
    refreshClAfterLang();
    syncPreviewMeta();
    syncAllPills();
  }

  $("#langBtn").addEventListener("click", () => {
    lang = lang === "ru" ? "en" : "ru";
    try { localStorage.setItem("lang", lang); } catch { /* ignore */ }
    const mainEl = $(".page");
    if (mainEl && !reduceMotion && mainEl.animate) {
      mainEl.animate([{ opacity: 0.55, transform: "translateY(3px)" }, { opacity: 1, transform: "translateY(0)" }], {
        duration: 220,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      });
    }
    applyLang();
  });

  /* =========================================================
     Mobile navigation drawer
     ========================================================= */
  const nav = $("#nav"), links = $("#navLinks"), burger = $("#burger"), navBackdrop = $("#navBackdrop");
  function setMenu(open) {
    links.classList.toggle("open", open);
    navBackdrop.classList.toggle("open", open);
    nav.classList.toggle("menu-open", open);
    burger.innerHTML = open ? LUCIDE.close : LUCIDE.menu;
    burger.setAttribute("aria-expanded", String(open));
  }
  const closeMenu = () => setMenu(false);

  burger.addEventListener("click", (e) => {
    e.stopPropagation();
    setMenu(!links.classList.contains("open"));
  });
  navBackdrop.addEventListener("click", closeMenu);
  $$("a", links).forEach((a) => a.addEventListener("click", closeMenu));
  document.addEventListener("click", (e) => {
    if (links.classList.contains("open") && !e.target.closest("#navLinks, #burger")) closeMenu();
  });
  matchMedia("(min-width: 961px)").addEventListener("change", (e) => {
    if (e.matches) closeMenu();
    syncAllPills();
  });
  bindSlidePill(links, "a[data-i18n]", { withHover: true });
  document.fonts?.ready.then(syncAllPills);
  addEventListener("resize", syncAllPills, { passive: true });

  /* =========================================================
     Scroll progress, page transitions, staggered reveals & card sheen
     ========================================================= */
  const scrollProgress = $("#scrollProgress");
  function updateScrollChrome() {
    const y = scrollY;
    nav.classList.toggle("scrolled", y > 12);
    if (scrollProgress) {
      const max = document.documentElement.scrollHeight - innerHeight;
      scrollProgress.style.transform = `scaleX(${max > 0 ? Math.min(Math.max(y / max, 0), 1) : 0})`;
    }
  }
  addEventListener("scroll", updateScrollChrome, { passive: true });
  updateScrollChrome();

  document.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target === "_blank" || a.hasAttribute("download") || a.hasAttribute("data-dl")) return;
    const href = a.getAttribute("href") || "";
    if (!/^[\w-]+\.html(#.*)?$/.test(href)) return;
    const dest = new URL(href, location.href);
    if (dest.pathname === location.pathname) {
      if (!dest.hash) {
        e.preventDefault();
        scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      }
      return;
    }
    e.preventDefault();
    closeMenu();
    if (reduceMotion) {
      location.href = dest.href;
      return;
    }
    document.body.classList.add("leaving");
    setTimeout(() => { location.href = dest.href; }, 160);
  });
  addEventListener("pageshow", () => {
    document.body.classList.remove("leaving");
    closeMenu();
  });

  const REVEAL_SEL = [
    ".stat",
    ".section-head",
    ".section-head-split > .btn",
    ".how-step",
    ".feature",
    ".row",
    ".langs-card",
    ".loader",
    ".compare",
    ".shot",
    ".os-card",
    ".src-strip",
    ".seg",
    ".req",
    ".changelog",
    ".cl-entry",
    ".faq details",
    ".help-card",
    ".cta-card",
    ".footer-col",
  ].join(", ");

  const revealIo = !reduceMotion && typeof IntersectionObserver !== "undefined"
    ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.classList.add("in");
        revealIo.unobserve(el);
        const delay = parseFloat(el.style.getPropertyValue("--stagger")) || 0;
        setTimeout(() => el.style.removeProperty("--stagger"), 520 + delay);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -28px 0px" })
    : null;

  function observeReveals(root = document) {
    if (!revealIo) return;
    const nodes = $$(REVEAL_SEL, root).filter((el) => !el.classList.contains("enter") && !el.closest(".section-head-split")?.isSameNode(el));
    const groups = new Map();
    nodes.forEach((el) => {
      if (el.dataset.revealBound) return;
      el.dataset.revealBound = "1";
      el.classList.add("reveal");
      const p = el.parentElement;
      const idx = groups.get(p) || 0;
      groups.set(p, idx + 1);
      if (idx > 0) el.style.setProperty("--stagger", `${Math.min(idx, 5) * 55}ms`);
      revealIo.observe(el);
    });
  }
  observeReveals();

  if (finePointer && !reduceMotion) {
    document.addEventListener("pointermove", (e) => {
      const card = e.target.closest(".feature, .how-step, .loader, .os-card, .cl-card, .src-strip, .langs-card, .help-card, .cta-card");
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${(e.clientX - r.left).toFixed(1)}px`);
      card.style.setProperty("--my", `${(e.clientY - r.top).toFixed(1)}px`);
    }, { passive: true });
  }

  function bindSmoothDetails(items, bodySel, { exclusive = false, shouldSkipExclusive = () => false } = {}) {
    items.forEach((d) => {
      if (d.dataset.smoothBound) return;
      d.dataset.smoothBound = "1";
      const s = $("summary", d);
      const body = $(bodySel, d);
      if (!s || !body) return;
      const toggle = (el, b, open) => {
        if (reduceMotion || !b.animate) {
          el.open = open;
          return;
        }
        b.getAnimations().forEach((a) => a.cancel());
        if (open) {
          el.open = true;
          const h = b.scrollHeight;
          const anim = b.animate(
            [{ height: "0px", opacity: 0 }, { height: `${h}px`, opacity: 1 }],
            { duration: 240, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
          );
          anim.onfinish = () => { b.style.height = ""; };
        } else {
          const h = b.offsetHeight;
          const anim = b.animate(
            [{ height: `${h}px`, opacity: 1 }, { height: "0px", opacity: 0 }],
            { duration: 190, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
          );
          anim.onfinish = () => {
            el.open = false;
            b.style.height = "";
          };
        }
      };
      s.addEventListener("click", (e) => {
        e.preventDefault();
        const willOpen = !d.open;
        if (willOpen && exclusive && !shouldSkipExclusive()) {
          items.forEach((other) => {
            if (other !== d && other.open) {
              const ob = $(bodySel, other);
              if (ob) toggle(other, ob, false);
            }
          });
        }
        toggle(d, body, willOpen);
      });
    });
  }

  /* =========================================================
     Hero interactive product window
     ========================================================= */
  const heroWin = $("#heroWindow");
  if (heroWin) {
    const VIEWS = {
      library: {
        src: "assets/screenshots/library.jpg",
        capKey: "scr.t1",
        descKey: "scr.d1",
        path: "instances/my-instance · Fabric 1.21.11",
        metaEn: "15 mods · Quick Play ready",
        metaRu: "15 модов · готов к запуску",
      },
      discover: {
        src: "assets/screenshots/discover.jpg",
        capKey: "scr.t2",
        descKey: "scr.d2",
        path: "Modrinth + CurseForge · 1.21.11",
        metaEn: "Auto-resolved dependencies",
        metaRu: "Автоподбор зависимостей",
      },
      mods: {
        src: "assets/screenshots/mods.jpg",
        capKey: "scr.t3",
        descKey: "scr.d3",
        path: "instances/my-instance/mods · 24.5 MB",
        metaEn: "15 / 16 active · SHA-1 verified",
        metaRu: "15 / 16 активны · проверка SHA-1",
      },
      accounts: {
        src: "assets/screenshots/accounts.jpg",
        capKey: "scr.t4",
        descKey: "scr.d4",
        path: "OS Keyring · Microsoft · Ely.by · Offline",
        metaEn: "Cached local skin preview",
        metaRu: "Локальный кеш скинов",
      },
    };
    const img = $("#heroPreviewImg", heroWin);
    const screen = $(".window-screen", heroWin);
    const pathEl = $("#heroPreviewPath", heroWin);
    const metaEl = $("#heroPreviewMeta", heroWin);
    const tabBar = $(".window-tabs", heroWin);
    const tabs = $$("[data-preview-tab]", heroWin);
    const syncHeroTabsPill = bindSlidePill(tabBar, ".wtab");
    let currentView = "library";

    syncPreviewMeta = (animated = false) => {
      const v = VIEWS[currentView];
      if (!v) return;
      const applyText = () => {
        if (pathEl) pathEl.textContent = v.path;
        if (metaEl) metaEl.textContent = lang === "en" ? v.metaEn : v.metaRu;
        if (screen) {
          screen.dataset.src = v.src;
          screen.dataset.capKey = v.capKey;
          screen.dataset.descKey = v.descKey;
        }
      };
      if (!animated || reduceMotion) {
        applyText();
        return;
      }
      pathEl?.classList.add("switching");
      metaEl?.classList.add("switching");
      setTimeout(() => {
        applyText();
        pathEl?.classList.remove("switching");
        metaEl?.classList.remove("switching");
      }, 130);
    };

    tabs.forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.dataset.previewTab;
        const v = VIEWS[key];
        if (!v || key === currentView) return;
        currentView = key;
        tabs.forEach((b) => {
          const active = b === btn;
          b.classList.toggle("active", active);
          b.setAttribute("aria-selected", String(active));
        });
        syncHeroTabsPill();
        if (img) {
          if (reduceMotion) {
            img.src = v.src;
          } else {
            img.classList.add("switching");
            setTimeout(() => {
              const done = () => img.classList.remove("switching");
              img.onload = done;
              img.src = v.src;
              if (img.complete) requestAnimationFrame(done);
            }, 120);
          }
        }
        syncPreviewMeta(true);
      });
    });

    $("#heroPreviewKbd", heroWin)?.addEventListener("click", () => openPalette());

    /* Damped 3D perspective response on desktop pointer move */
    const heroSection = heroWin.closest(".hero");
    if (heroSection && finePointer && !reduceMotion) {
      let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
      const stepTilt = () => {
        cx += (tx - cx) * 0.14;
        cy += (ty - cy) * 0.14;
        heroWin.style.transform = `rotateX(${cy.toFixed(2)}deg) rotateY(${cx.toFixed(2)}deg)`;
        if (Math.abs(tx - cx) > 0.02 || Math.abs(ty - cy) > 0.02) {
          raf = requestAnimationFrame(stepTilt);
        } else {
          raf = 0;
          if (tx === 0 && ty === 0) heroWin.style.transform = "";
        }
      };
      heroSection.addEventListener("pointermove", (e) => {
        if (innerWidth <= 1120) return;
        const r = heroWin.getBoundingClientRect();
        const px = Math.min(Math.max((e.clientX - r.left) / r.width, -0.3), 1.3);
        const py = Math.min(Math.max((e.clientY - r.top) / r.height, -0.3), 1.3);
        tx = (px - 0.5) * 4.5;
        ty = (0.5 - py) * 3.5;
        heroWin.style.setProperty("--sx", `${(e.clientX - r.left).toFixed(0)}px`);
        heroWin.style.setProperty("--sy", `${(e.clientY - r.top).toFixed(0)}px`);
        heroWin.style.setProperty("--shine-o", "1");
        if (!raf) raf = requestAnimationFrame(stepTilt);
      }, { passive: true });
      heroSection.addEventListener("pointerleave", () => {
        tx = 0;
        ty = 0;
        heroWin.style.setProperty("--shine-o", "0");
        if (!raf) raf = requestAnimationFrame(stepTilt);
      });
    }
  }

  /* =========================================================
     Stat counters (triggered on viewport entry)
     ========================================================= */
  function fmtNum(n) {
    return n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "") + "k" : String(n);
  }

  function tweenNum(el, end, suffix = "", formatted = false) {
    const render = (v) => (formatted ? fmtNum(v) : String(v)) + suffix;
    if (reduceMotion) {
      el.textContent = render(end);
      return;
    }
    const dur = 680, start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = render(Math.round(end * eased));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function whenVisible(el, fn) {
    if (reduceMotion || typeof IntersectionObserver === "undefined") {
      fn();
      return;
    }
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        obs.disconnect();
        fn();
      }
    }, { threshold: 0.2 });
    obs.observe(el);
  }

  $$("[data-count]").forEach((el) => {
    whenVisible(el, () => tweenNum(el, +el.dataset.count, el.dataset.suffix || "", false));
  });

  /* =========================================================
     OS detection + download CTAs + toast
     ========================================================= */
  const toastEl = $("#toast");
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 1800);
  }

  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const fmtSize = (b) => (b > 1048576 ? (b / 1048576).toFixed(1) + " MB" : Math.round(b / 1024) + " KB");

  const ua = navigator.userAgent;
  const os = /Windows/i.test(ua)
    ? "win"
    : /Macintosh|Mac OS X/i.test(ua) && !/iPhone|iPad|iPod/i.test(ua)
      ? "mac"
      : /Linux|X11/i.test(ua) && !/Android/i.test(ua)
        ? "linux"
        : null;

  const DL_BASE = `https://github.com/${REPO}/releases/latest/download`;
  const ASSET_SPECS = {
    "win-setup": { file: "sunset-launcher-windows-x64-setup.exe", re: /^sunset-launcher-windows-x64-setup\.exe$/ },
    "win-zip": { file: "sunset-launcher-windows-x64-portable.zip", re: /^sunset-launcher-windows-x64-portable\.zip$/ },
    "linux-deb-x64": { file: "sunset-launcher_0.2.0_amd64.deb", re: /^sunset-launcher_.*_amd64\.deb$/ },
    "linux-deb-arm64": { file: "sunset-launcher_0.2.0_arm64.deb", re: /^sunset-launcher_.*_arm64\.deb$/ },
    "linux-rpm-x64": { file: "sunset-launcher-0.2.0-1.x86_64.rpm", re: /^sunset-launcher-.*-1\.x86_64\.rpm$/ },
    "linux-rpm-arm64": { file: "sunset-launcher-0.2.0-1.aarch64.rpm", re: /^sunset-launcher-.*-1\.aarch64\.rpm$/ },
    "linux-appimage-x64": { file: "sunset-launcher-0.2.0-x86_64.AppImage", re: /^sunset-launcher-.*-x86_64\.AppImage$/ },
    "linux-appimage-arm64": { file: "sunset-launcher-0.2.0-aarch64.AppImage", re: /^sunset-launcher-.*-aarch64\.AppImage$/ },
    "mac-dmg-arm64": { file: "sunset-launcher-macos-arm64.dmg", re: /^sunset-launcher-macos-arm64\.dmg$/ },
    "mac-dmg-x64": { file: "sunset-launcher-macos-x64.dmg", re: /^sunset-launcher-macos-x64\.dmg$/ },
    "mac-app-arm64": { file: "sunset-launcher-macos-arm64.app.zip", re: /^sunset-launcher-macos-arm64\.app\.zip$/ },
    "mac-app-x64": { file: "sunset-launcher-macos-x64.app.zip", re: /^sunset-launcher-macos-x64\.app\.zip$/ },
  };

  const resolvedAssets = Object.fromEntries(
    Object.entries(ASSET_SPECS).map(([k, v]) => [k, {
      name: v.file,
      url: `${DL_BASE}/${v.file}`,
      size: null,
    }]),
  );

  function syncAssetDom() {
    $$("[data-dl-key]").forEach((el) => {
      const r = resolvedAssets[el.dataset.dlKey];
      if (r) el.href = r.url;
    });
    $$("[data-asset-key]").forEach((el) => {
      const r = resolvedAssets[el.dataset.assetKey];
      if (r) el.textContent = r.size ? "· " + fmtSize(r.size) : "";
    });
    $$('[data-deb-file="amd64"]').forEach((el) => {
      el.textContent = resolvedAssets["linux-deb-x64"].name;
    });
    $$('[data-rpm-file="x86_64"]').forEach((el) => {
      el.textContent = resolvedAssets["linux-rpm-x64"].name;
    });
    $$('[data-appimage-file="x86_64"]').forEach((el) => {
      el.textContent = resolvedAssets["linux-appimage-x64"].name;
    });
  }

  function updateAssetsFromRelease(assets) {
    if (!Array.isArray(assets) || !assets.length) return;
    for (const [key, spec] of Object.entries(ASSET_SPECS)) {
      const a = assets.find((x) => spec.re.test(x.name) && !x.name.endsWith(".sha256"));
      if (!a) continue;
      resolvedAssets[key] = {
        name: a.name,
        url: a.browser_download_url,
        size: a.size,
      };
    }
    syncAssetDom();
  }

  if (os === "win") $("#cardWin")?.classList.add("recommended");
  if (os === "linux") $("#cardLinux")?.classList.add("recommended");
  if (os === "mac") $("#cardMac")?.classList.add("recommended");
  if (os) {
    const cards = $(".os-cards"), rec = $(".os-card.recommended");
    if (cards && rec) cards.prepend(rec);
  }

  /* Hero download dropdown menu */
  const heroDlDropdown = $("#heroDlDropdown"), heroBtn = $("#heroDownload"), heroDlMenu = $("#heroDlMenu"), heroDlList = $("#heroDlList");
  if (heroDlDropdown && heroBtn && heroDlMenu) {
    if (os && heroDlList) {
      const matching = $$(`[data-os-group="${os}"]`, heroDlList);
      matching.forEach((row) => row.classList.add("is-os-match"));
      for (let i = matching.length - 1; i >= 0; i--) heroDlList.prepend(matching[i]);
    }
    let dlCloseTimer = 0;
    const setHeroMenu = (open) => {
      clearTimeout(dlCloseTimer);
      heroDlDropdown.classList.toggle("open", open);
      heroBtn.setAttribute("aria-expanded", String(open));
      if (open) {
        heroDlMenu.classList.remove("closing");
        heroDlMenu.hidden = false;
      } else if (!heroDlMenu.hidden) {
        if (reduceMotion) {
          heroDlMenu.hidden = true;
        } else {
          heroDlMenu.classList.add("closing");
          dlCloseTimer = setTimeout(() => {
            heroDlMenu.hidden = true;
            heroDlMenu.classList.remove("closing");
          }, 150);
        }
      }
    };
    heroBtn.addEventListener("click", (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      setHeroMenu(heroDlMenu.hidden || heroDlMenu.classList.contains("closing"));
    });
    document.addEventListener("click", (e) => {
      if (!heroDlMenu.hidden && !e.target.closest("#heroDlDropdown")) setHeroMenu(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !heroDlMenu.hidden) {
        setHeroMenu(false);
        heroBtn.focus();
      }
    });
    heroDlMenu.addEventListener("click", (e) => {
      if (e.target.closest("[data-dl]")) setHeroMenu(false);
    });
  }

  /* Architecture switches on download.html */
  const archSyncers = new Map();
  $$("[data-arch-card]").forEach((sw) => {
    archSyncers.set(sw, bindSlidePill(sw, ".arch-btn"));
  });
  function setCardArch(cardOs, arch) {
    const sw = $(`[data-arch-card="${cardOs}"]`);
    if (!sw) return;
    $$(".arch-btn", sw).forEach((b) => b.classList.toggle("active", b.dataset.arch === arch));
    archSyncers.get(sw)?.();
    const opts = $(".dl-options", sw.closest(".os-card"));
    if (opts && !reduceMotion && opts.animate) {
      opts.animate(
        [{ opacity: 0.45, transform: "translateY(4px)" }, { opacity: 1, transform: "translateY(0)" }],
        { duration: 200, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
      );
    }
    const bindAsset = (btnId, sizeId, shaId, key) => {
      const btn = $(btnId), size = $(sizeId), sha = $(shaId);
      if (btn) btn.dataset.dlKey = key;
      if (size) size.dataset.assetKey = key;
      if (sha) sha.dataset.shaKey = key;
    };
    if (cardOs === "linux") {
      bindAsset("#btnLinuxDeb", "#sizeLinuxDeb", "#shaLinuxDeb", `linux-deb-${arch}`);
      bindAsset("#btnLinuxRpm", "#sizeLinuxRpm", "#shaLinuxRpm", `linux-rpm-${arch}`);
      bindAsset("#btnLinuxAppImage", "#sizeLinuxAppImage", "#shaLinuxAppImage", `linux-appimage-${arch}`);
    } else if (cardOs === "mac") {
      bindAsset("#btnMacDmg", "#sizeMacDmg", "#shaMacDmg", `mac-dmg-${arch}`);
      bindAsset("#btnMacApp", "#sizeMacApp", "#shaMacApp", `mac-app-${arch}`);
    }
    syncAssetDom();
  }
  $$("[data-arch-card]").forEach((sw) => {
    $$(".arch-btn", sw).forEach((btn) => btn.addEventListener("click", () => setCardArch(sw.dataset.archCard, btn.dataset.arch)));
  });
  if (os === "linux" && /aarch64|arm64/i.test(ua)) setCardArch("linux", "arm64");

  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-dl]")) toast(t("dl.started"));
  });

  /* =========================================================
     GitHub release data (cached + fallback)
     ========================================================= */
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

  const LOCAL_VER = "v0.2.0";
  const parseVer = (v) => String(v || "").replace(/^v/i, "").split(/[.-]/).map((n) => parseInt(n, 10) || 0);
  const cmpVer = (a, b) => {
    const pa = parseVer(a), pb = parseVer(b);
    for (let i = 0; i < 3; i++) if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) - (pb[i] || 0);
    return 0;
  };

  const CACHE_KEY = "gh-cache-v5", CACHE_TTL = 15 * 60 * 1000;
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
    const mapRel = (r) => ({
      tag: r.tag_name,
      name: r.name || r.tag_name,
      date: r.published_at,
      body: r.body || "",
      url: r.html_url,
      downloads: (r.assets || []).filter((a) => !a.name.endsWith(".sha256")).reduce((s, a) => s + a.download_count, 0),
    });
    const history = list.filter((r) => latest && r.id !== latest.id).slice(0, 6).map(mapRel);
    const all = list.map(mapRel);
    const data = { stars: repo?.stargazers_count ?? null, downloads: list.length ? downloads : null, latest, history, all };
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data })); } catch { /* quota */ }
    return data;
  }

  function setLiveStat(key, val, fallbackNum, fallbackSuffix, fallbackLabelKey) {
    $$(`[data-live="${key}"]`).forEach((el) => {
      const label = el.nextElementSibling;
      const run = () => {
        if (val != null) {
          tweenNum(el, val, "", true);
        } else {
          tweenNum(el, fallbackNum, fallbackSuffix, false);
          if (label && label.dataset.i18n) {
            label.dataset.i18n = fallbackLabelKey;
            label.textContent = t(fallbackLabelKey);
          }
        }
      };
      whenVisible(el, run);
    });
  }

  loadGitHub()
    .then(({ stars, downloads, latest: d, history, all }) => {
      if (stars != null) {
        $$(".gh-stars").forEach((s) => {
          s.textContent = fmtNum(stars);
          s.hidden = false;
        });
      }
      setLiveStat("downloads", downloads, 64, "", "stats.dl");
      setLiveStat("stars", stars, 100, "%", "stats.rust");

      if (!d?.tag_name) throw 0;
      const v = d.tag_name.startsWith("v") ? d.tag_name : `v${d.tag_name}`;
      const cmp = cmpVer(v, LOCAL_VER);
      if (cmp >= 0) {
        $$(".version").forEach((el) => (el.textContent = v));
        if (d.published_at) {
          latestPublishedAt = d.published_at;
          formatRelDate();
        }
      }
      updateAssetsFromRelease(d.assets || []);
      (d.assets || []).forEach((a) => $$(`[data-asset="${a.name}"]`).forEach((el) => (el.textContent = "· " + fmtSize(a.size))));

      const assetsHtml = d.assets?.length ? `<div class="assets">${d.assets.map((a) =>
        `<div class="asset"><a href="${esc(a.browser_download_url)}">${esc(a.name)}</a><span>${fmtSize(a.size)} · ↓ ${a.download_count}</span></div>`).join("")}</div>` : "";
      const cl = $("#changelog");
      if (cl) {
        if (cmp > 0 && d.body) {
          cl.innerHTML = `<h3>${esc(d.name || v)}</h3>` + (md(d.body || "") || "") + assetsHtml;
        } else if (cmp === 0 && assetsHtml) {
          const slot = $("#changelogAssets", cl);
          if (slot) slot.innerHTML = assetsHtml;
        }
      }

      const prevList = cmp < 0
        ? [{ tag: d.tag_name, name: d.name || v, date: d.published_at, body: d.body || "", url: d.html_url,
          downloads: (d.assets || []).filter((a) => !a.name.endsWith(".sha256")).reduce((s, a) => s + a.download_count, 0) }, ...(history || [])].slice(0, 5)
        : (history || []);
      const rh = $("#relHistory");
      if (rh && prevList.length) {
        rh.hidden = false;
        rh.innerHTML = `<div class="rel-history-title" data-i18n="dp.history">${esc(t("dp.history"))}</div>` +
          prevList.map((r) => `
            <details class="rel-old">
              <summary><span>${esc(r.name)}</span><span>${r.date ? new Date(r.date).toISOString().slice(0, 10) : ""} · ↓ ${r.downloads}</span></summary>
              <div class="rel-old-body">${md(r.body) || ""}<p><a href="${esc(r.url)}" target="_blank" rel="noopener">GitHub →</a></p></div>
            </details>`).join("");
        bindSmoothDetails($$("details.rel-old", rh), ".rel-old-body");
      }

      const clTimeline = $("#clTimeline");
      if (clTimeline && Array.isArray(all)) {
        const known = new Set($$("[data-version]", clTimeline).map((el) => el.dataset.version));
        all.forEach((r) => {
          const rv = r.tag.startsWith("v") ? r.tag : `v${r.tag}`;
          const card = $(`[data-version="${rv}"] .cl-meta`, clTimeline);
          if (card && r.downloads > 0 && !$(".cl-dl-badge", card)) {
            card.insertAdjacentHTML("afterbegin", `<span class="cl-dl-badge">↓ ${fmtNum(r.downloads)}</span>`);
          }
        });
        const newer = all.filter((r) => {
          const rv = r.tag.startsWith("v") ? r.tag : `v${r.tag}`;
          return !known.has(rv) && cmpVer(rv, LOCAL_VER) > 0;
        });
        const extra = $("#clLiveExtra");
        if (extra && newer.length) {
          $$(".latest", clTimeline).forEach((el) => { el.classList.remove("latest"); $(".latest-pill", el)?.remove(); });
          extra.hidden = false;
          extra.innerHTML = newer.map((r, idx) => {
            const rv = r.tag.startsWith("v") ? r.tag : `v${r.tag}`;
            return `<article class="cl-entry${idx === 0 ? " latest" : ""}" id="${esc(rv)}" data-version="${esc(rv)}" data-cats="new imp">
              <div class="cl-rail" aria-hidden="true"><span class="cl-dot"></span></div>
              <div class="cl-card">
                <header class="cl-head">
                  <div class="cl-ver-wrap">
                    <a href="#${esc(rv)}" class="cl-ver">${esc(rv)}</a>
                    ${idx === 0 ? `<span class="cl-pill latest-pill" data-i18n="cp.latest">${esc(t("cp.latest"))}</span>` : ""}
                  </div>
                  <div class="cl-meta">
                    ${r.downloads > 0 ? `<span class="cl-dl-badge">↓ ${fmtNum(r.downloads)}</span>` : ""}
                    <time>${r.date ? new Date(r.date).toISOString().slice(0, 10) : ""}</time>
                    <a class="cl-gh" href="${esc(r.url)}" target="_blank" rel="noopener">GitHub ↗</a>
                  </div>
                </header>
                <h2 class="cl-title">${esc(r.name)}</h2>
                <div class="rel-old-body">${md(r.body) || ""}</div>
              </div>
            </article>`;
          }).join("");
          observeReveals(extra);
        }
      }
    })
    .catch(() => {
      setLiveStat("downloads", null, 64, "", "stats.dl");
      setLiveStat("stars", null, 100, "%", "stats.rust");
      const cl = $("#changelog");
      if (cl && !cl.dataset.curatedVer) cl.innerHTML = `<p class="muted" data-i18n="dp.noNotes">${t("dp.noNotes")}</p>`;
    });

  /* =========================================================
     Download page: segmented OS tabs + copy buttons
     ========================================================= */
  const seg = $(".seg");
  if (seg) {
    const syncSegPill = bindSlidePill(seg, ".seg-btn");
    const select = (osName) => {
      $$(".seg-btn", seg).forEach((b) => {
        const active = b.dataset.os === osName;
        b.classList.toggle("active", active);
        b.setAttribute("aria-selected", String(active));
      });
      $$(".os-panel").forEach((p) => p.classList.toggle("active", p.dataset.panel === osName));
      syncSegPill();
    };
    $$(".seg-btn", seg).forEach((b) => b.addEventListener("click", () => select(b.dataset.os)));
    if (os === "win") select("windows");
    else if (os === "mac") select("macos");
  }

  $$(".copy").forEach((btn) => btn.addEventListener("click", async () => {
    const pre = $("pre", btn.closest(".terminal")).cloneNode(true);
    $$(".c", pre).forEach((c) => c.remove());
    const text = pre.textContent.split("\n").map((l) => l.trim()).filter(Boolean).join("\n");
    try { await navigator.clipboard.writeText(text); } catch { /* ignore */ }
    btn.classList.add("done");
    btn.textContent = t("dl.copied");
    toast(t("dl.copied"));
    setTimeout(() => {
      btn.classList.remove("done");
      btn.textContent = t("dl.copy");
    }, 1600);
  }));

  /* =========================================================
     Shared Lightbox + Screenshot Filters
     ========================================================= */
  const zoomables = $$(".shot, .zoomable");
  if (zoomables.length) {
    document.body.insertAdjacentHTML("beforeend", `
      <div class="lightbox" id="lightbox" aria-hidden="true" role="dialog" aria-modal="true" aria-label="Screenshot preview">
        <button class="lb-close" type="button" aria-label="Close">${LUCIDE.close}</button>
        <button class="lb-nav lb-prev" type="button" aria-label="Previous">${LUCIDE.chevronLeft}</button>
        <figure class="lb-stage"><img id="lbImg" alt="" /><figcaption id="lbCap"></figcaption></figure>
        <button class="lb-nav lb-next" type="button" aria-label="Next">${LUCIDE.chevronRight}</button>
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
      }, 120);
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
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openLb(el);
        }
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

    const filterBtns = $$(".filter-btn[data-filter]");
    if (filterBtns.length) {
      const filterBar = filterBtns[0].closest(".filter-bar");
      const syncFilterPill = bindSlidePill(filterBar, ".filter-btn");
      filterBtns.forEach((btn) => btn.addEventListener("click", () => {
        const cat = btn.dataset.filter;
        filterBtns.forEach((b) => b.classList.toggle("active", b === btn));
        syncFilterPill();
        let n = 0;
        $$(".shot").forEach((s) => {
          const match = cat === "all" || s.dataset.cat === cat;
          s.hidden = !match;
          if (match) {
            s.classList.add("in");
            if (!reduceMotion) {
              s.classList.remove("anim-pop");
              void s.offsetWidth;
              s.style.animationDelay = `${Math.min(n++, 5) * 40}ms`;
              s.classList.add("anim-pop");
            }
          }
        });
      }));
    }
  }

  /* =========================================================
     Changelog: search + category filter + highlighting
     ========================================================= */
  const clEntries = $$("#clTimeline .cl-entry");
  if (clEntries.length) {
    const clSearch = $("#clSearch"), clEmpty = $("#clEmpty"), clBtns = $$("[data-cl-filter]");
    let activeCat = "all";
    const textTargets = (entry) => [
      $(".cl-title", entry),
      ...$$(".cl-spotlight h3, .cl-spotlight p", entry),
      ...$$(".cl-list li > span:last-child", entry),
    ].filter(Boolean);
    const storeClOriginals = () => clEntries.forEach((entry) => {
      textTargets(entry).forEach((el) => (el.dataset.clOrig = el.textContent));
    });
    const markText = (str, q) => {
      if (!q) return esc(str);
      const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return esc(str).replace(new RegExp(safe, "gi"), (m) => `<mark>${m}</mark>`);
    };
    const runClFilter = () => {
      const q = (clSearch?.value || "").trim();
      const ql = q.toLowerCase();
      let shownEntries = 0;
      clEntries.forEach((entry) => {
        const verText = ($(".cl-ver", entry)?.textContent || "").toLowerCase();
        const titleEl = $(".cl-title", entry);
        const titleOrig = titleEl?.dataset.clOrig || "";
        const tagsText = $$(".cl-tags span", entry).map((s) => s.textContent).join(" ").toLowerCase();
        const headerHit = !ql || verText.includes(ql) || titleOrig.toLowerCase().includes(ql) || tagsText.includes(ql);
        if (titleEl) titleEl.innerHTML = markText(titleOrig, q);

        const spot = $(".cl-spotlight", entry);
        let spotShown = false;
        if (spot) {
          const spotCatOk = activeCat === "all" || spot.dataset.clCat === activeCat || activeCat === "new";
          const spotEls = $$("h3, p", spot);
          const spotText = spotEls.map((el) => el.dataset.clOrig || "").join("\n").toLowerCase();
          const termText = ($("pre", spot)?.textContent || "").toLowerCase();
          const spotHit = spotCatOk && (!ql || headerHit || spotText.includes(ql) || termText.includes(ql));
          spot.hidden = !spotHit;
          spotEls.forEach((el) => (el.innerHTML = markText(el.dataset.clOrig || "", q)));
          spotShown = spotHit;
        }

        let itemsShown = 0;
        $$(".cl-list li", entry).forEach((li) => {
          const catOk = activeCat === "all" || li.dataset.clCat === activeCat;
          const bodySpan = $("span:last-child", li);
          const orig = bodySpan?.dataset.clOrig || "";
          const hit = catOk && (!ql || headerHit || orig.toLowerCase().includes(ql));
          li.hidden = !hit;
          if (bodySpan) bodySpan.innerHTML = markText(orig, q);
          if (hit) itemsShown++;
        });

        const showEntry = spotShown || itemsShown > 0;
        entry.hidden = !showEntry;
        if (showEntry) {
          if (ql) entry.classList.add("in");
          shownEntries++;
        }
      });
      if (clEmpty) clEmpty.hidden = shownEntries > 0;
    };
    const clFilterBar = clBtns[0]?.closest(".filter-bar");
    const syncClPill = bindSlidePill(clFilterBar, ".filter-btn");
    refreshClAfterLang = () => { storeClOriginals(); runClFilter(); };
    storeClOriginals();
    clSearch?.addEventListener("input", runClFilter);
    clBtns.forEach((btn) => btn.addEventListener("click", () => {
      activeCat = btn.dataset.clFilter || "all";
      clBtns.forEach((b) => b.classList.toggle("active", b === btn));
      syncClPill();
      runClFilter();
      if (!reduceMotion) {
        let n = 0;
        clEntries.forEach((entry) => {
          if (entry.hidden) return;
          entry.classList.add("in");
          entry.classList.remove("anim-pop");
          void entry.offsetWidth;
          entry.style.animationDelay = `${Math.min(n++, 5) * 40}ms`;
          entry.classList.add("anim-pop");
        });
      }
    }));

    if (location.hash) {
      const target = clEntries.find((el) => el.id === decodeURIComponent(location.hash.slice(1)));
      if (target) {
        setTimeout(() => target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" }), 80);
      }
    }
  }

  /* =========================================================
     FAQ: search + highlighting + clean toggle
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
        if (hit) {
          if (ql) d.classList.add("in");
          shown++;
        }
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

    bindSmoothDetails(faqItems, ".ans", {
      exclusive: true,
      shouldSkipExclusive: () => Boolean(search?.value),
    });

    if (location.hash) {
      const target = faqItems.find((d) => d.id === location.hash.slice(1));
      if (target) {
        target.open = true;
        setTimeout(() => target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" }), 80);
      }
    }
  }

  /* =========================================================
     Command palette (Ctrl+K) — line icons only
     ========================================================= */
  const pal = $("#palette"), palInput = $("#paletteInput"), palList = $("#paletteList");
  const PAGE_ICONS = {
    home: LUCIDE.home,
    features: LUCIDE.layers,
    screenshots: LUCIDE.image,
    download: LUCIDE.download,
    changelog: LUCIDE.history,
    faq: LUCIDE.help,
  };

  function paletteItems() {
    const go = (href) => () => { location.href = href; };
    const items = ALL_PAGES.map(([id, href, key]) => ({
      group: t("pal.pages"),
      icon: PAGE_ICONS[id],
      label: t(key),
      kw: `${id} ${EN[key]} ${RU[key]} ченджлог чейнджлог обновления релизы`,
      run: go(href),
    }));
    items.push(
      { group: t("pal.actions"), icon: LUCIDE.download, label: t("pal.dlWin"), kw: "windows exe setup installer скачать download", run: () => { toast(t("dl.started")); location.href = resolvedAssets["win-setup"].url; } },
      { group: t("pal.actions"), icon: LUCIDE.pkg, label: t("pal.dlLinuxDeb"), kw: "linux deb debian ubuntu mint деб пакет скачать download", run: () => { toast(t("dl.started")); location.href = resolvedAssets["linux-deb-x64"].url; } },
      { group: t("pal.actions"), icon: LUCIDE.terminal, label: t("pal.dlLinuxBin"), kw: "linux appimage portable скачать download", run: () => { toast(t("dl.started")); location.href = resolvedAssets["linux-appimage-x64"].url; } },
      { group: t("pal.actions"), icon: LUCIDE.download, label: t("pal.dlMacArm"), kw: "macos mac dmg apple silicon arm64 m1 m2 m3 m4 мак макос скачать download", run: () => { toast(t("dl.started")); location.href = resolvedAssets["mac-dmg-arm64"].url; } },
      { group: t("pal.actions"), icon: LUCIDE.download, label: t("pal.dlMacIntel"), kw: "macos mac dmg intel x64 мак макос скачать download", run: () => { toast(t("dl.started")); location.href = resolvedAssets["mac-dmg-x64"].url; } },
      { group: t("pal.actions"), icon: LUCIDE.code, label: t("pal.gh"), kw: "github source код исходники", run: () => open(`https://github.com/${REPO}`, "_blank", "noopener") },
      { group: t("pal.actions"), icon: LUCIDE.bug, label: t("pal.issue"), kw: "bug issue баг ошибка", run: () => open(`https://github.com/${REPO}/issues`, "_blank", "noopener") },
      { group: t("pal.actions"), icon: LUCIDE.globe, label: t("pal.lang"), kw: "language язык english русский", run: () => $("#langBtn").click() },
      { group: t("pal.actions"), icon: LUCIDE.arrowUp, label: t("pal.top"), kw: "top наверх", run: () => scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }) },
    );
    if (clEntries.length) {
      clEntries.forEach((entry) => {
        const ver = $(".cl-ver", entry)?.textContent || "";
        const title = $(".cl-title", entry)?.dataset.clOrig || $(".cl-title", entry)?.textContent || "";
        items.push({
          group: t("pal.cl"),
          icon: LUCIDE.tag,
          label: `${ver} — ${title}`,
          kw: `${ver} ${title} bore dedicated сервер серый ip cgnat upnp`,
          run: () => { entry.hidden = false; entry.classList.add("in"); entry.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" }); },
        });
      });
    } else {
      items.push({
        group: t("pal.cl"),
        icon: LUCIDE.tag,
        label: t("pal.cl019"),
        kw: "v0.2.0 curseforge rpm appimage dmg setup installer hooks offline mode bore",
        run: go("changelog.html#v0.2.0"),
      });
    }
    faqItems.forEach((d) => {
      const label = d.dataset.qOrig || $("summary", d).textContent;
      items.push({
        group: "FAQ",
        icon: LUCIDE.msg,
        label,
        kw: `${label} ${d.dataset.aOrig || ""}`,
        run: () => { d.hidden = false; d.classList.add("in"); d.open = true; d.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" }); },
      });
    });
    return items;
  }

  let palItems = [], palShown = [], palIdx = 0;
  function renderPalette() {
    const q = palInput.value.trim().toLowerCase();
    palShown = palItems.filter((i) => !q || (i.label + " " + i.kw).toLowerCase().includes(q));
    palIdx = Math.min(palIdx, Math.max(palShown.length - 1, 0));
    if (!palShown.length) {
      palList.innerHTML = `<li class="palette-empty">${esc(t("pal.empty"))}</li>`;
      return;
    }
    let html = "", group = "";
    palShown.forEach((i, n) => {
      if (i.group !== group) {
        group = i.group;
        html += `<li class="palette-group">${esc(group)}</li>`;
      }
      html += `<li class="palette-item${n === palIdx ? " active" : ""}" role="option" data-n="${n}"><span class="pi-ico">${i.icon}</span><span class="pi-label">${esc(i.label)}</span><span class="pi-go">↵</span></li>`;
    });
    palList.innerHTML = html;
    $(".palette-item.active", palList)?.scrollIntoView({ block: "nearest" });
  }

  function openPalette() {
    palItems = paletteItems();
    palIdx = 0;
    palInput.value = "";
    renderPalette();
    pal.classList.add("open");
    pal.setAttribute("aria-hidden", "false");
    setTimeout(() => palInput.focus(), 20);
  }
  function closePalette() {
    pal.classList.remove("open");
    pal.setAttribute("aria-hidden", "true");
  }
  function runPalette(n) {
    const i = palShown[n];
    if (!i) return;
    closePalette();
    i.run();
  }

  $("#paletteBtn").addEventListener("click", openPalette);
  pal.addEventListener("click", (e) => { if (e.target === pal) closePalette(); });
  palInput.addEventListener("input", () => { palIdx = 0; renderPalette(); });
  palList.addEventListener("click", (e) => {
    const li = e.target.closest(".palette-item");
    if (li) runPalette(+li.dataset.n);
  });
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
      if (e.key === "Escape") closeMenu();
      if (e.key === "/" && !typing) {
        const s = $("#faqSearch") || $("#clSearch");
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

  /* Back to top */
  const toTop = $("#toTop");
  toTop.addEventListener("click", () => scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));
  addEventListener("scroll", () => toTop.classList.toggle("show", scrollY > 700), { passive: true });

  applyLang();
})();
